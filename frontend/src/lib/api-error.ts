import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Try again."): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }
  const data = error.response?.data as { message?: string | string[] } | undefined;
  const msg = data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;

  const status = error.response?.status;
  if (status === 401) return "Invalid email or password.";
  if (status === 400) return "Please check your details and try again.";
  if (status === 404) return "Service not found — check API URL.";
  return fallback;
}
