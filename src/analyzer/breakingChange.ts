export function detectNullableFieldChange(
  removedLines: string[],
  addedLines: string[]
) {
  // 1️⃣ Detect explicit nullable additions (MOST IMPORTANT)
  for (const line of addedLines) {
    const match = line.match(/(\w+)\s*:\s*null/);
    if (match) {
      return {
        field: match[1],
        type: "nullable",
      };
    }
  }

  // 2️⃣ Fallback: detect removed fields
  const removedFields = removedLines
    .map((line) => {
      const match = line.match(/(\w+)\s*:/);
      return match?.[1];
    })
    .filter(Boolean) as string[];

  const addedText = addedLines.join(" ");

  for (const field of removedFields) {
    if (!addedText.includes(field)) {
      return {
        field,
        type: "removed",
      };
    }
  }

  return null;
}
