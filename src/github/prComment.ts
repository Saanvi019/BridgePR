import { Octokit } from "@octokit/rest";

const BRIDGEPR_MARKER = "<!-- bridgepr -->";

export async function upsertBridgePRComment({
  octokit,
  owner,
  repo,
  issue_number,
  body,
}: {
  octokit: Octokit;
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}) {
  // 1. Fetch existing comments
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number,
  });

  // 2. Look for BridgePR comment
  const existing = comments.find((comment) =>
    comment.body?.includes(BRIDGEPR_MARKER)
  );

  const finalBody = `${body}\n\n${BRIDGEPR_MARKER}`;

  // 3. Update or create
  if (existing) {
    await octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existing.id,
      body: finalBody,
    });
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: finalBody,
    });
  }
}
