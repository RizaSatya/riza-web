# Production Docker Image Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-ready Docker image for the Next.js app using standalone output.

**Architecture:** Enable Next.js standalone output in `next.config.ts`, then build a multi-stage Docker image that installs dependencies, compiles the app, and runs the standalone server from a smaller runtime stage. Keep documentation and Docker build context aligned with that runtime model.

**Tech Stack:** Next.js 16, TypeScript, Docker, Node 22, Vitest

---

## Chunk 1: Lock The Container Contract With Tests

### Task 1: Add failing tests for the Docker production setup

**Files:**
- Create: `docker.test.ts`
- Test: `docker.test.ts`

- [ ] **Step 1: Write the failing tests**

Add assertions for:

- `next.config.ts` exporting `output: "standalone"`
- `Dockerfile` existing with builder and runner stages
- `Dockerfile` running `npm ci`, `npm run build`, and `node server.js`
- `.dockerignore` excluding `node_modules` and `.next`

- [ ] **Step 2: Run the Docker tests to verify they fail**

Run: `npm test -- docker.test.ts`

Expected: FAIL because the Docker assets do not exist yet and the Next.js config is not set to standalone output.

## Chunk 2: Implement The Docker Production Path

### Task 2: Add the standalone config and Docker assets

**Files:**
- Modify: `next.config.ts`
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `README.md`
- Test: `docker.test.ts`

- [ ] **Step 1: Add the minimal implementation**

Implement:

- `output: "standalone"` in `next.config.ts`
- a multi-stage `Dockerfile` using Node 22
- `.dockerignore` entries for local build artifacts
- README usage instructions for `docker build` and `docker run`

- [ ] **Step 2: Run the Docker tests to verify they pass**

Run: `npm test -- docker.test.ts`

Expected: PASS

### Task 3: Verify the production build

**Files:**
- Modify: `next.config.ts`
- Test: `docker.test.ts`

- [ ] **Step 1: Run the production build**

Run: `source ~/.nvm/nvm.sh && nvm use v22.1.0 >/dev/null && npm run build`

Expected: PASS with standalone Next.js output generated in `.next`

- [ ] **Step 2: Review the diff for only the intended files**

Run: `git status --short`

Expected: only the Docker-related docs, tests, and config/assets changed for this task.
