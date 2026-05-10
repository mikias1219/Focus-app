#!/usr/bin/env bash
# Creates Azure resources and deploys API + web to Azure Container Apps.
# Prerequisites: Azure CLI, Python 3 (for URL-encoding DB password).
# Usage:
#   cp .env.azure.example .env.azure   # edit ACR_NAME, PG_ADMIN_PASSWORD
#   az login && az account set --subscription "<id>"
#   chmod +x deploy.sh && ./deploy.sh
#
# Note: `az containerapp update --set-env-vars` replaces the full env list — we always pass every variable.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if ! az account show &>/dev/null; then
  echo "Not logged in. Run: az login"
  exit 1
fi

if [[ -f "$SCRIPT_DIR/.env.azure" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env.azure"
  set +a
fi

: "${AZURE_LOCATION:=eastus2}"
: "${AZURE_RG:=focusflow-rg}"
: "${NAME_PREFIX:=focusflow}"
: "${DEPLOY_OPENAI:=true}"

if [[ -z "${PG_ADMIN_PASSWORD:-}" ]]; then
  echo "Set PG_ADMIN_PASSWORD in infra/azure/.env.azure (see .env.azure.example)."
  exit 1
fi

if [[ -z "${ACR_NAME:-}" ]]; then
  echo "Set ACR_NAME in infra/azure/.env.azure to a globally unique name (e.g. focusflowacr$(date +%s))."
  exit 1
fi

JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-$(openssl rand -base64 48)}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-$(openssl rand -base64 48)}"

PG_SERVER="${NAME_PREFIX}-pg"
PG_USER="pgadmin"
PG_DB="focusflow"
API_APP="${NAME_PREFIX}-api"
WEB_APP="${NAME_PREFIX}-web"

echo "==> Ensuring Azure CLI extensions"
az extension add --name containerapp --upgrade 2>/dev/null || true

echo "==> Resource group: $AZURE_RG ($AZURE_LOCATION)"
az group create --name "$AZURE_RG" --location "$AZURE_LOCATION" --output none

echo "==> PostgreSQL Flexible Server (may take several minutes): $PG_SERVER"
if ! az postgres flexible-server show --resource-group "$AZURE_RG" --name "$PG_SERVER" &>/dev/null; then
  az postgres flexible-server create \
    --resource-group "$AZURE_RG" \
    --name "$PG_SERVER" \
    --location "$AZURE_LOCATION" \
    --admin-user "$PG_USER" \
    --admin-password "$PG_ADMIN_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 16 \
    --storage-size 32 \
    --public-access all \
    --yes
fi

az postgres flexible-server db create \
  --resource-group "$AZURE_RG" \
  --server-name "$PG_SERVER" \
  --database-name "$PG_DB" 2>/dev/null || true

echo "==> Container Registry: $ACR_NAME"
if ! az acr show --name "$ACR_NAME" --resource-group "$AZURE_RG" &>/dev/null; then
  az acr create \
    --resource-group "$AZURE_RG" \
    --name "$ACR_NAME" \
    --sku Basic \
    --admin-enabled true \
    --location "$AZURE_LOCATION" \
    --output none
fi

ACR_LOGIN="$(az acr show -n "$ACR_NAME" -g "$AZURE_RG" --query loginServer -o tsv)"
ACR_PASS="$(az acr credential show -n "$ACR_NAME" -g "$AZURE_RG" --query "passwords[0].value" -o tsv)"

echo "==> Log Analytics + Container Apps environment"
LAW_NAME="${NAME_PREFIX}-logs"
ENV_NAME="${NAME_PREFIX}-env"

if ! az monitor log-analytics workspace show -g "$AZURE_RG" -n "$LAW_NAME" &>/dev/null; then
  az monitor log-analytics workspace create \
    --resource-group "$AZURE_RG" \
    --workspace-name "$LAW_NAME" \
    --location "$AZURE_LOCATION" \
    --output none
fi

LAW_ID="$(az monitor log-analytics workspace show -g "$AZURE_RG" -n "$LAW_NAME" --query id -o tsv)"

if ! az containerapp env show -g "$AZURE_RG" -n "$ENV_NAME" &>/dev/null; then
  az containerapp env create \
    --name "$ENV_NAME" \
    --resource-group "$AZURE_RG" \
    --location "$AZURE_LOCATION" \
    --logs-workspace-id "$LAW_ID" \
    --output none
fi

ENV_ID="$(az containerapp env show -g "$AZURE_RG" -n "$ENV_NAME" --query id -o tsv)"

ENC_PASS="$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$PG_ADMIN_PASSWORD")"
DATABASE_URL="postgresql://${PG_USER}:${ENC_PASS}@${PG_SERVER}.postgres.database.azure.com:5432/${PG_DB}?sslmode=require"

echo "==> Build & push API image (ACR Tasks — no local Docker required)"
az acr build \
  --registry "$ACR_NAME" \
  --resource-group "$AZURE_RG" \
  --image focusflow-api:latest \
  --file "$REPO_ROOT/backend/Dockerfile" \
  "$REPO_ROOT/backend"

API_IMAGE="$ACR_LOGIN/focusflow-api:latest"

echo "==> Deploy / refresh API Container App: $API_APP"
if az containerapp show -g "$AZURE_RG" -n "$API_APP" &>/dev/null; then
  az containerapp update \
    --name "$API_APP" \
    --resource-group "$AZURE_RG" \
    --image "$API_IMAGE" \
    --output none
