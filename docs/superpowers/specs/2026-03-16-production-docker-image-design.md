# Production Docker Image Design

Date: 2026-03-16
Status: Approved in conversation, written for implementation

## Summary

Add a production-only Docker build for the Next.js app so it can run as a containerized service without changing the local development workflow.

The container should build the app in one stage, then run the compiled standalone server in a smaller runtime image.

## Goals

- Produce a repeatable production image for this repository.
- Keep the runtime image small and focused on serving the built app.
- Match the project's existing Node 22 requirement.
- Preserve the current local `npm run dev` workflow outside Docker.

## Non-Goals

- No Docker Compose setup for local development.
- No containerized hot reload workflow.
- No deployment platform-specific manifests in this iteration.

## Recommended Approach

Use a multi-stage Docker build with Next.js standalone output.

### Build stage

- Start from a Node 22 base image.
- Install dependencies with `npm ci`.
- Run `npm run build`.

### Runtime stage

- Copy the standalone server output from `.next/standalone`.
- Copy `.next/static` and `public`.
- Set `NODE_ENV=production`.
- Bind to `0.0.0.0` on port `3000`.
- Start the app with `node server.js`.

## Required Repository Changes

- Update `next.config.ts` to enable `output: "standalone"`.
- Add a `Dockerfile` with builder and runner stages.
- Add a `.dockerignore` file to reduce build context size.
- Update `README.md` with image build and run commands.

## Verification

- Add tests that assert the Docker assets and standalone Next.js output config exist.
- Run the Docker-focused tests first to establish a failing baseline.
- Run the test suite after implementation.
- Run the production build to verify the standalone output compiles successfully.
