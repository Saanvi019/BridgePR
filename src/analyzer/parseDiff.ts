export function parseDiff(patch?: string) {
  if (!patch) return { added: [], removed: [] };

  const added: string[] = [];
  const removed: string[] = [];

  const lines = patch.split("\n");

  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      added.push(line.slice(1));
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      removed.push(line.slice(1));
    }
  }

  return { added, removed };
}