else
  az containerapp create \
    --name "$API_APP" \
    --resource-group "$AZURE_RG" \
    --environment "$ENV_ID" \
    --image "$API_IMAGE" \
    --registry-server "$ACR_LOGIN" \
    --registry-username "$ACR_NAME" \
    --registry-password "$ACR_PASS" \
    --target-port 3000 \
    --ingress external \
    --min-replicas 1 \
    --cpu 0.5 \
    --memory 1.0Gi \
    --env-vars \
      "DATABASE_URL=$DATABASE_URL" \
      "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET" \
      "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" \
      "PORT=3000" \
      "FRONTEND_URL=https://placeholder.invalid" \
    --output none
fi

API_FQDN="$(az containerapp show -g "$AZURE_RG" -n "$API_APP" --query "properties.configuration.ingress.fqdn" -o tsv)"
API_PUBLIC_URL="https://${API_FQDN}/api"
echo "    API: $API_PUBLIC_URL"

OPENAI_ENV_ARGS=()
if [[ "$DEPLOY_OPENAI" == "true" ]]; then
  echo "==> Azure OpenAI (set DEPLOY_OPENAI=false if quota/region blocks you)"
  OAI_NAME="${NAME_PREFIX}-oai"
  if ! az cognitiveservices account show -g "$AZURE_RG" -n "$OAI_NAME" &>/dev/null; then
    if ! az cognitiveservices account create \
      --name "$OAI_NAME" \
      --resource-group "$AZURE_RG" \
      --location "$AZURE_LOCATION" \
      --kind OpenAI \
      --sku S0 \
      --yes \
      --output none; then
      echo "    OpenAI account create failed — continuing without AI env vars."
      DEPLOY_OPENAI=false
    fi
  fi
  if [[ "$DEPLOY_OPENAI" == "true" ]]; then
    az cognitiveservices account deployment create \
      --resource-group "$AZURE_RG" \
      --name "$OAI_NAME" \
      --deployment-name gpt-4o-mini \
      --model-name gpt-4o-mini \
      --model-version "2024-07-18" \
      --model-format OpenAI \
      --sku-capacity 10 \
      --sku-name Standard \
      --output none 2>/dev/null || echo "    (Deployment create skipped or failed — add a model in Azure Portal if needed.)"

    OAI_ENDPOINT="$(az cognitiveservices account show -g "$AZURE_RG" -n "$OAI_NAME" --query properties.endpoint -o tsv 2>/dev/null || true)"
    OAI_KEY="$(az cognitiveservices account keys list -g "$AZURE_RG" -n "$OAI_NAME" --query key1 -o tsv 2>/dev/null || true)"
    if [[ -n "$OAI_ENDPOINT" && -n "$OAI_KEY" ]]; then
      OPENAI_ENV_ARGS+=(
        "AZURE_OPENAI_ENDPOINT=$OAI_ENDPOINT"
        "AZURE_OPENAI_API_KEY=$OAI_KEY"
        "AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini"
      )
    fi
  fi
fi

apply_api_env() {
  local fe="$1"
  local -a args=(
    "DATABASE_URL=$DATABASE_URL"
    "JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET"
    "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
    "PORT=3000"
    "FRONTEND_URL=$fe"
  )
  if [[ ${#OPENAI_ENV_ARGS[@]} -gt 0 ]]; then
    args+=("${OPENAI_ENV_ARGS[@]}")
  fi
  az containerapp update \
    --name "$API_APP" \
    --resource-group "$AZURE_RG" \
    --set-env-vars "${args[@]}" \
    --output none
}

echo "==> Build & push Web image (NEXT_PUBLIC_API_URL=$API_PUBLIC_URL)"
az acr build \
  --registry "$ACR_NAME" \
  --resource-group "$AZURE_RG" \
  --image focusflow-web:latest \
  --build-arg "NEXT_PUBLIC_API_URL=$API_PUBLIC_URL" \
  --file "$REPO_ROOT/frontend/Dockerfile" \
  "$REPO_ROOT/frontend"

WEB_IMAGE="$ACR_LOGIN/focusflow-web:latest"

echo "==> Deploy / refresh Web Container App: $WEB_APP"
if az containerapp show -g "$AZURE_RG" -n "$WEB_APP" &>/dev/null; then
  az containerapp update \
    --name "$WEB_APP" \
    --resource-group "$AZURE_RG" \
    --image "$WEB_IMAGE" \
    --output none
else
  az containerapp create \
    --name "$WEB_APP" \
    --resource-group "$AZURE_RG" \
    --environment "$ENV_ID" \
    --image "$WEB_IMAGE" \
    --registry-server "$ACR_LOGIN" \
    --registry-username "$ACR_NAME" \
    --registry-password "$ACR_PASS" \
    --target-port 3000 \
    --ingress external \
    --min-replicas 1 \
    --cpu 0.5 \
    --memory 1.0Gi \
    --output none
fi

WEB_FQDN="$(az containerapp show -g "$AZURE_RG" -n "$WEB_APP" --query "properties.configuration.ingress.fqdn" -o tsv)"
WEB_PUBLIC_URL="https://${WEB_FQDN}"
echo "    Web: $WEB_PUBLIC_URL"

echo "==> Final API env: CORS -> $WEB_PUBLIC_URL"
apply_api_env "$WEB_PUBLIC_URL"

echo ""
echo "Done."
echo "  Web app:  $WEB_PUBLIC_URL"
echo "  API:      $API_PUBLIC_URL"
echo ""
echo "Azure OpenAI (if deployed): keys are on the API app as AZURE_OPENAI_* — connect from Nest when you add AI routes."
echo "Re-run this script to rebuild images after code changes."
