export function isFieldUsedInFrontend(
  patch: string | undefined,
  field: string
): boolean {
  if (!patch) return false;

  
  return patch.includes(field);
}
