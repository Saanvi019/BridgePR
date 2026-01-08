import { Octokit } from "@octokit/rest";

export async function getRepoFrontendFiles(
  octokit: Octokit,
  owner: string,
  repo: string
) {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: "",
  });

  return data;
}

export async function walkRepo(
  octokit: Octokit,
  owner: string,
  repo: string,
  path = ""
): Promise<string[]> {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  if (!Array.isArray(data)) return [];

  let files: string[] = [];

  for (const item of data) {
    if (item.type === "file") {
      files.push(item.path);
    } else if (item.type === "dir") {
      files = files.concat(
        await walkRepo(octokit, owner, repo, item.path)
      );
    }
  }

  return files;
}

