# Caduceus

Caduceus is Kay's telemetry-free fork of [T3 Code](https://github.com/pingdotgg/t3code), an agent-harness control surface. It keeps T3 Code's local web, desktop, remote-control, provider, and ACP architecture while removing product analytics, remote observability exporters, mobile crash uploads, and build telemetry.

Local diagnostic files stay on the machine unless you explicitly share them. Live resource
diagnostics are shown only to an authenticated connected client. T3 Connect remains functional
authenticated relay traffic; its operator can see the connection metadata required to carry that
traffic. Agent-activity publishing is optional and defaults off.

The upstream mobile-store apps are not Caduceus builds and are not covered by this fork's telemetry-free guarantee. The current deployment target is the fork's local web/server client.

Works with your subscriptions on Claude Code, Codex, Cursor, Grok Build, OpenCode, and Google Antigravity. If they're set up on your computer, T3 Code can control them.

## "Wait, what are you selling me?"

Nothing. We built T3 Code because we wanted the best possible development experience with agents. We were inspired by existing solutions like the Codex desktop app, Conductor, Claude Desktop and Cursor Glass, but none met our bar.

We wanted something performant, remote-ready, and truly open. If we ever go the wrong direction, we want you to have everything you need to fork and build the editor that you want.

## Installation

Caduceus is currently installed from verified Linux desktop and CLI artifacts built from the
`telemetry-free` branch. There is no public Caduceus package feed yet; do not use T3 Code's
upstream installer or package feeds for this fork.

> [!WARNING]
> T3 Code currently supports Codex, Claude, Cursor, Grok Build, OpenCode, and Antigravity. Install and authenticate at least one provider before use:
>
> - Codex: install [Codex CLI](https://developers.openai.com/codex/cli) and run `codex login`
> - Claude: install [Claude Code](https://claude.com/product/claude-code) and run `claude auth login`
> - Cursor: install [Cursor CLI](https://cursor.com/cli) and run `agent login`
> - Grok Build: install [Grok Build CLI](https://x.ai/cli) and run `grok login`
> - OpenCode: install [OpenCode](https://opencode.ai) and run `opencode auth login`
> - Antigravity: enable it in Settings, then use **Install Antigravity** and **Sign in with Google**. No CLI is required.

### Command line

```bash
git clone --branch telemetry-free https://github.com/iamalwayskay/caduceus.git
cd caduceus
vp install
vp run --filter t3 build
```

The deployed KPC command is `caduceus`. Runtime data lives outside the checkout. See
[STATE.md](./STATE.md) for the verified paths, commit, providers, and Haven deployment.

### Linux desktop app

```bash
node scripts/build-desktop-artifact.ts --platform linux --target AppImage --arch x64 \
  --output-dir release-caduceus-desktop-package
install -Dm755 release-caduceus-desktop-package/Caduceus-*-x86_64.AppImage \
  /home/kay/Code/AI/apps/caduceus/release/Caduceus-0.1.3-x86_64.AppImage
install -Dm644 apps/desktop/resources/linux/caduceus-kpc.desktop \
  ~/.local/share/applications/caduceus.desktop
```

The installed application is **Caduceus** at
`/home/kay/Code/AI/apps/caduceus/release/Caduceus-0.1.3-x86_64.AppImage`. KPC's desktop entry sets
`T3CODE_HOME=/home/kay/Code/AI/data/caduceus`, so the app uses the same Codex, Hermes, DeepSeek
Harness, projects, and saved Haven environment as the CLI deployment. It advertises KPC at
`192.168.1.185:3773` for authenticated clients on the home LAN; WireGuard clients can use
`10.77.0.2:3773`.

### Upstream desktop packages

The packages below are upstream T3 Code and are not covered by Caduceus's telemetry-free
guarantee. They are retained only as upstream reference.

#### Windows (`winget`)

```bash
winget install T3Tools.T3Code
```

#### Windows (`scoop`)

```bash
scoop install extras/t3code
```

#### macOS (Homebrew)

```bash
brew install --cask t3-code
```

#### Debian, Ubuntu (`.deb`)

Download the `.deb` from [GitHub Releases](https://github.com/pingdotgg/t3code/releases), then:

```bash
sudo apt install ./T3-Code-*.deb
```

#### Arch Linux (AUR)

Stable:

```bash
yay -S t3code-bin
```

Nightly:

```bash
yay -S t3code-nightly-bin
```

The AUR packaging is maintained in this repository under [`packaging/aur`](./packaging/aur).

## Some notes

We are very very early in this project. Expect bugs.

We are (mostly) not accepting contributions yet. Small fixes may be considered. Big features will not be.

## Documentation

Full docs live in [docs/](./docs). There's no docs site yet.

- [FAQ](./docs/user/faq.md)
- [Install and first run](./docs/user/install.md)
- [Permission modes](./docs/user/permission-modes.md)
- [Keyboard shortcuts](./docs/user/keybindings.md)
- [Project settings](./docs/user/project-settings.md)
- [Appearance preferences](./docs/user/appearance.md)
- [Remote access from a phone or another machine](./docs/user/remote-access.md)
- [Connect Claude Code, Codex, ChatGPT and other agents over MCP](./docs/user/outside-agents.md)
- [Keeping app and server in sync](./docs/user/updating.md)
- [Source control integrations](./docs/user/source-control.md)
- Multiple accounts: [Codex](./docs/user/providers-codex.md) · [Claude](./docs/user/providers-claude.md)
- [Run T3 Code as a background service](./docs/user/background-service.md)

Building from source? Start at [docs/internals/overview.md](./docs/internals/overview.md).

## If you REALLY want to contribute still.... read this first

### Install `vp`

T3 Code uses Vite+ so you'll need to install the global `vp` command-line tool.

#### macOS / Linux

```bash
curl -fsSL https://vite.plus | bash
```

#### Windows

```bash
irm https://vite.plus/ps1 | iex
```

Checkout their getting started guide for more information: https://viteplus.dev/guide/

### Install dependencies

```bash
vp i
```

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before reporting a bug or opening a PR.

Have a feature request? Start an [Ideas discussion](https://github.com/pingdotgg/t3code/discussions/categories/ideas).

Need support? Join the [Discord](https://discord.gg/jn4EGJjrvv).
