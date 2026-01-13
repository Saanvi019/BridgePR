import fs from "fs";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

export async function getInstallationOctokit(
  installationId: number
) {
  const privateKey = process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, "\n");


  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey,
    installationId,
  });

  const { token } = await auth({ type: "installation" });

  return new Octokit({
    auth: token,
  });
}
