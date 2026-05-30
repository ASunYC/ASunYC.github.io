---
layout: page
outline: [2, 3]
---

<script setup>
import ReadmeViewer from '../components/ReadmeViewer.vue'
</script>

# OpenAgentSeal

> A Python-based personal AI assistant for any OS and platform.

<div align="center">

<div class="project-badge-row">
  <img alt="Python" src="https://img.shields.io/badge/python-3.10+-blue.svg">
  <img alt="Vue" src="https://img.shields.io/badge/vue-3-green.svg">
  <img alt="Tauri" src="https://img.shields.io/badge/tauri-2-24C8DB.svg">
  <img alt="License" src="https://img.shields.io/github/license/ASunYC/OpenAgentSeal.svg">
</div>

**Author**: [ASunYC](https://github.com/ASunYC)

[GitHub](https://github.com/ASunYC/OpenAgentSeal) | [Screenshots](#screenshots) | [Features](#features) | [Quick Start](#quick-start) | [Full README](#full-readme)

</div>

---

## Project Overview

OpenAgentSeal is a Python-first AI agent framework with an execution loop, tool system, memory system, multi-LLM configuration, Web UI, and a lightweight Tauri desktop shell.

It is designed for local-first agent applications that can run as:

- an interactive CLI assistant
- a FastAPI + Vue Web UI
- a Windows desktop shell with tray integration
- an ACP-compatible agent service
- a tool-using runtime with MCP and Skills support

### Platform Shape

- **Core runtime**: Python agent loop, tool calling, memory, task queue, and LLM adapters.
- **Web interface**: Vue 3 workspace for chat, model switching, settings, and agent status.
- **Desktop shell**: Tauri 2 wrapper for a native Windows-style local assistant.
- **Integration layer**: MCP, ACP, Claude Skills, and multi-provider model configuration.

---

## Screenshots

<div class="screenshot-grid">
  <figure>
    <img alt="OpenAgentSeal chat workspace" src="https://raw.githubusercontent.com/ASunYC/OpenAgentSeal/main/docs/assets/screenshots/openagentseal-chat.png">
    <figcaption>Chat Workspace</figcaption>
  </figure>
  <figure>
    <img alt="OpenAgentSeal built-in browser" src="https://raw.githubusercontent.com/ASunYC/OpenAgentSeal/main/docs/assets/screenshots/openagentseal-browser.png">
    <figcaption>Built-in Browser</figcaption>
  </figure>
  <figure>
    <img alt="OpenAgentSeal settings panel" src="https://raw.githubusercontent.com/ASunYC/OpenAgentSeal/main/docs/assets/screenshots/openagentseal-settings.png">
    <figcaption>Settings Panel</figcaption>
  </figure>
</div>

---

## Features

### Core Capabilities

- **Agent execution loop**: multi-turn conversations and tool calling.
- **Multi-LLM support**: Anthropic, OpenAI, DeepSeek, MiniMax, Volcano Engine, Qwen, Zhipu AI, and more.
- **Streaming response**: SSE streaming output for real-time AI responses.
- **Tool system**: file operations, command execution, notes, MCP tools, and Claude Skills.
- **Memory system**: tree-structured memory with SQLite backend and temporal graph RAG.
- **Task queue**: priority scheduling and concurrency control.

### Interface Capabilities

- **Web UI**: chat workspace, settings panel, model switching, and status visualization.
- **Desktop shell**: tray integration, native window, backend lifecycle management, and Windows packaging.
- **ACP service mode**: expose OpenAgentSeal through Agent Communication Protocol.

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/ASunYC/OpenAgentSeal.git
cd OpenAgentSeal
pip install uv
uv sync
```

### 2. Run the Agent

```bash
open-agent
```

Start Web UI only:

```bash
open-agent --web-only --port 9998
```

Start ACP service:

```bash
open-agent-acp --port 8080
```

### 3. Start the Desktop Shell

```bash
cd desktop
npm install
npm run dev
```

---

## Commands

| Command | Description |
|---|---|
| `open-agent` | Start the interactive agent assistant |
| `open-agent --workspace <path>` | Run the agent against a specific workspace |
| `open-agent --task "..."` | Execute a single task |
| `open-agent --cli-only` | Start in CLI-only mode |
| `open-agent --web-only --port 9998` | Start only the Web UI service |
| `open-agent-acp --port 8080` | Start the ACP-compatible service |

---

## Full README

<ReadmeViewer
  title="OpenAgentSeal"
  repo-url="https://github.com/ASunYC/OpenAgentSeal"
  raw-url="https://raw.githubusercontent.com/ASunYC/OpenAgentSeal/main/README.md"
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

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0 8px;
}

.screenshot-grid figure {
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.screenshot-grid img {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;
  margin: 0;
}

.screenshot-grid figcaption {
  border-top: 1px solid var(--vp-c-divider);
  padding: 10px 12px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .screenshot-grid {
    grid-template-columns: 1fr;
  }

  .screenshot-grid img {
    height: auto;
  }
}
</style>
