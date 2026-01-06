import { Octokit } from "@octokit/rest";

export async function getPRFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  pull_number: number
) {
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number,
    per_page: 100,
  });

  return data;
}
