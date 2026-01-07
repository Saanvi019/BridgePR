import { hasExpressResponse } from "./express";
import { hasNextJsResponse } from "./nextjs";

export function hasBackendResponse(patch?: string): boolean {
  return hasExpressResponse(patch) || hasNextJsResponse(patch);
}
