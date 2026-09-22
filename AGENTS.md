# Personal Website

This repository contains Matt's personal website.

## Git workflow

- The production branch is `master`.
- By default, do not push directly to `master`. Use a task branch and pull request.
- If the user explicitly asks to push, publish, or deploy a change directly to `master`, you may commit and push directly to `master`.
- Before pushing directly to `master`, inspect the final diff and run all relevant available validation.
- If validation fails, do not push to `master` unless the user explicitly instructs otherwise.
- Never force push to `master`.
- Before starting work, make sure the local `master` branch is up to date with `origin/master`.
- Create a new branch for each task.
- Name agent-created branches `hermes/<short-task-name>`.
- Make only changes related to the requested task.
- Review `git diff` before committing.
- Commit changes with a clear, descriptive commit message.
- Push the task branch to `origin`.
- When appropriate, open a GitHub pull request targeting `master`.
- Never merge a pull request unless the user explicitly asks.

## Development

- Inspect the existing project before deciding how to build, test, or modify it.
- Follow the existing architecture, formatting, dependencies, and coding conventions.
- Prefer small, focused changes over unnecessary rewrites.
- Run the project's relevant build, test, lint, or validation commands before committing when available.
- If validation fails, investigate the failure instead of silently ignoring it.
- Do not introduce new dependencies unless they are needed for the requested change.

## Safety

- Never commit secrets, credentials, tokens, `.env` files, or private keys.
- Never expose credentials in chat output, logs, commits, or pull requests.
- Do not modify deployment credentials or GitHub authentication unless explicitly requested.
- Do not delete unrelated files or content.
- Do not use destructive Git operations such as `git reset --hard` or force push unless explicitly requested.
- Do not rewrite published Git history unless explicitly requested.

## Repository

GitHub repository:

`mnamvarpour/mnamvarpour.github.io`

Local repository:

`/home/hermes/obsidian/Matt-Obsidian/Professional/Website`
