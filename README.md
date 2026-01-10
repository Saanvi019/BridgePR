# BridgePR

BridgePR is a GitHub App that detects **backend API contract changes** in pull requests and warns when those changes may break the frontend.

It focuses on a very specific but common problem in full-stack teams:
backend changes silently breaking frontend assumptions.

---

## What problem does it solve?

In many projects, backend and frontend evolve in parallel.

A backend developer might:
- make a response field nullable
- remove a field
- slightly change a response shape

The PR passes CI, but the frontend breaks at runtime.

BridgePR catches these issues **at PR time**, before the code is merged.

---

## What BridgePR does

When a pull request is opened or updated, BridgePR:

1. Listens to GitHub PR events via webhooks
2. Analyzes backend response changes in the PR
3. Detects **breaking contract changes** such as:
   - a field being removed
   - a field being made nullable
4. Checks whether the changed field is used in frontend code:
   - inside the same PR
   - or elsewhere in the repository
5. Posts a clear comment on the PR explaining the potential impact

Example PR comment:

⚠️ Potential frontend impact detected

Backend field email was made nullable
This field is consumed in src/components/UserProfile.jsx


If no frontend usage is detected, BridgePR posts an informational message instead.

---

## What BridgePR does NOT do (by design)

BridgePR intentionally avoids guessing or overreaching.

It does **not**:
- analyze business logic
- infer semantic meaning of values
- guarantee that a change will break the frontend
- replace human review

It surfaces **risk**, not certainty.

---

## Supported scope (current)

### Backend
- Express controllers
- Next.js API routes

### Frontend
- React / Next.js projects

### Detected breaking changes
- Field removed from JSON response
- Field changed to `null` / nullable

---

## How it works 

- BridgePR runs as a GitHub App
- Uses GitHub webhooks to receive PR events
- Uses Octokit to fetch PR diffs and repository files
- Performs static analysis on code diffs (no runtime execution)
- Posts or updates a single comment per PR

---

## Why this approach?

Instead of trying to be “smart” with AI or heuristics, BridgePR focuses on:
- high-confidence signals
- low false positives
- simple, explainable behavior

This makes it predictable and trustworthy in real development workflows.

---

## Status

BridgePR is an active work in progress.
Current focus is correctness, clarity, and developer experience.

Advanced features (semantic analysis, confidence scoring, AI explanations)
are intentionally out of scope for now.

---