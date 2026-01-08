export function isLikelyConsumed(
  patch: string | undefined,
  field: string
): boolean {
  if (!patch) return false;

  // positive signals (actual reads)
  const consumptionPatterns = [
    `.${field}`,
    `["${field}"]`,
    `?.${field}`,
  ];

  // negative signals (definitions / form state)
  const definitionPatterns = [
    `${field}:`,
  ];

  const isConsumed = consumptionPatterns.some((p) =>
    patch.includes(p)
  );

  const isDefinitionOnly = definitionPatterns.some((p) =>
    patch.includes(p)
  );

  return isConsumed && !isDefinitionOnly;
}

