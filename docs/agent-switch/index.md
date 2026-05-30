---
outline: [2, 3]
---

<script setup>
import ReadmeViewer from '../components/ReadmeViewer.vue'
</script>

# Agent Switch

> A skill-first CLI for switching between coding agents, capturing model conversations, inspecting requests, and returning clean handoff summaries.

<div align="center">

<div class="project-badge-row">
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg">
  <img alt="Node.js" src="https://img.shields.io/badge/node.js-18+-green.svg">
  <img alt="CLI" src="https://img.shields.io/badge/cli-agent--switch-222.svg">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green.svg">
</div>

**Author**: [ASunYC](https://github.com/ASunYC)

[GitHub](https://github.com/ASunYC/agent-switch-skill) | [Quick Start](#quick-start) | [Commands](#commands) | [Full README](#full-readme)

</div>

---

## Project Overview

Agent Switch packages the `agent-switch` command as an installable agent skill. It is designed for people who use more than one coding CLI and want a controlled way to delegate work while keeping a readable capture trail.

- **Switch agents**: run Claude Code, Codex, OpenCode, DeepSeek, Kimi, or a custom compatible CLI through one wrapper.
- **Capture conversations**: record prompts, tool calls, model responses, status codes, and request metadata.
- **Inspect sessions**: open a local dashboard only when needed, or export individual requests as Markdown, raw HTTP, JSON, or HAR.
- **Return handoffs**: after the delegated CLI exits, Agent Switch prints a concise summary for the current Codex session.

### Design Goals

- Skill-first installation flow for Codex and compatible agents.
- Local-only capture storage with auth-header redaction by default.
- One command for agent switching, dashboard viewing, and exports.
- Provider recipes for common coding CLIs and OpenAI/Anthropic-compatible gateways.

---

## Features

### Core Capabilities

- **Agent handoff**: delegate a task to another coding CLI and return to the current session.
- **Conversation capture**: inspect request and response traffic sent through the local proxy.
- **Dashboard**: browse saved sessions in a local web UI.
- **Exports**: generate `md`, `raw`, `json`, or `har` output for captured requests.
- **Provider wrappers**: use built-in recipes for Claude Code, Codex, OpenCode, Kimi, DeepSeek, Ollama, LM Studio, OpenRouter, Bedrock, Vertex, and more.

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
agent-switch claude
agent-switch codex
agent-switch opencode
agent-switch deepseek
agent-switch kimi
```

### 3. Inspect Captured Conversations

```bash
agent-switch dashboard
agent-switch export <session>/<seq> --format md
agent-switch export <session>/<seq> --format raw
```

---

## Commands

| Command | Example | Description |
|---|---|---|
| `claude` | `agent-switch claude` | Start Claude Code with capture enabled |
| `codex` | `agent-switch codex` | Start Codex with capture enabled |
| `opencode` | `agent-switch opencode` | Start OpenCode with capture enabled |
| `run` | `agent-switch run --provider openai -- my-cli` | Wrap a custom compatible CLI |
| `dashboard` | `agent-switch dashboard` | Open the saved-session dashboard |
| `export` | `agent-switch export <id> --format md` | Export one captured request |
| `proxy` | `agent-switch proxy --provider openai` | Run only the capture proxy and dashboard |

---

## Full README

<ReadmeViewer
  title="Agent Switch"
  repo-url="https://github.com/ASunYC/agent-switch-skill"
  raw-url="https://raw.githubusercontent.com/ASunYC/agent-switch-skill/main/README.md"
  :show-hero="false"
/>

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
