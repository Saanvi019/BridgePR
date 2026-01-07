
//deciding what “backend files” mean


export function isBackendFile(filePath: string): boolean {
  return (
    filePath.includes("/controllers/") ||
    filePath.includes("/routes/") ||
    filePath.includes("/api/")
  );
}
