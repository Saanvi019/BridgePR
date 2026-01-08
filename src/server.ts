import express from "express";
import { Webhooks } from "@octokit/webhooks";
import dotenv from "dotenv";
import { getInstallationOctokit } from "./github/app";
import type { WebhookEventMap } from "@octokit/webhooks-types";
import { upsertBridgePRComment } from "./github/prComment";
import { getPRFiles } from "./analyzer/prDiff";
import { isBackendFile } from "./analyzer/isBackendFile";
import { parseDiff } from "./analyzer/parseDiff";
import { detectNullableFieldChange } from "./analyzer/breakingChange";
import {  hasBackendResponse  } from "./analyzer/responseExtractors";
import { isFrontendFile } from "./analyzer/isFrontendFile";
import { isFieldUsedInFrontend } from "./analyzer/frontendUsage";
import { isLikelyConsumed } from "./analyzer/frontendConsumption";
import { walkRepo } from "./analyzer/repoFrontendScan";



dotenv.config();

const app = express();

app.use("/webhook", express.raw({ type: "application/json" }));

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

app.post("/webhook", async (req, res) => {
  console.log("🔥 WEBHOOK ENDPOINT HIT");

  try {
    await webhooks.verifyAndReceive({
      id: req.headers["x-github-delivery"] as string,
      name: req.headers["x-github-event"] as string,
      signature: req.headers["x-hub-signature-256"] as string,
      payload: req.body.toString(), // raw payload
    });

    res.status(200).send("ok");
  } catch (err) {
    console.error("❌ VERIFICATION FAILED", err);
    res.status(400).send("invalid");
  }
});

webhooks.on("pull_request", ({ payload }) => {
  console.log("✅ PR EVENT RECEIVED");
  console.log("PR number:", payload.pull_request.number);
  console.log("Action:", payload.action);
});

webhooks.on("pull_request", async (event) => {
  const payload = event.payload as WebhookEventMap["pull_request"];

  if (!payload.installation) {
    console.warn("No installation found on PR event");
    return;
  }

  const installationId = payload.installation.id;

  const octokit = await getInstallationOctokit(installationId);

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pull_number = payload.pull_request.number;

  if (!["opened", "synchronize"].includes(payload.action)) return;


  console.log("✅ Comment posted on PR");

  const files = await getPRFiles(octokit, owner, repo, pull_number);
  let detectedBreakingChange: {
  field: string;
  type: string;
} | null = null;

  let frontendUsageFound = false;

 //detection
 for (const file of files) {
  if (!isBackendFile(file.filename)) continue;
  if (!hasBackendResponse(file.patch)) continue;

  const { added, removed } = parseDiff(file.patch);
  const breakingChange = detectNullableFieldChange(removed, added);

  if (breakingChange && !detectedBreakingChange) {
    detectedBreakingChange = breakingChange;

    console.log(
    `Backend response changed: ${breakingChange.field} → ${breakingChange.type}`
  );
  await upsertBridgePRComment({
    octokit,
    owner,
    repo,
    issue_number: pull_number,
    body: "⏳ **BridgePR is analyzing potential frontend impact…**",
  });
  }
}
 
if (detectedBreakingChange) {
  for (const f of files) {
    if (!isFrontendFile(f.filename)) continue;

    if (isLikelyConsumed(f.patch, detectedBreakingChange.field)) {
      frontendUsageFound = true;
      break;
    }
  }

  
}

let repoWideUsageFound = false;

if (detectedBreakingChange && !frontendUsageFound) {
  console.log("🔍 No frontend usage in PR, scanning repo...");

  const allRepoFiles = await walkRepo(octokit, owner, repo);

  for (const filePath of allRepoFiles) {
    if (!isFrontendFile(filePath)) continue;

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    if (!("content" in data)) continue;

    const content = Buffer.from(
      data.content,
      "base64"
    ).toString("utf-8");

    if (isLikelyConsumed(content, detectedBreakingChange.field)) {
      repoWideUsageFound = true;
      console.log(
        `⚠️ Frontend usage found in repo file: ${filePath}`
      );
      break;
    }
  }
}


let commentBody: string;

if (detectedBreakingChange) {
  if (frontendUsageFound || repoWideUsageFound) {
    commentBody = [
    `⚠️ **Potential frontend impact detected**`,
    ``,
    `- Backend field \`${detectedBreakingChange.field}\` was made **${detectedBreakingChange.type}**`,
    
     `- This field is consumed in frontend files`
      
  ].join("\n");
}else{
  commentBody = [
    `ℹ️ **Backend change detected**`,
    ``,
    `- Backend field \`${detectedBreakingChange.field}\` was made **${detectedBreakingChange.type}**`,
    `- Safe to change, no frontend impact detected.`,
  ].join("\n");
}
if (frontendUsageFound || repoWideUsageFound) {
    console.log(
      `⚠️ Frontend may break: '${detectedBreakingChange.field}' is consumed in frontend files`
    );
  } else {
    console.log(
      `ℹ️ Backend field '${detectedBreakingChange.field}' changed, no frontend usage detected`
    );
  }

  await upsertBridgePRComment({
    octokit,
    owner,
    repo,
    issue_number: pull_number,
    body: commentBody,
  });
  console.log("✅ Comment posted on PR");
}



});


app.listen(process.env.PORT, () => {
  console.log(`BridgePR listening on port ${process.env.PORT}`);
});
