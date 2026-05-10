# Deploy FocusFlow to Azure

This folder automates **Azure Container Apps**, **Azure Database for PostgreSQL (flexible server)**, **Azure Container Registry**, and optionally **Azure OpenAI** (for future AI features).

Interactive `az login` must be run **on your machine**; it cannot be completed from a sandbox.

## Prerequisites

1. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed.
2. An Azure subscription (OpenAI may require [access / quota](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview) in the region you pick).
3. Python 3 (used to URL-encode the database password).

## One-time setup

```bash
cd infra/azure
cp .env.azure.example .env.azure
# Edit .env.azure: set ACR_NAME (globally unique, lowercase, e.g. focusflowacr1736) and PG_ADMIN_PASSWORD.

az login
az account set --subscription "<your-subscription-id>"
./deploy.sh
```

The script:

- Creates a resource group, PostgreSQL, ACR, Log Analytics, Container Apps environment.
- Builds **API** and **Web** images with **ACR Tasks** (no local Docker required).
- Deploys **Azure OpenAI** + a **gpt-4o-mini** deployment when `DEPLOY_OPENAI=true` (default). If creation fails, set `DEPLOY_OPENAI=false` in `.env.azure` and create the model in the [Azure AI Foundry / OpenAI portal](https://portal.azure.com/) later.
- Sets `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT` on the API container (your Nest code can read them when you add AI endpoints).

## After deploy

- Open the **Web** URL from the script output; register a user and sign in.
- API is at `https://<api-host>/api` (CORS is set to the web URL automatically).

## Costs

Burstable PostgreSQL, Basic ACR, and small Container Apps still incur charges. Destroy the resource group when experimenting:

```bash
az group delete --name focusflow-rg --yes --no-wait
```

(Adjust the name if you changed `AZURE_RG` in `.env.azure`.)

## Troubleshooting

- **OpenAI / model version errors**: Adjust `--model-version` in `deploy.sh` or add a deployment in the Azure portal; see [Azure OpenAI models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models).
- **Web shows API errors**: Rebuild the web image after the API URL is stable (`./deploy.sh` again) so `NEXT_PUBLIC_API_URL` matches.
- **Prisma on startup**: The API image runs `prisma db push` on boot (no migration folder yet). Add Prisma migrations for production hardening.
