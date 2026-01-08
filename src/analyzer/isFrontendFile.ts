export function isFrontendFile(filePath: string): boolean {
  const frontendFolders = [
    "/components/",
    "/pages/",
    "/app/",
    "/src/",
  ];

  const frontendExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
  ];

  return (
    frontendFolders.some((folder) => filePath.includes(folder)) &&
    frontendExtensions.some((ext) => filePath.endsWith(ext))
  );
}
