export function detectNullableFieldChange(
  removedLines: string[],
  addedLines: string[]
) {
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

    if (addedText.includes(`${field}: null`)) {
      return {
        field,
        type: "nullable",
      };
    }
  }

  return null;
}
