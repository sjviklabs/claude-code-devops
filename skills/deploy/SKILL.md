---
name: deploy
description: Pre-flight checklist, tagged release, deployment execution, and post-deploy verification with rollback procedure.
trigger: When the user says "deploy", "ship it", "release this", or asks to deploy to an environment.
---

# Deploy Skill

Execute a safe, repeatable deployment with pre-flight checks, tagging, verification, and a rollback plan.

## Steps

### Phase 1: Pre-Flight Checklist

1. **Confirm the target environment.** Ask if not specified (production, staging, dev).
2. **Run the test suite.** All tests must pass before proceeding.
   ```bash
   # Detect and run the project's test command
   # npm test | pytest | go test ./... | cargo test
   ```
3. **Run the build.** Confirm it completes without errors.
   ```bash
   # npm run build | python -m build | go build ./... | cargo build --release
   ```
4. **Check environment variables.** Verify required env vars are set for the target environment. Never print their values.
   ```bash
   # Check existence, not contents
   env | grep -c "^REQUIRED_VAR=" || echo "MISSING: REQUIRED_VAR"
   ```
5. **Check git state.** Working tree must be clean. All changes committed.
   ```bash
   git status --porcelain
   git log --oneline -3
   ```
6. **Report pre-flight status.** List each check as PASS or FAIL. Stop on any FAIL.

### Phase 2: Tag and Release

7. **Determine the next version.** Check the latest tag and infer the bump (major/minor/patch) from commits since that tag.
   ```bash
   git describe --tags --abbrev=0 2>/dev/null || echo "no tags found"
   git log $(git describe --tags --abbrev=0 2>/dev/null)..HEAD --oneline
   ```
8. **Create an annotated tag.** Include a summary of changes in the tag message.

   ```bash
   git tag -a v1.2.3 -m "$(cat <<'EOF'
   Release v1.2.3

   - feat: new endpoint for user export
   - fix: correct timezone handling in scheduler
   EOF
   )"
   ```

9. **Push the tag.** Only when the user explicitly confirms.
   ```bash
   git push origin v1.2.3
   ```

### Phase 3: Deploy

10. **Execute the deployment command** for the target environment.
    - Document exactly what command was run and its output.
    - If the project has a deploy script, use it. Don't invent a new process.

### Phase 4: Post-Deploy Verification

11. **Health check.** Hit the health endpoint or run a smoke test.
12. **Verify the deployed version** matches the tag you just pushed.
13. **Check logs** for errors in the first 60 seconds after deploy.
14. **Report status.** Deployed version, environment, health check result, any warnings.

### Rollback Procedure

If post-deploy verification fails:

1. **Identify the previous good tag.**
   ```bash
   git tag --sort=-v:refname | head -5
   ```
2. **Redeploy the previous version.** Use the same deploy mechanism, targeting the prior tag.
3. **Verify rollback** with the same health checks from Phase 4.
4. **Report the failure.** What went wrong, what was rolled back to, what needs investigation.

## Rules

- NEVER push tags without explicit user confirmation
- NEVER deploy with failing tests or a dirty working tree
- NEVER print environment variable values, only confirm they exist
- NEVER skip the pre-flight checklist, even if the user says "just ship it"
- If there is no deploy script or CI pipeline, ask the user how deployments work before proceeding
- Always record the previous good version before deploying so rollback is one command away
