---
outline: [2, 3]
---

# Agent Switch

> A skill-first CLI for switching between coding agents, capturing model conversations, isolating CLI accounts, and returning clean handoff summaries.

<div align="center">

<div class="project-badge-row">
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg">
  <img alt="Node.js" src="https://img.shields.io/badge/node.js-18+-green.svg">
  <img alt="CLI" src="https://img.shields.io/badge/cli-agent--switch-222.svg">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg">
</div>

**Author**: [ASunYC](https://github.com/ASunYC)

[GitHub](https://github.com/ASunYC/agent-switch-skill) | [Quick Start](#quick-start) | [Profiles](#multiple-cli-accounts) | [Commands](#commands)

</div>

---

## Project Overview

Agent Switch packages the `agent-switch` command as an installable agent skill. It is designed for people who use more than one coding CLI and want a controlled way to delegate work while keeping a readable capture trail.

- **Switch agents**: run Claude Code, Codex, CodeWhale, OpenCode, DeepSeek legacy shims, Kimi, or a custom compatible CLI through one wrapper.
- **Capture conversations**: record prompts, tool calls, model responses, status codes, and request metadata.
- **Dashboard with segments**: open a local web UI with configurable segments showing session totals for tokens, cost, status rate, and compact savings.
- **Isolate accounts**: run Claude Code, Codex, and OpenCode with named profiles under `~/.agent-switch/profiles`.
- **Return handoffs**: after the delegated CLI exits, Agent Switch prints a concise summary for the current Codex session.

### Design Goals

- Skill-first installation flow for Codex and compatible agents.
- Local-only capture storage with auth-header redaction by default.
- One command for agent switching, dashboard viewing, and exports.
- Provider recipes for common coding CLIs and OpenAI/Anthropic-compatible gateways.
- Optional compact mode for Claude-based providers when a Headroom proxy is available.

---

## Features

### Core Capabilities

- **Agent handoff**: delegate a task to another coding CLI and return to the current session.
- **Conversation capture**: inspect request and response traffic sent through the local proxy.
- **Dashboard with segments**: browse saved sessions in a local web UI with configurable info segments.
- **Session-wide stats**: live totals for tokens (input/output/cache), cost, status rate, and compact savings.
- **Exports**: generate `md`, `raw`, `json`, or `har` output for captured requests.
- **Provider wrappers**: use built-in recipes for Claude Code, Codex, CodeWhale, OpenCode, Kimi, DeepSeek legacy shims, Ollama, LM Studio, OpenRouter, Bedrock, Vertex, and more.
- **CLI profiles**: isolate account/config homes for Codex, Claude Code, and OpenCode without changing the current project directory.
- **Compact mode**: optionally compress Claude-based requests through Headroom while keeping both original and forwarded views in the dashboard.

### Privacy Notes

Agent Switch masks authorization headers by default, but captured logs may still contain prompts, file paths, tool outputs, and source snippets. Treat `~/.agent-switch` as private local data.

---

## Quick Start

### 1. Install the Skill CLI

From the installed skill directory:

```bash
node scripts/install-agent-switch.js
```

Verify the command:

```bash
agent-switch --help
```

### 2. Run Another Agent CLI

```bash
# Claude Code with auto-opened dashboard
agent-switch claude --open

# Headless capture; dashboard URL is printed on startup
agent-switch claude
agent-switch codex
agent-switch codewhale
agent-switch opencode
agent-switch deepseek
agent-switch kimi
```

The dashboard runs in the background during a captured CLI run. Its URL is printed on startup, so you can open it in another browser tab without exiting the CLI. Use `agent-switch dashboard` (or `webui`) later to browse previously captured sessions without starting a new capture.

### 3. Inspect Captured Conversations

```bash
agent-switch dashboard
agent-switch export <session>/<seq> --format md
agent-switch export <session>/<seq> --format raw
```

---

## Dashboard Segments

The dashboard overview bar is built from independent, configurable segments inspired by terminal statuslines like Powerlevel10k / Coralline.

Default segments:

| Segment | Shows |
|---|---|
| 📦 Sessions | Active capture session count and live status |
| 📊 Status | Request success rate with a colored bar and status code breakdown |
| 👤 Profile | The current CLI profile name (e.g. `claude/work`) |
| 🗜 Compact | Headroom compression ratio and cumulative tokens saved |
| 📝 Tokens | Session-wide totals: input, output, cache-read, and combined token count |

Optional segments (off by default):

| Segment | Shows |
|---|---|
| ⏱ Latency | Average and p95 request latency |
| 💰 Cost | Estimated API cost from priced requests |

Click **⚙ segments** in the overview bar to toggle segments and pick a **Grid** or **Bar** layout. Your choices are saved to `localStorage` and persist across dashboard sessions.

---

## Multiple CLI Accounts

Profiles let you keep separate accounts/configs for a target CLI while staying in the same workspace.

```bash
agent-switch profile new codex/work
agent-switch profile new claude/work
agent-switch profile new opencode/work
```

Use a profile:

```bash
agent-switch codex --profile work
agent-switch claude --profile work
agent-switch opencode --profile work
```

Create a profile that shares non-secret defaults:

```bash
agent-switch profile new codex/work --shared
```

Agent Switch never shares known auth/session files such as Codex `auth.json`, Claude credentials, session folders, or history files.

---

## Compact Mode

Compact mode is off by default. Enable it only when you want Claude-based providers to route through a separate Headroom proxy.

```bash
agent-switch claude --compact
agent-switch kimi --compact
agent-switch bedrock --compact
agent-switch vertex --compact
```

Check compact readiness:

```bash
agent-switch compact doctor
```

By default compact mode is fail-open, so Agent Switch forwards the original request if Headroom is unavailable.

---

## Commands

| Command | Example | Description |
|---|---|---|
| `claude` | `agent-switch claude` | Start Claude Code with capture enabled |
| `codex` | `agent-switch codex` | Start Codex with capture enabled |
| `codewhale` | `agent-switch codewhale` | Start CodeWhale with capture enabled |
| `codewhale-tui` | `agent-switch codewhale-tui` | Start the CodeWhale TUI binary directly |
| `opencode` | `agent-switch opencode` | Start OpenCode with capture enabled |
| `run` | `agent-switch run --provider openai -- my-cli` | Wrap a custom compatible CLI |
| `dashboard` | `agent-switch dashboard` | Open the saved-session dashboard |
| `export` | `agent-switch export <id> --format md` | Export one captured request |
| `profile` | `agent-switch profile new codex/work` | Manage isolated CLI account/config profiles |
| `proxy` | `agent-switch proxy --provider openai` | Run only the capture proxy and dashboard |

<style>
.project-badge-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 16px 0 18px;
}

.vp-doc .project-badge-row img {
  display: inline-block;
  width: auto;
  height: 20px;
  margin: 0;
}
</style>
