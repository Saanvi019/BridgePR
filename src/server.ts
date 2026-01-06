import express from "express";
import { Webhooks } from "@octokit/webhooks";
import dotenv from "dotenv";
import { getInstallationOctokit } from "./github/app";
import type { WebhookEventMap } from "@octokit/webhooks-types";
import { upsertBridgePRComment } from "./github/prComment";

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
  const issue_number = payload.pull_request.number;

  if (!["opened", "synchronize"].includes(payload.action)) return;

await upsertBridgePRComment({
  octokit,
  owner,
  repo,
  issue_number,
  body: "👋 BridgePR is connected",
});

  console.log("✅ Comment posted on PR");
});


app.listen(process.env.PORT, () => {
  console.log(`BridgePR listening on port ${process.env.PORT}`);
});
