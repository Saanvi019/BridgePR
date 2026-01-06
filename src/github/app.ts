import fs from "fs";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

export async function getInstallationOctokit(
  installationId: number
) {
  const privateKey = fs.readFileSync(
    process.env.GITHUB_PRIVATE_KEY_PATH!,
    "utf8"
  );

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
