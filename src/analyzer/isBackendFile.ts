
//deciding what “backend files” mean


export function isBackendFile(filePath: string): boolean {
  return (
    filePath.startsWith("api/") ||
    filePath.startsWith("routes/") ||
    filePath.startsWith("controllers/")
  );
}