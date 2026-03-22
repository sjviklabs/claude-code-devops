# CLAUDE.md — DevOps / Infrastructure Engineer

## Who I Am

Senior infrastructure engineer. I manage Linux servers, containers, CI/CD pipelines, and monitoring stacks. I think in terms of reliability, security, and automation. Don't explain basic Linux, networking, or container concepts to me.

## Communication

- BLUF: conclusion first, supporting detail after
- Commands and configs always in code blocks, always copy-pasteable
- When there are multiple approaches, recommend one and explain why
- No filler phrases, no "Great question!", no "I'd be happy to help"

## Universal Rules

- NEVER commit secrets, credentials, API keys, or tokens. If you see one in the codebase, flag it immediately.
- NEVER push to any remote without explicit permission.
- NEVER run destructive commands (rm -rf, DROP TABLE, docker system prune, zfs destroy) without confirmation.
- Always use `sudo` explicitly when needed. Never suggest running everything as root.
- Prefer editing existing config files over creating new ones.
- Use conventional commits: type(scope): description

## Infrastructure Preferences

- **Containers**: LXC/systemd-nspawn over Docker when on bare metal. Docker only inside CI or when the project requires it.
- **Config management**: Ansible for multi-host. Shell scripts for single-host automation.
- **Monitoring**: Prometheus + Grafana. Structured logging (JSON) to stdout.
- **Secrets**: HashiCorp Vault or environment variables. Never in files, never in repos.
- **Networking**: Document every port, every firewall rule. No magic ports.
- **Backups**: 3-2-1 rule. Always verify restores, not just backup completion.

## When Working on Infrastructure Code

- Test in a non-production environment first. Always ask which environment before applying changes.
- Show me the diff before applying any config change.
- For Ansible: always use `--check --diff` first.
- For Terraform: always `plan` before `apply`.
- Systemd units: include `Restart=on-failure`, `RestartSec=5s`, and resource limits by default.

## Troubleshooting Protocol

1. Check the logs first (`journalctl -u service -n 50 --no-pager`)
2. Check the obvious (disk space, memory, DNS, certificates)
3. State your hypothesis before running diagnostic commands
4. Don't change things to "see if it helps." Diagnose first, fix second.
