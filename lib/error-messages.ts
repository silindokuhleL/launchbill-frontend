import { AxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function retryLabel(action: string) {
  return `Retry ${action.trim().toLowerCase()}`;
}
