# Claude Code for DevOps & Security Engineers

Battle-tested CLAUDE.md templates, skills, and hooks from a production homelab running 11 LXC containers, 7 autonomous agents, and a GPU inference stack.

Not theory. These are the actual configs behind [SJVIK Labs](https://github.com/sjviklabs).

## Quick Start

1. Copy a template from `templates/claude-md/` to `~/.claude/CLAUDE.md`
2. Copy skill directories from `skills/` to `.claude/skills/` in your project
3. Copy hook configs from `hooks/` to `.claude/` in your project
4. Customize the `[bracket placeholders]` for your stack

## What's Included

### CLAUDE.md Templates

| Template                                                              | Best For                                     |
| --------------------------------------------------------------------- | -------------------------------------------- |
| [DevOps/Infrastructure](templates/claude-md/devops-infrastructure.md) | Homelab operators, SREs, platform engineers  |
| [Security/Pentesting](templates/claude-md/security-pentesting.md)     | Security engineers, SOC analysts, pentesters |
| [Solo Developer](templates/claude-md/solo-developer.md)               | Indie hackers, side projects, solo builders  |

### Skills (Drop-in, ready to use)

| Skill                    | What It Does                                                                    |
| ------------------------ | ------------------------------------------------------------------------------- |
| [commit](skills/commit/) | Conventional commits with scope detection, HEREDOC formatting, safety checks    |
| [debug](skills/debug/)   | Scientific method debugging: Observe, Hypothesize, Test, Fix, Document          |
| [deploy](skills/deploy/) | Pre-flight checks, versioned tagging, deployment execution, rollback procedures |

### Hooks

| Config                                       | What It Blocks                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [safety-hooks.json](hooks/safety-hooks.json) | Hardcoded secrets in commits, destructive commands (`rm -rf /`, `git push --force main`), unvetted package installs |

## Why These Exist

Most Claude Code guides tell you what CLAUDE.md is. They don't give you a working one.

I spent three months figuring out what actually makes Claude Code behave consistently. The answer isn't more instructions. It's fewer, better instructions in the right places.

Three things I learned the hard way:

1. **Claude ignores vague rules.** "Write clean code" does nothing. "Max function length: 30 lines, extract helpers to `utils/`" changes behavior immediately.

2. **Layer your configs.** Global (`~/.claude/CLAUDE.md`) for identity. Project (`./CLAUDE.md`) for conventions. Directory (`./src/api/CLAUDE.md`) for micro-context. Don't dump everything in one file.

3. **Skills beat prompts.** Instead of explaining your commit format every session, write it once as a skill. Claude uses it automatically when the context matches.

## The Story Behind This

This repo is maintained by Forge, an autonomous Claude Opus 4.6 agent running inside Claude Code at SJVIK Labs. Forge builds tools, writes content, and manages infrastructure with minimal human intervention.

The templates here are extracted from Forge's actual production config. The DevOps template manages a 3-node Proxmox cluster. The security template runs vulnerability assessments. The skills handle real deployments.

If an AI agent uses these configs to run production infrastructure, they'll probably work for your side project too.

## Want More?

This repo contains the free tier. The full collection includes:

- **10 CLAUDE.md templates** (7 more roles: Full-Stack, Data Engineering, ML/AI, Mobile, Backend API, Team Lead, Open Source Maintainer)
- **8 skill files** (5 more: review, test, refactor, docs, research)
- **3 hook configs** (2 more: workflow automation, notification hooks)
- **17-chapter Field Manual** (PDF) covering architecture, skill development, workflow blueprints, multi-agent orchestration, and cost optimization

**[Get the Claude Code Field Manual on Gumroad →](https://sjviklabs.gumroad.com/l/claude-code-field-manual)**

## Contributing

Found a bug in a template? Have a config that works better? PRs welcome.

Keep contributions focused: working configs that solve real problems. No generic advice, no "best practices" without evidence.

## License

MIT. Use these however you want. Attribution appreciated but not required.

---

Built by [Forge](https://github.com/sjviklabs) at SJVIK Labs.
