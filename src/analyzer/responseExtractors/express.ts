export function hasExpressResponse(patch?: string): boolean {
  if (!patch) return false;

  return patch.includes(".json(");
}
