import { logoYaraStyles, renderLogoYara } from "./components/logoYara";

export function renderPlatformPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>YARA AI | Plataforma</title>
    <meta name="theme-color" content="#081120" />
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
    <link rel="apple-touch-icon" href="/assets/favicon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <style>
      :root {
        color-scheme: dark;
        --bg: #081120;
        --surface: rgba(8, 17, 32, 0.92);
        --panel: rgba(15, 23, 42, 0.78);
        --panel-strong: rgba(15, 23, 42, 0.95);
        --card: #0f172a;
        --line: rgba(148, 163, 184, 0.16);
        --line-strong: rgba(56, 189, 248, 0.38);
        --text: #ffffff;
        --muted: #94a3b8;
        --primary: #0a84ff;
        --secondary: #1e40af;
        --accent: #38bdf8;
        --ok: #34d399;
        --danger: #fb7185;
      }

${logoYaraStyles()}

      * { box-sizing: border-box; }

      html,
      body {
        width: 100%;
        max-width: 100%;
      }

      * {
        scrollbar-width: thin;
        scrollbar-color: rgba(56, 189, 248, 0.42) rgba(15, 23, 42, 0.32);
      }

      *::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      *::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.42);
      }

      *::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.32);
      }

      body {
        margin: 0;
        min-height: 100vh;
        overflow: hidden;
        background:
          radial-gradient(circle at 18% 8%, rgba(10, 132, 255, 0.18), transparent 30rem),
          radial-gradient(circle at 82% 18%, rgba(56, 189, 248, 0.11), transparent 28rem),
          linear-gradient(145deg, #081120, #071329 48%, #050914);
        color: var(--text);
        font-family: Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body.menu-open::before,
      body.drawer-open::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 45;
        background: rgba(2, 6, 23, 0.62);
        backdrop-filter: blur(12px);
      }

      body.menu-open::before {
        z-index: 20;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
        max-width: 100%;
      }

      button {
        cursor: pointer;
        touch-action: manipulation;
      }

      svg {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
      }

      .app-shell {
        height: 100vh;
        width: 100%;
        max-width: 100vw;
        overflow: hidden;
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
      }

      .sidebar {
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        border-right: 1px solid var(--line);
        padding: 16px;
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(8, 17, 32, 0.86));
        backdrop-filter: blur(22px);
      }

      .brand-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .sidebar-body {
        min-height: 0;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 12px;
      }

      .button,
      .primary-action,
      .icon-button {
        min-width: 0;
        min-height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border: 1px solid rgba(56, 189, 248, 0.34);
        border-radius: 12px;
        padding: 10px 14px;
        color: #eff6ff;
        background: rgba(15, 23, 42, 0.72);
        font-weight: 700;
        text-decoration: none;
        line-height: 1.2;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }

      .button:hover,
      .primary-action:hover,
      .icon-button:hover,
      .nav-button:hover,
      .conversation-button:hover,
      .menu-item:hover {
        transform: translateY(-1px);
        border-color: rgba(56, 189, 248, 0.62);
        background: rgba(15, 23, 42, 0.94);
      }

      .primary-action {
        color: #031425;
        border-color: rgba(56, 189, 248, 0.78);
        background: linear-gradient(135deg, #38bdf8, #0a84ff);
        box-shadow: 0 0 26px rgba(10, 132, 255, 0.2);
        font-weight: 800;
      }

      .button.danger,
      .icon-button.danger,
      .menu-item.danger {
        border-color: rgba(251, 113, 133, 0.28);
        color: #fecdd3;
      }

      .module-error {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
        border: 1px solid rgba(248, 113, 113, 0.28);
        border-radius: 14px;
        padding: 13px 14px;
        color: #fee2e2;
        background: rgba(127, 29, 29, 0.28);
        box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
      }

      .module-error strong {
        display: block;
        margin-bottom: 3px;
      }

      .module-error button {
        flex: 0 0 auto;
      }

      .icon-button {
        width: 42px;
        padding: 0;
      }

      .mobile-toggle {
        display: none;
      }

      .nav {
        display: grid;
        gap: 8px;
      }

      .nav-button,
      .conversation-button {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        min-height: 42px;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 10px 11px;
        color: #dbeafe;
        background: transparent;
        text-align: left;
        font-weight: 650;
        overflow-wrap: anywhere;
      }

      .nav-button.active,
      .conversation-button.active {
        border-color: rgba(56, 189, 248, 0.32);
        background: rgba(10, 132, 255, 0.14);
      }

      .section-title {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .conversation-list {
        min-height: 0;
        display: grid;
        gap: 8px;
        overflow: auto;
        padding-right: 2px;
      }

      .conversation-period {
        display: grid;
        gap: 6px;
      }

      .conversation-period h3 {
        margin: 10px 4px 2px;
        color: rgba(148, 163, 184, 0.82);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .conversation-button {
        min-height: 38px;
        font-size: 13px;
        border-radius: 10px;
      }

      .conversation-title {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pin-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--accent);
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.75);
      }

      .account {
        display: grid;
        gap: 10px;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 12px;
        background: rgba(15, 23, 42, 0.54);
      }

      .sidebar-footer {
        display: grid;
        gap: 8px;
      }

      .account-row {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .avatar {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border: 1px solid rgba(56, 189, 248, 0.42);
        border-radius: 999px;
        color: #ffffff;
        background: linear-gradient(145deg, rgba(10, 132, 255, 0.72), rgba(30, 64, 175, 0.82));
        font-weight: 800;
      }

      .account strong,
      .account span {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .account span {
        color: var(--muted);
        font-size: 12px;
      }

      .main {
        min-width: 0;
        min-height: 0;
        max-width: 100vw;
        overflow: hidden;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 25;
        min-height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid var(--line);
        padding: 14px clamp(18px, 4vw, 34px);
        background: rgba(8, 17, 32, 0.62);
        backdrop-filter: blur(18px);
      }

      .topbar-title {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .topbar h1 {
        margin: 0 0 3px;
        font-size: clamp(22px, 3vw, 32px);
        letter-spacing: 0;
      }

      .topbar p {
        margin: 0;
        color: var(--muted);
        line-height: 1.5;
      }

      .topbar-actions {
        min-width: 0;
        flex: 0 1 auto;
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      body.systems-mode .topbar-actions .status {
        display: none;
      }

      .model-select {
        display: none;
        min-height: 38px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 999px;
        padding: 8px 12px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.72);
        outline: none;
        font-weight: 700;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(52, 211, 153, 0.28);
        border-radius: 999px;
        padding: 8px 11px;
        color: #bbf7d0;
        background: rgba(6, 78, 59, 0.22);
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--ok);
        box-shadow: 0 0 16px var(--ok);
        animation: pulseStatus 1.7s ease-in-out infinite;
      }

      @keyframes pulseStatus {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.35); opacity: 1; }
      }

      .view {
        min-width: 0;
        min-height: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        padding: clamp(18px, 4vw, 34px);
      }

      .view[hidden] {
        display: none;
      }

      .chat-view {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        min-height: 0;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: 12px;
        padding: 18px clamp(18px, 4vw, 34px);
      }

      .search-row {
        display: none;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
      }

      .search-row.open {
        display: grid;
      }

      .messages {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 18px;
        overflow: auto;
        border: 0;
        border-radius: 0;
        padding: clamp(14px, 3vw, 26px) max(0px, calc((100% - 920px) / 2));
        background: transparent;
      }

      .empty-chat {
        margin: auto;
        max-width: 620px;
        text-align: center;
      }

      .empty-brand {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }

      .empty-chat h2 {
        margin: 0;
        font-size: clamp(30px, 4vw, 48px);
        font-weight: 750;
      }

      .empty-chat p,
      .muted {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }

      .quick-prompts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 9px;
        margin-top: 18px;
      }

      .quick-prompt {
        min-height: 38px;
        border: 1px solid rgba(56, 189, 248, 0.26);
        border-radius: 999px;
        padding: 8px 12px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.58);
        font-weight: 700;
      }

      .message {
        position: relative;
        max-width: min(760px, 90%);
        min-width: 0;
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 22px;
        padding: 14px 16px 12px;
        background: rgba(15, 23, 42, 0.72);
        line-height: 1.65;
        white-space: normal;
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.16);
        animation: messageIn 180ms ease-out both;
      }

      .message.user {
        align-self: flex-end;
        border-color: rgba(56, 189, 248, 0.35);
        background: linear-gradient(145deg, rgba(10, 132, 255, 0.34), rgba(15, 23, 42, 0.82));
      }

      .message.assistant {
        align-self: flex-start;
        max-width: min(760px, calc(90% - 46px));
        margin-left: 46px;
        animation-name: assistantMessageIn;
      }

      .message.thinking,
      .message.typing {
        border-color: rgba(56, 189, 248, 0.28);
        background:
          linear-gradient(135deg, rgba(56, 189, 248, 0.08), transparent 34%),
          rgba(15, 23, 42, 0.76);
        box-shadow: 0 18px 44px rgba(10, 132, 255, 0.12);
      }

      .message.thinking::after {
        content: "";
        position: absolute;
        inset: -1px;
        pointer-events: none;
        border-radius: inherit;
        background: linear-gradient(110deg, transparent 20%, rgba(56, 189, 248, 0.18) 48%, transparent 76%);
        opacity: 0.65;
        animation: thinkingGlow 1.6s ease-in-out infinite;
      }

      .message.error {
        border-color: rgba(251, 113, 133, 0.34);
        background: rgba(76, 5, 25, 0.36);
      }

      .message-avatar {
        position: absolute;
        top: 8px;
        left: -46px;
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(56, 189, 248, 0.45);
        border-radius: 999px;
        color: #ffffff;
        background: linear-gradient(135deg, #0a84ff, #7c3aed);
        box-shadow: 0 0 22px rgba(10, 132, 255, 0.25);
        font-size: 12px;
        font-weight: 900;
      }

      .message small {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        color: #bae6fd;
        font-weight: 800;
      }

      .message-time {
        color: var(--muted);
        font-size: 11px;
        font-weight: 600;
      }

      .message-content {
        min-width: 0;
        display: grid;
        gap: 10px;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .message-content p {
        margin: 0;
      }

      .message-content pre {
        margin: 0;
      }

      .code-block {
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 14px;
        background: rgba(2, 6, 23, 0.72);
      }

      .code-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.14);
        padding: 8px 10px;
        color: #cbd5e1;
        background: rgba(15, 23, 42, 0.78);
        font-size: 12px;
        font-weight: 800;
      }

      .code-copy {
        min-height: 28px;
        border: 1px solid rgba(56, 189, 248, 0.26);
        border-radius: 999px;
        padding: 4px 9px;
        color: #dbeafe;
        background: rgba(2, 6, 23, 0.44);
        font-size: 12px;
        font-weight: 800;
      }

      .message-content pre code {
        display: block;
        overflow-x: auto;
        padding: 14px;
        font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
        white-space: pre;
        color: #dbeafe;
      }

      .message-content code {
        border-radius: 6px;
        padding: 2px 5px;
        background: rgba(2, 6, 23, 0.62);
        color: #bae6fd;
        font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
      }

      .code-keyword { color: #60a5fa; }
      .code-string { color: #86efac; }
      .code-comment { color: #94a3b8; font-style: italic; }

      .typing-indicator {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #dbeafe;
        font-weight: 750;
      }

      .typing-dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #38bdf8;
        animation: typingPulse 1s ease-in-out infinite;
      }

      .typing-dot:nth-child(2) { animation-delay: 0.14s; }
      .typing-dot:nth-child(3) { animation-delay: 0.28s; }

      @keyframes typingPulse {
        0%, 100% { transform: translateY(0); opacity: 0.35; }
        50% { transform: translateY(-4px); opacity: 1; }
      }

      .typing-cursor {
        display: inline-block;
        width: 7px;
        height: 1.1em;
        margin-left: 3px;
        border-radius: 999px;
        background: var(--accent);
        vertical-align: -0.18em;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.55);
        animation: cursorBlink 0.9s steps(2, start) infinite;
      }

      .send-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(3, 20, 37, 0.22);
        border-top-color: #031425;
        border-radius: 999px;
        animation: spin 760ms linear infinite;
      }

      .primary-action[disabled],
      .icon-button[disabled],
      .button[disabled] {
        cursor: not-allowed;
        opacity: 0.72;
        transform: none;
      }

      @keyframes messageIn {
        from { opacity: 0; transform: translateY(8px) scale(0.99); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes assistantMessageIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes thinkingGlow {
        0%, 100% { opacity: 0.28; transform: translateX(-8px); }
        50% { opacity: 0.72; transform: translateX(8px); }
      }

      @keyframes cursorBlink {
        0%, 45% { opacity: 1; }
        46%, 100% { opacity: 0; }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .message-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 12px;
      }

      .message-action {
        min-height: 32px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 999px;
        padding: 6px 9px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.58);
        font-size: 12px;
        font-weight: 800;
      }

      .message-action.active {
        color: #031425;
        border-color: rgba(56, 189, 248, 0.72);
        background: linear-gradient(135deg, #38bdf8, #0a84ff);
      }

      .message-attachments {
        display: grid;
        gap: 10px;
        margin-top: 12px;
        white-space: normal;
      }

      .attachment-card,
      .attachment-preview {
        border: 1px solid rgba(56, 189, 248, 0.24);
        border-radius: 15px;
        padding: 10px;
        background: rgba(2, 6, 23, 0.42);
      }

      .attachment-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 11px;
      }

      .attachment-thumb {
        width: 72px;
        height: 72px;
        object-fit: cover;
        border: 1px solid rgba(56, 189, 248, 0.28);
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.82);
      }

      .image-preview {
        min-height: 160px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.24);
        border-radius: 16px;
        background: rgba(2, 6, 23, 0.44);
      }

      .image-preview img {
        width: 100%;
        max-height: 280px;
        object-fit: contain;
      }

      .image-card-preview {
        width: 92px;
        height: 72px;
        object-fit: cover;
        border: 1px solid rgba(56, 189, 248, 0.24);
        border-radius: 12px;
        background: rgba(2, 6, 23, 0.5);
      }

      .file-preview-frame {
        width: min(100%, 920px);
        height: min(72vh, 760px);
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-radius: 16px;
        background: #0f172a;
      }

      .file-preview-image {
        width: 100%;
        max-height: 72vh;
        object-fit: contain;
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-radius: 16px;
        background: rgba(2, 6, 23, 0.7);
      }

      .attachment-icon {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(56, 189, 248, 0.28);
        border-radius: 12px;
        color: #bae6fd;
        background: rgba(10, 132, 255, 0.12);
      }

      .attachment-meta {
        min-width: 0;
        display: grid;
        gap: 3px;
      }

      .attachment-meta strong,
      .attachment-meta span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .attachment-meta span {
        color: var(--muted);
        font-size: 12px;
      }

      .message.hidden-by-search {
        display: none;
      }

      .composer-wrap {
        position: sticky;
        bottom: 0;
        z-index: 20;
        padding-top: 8px;
        padding-bottom: max(0px, env(safe-area-inset-bottom));
        background: linear-gradient(180deg, rgba(8, 17, 32, 0), rgba(8, 17, 32, 0.96) 32%);
      }

      .composer-tools {
        max-width: 920px;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        margin: 0 auto 8px;
      }

      .web-search-toggle {
        min-height: 34px;
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-radius: 999px;
        padding: 7px 11px;
        color: #bfdbfe;
        background: rgba(15, 23, 42, 0.58);
        font-size: 12px;
        font-weight: 800;
      }

      .web-search-toggle.active {
        color: #031425;
        border-color: rgba(56, 189, 248, 0.74);
        background: linear-gradient(135deg, #38bdf8, #0a84ff);
        box-shadow: 0 0 20px rgba(10, 132, 255, 0.18);
      }

      .voice-toggle,
      .conversation-toggle {
        min-height: 34px;
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-radius: 999px;
        padding: 7px 11px;
        color: #bfdbfe;
        background: rgba(15, 23, 42, 0.58);
        font-size: 12px;
        font-weight: 800;
      }

      .voice-toggle.listening,
      .conversation-toggle.active,
      .voice-button.listening {
        color: #031425;
        border-color: rgba(56, 189, 248, 0.8);
        background: linear-gradient(135deg, #38bdf8, #0a84ff);
        box-shadow: 0 0 24px rgba(10, 132, 255, 0.26);
      }

      .voice-status {
        min-height: 34px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(148, 163, 184, 0.12);
        border-radius: 999px;
        padding: 7px 11px;
        color: var(--muted);
        background: rgba(2, 6, 23, 0.42);
        font-size: 12px;
        font-weight: 700;
      }

      .voice-status strong {
        color: #dbeafe;
      }

      .voice-status.error strong {
        color: #fecaca;
      }

      .voice-status.listening strong,
      .voice-status.speaking strong {
        color: #bae6fd;
      }

      .voice-waves {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }

      .voice-waves span {
        width: 3px;
        height: 8px;
        border-radius: 999px;
        background: #38bdf8;
        opacity: 0.55;
        animation: voiceWave 1s ease-in-out infinite;
      }

      .voice-waves span:nth-child(2) { animation-delay: 0.12s; }
      .voice-waves span:nth-child(3) { animation-delay: 0.24s; }

      @keyframes voiceWave {
        0%, 100% { transform: scaleY(0.6); opacity: 0.45; }
        50% { transform: scaleY(1.7); opacity: 1; }
      }

      .composer {
        max-width: 920px;
        min-width: 0;
        margin: 0 auto;
        display: grid;
        grid-template-columns: auto auto minmax(0, 1fr) auto;
        gap: 8px;
        border: 1px solid rgba(56, 189, 248, 0.38);
        border-radius: 18px;
        padding: 9px;
        background: rgba(2, 6, 23, 0.76);
        box-shadow: 0 0 34px rgba(10, 132, 255, 0.11);
      }

      .composer textarea,
      .field,
      .select {
        width: 100%;
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 12px;
        padding: 12px 13px;
        color: var(--text);
        background: rgba(15, 23, 42, 0.72);
        outline: none;
      }

      .composer textarea {
        min-height: 44px;
        max-height: 132px;
        resize: none;
        border: 0;
        background: transparent;
      }

      .composer textarea:focus,
      .field:focus,
      .select:focus {
        border-color: var(--line-strong);
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
      }

      .system-builder-shell {
        position: relative;
        height: calc(100dvh - 122px);
        min-height: 560px;
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        gap: 12px;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }

      .system-builder-history-trigger {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 10;
        opacity: 0.78;
      }

      .system-builder-history-trigger:hover {
        opacity: 1;
      }

      .system-card-actions,
      .system-quick-prompts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .system-builder-chat {
        min-height: 0;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 18px max(8px, calc((100% - 840px) / 2)) 10px;
      }

      .system-builder-empty {
        margin: auto auto 0;
        max-width: 680px;
        text-align: center;
        color: var(--text);
      }

      .system-empty-icon {
        width: 58px;
        height: 58px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        color: #93c5fd;
        background: rgba(10, 132, 255, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.24);
        box-shadow: 0 0 34px rgba(10, 132, 255, 0.16);
      }

      .system-builder-empty h2 {
        margin: 16px 0 8px;
        font-size: clamp(32px, 6vw, 56px);
        line-height: 1.02;
      }

      .system-builder-empty p {
        margin: 0;
        color: var(--muted);
      }

      .system-quick-prompts {
        justify-content: center;
        margin-top: 24px;
      }

      .system-quick-prompt {
        border: 1px solid rgba(56, 189, 248, 0.18);
        border-radius: 999px;
        padding: 10px 14px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.62);
      }

      .system-chat-row {
        display: flex;
        gap: 12px;
        align-items: flex-end;
        max-width: min(760px, 92%);
      }

      .system-chat-row.user {
        align-self: flex-end;
        justify-content: flex-end;
      }

      .system-chat-row.assistant {
        align-self: flex-start;
      }

      .system-chat-bubble {
        border: 1px solid rgba(148, 163, 184, 0.13);
        border-radius: 16px;
        padding: 14px 16px;
        background: rgba(15, 23, 42, 0.78);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
      }

      .system-chat-row.user .system-chat-bubble {
        background: linear-gradient(135deg, #0A84FF, #1E40AF);
        border-color: rgba(56, 189, 248, 0.44);
      }

      .system-chat-time {
        display: block;
        margin-top: 8px;
        color: rgba(226, 232, 240, 0.62);
        font-size: 12px;
        text-align: right;
      }

      .system-builder-card {
        align-self: flex-start;
        width: min(100%, 640px);
        display: grid;
        gap: 12px;
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 16px;
        padding: 14px;
        background:
          radial-gradient(circle at 12% 10%, rgba(56, 189, 248, 0.08), transparent 30%),
          rgba(15, 23, 42, 0.86);
        box-shadow: 0 18px 56px rgba(0, 0, 0, 0.22);
      }

      .system-builder-card h3,
      .system-builder-card p {
        margin: 0;
      }

      .system-builder-status {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        color: var(--muted);
      }

      .system-builder-status span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgba(56, 189, 248, 0.14);
        border-radius: 999px;
        padding: 6px 9px;
        background: rgba(2, 6, 23, 0.38);
      }

      .system-summary-list {
        display: grid;
        gap: 6px;
        margin: 0;
        padding: 0;
        list-style: none;
        color: #dbeafe;
        font-size: 14px;
      }

      .system-summary-list li::before {
        content: "✓";
        color: #22c55e;
        margin-right: 8px;
      }

      .system-card-actions .button,
      .system-card-actions .primary-action {
        flex: 1 1 120px;
        min-height: 40px;
      }

      .system-card-actions .system-open-main {
        flex-basis: 100%;
      }

      .system-builder-composer {
        width: min(100%, 840px);
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: end;
        border: 1px solid rgba(56, 189, 248, 0.32);
        border-radius: 18px;
        padding: 10px;
        background: rgba(2, 6, 23, 0.82);
        box-shadow: 0 0 34px rgba(10, 132, 255, 0.1);
      }

      .system-builder-composer textarea {
        width: 100%;
        min-height: 50px;
        max-height: 140px;
        resize: none;
        border: 0;
        outline: 0;
        color: var(--text);
        background: transparent;
      }

      .system-history-drawer {
        position: absolute;
        inset: 0 auto 0 0;
        z-index: 12;
        width: min(360px, 92vw);
        display: grid;
        align-content: start;
        gap: 12px;
        padding: 18px;
        border-right: 1px solid rgba(56, 189, 248, 0.18);
        background: rgba(2, 6, 23, 0.96);
        box-shadow: 28px 0 80px rgba(0, 0, 0, 0.36);
      }

      .system-history-drawer[hidden] {
        display: none;
      }

      .floating-menu,
      .attach-menu {
        position: absolute;
        z-index: 40;
        display: none;
        width: min(310px, calc(100vw - 28px));
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 8px;
        background: rgba(2, 6, 23, 0.96);
        box-shadow: 0 22px 70px rgba(0, 0, 0, 0.42), 0 0 30px rgba(56, 189, 248, 0.09);
        backdrop-filter: blur(18px);
      }

      .floating-menu[hidden],
      .attach-menu[hidden] {
        display: none !important;
      }

      .floating-menu {
        max-height: min(520px, calc(100vh - 120px));
        overflow: auto;
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
        transform: translateY(-4px);
        transition: opacity 140ms ease, transform 140ms ease, visibility 140ms ease;
      }

      .floating-menu.open,
      .attach-menu.open {
        display: grid;
      }

      .floating-menu.open {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }

      .floating-menu {
        top: 52px;
        right: 0;
        gap: 4px;
      }

      .attach-menu {
        left: 0;
        bottom: 64px;
        gap: 4px;
      }

      .attachment-preview {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 11px;
        margin-bottom: 10px;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2);
      }

      .attachment-preview[hidden] {
        display: none;
      }

      .menu-item {
        min-height: 42px;
        display: flex;
        align-items: center;
        gap: 11px;
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 10px;
        color: #e5f3ff;
        background: transparent;
        text-align: left;
        font-weight: 650;
      }

      .layout-grid,
      .settings-grid {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
        gap: 18px;
      }

      .documents-layout {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(320px, 0.78fr) minmax(0, 1.22fr);
        gap: 18px;
      }

      .dashboard-grid {
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
      }

      .panel,
      .card {
        min-width: 0;
        max-width: 100%;
        overflow-wrap: anywhere;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--panel);
        box-shadow: 0 22px 66px rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(18px);
      }

      .panel {
        display: grid;
        gap: 14px;
        padding: clamp(18px, 3vw, 26px);
      }

      .card {
        display: grid;
        gap: 10px;
        padding: 16px;
      }

      .compact-card {
        background: rgba(2, 6, 23, 0.28);
      }

      .project-workspace {
        display: grid;
        gap: 12px;
      }

      .project-workspace[hidden] {
        display: none;
      }

      .inline-form {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 10px;
        align-items: center;
      }

      .note-form {
        display: grid;
        gap: 10px;
      }

      .task-title.done {
        color: var(--muted);
        text-decoration: line-through;
      }

      .audio-preview,
      .audio-player {
        width: 100%;
        min-width: 180px;
      }

      .card h2,
      .panel h2 {
        margin: 0;
        color: #e0f2fe;
        font-size: 20px;
      }

      .project-toolbar,
      .row {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .project-toolbar {
        justify-content: space-between;
      }

      .list {
        display: grid;
        gap: 12px;
      }

      .list-item {
        min-width: 0;
        max-width: 100%;
        display: grid;
        gap: 9px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 15px;
        padding: 14px;
        background: rgba(2, 6, 23, 0.32);
      }

      .item-top {
        min-width: 0;
        max-width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }

      .item-top strong {
        color: #e0f2fe;
      }

      .result-box,
      .project-detail {
        min-width: 0;
        max-width: 100%;
        min-height: 240px;
        max-height: 560px;
        overflow: auto;
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 14px;
        padding: 16px;
        background: rgba(2, 6, 23, 0.36);
        white-space: pre-wrap;
        line-height: 1.7;
      }

      .tabs {
        min-width: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tab {
        flex: 0 0 auto;
        min-height: 38px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 999px;
        padding: 8px 12px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.56);
        font-weight: 700;
      }

      .tab.active {
        color: #031425;
        border-color: rgba(56, 189, 248, 0.78);
        background: linear-gradient(135deg, #38bdf8, #0a84ff);
      }

      .settings-pane[hidden] {
        display: none;
      }

      .settings-hero {
        min-width: 0;
        max-width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 20px;
        padding: clamp(18px, 3vw, 26px);
        background:
          radial-gradient(circle at 18% 10%, rgba(56, 189, 248, 0.12), transparent 24rem),
          rgba(15, 23, 42, 0.7);
      }

      .settings-hero h2 {
        margin: 0 0 8px;
        font-size: clamp(28px, 4vw, 44px);
      }

      .settings-metric {
        min-width: 178px;
        max-width: 100%;
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 16px;
        padding: 14px;
        background: rgba(2, 6, 23, 0.36);
      }

      .settings-metric strong {
        display: block;
        font-size: 24px;
      }

      .settings-card-grid {
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .option-grid {
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      .option-button {
        min-height: 42px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        border-radius: 12px;
        padding: 10px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.56);
        font-weight: 700;
      }

      .option-button.active {
        color: #031425;
        border-color: rgba(56, 189, 248, 0.82);
        background: linear-gradient(135deg, #38bdf8, #0a84ff);
      }

      .toggle-row {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 14px;
        padding: 13px;
        background: rgba(2, 6, 23, 0.28);
      }

      .toggle {
        width: 48px;
        height: 26px;
        position: relative;
        border: 1px solid rgba(56, 189, 248, 0.26);
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.9);
      }

      .toggle::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: #94a3b8;
        transition: transform 160ms ease, background 160ms ease;
      }

      .toggle.active::after {
        transform: translateX(21px);
        background: #38bdf8;
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
      }

      .storage {
        height: 12px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.18);
        border-radius: 999px;
        background: rgba(2, 6, 23, 0.72);
      }

      .storage span {
        display: block;
        height: 100%;
        width: 37%;
        border-radius: inherit;
        background: linear-gradient(90deg, #0a84ff, #38bdf8);
      }

      .danger-zone {
        border-color: rgba(251, 113, 133, 0.3);
        background: rgba(127, 29, 29, 0.12);
      }

      .toast {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 60;
        max-width: 390px;
        display: none;
        border: 1px solid var(--line-strong);
        border-radius: 14px;
        padding: 13px 15px;
        color: #e0f2fe;
        background: rgba(2, 6, 23, 0.94);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
      }

      .toast.show {
        display: block;
      }

      .diagnostic-panel {
        position: fixed;
        right: 18px;
        bottom: 78px;
        z-index: 120;
        display: none;
        width: min(420px, calc(100vw - 32px));
        border: 1px solid rgba(248, 113, 113, 0.34);
        border-radius: 16px;
        padding: 14px;
        color: #fee2e2;
        background: rgba(24, 9, 16, 0.94);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
        backdrop-filter: blur(18px);
      }

      .diagnostic-panel.open {
        display: block;
      }

      .diagnostic-panel h2 {
        margin: 0 0 8px;
        font-size: 15px;
      }

      .diagnostic-panel dl {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr);
        gap: 6px 10px;
        margin: 0;
        font-size: 12px;
      }

      .diagnostic-panel dt {
        color: #fecaca;
        font-weight: 800;
      }

      .diagnostic-panel dd {
        min-width: 0;
        margin: 0;
        overflow-wrap: anywhere;
        color: #ffe4e6;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 55;
        display: none;
        place-items: center;
        padding: 18px;
        background: rgba(2, 6, 23, 0.74);
        backdrop-filter: blur(16px);
      }

      .modal-overlay.open {
        display: grid;
      }

      .modal {
        width: min(620px, 100%);
        border: 1px solid var(--line-strong);
        border-radius: 20px;
        padding: 20px;
        background: rgba(8, 17, 32, 0.96);
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.48);
      }

      .modal-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .modal h2 {
        margin: 0 0 6px;
      }

      @media (min-width: 1440px) {
        .app-shell { grid-template-columns: 320px minmax(0, 1fr); }
        .chat-view { width: min(100%, 1180px); margin: 0 auto; }
        .message { max-width: min(820px, 82%); }
      }

      @media (min-width: 1025px) {
        .view { width: 100%; }
        .chat-view { width: min(100%, 1080px); margin: 0 auto; }
      }

      @media (max-width: 1023px) {
        body { overflow: hidden; }
        .app-shell { height: 100dvh; grid-template-columns: minmax(0, 1fr); }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          width: min(86vw, 340px);
          max-width: calc(100vw - 20px);
          max-height: 100dvh;
          overflow: hidden;
          transform: translateX(-104%);
          border-right: 1px solid var(--line);
          border-bottom: 0;
          transition: transform 180ms ease;
          box-shadow: 28px 0 70px rgba(0, 0, 0, 0.34);
        }
        .mobile-toggle { display: inline-flex; }
        .topbar-menu-toggle { flex: 0 0 42px; }
        .sidebar-body {
          display: flex;
          overflow-y: auto;
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
        .sidebar.open {
          z-index: 60;
          transform: translateX(0);
        }
        .main {
          width: 100vw;
          height: 100dvh;
          min-width: 0;
          max-width: 100vw;
        }
        .topbar {
          min-height: 64px;
          align-items: center;
          flex-direction: row;
          padding: 10px 12px;
        }
        .topbar-title { align-items: center; gap: 10px; }
        .topbar h1 { font-size: 18px; }
        .topbar p { display: none; }
        .status { padding: 7px 9px; font-size: 0; }
        .status::after { content: "Ativo"; font-size: 12px; }
        .model-select { max-width: 128px; }
        .layout-grid,
        .settings-grid,
        .documents-layout { grid-template-columns: 1fr; }
        .settings-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .inline-form { grid-template-columns: 1fr; }
        .chat-view {
          width: 100%;
          margin: 0;
        }
        .messages {
          padding-inline: 4px;
        }
        .message {
          max-width: 90%;
        }
        .floating-menu.open,
        .attach-menu.open {
          position: fixed;
          inset: auto 10px max(10px, env(safe-area-inset-bottom)) 10px;
          z-index: 70;
          width: auto;
          max-height: calc(100dvh - 120px);
          overflow: auto;
          border-radius: 20px 20px 18px 18px;
          padding: 10px;
          animation: sheetIn 150ms ease-out;
        }
        .floating-menu.open::before,
        .attach-menu.open::before {
          content: "";
          width: 42px;
          height: 4px;
          justify-self: center;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.44);
          margin: 2px 0 6px;
        }
        .attach-menu.open {
          bottom: max(88px, calc(env(safe-area-inset-bottom) + 88px));
          left: 10px;
          right: 10px;
        }
        .tabs {
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 4px;
          scroll-snap-type: x proximity;
        }
        .tab { min-height: 42px; scroll-snap-align: start; }
        .item-top,
        .toggle-row { flex-wrap: wrap; }
      }

      @media (max-width: 860px) {
        .sidebar { width: min(88vw, 340px); max-width: calc(100vw - 18px); }
      }

      @keyframes sheetIn {
        from { transform: translateY(14px); opacity: 0.7; }
        to { transform: translateY(0); opacity: 1; }
      }

      @media (max-width: 640px) {
        .sidebar,
        .view,
        .topbar { padding: 14px; }
        .view { padding-bottom: max(18px, env(safe-area-inset-bottom)); }
        .chat-view { padding: 8px 10px 10px; gap: 8px; }
        .messages { gap: 14px; padding-bottom: 4px; }
        .composer-wrap { padding-top: 6px; padding-bottom: max(8px, env(safe-area-inset-bottom)); }
        .composer-tools {
          margin-bottom: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .composer-tools > * { flex: 0 0 auto; }
        .composer { grid-template-columns: auto auto minmax(0, 1fr) auto; border-radius: 16px; gap: 6px; padding: 7px; }
        .composer .primary-action { width: 44px; min-width: 44px; padding: 0; font-size: 0; }
        .composer .primary-action svg { margin: 0; }
        .composer textarea { max-height: 96px; }
        .message { max-width: 100%; }
        .message.user { max-width: 90%; }
        .message.assistant { max-width: calc(90% - 38px); margin-left: 38px; }
        .message-avatar { left: -38px; width: 30px; height: 30px; }
        .typing-indicator { font-size: 13px; }
        .button,
        .primary-action { width: 100%; min-height: 44px; }
        .icon-button { flex: 0 0 42px; }
        .topbar-actions { gap: 8px; }
        .topbar-actions .status { display: none; }
        .topbar-title { min-width: 0; }
        .topbar-title > div { min-width: 0; }
        .topbar h1 {
          max-width: 52vw;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .project-toolbar,
        .row { align-items: stretch; flex-direction: column; }
        .row > *,
        .project-toolbar > * { width: 100%; }
        .system-builder-shell {
          min-height: calc(100dvh - 96px);
          border-radius: 0;
          margin: -14px;
          padding: 14px;
        }
        .system-builder-chat {
          padding-inline: 0;
        }
        .system-chat-row,
        .system-builder-card {
          max-width: 100%;
          width: 100%;
        }
        .system-chat-row.user {
          max-width: 90%;
          width: auto;
        }
        .system-builder-composer {
          grid-template-columns: minmax(0, 1fr) auto;
          border-radius: 16px;
        }
        .system-builder-composer .primary-action {
          width: 44px;
          min-width: 44px;
          padding: 0;
          font-size: 0;
        }
        .system-builder-composer .primary-action svg {
          margin: 0;
        }
        .system-history-drawer {
          position: fixed;
          inset: 0 0 0 auto;
          width: min(92vw, 360px);
          z-index: 80;
        }
        .settings-hero { align-items: flex-start; flex-direction: column; }
        .settings-card-grid,
        .option-grid,
        .dashboard-grid { grid-template-columns: 1fr; }
        .settings-metric { width: 100%; min-width: 0; }
        .modal {
          width: calc(100vw - 24px);
          max-height: calc(100dvh - 24px);
          overflow: auto;
        }
        .toast {
          right: 12px;
          left: 12px;
          bottom: max(12px, env(safe-area-inset-bottom));
          max-width: none;
        }
        .diagnostic-panel {
          right: 12px;
          left: 12px;
          bottom: max(12px, env(safe-area-inset-bottom));
          width: auto;
        }
        .empty-chat h2 { font-size: 26px; }
        .empty-chat p,
        .quick-prompts,
        .empty-brand { display: none; }
        .quick-prompt { flex: 0 1 auto; min-height: 34px; padding: 7px 10px; font-size: 12px; }
        .attachment-card,
        .attachment-preview { grid-template-columns: auto minmax(0, 1fr); }
        .attachment-card .button,
        .attachment-preview .icon-button { grid-column: 1 / -1; width: 100%; }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: 0.001ms !important;
        }

        .message,
        .message.assistant {
          animation: none !important;
        }

        .message.thinking::after,
        .typing-cursor,
        .send-spinner {
          animation: none !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand-row">
          ${renderLogoYara({ variant: "complete", tagline: "Plataforma inteligente" })}
          <button class="icon-button mobile-toggle" id="mobileToggle" data-sidebar-toggle type="button" aria-label="Fechar menu" aria-expanded="false">${icon("menu")}</button>
        </div>
        <div class="sidebar-body">
          <button class="primary-action" id="newConversationButton" type="button">${icon("plus")}Nova conversa</button>
          <nav class="nav" aria-label="Navegação">
            ${navButton("chat", "Chat", "chat", true)}
            ${navButton("generator", "Gerador de Sistemas", "code")}
            ${navButton("systems", "Sistemas", "code")}
            ${navButton("agents", "Agentes", "brain")}
            ${navButton("projects", "Projetos", "folder")}
            ${navButton("technicalProjects", "Projetos Técnicos", "code")}
            ${navButton("smartProjects", "Projetos Inteligentes", "brain")}
            ${navButton("knowledge", "Conhecimento", "sparkles")}
            ${navButton("smartSearch", "Busca Inteligente", "search")}
            ${navButton("consolidatedMemory", "Memória Consolidada", "brain")}
            ${navButton("documents", "Documentos", "file")}
            ${navButton("files", "Arquivos", "paperclip")}
            ${navButton("images", "Imagens", "image")}
            ${navButton("calendar", "Agenda", "history")}
            ${navButton("integrations", "Integrações", "share")}
            ${navButton("automations", "Automações", "sparkles")}
            ${navButton("marketplace", "Marketplace", "sparkles")}
            ${navButton("audit", "Auditoria", "shield")}
            ${navButton("memory", "Memória da YARA", "brain")}
            ${navButton("settings", "Configurações", "settings")}
          </nav>
          <article class="account">
            <div class="account-row">
              <span class="avatar">AI</span>
              <div>
                <strong>Plano atual</strong>
                <span>Essencial · Workspace ativo</span>
              </div>
            </div>
          </article>
          <p class="section-title">Fixadas</p>
          <div class="conversation-list" id="pinnedList"></div>
          <p class="section-title">Histórico</p>
          <div class="conversation-list" id="conversationList"></div>
          <section class="account">
            <div class="account-row">
              <span class="avatar" id="accountAvatar">YA</span>
              <div>
                <strong id="accountName">Usuário</strong>
                <span id="accountEmail">Conta YARA</span>
              </div>
            </div>
            <div class="sidebar-footer">
              <button class="button" id="sidebarSettingsButton" type="button">${icon("settings")}Configurações</button>
              <button class="button" id="helpButton" type="button">${icon("sparkles")}Ajuda e suporte</button>
              <button class="button" id="termsButton" type="button">${icon("shield")}Termos e privacidade</button>
              <button class="button danger" id="logoutButton" type="button">${icon("logout")}Sair</button>
            </div>
          </section>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <button class="icon-button mobile-toggle topbar-menu-toggle" id="mobileTopbarToggle" data-sidebar-toggle type="button" aria-label="Abrir menu" aria-expanded="false">${icon("menu")}</button>
          <div class="topbar-title">
            ${renderLogoYara({ variant: "compact", className: "logo-yara--topbar" })}
            <div>
              <h1 id="pageTitle">YARA AI</h1>
              <p id="pageSubtitle">Sua inteligência. Sem limites.</p>
            </div>
          </div>
          <div class="topbar-actions">
            <select class="model-select" id="modelSelect" aria-label="Modelo da YARA">
              <option>Modelo ativo</option>
            </select>
            <div class="status"><span class="dot"></span>Ativo</div>
            <button class="icon-button" id="quickSettingsButton" type="button" aria-label="Configurações rápidas">${icon("settings")}</button>
            <button class="icon-button" id="chatMenuButton" type="button" aria-label="Ações da conversa" aria-haspopup="menu" aria-expanded="false" aria-controls="chatActionMenu">${icon("dots")}</button>
            <div class="floating-menu" id="chatActionMenu" role="menu" hidden>
              ${menuButton("shareConversation", "Compartilhar", "share")}
              ${menuButton("pinConversation", "Fixar", "pin")}
              ${menuButton("filesConversation", "Arquivos enviados", "file")}
              ${menuButton("searchConversation", "Buscar no chat", "search")}
              ${menuButton("searchHistory", "Histórico de pesquisas", "history")}
              ${menuButton("projectConversation", "Adicionar ao projeto", "folder")}
              ${menuButton("archiveConversation", "Arquivar", "archive")}
              ${menuButton("deleteConversation", "Excluir", "trash", true)}
            </div>
          </div>
        </header>

        <section class="view" id="view-dashboard" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Dashboard YARA</h2>
                <p class="muted">Acompanhe sua atividade, projetos, arquivos e tarefas em um único espaço.</p>
              </div>
              <button class="button" id="refreshDashboardButton" type="button">${icon("sparkles")}Atualizar</button>
            </div>
            <div class="dashboard-grid" id="dashboardStats"></div>
            <div class="layout-grid">
              <article class="card">
                <div class="item-top">
                  <h2>Resumo do dia</h2>
                  <button class="button" data-view-target="calendar" type="button">${icon("history")}Agenda</button>
                </div>
                <div class="list" id="dashboardToday"></div>
              </article>
              <article class="card">
                <div class="item-top">
                  <h2>Documentos recentes</h2>
                  <button class="button" data-view-target="documents" type="button">${icon("file")}Abrir documentos</button>
                </div>
                <div class="list" id="dashboardDocuments"></div>
              </article>
            </div>
            <div class="layout-grid">
              <article class="card">
                <div class="item-top">
                  <h2>Últimos projetos</h2>
                  <button class="button" data-view-target="projects" type="button">${icon("folder")}Abrir projetos</button>
                </div>
                <div class="list" id="dashboardProjects"></div>
              </article>
              <article class="card">
                <div class="item-top">
                  <h2>Tarefas em andamento</h2>
                  <button class="button" data-view-target="projects" type="button">${icon("save")}Gerenciar</button>
                </div>
                <div class="list" id="dashboardTasks"></div>
              </article>
            </div>
            <article class="card">
              <h2>Próximas ações sugeridas</h2>
              <div class="list" id="dashboardSuggestions"></div>
            </article>
            <article class="card">
              <h2>Últimas conversas</h2>
              <div class="list" id="dashboardConversations"></div>
            </article>
          </div>
        </section>

        <section class="view chat-view" id="view-chat">
          <div class="search-row" id="chatSearchRow">
            <input class="field" id="chatSearchInput" placeholder="Buscar nesta conversa..." />
            <button class="button" id="closeSearchButton" type="button">Fechar</button>
          </div>
          <div class="messages" id="messages">
            <div class="empty-chat">
              <h2>Como posso ajudar você hoje?</h2>
            </div>
          </div>
          <div class="composer-wrap">
            <div class="attach-menu" id="attachMenu">
              ${menuButton("attachGallery", "Foto da galeria", "image")}
              ${menuButton("attachImage", "Imagem", "image")}
              ${menuButton("attachDocument", "Documento", "file")}
              ${menuButton("attachPdf", "PDF", "file")}
              ${menuButton("attachCamera", "Tirar foto", "camera")}
              ${menuButton("attachAudio", "Gravar áudio", "mic")}
            </div>
            <input id="fileInputImages" type="file" accept="image/*" hidden />
            <input id="fileInputDocument" type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden />
            <input id="fileInputPdf" type="file" accept="application/pdf,.pdf" hidden />
            <input id="fileInputCamera" type="file" accept="image/*" capture="environment" hidden />
            <div class="attachment-preview" id="attachmentPreview" hidden></div>
            <div class="composer-tools">
              <button class="web-search-toggle" id="webSearchToggle" type="button">${icon("search")}Pesquisar na web</button>
              <button class="conversation-toggle" id="conversationModeButton" type="button">${icon("mic")}Conversar com YARA</button>
              <span class="voice-status" id="voiceStatus" role="status" aria-live="polite"><span class="voice-waves" aria-hidden="true"><span></span><span></span><span></span></span><strong>Voz pronta</strong></span>
            </div>
            <form class="composer" id="chatForm">
              <button class="icon-button" id="attachButton" type="button" aria-label="Anexar arquivo">${icon("paperclip")}</button>
              <button class="icon-button voice-button" id="dictationButton" type="button" aria-label="Ditar mensagem">${icon("mic")}</button>
              <textarea id="messageInput" placeholder="Mensagem para YARA..." rows="1" autocomplete="off"></textarea>
              <button class="primary-action" id="sendButton" type="submit" aria-label="Enviar mensagem">${icon("send")}Enviar</button>
            </form>
          </div>
        </section>

        <section class="view" id="view-generator" hidden>
          <div class="layout-grid">
            <form class="panel" id="generatorForm">
              <h2>Gerador de Sistemas</h2>
              <p class="muted">Descreva o produto. A YARA organiza tecnologias, telas, APIs, banco de dados e próximos passos, salvando tudo em Projetos.</p>
              <select class="select" id="systemType">
                <option>Criar Web App</option>
                <option>Criar API REST</option>
                <option>Criar Dashboard</option>
                <option>Criar Banco de Dados</option>
                <option>Criar Mobile App</option>
                <option>Automação</option>
              </select>
              <textarea class="field" id="generatorPrompt" rows="9" placeholder="Exemplo: Quero um sistema de estoque com login, cadastro de produtos, alertas e painel administrativo."></textarea>
              <button class="primary-action" type="submit">${icon("sparkles")}Gerar sistema</button>
            </form>
            <article class="panel">
              <h2>Projeto gerado</h2>
              <div class="result-box" id="generatorResult">O plano estruturado aparecerá aqui e será salvo automaticamente em Meus Projetos.</div>
              <div class="row">
                <button class="button" id="openGeneratedProject" type="button">${icon("folder")}Abrir projeto</button>
                <button class="button" id="continueGeneratedChat" type="button">${icon("chat")}Continuar com a YARA</button>
              </div>
            </article>
          </div>
        </section>

        <section class="view" id="view-systems" hidden>
          <div class="system-builder-shell">
            <button class="icon-button system-builder-history-trigger" id="systemsHistoryButton" type="button" aria-label="Histórico de Sistemas">${icon("history")}</button>
            <aside class="system-history-drawer" id="systemsHistoryDrawer" aria-label="Histórico de Sistemas" hidden>
              <div class="item-top">
                <div>
                  <h2>Histórico de Sistemas</h2>
                  <p class="muted" id="systemsCount">0 sistemas</p>
                </div>
                <button class="icon-button" id="systemsHistoryClose" type="button" aria-label="Fechar histórico">${icon("close")}</button>
              </div>
              <div class="list" id="systemsList"></div>
            </aside>
            <div class="system-builder-chat" id="systemChatMessages">
              <div class="system-builder-empty">
                <span class="system-empty-icon">${icon("sparkles")}</span>
                <h2>Criador de Sistemas</h2>
                <p>Converse com a YARA e descreva o que deseja criar.</p>
                <div class="system-quick-prompts">
                  <button class="system-quick-prompt" data-system-prompt="Crie um CRM" type="button">Crie um CRM</button>
                  <button class="system-quick-prompt" data-system-prompt="Crie um aplicativo de investimentos" type="button">Crie um aplicativo de investimentos</button>
                  <button class="system-quick-prompt" data-system-prompt="Crie um ERP para construtora" type="button">Crie um ERP para construtora</button>
                  <button class="system-quick-prompt" data-system-prompt="Crie um sistema de estoque" type="button">Crie um sistema de estoque</button>
                </div>
              </div>
            </div>
            <form class="system-builder-composer" id="systemChatForm">
              <textarea id="systemChatInput" rows="2" maxlength="4000" placeholder="Descreva o sistema que deseja criar..."></textarea>
              <button class="primary-action" id="systemChatSendButton" type="submit">${icon("send")}Enviar</button>
            </form>
          </div>
        </section>

        <section class="view" id="view-agents" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Agentes Inteligentes</h2>
                <p class="muted">Agentes especializados com histórico, memória própria, roteamento automático e colaboração.</p>
              </div>
              <button class="button" id="refreshAgentsButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="dashboard-grid" id="agentsDashboard"></div>
            <div class="layout-grid">
              <article class="card">
                <div class="item-top">
                  <h2>Todos os Agentes</h2>
                  <span class="status"><span class="dot"></span><span id="agentsCount">0 agentes</span></span>
                </div>
                <div class="list" id="agentsList"></div>
                <form class="form" id="agentForm">
                  <h2>Criar agente</h2>
                  <input class="field" id="agentName" placeholder="Nome" />
                  <input class="field" id="agentSpecialty" placeholder="Especialidade" />
                  <textarea class="field" id="agentDescription" rows="2" placeholder="Descrição"></textarea>
                  <textarea class="field" id="agentPrompt" rows="3" placeholder="Prompt base"></textarea>
                  <button class="button" type="submit">${icon("save")}Salvar agente</button>
                </form>
              </article>
              <article class="card">
                <div class="item-top">
                  <div>
                    <h2>Chat de Agentes</h2>
                    <p class="muted">Escolha manualmente ou deixe a YARA rotear para o agente certo.</p>
                  </div>
                  <select class="select" id="agentSelect"></select>
                </div>
                <div class="messages system-chat-messages" id="agentChatMessages">
                  <div class="empty-chat"><h2>Qual agente deve ajudar?</h2></div>
                </div>
                <form class="composer system-composer" id="agentChatForm">
                  <textarea id="agentChatInput" rows="2" maxlength="4000" placeholder="Ex.: Analise este contrato, faça um orçamento, crie uma campanha..."></textarea>
                  <button class="primary-action" id="agentChatSendButton" type="submit">${icon("send")}Enviar</button>
                </form>
              </article>
            </div>
            <div class="layout-grid">
              <article class="card">
                <h2>Conversas</h2>
                <div class="list" id="agentConversations"></div>
              </article>
              <article class="card">
                <h2>Colaboração</h2>
                <form class="form" id="agentCollaborationForm">
                  <select class="select" id="agentSourceSelect"></select>
                  <select class="select" id="agentTargetSelect"></select>
                  <textarea class="field" id="agentCollaborationRequest" rows="3" placeholder="Ex.: Engenharia consulte Financeiro para orçamento preliminar."></textarea>
                  <button class="button" type="submit">${icon("share")}Consultar agente</button>
                </form>
                <div class="result-box" id="agentCollaborationResult">A colaboração aparecerá aqui.</div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-projects" hidden>
          <div class="panel">
            <div class="project-toolbar">
              <div>
                <h2>Meus Projetos</h2>
                <p class="muted">Projetos gerados e ideias salvas em um espaço conectado ao chat.</p>
              </div>
              <input class="field" id="projectSearch" placeholder="Buscar projeto..." />
            </div>
            <div class="layout-grid">
              <div class="list">
                <form class="card compact-card note-form" id="projectCreateForm">
                  <h2>Criar projeto</h2>
                  <input class="field" id="projectCreateName" placeholder="Nome do projeto" />
                  <textarea class="field" id="projectCreateDescription" rows="3" placeholder="Objetivo, contexto ou descrição curta..."></textarea>
                  <button class="primary-action" type="submit">${icon("plus")}Criar projeto</button>
                </form>
                <div class="list" id="projectList"></div>
              </div>
              <article class="card">
                <h2 id="projectDetailTitle">Selecione um projeto</h2>
                <p class="muted" id="projectDetailDescription">Abra um projeto para ver detalhes, continuar no chat ou excluir.</p>
                <div class="project-detail" id="projectDetail">Nenhum projeto selecionado.</div>
                <div class="project-workspace" id="projectWorkspace" hidden>
                  <article class="card compact-card">
                    <div class="item-top">
                      <h2>Tarefas</h2>
                      <span class="status"><span class="dot"></span>Projeto ativo</span>
                    </div>
                    <form class="inline-form" id="projectTaskForm">
                      <input class="field" id="projectTaskTitle" placeholder="Nova tarefa do projeto" />
                      <input class="field" id="projectTaskDueDate" type="date" />
                      <select class="select" id="projectTaskPriority">
                        <option value="medium">Prioridade média</option>
                        <option value="high">Prioridade alta</option>
                        <option value="low">Prioridade baixa</option>
                      </select>
                      <button class="button" type="submit">${icon("plus")}Adicionar</button>
                    </form>
                    <div class="list" id="projectTaskList"></div>
                  </article>
                  <article class="card compact-card">
                    <h2>Notas</h2>
                    <form class="note-form" id="projectNoteForm">
                      <textarea class="field" id="projectNoteContent" placeholder="Registre uma decisão, referência ou próximo passo..." rows="3"></textarea>
                      <button class="button" type="submit">${icon("save")}Salvar nota</button>
                    </form>
                    <div class="list" id="projectNoteList"></div>
                  </article>
                  <article class="card compact-card">
                    <div class="item-top">
                      <h2>Arquivos vinculados</h2>
                      <button class="button" id="refreshProjectFilesButton" type="button">${icon("file")}Atualizar</button>
                    </div>
                    <div class="inline-form">
                      <select class="select" id="projectUploadSelect"></select>
                      <button class="button" id="linkProjectFileButton" type="button">${icon("paperclip")}Vincular arquivo</button>
                    </div>
                    <div class="list" id="projectFileList"></div>
                  </article>
                  <article class="card compact-card">
                    <h2>Conversas vinculadas</h2>
                    <div class="list" id="projectConversationList"></div>
                  </article>
                  <article class="card compact-card">
                    <h2>Histórico do projeto</h2>
                    <div class="list" id="projectHistoryList"></div>
                  </article>
                </div>
                <div class="row">
                  <button class="button" id="continueProjectButton" type="button">${icon("chat")}Continuar com a YARA</button>
                  <button class="button" id="editProjectButton" type="button">${icon("save")}Editar projeto</button>
                  <button class="button" id="archiveProjectButton" type="button">${icon("archive")}Arquivar</button>
                  <button class="button danger" id="deleteProjectButton" type="button">${icon("trash")}Excluir projeto</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-technicalProjects" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Projetos Técnicos</h2>
                <p class="muted">Área independente para engenharia, arquitetura, inspeção, manutenção, obras, layouts industriais e relatórios técnicos.</p>
              </div>
              <div class="row">
                <button class="button" id="refreshTechnicalProjectsButton" type="button">${icon("history")}Atualizar</button>
                <button class="primary-action" id="newTechnicalProjectButton" type="button">${icon("code")}Novo projeto</button>
              </div>
            </div>
            <div class="dashboard-grid" id="technicalStats"></div>
            <div class="documents-layout">
              <article class="card">
                <h2>Chat Técnico</h2>
                <p class="muted">Histórico e contexto separados do chat principal, com memória técnica própria.</p>
                <form class="form" id="technicalChatForm">
                  <select class="select" id="technicalChatProjectSelect"></select>
                  <textarea class="field" id="technicalChatMessage" rows="5" placeholder="Ex.: faça uma inspeção desta obra, gere um layout industrial ou calcule materiais preliminares"></textarea>
                  <button class="primary-action" type="submit">${icon("chat")}Enviar ao Chat Técnico</button>
                </form>
                <div class="list" id="technicalChatMessages"></div>
              </article>
              <article class="card">
                <h2>Criar projeto técnico</h2>
                <form class="form" id="technicalProjectForm">
                  <input class="field" id="technicalProjectTitle" placeholder="Título do projeto" />
                  <select class="select" id="technicalProjectType">
                    <option value="">YARA decide o tipo automaticamente</option>
                    <option value="planta_baixa_inicial">Planta baixa inicial</option>
                    <option value="layout_industrial">Layout industrial</option>
                    <option value="projeto_eletrico_basico">Projeto elétrico básico</option>
                    <option value="projeto_hidraulico_basico">Projeto hidráulico básico</option>
                    <option value="projeto_iluminacao_basico">Projeto de iluminação básico</option>
                    <option value="fechamento_gradil">Fechamento com gradil</option>
                    <option value="inspecao_tecnica">Inspeção técnica</option>
                  </select>
                  <input class="field" id="technicalProjectLocation" placeholder="Local ou setor" />
                  <textarea class="field" id="technicalProjectDescription" rows="7" placeholder="Descreva medidas, fotos enviadas, observações, finalidade, problemas encontrados ou premissas"></textarea>
                  <button class="primary-action" type="submit">${icon("save")}Criar projeto técnico</button>
                </form>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Projetos</h2>
                <div class="list" id="technicalProjectsList"></div>
              </article>
              <article class="card">
                <h2>Projeto selecionado</h2>
                <div id="technicalProjectDetail" class="result-box">Selecione um projeto técnico para visualizar escopo, inspeções, arquivos e relatórios.</div>
                <div class="row">
                  <button class="button" id="technicalExportTxtButton" type="button">TXT</button>
                  <button class="button" id="technicalExportPdfButton" type="button">PDF</button>
                  <button class="button" id="technicalExportDocxButton" type="button">DOCX</button>
                  <button class="button" id="technicalExportDxfButton" type="button">DXF</button>
                  <button class="button" id="technicalExportDwgButton" type="button">DWG</button>
                  <button class="button" id="technicalExportIfcButton" type="button">IFC</button>
                  <button class="button danger" id="deleteTechnicalProjectButton" type="button">${icon("trash")}Excluir</button>
                </div>
                <div class="list" id="technicalExportsList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Inspeção inteligente</h2>
                <form class="form" id="technicalInspectionForm">
                  <input class="field" id="technicalInspectionTitle" placeholder="Título da inspeção" />
                  <textarea class="field" id="technicalInspectionObservations" rows="6" placeholder="Descreva trincas, infiltrações, corrosão, falhas de manutenção, riscos ou não conformidades"></textarea>
                  <button class="primary-action" type="submit">${icon("sparkles")}Gerar diagnóstico</button>
                </form>
                <div class="list" id="technicalInspectionsList"></div>
              </article>
              <article class="card">
                <h2>Arquivos técnicos</h2>
                <form class="form" id="technicalFileForm">
                  <input class="field" id="technicalFileInput" type="file" accept=".pdf,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf" />
                  <button class="primary-action" type="submit">${icon("paperclip")}Anexar ao projeto</button>
                </form>
                <div class="list" id="technicalFilesList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-smartProjects" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Projetos Inteligentes</h2>
                <p class="muted">Memória viva de fases, decisões, pendências, commits, marcos e próximos passos.</p>
              </div>
              <button class="button" id="refreshSmartProjectsButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Projetos cadastrados</h2>
                <p class="muted">O projeto padrão YARA AI é criado automaticamente para cada usuário.</p>
                <form class="form" id="smartProjectForm">
                  <input class="field" id="smartProjectName" placeholder="Nome do projeto" />
                  <textarea class="field" id="smartProjectDescription" rows="3" placeholder="Descrição, objetivo ou contexto do projeto"></textarea>
                  <button class="primary-action" type="submit">${icon("plus")}Criar memória de projeto</button>
                </form>
                <div class="list" id="smartProjectList"></div>
              </article>
              <article class="card">
                <div class="item-top">
                  <div>
                    <h2 id="smartProjectTitle">Selecione um projeto</h2>
                    <p class="muted" id="smartProjectSubtitle">Abra um projeto inteligente para ver histórico consolidado.</p>
                  </div>
                  <span class="status"><span class="dot"></span><span id="smartProjectStatus">Aguardando</span></span>
                </div>
                <div class="dashboard-grid" id="smartProjectSummary"></div>
                <div class="result-box" id="smartProjectNextSteps">Próximos passos aparecerão aqui.</div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Adicionar decisão</h2>
                <form class="form" id="smartDecisionForm">
                  <input class="field" id="smartDecisionTitle" placeholder="Título da decisão" />
                  <textarea class="field" id="smartDecisionContent" rows="3" placeholder="O que foi decidido e por quê"></textarea>
                  <input class="field" id="smartDecisionImpact" placeholder="Impacto esperado" />
                  <button class="primary-action" type="submit">${icon("save")}Registrar decisão</button>
                </form>
                <div class="list" id="smartDecisionsList"></div>
              </article>
              <article class="card">
                <h2>Adicionar pendência</h2>
                <form class="form" id="smartPendingForm">
                  <input class="field" id="smartPendingTitle" placeholder="Pendência" />
                  <textarea class="field" id="smartPendingDescription" rows="3" placeholder="Descrição da pendência"></textarea>
                  <select class="select" id="smartPendingPriority">
                    <option value="medium">Prioridade média</option>
                    <option value="high">Prioridade alta</option>
                    <option value="low">Prioridade baixa</option>
                  </select>
                  <button class="primary-action" type="submit">${icon("plus")}Registrar pendência</button>
                </form>
                <div class="list" id="smartPendingList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Adicionar commit</h2>
                <form class="form" id="smartCommitForm">
                  <input class="field" id="smartCommitHash" placeholder="Hash do commit" />
                  <input class="field" id="smartCommitMessage" placeholder="Mensagem do commit" />
                  <input class="field" id="smartCommitBranch" placeholder="Branch" value="main" />
                  <button class="primary-action" type="submit">${icon("save")}Registrar commit</button>
                </form>
                <div class="list" id="smartCommitsList"></div>
              </article>
              <article class="card">
                <h2>Marcos e linha do tempo</h2>
                <form class="form" id="smartMilestoneForm">
                  <input class="field" id="smartMilestoneTitle" placeholder="Novo marco" />
                  <textarea class="field" id="smartMilestoneDescription" rows="2" placeholder="Descrição do marco"></textarea>
                  <button class="primary-action" type="submit">${icon("plus")}Registrar marco</button>
                </form>
                <div class="list" id="smartMilestonesList"></div>
                <div class="list" id="smartTimelineList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-knowledge" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Conhecimento</h2>
                <p class="muted">GraphRAG da YARA: relações entre usuário, projetos, decisões, memórias, arquivos, objetivos e conversas.</p>
              </div>
              <div class="row">
                <button class="button" id="refreshGraphButton" type="button">${icon("history")}Atualizar</button>
                <button class="primary-action" id="rebuildGraphButton" type="button">${icon("sparkles")}Reconstruir grafo</button>
              </div>
            </div>
            <div class="dashboard-grid" id="graphStats"></div>
            <div class="documents-layout">
              <article class="card">
                <h2>Consultar relações</h2>
                <form class="form" id="graphQueryForm">
                  <input class="field" id="graphQueryInput" placeholder="Ex.: O que está relacionado à YARA?" />
                  <button class="primary-action" type="submit">${icon("search")}Consultar grafo</button>
                </form>
                <div class="result-box" id="graphQueryResult">Faça uma pergunta para ver nós, conexões e insights relacionados.</div>
              </article>
              <article class="card">
                <h2>Mapa de relações</h2>
                <div class="list" id="graphMap"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Nós principais</h2>
                <div class="list" id="graphNodeList"></div>
              </article>
              <article class="card">
                <h2>Conexões recentes</h2>
                <div class="list" id="graphEdgeList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Insights</h2>
                <div class="list" id="graphInsightList"></div>
              </article>
              <article class="card">
                <h2>Entidades importantes</h2>
                <div class="list" id="graphImportantList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-smartSearch" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Busca Inteligente</h2>
                <p class="muted">Recupere conversas, memórias, projetos, arquivos e decisões por contexto, não apenas por palavras exatas.</p>
              </div>
              <div class="row">
                <button class="button" id="refreshSmartSearchButton" type="button">${icon("history")}Atualizar</button>
                <button class="primary-action" id="reindexSmartSearchButton" type="button">${icon("sparkles")}Reindexar</button>
              </div>
            </div>
            <div class="dashboard-grid" id="smartSearchStats"></div>
            <div class="documents-layout">
              <article class="card">
                <h2>Pesquisar no contexto</h2>
                <form class="form" id="semanticSearchForm">
                  <input class="field" id="semanticSearchQuery" placeholder="Ex.: onde falamos sobre deploy, Render, logística ou engenharia?" />
                  <select class="select" id="semanticSearchMode">
                    <option value="hybrid">Híbrida</option>
                    <option value="semantic">Semântica</option>
                    <option value="context">Contextual</option>
                  </select>
                  <button class="primary-action" type="submit">${icon("search")}Buscar</button>
                </form>
                <div class="list" id="semanticSearchResults"></div>
              </article>
              <article class="card">
                <h2>Índice vetorial</h2>
                <div class="list" id="smartSearchSources"></div>
              </article>
            </div>
            <div class="layout-grid">
              <article class="card">
                <h2>Pesquisas recentes</h2>
                <div class="list" id="smartSearchRecent"></div>
              </article>
              <article class="card">
                <h2>Itens indexados recentemente</h2>
                <div class="list" id="smartSearchIndexed"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-consolidatedMemory" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Memória Consolidada</h2>
                <p class="muted">Unifica memórias, perfil, projetos, decisões, GraphRAG, busca vetorial, arquivos, documentos, sistemas e conversas em uma visão confiável.</p>
              </div>
              <div class="row">
                <button class="button" id="refreshConsolidatedMemoryButton" type="button">${icon("history")}Atualizar</button>
                <button class="primary-action" id="runMemoryConsolidationButton" type="button">${icon("sparkles")}Consolidar agora</button>
              </div>
            </div>
            <div class="dashboard-grid" id="consolidatedMemoryStats"></div>
            <div class="documents-layout">
              <article class="card">
                <h2>Últimas consolidações</h2>
                <div class="list" id="memoryConsolidationList"></div>
              </article>
              <article class="card">
                <h2>Qualidade por categoria</h2>
                <div class="list" id="memoryQualityList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Itens consolidados</h2>
                <div class="list" id="consolidatedMemoryItems"></div>
              </article>
              <article class="card">
                <h2>Conflitos pendentes</h2>
                <div class="list" id="memoryConflictsList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-documents" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Documentos</h2>
                <p class="muted">Gere, baixe e organize documentos reais da sua conta YARA AI.</p>
              </div>
              <button class="button" id="refreshDocumentsPageButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Criar documento</h2>
                <p class="muted">Gere PDF, CSV, XLSX, TXT ou HTML com dados salvos na sua conta.</p>
                <form class="form" id="documentPageForm">
                  <label>Título do documento</label>
                  <input class="field" id="documentPageTitle" placeholder="Ex.: Orçamento para cliente" required />
                  <label>Modelo</label>
                  <select class="select" id="documentPageTemplate"></select>
                  <label>Formato</label>
                  <select class="select" id="documentPageFormat">
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">XLSX</option>
                    <option value="txt">TXT</option>
                    <option value="html">HTML</option>
                  </select>
                  <label>Campos do documento</label>
                  <textarea class="field" id="documentPageFields" rows="8">{
  "cliente": "Cliente Exemplo",
  "itens": "Item 1, Item 2",
  "total": "R$ 0,00",
  "observacoes": "Gerado pela YARA AI"
}</textarea>
                  <button class="primary-action" type="submit">${icon("save")}Gerar documento</button>
                </form>
              </article>
              <article class="card">
                <h2>Upload e análise</h2>
                <p class="muted">Envie PDF, TXT, CSV, XLSX ou DOCX para análise segura.</p>
                <input id="documentUploadInput" type="file" accept=".pdf,.txt,.csv,.xlsx,.docx,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden />
                <button class="primary-action" id="documentUploadButton" type="button">${icon("paperclip")}Enviar documento</button>
                <div class="list" id="documentAnalysisList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Conversões</h2>
                <p class="muted">Converta documentos quando o formato estiver disponível.</p>
                <select class="select" id="documentConvertSource"></select>
                <select class="select" id="documentConvertFormat">
                  <option value="xlsx">CSV → XLSX</option>
                  <option value="csv">XLSX → CSV</option>
                  <option value="pdf">TXT/HTML → PDF</option>
                  <option value="html">Outra conversão</option>
                </select>
                <button class="primary-action" id="documentConvertButton" type="button">${icon("code")}Converter</button>
              </article>
              <article class="card">
                <h2>Templates</h2>
                <div class="settings-card-grid" id="documentTemplatesList"></div>
              </article>
            </div>
            <article class="card">
              <div class="item-top">
                <div>
                  <h2>Meus documentos</h2>
                  <p class="muted">Histórico de documentos, arquivos analisados e exportações.</p>
                </div>
                <div class="row">
                  <input class="field" id="documentSearch" placeholder="Buscar..." />
                  <select class="select" id="documentFormatFilter">
                    <option value="">Todos</option>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">XLSX</option>
                    <option value="txt">TXT</option>
                    <option value="html">HTML</option>
                  </select>
                  <select class="select" id="documentCategoryFilter">
                    <option value="">Todas as categorias</option>
                  </select>
                </div>
              </div>
                <div class="list" id="documentsPageList"></div>
            </article>
          </div>
        </section>

        <section class="view" id="view-files" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Arquivos</h2>
                <p class="muted">Envie, visualize, baixe e organize arquivos reais gerados ou anexados na YARA AI.</p>
              </div>
              <button class="button" id="refreshFilesButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Enviar arquivo</h2>
                <p class="muted">PDF, DOCX, XLSX, TXT, CSV, PNG, JPG e JPEG até 10 MB.</p>
                <input id="fileUploadInput" type="file" accept=".pdf,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,image/png,image/jpeg" hidden />
                <button class="primary-action" id="fileUploadButton" type="button">${icon("paperclip")}Selecionar arquivo</button>
                <div class="list" id="fileUploadStatus"></div>
              </article>
              <article class="card">
                <h2>Exportar conteúdo</h2>
                <p class="muted">Crie arquivos reais diretamente no workspace.</p>
                <input class="field" id="fileExportTitle" placeholder="Nome do arquivo" />
                <select class="select" id="fileExportFormat">
                  <option value="pdf">PDF</option>
                  <option value="docx">Word DOCX</option>
                  <option value="xlsx">Excel XLSX</option>
                  <option value="txt">TXT</option>
                </select>
                <textarea class="field" id="fileExportContent" rows="8" placeholder="Cole aqui o conteúdo que deseja exportar..."></textarea>
                <button class="primary-action" id="fileExportButton" type="button">${icon("save")}Gerar arquivo</button>
              </article>
            </div>
            <article class="card">
              <div class="item-top">
                <div>
                  <h2>Histórico de arquivos</h2>
                  <p class="muted">Todos os arquivos enviados, gerados pela IA, recentes, favoritos e compartilhados.</p>
                </div>
                <div class="row">
                  <input class="field" id="fileSearch" placeholder="Buscar por nome..." />
                  <select class="select" id="fileTypeFilter">
                    <option value="">Todos os tipos</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="xlsx">XLSX</option>
                    <option value="txt">TXT</option>
                    <option value="csv">CSV</option>
                    <option value="image">Imagens</option>
                  </select>
                  <select class="select" id="fileCategoryFilter">
                    <option value="">Todos</option>
                    <option value="generated">Gerados</option>
                    <option value="uploaded">Enviados</option>
                    <option value="document">Documentos</option>
                    <option value="image">Imagens</option>
                  </select>
                </div>
              </div>
              <div class="dashboard-grid" id="fileStats"></div>
              <div class="list" id="fileList"></div>
            </article>
          </div>
        </section>

        <section class="view" id="view-images" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Imagens</h2>
                <p class="muted">Envie, analise, faça OCR básico e edite imagens com processamento seguro no backend.</p>
              </div>
              <button class="button" id="refreshImagesButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Enviar imagem</h2>
                <p class="muted">Suporte a JPG, JPEG, PNG e WEBP com limite seguro de 10MB.</p>
                <input id="imageUploadInput" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" hidden />
                <input id="imageCameraInput" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" capture="environment" hidden />
                <div class="row">
                  <button class="primary-action" id="imageUploadButton" type="button">${icon("image")}Escolher imagem</button>
                  <button class="button" id="imageCameraButton" type="button">${icon("camera")}Tirar foto</button>
                </div>
                <div class="image-preview" id="imagePreview">
                  <p class="muted">O preview aparecerá aqui antes do envio.</p>
                </div>
                <div class="row">
                  <button class="primary-action" id="sendImageButton" type="button">${icon("arrowUp")}Enviar imagem</button>
                  <button class="button danger" id="removeImagePreviewButton" type="button">${icon("trash")}Remover preview</button>
                </div>
              </article>
              <article class="card">
                <h2>Editar imagem</h2>
                <p class="muted">Redimensione, converta formato e ajuste brilho, contraste e saturação com processamento real.</p>
                <label>Imagem</label>
                <select class="select" id="imageEditSource"></select>
                <div class="inline-form">
                  <input class="field" id="imageEditWidth" type="number" min="32" max="5000" placeholder="Largura" />
                  <input class="field" id="imageEditHeight" type="number" min="32" max="5000" placeholder="Altura" />
                  <select class="select" id="imageEditFormat">
                    <option value="">Manter formato</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div class="inline-form">
                  <input class="field" id="imageEditBrightness" type="number" min="0.5" max="1.8" step="0.1" value="1" aria-label="Brilho" />
                  <input class="field" id="imageEditContrast" type="number" min="0.5" max="1.8" step="0.1" value="1" aria-label="Contraste" />
                  <input class="field" id="imageEditSaturation" type="number" min="0.2" max="2" step="0.1" value="1" aria-label="Saturação" />
                </div>
                <label class="row"><input id="imageEditOptimize" type="checkbox" checked /> Criar versão otimizada</label>
                <button class="primary-action" id="imageEditButton" type="button">${icon("sparkles")}Editar imagem</button>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>OCR</h2>
                <p class="muted">Extração de texto quando houver motor OCR configurado. Sem OCR ativo, a YARA retorna fallback honesto.</p>
                <select class="select" id="imageOcrSource"></select>
                <button class="primary-action" id="imageOcrButton" type="button">${icon("search")}Executar OCR</button>
                <div class="result-box" id="imageOcrResult">Nenhum OCR executado ainda.</div>
              </article>
              <article class="card">
                <h2>Histórico</h2>
                <p class="muted">Análises e edições feitas na sua conta.</p>
                <div class="list" id="imageHistoryList"></div>
              </article>
            </div>
            <article class="card">
              <div class="item-top">
                <div>
                  <h2>Minhas imagens</h2>
                  <p class="muted">Galeria protegida com ações reais de análise, OCR, edição, download e exclusão.</p>
                </div>
                <input class="field" id="imageSearch" placeholder="Buscar imagem..." />
              </div>
              <div class="list" id="imagesList"></div>
            </article>
          </div>
        </section>

        <section class="view" id="view-calendar" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Agenda</h2>
                <p class="muted">Organize eventos, lembretes e notificações com segurança na YARA AI.</p>
              </div>
              <button class="button" id="refreshCalendarButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="dashboard-grid" id="calendarStats"></div>
            <div class="documents-layout">
              <article class="card">
                <h2>Novo evento</h2>
                <form class="form" id="calendarEventForm">
                  <label>Título</label>
                  <input class="field" id="eventTitle" placeholder="Ex.: Reunião com cliente" required />
                  <label>Descrição</label>
                  <textarea class="field" id="eventDescription" rows="3" placeholder="Contexto, pauta ou observações"></textarea>
                  <div class="inline-form">
                    <input class="field" id="eventDate" type="date" required />
                    <input class="field" id="eventTime" type="time" />
                    <input class="field" id="eventReminder" type="number" min="0" max="43200" placeholder="Lembrete em min" />
                  </div>
                  <input class="field" id="eventLocation" placeholder="Local" />
                  <input class="field" id="eventParticipants" placeholder="Participantes separados por vírgula" />
                  <button class="primary-action" type="submit">${icon("save")}Criar evento</button>
                </form>
              </article>
              <article class="card">
                <h2>Novo lembrete</h2>
                <form class="form" id="reminderForm">
                  <label>Título</label>
                  <input class="field" id="reminderTitle" placeholder="Ex.: Pagar conta" required />
                  <label>Mensagem</label>
                  <textarea class="field" id="reminderMessage" rows="3" placeholder="Detalhes do lembrete"></textarea>
                  <label>Data e hora</label>
                  <input class="field" id="reminderScheduledAt" type="datetime-local" required />
                  <label>Repetição</label>
                  <select class="select" id="reminderRecurrence">
                    <option value="none">Não repetir</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                  <button class="primary-action" type="submit">${icon("save")}Criar lembrete</button>
                </form>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <div class="item-top">
                  <h2>Próximos eventos</h2>
                  <span class="status"><span class="dot"></span>Interno</span>
                </div>
                <div class="tabs" id="calendarRangeTabs">
                  <button class="tab active" data-calendar-range="today" type="button">Hoje</button>
                  <button class="tab" data-calendar-range="week" type="button">Semana</button>
                  <button class="tab" data-calendar-range="month" type="button">Mês</button>
                </div>
                <div class="list" id="calendarEventsList"></div>
              </article>
              <article class="card">
                <h2>Lembretes</h2>
                <div class="list" id="remindersList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Google Calendar</h2>
                <p class="muted">OAuth fica no backend. Sem credenciais, a YARA informa que a integração ainda não foi configurada.</p>
                <div class="row">
                  <button class="button" id="googleCalendarConnectButton" type="button">${icon("share")}Conectar</button>
                  <button class="button" id="googleCalendarCalendarsButton" type="button">${icon("history")}Calendários conectados</button>
                  <button class="button" id="googleCalendarSyncButton" type="button">${icon("sparkles")}Sincronizar</button>
                </div>
                <div class="result-box" id="googleCalendarStatus">Google Calendar aguardando configuração segura.</div>
              </article>
              <article class="card">
                <h2>Notificações agendadas</h2>
                <div class="list" id="notificationsList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-integrations" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Integrações</h2>
                <p class="muted">Conecte serviços externos reais à YARA AI sem expor tokens no aplicativo.</p>
              </div>
              <button class="button" id="refreshIntegrationsButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="dashboard-grid" id="integrationsStatusGrid"></div>
            <div class="documents-layout">
              <article class="card">
                <h2>Google Calendar</h2>
                <p class="muted">Sincronize, importe, crie, edite e exclua eventos usando OAuth seguro no backend.</p>
                <div class="row">
                  <button class="button" id="integrationCalendarConnect" type="button">${icon("share")}Conectar Google</button>
                  <button class="button" id="integrationCalendarSync" type="button">${icon("sparkles")}Sincronizar</button>
                  <button class="button" id="integrationCalendarList" type="button">${icon("history")}Listar eventos Google</button>
                </div>
                <form class="form" id="integrationCalendarForm">
                  <input class="field" id="integrationCalendarTitle" placeholder="Título do evento" />
                  <div class="split">
                    <input class="field" id="integrationCalendarDate" type="date" />
                    <input class="field" id="integrationCalendarTime" type="time" />
                  </div>
                  <input class="field" id="integrationCalendarLocation" placeholder="Local" />
                  <button class="primary-action" type="submit">${icon("plus")}Criar no Google Calendar</button>
                </form>
                <div class="result-box" id="integrationCalendarResult">Aguardando conexão.</div>
              </article>
              <article class="card">
                <h2>Gmail</h2>
                <p class="muted">Leia, busque, resuma e envie e-mails por rotas protegidas no backend.</p>
                <div class="row">
                  <button class="button" id="integrationGmailConnect" type="button">${icon("share")}Conectar Gmail</button>
                  <button class="button" id="integrationGmailRecent" type="button">${icon("history")}Últimos e-mails</button>
                  <button class="button" id="integrationGmailUnread" type="button">${icon("sparkles")}Resumir não lidos</button>
                </div>
                <form class="form" id="integrationGmailForm">
                  <input class="field" id="integrationGmailTo" placeholder="Destinatário" />
                  <input class="field" id="integrationGmailSubject" placeholder="Assunto" />
                  <textarea class="field" id="integrationGmailBody" rows="4" placeholder="Mensagem"></textarea>
                  <div class="row">
                    <button class="button" id="integrationGmailDraft" type="button">${icon("save")}Criar rascunho</button>
                    <button class="primary-action" type="submit">${icon("send")}Enviar e-mail</button>
                  </div>
                </form>
                <div class="result-box" id="integrationGmailResult">Gmail aguardando conexão.</div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Google Drive</h2>
                <p class="muted">Salve documentos gerados, organize pastas e busque arquivos autorizados pelo Google.</p>
                <div class="row">
                  <button class="button" id="integrationDriveConnect" type="button">${icon("share")}Conectar Drive</button>
                  <button class="button" id="integrationDriveList" type="button">${icon("history")}Listar arquivos</button>
                </div>
                <div class="split">
                  <input class="field" id="integrationDriveQuery" placeholder="Buscar no Drive..." />
                  <button class="button" id="integrationDriveSearch" type="button">${icon("search")}Buscar</button>
                </div>
                <div class="split">
                  <input class="field" id="integrationDriveFolderName" placeholder="Nova pasta" />
                  <button class="button" id="integrationDriveCreateFolder" type="button">${icon("folder")}Criar pasta</button>
                </div>
                <div class="split">
                  <select class="select" id="integrationDriveFileSelect"><option value="">Nenhum arquivo YARA carregado</option></select>
                  <button class="primary-action" id="integrationDriveUploadFile" type="button">${icon("save")}Salvar arquivo no Drive</button>
                </div>
                <div class="result-box" id="integrationDriveResult">Google Drive aguardando conexão.</div>
              </article>
              <article class="card">
                <h2>Automações</h2>
                <p class="muted">Crie lembretes, tarefas recorrentes, resumos e verificações programadas.</p>
                <form class="form" id="automationForm">
                  <input class="field" id="automationName" placeholder="Nome da automação" />
                  <div class="split">
                    <select class="select" id="automationType">
                      <option value="reminder">Lembrete</option>
                      <option value="recurring_task">Tarefa recorrente</option>
                      <option value="daily_summary">Resumo diário</option>
                      <option value="auto_report">Relatório automático</option>
                      <option value="scheduled_check">Verificação programada</option>
                    </select>
                    <select class="select" id="automationSchedule">
                      <option value="once">Uma vez</option>
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <input class="field" id="automationNextRunAt" type="datetime-local" />
                  <textarea class="field" id="automationMessage" rows="3" placeholder="Mensagem, ação ou instrução da automação"></textarea>
                  <button class="primary-action" type="submit">${icon("plus")}Criar automação</button>
                </form>
                <div class="row">
                  <button class="button" id="refreshAutomationsButton" type="button">${icon("history")}Atualizar automações</button>
                </div>
                <div class="list" id="automationList"></div>
                <div class="list" id="automationExecutionList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Telegram</h2>
                <p class="muted">Use o bot da YARA para responder mensagens e enviar notificações.</p>
                <form class="form" id="integrationTelegramForm">
                  <input class="field" id="integrationTelegramChatId" placeholder="Chat ID" />
                  <textarea class="field" id="integrationTelegramText" rows="3" placeholder="Mensagem Telegram"></textarea>
                  <button class="primary-action" type="submit">${icon("send")}Enviar Telegram</button>
                </form>
                <div class="result-box" id="integrationTelegramResult">Telegram aguardando configuração do bot.</div>
              </article>
              <article class="card">
                <h2>WhatsApp Business</h2>
                <p class="muted">Estrutura pronta para envio, recebimento e notificações automáticas pela API oficial.</p>
                <form class="form" id="integrationWhatsappForm">
                  <input class="field" id="integrationWhatsappTo" placeholder="Número com DDI" />
                  <textarea class="field" id="integrationWhatsappText" rows="3" placeholder="Mensagem WhatsApp"></textarea>
                  <button class="primary-action" type="submit">${icon("send")}Enviar WhatsApp</button>
                </form>
                <div class="result-box" id="integrationWhatsappResult">WhatsApp aguardando credenciais.</div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Notificações</h2>
                <p class="muted">Eventos, lembretes e tarefas podem gerar notificações internas e estrutura push.</p>
                <div class="row">
                  <button class="button" id="integrationPushSubscribe" type="button">${icon("sparkles")}Ativar push</button>
                  <button class="button" id="integrationPushTest" type="button">${icon("sparkles")}Criar teste</button>
                </div>
                <div class="list" id="integrationPushList"></div>
              </article>
              <article class="card">
                <h2>Auditoria</h2>
                <p class="muted">Ações de integração são registradas sem segredos.</p>
                <div class="list" id="integrationAuditList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-automations" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Automações</h2>
                <p class="muted">Crie, execute e monitore fluxos entre chat, sistemas, projetos técnicos, agentes, arquivos, agenda e memória.</p>
              </div>
              <button class="button" id="refreshAutomationWorkspaceButton" type="button">${icon("history")}Atualizar</button>
            </div>
            <div class="stats-grid" id="automationDashboardGrid">
              ${statCard("Automações", "0", "Total criado")}
              ${statCard("Ativas", "0", "Prontas para execução")}
              ${statCard("Execuções hoje", "0", "Histórico do dia")}
              ${statCard("Falhas", "0", "Exigem revisão")}
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Chat de Automações</h2>
                <p class="muted">Descreva o fluxo em linguagem natural. A YARA converte em gatilho, ações e histórico auditável.</p>
                <div class="chat-feed compact" id="automationChatMessages">
                  <div class="message assistant"><div class="message-content">Exemplo: “Quando eu criar um projeto técnico, gere DXF e registre na memória.”</div></div>
                </div>
                <form class="composer" id="automationChatForm">
                  <textarea id="automationChatInput" rows="2" placeholder="Descreva a automação..."></textarea>
                  <button class="send-button" type="submit" aria-label="Criar automação">${icon("arrowUp")}</button>
                </form>
              </article>
              <article class="card">
                <h2>Novo fluxo</h2>
                <p class="muted">Criação manual rápida para fluxos simples e recorrentes.</p>
                <form class="form" id="automationFlowForm">
                  <input class="field" id="automationFlowName" placeholder="Nome do fluxo" />
                  <textarea class="field" id="automationFlowDescription" rows="2" placeholder="Descrição do fluxo"></textarea>
                  <div class="split">
                    <select class="select" id="automationFlowTrigger">
                      <option value="scheduled">Horário</option>
                      <option value="event">Evento</option>
                      <option value="creation">Criação</option>
                      <option value="update">Atualização</option>
                      <option value="upload">Upload</option>
                      <option value="agent">Agente</option>
                      <option value="system">Sistema</option>
                      <option value="technical_project">Projeto técnico</option>
                      <option value="file">Arquivo</option>
                      <option value="memory">Memória</option>
                    </select>
                    <select class="select" id="automationFlowAction">
                      <option value="generate_pdf">Gerar PDF</option>
                      <option value="generate_docx">Gerar DOCX</option>
                      <option value="generate_xlsx">Gerar XLSX</option>
                      <option value="export_dxf">Exportar DXF</option>
                      <option value="export_ifc">Exportar IFC</option>
                      <option value="send_to_agent">Enviar para agente</option>
                      <option value="index_memory">Indexar memória</option>
                      <option value="create_task">Criar tarefa</option>
                      <option value="create_project">Criar projeto</option>
                      <option value="generate_report">Gerar relatório</option>
                    </select>
                  </div>
                  <select class="select" id="automationFlowSchedule">
                    <option value="manual">Manual</option>
                    <option value="once">Uma vez</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                  <button class="primary-action" type="submit">${icon("plus")}Criar fluxo</button>
                </form>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <div class="item-top">
                  <h2>Fluxos</h2>
                  <span class="status">JWT obrigatório</span>
                </div>
                <div class="list" id="automationFlowList"></div>
              </article>
              <article class="card">
                <h2>Execuções e histórico</h2>
                <div class="list" id="automationRunList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Logs</h2>
                <div class="list" id="automationLogList"></div>
              </article>
              <article class="card">
                <h2>Configurações</h2>
                <div class="list">
                  <article class="list-item"><strong>Isolamento por usuário</strong><p class="muted">Cada automação, execução e log é filtrado pelo JWT do usuário autenticado.</p></article>
                  <article class="list-item"><strong>Execução segura</strong><p class="muted">Fluxos registram auditoria e não expõem segredos de integrações.</p></article>
                  <article class="list-item"><strong>Persistência Render</strong><p class="muted">Banco e backups continuam usando as variáveis DATABASE_URL e BACKUP_DIR configuradas.</p></article>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-marketplace" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Marketplace</h2>
                <p class="muted">Instale, habilite e gerencie módulos da YARA sem alterar o núcleo da plataforma.</p>
              </div>
              <button class="button" id="refreshMarketplaceButton" type="button">${icon("history")}Atualizar loja</button>
            </div>
            <div class="stats-grid" id="pluginDashboardGrid">
              ${statCard("Instalados", "0", "Plugins instalados")}
              ${statCard("Ativos", "0", "Habilitados no workspace")}
              ${statCard("Atualizações", "0", "Prévias e novidades")}
              ${statCard("Uso", "0", "Eventos registrados")}
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Chat do Marketplace</h2>
                <p class="muted">Use comandos como “instale o CRM”, “ative o financeiro” ou “quais plugins eu tenho?”.</p>
                <div class="chat-feed compact" id="pluginChatMessages">
                  <div class="message assistant"><div class="message-content">Posso instalar CRM, Financeiro, RH, Jurídico, Estoque, Atendimento, Obras, Contratos, Frota, Drive YARA e Analytics.</div></div>
                </div>
                <form class="composer" id="pluginChatForm">
                  <textarea id="pluginChatInput" rows="2" placeholder="Comando do marketplace..."></textarea>
                  <button class="send-button" type="submit" aria-label="Enviar comando">${icon("arrowUp")}</button>
                </form>
              </article>
              <article class="card">
                <h2>Categorias</h2>
                <div class="list" id="pluginCategoryList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <div class="item-top">
                  <h2>Loja</h2>
                  <span class="status">Catálogo YARA</span>
                </div>
                <div class="list" id="pluginMarketplaceList"></div>
              </article>
              <article class="card">
                <div class="item-top">
                  <h2>Instalados</h2>
                  <span class="status">Por usuário</span>
                </div>
                <div class="list" id="pluginInstalledList"></div>
              </article>
            </div>
            <div class="documents-layout">
              <article class="card">
                <h2>Atualizações</h2>
                <div class="list" id="pluginUpdatesList"></div>
              </article>
              <article class="card">
                <h2>Logs</h2>
                <div class="list" id="pluginLogList"></div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-audit" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Auditoria</h2>
                <p class="muted">Monitore segurança, atividades, backups e saúde da plataforma em produção.</p>
              </div>
              <div class="row">
                <button class="button" id="refreshAuditButton" type="button">${icon("history")}Atualizar</button>
                <button class="primary-action" id="createBackupButton" type="button">${icon("save")}Criar backup</button>
              </div>
            </div>

            <div class="dashboard-grid" id="auditStatusGrid"></div>

            <div class="documents-layout">
              <article class="card">
                <div class="item-top">
                  <div>
                    <h2>Trilha de auditoria</h2>
                    <p class="muted">Ações críticas registradas por usuário, categoria e data.</p>
                  </div>
                </div>
                <div class="row">
                  <input class="field" id="auditSearch" placeholder="Buscar evento..." />
                  <select class="select" id="auditCategoryFilter">
                    <option value="">Todas as categorias</option>
                    <option value="auth">Autenticação</option>
                    <option value="project">Projetos</option>
                    <option value="task">Tarefas</option>
                    <option value="file">Arquivos</option>
                    <option value="upload">Uploads</option>
                    <option value="backup">Backup</option>
                    <option value="integrations">Integrações</option>
                    <option value="automation">Automações</option>
                    <option value="recovery">Recuperação</option>
                  </select>
                  <input class="field" id="auditActionFilter" placeholder="Ação" />
                </div>
                <div class="list" id="auditList"></div>
                <div class="row">
                  <button class="button" id="auditPrevPage" type="button">Anterior</button>
                  <span class="muted" id="auditPageLabel">Página 1</span>
                  <button class="button" id="auditNextPage" type="button">Próxima</button>
                </div>
              </article>

              <article class="card">
                <div class="item-top">
                  <div>
                    <h2>Logs estruturados</h2>
                    <p class="muted">Eventos de aplicação, segurança e erros sem expor segredos.</p>
                  </div>
                  <select class="select" id="logLevelFilter">
                    <option value="">Todos</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                <div class="list" id="logList"></div>
              </article>
            </div>

            <div class="documents-layout">
              <article class="card">
                <div class="item-top">
                  <div>
                    <h2>Backups</h2>
                    <p class="muted">Backups manuais e automáticos do banco, arquivos e configurações operacionais.</p>
                  </div>
                  <button class="button" id="refreshBackupsButton" type="button">${icon("history")}Atualizar</button>
                </div>
                <div class="list" id="backupList"></div>
              </article>

              <article class="card">
                <div class="item-top">
                  <div>
                    <h2>Relatório Pilar 01</h2>
                    <p class="muted">Resumo final de arquitetura, segurança, endpoints e recursos de produção.</p>
                  </div>
                  <button class="button" id="loadPilarReportButton" type="button">${icon("file")}Carregar relatório</button>
                </div>
                <div class="result-box" id="pilarReportBox">Relatório disponível para consulta segura.</div>
              </article>
            </div>
          </div>
        </section>

        <section class="view" id="view-settings" hidden>
          <div class="panel">
            <div class="settings-hero">
              <div>
                <h2>Configurações</h2>
                <p class="muted">Gerencie suas preferências e personalize sua experiência com a YARA AI.</p>
              </div>
              <div class="settings-metric">
                <span class="muted">Plano atual</span>
                <strong>Essencial</strong>
                <span class="muted">Workspace ativo</span>
              </div>
            </div>

            <div class="tabs" id="settingsTabs">
              <button class="tab active" data-settings-tab="profile" type="button">Perfil</button>
              <button class="tab" data-settings-tab="memory" type="button">Memória</button>
              <button class="tab" data-settings-tab="personality" type="button">Personalidade</button>
              <button class="tab" data-settings-tab="workspace" type="button">Workspace</button>
              <button class="tab" data-settings-tab="files" type="button">Arquivos</button>
              <button class="tab" data-settings-tab="documents" type="button">Documentos</button>
              <button class="tab" data-settings-tab="notifications" type="button">Notificações</button>
              <button class="tab" data-settings-tab="security" type="button">Segurança</button>
              <button class="tab" data-settings-tab="appearance" type="button">Aparência</button>
              <button class="tab" data-settings-tab="voice" type="button">Voz</button>
              <button class="tab" data-settings-tab="ai" type="button">IA</button>
              <button class="tab" data-settings-tab="about" type="button">Sobre</button>
            </div>

            <div class="settings-pane settings-grid" id="settings-profile">
              <form class="card" id="profileForm">
                <h2>Perfil</h2>
                <div class="account-row">
                  <span class="avatar" id="settingsAvatar">YA</span>
                  <div>
                    <strong id="settingsName">Usuário</strong>
                    <p class="muted" id="settingsEmail">Conta YARA</p>
                  </div>
                </div>
                <input class="field" id="displayName" placeholder="Como deseja ser chamado" />
                <input class="field" id="fullName" placeholder="Nome completo" />
                <input class="field" id="profileEmail" placeholder="E-mail" type="email" />
                <input class="field" id="profilePhone" placeholder="Telefone opcional" />
                <input class="field" id="avatarUrl" placeholder="Foto/avatar (URL)" />
                <button class="primary-action" type="submit">${icon("save")}Salvar alterações</button>
              </form>
              <article class="card">
                <h2>Conta</h2>
                <button class="button" data-settings-tab-target="security" type="button">${icon("shield")}Alterar senha</button>
                <button class="button" id="loadSessionsButton" type="button">${icon("history")}Sessões ativas</button>
                <button class="button" id="logoutAllButton" type="button">${icon("logout")}Encerrar sessões</button>
                <div class="list" id="sessionList"></div>
              </article>
              <form class="card" id="cognitiveProfileForm">
                <h2>Perfil cognitivo</h2>
                <p class="muted">Contexto persistente para a YARA entender seu momento, objetivos e projetos.</p>
                <input class="field" id="cognitiveProfession" placeholder="Profissão" />
                <input class="field" id="cognitiveStudies" placeholder="Estudos" />
                <textarea class="field" id="cognitiveProjects" rows="3" placeholder="Projetos, um por linha"></textarea>
                <textarea class="field" id="cognitiveInterests" rows="3" placeholder="Interesses, um por linha"></textarea>
                <input class="field" id="cognitiveGoalShort" placeholder="Objetivo de curto prazo" />
                <input class="field" id="cognitiveGoalMedium" placeholder="Objetivo de médio prazo" />
                <input class="field" id="cognitiveGoalLong" placeholder="Objetivo de longo prazo" />
                <button class="primary-action" type="submit">${icon("save")}Salvar perfil cognitivo</button>
              </form>
              <form class="card" id="cognitivePreferencesForm">
                <h2>Preferências cognitivas</h2>
                <input class="field" id="cognitiveCommunication" placeholder="Comunicação preferida. Ex.: direta, acolhedora, executiva" />
                <select class="select" id="cognitiveLanguage">
                  <option value="pt-BR">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
                <select class="select" id="cognitiveResponseStyle">
                  <option value="balanced">Equilibrada</option>
                  <option value="direct">Direta</option>
                  <option value="technical">Técnica</option>
                  <option value="creative">Criativa</option>
                  <option value="executive">Executiva</option>
                </select>
                <select class="select" id="cognitiveResponseLength">
                  <option value="short">Curta</option>
                  <option value="medium">Média</option>
                  <option value="detailed">Detalhada</option>
                </select>
                <button class="button" type="submit">${icon("save")}Salvar preferências</button>
              </form>
              <article class="card">
                <h2>Dashboard do perfil</h2>
                <div class="dashboard-grid" id="cognitiveProfileCards"></div>
                <div class="list" id="cognitiveProfileFacts"></div>
              </article>
            </div>

            <div class="settings-pane settings-grid" id="settings-memory" hidden>
              <article class="card">
                <h2>Arquitetura de memória</h2>
                <p class="muted">Memória persistente, contexto recente, embeddings locais e relações GraphRAG.</p>
                <div class="dashboard-grid" id="memoryDashboardCards"></div>
                <div class="result-box" id="memorySystemStatus">Carregando status da memória...</div>
              </article>
              <article class="card">
                <h2>Buscar memória</h2>
                <p class="muted">Encontre contexto mesmo com palavras diferentes.</p>
                <form class="form" id="memorySearchForm">
                  <input class="field" id="memorySearchQuery" placeholder="Ex.: configuração do Render, fase congelada, objetivo do projeto" />
                  <button class="button" type="submit">${icon("search")}Buscar</button>
                </form>
                <div class="list" id="memorySearchResults"></div>
              </article>
              <form class="card" id="memoryForm">
                <h2>Memória da YARA</h2>
                <p class="muted">A YARA usa essas informações para personalizar respostas.</p>
                <input class="field" id="memoryTitle" placeholder="Título opcional" />
                <select class="select" id="memoryCategory">
                  <option value="general">Geral</option>
                  <option value="preference">Preferência</option>
                  <option value="project">Projeto</option>
                  <option value="decision">Decisão</option>
                  <option value="episodic">Episódica</option>
                </select>
                <select class="select" id="memoryImportance">
                  <option value="3">Importância média</option>
                  <option value="5">Crítica</option>
                  <option value="4">Alta</option>
                  <option value="2">Baixa</option>
                  <option value="1">Arquivável</option>
                </select>
                <textarea class="field" id="memoryContent" rows="5" placeholder="O que a YARA deve lembrar?"></textarea>
                <button class="primary-action" type="submit">${icon("plus")}Adicionar memória</button>
                <button class="button danger" id="clearMemoriesButton" type="button">${icon("trash")}Limpar todas</button>
              </form>
              <article class="card">
                <h2>Memórias salvas</h2>
                <div class="list" id="memoryList"></div>
              </article>
            </div>

            <div class="settings-pane settings-grid" id="settings-personality" hidden>
              <form class="card" id="preferencesForm">
                <h2>Personalidade da YARA</h2>
                <label class="muted">Estilo de resposta</label>
                <select class="select" id="aiStyle">
                  <option value="balanced">Equilibrada</option>
                  <option value="direct">Direta</option>
                  <option value="technical">Técnica</option>
                  <option value="creative">Criativa</option>
                  <option value="executive">Executiva</option>
                </select>
                <label class="muted">Tamanho das respostas</label>
                <select class="select" id="responseLength">
                  <option value="short">Curta</option>
                  <option value="medium">Média</option>
                  <option value="detailed">Detalhada</option>
                </select>
                <label class="muted">Idioma principal</label>
                <select class="select" id="language">
                  <option value="pt-BR">Português</option>
                  <option value="en-US">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
                <button class="primary-action" type="submit">${icon("save")}Salvar personalidade</button>
              </form>
              <article class="card">
                <h2>Prévia</h2>
                <p class="muted">As respostas da YARA serão ajustadas conforme estilo, idioma e profundidade escolhidos.</p>
              </article>
            </div>

            <div class="settings-pane" id="settings-workspace" hidden>
              <div class="settings-card-grid">
                ${settingsInfoCard("Projetos", "Projetos ativos conectados ao gerador.", "folder")}
                ${settingsInfoCard("Projetos favoritos", "Fixe projetos importantes no topo.", "pin")}
                ${settingsInfoCard("Arquivados", "Itens guardados sem apagar dados.", "archive")}
                ${settingsInfoCard("Histórico de sistemas", "Gerações recentes salvas automaticamente.", "history")}
                ${settingsInfoCard("Templates favoritos", "Modelos prontos para acelerar criação.", "sparkles")}
                <article class="card"><h2>Tecnologias preferidas</h2><input class="field" id="preferredTech" placeholder="React, Node, PostgreSQL..." /><button class="button" id="savePreferredTechButton" type="button">${icon("save")}Salvar tecnologias</button></article>
              </div>
            </div>

            <div class="settings-pane settings-grid" id="settings-files" hidden>
              <article class="card">
                <h2>Arquivos</h2>
                <div class="settings-card-grid">
                  ${settingsInfoCard("Imagens", "Anexos visuais enviados no chat.", "image")}
                  ${settingsInfoCard("Documentos", "Documentos e textos validados.", "file")}
                  ${settingsInfoCard("PDFs", "PDFs com limite seguro.", "file")}
                  ${settingsInfoCard("Planilhas", "Estrutura pronta para planilhas.", "file")}
                </div>
                <div class="storage"><span></span></div>
                <p class="muted" id="storageText">0 MB usados em arquivos enviados.</p>
                <button class="primary-action" id="manageFilesButton" type="button">${icon("folder")}Gerenciar arquivos</button>
              </article>
              <article class="card">
                <h2>Arquivos enviados</h2>
                <div class="list" id="uploadsList"></div>
              </article>
            </div>

            <div class="settings-pane settings-grid" id="settings-documents" hidden>
              <article class="card">
                <h2>Central de Documentos</h2>
                <p class="muted">Gere PDFs e CSVs reais com dados salvos na sua conta YARA AI.</p>
                <form class="form" id="documentForm">
                  <label>Título do documento</label>
                  <input class="field" id="documentTitle" placeholder="Ex.: Orçamento para cliente" required />
                  <label>Modelo</label>
                  <select class="select" id="documentTemplate"></select>
                  <label>Formato</label>
                  <select class="select" id="documentFormat">
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">XLSX</option>
                    <option value="txt">TXT</option>
                    <option value="html">HTML</option>
                  </select>
                  <label>Campos do documento</label>
                  <textarea class="field" id="documentFields" rows="8">{
  "cliente": "Cliente Exemplo",
  "itens": "Item 1, Item 2",
  "total": "R$ 0,00",
  "observacoes": "Gerado pela YARA AI"
}</textarea>
                  <button class="primary-action" type="submit">${icon("save")}Gerar documento</button>
                </form>
              </article>
              <article class="card">
                <div class="item-top">
                  <h2>Documentos gerados</h2>
                  <button class="button" id="refreshDocumentsButton" type="button">${icon("history")}Atualizar</button>
                </div>
                <div class="list" id="documentsList"></div>
              </article>
            </div>

            <div class="settings-pane" id="settings-notifications" hidden>
              <div class="settings-card-grid">
                ${toggleRow("Novas respostas", "Avisar quando a YARA concluir respostas.", true)}
                ${toggleRow("Atualizações de projetos", "Notificar mudanças importantes nos projetos.", true)}
                ${toggleRow("Conclusão de geração", "Avisar quando sistemas forem gerados.", true)}
                ${toggleRow("Atualizações da plataforma", "Novidades da YARA AI.", true)}
                ${toggleRow("Ofertas e novidades", "Comunicações comerciais opcionais.", false)}
              </div>
            </div>

            <div class="settings-pane settings-grid" id="settings-security" hidden>
              <form class="card" id="passwordForm">
                <h2>Alterar senha</h2>
                <input class="field" id="currentPassword" placeholder="Senha atual" type="password" />
                <input class="field" id="newPassword" placeholder="Nova senha" type="password" />
                <input class="field" id="confirmPassword" placeholder="Confirmar nova senha" type="password" />
                <button class="primary-action" type="submit">${icon("shield")}Atualizar senha</button>
              </form>
              <article class="card">
                <h2>Segurança</h2>
                <button class="button" id="securitySessionsButton" type="button">${icon("history")}Histórico de login</button>
                <button class="button" id="securityDevicesButton" type="button">${icon("users")}Dispositivos conectados</button>
              </article>
            </div>

            <div class="settings-pane" id="settings-appearance" hidden>
              <div class="settings-card-grid">
                <article class="card"><h2>Tema</h2><div class="option-grid"><button class="option-button" data-choice-group="theme">Claro</button><button class="option-button active" data-choice-group="theme">Escuro</button><button class="option-button" data-choice-group="theme">Automático</button></div></article>
                <article class="card"><h2>Interface</h2><div class="option-grid"><button class="option-button" data-choice-group="density">Compacta</button><button class="option-button active" data-choice-group="density">Padrão</button><button class="option-button" data-choice-group="density">Espaçosa</button></div></article>
                <article class="card"><h2>Cores</h2><div class="option-grid"><button class="option-button active" data-choice-group="color">Azul</button><button class="option-button" data-choice-group="color">Roxo</button><button class="option-button" data-choice-group="color">Verde</button><button class="option-button" data-choice-group="color">Laranja</button><button class="option-button" data-choice-group="color">Rosa</button><button class="option-button" data-choice-group="color">Personalizada</button></div></article>
              </div>
            </div>

            <div class="settings-pane settings-grid" id="settings-voice" hidden>
              <form class="card" id="voiceForm">
                <h2>Voz</h2>
                <label class="toggle-row"><div><strong>Ativar voz</strong><p class="muted">Permite ditado, leitura de respostas e modo conversa quando o navegador suportar.</p></div><input id="voiceEnabled" type="checkbox" /></label>
                <label class="muted">Idioma</label>
                <select class="select" id="voiceLanguage">
                  <option value="pt-BR">Português do Brasil</option>
                  <option value="en-US">Inglês</option>
                  <option value="es-ES">Espanhol</option>
                </select>
                <label class="muted">Velocidade</label>
                <input class="field" id="voiceRate" min="0.6" max="1.8" step="0.1" type="number" />
                <label class="muted">Tom</label>
                <input class="field" id="voicePitch" min="0.6" max="1.6" step="0.1" type="number" />
                <label class="muted">Voz preferida</label>
                <select class="select" id="voiceGender">
                  <option value="auto">Automática</option>
                  <option value="female">Feminina quando disponível</option>
                  <option value="male">Masculina quando disponível</option>
                </select>
                <label class="toggle-row"><div><strong>Ler respostas automaticamente</strong><p class="muted">A YARA fala a resposta após enviar uma mensagem.</p></div><input id="voiceAutoRead" type="checkbox" /></label>
                <button class="primary-action" type="submit">${icon("save")}Salvar voz</button>
              </form>
              <article class="card">
                <h2>Disponibilidade</h2>
                <p class="muted" id="speechSupportText">Verificando suporte do navegador...</p>
                <div class="settings-card-grid">
                  ${settingsInfoCard("Web Speech API", "Ditado e leitura por recursos nativos do navegador.", "mic")}
                  ${settingsInfoCard("Whisper", "Estrutura preparada para STT no servidor futuramente.", "sparkles")}
                  ${settingsInfoCard("Google STT", "Preparado para provedor de fala corporativo.", "code")}
                  ${settingsInfoCard("Deepgram", "Preparado para transcrição em tempo real.", "code")}
                  ${settingsInfoCard("AssemblyAI", "Preparado para transcrição avançada.", "code")}
                  ${settingsInfoCard("TTS externo", "Edge TTS, ElevenLabs e OpenAI TTS ficam reservados para backend seguro.", "shield")}
                </div>
              </article>
            </div>

            <div class="settings-pane settings-grid" id="settings-ai" hidden>
              <article class="card">
                <h2>IA</h2>
                <p class="muted">Provedor atual: <strong id="aiProvider">Carregando...</strong></p>
                <p class="muted">Modelo: <strong id="aiModel">Carregando...</strong></p>
                <p class="muted">Status: <strong id="aiOnline">Verificando...</strong></p>
                <button class="primary-action" id="testAiButton" type="button">${icon("sparkles")}Testar conexão</button>
              </article>
              <article class="card">
                <h2>Camada segura</h2>
                <p class="muted">O APK e o frontend nunca recebem chaves do provedor. Todas as chamadas passam pelo backend.</p>
              </article>
            </div>

            <div class="settings-pane" id="settings-about" hidden>
              <div class="settings-card-grid">
                ${settingsInfoCard("Versão da plataforma", "YARA AI Web 1.0", "sparkles")}
                ${settingsInfoCard("Versão do backend", "API Render 1.0", "code")}
                ${settingsInfoCard("Licença", "Projeto YARA AI", "file")}
                ${settingsInfoCard("Termos de uso", "Documento institucional da plataforma.", "file")}
                ${settingsInfoCard("Política de privacidade", "Informações sobre proteção de dados.", "shield")}
                ${settingsInfoCard("Suporte técnico", "Canal oficial via workspace.", "users")}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div class="modal-overlay" id="modalOverlay">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h2 id="modalTitle">YARA AI</h2>
            <p class="muted" id="modalText"></p>
          </div>
          <button class="icon-button" id="modalClose" type="button" aria-label="Fechar">${icon("close")}</button>
        </div>
        <div id="modalBody"></div>
      </div>
    </div>

    <div class="toast" id="toast"></div>
    <div class="diagnostic-panel" id="diagnosticPanel" hidden>
      <h2>Diagnóstico da interface</h2>
      <dl>
        <dt>View atual</dt><dd id="diagnosticView">-</dd>
        <dt>Botão</dt><dd id="diagnosticButton">-</dd>
        <dt>Módulo</dt><dd id="diagnosticModule">-</dd>
        <dt>Erro</dt><dd id="diagnosticError">-</dd>
      </dl>
    </div>
    <script>
      const token = localStorage.getItem("yaraToken");
      let currentView = "chat";
      let lastClickedControl = "-";
      let currentUser = null;
      let currentConversationId = null;
      let currentConversation = null;
      let currentMessages = [];
      let conversations = [];
      let projects = [];
      let smartProjects = [];
      let systems = [];
      let selectedSystem = null;
      let systemChatSessionId = null;
      let systemChatMessages = [];
      let agents = [];
      let selectedAgentId = null;
      let selectedAgentConversationId = null;
      let agentMessages = [];
      let selectedSmartProjectId = null;
      let selectedProject = null;
      let technicalProjects = [];
      let selectedTechnicalProject = null;
      let technicalChatSessionId = null;
      let generatedProject = null;
      let pendingAttachment = null;
      let currentProjectDetails = null;
      let audioRecorder = null;
      let audioStream = null;
      let audioChunks = [];
      let documentTemplates = [];
      let currentDocuments = [];
      let currentFiles = [];
      let currentImages = [];
      let currentCalendarEvents = [];
      let currentReminders = [];
      let currentCalendarRange = "today";
      let auditPage = 1;
      let pendingImageFile = null;
      let pendingImagePreviewUrl = "";
      let responseState = "done";
      let isResponding = false;
      let useWebSearchNext = false;
      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognitionSupported = Boolean(SpeechRecognitionCtor);
      const speechSynthesisSupported = "speechSynthesis" in window;
      let speechRecognition = null;
      let isListening = false;
      let conversationMode = false;
      let voiceBaseText = "";
      let activeUtterance = null;
      let speakingMessageId = null;
      let speechPaused = false;
      const uiBuild = "pilar-01-fase-9-productivity-workspace";
      let voiceSettings = {
        enabled: true,
        language: "pt-BR",
        rate: 1,
        pitch: 1,
        gender: "auto",
        autoRead: false
      };

      const els = {
        accountName: document.getElementById("accountName"),
        accountAvatar: document.getElementById("accountAvatar"),
        accountEmail: document.getElementById("accountEmail"),
        settingsAvatar: document.getElementById("settingsAvatar"),
        settingsName: document.getElementById("settingsName"),
        settingsEmail: document.getElementById("settingsEmail"),
        pageTitle: document.getElementById("pageTitle"),
        pageSubtitle: document.getElementById("pageSubtitle"),
        pinnedList: document.getElementById("pinnedList"),
        conversationList: document.getElementById("conversationList"),
        messages: document.getElementById("messages"),
        messageInput: document.getElementById("messageInput"),
        sendButton: document.getElementById("sendButton"),
        webSearchToggle: document.getElementById("webSearchToggle"),
        dictationButton: document.getElementById("dictationButton"),
        conversationModeButton: document.getElementById("conversationModeButton"),
        voiceStatus: document.getElementById("voiceStatus"),
        attachmentPreview: document.getElementById("attachmentPreview"),
        fileInputImages: document.getElementById("fileInputImages"),
        fileInputDocument: document.getElementById("fileInputDocument"),
        fileInputPdf: document.getElementById("fileInputPdf"),
        fileInputCamera: document.getElementById("fileInputCamera"),
        toast: document.getElementById("toast"),
        sidebar: document.getElementById("sidebar"),
        chatActionMenu: document.getElementById("chatActionMenu"),
        attachMenu: document.getElementById("attachMenu"),
        modalOverlay: document.getElementById("modalOverlay"),
        modalTitle: document.getElementById("modalTitle"),
        modalText: document.getElementById("modalText"),
        modalBody: document.getElementById("modalBody")
      };

      function api(path, options) {
        const headers = Object.assign(
          { "Content-Type": "application/json", Authorization: "Bearer " + token },
          options && options.headers ? options.headers : {}
        );
        return fetch(path, Object.assign({}, options || {}, { headers })).then(async function(response) {
          const data = await response.json().catch(function() { return {}; });
          if (!response.ok) {
            const message = data.error && data.error.message ? data.error.message : "Não foi possível concluir a ação.";
            throw new Error(message);
          }
          return data;
        });
      }

      function apiForm(path, formData) {
        return fetch(path, {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData
        }).then(async function(response) {
          const data = await response.json().catch(function() { return {}; });
          if (!response.ok) {
            const message = data.error && data.error.message ? data.error.message : "Não foi possível enviar este arquivo.";
            throw new Error(message);
          }
          return data;
        });
      }

      function fetchProtectedFile(url) {
        return fetch(url, { headers: { Authorization: "Bearer " + token } }).then(function(response) {
          if (!response.ok) throw new Error("Não foi possível abrir este arquivo.");
          return response.blob();
        });
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function formatFileSize(bytes) {
        const size = Number(bytes || 0);
        if (size >= 1024 * 1024) return (Math.round(size / 1024 / 102.4) / 10) + " MB";
        return Math.max(1, Math.ceil(size / 1024)) + " KB";
      }

      function isImageType(type) {
        return String(type || "").startsWith("image/");
      }

      function isAudioType(type) {
        return String(type || "").startsWith("audio/");
      }

      function attachmentMeta(file) {
        return escapeHtml(file.file_type || file.type || "arquivo") + " · " + formatFileSize(file.file_size || file.size || 0);
      }

      function highlightCode(code) {
        return escapeHtml(code)
          .replace(/(\\/\\/.*)$/gm, '<span class="code-comment">$1</span>')
          .replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, '<span class="code-string">$1</span>')
          .replace(/\\b(const|let|var|function|return|async|await|import|export|from|class|type|interface|if|else|for|while|try|catch|new)\\b/g, '<span class="code-keyword">$1</span>');
      }

      function renderMarkdown(value) {
        let text = String(value || "");
        const blocks = [];
        const tick = String.fromCharCode(96);
        const fence = tick + tick + tick;
        text = text.replace(new RegExp(fence + "([^\\n]*)\\n([\\\\s\\\\S]*?)" + fence, "g"), function(_, language, code) {
          const label = escapeHtml(String(language || "código").trim() || "código");
          const cleanCode = String(code || "").trim();
          const html = '<div class="code-block"><div class="code-head"><span>' + label + '</span><button class="code-copy" data-copy-code="' + escapeHtml(cleanCode) + '" type="button">Copiar</button></div><pre><code>' + highlightCode(cleanCode) + '</code></pre></div>';
          blocks.push(html);
          return "§§CODE_BLOCK_" + (blocks.length - 1) + "§§";
        });
        let html = escapeHtml(text);
        html = html.replace(new RegExp(tick + "([^" + tick + "]+)" + tick, "g"), function(_, code) {
          return '<code>' + escapeHtml(code) + '</code>';
        });
        html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
        html = html.split(/\\n{2,}/).map(function(block) {
          return /^§§CODE_BLOCK_\\d+§§$/.test(block.trim()) ? block.trim() : '<p>' + block.replace(/\\n/g, "<br />") + '</p>';
        }).join("");
        blocks.forEach(function(block, index) {
          html = html.replace("§§CODE_BLOCK_" + index + "§§", block);
        });
        return html;
      }

      function emptyChatHtml() {
        return '<div class="empty-chat"><h2>Como posso ajudar você hoje?</h2></div>';
      }

      function initials(name) {
        return String(name || "YA").trim().slice(0, 2).toUpperCase();
      }

      function byId(id) {
        return document.getElementById(id);
      }

      function on(id, eventName, handler) {
        const target = typeof id === "string" ? byId(id) : id;
        if (!target) {
          console.warn("[YARA UI] Listener não registrado: elemento ausente", id, eventName);
          return;
        }
        target.addEventListener(eventName, function(event) {
          try {
            const result = handler(event);
            if (result && typeof result.catch === "function") {
              result.catch(function(error) {
                handleUiError("handler:" + eventName, error);
              });
            }
          } catch (error) {
            handleUiError("handler:" + eventName, error);
          }
        });
      }

      function getValue(id, fallback) {
        const target = typeof id === "string" ? byId(id) : id;
        return target && "value" in target ? target.value : (fallback || "");
      }

      function setValue(id, value) {
        const target = typeof id === "string" ? byId(id) : id;
        if (target && "value" in target) target.value = value == null ? "" : value;
      }

      function getChecked(id) {
        const target = typeof id === "string" ? byId(id) : id;
        return Boolean(target && "checked" in target && target.checked);
      }

      function setText(id, value) {
        const target = typeof id === "string" ? byId(id) : id;
        if (target) target.textContent = value == null ? "" : String(value);
      }

      function setHtml(id, value) {
        const target = typeof id === "string" ? byId(id) : id;
        if (target) target.innerHTML = value == null ? "" : String(value);
      }

      function setHidden(id, value) {
        const target = typeof id === "string" ? byId(id) : id;
        if (target) target.hidden = Boolean(value);
      }

      function errorMessage(error, fallback) {
        return error && error.message ? error.message : (fallback || "Não foi possível concluir esta ação.");
      }

      function friendlyChatError(error) {
        const message = errorMessage(error, "");
        if (/Failed to fetch|NetworkError|Load failed|interrompida|timeout/i.test(message)) {
          return "A conexão com a YARA oscilou agora. Verifique sua internet e tente enviar novamente.";
        }
        if (/Gemini|OpenAI|API key|quota|rate|provider|IA|motor de IA|alta demanda/i.test(message)) {
          return "A YARA recebeu sua mensagem, mas a inteligência artificial está temporariamente indisponível. Tente novamente em alguns instantes.";
        }
        return message || "A YARA não conseguiu responder agora. Tente novamente em alguns instantes.";
      }

      function describeControl(control) {
        if (!control) return "-";
        return [
          control.id ? "#" + control.id : "",
          control.dataset && control.dataset.view ? "view:" + control.dataset.view : "",
          control.dataset && control.dataset.action ? "action:" + control.dataset.action : "",
          control.dataset && control.dataset.settingsTab ? "settings:" + control.dataset.settingsTab : "",
          (control.textContent || "").trim().slice(0, 80)
        ].filter(Boolean).join(" · ") || control.tagName || "-";
      }

      function updateDiagnosticPanel(payload) {
        const panel = byId("diagnosticPanel");
        if (!panel) return;
        setText("diagnosticView", payload.view || currentView || "-");
        setText("diagnosticButton", payload.button || lastClickedControl || "-");
        setText("diagnosticModule", payload.module || "-");
        setText("diagnosticError", payload.error || "-");
        panel.hidden = false;
        panel.classList.add("open");
      }

      function clearDiagnosticPanel() {
        const panel = byId("diagnosticPanel");
        if (!panel) return;
        panel.hidden = true;
        panel.classList.remove("open");
      }

      function handleUiError(context, error, options) {
        const message = errorMessage(error);
        console.error("[YARA UI]", context, error);
        updateDiagnosticPanel({
          view: currentView,
          button: lastClickedControl,
          module: options && options.view ? options.view : context,
          error: message
        });
        if (!options || options.toast !== false) showToast(message);
        if (options && options.view) showModuleError(options.view, message);
      }

      function moduleTarget(view) {
        return byId("view-" + view);
      }

      function clearModuleError(view) {
        const target = moduleTarget(view);
        if (!target) return;
        const existing = target.querySelector("[data-module-error]");
        if (existing) existing.remove();
      }

      function showModuleError(view, message) {
        const target = moduleTarget(view);
        if (!target) return;
        const existing = target.querySelector("[data-module-error]");
        const html = '<div class="module-error" data-module-error><div><strong>Este módulo encontrou um erro.</strong><span>' + escapeHtml(message) + '</span></div><button class="button" data-retry-view="' + escapeHtml(view) + '" type="button">Tentar novamente</button></div>';
        if (existing) {
          existing.outerHTML = html;
          return;
        }
        const panel = target.querySelector(".panel") || target;
        panel.insertAdjacentHTML("afterbegin", html);
      }

      function safeDocumentListener(eventName, handler) {
        document.addEventListener(eventName, function(event) {
          try {
            const result = handler(event);
            if (result && typeof result.catch === "function") {
              result.catch(function(error) {
                handleUiError("document:" + eventName, error);
              });
            }
          } catch (error) {
            handleUiError("document:" + eventName, error);
          }
        });
      }

      function showToast(message) {
        if (!els.toast) {
          console.warn("[YARA UI] Toast indisponível:", message);
          return;
        }
        els.toast.textContent = message;
        els.toast.classList.add("show");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function() {
          els.toast.classList.remove("show");
        }, 3600);
      }

      function openModal(title, text, body) {
        setText(els.modalTitle, title);
        setText(els.modalText, text || "");
        setHtml(els.modalBody, body || "");
        if (els.modalOverlay) els.modalOverlay.classList.add("open");
      }

      function closeModal() {
        if (els.modalOverlay) els.modalOverlay.classList.remove("open");
        setHtml(els.modalBody, "");
      }

      async function openQuickSettingsModal() {
        const data = await api("/api/settings");
        const settings = data.settings || {};
        openModal("Configurações", "Ajustes rápidos da sua experiência com a YARA AI.", [
          '<div class="tabs modal-tabs" id="quickSettingsTabs">',
          '<button class="tab active" data-modal-settings-tab="general" type="button">Geral</button>',
          '<button class="tab" data-modal-settings-tab="appearance" type="button">Aparência</button>',
          '<button class="tab" data-modal-settings-tab="account" type="button">Conta</button>',
          '<button class="tab" data-modal-settings-tab="privacy" type="button">Privacidade</button>',
          '</div>',
          '<form class="card modal-settings-pane" id="quickSettingsForm" data-modal-pane="general">',
          '<label class="muted">Idioma</label>',
          '<select class="select" id="quickLanguage"><option value="pt-BR">Português</option><option value="en-US">Inglês</option><option value="es">Espanhol</option></select>',
          '<label class="muted">Estilo da YARA</label>',
          '<select class="select" id="quickAiStyle"><option value="balanced">Equilibrada</option><option value="direct">Direta</option><option value="technical">Técnica</option><option value="creative">Criativa</option><option value="executive">Executiva</option></select>',
          '<label class="muted">Tamanho das respostas</label>',
          '<select class="select" id="quickResponseLength"><option value="short">Curta</option><option value="medium">Média</option><option value="detailed">Detalhada</option></select>',
          '<article class="toggle-row"><div><strong>Enter para enviar</strong><p class="muted">Use Shift + Enter para quebrar linha.</p></div><span class="toggle active"></span></article>',
          '<button class="primary-action" type="submit">${icon("save")}Salvar alterações</button>',
          '</form>',
          '<div class="card modal-settings-pane" data-modal-pane="appearance" hidden>',
          '<h2>Aparência</h2><article class="toggle-row"><div><strong>Tema escuro</strong><p class="muted">Ativo para toda a plataforma.</p></div><span class="toggle active"></span></article>',
          '<article class="toggle-row"><div><strong>Interface compacta no celular</strong><p class="muted">Reduz cards grandes e mantém o chat em foco.</p></div><span class="toggle active"></span></article>',
          '</div>',
          '<div class="card modal-settings-pane" data-modal-pane="account" hidden>',
          '<h2>Conta</h2><p class="muted">Gerencie perfil, senha e sessões na área completa de configurações.</p><button class="button" id="openFullSettingsFromModal" type="button">${icon("settings")}Abrir configurações completas</button>',
          '</div>',
          '<div class="card modal-settings-pane" data-modal-pane="privacy" hidden>',
          '<h2>Privacidade</h2><article class="toggle-row"><div><strong>Chaves protegidas no servidor</strong><p class="muted">O app nunca acessa chaves de IA diretamente.</p></div><span class="toggle active"></span></article>',
          '<article class="toggle-row"><div><strong>Arquivos privados</strong><p class="muted">Downloads exigem login e pertencem ao usuário autenticado.</p></div><span class="toggle active"></span></article>',
          '</div>'
        ].join(""));
        setValue("quickLanguage", settings.language || "pt-BR");
        setValue("quickAiStyle", settings.ai_style || "balanced");
        setValue("quickResponseLength", settings.response_length || "medium");
      }

      function openHelpModal() {
        openModal("Ajuda e suporte", "Como usar a YARA AI no dia a dia.", '<div class="list"><article class="list-item"><strong>Chat</strong><p class="muted">Faça perguntas, envie arquivos, grave áudio e continue conversas pelo histórico.</p></article><article class="list-item"><strong>Projetos</strong><p class="muted">Vincule conversas, tarefas, notas e arquivos para organizar entregas reais.</p></article><article class="list-item"><strong>Gerador</strong><p class="muted">Use o módulo separado para criar sistemas, APIs, dashboards e apps.</p></article></div>');
      }

      function openTermsModal() {
        openModal("Termos e privacidade", "Resumo de segurança da plataforma.", '<div class="list"><article class="list-item"><strong>Privacidade</strong><p class="muted">Seus arquivos e conversas exigem autenticação para acesso.</p></article><article class="list-item"><strong>IA segura</strong><p class="muted">Gemini/OpenAI são acessados apenas pelo backend, nunca diretamente pelo navegador ou APK.</p></article><article class="list-item"><strong>Credenciais</strong><p class="muted">Nenhuma chave, token ou segredo é exibido na interface.</p></article></div>');
      }

      function viewConfig(view) {
        const configs = {
          chat: { title: "YARA AI", subtitle: "Chat geral com a YARA." },
          dashboard: { title: "Dashboard", subtitle: "Resumo da sua atividade.", loader: loadDashboard },
          generator: { title: "Gerador de Sistemas", subtitle: "Crie sistemas completos em um módulo separado." },
          systems: { title: "Sistemas", subtitle: "Criador de Sistemas", loader: loadSystems },
          agents: { title: "Agentes", subtitle: "Agentes especializados, roteamento inteligente e colaboração.", loader: loadAgents },
          projects: { title: "Projetos", subtitle: "Organize projetos, tarefas, notas e arquivos.", loader: loadProjects },
          technicalProjects: { title: "Projetos Técnicos", subtitle: "Chat técnico, inspeções, arquivos e relatórios de engenharia.", loader: loadTechnicalProjects },
          smartProjects: { title: "Projetos Inteligentes", subtitle: "Memória de decisões, fases, pendências e commits.", loader: loadSmartProjects },
          knowledge: { title: "Conhecimento", subtitle: "GraphRAG com relações entre dados da YARA.", loader: loadGraph },
          smartSearch: { title: "Busca Inteligente", subtitle: "Busca vetorial, híbrida e contextual em todo o workspace.", loader: loadSmartSearch },
          consolidatedMemory: { title: "Memória Consolidada", subtitle: "Consolidação, conflitos e qualidade da memória da YARA.", loader: loadConsolidatedMemory },
          documents: { title: "Documentos", subtitle: "Gere e baixe documentos protegidos.", loader: loadDocuments },
          files: { title: "Arquivos", subtitle: "Envie, visualize, baixe e exporte arquivos reais.", loader: loadFiles },
          images: { title: "Imagens", subtitle: "OCR, análise e edição inicial de imagens.", loader: loadImages },
          calendar: { title: "Agenda", subtitle: "Eventos, lembretes e notificações.", loader: loadCalendar },
          integrations: { title: "Integrações", subtitle: "Google, Gmail, Telegram, WhatsApp e notificações.", loader: loadIntegrations },
          automations: { title: "Automações", subtitle: "Fluxos inteligentes entre módulos, agentes e arquivos.", loader: loadAutomationWorkspace },
          marketplace: { title: "Marketplace", subtitle: "Plugins, ferramentas e módulos extensíveis da YARA.", loader: loadMarketplace },
          audit: { title: "Auditoria", subtitle: "Segurança, logs, backups e saúde da produção.", loader: loadAudit },
          settings: { title: "Configurações", subtitle: "Preferências, conta e memória da YARA.", loader: loadSettings }
        };
        return configs[view] || null;
      }

      async function runModuleLoader(view, loader) {
        if (!loader) {
          clearModuleError(view);
          return;
        }
        try {
          await loader();
          clearModuleError(view);
        } catch (error) {
          handleUiError("module:" + view, error, { view: view });
        }
      }

      function setView(view) {
        const requestedView = view || "chat";
        let targetView = requestedView === "memory" ? "settings" : requestedView;
        const config = viewConfig(targetView);
        if (!config || !moduleTarget(targetView)) {
          console.warn("[YARA UI] View inválida, voltando para chat:", requestedView);
          targetView = "chat";
        }
        const finalConfig = viewConfig(targetView) || viewConfig("chat");
        currentView = targetView;
        document.body.classList.toggle("systems-mode", targetView === "systems");
        clearDiagnosticPanel();
        console.info("[YARA UI] Navegando para módulo:", requestedView, "=>", targetView);
        document.querySelectorAll(".view").forEach(function(item) {
          item.hidden = item.id !== "view-" + targetView;
        });
        const activeView = requestedView === "memory" ? "memory" : targetView;
        document.querySelectorAll(".nav-button").forEach(function(item) {
          item.classList.toggle("active", item.dataset.view === activeView);
        });
        setText("pageTitle", finalConfig.title);
        setText("pageSubtitle", finalConfig.subtitle);
        closeSidebarDrawer();
        closeChatMenu();
        closeAttachMenu();
        document.body.classList.remove("menu-open");
        runModuleLoader(targetView, finalConfig.loader).then(function() {
          if (requestedView === "memory") selectSettingsTab("memory");
        });
      }

      function settingsTabLoader(tabName) {
        const loaders = {
          memory: loadMemories,
          profile: loadCognitiveProfile,
          files: loadUploads,
          documents: loadDocuments,
          ai: loadAiStatus
        };
        return loaders[tabName] || null;
      }

      function showSettingsTabError(tabName, error) {
        const pane = byId("settings-" + tabName);
        if (!pane) return;
        const existing = pane.querySelector("[data-settings-error]");
        const html = '<div class="module-error" data-settings-error><div><strong>Este módulo encontrou um erro.</strong><span>' + escapeHtml(errorMessage(error)) + '</span></div><button class="button" data-retry-settings-tab="' + escapeHtml(tabName) + '" type="button">Tentar novamente</button></div>';
        if (existing) {
          existing.outerHTML = html;
          return;
        }
        pane.insertAdjacentHTML("afterbegin", html);
      }

      function clearSettingsTabError(tabName) {
        const pane = byId("settings-" + tabName);
        if (!pane) return;
        const existing = pane.querySelector("[data-settings-error]");
        if (existing) existing.remove();
      }

      async function selectSettingsTab(tabName) {
        const pane = byId("settings-" + tabName);
        if (!pane) {
          console.warn("[YARA UI] Aba de configurações inválida:", tabName);
          showToast("Aba de configurações indisponível.");
          return;
        }
        document.querySelectorAll(".tab").forEach(function(tab) {
          tab.classList.toggle("active", tab.dataset.settingsTab === tabName);
        });
        document.querySelectorAll(".settings-pane").forEach(function(pane) {
          pane.hidden = pane.id !== "settings-" + tabName;
        });
        const loader = settingsTabLoader(tabName);
        if (!loader) return;
        try {
          await loader();
          clearSettingsTabError(tabName);
        } catch (error) {
          console.error("[YARA UI] Falha na aba de configurações:", tabName, error);
          showSettingsTabError(tabName, error);
          showToast(errorMessage(error));
        }
      }

      function chatMenuElements() {
        return {
          button: byId("chatMenuButton"),
          menu: byId("chatActionMenu")
        };
      }

      function closeChatMenu() {
        const parts = chatMenuElements();
        if (parts.menu) {
          parts.menu.classList.remove("open");
          parts.menu.hidden = true;
        }
        if (parts.button) parts.button.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      }

      function openChatMenu() {
        const parts = chatMenuElements();
        if (!parts.menu) {
          showToast("Menu da conversa indisponível.");
          return;
        }
        if (els.attachMenu) els.attachMenu.classList.remove("open");
        parts.menu.hidden = false;
        parts.menu.classList.add("open");
        if (parts.button) parts.button.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
      }

      function toggleChatMenu(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        const parts = chatMenuElements();
        if (parts.menu && parts.menu.classList.contains("open")) {
          closeChatMenu();
          return;
        }
        openChatMenu();
      }

      function closeSidebarDrawer() {
        if (!els.sidebar) return;
        els.sidebar.classList.remove("open");
        document.body.classList.remove("drawer-open");
        document.querySelectorAll("[data-sidebar-toggle]").forEach(function(button) {
          button.setAttribute("aria-expanded", "false");
        });
      }

      function toggleSidebarDrawer() {
        if (!els.sidebar) return;
        const willOpen = !els.sidebar.classList.contains("open");
        els.sidebar.classList.toggle("open", willOpen);
        document.body.classList.toggle("drawer-open", willOpen);
        document.querySelectorAll("[data-sidebar-toggle]").forEach(function(button) {
          button.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });
      }

      function normalizeSidebarForViewport() {
        if (window.innerWidth >= 1024) {
          closeSidebarDrawer();
        }
      }

      function closeAttachMenu() {
        if (els.attachMenu) els.attachMenu.classList.remove("open");
      }

      function toggleAttachMenu() {
        if (!els.attachMenu) return;
        closeChatMenu();
        els.attachMenu.classList.toggle("open");
      }

      function renderConversationGroup(target, items, emptyText) {
        if (!target) return;
        if (!items.length) {
          target.innerHTML = '<p class="muted">' + emptyText + '</p>';
          return;
        }
        target.innerHTML = items.map(function(item) {
          return '<button class="conversation-button ' + (item.id === currentConversationId ? "active" : "") + '" data-conversation="' + item.id + '" type="button">' + (item.is_pinned ? '<span class="pin-dot"></span>' : '${icon("chat")}') + '<span class="conversation-title">' + escapeHtml(item.title) + '</span></button>';
        }).join("");
      }

      function conversationBucket(item) {
        const date = new Date(item.updated_at || item.created_at || Date.now());
        const now = new Date();
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startItem = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.floor((startToday.getTime() - startItem.getTime()) / 86400000);
        if (diffDays <= 0) return "Hoje";
        if (diffDays === 1) return "Ontem";
        if (diffDays <= 7) return "Esta semana";
        return "Últimos 30 dias";
      }

      function renderConversationHistory(target, items) {
        if (!target) return;
        if (!items.length) {
          target.innerHTML = '<p class="muted">Nenhuma conversa ainda.</p>';
          return;
        }
        const groups = ["Hoje", "Ontem", "Esta semana", "Últimos 30 dias"];
        target.innerHTML = groups.map(function(group) {
          const groupItems = items.filter(function(item) { return conversationBucket(item) === group; });
          if (!groupItems.length) return "";
          return '<section class="conversation-period"><h3>' + group + '</h3>' + groupItems.map(function(item) {
            return '<button class="conversation-button ' + (item.id === currentConversationId ? "active" : "") + '" data-conversation="' + item.id + '" type="button">${icon("chat")}<span class="conversation-title">' + escapeHtml(item.title) + '</span></button>';
          }).join("") + '</section>';
        }).join("");
      }

      function renderConversations() {
        const pinned = conversations.filter(function(item) { return Number(item.is_pinned) === 1; });
        const history = conversations.filter(function(item) { return Number(item.is_pinned) !== 1; });
        renderConversationGroup(els.pinnedList, pinned, "Nenhuma conversa fixada.");
        renderConversationHistory(els.conversationList, history);
      }

      async function loadConversations() {
        const data = await api("/api/conversations");
        conversations = data.conversations || [];
        renderConversations();
      }

      function renderAttachment(upload) {
        const name = escapeHtml(upload.original_name || upload.file_name || "Arquivo");
        const meta = attachmentMeta(upload);
        const id = escapeHtml(upload.id);
        const iconMarkup = isImageType(upload.file_type)
          ? '<img class="attachment-thumb" data-upload-image="' + id + '" alt="' + name + '" />'
          : isAudioType(upload.file_type)
            ? '<audio class="audio-player" controls preload="metadata" data-upload-audio="' + id + '"></audio>'
          : '<span class="attachment-icon">${icon("file")}</span>';

        return '<div class="attachment-card">' + iconMarkup + '<span class="attachment-meta"><strong>' + name + '</strong><span>' + meta + '</span></span><button class="button" data-download-upload="' + id + '" data-file-name="' + name + '" type="button">Abrir</button></div>';
      }

      function hydrateProtectedImages() {
        document.querySelectorAll("[data-upload-image]").forEach(function(image) {
          const uploadId = image.getAttribute("data-upload-image");
          if (!uploadId || image.dataset.loaded === "true") return;
          image.dataset.loaded = "true";
          fetchProtectedFile("/api/uploads/" + uploadId + "/download")
            .then(function(blob) { image.src = URL.createObjectURL(blob); })
            .catch(function() { image.alt = "Imagem indisponível"; });
        });
        document.querySelectorAll("[data-upload-audio]").forEach(function(audio) {
          const uploadId = audio.getAttribute("data-upload-audio");
          if (!uploadId || audio.dataset.loaded === "true") return;
          audio.dataset.loaded = "true";
          fetchProtectedFile("/api/uploads/" + uploadId + "/download")
            .then(function(blob) { audio.src = URL.createObjectURL(blob); })
            .catch(function() { audio.replaceWith(document.createTextNode("Áudio indisponível")); });
        });
      }

      async function downloadUpload(uploadId, fileName) {
        return downloadProtectedPath("/api/uploads/" + uploadId + "/download", fileName || "arquivo");
      }

      async function downloadDocument(documentId, fileName) {
        return downloadProtectedPath("/api/documents/" + documentId + "/download", fileName || "documento");
      }

      async function downloadFile(fileId, fileName) {
        return downloadProtectedPath("/api/files/" + fileId + "/download", fileName || "arquivo");
      }

      async function downloadProtectedPath(path, fileName) {
        try {
          const blob = await fetchProtectedFile(path);
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName || "arquivo";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        } catch (error) {
          showToast(error.message || "Não foi possível abrir este documento.");
        }
      }

      function fileDisplayName(file) {
        return file.name || file.original_name || file.file_name || "Arquivo";
      }

      function fileMime(file) {
        return file.type || file.file_type || "arquivo";
      }

      function fileExtension(file) {
        const name = fileDisplayName(file).toLowerCase();
        const fromName = name.includes(".") ? name.split(".").pop() : "";
        const mime = fileMime(file).toLowerCase();
        if (fromName) return fromName;
        if (mime.includes("pdf")) return "pdf";
        if (mime.includes("word")) return "docx";
        if (mime.includes("spreadsheet")) return "xlsx";
        if (mime.includes("csv")) return "csv";
        if (mime.includes("text")) return "txt";
        if (mime.startsWith("image/")) return "image";
        return "arquivo";
      }

      function fileMeta(file) {
        const source = file.source === "generated" ? "gerado pela IA" : file.source === "upload" || file.category === "uploaded" ? "enviado" : file.source || file.category || "arquivo";
        return escapeHtml(fileMime(file)) + " · " + formatFileSize(file.size || file.file_size || 0) + " · " + escapeHtml(source);
      }

      function renderGeneratedFileAttachment(file) {
        const name = escapeHtml(fileDisplayName(file));
        const id = escapeHtml(file.id || "");
        const ext = fileExtension(file);
        const iconMarkup = isImageType(fileMime(file)) ? '${icon("image")}' : '${icon("file")}';
        return '<div class="attachment-card"><span class="attachment-icon">' + iconMarkup + '</span><span class="attachment-meta"><strong>' + name + '</strong><span>' + fileMeta(file) + '</span></span><div class="row"><button class="button" data-preview-file="' + id + '" type="button">Visualizar</button><button class="button" data-download-file="' + id + '" data-file-name="' + name + '" type="button">Baixar</button></div></div>';
      }

      async function previewFile(fileId) {
        const data = await api("/api/files/" + fileId);
        const file = data.file || {};
        const title = fileDisplayName(file);
        if (data.previewType === "text" || data.previewType === "docx") {
          openModal("Visualizar arquivo", title, '<pre class="code-block">' + escapeHtml(data.preview || "Prévia indisponível.") + '</pre>');
          return;
        }
        if (data.previewType === "pdf") {
          const blob = await fetchProtectedFile("/api/files/" + fileId + "/download?inline=1");
          const url = URL.createObjectURL(blob);
          openModal("Visualizar PDF", title, '<iframe class="file-preview-frame" src="' + url + '" title="' + escapeHtml(title) + '"></iframe>');
          return;
        }
        if (data.previewType === "image") {
          const blob = await fetchProtectedFile("/api/files/" + fileId + "/download?inline=1");
          const url = URL.createObjectURL(blob);
          openModal("Visualizar imagem", title, '<img class="file-preview-image" src="' + url + '" alt="' + escapeHtml(title) + '" />');
          return;
        }
        openModal("Visualizar arquivo", title, '<p class="muted">Prévia interna indisponível para este formato. Use o botão Baixar para abrir no seu dispositivo.</p>');
      }

      function findMessage(messageId) {
        return currentMessages.find(function(message) { return message.id === messageId; });
      }

      function formatTime(value) {
        if (!value) return "";
        try {
          return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
        } catch {
          return "";
        }
      }

      function autoGrowMessageInput() {
        if (!els.messageInput) return;
        els.messageInput.style.height = "auto";
        els.messageInput.style.height = Math.min(132, els.messageInput.scrollHeight) + "px";
      }

      function scrollMessagesToBottom() {
        if (!els.messages) return;
        window.requestAnimationFrame(function() {
          if (!els.messages) return;
          els.messages.scrollTop = els.messages.scrollHeight;
        });
      }

      function setResponseState(state) {
        responseState = state;
        isResponding = state === "sending" || state === "thinking" || state === "typing";
        if (els.sendButton) {
          els.sendButton.disabled = isResponding;
          els.sendButton.setAttribute("aria-busy", isResponding ? "true" : "false");
          els.sendButton.innerHTML = isResponding
            ? '<span class="send-spinner" aria-hidden="true"></span><span>Enviando</span>'
            : '${icon("send")}Enviar';
        }
      }

      function setWebSearchNext(active) {
        useWebSearchNext = Boolean(active);
        if (els.webSearchToggle) {
          els.webSearchToggle.classList.toggle("active", useWebSearchNext);
          els.webSearchToggle.setAttribute("aria-pressed", useWebSearchNext ? "true" : "false");
        }
      }

      function setVoiceStatus(message, state) {
        const safeState = state || "idle";
        if (!els.voiceStatus) return;
        els.voiceStatus.className = "voice-status " + safeState;
        els.voiceStatus.innerHTML = '<span class="voice-waves" aria-hidden="true"><span></span><span></span><span></span></span><strong>' + escapeHtml(message) + '</strong>';
      }

      function refreshVoiceControls() {
        if (els.dictationButton) {
          els.dictationButton.classList.toggle("listening", isListening);
          els.dictationButton.setAttribute("aria-pressed", isListening ? "true" : "false");
        }
        if (els.conversationModeButton) {
          els.conversationModeButton.classList.toggle("active", conversationMode);
          els.conversationModeButton.setAttribute("aria-pressed", conversationMode ? "true" : "false");
        }
      }

      function updateSpeechSupportText() {
        const support = document.getElementById("speechSupportText");
        if (!support) return;
        const stt = speechRecognitionSupported ? "Ditado disponível neste navegador." : "Ditado indisponível neste navegador.";
        const tts = speechSynthesisSupported ? "Leitura de respostas disponível." : "Leitura de respostas indisponível.";
        support.textContent = stt + " " + tts + " Chrome e Edge oferecem a melhor compatibilidade; Safari pode variar por versão.";
      }

      function applyVoiceSettings(settings) {
        voiceSettings = {
          enabled: Boolean(settings.voice_enabled ?? true),
          language: settings.voice_language || settings.language || "pt-BR",
          rate: Number(settings.voice_rate || 1),
          pitch: Number(settings.voice_pitch || 1),
          gender: settings.voice_gender || "auto",
          autoRead: Boolean(settings.voice_auto_read)
        };

        const enabled = document.getElementById("voiceEnabled");
        const language = document.getElementById("voiceLanguage");
        const rate = document.getElementById("voiceRate");
        const pitch = document.getElementById("voicePitch");
        const gender = document.getElementById("voiceGender");
        const autoRead = document.getElementById("voiceAutoRead");
        if (enabled) enabled.checked = voiceSettings.enabled;
        if (language) language.value = voiceSettings.language;
        if (rate) rate.value = String(voiceSettings.rate);
        if (pitch) pitch.value = String(voiceSettings.pitch);
        if (gender) gender.value = voiceSettings.gender;
        if (autoRead) autoRead.checked = voiceSettings.autoRead;
        updateSpeechSupportText();
      }

      function cleanTextForSpeech(value) {
        return String(value || "")
          .replace(/\\x60\\x60\\x60[\\s\\S]*?\\x60\\x60\\x60/g, " bloco de código ")
          .replace(/\\x60([^\\x60]+)\\x60/g, "$1")
          .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, "$1")
          .replace(/[#*_>\\-]+/g, " ")
          .replace(/Fontes:\\s*[\\s\\S]*$/i, "Fontes listadas na conversa.")
          .replace(/\\s+/g, " ")
          .trim();
      }

      function chooseVoice() {
        if (!speechSynthesisSupported) return null;
        const voices = window.speechSynthesis.getVoices();
        const language = voiceSettings.language || "pt-BR";
        const sameLanguage = voices.filter(function(voice) {
          return voice.lang && voice.lang.toLowerCase().startsWith(language.slice(0, 2).toLowerCase());
        });
        const pool = sameLanguage.length ? sameLanguage : voices;
        if (voiceSettings.gender === "female") {
          return pool.find(function(voice) { return /female|feminina|woman|maria|helena|luciana|francisca/i.test(voice.name); }) || pool[0] || null;
        }
        if (voiceSettings.gender === "male") {
          return pool.find(function(voice) { return /male|masculina|man|daniel|felipe|ricardo|joaquim/i.test(voice.name); }) || pool[0] || null;
        }
        return pool[0] || null;
      }

      function stopSpeech(announce) {
        if (speechSynthesisSupported) {
          window.speechSynthesis.cancel();
        }
        activeUtterance = null;
        speakingMessageId = null;
        speechPaused = false;
        if (announce !== false) setVoiceStatus("Leitura parada", "idle");
      }

      function speakText(value, messageId, options) {
        if (!voiceSettings.enabled) {
          setVoiceStatus("Voz desativada nas configurações", "error");
          return;
        }
        if (!speechSynthesisSupported) {
          setVoiceStatus("Leitura indisponível neste navegador", "error");
          return;
        }
        const text = cleanTextForSpeech(value);
        if (!text) return;
        stopSpeech(false);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceSettings.language || "pt-BR";
        utterance.rate = Number(voiceSettings.rate || 1);
        utterance.pitch = Number(voiceSettings.pitch || 1);
        const preferredVoice = chooseVoice();
        if (preferredVoice) utterance.voice = preferredVoice;
        activeUtterance = utterance;
        speakingMessageId = messageId || null;
        speechPaused = false;
        utterance.onstart = function() {
          setVoiceStatus("YARA está falando...", "speaking");
        };
        utterance.onend = function() {
          activeUtterance = null;
          speakingMessageId = null;
          speechPaused = false;
          setVoiceStatus(conversationMode ? "Ouvindo..." : "Voz pronta", conversationMode ? "listening" : "idle");
          if (options && options.resumeConversation && conversationMode) {
            window.setTimeout(function() { startDictation(true); }, 550);
          }
        };
        utterance.onerror = function() {
          activeUtterance = null;
          speakingMessageId = null;
          speechPaused = false;
          setVoiceStatus("Erro ao ler resposta", "error");
          if (options && options.resumeConversation && conversationMode) {
            window.setTimeout(function() { startDictation(true); }, 700);
          }
        };
        window.speechSynthesis.speak(utterance);
      }

      function toggleSpeechPause() {
        if (!speechSynthesisSupported || !activeUtterance) return;
        if (speechPaused) {
          window.speechSynthesis.resume();
          speechPaused = false;
          setVoiceStatus("YARA está falando...", "speaking");
        } else {
          window.speechSynthesis.pause();
          speechPaused = true;
          setVoiceStatus("Leitura pausada", "idle");
        }
      }

      function speakMessage(messageId, options) {
        const message = currentMessages.find(function(item) { return item.id === messageId; });
        if (!message || message.role !== "assistant") return;
        speakText(message.content || "", messageId, options || {});
      }

      function getSpeechRecognition() {
        if (!speechRecognitionSupported) return null;
        if (speechRecognition) return speechRecognition;
        speechRecognition = new SpeechRecognitionCtor();
        speechRecognition.interimResults = true;
        speechRecognition.continuous = false;
        speechRecognition.maxAlternatives = 1;
        speechRecognition.onstart = function() {
          isListening = true;
          refreshVoiceControls();
          setVoiceStatus(conversationMode ? "Ouvindo..." : "Gravando...", "listening");
        };
        speechRecognition.onresult = function(event) {
          let finalText = "";
          let interimText = "";
          for (let index = 0; index < event.results.length; index += 1) {
            const transcript = event.results[index][0] ? event.results[index][0].transcript : "";
            if (event.results[index].isFinal) finalText += transcript;
            else interimText += transcript;
          }
          const speechText = (finalText || interimText || "").trim();
          const base = voiceBaseText ? voiceBaseText + " " : "";
          setValue(els.messageInput, (base + speechText).trim());
          autoGrowMessageInput();
        };
        speechRecognition.onerror = function(event) {
          isListening = false;
          refreshVoiceControls();
          const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
          setVoiceStatus(denied ? "Permissão de microfone negada" : "Erro de microfone", "error");
          if (denied) conversationMode = false;
          refreshVoiceControls();
        };
        speechRecognition.onend = function() {
          const currentText = getValue(els.messageInput).trim();
          const hasText = currentText.length > 0 && currentText !== voiceBaseText;
          isListening = false;
          refreshVoiceControls();
          if (conversationMode && hasText && !isResponding) {
            setVoiceStatus("Enviando fala para a YARA...", "speaking");
            byId("chatForm")?.requestSubmit();
            return;
          }
          setVoiceStatus(conversationMode ? "Ouvindo..." : "Voz pronta", conversationMode ? "listening" : "idle");
          if (conversationMode && !isResponding && !activeUtterance) {
            window.setTimeout(function() { startDictation(true); }, 750);
          }
        };
        return speechRecognition;
      }

      function startDictation(fromConversation) {
        if (!voiceSettings.enabled) {
          setVoiceStatus("Voz desativada nas configurações", "error");
          return;
        }
        if (!speechRecognitionSupported) {
          setVoiceStatus("Ditado indisponível neste navegador", "error");
          return;
        }
        if (isListening) return;
        stopSpeech(false);
        const recognition = getSpeechRecognition();
        if (!recognition) return;
        recognition.lang = voiceSettings.language || "pt-BR";
        voiceBaseText = getValue(els.messageInput).trim();
        try {
          recognition.start();
        } catch {
          setVoiceStatus(fromConversation ? "Ouvindo..." : "Gravando...", "listening");
        }
      }

      function stopDictation() {
        if (!speechRecognition || !isListening) return;
        speechRecognition.stop();
      }

      function toggleDictation() {
        if (isListening) {
          stopDictation();
          return;
        }
        startDictation(false);
      }

      function setConversationMode(active) {
        conversationMode = Boolean(active);
        refreshVoiceControls();
        if (conversationMode) {
          setVoiceStatus("Ouvindo...", "listening");
          startDictation(true);
        } else {
          stopDictation();
          setVoiceStatus("Modo conversa desativado", "idle");
        }
      }

      function handleAssistantVoiceAfterResponse(messages) {
        const assistant = (messages || []).slice().reverse().find(function(message) {
          return message.role === "assistant" && message.content;
        });
        if (!assistant) return;
        if (conversationMode || voiceSettings.autoRead) {
          speakText(assistant.content, assistant.id, { resumeConversation: conversationMode });
        } else if (conversationMode) {
          window.setTimeout(function() { startDictation(true); }, 500);
        }
      }

      function renderSources(sources) {
        if (!sources || !sources.length) return '<p class="muted">Nenhuma fonte registrada.</p>';
        return sources.map(function(source, index) {
          return '<article class="list-item"><div class="item-top"><strong>' + (index + 1) + '. ' + escapeHtml(source.title || "Fonte") + '</strong><a class="button" href="' + escapeHtml(source.url || "#") + '" target="_blank" rel="noopener noreferrer">Abrir</a></div><p class="muted">' + escapeHtml(source.domain || source.url || "") + '</p></article>';
        }).join("");
      }

      async function showSearchHistory() {
        const data = await api("/api/search/history");
        const history = data.history || [];
        openModal("Histórico de pesquisas", "Fontes usadas pela YARA nas buscas recentes.", history.length ? history.map(function(item) {
          const sourceCount = item.sources ? item.sources.length : 0;
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.query) + '</strong><button class="button" data-open-search="' + item.id + '" type="button">Ver fontes</button></div><p class="muted">' + escapeHtml(item.provider || "busca") + ' · ' + escapeHtml(item.status || "") + ' · ' + sourceCount + ' fonte' + (sourceCount === 1 ? "" : "s") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma pesquisa registrada ainda.</p>');
      }

      async function showSearchDetails(searchId) {
        const data = await api("/api/search/" + searchId);
        const search = data.search;
        openModal("Fontes da pesquisa", search.query || "Pesquisa YARA", [
          '<article class="card"><h2>Resposta registrada</h2><p class="muted">' + escapeHtml(search.response || "") + '</p></article>',
          '<div class="list">' + renderSources(search.sources || []) + '</div>'
        ].join(""));
      }

      async function reloadCurrentConversation() {
        if (!currentConversationId) return;
        const conversation = await api("/api/conversations/" + currentConversationId);
        currentConversation = conversation.conversation;
        renderMessages(conversation.messages || []);
      }

      async function copyMessage(messageId) {
        const message = findMessage(messageId);
        if (!message) return showToast("Mensagem não encontrada.");
        await navigator.clipboard.writeText(message.content).catch(function() {});
        showToast("Mensagem copiada.");
      }

      async function editMessage(messageId) {
        const message = findMessage(messageId);
        if (!message) return showToast("Mensagem não encontrada.");
        const content = window.prompt("Editar mensagem", message.content);
        if (content === null) return;
        await api("/api/messages/" + messageId, {
          method: "PATCH",
          body: JSON.stringify({ content: content })
        });
        await reloadCurrentConversation();
        showToast("Mensagem editada.");
      }

      async function regenerateMessage(messageId) {
        await api("/api/messages/" + messageId + "/regenerate", { method: "POST" });
        await reloadCurrentConversation();
        showToast("Resposta regenerada.");
      }

      async function sendFeedback(messageId, value) {
        await api("/api/messages/" + messageId + "/feedback", {
          method: "POST",
          body: JSON.stringify({ value: value })
        });
        await reloadCurrentConversation();
        showToast(value === "like" ? "Feedback positivo registrado." : "Feedback negativo registrado.");
      }

      function renderMessages(messages) {
        currentMessages = messages || [];
        if (!els.messages) return;
        if (!currentMessages.length) {
          els.messages.innerHTML = emptyChatHtml();
          scrollMessagesToBottom();
          return;
        }
        els.messages.innerHTML = currentMessages.map(function(message) {
          const who = message.role === "user" ? "Você" : "YARA";
          const id = escapeHtml(message.id || "");
          const state = message.state || (message.typing ? "thinking" : "");
          const avatar = message.role === "assistant" ? '<span class="message-avatar">YA</span>' : "";
          const time = formatTime(message.created_at);
          const uploadCards = message.uploads && message.uploads.length ? message.uploads.map(renderAttachment).join("") : "";
          const generatedCards = message.files && message.files.length ? message.files.map(renderGeneratedFileAttachment).join("") : "";
          const uploads = uploadCards || generatedCards
            ? '<div class="message-attachments">' + uploadCards + generatedCards + '</div>'
            : "";
          const edited = message.edited_at ? '<span class="muted"> · editada</span>' : "";
          const actions = id
            ? '<div class="message-actions"><button class="message-action" data-copy-message="' + id + '" type="button">Copiar</button>' +
              (message.role === "user" ? '<button class="message-action" data-edit-message="' + id + '" type="button">Editar</button>' : "") +
              (message.role === "assistant" ? '<button class="message-action" data-speak-message="' + id + '" type="button">Ouvir</button><button class="message-action" data-pause-speech="' + id + '" type="button">Pausar/Continuar</button><button class="message-action" data-stop-speech="' + id + '" type="button">Parar</button><button class="message-action" data-regenerate-message="' + id + '" type="button">Regenerar</button><button class="message-action ' + (message.feedback === "like" ? "active" : "") + '" data-feedback-message="' + id + '" data-feedback-value="like" type="button">Curtir</button><button class="message-action ' + (message.feedback === "dislike" ? "active" : "") + '" data-feedback-message="' + id + '" data-feedback-value="dislike" type="button">Não curtir</button>' : "") +
              '</div>'
            : "";
          const contentHtml = state === "thinking"
            ? '<div class="typing-indicator" role="status" aria-live="polite" aria-label="YARA está pensando"><span>YARA está pensando...</span><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>'
            : renderMarkdown(message.content || "") + (state === "typing" ? '<span class="typing-cursor" aria-hidden="true"></span>' : "");
          return '<article class="message ' + message.role + (state ? " " + state : "") + '" data-message-id="' + id + '" data-state="' + escapeHtml(state) + '">' + avatar + '<small>' + who + edited + (time ? '<span class="message-time">' + time + '</span>' : "") + '</small><div class="message-content">' + contentHtml + '</div>' + uploads + actions + '</article>';
        }).join("");
        hydrateProtectedImages();
        scrollMessagesToBottom();
      }

      async function openConversation(id) {
        const data = await api("/api/conversations/" + id);
        currentConversationId = data.conversation.id;
        currentConversation = data.conversation;
        renderMessages(data.messages || []);
        await loadConversations();
        setView("chat");
      }

      async function newConversation() {
        const data = await api("/api/conversations", {
          method: "POST",
          body: JSON.stringify({ title: "Nova conversa" })
        });
        currentConversationId = data.conversation.id;
        currentConversation = data.conversation;
        renderMessages([]);
        await loadConversations();
        setView("chat");
        if (els.messageInput) els.messageInput.focus();
      }

      async function ensureConversation() {
        if (!currentConversationId) {
          await newConversation();
        }
      }

      function clearPendingAttachment() {
        if (pendingAttachment && pendingAttachment.previewUrl) {
          URL.revokeObjectURL(pendingAttachment.previewUrl);
        }
        pendingAttachment = null;
        if (els.attachmentPreview) {
          els.attachmentPreview.hidden = true;
          els.attachmentPreview.innerHTML = "";
        }
      }

      function setPendingAttachment(file) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
          showToast("Arquivo muito grande.");
          return;
        }
        clearPendingAttachment();

        const previewUrl = isImageType(file.type) || isAudioType(file.type) ? URL.createObjectURL(file) : null;
        pendingAttachment = { file: file, previewUrl: previewUrl };
        const visual = isImageType(file.type) && previewUrl
          ? '<img class="attachment-thumb" src="' + previewUrl + '" alt="' + escapeHtml(file.name) + '" />'
          : isAudioType(file.type) && previewUrl
            ? '<audio class="audio-preview" controls preload="metadata" src="' + previewUrl + '"></audio>'
          : '<span class="attachment-icon">${icon("file")}</span>';

        if (els.attachmentPreview) {
          els.attachmentPreview.innerHTML = visual + '<span class="attachment-meta"><strong>' + escapeHtml(file.name) + '</strong><span>' + escapeHtml(file.type || "arquivo") + " · " + formatFileSize(file.size) + '</span></span><button class="icon-button danger" id="removeAttachmentButton" type="button" aria-label="Remover anexo">${icon("trash")}</button>';
          els.attachmentPreview.hidden = false;
        }
      }

      async function uploadPendingAttachment() {
        if (!pendingAttachment) return null;
        await ensureConversation();
        const formData = new FormData();
        formData.append("conversationId", currentConversationId);
        formData.append("file", pendingAttachment.file);
        const data = await apiForm("/api/uploads", formData);
        clearPendingAttachment();
        showToast("Arquivo anexado com sucesso.");
        return data.upload;
      }

      async function streamChat(payload, baseMessages, userMessageText) {
        const userPreview = { role: "user", content: userMessageText || "Anexo enviado.", uploads: [] };
        renderMessages(baseMessages.concat([
          userPreview,
          { role: "assistant", content: "", state: "thinking" }
        ]));
        setResponseState("thinking");

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok || !response.body) {
          const data = await response.json().catch(function() { return {}; });
          throw new Error(data.error && data.error.message ? data.error.message : "A YARA não conseguiu responder agora.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";
        let donePayload = null;

        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true });
          const events = buffer.split("\\n\\n");
          buffer = events.pop() || "";

          events.forEach(function(rawEvent) {
            const eventName = /event: ([^\\n]+)/.exec(rawEvent)?.[1];
            const rawData = /data: ([\\s\\S]+)/.exec(rawEvent)?.[1];
            if (!rawData) return;
            const data = JSON.parse(rawData);
            if (eventName === "chunk") {
              assistantText += data.text || "";
              if (responseState !== "typing") setResponseState("typing");
              renderMessages(baseMessages.concat([
                userPreview,
                { role: "assistant", content: assistantText, state: "typing" }
              ]));
            }
            if (eventName === "done") {
              donePayload = data;
            }
          });
        }

        if (!donePayload) {
          throw new Error("A resposta em tempo real foi interrompida.");
        }

        return donePayload;
      }

      async function sendMessage(event) {
        event.preventDefault();
        if (isResponding) return;
        const message = getValue(els.messageInput).trim();
        if (!message && !pendingAttachment) return;
        setValue(els.messageInput, "");
        autoGrowMessageInput();
        const baseMessages = currentMessages.slice();
        const userPreview = { role: "user", content: message || "Anexo enviado.", uploads: [] };
        setResponseState("sending");
        try {
          const upload = await uploadPendingAttachment();
          const payload = {
            conversationId: currentConversationId || undefined,
            message: message,
            uploadIds: upload ? [upload.id] : [],
            useWebSearch: useWebSearchNext
          };
          const data = await streamChat(payload, baseMessages, message);
          setWebSearchNext(false);
          currentConversationId = data.conversationId;
          const conversation = await api("/api/conversations/" + currentConversationId);
          currentConversation = conversation.conversation;
          setResponseState("done");
          renderMessages(conversation.messages || []);
          handleAssistantVoiceAfterResponse(conversation.messages || data.messages || []);
          await loadConversations();
        } catch (error) {
          const text = friendlyChatError(error);
          setResponseState("error");
          showToast(text);
          if (currentConversationId) {
            const conversation = await api("/api/conversations/" + currentConversationId).catch(function() { return { messages: baseMessages }; });
            renderMessages((conversation.messages || baseMessages).concat([
              { role: "assistant", content: text, state: "error" }
            ]));
          } else {
            renderMessages(baseMessages.concat([
              userPreview,
              { role: "assistant", content: text, state: "error" }
            ]));
          }
          window.setTimeout(function() { setResponseState("done"); }, 250);
        }
      }

      async function shareConversation() {
        if (!currentMessages.length) {
          showToast("Abra uma conversa para compartilhar.");
          return;
        }
        const text = currentMessages.map(function(message) {
          return (message.role === "user" ? "Você" : "YARA") + ": " + message.content;
        }).join("\\n\\n");
        await navigator.clipboard.writeText(text).catch(function() {});
        showToast("Conversa copiada para a área de transferência.");
      }

      async function pinConversation() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        const pinned = !(currentConversation && Number(currentConversation.is_pinned) === 1);
        await api("/api/conversations/" + currentConversationId + "/pin", {
          method: "PATCH",
          body: JSON.stringify({ pinned: pinned })
        });
        showToast(pinned ? "Conversa fixada." : "Conversa desafixada.");
        await openConversation(currentConversationId);
      }

      async function archiveConversation() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        await api("/api/conversations/" + currentConversationId + "/archive", {
          method: "PATCH",
          body: JSON.stringify({ archived: true })
        });
        currentConversationId = null;
        currentConversation = null;
        renderMessages([]);
        await loadConversations();
        showToast("Conversa arquivada.");
      }

      async function moveConversationTop() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        await api("/api/conversations/" + currentConversationId + "/move-top", { method: "PATCH" });
        await loadConversations();
        showToast("Conversa movida para o topo.");
      }

      async function deleteCurrentConversation() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        if (!window.confirm("Excluir esta conversa? Essa ação removerá mensagens e vínculos relacionados.")) return;
        await api("/api/conversations/" + currentConversationId, { method: "DELETE" });
        currentConversationId = null;
        currentConversation = null;
        renderMessages([]);
        await loadConversations();
        showToast("Conversa excluída.");
      }

      async function showConversationFiles() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        const data = await api("/api/conversations/" + currentConversationId + "/files");
        const files = data.files || [];
        openModal("Arquivos enviados", "Anexos salvos nesta conversa.", files.length ? files.map(function(file) {
          const isGenerated = file.source === "generated" || file.category === "generated";
          const name = escapeHtml(fileDisplayName(file));
          const action = isGenerated
            ? '<div class="row"><button class="button" data-preview-file="' + file.id + '" type="button">Visualizar</button><button class="button" data-download-file="' + file.id + '" data-file-name="' + name + '" type="button">Baixar</button></div>'
            : '<button class="button" data-download-upload="' + file.id + '" data-file-name="' + name + '" type="button">Abrir</button>';
          return '<article class="list-item"><div class="item-top"><strong>' + name + '</strong>' + action + '</div><p class="muted">' + fileMeta(file) + '</p></article>';
        }).join("") : '<p class="muted">Nenhum arquivo enviado nesta conversa.</p>');
      }

      async function showProjectPicker() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        await loadProjects(false);
        openModal("Adicionar ao projeto", "Escolha um projeto para conectar esta conversa.", projects.length ? projects.map(function(project) {
          return '<button class="menu-item" data-link-project="' + project.id + '" type="button">${icon("folder")}' + escapeHtml(project.name) + '</button>';
        }).join("") : '<p class="muted">Nenhum projeto disponível.</p>');
      }

      function toggleSearch() {
        byId("chatSearchRow")?.classList.add("open");
        byId("chatSearchInput")?.focus();
      }

      function openAttachmentPicker(action) {
        if (els.attachMenu) els.attachMenu.classList.remove("open");
        if ((action === "attachGallery" || action === "attachImage") && els.fileInputImages) els.fileInputImages.click();
        if (action === "attachDocument" && els.fileInputDocument) els.fileInputDocument.click();
        if (action === "attachPdf" && els.fileInputPdf) els.fileInputPdf.click();
        if (action === "attachCamera" && els.fileInputCamera) els.fileInputCamera.click();
        if (action === "attachAudio") toggleAudioRecording();
      }

      async function toggleAudioRecording() {
        if (audioRecorder && audioRecorder.state === "recording") {
          audioRecorder.stop();
          showToast("Processando áudio...");
          return;
        }

        if (!navigator.mediaDevices || !window.MediaRecorder) {
          showToast("Gravação de áudio não suportada neste navegador.");
          return;
        }

        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioChunks = [];
          audioRecorder = new MediaRecorder(audioStream);
          audioRecorder.addEventListener("dataavailable", function(event) {
            if (event.data && event.data.size > 0) audioChunks.push(event.data);
          });
          audioRecorder.addEventListener("stop", function() {
            const mimeType = audioRecorder.mimeType || "audio/webm";
            const blob = new Blob(audioChunks, { type: mimeType });
            const extension = mimeType.includes("mp4") ? "m4a" : "webm";
            const file = new File([blob], "audio-yara-" + Date.now() + "." + extension, { type: mimeType });
            audioStream?.getTracks().forEach(function(track) { track.stop(); });
            audioStream = null;
            audioRecorder = null;
            audioChunks = [];
            setPendingAttachment(file);
            showToast("Áudio gravado. Envie a mensagem para anexar.");
          });
          audioRecorder.start();
          showToast("Gravando áudio. Toque em Gravar áudio novamente para parar.");
        } catch {
          showToast("Não foi possível acessar o microfone.");
        }
      }

      async function loadDashboard() {
        const data = await api("/api/dashboard");
        const dashboard = data.dashboard || {};
        const stats = dashboard.stats || {};
        const statItems = [
          ["Conversas", stats.conversations || 0, '${icon("chat")}'],
          ["Projetos", stats.projects || 0, '${icon("folder")}'],
          ["Memórias", stats.memories || 0, '${icon("brain")}'],
          ["Arquivos", stats.uploads || 0, '${icon("file")}'],
          ["Documentos", stats.documents || 0, '${icon("file")}'],
          ["Eventos", stats.events || 0, '${icon("history")}'],
          ["Lembretes", stats.reminders || 0, '${icon("pin")}'],
          ["Tarefas pendentes", stats.pendingTasks || 0, '${icon("save")}']
        ];
        setHtml("dashboardStats", statItems.map(function(item) {
          return '<article class="card"><div class="item-top"><span class="avatar">' + item[2] + '</span><strong>' + escapeHtml(item[0]) + '</strong></div><h2>' + item[1] + '</h2></article>';
        }).join(""));

        const projectTarget = document.getElementById("dashboardProjects");
        const recentProjects = dashboard.recentProjects || [];
        if (projectTarget) projectTarget.innerHTML = recentProjects.length ? recentProjects.map(function(project) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(project.name) + '</strong><button class="button" data-dashboard-project="' + project.id + '" type="button">Abrir</button></div><p class="muted">' + escapeHtml(project.description || project.type || "Projeto YARA AI") + '</p></article>';
        }).join("") : '<p class="muted">Nenhum projeto criado ainda.</p>';

        const todayTarget = document.getElementById("dashboardToday");
        const todayEvents = dashboard.todayEvents || [];
        const todayItems = todayEvents.map(function(eventItem) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(eventItem.title || "Compromisso") + '</strong><span class="status"><span class="dot"></span>' + escapeHtml(eventItem.time || "Hoje") + '</span></div><p class="muted">Agenda do dia</p></article>';
        }).concat((dashboard.upcomingReminders || []).slice(0, 2).map(function(reminder) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(reminder.title || "Lembrete") + '</strong><span class="status">Lembrete</span></div><p class="muted">' + escapeHtml(new Date(reminder.scheduled_at).toLocaleString("pt-BR")) + '</p></article>';
        }));
        if (todayTarget) todayTarget.innerHTML = todayItems.length ? todayItems.join("") : '<p class="muted">Nenhum compromisso para hoje. Bom momento para planejar prioridades.</p>';

        const documentTarget = document.getElementById("dashboardDocuments");
        const recentDocuments = dashboard.recentDocuments || [];
        if (documentTarget) documentTarget.innerHTML = recentDocuments.length ? recentDocuments.map(function(documentItem) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(documentItem.title || "Documento") + '</strong><button class="button" data-view-target="documents" type="button">Abrir</button></div><p class="muted">' + escapeHtml((documentItem.template || documentItem.type || "documento") + " · " + (documentItem.format || "").toUpperCase()) + '</p></article>';
        }).join("") : '<p class="muted">Nenhum documento recente. Gere ou envie documentos para organizar seu workspace.</p>';

        const taskTarget = document.getElementById("dashboardTasks");
        const recentTasks = dashboard.recentTasks || [];
        if (taskTarget) taskTarget.innerHTML = recentTasks.length ? recentTasks.map(function(task) {
          const due = task.due_date ? " · prazo " + escapeHtml(task.due_date) : "";
          const priority = task.priority === "high" ? "Alta" : task.priority === "low" ? "Baixa" : "Média";
          return '<article class="list-item"><div class="item-top"><strong class="task-title ' + (task.status === "done" ? "done" : "") + '">' + escapeHtml(task.title) + '</strong><span class="status"><span class="dot"></span>' + (task.status === "done" ? "Concluída" : "Pendente") + '</span></div><p class="muted">' + escapeHtml(task.project_name || "Projeto") + " · prioridade " + priority + due + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma tarefa registrada.</p>';

        const conversationTarget = document.getElementById("dashboardConversations");
        const recentConversations = dashboard.recentConversations || [];
        if (conversationTarget) conversationTarget.innerHTML = recentConversations.length ? recentConversations.map(function(conversation) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(conversation.title || "Conversa") + '</strong><button class="button" data-dashboard-conversation="' + conversation.id + '" type="button">Abrir</button></div><p class="muted">Atualizada em ' + escapeHtml(conversation.updated_at || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma conversa recente.</p>';

        const calendarHints = []
          .concat((dashboard.todayEvents || []).map(function(eventItem) { return "Hoje: " + eventItem.title + (eventItem.time ? " às " + eventItem.time : ""); }))
          .concat((dashboard.upcomingReminders || []).map(function(reminder) { return "Lembrete: " + reminder.title + " · " + new Date(reminder.scheduled_at).toLocaleString("pt-BR"); }))
          .slice(0, 4);
        const suggestionTarget = document.getElementById("dashboardSuggestions");
        if (suggestionTarget) suggestionTarget.innerHTML = calendarHints.concat(dashboard.suggestions || []).map(function(text) {
          return '<article class="list-item"><p class="muted">' + escapeHtml(text) + '</p></article>';
        }).join("");
      }

      async function loadProjects(render = true) {
        const data = await api("/api/projects");
        projects = data.projects || [];
        if (render) renderProjects();
      }

      function renderProjects() {
        const query = getValue("projectSearch").trim().toLowerCase();
        const visible = projects.filter(function(project) {
          return !query || String(project.name + " " + (project.description || project.prompt || "")).toLowerCase().includes(query);
        });
        const target = document.getElementById("projectList");
        if (!visible.length) {
          if (target) target.innerHTML = '<p class="muted">Nenhum projeto encontrado.</p>';
          return;
        }
        if (target) target.innerHTML = visible.map(function(project) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(project.name) + '</strong><button class="button" data-open-project="' + project.id + '" type="button">Abrir projeto</button></div><p class="muted">' + escapeHtml(project.description || project.prompt || "Projeto YARA AI") + '</p><p class="muted">' + escapeHtml(project.type || "Projeto") + ' · atualizado em ' + escapeHtml(project.updated_at || "") + '</p></article>';
        }).join("");
      }

      async function loadProjectUploadOptions() {
        const select = document.getElementById("projectUploadSelect");
        const data = await api("/api/uploads");
        const uploads = data.uploads || [];
        if (select) select.innerHTML = uploads.length
          ? uploads.map(function(file) {
              return '<option value="' + escapeHtml(file.id) + '">' + escapeHtml(file.original_name || file.file_name || "Arquivo") + " · " + attachmentMeta(file) + '</option>';
            }).join("")
          : '<option value="">Nenhum arquivo enviado ainda</option>';
      }

      function renderProjectDetails(details) {
        currentProjectDetails = details;
        const tasks = details.tasks || [];
        const notes = details.notes || [];
        const files = details.files || [];
        const conversations = details.conversations || [];
        const history = details.history || [];

        setHtml("projectTaskList", tasks.length ? tasks.map(function(task) {
          const priority = task.priority === "high" ? "Alta" : task.priority === "low" ? "Baixa" : "Média";
          return '<article class="list-item"><div class="item-top"><label class="row"><input type="checkbox" data-toggle-task="' + task.id + '" ' + (task.status === "done" ? "checked" : "") + ' /><strong class="task-title ' + (task.status === "done" ? "done" : "") + '">' + escapeHtml(task.title) + '</strong></label><div class="row"><button class="button" data-edit-task="' + task.id + '" data-title="' + escapeHtml(task.title) + '" data-priority="' + escapeHtml(task.priority || "medium") + '" data-due-date="' + escapeHtml(task.due_date || "") + '" type="button">Editar</button><button class="icon-button danger" data-delete-task="' + task.id + '" type="button" aria-label="Excluir tarefa">${icon("trash")}</button></div></div><p class="muted">Prioridade ' + priority + (task.due_date ? " · Prazo: " + escapeHtml(task.due_date) : " · Sem prazo definido") + '</p><p class="muted">' + escapeHtml(task.description || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma tarefa criada para este projeto.</p>');

        setHtml("projectNoteList", notes.length ? notes.map(function(note) {
          return '<article class="list-item"><div class="item-top"><strong>Nota do projeto</strong><div class="row"><button class="icon-button" data-edit-note="' + note.id + '" data-content="' + escapeHtml(note.content) + '" type="button" aria-label="Editar nota">${icon("save")}</button><button class="icon-button danger" data-delete-note="' + note.id + '" type="button" aria-label="Excluir nota">${icon("trash")}</button></div></div><p class="muted">' + escapeHtml(note.content) + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma nota salva.</p>');

        setHtml("projectFileList", files.length ? files.map(function(file) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(file.original_name || file.file_name || "Arquivo") + '</strong><button class="button" data-download-upload="' + file.id + '" data-file-name="' + escapeHtml(file.original_name || file.file_name || "arquivo") + '" type="button">Abrir</button></div><p class="muted">' + attachmentMeta(file) + '</p></article>';
        }).join("") : '<p class="muted">Nenhum arquivo vinculado a este projeto.</p>');

        setHtml("projectConversationList", conversations.length ? conversations.map(function(conversation) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(conversation.title || "Conversa") + '</strong><button class="button" data-open-conversation="' + conversation.id + '" type="button">Abrir</button></div><p class="muted">Atualizada em ' + escapeHtml(conversation.updated_at || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma conversa vinculada ainda.</p>');

        setHtml("projectHistoryList", history.length ? history.map(function(item) {
          const label = item.type === "task" ? "Tarefa" : item.type === "file" ? "Arquivo" : "Nota";
          return '<article class="list-item"><div class="item-top"><strong>' + label + '</strong><span class="muted">' + escapeHtml(item.updated_at || "") + '</span></div><p class="muted">' + escapeHtml(item.label || "") + '</p></article>';
        }).join("") : '<p class="muted">O histórico aparecerá conforme você criar tarefas, notas e arquivos.</p>');
      }

      async function selectProject(projectId) {
        selectedProject = projects.find(function(project) { return project.id === projectId; }) || null;
        if (!selectedProject) return;
        setText("projectDetailTitle", selectedProject.name);
        setText("projectDetailDescription", selectedProject.description || selectedProject.prompt || "Projeto criado na YARA AI.");
        setText("projectDetail", selectedProject.content || selectedProject.output || selectedProject.prompt || "");
        setHidden("projectWorkspace", false);
        const data = await api("/api/projects/" + selectedProject.id + "/details");
        renderProjectDetails(data);
        await loadProjectUploadOptions();
      }

      function renderTechnicalStats(dashboard) {
        dashboard = dashboard || {};
        const totals = dashboard.totals || {};
        setHtml("technicalStats", [
          '<article class="metric-card"><span class="metric-label">Projetos</span><strong>' + escapeHtml(String(totals.projects || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Inspeções</span><strong>' + escapeHtml(String(totals.inspections || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Arquivos</span><strong>' + escapeHtml(String(totals.files || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Relatórios</span><strong>' + escapeHtml(String(totals.reports || 0)) + '</strong></article>'
        ].join(""));
      }

      function renderTechnicalProjectOptions() {
        const options = ['<option value="">Chat Técnico sem projeto selecionado</option>'].concat(technicalProjects.map(function(project) {
          return '<option value="' + escapeHtml(project.id) + '"' + (selectedTechnicalProject && selectedTechnicalProject.id === project.id ? " selected" : "") + '>' + escapeHtml(project.title) + '</option>';
        }));
        setHtml("technicalChatProjectSelect", options.join(""));
      }

      function renderTechnicalProjectsList() {
        setHtml("technicalProjectsList", technicalProjects.length
          ? technicalProjects.map(function(project) {
              const active = selectedTechnicalProject && selectedTechnicalProject.id === project.id ? " active" : "";
              return '<button class="conversation-item' + active + '" data-open-technical-project="' + escapeHtml(project.id) + '" type="button"><strong>' + escapeHtml(project.title) + '</strong><span>' + escapeHtml(project.projectType || "técnico") + ' · risco ' + escapeHtml(project.riskLevel || "indefinido") + ' · ' + escapeHtml(project.status || "active") + '</span></button>';
            }).join("")
          : '<p class="muted">Nenhum projeto técnico criado ainda.</p>');
        renderTechnicalProjectOptions();
      }

      function renderTechnicalDetail(data) {
        if (!data || !data.project) {
          selectedTechnicalProject = null;
          setHtml("technicalProjectDetail", "Selecione um projeto técnico para visualizar escopo, inspeções, arquivos e relatórios.");
          setHtml("technicalInspectionsList", '<p class="muted">Nenhuma inspeção selecionada.</p>');
          setHtml("technicalFilesList", '<p class="muted">Nenhum arquivo técnico vinculado.</p>');
          setHtml("technicalExportsList", '<p class="muted">Nenhuma exportação técnica criada.</p>');
          renderTechnicalProjectOptions();
          return;
        }
        selectedTechnicalProject = data.project;
        const outputs = data.outputs || [];
        const inspections = data.inspections || [];
        const files = data.files || [];
        const exports = data.exports || [];
        const lastOutput = outputs[0];
        setHtml("technicalProjectDetail", [
          '<strong>' + escapeHtml(data.project.title) + '</strong>',
          '<p class="muted">' + escapeHtml(data.project.projectType || "") + ' · ' + escapeHtml(data.project.discipline || "") + ' · risco ' + escapeHtml(data.project.riskLevel || "indefinido") + '</p>',
          '<p class="muted">' + escapeHtml(data.project.description || "") + '</p>',
          lastOutput ? '<pre class="code-block">' + escapeHtml(lastOutput.content || "") + '</pre>' : '<p class="muted">Nenhuma saída técnica gerada ainda.</p>'
        ].join(""));
        setHtml("technicalInspectionsList", inspections.length
          ? inspections.map(function(item) {
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.title) + '</strong><span class="status">' + escapeHtml(item.riskLevel || "médio") + '</span></div><p class="muted">' + escapeHtml(item.diagnosis || "") + '</p><p class="muted">Ações: ' + escapeHtml((item.actionPlan || []).join(" · ")) + '</p></article>';
            }).join("")
          : '<p class="muted">Nenhuma inspeção registrada.</p>');
        setHtml("technicalFilesList", files.length
          ? files.map(function(item) {
              const url = item.file && item.file.url ? item.file.url : "";
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.originalName || "Arquivo") + '</strong><span class="status">' + escapeHtml(item.role || "input") + '</span></div><p class="muted">' + escapeHtml(item.fileType || "") + ' · ' + escapeHtml(String(item.fileSize || 0)) + ' bytes</p>' + (url ? '<button class="button small" data-download-technical-file="' + escapeHtml(url) + '" data-file-name="' + escapeHtml(item.originalName || "arquivo") + '" type="button">Baixar</button>' : '') + '</article>';
            }).join("")
          : '<p class="muted">Nenhum arquivo técnico vinculado.</p>');
        setHtml("technicalExportsList", exports.length
          ? exports.map(function(item) {
              const file = item.file || {};
              const status = item.status === "fallback" ? "fallback DXF" : item.status;
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(String(item.requestedFormat || "").toUpperCase()) + '</strong><span class="status">' + escapeHtml(status || "completed") + '</span></div><p class="muted">Gerado: ' + escapeHtml(String(item.generatedFormat || item.requestedFormat || "").toUpperCase()) + (item.technicalError ? ' · ' + escapeHtml(item.technicalError) : '') + '</p>' + (file.url ? '<button class="button small" data-download-technical-file="' + escapeHtml(file.url) + '" data-file-name="' + escapeHtml(file.name || "exportacao-tecnica") + '" type="button">Baixar</button>' : '') + '</article>';
            }).join("")
          : '<p class="muted">Nenhuma exportação técnica criada.</p>');
        renderTechnicalProjectOptions();
        renderTechnicalProjectsList();
      }

      async function loadTechnicalProjects() {
        const data = await api("/api/technical-projects");
        technicalProjects = data.projects || [];
        renderTechnicalStats(data.dashboard || {});
        renderTechnicalProjectsList();
        if (selectedTechnicalProject) {
          const exists = technicalProjects.some(function(project) { return project.id === selectedTechnicalProject.id; });
          if (exists) await selectTechnicalProject(selectedTechnicalProject.id);
          else renderTechnicalDetail(null);
        }
      }

      async function selectTechnicalProject(projectId) {
        const data = await api("/api/technical-projects/" + projectId);
        renderTechnicalDetail(data);
      }

      async function createTechnicalProjectFromForm(event) {
        event.preventDefault();
        const description = getValue("technicalProjectDescription").trim();
        if (description.length < 2) return showToast("Descreva o projeto técnico.");
        const data = await api("/api/technical-projects", {
          method: "POST",
          body: JSON.stringify({
            title: getValue("technicalProjectTitle").trim() || undefined,
            description: description,
            projectType: getValue("technicalProjectType") || undefined,
            location: getValue("technicalProjectLocation").trim() || null
          })
        });
        technicalProjects.unshift(data.project);
        setValue("technicalProjectTitle", "");
        setValue("technicalProjectDescription", "");
        setValue("technicalProjectLocation", "");
        setValue("technicalProjectType", "");
        renderTechnicalStats((await api("/api/technical-projects/dashboard")).dashboard || {});
        renderTechnicalProjectsList();
        renderTechnicalDetail(data);
        showToast("Projeto técnico criado.");
      }

      async function sendTechnicalChatFromForm(event) {
        event.preventDefault();
        const message = getValue("technicalChatMessage").trim();
        if (message.length < 1) return showToast("Digite uma mensagem técnica.");
        const projectId = getValue("technicalChatProjectSelect") || (selectedTechnicalProject && selectedTechnicalProject.id) || null;
        const data = await api("/api/technical-projects/chat", {
          method: "POST",
          body: JSON.stringify({ message: message, sessionId: technicalChatSessionId || undefined, projectId: projectId })
        });
        technicalChatSessionId = data.session && data.session.id;
        setValue("technicalChatMessage", "");
        if (data.project) selectedTechnicalProject = data.project;
        setHtml("technicalChatMessages", (data.messages || []).map(function(messageItem) {
          return '<article class="list-item"><strong>' + (messageItem.role === "user" ? "Você" : "YARA Técnica") + '</strong><p class="muted">' + escapeHtml(messageItem.content || "") + '</p></article>';
        }).join(""));
        await loadTechnicalProjects();
        showToast("Chat Técnico atualizado.");
      }

      async function inspectTechnicalProjectFromForm(event) {
        event.preventDefault();
        if (!selectedTechnicalProject) return showToast("Selecione um projeto técnico.");
        const observations = getValue("technicalInspectionObservations").trim();
        if (observations.length < 2) return showToast("Informe observações para a inspeção.");
        const data = await api("/api/technical-projects/" + selectedTechnicalProject.id + "/inspect", {
          method: "POST",
          body: JSON.stringify({
            title: getValue("technicalInspectionTitle").trim() || undefined,
            observations: observations
          })
        });
        setValue("technicalInspectionTitle", "");
        setValue("technicalInspectionObservations", "");
        await selectTechnicalProject(data.project.id);
        await loadTechnicalProjects();
        showToast("Inspeção técnica registrada.");
      }

      async function exportSelectedTechnicalProject(format) {
        if (!selectedTechnicalProject) return showToast("Selecione um projeto técnico.");
        const data = await api("/api/technical-projects/" + selectedTechnicalProject.id + "/export", {
          method: "POST",
          body: JSON.stringify({ format: format })
        });
        await selectTechnicalProject(selectedTechnicalProject.id);
        showToast("Exportação criada: " + (data.file && data.file.name ? data.file.name : format.toUpperCase()));
      }

      async function uploadTechnicalFileFromForm(event) {
        event.preventDefault();
        if (!selectedTechnicalProject) return showToast("Selecione um projeto técnico.");
        const input = document.getElementById("technicalFileInput");
        const file = input && input.files && input.files[0];
        if (!file) return showToast("Escolha um arquivo técnico.");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("role", "input");
        const response = await fetch("/api/technical-projects/" + selectedTechnicalProject.id + "/files", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData
        });
        const data = await response.json().catch(function() { return {}; });
        if (!response.ok) throw new Error((data.error && data.error.message) || "Não foi possível anexar arquivo técnico.");
        if (input) input.value = "";
        await selectTechnicalProject(selectedTechnicalProject.id);
        showToast("Arquivo técnico anexado.");
      }

      async function deleteSelectedTechnicalProject() {
        if (!selectedTechnicalProject) return showToast("Selecione um projeto técnico.");
        if (!window.confirm("Excluir este projeto técnico?")) return;
        await api("/api/technical-projects/" + selectedTechnicalProject.id, { method: "DELETE" });
        selectedTechnicalProject = null;
        await loadTechnicalProjects();
        renderTechnicalDetail(null);
        showToast("Projeto técnico excluído.");
      }

      async function loadSmartProjects() {
        const data = await api("/api/projects-memory");
        smartProjects = data.projects || [];
        renderSmartProjectList();
        if (!selectedSmartProjectId && smartProjects.length) {
          selectedSmartProjectId = smartProjects[0].id;
        }
        if (selectedSmartProjectId) await selectSmartProject(selectedSmartProjectId);
      }

      function renderSmartProjectList() {
        const target = byId("smartProjectList");
        if (!target) return;
        target.innerHTML = smartProjects.length
          ? smartProjects.map(function(project) {
              const active = project.id === selectedSmartProjectId ? " active" : "";
              return '<article class="list-item' + active + '"><div class="item-top"><div><strong>' + escapeHtml(project.name) + '</strong><p class="muted">' + escapeHtml(project.current_pillar || "Pilar") + ' · ' + escapeHtml(project.current_phase || "Fase atual") + '</p></div><button class="button" data-open-smart-project="' + escapeHtml(project.id) + '" type="button">Abrir</button></div><p class="muted">' + escapeHtml(project.description || "Memória de projeto") + '</p></article>';
            }).join("")
          : '<p class="muted">Nenhum projeto inteligente encontrado.</p>';
      }

      function renderSmartProjectDetails(data) {
        const project = data.project || {};
        const phases = data.phases || [];
        const decisions = data.decisions || [];
        const milestones = data.milestones || [];
        const pending = data.pending || [];
        const commits = data.commits || [];
        const timeline = data.timeline || [];

        setText("smartProjectTitle", project.name || "Projeto inteligente");
        setText("smartProjectSubtitle", project.description || "Histórico consolidado do projeto.");
        setText("smartProjectStatus", project.status || "ativo");
        setHtml("smartProjectNextSteps", (project.nextSteps || []).length
          ? '<strong>Próximos passos</strong><ul>' + project.nextSteps.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</ul>'
          : "Nenhum próximo passo registrado.");
        setHtml("smartProjectSummary", [
          ["Fase atual", project.current_phase || "-"],
          ["Pilar", project.current_pillar || "-"],
          ["Fases", phases.length],
          ["Decisões", decisions.length],
          ["Pendências", pending.filter(function(item) { return item.status !== "done"; }).length],
          ["Commits", commits.length]
        ].map(function(item) {
          return '<article class="card stat-card"><span class="avatar">${icon("brain")}</span><strong>' + escapeHtml(item[1]) + '</strong><p class="muted">' + escapeHtml(item[0]) + '</p></article>';
        }).join(""));
        setHtml("smartDecisionsList", decisions.length ? decisions.map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.title) + '</strong><p class="muted">' + escapeHtml(item.content) + '</p>' + (item.impact ? '<p class="muted">Impacto: ' + escapeHtml(item.impact) + '</p>' : "") + '</article>';
        }).join("") : '<p class="muted">Nenhuma decisão registrada.</p>');
        setHtml("smartPendingList", pending.length ? pending.map(function(item) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.title) + '</strong><span class="status">' + escapeHtml(item.priority || "medium") + ' · ' + escapeHtml(item.status || "open") + '</span></div><p class="muted">' + escapeHtml(item.description || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma pendência registrada.</p>');
        setHtml("smartCommitsList", commits.length ? commits.map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.hash) + '</strong><p class="muted">' + escapeHtml(item.message) + ' · ' + escapeHtml(item.branch || "main") + '</p></article>';
        }).join("") : '<p class="muted">Nenhum commit registrado.</p>');
        setHtml("smartMilestonesList", milestones.length ? milestones.map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.title) + '</strong><p class="muted">' + escapeHtml(item.description || item.status || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhum marco registrado.</p>');
        setHtml("smartTimelineList", timeline.length ? timeline.slice(0, 10).map(function(item) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.title) + '</strong><span class="status">' + escapeHtml(item.event_type || "evento") + '</span></div><p class="muted">' + escapeHtml(item.description || "") + '</p><p class="muted">' + escapeHtml(item.event_at || item.created_at || "") + '</p></article>';
        }).join("") : '<p class="muted">Linha do tempo vazia.</p>');
      }

      async function selectSmartProject(projectId) {
        selectedSmartProjectId = projectId;
        renderSmartProjectList();
        const data = await api("/api/projects-memory/" + projectId);
        renderSmartProjectDetails(data);
      }

      function requireSmartProject() {
        if (!selectedSmartProjectId) {
          showToast("Selecione um projeto inteligente.");
          return false;
        }
        return true;
      }

      function renderGraph(graph) {
        const data = graph || {};
        const totals = data.totals || {};
        const topNodes = data.topNodes || data.nodes || [];
        const edges = data.recentEdges || data.edges || [];
        const insights = data.insights || [];
        setHtml("graphStats", [
          ["Nós", totals.nodes || topNodes.length, '${icon("brain")}'],
          ["Relações", totals.edges || edges.length, '${icon("share")}'],
          ["Insights", totals.insights || insights.length, '${icon("sparkles")}'],
          ["Entidades centrais", topNodes.length, '${icon("pin")}']
        ].map(function(item) {
          return '<article class="card stat-card"><span class="avatar">' + item[2] + '</span><strong>' + escapeHtml(item[1]) + '</strong><p class="muted">' + escapeHtml(item[0]) + '</p></article>';
        }).join(""));
        setHtml("graphNodeList", topNodes.length ? topNodes.slice(0, 12).map(function(node) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(node.label) + '</strong><span class="status">' + escapeHtml(node.type) + '</span></div><p class="muted">' + escapeHtml(node.summary || "Sem resumo") + '</p></article>';
        }).join("") : '<p class="muted">Nenhum nó criado ainda. Reconstrua o grafo para iniciar.</p>');
        setHtml("graphImportantList", topNodes.length ? topNodes.slice(0, 8).map(function(node) {
          return '<article class="list-item"><strong>' + escapeHtml(node.label) + '</strong><p class="muted">Importância ' + Math.round(Number(node.importance || 0) * 100) + '% · ' + escapeHtml(node.type) + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma entidade importante encontrada.</p>');
        setHtml("graphEdgeList", edges.length ? edges.slice(0, 14).map(function(edge) {
          return '<article class="list-item"><strong>' + escapeHtml(edge.sourceLabel || edge.sourceNodeId) + ' → ' + escapeHtml(edge.targetLabel || edge.targetNodeId) + '</strong><p class="muted">' + escapeHtml(edge.relationType || "relacionado") + ' · peso ' + Math.round(Number(edge.weight || 0) * 100) + '%</p></article>';
        }).join("") : '<p class="muted">Nenhuma relação criada ainda.</p>');
        setHtml("graphMap", edges.length ? edges.slice(0, 16).map(function(edge) {
          return '<article class="list-item"><p class="muted">' + escapeHtml(edge.sourceLabel || "Origem") + ' -- ' + escapeHtml(edge.relationType || "relaciona") + ' -- ' + escapeHtml(edge.targetLabel || "Destino") + '</p></article>';
        }).join("") : '<p class="muted">O mapa aparecerá conforme a YARA conectar entidades.</p>');
        setHtml("graphInsightList", insights.length ? insights.map(function(insight) {
          return '<article class="list-item"><strong>' + escapeHtml(insight.title) + '</strong><p class="muted">' + escapeHtml(insight.content) + '</p><p class="muted">Confiança ' + Math.round(Number(insight.confidence || 0) * 100) + '%</p></article>';
        }).join("") : '<p class="muted">Nenhum insight gerado ainda.</p>');
      }

      async function loadGraph() {
        const data = await api("/api/graph");
        renderGraph(data.graph);
      }

      async function rebuildGraphFromUi() {
        const data = await api("/api/graph/rebuild", { method: "POST", body: JSON.stringify({}) });
        renderGraph(data.graph);
        showToast("Grafo reconstruído.");
      }

      async function queryGraphFromUi(event) {
        event.preventDefault();
        const query = getValue("graphQueryInput").trim();
        if (query.length < 2) return showToast("Informe uma consulta para o grafo.");
        const data = await api("/api/graph/query", {
          method: "POST",
          body: JSON.stringify({ query: query })
        });
        setHtml("graphQueryResult", [
          '<strong>Resultado GraphRAG</strong>',
          data.nodes && data.nodes.length ? '<p class="muted">Nós: ' + data.nodes.slice(0, 8).map(function(node) { return escapeHtml(node.label + " (" + node.type + ")"); }).join(" · ") + '</p>' : '<p class="muted">Nenhum nó encontrado.</p>',
          data.edges && data.edges.length ? '<p class="muted">Relações: ' + data.edges.slice(0, 8).map(function(edge) { return escapeHtml((edge.sourceLabel || "Origem") + " → " + edge.relationType + " → " + (edge.targetLabel || "Destino")); }).join(" · ") + '</p>' : '<p class="muted">Nenhuma relação direta encontrada.</p>'
        ].join(""));
        renderGraph({ nodes: data.nodes || [], edges: data.edges || [], topNodes: data.nodes || [], recentEdges: data.edges || [], insights: data.insights || [], totals: { nodes: (data.nodes || []).length, edges: (data.edges || []).length, insights: (data.insights || []).length } });
      }

      function renderSmartSearchDashboard(dashboard) {
        dashboard = dashboard || {};
        const totals = dashboard.totals || {};
        const status = dashboard.status || {};
        setHtml("smartSearchStats", [
          '<article class="metric-card"><span class="metric-label">Itens indexados</span><strong>' + escapeHtml(String(totals.indexedItems || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Embeddings</span><strong>' + escapeHtml(String(totals.embeddings || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Buscas</span><strong>' + escapeHtml(String(totals.semanticSearches || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Banco</span><strong>' + escapeHtml(status.pgvector === "configured" ? "pgvector" : "SQLite") + '</strong><p class="muted">' + escapeHtml(status.cache || "cache local") + '</p></article>'
        ].join(""));
        setHtml("smartSearchSources", (dashboard.sourceTypes || []).length
          ? dashboard.sourceTypes.map(function(item) {
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.type) + '</strong><span class="status"><span class="dot"></span>' + escapeHtml(String(item.total)) + '</span></div></article>';
            }).join("")
          : '<p class="muted">Nenhum item indexado ainda. Clique em Reindexar.</p>');
        setHtml("smartSearchRecent", (dashboard.recentSearches || []).length
          ? dashboard.recentSearches.map(function(item) {
              return '<article class="list-item"><strong>' + escapeHtml(item.query) + '</strong><p class="muted">' + escapeHtml(item.mode || "hybrid") + ' · ' + escapeHtml(String(item.resultCount || 0)) + ' resultados · relevância ' + Math.round(Number(item.topScore || 0) * 100) + '%</p></article>';
            }).join("")
          : '<p class="muted">Nenhuma busca inteligente recente.</p>');
        setHtml("smartSearchIndexed", (dashboard.recentIndexed || []).length
          ? dashboard.recentIndexed.map(function(item) {
              return '<article class="list-item"><strong>' + escapeHtml(item.title || "Item") + '</strong><p class="muted">' + escapeHtml(item.source_type || "") + ' · ' + escapeHtml(item.updated_at || "") + '</p></article>';
            }).join("")
          : '<p class="muted">O índice será exibido após a primeira reindexação.</p>');
      }

      function renderSemanticSearchResults(results) {
        const target = document.getElementById("semanticSearchResults");
        if (!target) return;
        if (!results || !results.length) {
          target.innerHTML = '<p class="muted">Nenhum resultado contextual encontrado.</p>';
          return;
        }
        target.innerHTML = results.map(function(item) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.title) + '</strong><span class="status"><span class="dot"></span>' + Math.round(Number(item.score || 0) * 100) + '%</span></div><p class="muted">' + escapeHtml(item.sourceType || "contexto") + ' · semântico ' + Math.round(Number(item.semanticScore || 0) * 100) + '% · texto ' + Math.round(Number(item.lexicalScore || 0) * 100) + '%</p><p class="muted">' + escapeHtml(item.snippet || "") + '</p></article>';
        }).join("");
      }

      async function loadSmartSearch() {
        const data = await api("/api/search");
        renderSmartSearchDashboard(data.dashboard || {});
      }

      async function reindexSmartSearchFromUi() {
        setHtml("semanticSearchResults", '<p class="muted">Reindexando memórias, perfil, projetos, arquivos, conversas e grafo...</p>');
        const data = await api("/api/search/reindex", { method: "POST", body: JSON.stringify({}) });
        renderSmartSearchDashboard(data.dashboard || {});
        showToast("Busca inteligente reindexada: " + String((data.reindex && data.reindex.indexed) || 0) + " itens.");
      }

      async function runSemanticSearchFromUi(event) {
        event.preventDefault();
        const query = getValue("semanticSearchQuery").trim();
        if (query.length < 2) return showToast("Informe o que deseja encontrar.");
        const data = await api("/api/search/semantic", {
          method: "POST",
          body: JSON.stringify({
            query: query,
            mode: getValue("semanticSearchMode") || "hybrid",
            limit: 10
          })
        });
        renderSemanticSearchResults(data.search ? data.search.results : []);
        await loadSmartSearch().catch(function() {});
      }

      function renderConsolidatedMemoryDashboard(data) {
        data = data || {};
        const dashboard = data.dashboard || {};
        const latest = dashboard.latest || null;
        const totals = dashboard.totals || {};
        const consolidations = data.consolidations || [];
        const items = data.items || dashboard.latestItems || [];
        const conflicts = data.conflicts || dashboard.pendingConflicts || [];
        const categories = dashboard.categories || [];
        setHtml("consolidatedMemoryStats", [
          '<article class="metric-card"><span class="metric-label">Memórias consolidadas</span><strong>' + escapeHtml(String(totals.consolidatedItems || items.length || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Duplicidades</span><strong>' + escapeHtml(String(latest ? latest.duplicateCount : 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Conflitos pendentes</span><strong>' + escapeHtml(String(totals.pendingConflicts || conflicts.length || 0)) + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Qualidade</span><strong>' + escapeHtml(String(latest ? Math.round(Number(latest.qualityScore || 0) * 100) + "%" : "0%")) + '</strong><p class="muted">' + escapeHtml(latest ? latest.status : "sem consolidação") + '</p></article>'
        ].join(""));
        setHtml("memoryConsolidationList", consolidations.length
          ? consolidations.map(function(item) {
              return '<button class="conversation-item" data-open-consolidation="' + escapeHtml(item.id) + '" type="button"><strong>' + escapeHtml(item.summary || "Consolidação") + '</strong><span>' + escapeHtml(String(item.sourceCount || 0)) + ' fontes · ' + escapeHtml(String(item.conflictCount || 0)) + ' conflitos · ' + escapeHtml(item.createdAt || "") + '</span></button>';
            }).join("")
          : '<p class="muted">Nenhuma consolidação criada ainda. Clique em Consolidar agora.</p>');
        setHtml("memoryQualityList", categories.length
          ? categories.map(function(item) {
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.category || "memória") + '</strong><span class="status"><span class="dot"></span>' + escapeHtml(String(item.total || 0)) + '</span></div><p class="muted">Qualidade média ' + Math.round(Number(item.quality || 0) * 100) + '%</p></article>';
            }).join("")
          : '<p class="muted">As categorias aparecerão após a consolidação.</p>');
        setHtml("consolidatedMemoryItems", items.length
          ? items.slice(0, 14).map(function(item) {
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.title || "Memória") + '</strong><span class="status">' + escapeHtml(item.status || "active") + '</span></div><p class="muted">' + escapeHtml(item.category || "geral") + ' · qualidade ' + Math.round(Number(item.qualityScore || 0) * 100) + '% · confiança ' + Math.round(Number(item.confidenceScore || 0) * 100) + '%</p><p class="muted">' + escapeHtml(item.content || "") + '</p></article>';
            }).join("")
          : '<p class="muted">Nenhum item consolidado para exibir.</p>');
        setHtml("memoryConflictsList", conflicts.length
          ? conflicts.map(function(conflict) {
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(conflict.title || "Conflito") + '</strong><span class="status">' + escapeHtml(conflict.severity || "medium") + '</span></div><p class="muted">' + escapeHtml(conflict.description || "") + '</p><p class="muted">Fonte A: ' + escapeHtml((conflict.sourceA && conflict.sourceA.title) || "") + '</p><p class="muted">Fonte B: ' + escapeHtml((conflict.sourceB && conflict.sourceB.title) || "") + '</p><button class="button small" data-resolve-conflict="' + escapeHtml(conflict.id) + '" type="button">${icon("save")}Resolver</button></article>';
            }).join("")
          : '<p class="muted">Nenhum conflito pendente. A memória está coerente neste momento.</p>');
      }

      async function loadConsolidatedMemory() {
        const data = await api("/api/memory/consolidations");
        renderConsolidatedMemoryDashboard(data);
      }

      async function runMemoryConsolidationFromUi() {
        setHtml("consolidatedMemoryItems", '<p class="muted">Consolidando memórias, perfil, projetos, arquivos, documentos, sistemas e conversas...</p>');
        const data = await api("/api/memory/consolidate", { method: "POST", body: JSON.stringify({}) });
        renderConsolidatedMemoryDashboard({
          dashboard: data.dashboard,
          items: data.items || [],
          conflicts: data.conflicts || [],
          consolidations: data.consolidation ? [data.consolidation] : []
        });
        showToast("Memória consolidada.");
      }

      async function openConsolidationDetail(consolidationId) {
        if (!consolidationId) return;
        const data = await api("/api/memory/consolidations/" + consolidationId);
        renderConsolidatedMemoryDashboard({
          dashboard: data.dashboard,
          items: data.items || [],
          conflicts: data.conflicts || [],
          consolidations: data.consolidation ? [data.consolidation] : []
        });
      }

      async function resolveMemoryConflictFromUi(conflictId) {
        if (!conflictId) return;
        const resolution = window.prompt("Como este conflito deve ser resolvido?", "Manter a informação mais recente e confiável.");
        if (resolution === null) return;
        if (resolution.trim().length < 2) return showToast("Informe uma resolução válida.");
        const data = await api("/api/memory/conflicts/" + conflictId + "/resolve", {
          method: "POST",
          body: JSON.stringify({ resolution: resolution.trim(), status: "resolved" })
        });
        renderConsolidatedMemoryDashboard({ dashboard: data.dashboard });
        await loadConsolidatedMemory().catch(function() {});
        showToast("Conflito resolvido.");
      }

      function renderSystemList() {
        setText("systemsCount", systems.length + " sistema" + (systems.length === 1 ? "" : "s"));
        const target = document.getElementById("systemsList");
        if (!target) return;
        if (!systems.length) {
          target.innerHTML = '<p class="muted">Nenhum sistema gerado ainda.</p>';
          return;
        }
        target.innerHTML = systems.map(function(system) {
          const active = selectedSystem && selectedSystem.id === system.id ? " active" : "";
          return '<button class="conversation-item' + active + '" data-open-system="' + escapeHtml(system.id) + '" type="button"><strong>' + escapeHtml(system.name) + '</strong><span>' + escapeHtml(system.updatedAt || system.createdAt || "") + ' · ' + escapeHtml(system.status || "ready") + '</span></button>';
        }).join("");
      }

      function renderSystemChatMessages() {
        const target = document.getElementById("systemChatMessages");
        if (!target) return;
        if (!systemChatMessages.length && !selectedSystem) {
          target.innerHTML = '<div class="system-builder-empty"><span class="system-empty-icon">${icon("sparkles")}</span><h2>Criador de Sistemas</h2><p>Converse com a YARA e descreva o que deseja criar.</p><div class="system-quick-prompts"><button class="system-quick-prompt" data-system-prompt="Crie um CRM" type="button">Crie um CRM</button><button class="system-quick-prompt" data-system-prompt="Crie um aplicativo de investimentos" type="button">Crie um aplicativo de investimentos</button><button class="system-quick-prompt" data-system-prompt="Crie um ERP para construtora" type="button">Crie um ERP para construtora</button><button class="system-quick-prompt" data-system-prompt="Crie um sistema de estoque" type="button">Crie um sistema de estoque</button></div></div>';
          return;
        }
        const html = systemChatMessages.map(function(message) {
          const isUser = message.role === "user";
          const displayContent = isUser ? message.content || "" : systemAssistantMessageForDisplay(message.content || "");
          return '<article class="system-chat-row ' + (isUser ? "user" : "assistant") + '">' + (isUser ? "" : '<div class="message-avatar">YA</div>') + '<div class="system-chat-bubble">' + renderMarkdown(displayContent) + '<span class="system-chat-time">' + escapeHtml((message.createdAt || "").slice(11, 16)) + '</span></div></article>';
        }).join("");
        target.innerHTML = html + (selectedSystem ? renderSystemBuilderCard(selectedSystem) : "");
        target.scrollTop = target.scrollHeight;
      }

      function systemAssistantMessageForDisplay(content) {
        const text = String(content || "").trim();
        const generatedSystem = /Sistema criado:|Arquitetura:|Stack:|Principais módulos:|Decisão da YARA:/i.test(text);
        if (generatedSystem) {
          return "Sistema criado. A YARA escolheu arquitetura, stack, banco e plano automaticamente. Use o card abaixo para abrir, publicar, atualizar ou ver detalhes.";
        }
        if (text.length > 700) {
          return text.slice(0, 420).trim() + "\\n\\nDetalhes completos disponíveis em Ver detalhes.";
        }
        return text;
      }

      function renderSystemBuilderCard(system) {
        const scope = system.scope || {};
        const features = (scope.features || []).slice(0, 4);
        const deploy = system.deploy || null;
        const deployProject = deploy && deploy.project ? deploy.project : null;
        const deployUrls = deployProject && deployProject.urls ? deployProject.urls : {};
        const statusLabel = deployProject ? "Online" : system.status === "published" ? "Publicado" : "Pronto para publicar";
        const appHref = deployUrls.frontend || "#";
        const adminHref = deployUrls.admin || "#";
        return [
          '<article class="system-builder-card" data-system-card="' + escapeHtml(system.id) + '">',
          '<div><h3>Sistema criado</h3><p class="muted">' + escapeHtml(system.name) + '</p></div>',
          '<div class="system-builder-status"><span><span class="dot"></span>' + escapeHtml(statusLabel) + '</span><span>' + escapeHtml(system.type || "Sistema") + '</span></div>',
          '<p class="muted">' + escapeHtml(system.objective || "") + '</p>',
          features.length ? '<ul class="system-summary-list">' + features.map(function(feature) { return '<li>' + escapeHtml(feature) + '</li>'; }).join("") + '</ul>' : "",
          '<div class="system-card-actions">',
          deployProject ? '<a class="primary-action system-open-main" href="' + escapeHtml(appHref) + '" target="_blank" rel="noreferrer">${icon("share")}Abrir Sistema</a>' : '<button class="primary-action system-open-main" data-publish-system="' + escapeHtml(system.id) + '" type="button">${icon("share")}Abrir Sistema</button>',
          deployProject ? '<a class="button" href="' + escapeHtml(adminHref) + '" target="_blank" rel="noreferrer">${icon("settings")}Abrir Painel</a>' : '<button class="button" data-publish-system="' + escapeHtml(system.id) + '" type="button">${icon("settings")}Abrir Painel</button>',
          '<button class="button" data-continue-system="' + escapeHtml(system.id) + '" type="button">${icon("sparkles")}Atualizar</button>',
          '<button class="primary-action" data-publish-system="' + escapeHtml(system.id) + '" type="button">${icon("share")}' + (deployProject ? "Publicar nova versão" : "Publicar Sistema") + '</button>',
          '<button class="button" data-deploy-panel="' + escapeHtml(deployProject ? deployProject.id : "") + '" type="button">${icon("history")}Logs</button>',
          '<button class="button" data-system-panel="details" type="button">${icon("dots")}Ver detalhes</button>',
          '</div>',
          '</article>'
        ].join("");
      }

      function openSystemsHistoryDrawer() {
        const drawer = document.getElementById("systemsHistoryDrawer");
        if (drawer) drawer.hidden = false;
        renderSystemList();
      }

      function closeSystemsHistoryDrawer() {
        const drawer = document.getElementById("systemsHistoryDrawer");
        if (drawer) drawer.hidden = true;
      }

      function systemListHtml(items) {
        if (!items || !items.length) return '<p class="muted">Nada registrado ainda.</p>';
        return '<ul class="clean-list">' + items.map(function(item) {
          if (typeof item === "string") return '<li>' + escapeHtml(item) + '</li>';
          return '<li><pre class="code-block">' + escapeHtml(JSON.stringify(item, null, 2)) + '</pre></li>';
        }).join("") + '</ul>';
      }

      function systemFilesHtml(files) {
        if (!files || !files.length) return '<p class="muted">Nenhum arquivo-base criado ainda.</p>';
        return files.map(function(file) {
          return '<details class="list-item" open><summary><strong>' + escapeHtml(file.name || "arquivo") + '</strong><span class="muted"> · ' + escapeHtml(file.type || "base") + '</span></summary><pre class="code-block">' + escapeHtml(file.content || "") + '</pre></details>';
        }).join("");
      }

      function openSystemPanel(panel) {
        if (!selectedSystem) return showToast("Gere ou selecione um sistema primeiro.");
        const scope = selectedSystem.scope || {};
        const panels = {
          details: [
            "Detalhes do sistema",
            "Arquitetura, telas, APIs, banco e arquivos ficam ocultos para manter a conversa limpa.",
            [
              '<article class="list-item"><strong>Arquitetura</strong><p class="muted">' + escapeHtml(selectedSystem.architecture || "") + '</p></article>',
              '<article class="list-item"><strong>Stack decidida pela YARA</strong><p class="muted">Frontend: ' + escapeHtml(selectedSystem.frontend || "") + ' · Backend: ' + escapeHtml(selectedSystem.backend || "") + ' · Banco: ' + escapeHtml(selectedSystem.database || "") + '</p><p class="muted">' + escapeHtml((selectedSystem.stack && selectedSystem.stack.reason) || "") + '</p></article>',
              '<article class="list-item"><strong>Telas</strong>' + systemListHtml(scope.screens || []) + '</article>',
              '<article class="list-item"><strong>APIs</strong>' + systemListHtml(scope.apis || []) + '</article>',
              '<article class="list-item"><strong>Banco de dados</strong>' + systemListHtml(scope.database || []) + '</article>',
              '<article class="list-item"><strong>Estrutura</strong>' + systemListHtml(selectedSystem.folderStructure || []) + '</article>'
            ].join("")
          ],
          folders: ["Estrutura de pastas", "Organização inicial escolhida pela YARA.", systemListHtml(selectedSystem.folderStructure || [])],
          screens: ["Telas do sistema", "Fluxos e telas previstos para o produto.", systemListHtml(scope.screens || [])],
          apis: ["APIs", "Endpoints e contratos planejados.", systemListHtml(scope.apis || [])],
          database: ["Banco de dados", "Entidades, tabelas e dados necessários.", systemListHtml(scope.database || [])],
          code: ["Arquivos-base", "Arquivos iniciais gerados para orientar o desenvolvimento.", systemFilesHtml(selectedSystem.files || [])]
        };
        const content = panels[panel];
        if (!content) return showToast("Painel indisponível.");
        openModal(content[0], content[1], content[2]);
      }

      async function publishSelectedSystem() {
        if (!selectedSystem) return showToast("Gere ou selecione um sistema primeiro.");
        showToast("Executando build e deploy do sistema...");
        const data = await api("/api/systems/" + selectedSystem.id + "/publish", { method: "POST" });
        selectedSystem = data.system;
        if (data.deploy && data.deploy.project) selectedSystem.deploy = data.deploy;
        renderSystemChatMessages();
        await loadSystems();
        if (data.deploy && data.deploy.project) await openDeployPanel(data.deploy.project.id);
        showToast("Sistema online. URLs geradas.");
      }

      async function duplicateSelectedSystem() {
        if (!selectedSystem) return showToast("Gere ou selecione um sistema primeiro.");
        const data = await api("/api/systems/" + selectedSystem.id + "/duplicate", { method: "POST" });
        selectedSystem = data.system;
        systemChatSessionId = null;
        systemChatMessages = [];
        await loadSystems();
        await selectSystem(selectedSystem.id);
        showToast("Projeto duplicado.");
      }

      function continueSystemEvolution() {
        if (!selectedSystem) return showToast("Gere ou selecione um sistema primeiro.");
        const input = document.getElementById("systemChatInput");
        if (input) {
          input.focus();
          input.placeholder = "Peça a próxima evolução para " + selectedSystem.name + "...";
        }
        showToast("Continue a conversa para evoluir o sistema.");
      }

      function openSystemSearch() {
        const query = window.prompt("Pesquisar no histórico de sistemas");
        if (query === null) return;
        const term = query.trim().toLowerCase();
        if (!term) {
          renderSystemList();
          openSystemsHistoryDrawer();
          return;
        }
        const filtered = systems.filter(function(system) {
          return [system.name, system.objective, system.type, system.architecture, system.database].join(" ").toLowerCase().includes(term);
        });
        const target = document.getElementById("systemsList");
        if (target) {
          target.innerHTML = filtered.length ? filtered.map(function(system) {
            return '<button class="conversation-item" data-open-system="' + escapeHtml(system.id) + '" type="button"><strong>' + escapeHtml(system.name) + '</strong><span>' + escapeHtml(system.updatedAt || system.createdAt || "") + ' · ' + escapeHtml(system.status || "ready") + '</span></button>';
          }).join("") : '<p class="muted">Nenhum sistema encontrado.</p>';
        }
        openSystemsHistoryDrawer();
      }

      function openSystemSettings() {
        openModal(
          "Configurações do Criador",
          "A YARA decide arquitetura, stack, banco e plano automaticamente.",
          '<article class="list-item"><strong>Modo conversa</strong><p class="muted">Ativo. O usuário descreve o produto em linguagem natural.</p></article><article class="list-item"><strong>Decisão técnica automática</strong><p class="muted">Ativa. Não há seleção manual de linguagem, framework, banco ou arquitetura.</p></article><article class="list-item"><strong>Persistência</strong><p class="muted">Cada sistema e sua conversa ficam salvos no histórico do usuário.</p></article>'
        );
      }

      async function attachDeployStatusToSelectedSystem() {
        if (!selectedSystem || !selectedSystem.id) return;
        const status = await api("/api/deploy/status?systemId=" + encodeURIComponent(selectedSystem.id)).catch(function() {
          return null;
        });
        if (status && status.project) {
          selectedSystem.deploy = status;
        }
      }

      function renderDeployPanel(data) {
        const project = data && data.project ? data.project : null;
        if (!project) return '<p class="muted">Este sistema ainda não foi publicado.</p>';
        const urls = project.urls || {};
        const domains = data.domains || [];
        const logs = data.logs || [];
        const release = data.latestRelease || (data.releases && data.releases[0]) || null;
        const build = data.latestBuild || (data.builds && data.builds[0]) || null;
        return [
          '<div class="dashboard-grid">',
          '<article class="metric-card"><span class="metric-label">Status</span><strong>' + escapeHtml(project.status || "online") + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Versão</span><strong>' + escapeHtml(release ? release.version : "v1") + '</strong></article>',
          '<article class="metric-card"><span class="metric-label">Último build</span><strong>' + escapeHtml(build ? build.status : "success") + '</strong></article>',
          '</div>',
          '<div class="list">',
          '<article class="list-item"><strong>URL principal</strong><p class="muted">' + escapeHtml(urls.frontend || "") + '</p><a class="button" href="' + escapeHtml(urls.frontend || "#") + '" target="_blank" rel="noreferrer">Abrir aplicação</a></article>',
          '<article class="list-item"><strong>API</strong><p class="muted">' + escapeHtml(urls.api ? urls.api + "/health" : "") + '</p><a class="button" href="' + escapeHtml(urls.api ? urls.api + "/health" : "#") + '" target="_blank" rel="noreferrer">Ver health</a></article>',
          '<article class="list-item"><strong>Admin</strong><p class="muted">' + escapeHtml(urls.admin || "") + '</p><a class="button" href="' + escapeHtml(urls.admin || "#") + '" target="_blank" rel="noreferrer">Abrir painel</a></article>',
          '<article class="list-item"><strong>Docs</strong><p class="muted">' + escapeHtml(urls.docs || "") + '</p><a class="button" href="' + escapeHtml(urls.docs || "#") + '" target="_blank" rel="noreferrer">Abrir documentação</a></article>',
          '</div>',
          '<article class="list-item"><strong>Aliases de domínio</strong><p class="muted">Preparados para DNS. Ficam ativos quando o domínio/provedor estiver configurado.</p>' + (domains.length ? domains.map(function(domain) { return '<p class="muted">' + escapeHtml(domain.type) + ': ' + escapeHtml(domain.domain) + ' · ' + (domain.active ? "ativo" : "pendente") + '</p>'; }).join("") : '<p class="muted">Nenhum alias registrado.</p>') + '</article>',
          '<div class="row"><button class="button" data-deploy-action="redeploy" data-project-id="' + escapeHtml(project.id) + '" type="button">Publicar nova versão</button><button class="button" data-deploy-action="restart" data-project-id="' + escapeHtml(project.id) + '" type="button">Reiniciar</button><button class="button" data-deploy-action="rollback" data-project-id="' + escapeHtml(project.id) + '" type="button">Rollback</button></div>',
          '<article class="list-item"><strong>Logs</strong>' + (logs.length ? logs.map(function(log) { return '<p class="muted">' + escapeHtml(log.createdAt || "") + ' · ' + escapeHtml(log.message || "") + '</p>'; }).join("") : '<p class="muted">Sem logs ainda.</p>') + '</article>'
        ].join("");
      }

      async function openDeployPanel(projectId) {
        if (!projectId && selectedSystem && selectedSystem.deploy && selectedSystem.deploy.project) {
          projectId = selectedSystem.deploy.project.id;
        }
        if (!projectId) return showToast("Publique o sistema primeiro.");
        const detail = await api("/api/deploy/projects/" + encodeURIComponent(projectId));
        const status = await api("/api/deploy/status?projectId=" + encodeURIComponent(projectId));
        openModal("Painel de Produção", "URLs, status, versão, logs e controles do deploy.", renderDeployPanel(Object.assign({}, detail, status)));
      }

      async function runDeployAction(action, projectId) {
        if (!projectId) return showToast("Projeto de deploy inválido.");
        const data = await api("/api/deploy/" + action, {
          method: "POST",
          body: JSON.stringify({ projectId: projectId })
        });
        if (selectedSystem && data.project) selectedSystem.deploy = Object.assign({}, selectedSystem.deploy || {}, { project: data.project });
        await openDeployPanel(projectId);
        renderSystemChatMessages();
        showToast("Ação de produção executada.");
      }

      async function loadSystems() {
        const data = await api("/api/systems");
        systems = data.systems || [];
        renderSystemList();
        if (selectedSystem && !systems.some(function(system) { return system.id === selectedSystem.id; })) selectedSystem = null;
        await loadSystemChatHistory();
      }

      async function loadSystemChatHistory() {
        const history = await api("/api/systems/chat/history").catch(function() {
          return { sessions: [], messages: [] };
        });
        systemChatSessionId = history.sessions && history.sessions[0] ? history.sessions[0].id : systemChatSessionId;
        systemChatMessages = history.messages || [];
        renderSystemChatMessages();
      }

      async function selectSystem(systemId) {
        if (!systemId) return;
        const data = await api("/api/systems/" + systemId);
        selectedSystem = data.system;
        await attachDeployStatusToSelectedSystem();
        renderSystemList();
        const history = await api("/api/systems/" + systemId + "/chat/history").catch(function() {
          return { session: null, messages: [] };
        });
        systemChatSessionId = history.session ? history.session.id : systemChatSessionId;
        systemChatMessages = history.messages || [];
        renderSystemChatMessages();
        closeSystemsHistoryDrawer();
      }

      async function generateSystemFromUi() {
        return sendSystemChatFromUi();
      }

      async function sendSystemChatFromUi() {
        const prompt = getValue("systemChatInput").trim();
        if (prompt.length < 2) return showToast("Digite o que deseja criar ou alterar.");
        const button = document.getElementById("systemChatSendButton");
        if (button) button.disabled = true;
        systemChatMessages = systemChatMessages.concat([{ role: "user", content: prompt }]);
        renderSystemChatMessages();
        setValue("systemChatInput", "");
        try {
          const data = await api("/api/systems/chat", {
            method: "POST",
            body: JSON.stringify(Object.assign(
              { message: prompt },
              systemChatSessionId ? { sessionId: systemChatSessionId } : {},
              selectedSystem && selectedSystem.id ? { systemId: selectedSystem.id } : {}
            ))
          });
          systemChatSessionId = data.session ? data.session.id : systemChatSessionId;
          systemChatMessages = data.messages || systemChatMessages;
          renderSystemChatMessages();
          if (data.system && data.system.id) {
            selectedSystem = data.system;
            if (data.deploy && data.deploy.project) selectedSystem.deploy = data.deploy;
            const list = await api("/api/systems").catch(function() { return { systems: systems }; });
            systems = list.systems || systems;
            renderSystemList();
            renderSystemChatMessages();
          }
          if (data.file && data.file.id) {
            await downloadProtectedPath("/api/files/" + data.file.id + "/download", data.file.name || "sistema");
          }
          showToast(data.deploy ? "Sistema atualizado e nova versão publicada." : data.file ? "Arquivo gerado." : "Conversa atualizada.");
        } finally {
          if (button) button.disabled = false;
        }
      }

      async function exportSelectedSystem(format) {
        if (!selectedSystem) return showToast("Selecione um sistema primeiro.");
        const data = await api("/api/systems/" + selectedSystem.id + "/export", {
          method: "POST",
          body: JSON.stringify({ format: format })
        });
        showToast("Sistema exportado em " + String(format).toUpperCase() + ".");
        if (data.file && data.file.id) await downloadProtectedPath("/api/files/" + data.file.id + "/download", data.file.name || selectedSystem.name);
      }

      function renderAgentsDashboard(dashboard) {
        const target = document.getElementById("agentsDashboard");
        if (!target) return;
        const totals = dashboard && dashboard.totals ? dashboard.totals : {};
        const metric = function(label, value, hint) {
          return '<article class="metric-card"><span class="metric-label">' + escapeHtml(label) + '</span><strong>' + escapeHtml(String(value || 0)) + '</strong><p class="muted">' + escapeHtml(hint) + '</p></article>';
        };
        target.innerHTML = [
          metric("Agentes", totals.agents || 0, "Total disponível"),
          metric("Ativos", totals.activeAgents || 0, "Prontos para uso"),
          metric("Conversas", totals.conversations || 0, "Histórico separado"),
          metric("Memórias", totals.memories || 0, "Contexto por agente"),
          metric("Colaborações", totals.collaborations || 0, "Consultas entre agentes")
        ].join("");
      }

      function renderAgentSelectors() {
        const options = ['<option value="">Roteamento automático</option>'].concat(agents.map(function(agent) {
          return '<option value="' + escapeHtml(agent.id) + '">' + escapeHtml(agent.name) + '</option>';
        })).join("");
        setHtml("agentSelect", options);
        setHtml("agentSourceSelect", agents.map(function(agent) { return '<option value="' + escapeHtml(agent.id) + '">' + escapeHtml(agent.name) + '</option>'; }).join(""));
        setHtml("agentTargetSelect", agents.map(function(agent) { return '<option value="' + escapeHtml(agent.id) + '">' + escapeHtml(agent.name) + '</option>'; }).join(""));
        setValue("agentSelect", selectedAgentId || "");
      }

      function renderAgentsList() {
        setText("agentsCount", agents.length + " agente" + (agents.length === 1 ? "" : "s"));
        const target = document.getElementById("agentsList");
        if (!target) return;
        target.innerHTML = agents.length ? agents.map(function(agent) {
          const active = selectedAgentId === agent.id ? " active" : "";
          return '<article class="list-item' + active + '"><div class="item-top"><div><strong>' + escapeHtml(agent.name) + '</strong><p class="muted">' + escapeHtml(agent.description) + '</p></div><span class="status"><span class="dot"></span>' + escapeHtml(agent.status) + '</span></div><p class="muted">Especialidade: ' + escapeHtml(agent.specialty) + '</p><div class="row"><button class="button" data-select-agent="' + escapeHtml(agent.id) + '" type="button">Usar</button><button class="button" data-toggle-agent="' + escapeHtml(agent.id) + '" data-status="' + escapeHtml(agent.status) + '" type="button">' + (agent.status === "active" ? "Inativar" : "Ativar") + '</button><button class="icon-button danger" data-delete-agent="' + escapeHtml(agent.id) + '" type="button" aria-label="Excluir agente">${icon("trash")}</button></div></article>';
        }).join("") : '<p class="muted">Nenhum agente disponível.</p>';
        renderAgentSelectors();
      }

      function renderAgentMessages() {
        const target = document.getElementById("agentChatMessages");
        if (!target) return;
        if (!agentMessages.length) {
          target.innerHTML = '<div class="empty-chat"><h2>Qual agente deve ajudar?</h2></div>';
          return;
        }
        target.innerHTML = agentMessages.map(function(message) {
          const isUser = message.role === "user";
          return '<article class="message ' + (isUser ? "user" : "assistant") + '"><div class="message-avatar">' + (isUser ? initials(currentUser && currentUser.name) : "AG") + '</div><div class="message-content">' + renderMarkdown(message.content || "") + '</div></article>';
        }).join("");
        target.scrollTop = target.scrollHeight;
      }

      function renderAgentConversations(conversations) {
        const target = document.getElementById("agentConversations");
        if (!target) return;
        target.innerHTML = conversations && conversations.length ? conversations.map(function(item) {
          return '<button class="conversation-item" data-open-agent-conversation="' + escapeHtml(item.id) + '" data-agent-id="' + escapeHtml(item.agentId) + '" type="button"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.updatedAt || "") + '</span></button>';
        }).join("") : '<p class="muted">Nenhuma conversa com agentes ainda.</p>';
      }

      async function loadAgents() {
        const data = await api("/api/agents");
        agents = data.agents || [];
        if (!selectedAgentId && agents.length) selectedAgentId = "";
        renderAgentsDashboard(data.dashboard);
        renderAgentsList();
        const history = await api("/api/agents/chat/history").catch(function() { return { conversations: [], messages: [] }; });
        renderAgentConversations(history.conversations || []);
        agentMessages = history.messages || [];
        selectedAgentConversationId = history.conversations && history.conversations[0] ? history.conversations[0].id : selectedAgentConversationId;
        renderAgentMessages();
      }

      async function sendAgentChatFromUi() {
        const message = getValue("agentChatInput").trim();
        if (message.length < 2) return showToast("Digite a mensagem para o agente.");
        const button = document.getElementById("agentChatSendButton");
        if (button) button.disabled = true;
        agentMessages = agentMessages.concat([{ role: "user", content: message }]);
        renderAgentMessages();
        setValue("agentChatInput", "");
        try {
          const data = await api("/api/agents/chat", {
            method: "POST",
            body: JSON.stringify({
              message: message,
              agentId: getValue("agentSelect") || undefined,
              conversationId: selectedAgentConversationId || undefined
            })
          });
          selectedAgentId = data.agent ? data.agent.id : selectedAgentId;
          selectedAgentConversationId = data.conversation ? data.conversation.id : selectedAgentConversationId;
          agentMessages = data.messages || agentMessages;
          renderAgentMessages();
          await loadAgents();
          showToast("Agente respondeu.");
        } finally {
          if (button) button.disabled = false;
        }
      }

      async function createAgentFromUi() {
        const name = getValue("agentName").trim();
        const specialty = getValue("agentSpecialty").trim();
        const description = getValue("agentDescription").trim();
        const basePrompt = getValue("agentPrompt").trim();
        if (name.length < 2 || specialty.length < 2 || description.length < 2 || basePrompt.length < 4) return showToast("Preencha os dados do agente.");
        await api("/api/agents", {
          method: "POST",
          body: JSON.stringify({ name: name, specialty: specialty, description: description, basePrompt: basePrompt })
        });
        ["agentName", "agentSpecialty", "agentDescription", "agentPrompt"].forEach(function(id) { setValue(id, ""); });
        await loadAgents();
        showToast("Agente criado.");
      }

      async function collaborateAgentsFromUi() {
        const sourceAgentId = getValue("agentSourceSelect");
        const targetAgentId = getValue("agentTargetSelect");
        const request = getValue("agentCollaborationRequest").trim();
        if (!sourceAgentId || !targetAgentId || request.length < 2) return showToast("Informe origem, destino e pedido.");
        const data = await api("/api/agents/collaborate", {
          method: "POST",
          body: JSON.stringify({ sourceAgentId: sourceAgentId, targetAgentId: targetAgentId, request: request, conversationId: selectedAgentConversationId || undefined })
        });
        setHtml("agentCollaborationResult", renderMarkdown(data.collaboration.response || ""));
        setValue("agentCollaborationRequest", "");
        await loadAgents();
        showToast("Colaboração registrada.");
      }

      async function loadMemories() {
        const intelligent = await api("/api/memory").catch(function() { return null; });
        if (intelligent && intelligent.dashboard) renderMemoryDashboard(intelligent.dashboard);
        const data = intelligent || await api("/api/memories");
        const memories = data.memories || [];
        const target = document.getElementById("memoryList");
        if (!target) return;
        if (!memories.length) {
          target.innerHTML = '<p class="muted">Nenhuma memória salva ainda.</p>';
          return;
        }
        target.innerHTML = memories.map(function(memory) {
          const badge = memory.readonly ? '<span class="status"><span class="dot"></span>Aprendido</span>' : '<span class="status"><span class="dot"></span>' + escapeHtml(memory.category || "manual") + '</span>';
          const pin = memory.pinned ? '<span class="status">Fixada</span>' : "";
          const edit = memory.readonly ? "" : '<button class="icon-button" data-edit-memory="' + memory.id + '" data-title="' + escapeHtml(memory.title || "Memória") + '" data-content="' + escapeHtml(memory.content) + '" type="button" aria-label="Editar memória">${icon("save")}</button><button class="icon-button" data-pin-memory="' + memory.id + '" data-pinned="' + Boolean(memory.pinned) + '" type="button" aria-label="Fixar memória">${icon("pin")}</button>';
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(memory.title || "Memória") + '</strong><div class="row">' + badge + pin + edit + '<button class="icon-button danger" data-delete-memory="' + memory.id + '" type="button" aria-label="Excluir memória">${icon("trash")}</button></div></div><p class="muted">Importância ' + escapeHtml(String(memory.importance || 3)) + ' · ' + escapeHtml(memory.source || "manual") + '</p><p class="muted">' + escapeHtml(memory.content) + '</p></article>';
        }).join("");
      }

      function renderMemoryDashboard(dashboard) {
        const cards = document.getElementById("memoryDashboardCards");
        const status = document.getElementById("memorySystemStatus");
        if (!cards || !status) return;
        const totals = dashboard.totals || {};
        cards.innerHTML = [
          ["Memórias", totals.memories || 0],
          ["Embeddings", totals.embeddings || 0],
          ["Relações", totals.relations || 0],
          ["Sessões", totals.sessions || 0],
          ["Resumos", totals.summaries || 0],
          ["Armazenamento", Math.round(Number(totals.storageBytes || 0) / 1024 * 10) / 10 + " KB"]
        ].map(function(item) {
          return '<article class="metric-card"><span class="metric-label">' + item[0] + '</span><strong>' + item[1] + '</strong></article>';
        }).join("");
        const system = dashboard.system || {};
        const embeddings = system.embeddings || {};
        const redis = system.redis || {};
        const postgres = system.postgres || {};
        status.textContent = "Banco ativo: " + (system.database || "sqlite") + " · Embeddings: " + (embeddings.provider || "local") + "/" + (embeddings.model || "yara") + " · Redis: " + (redis.status || "local-cache") + " · pgvector: " + (postgres.status || "prepared");
      }

      function renderMemorySearchResults(results) {
        const target = document.getElementById("memorySearchResults");
        if (!target) return;
        if (!results.length) {
          target.innerHTML = '<p class="muted">Nenhuma memória relacionada encontrada.</p>';
          return;
        }
        target.innerHTML = results.map(function(memory) {
          const score = memory.score === undefined ? "" : " · similaridade " + Math.round(Number(memory.score) * 100) + "%";
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(memory.title || "Memória") + '</strong><span class="status">' + escapeHtml(memory.category || "geral") + score + '</span></div><p class="muted">' + escapeHtml(memory.content) + '</p></article>';
        }).join("");
      }

      async function loadUploads() {
        const data = await api("/api/uploads");
        const uploads = data.uploads || [];
        const target = document.getElementById("uploadsList");
        const total = uploads.reduce(function(sum, item) { return sum + Number(item.file_size || 0); }, 0);
        setText("storageText", Math.round(total / 1024 / 1024 * 10) / 10 + " MB em arquivos enviados.");
        if (!uploads.length) {
          target.innerHTML = '<p class="muted">Nenhum arquivo enviado ainda.</p>';
          return;
        }
        target.innerHTML = uploads.map(function(file) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(file.original_name || file.file_name) + '</strong><div class="row"><button class="button" data-download-upload="' + file.id + '" data-file-name="' + escapeHtml(file.original_name || file.file_name) + '" type="button">Abrir</button><button class="icon-button danger" data-delete-upload="' + file.id + '" type="button" aria-label="Remover arquivo">${icon("trash")}</button></div></div><p class="muted">' + attachmentMeta(file) + '</p></article>';
        }).join("");
      }

      function documentTemplateLabel(id) {
        const template = documentTemplates.find(function(item) { return item.id === id; });
        return template ? template.label : id;
      }

      function parseDocumentFields(fieldId) {
        const raw = getValue(fieldId).trim();
        if (!raw) return {};
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
            throw new Error("Campos inválidos.");
          }
          return parsed;
        } catch {
          throw new Error("Preencha os campos em JSON válido.");
        }
      }

      async function loadDocuments() {
        const templateData = await api("/api/documents/templates");
        const documentData = await api("/api/documents");
        documentTemplates = templateData.templates || [];
        currentDocuments = documentData.documents || [];
        ["documentTemplate", "documentPageTemplate"].forEach(function(selectId) {
          const select = document.getElementById(selectId);
          if (!select || select.options.length) return;
          select.innerHTML = documentTemplates.map(function(template) {
            return '<option value="' + escapeHtml(template.id) + '">' + escapeHtml(template.label) + '</option>';
          }).join("");
        });
        renderDocumentTemplates();
        renderDocumentConvertOptions();
        renderDocumentCategoryOptions();
        renderDocumentList("documentsList", currentDocuments);
        renderDocumentList("documentsPageList", filteredDocuments());
      }

      function filteredDocuments() {
        const search = (document.getElementById("documentSearch")?.value || "").trim().toLowerCase();
        const format = document.getElementById("documentFormatFilter")?.value || "";
        const category = document.getElementById("documentCategoryFilter")?.value || "";
        return currentDocuments.filter(function(documentItem) {
          const matchesSearch = !search || [documentItem.title, documentItem.file_name, documentItem.template, documentItem.type].join(" ").toLowerCase().includes(search);
          const matchesFormat = !format || documentItem.format === format;
          const matchesCategory = !category || documentItem.template === category || documentItem.type === category;
          return matchesSearch && matchesFormat && matchesCategory;
        });
      }

      function renderDocumentCategoryOptions() {
        const select = document.getElementById("documentCategoryFilter");
        if (!select) return;
        const categories = Array.from(new Set(currentDocuments.map(function(documentItem) {
          return documentItem.template || documentItem.type || "";
        }).filter(Boolean)));
        select.innerHTML = '<option value="">Todas as categorias</option>' + categories.map(function(category) {
          return '<option value="' + escapeHtml(category) + '">' + escapeHtml(documentTemplateLabel(category)) + '</option>';
        }).join("");
      }

      function renderDocumentTemplates() {
        const target = document.getElementById("documentTemplatesList");
        if (!target) return;
        target.innerHTML = documentTemplates.map(function(template) {
          return '<article class="card"><h2>' + escapeHtml(template.label) + '</h2><p class="muted">' + escapeHtml(template.description || "") + '</p></article>';
        }).join("");
      }

      function renderDocumentConvertOptions() {
        const select = document.getElementById("documentConvertSource");
        if (!select) return;
        select.innerHTML = currentDocuments.length
          ? currentDocuments.map(function(documentItem) {
              return '<option value="' + documentItem.id + '">' + escapeHtml(documentItem.title) + ' · ' + escapeHtml(String(documentItem.format).toUpperCase()) + '</option>';
            }).join("")
          : '<option value="">Nenhum documento disponível</option>';
      }

      function renderDocumentList(targetId, documents) {
        const target = document.getElementById(targetId);
        if (!target) return;
        if (!documents.length) {
          target.innerHTML = '<p class="muted">Nenhum documento gerado ainda.</p>';
          return;
        }
        target.innerHTML = documents.map(function(documentItem) {
          const size = Math.round(Number(documentItem.file_size || 0) / 1024 * 10) / 10 + " KB";
          const label = documentTemplateLabel(documentItem.template);
          return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(documentItem.title) + '</strong><p class="muted">' + escapeHtml(label || documentItem.template) + ' · ' + escapeHtml(String(documentItem.format).toUpperCase()) + ' · ' + escapeHtml(documentItem.type || "documento") + ' · ' + size + '</p></div><div class="row"><button class="button" data-analyze-document="' + documentItem.id + '" type="button">Analisar</button><button class="button" data-download-document="' + documentItem.id + '" data-file-name="' + escapeHtml(documentItem.file_name) + '" type="button">Baixar</button><button class="icon-button danger" data-delete-document="' + documentItem.id + '" type="button" aria-label="Excluir documento">${icon("trash")}</button></div></div></article>';
        }).join("");
      }

      async function createDocumentFromControls(config) {
        const title = getValue(config.titleId).trim();
        if (title.length < 2) return showToast("Informe um título para o documento.");
        let fields;
        try {
          fields = parseDocumentFields(config.fieldsId);
        } catch (error) {
          return showToast(error.message);
        }
        await api("/api/documents", {
          method: "POST",
          body: JSON.stringify({
            title: title,
            template: getValue(config.templateId),
            format: getValue(config.formatId),
            fields: fields
          })
        });
        setValue(config.titleId, "");
        await loadDocuments();
        await loadDashboard();
        showToast("Documento gerado com sucesso.");
      }

      async function handleDocumentListClick(event) {
        const analyzeButton = event.target.closest("[data-analyze-document]");
        if (analyzeButton) {
          const data = await api("/api/documents/" + analyzeButton.dataset.analyzeDocument + "/analysis");
          const analysis = data.analysis || {};
          openModal("Análise do documento", data.document ? data.document.title : "Documento", '<pre class="code-block">' + escapeHtml(JSON.stringify(analysis, null, 2)) + '</pre>');
          return;
        }
        const downloadButton = event.target.closest("[data-download-document]");
        if (downloadButton) {
          await downloadDocument(downloadButton.dataset.downloadDocument, downloadButton.dataset.fileName || "documento");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-document]");
        if (!deleteButton) return;
        await api("/api/documents/" + deleteButton.dataset.deleteDocument, { method: "DELETE" });
        await loadDocuments();
        await loadDashboard();
        showToast("Documento removido.");
      }

      async function uploadDocumentFromInput(file) {
        if (!file) return;
        const form = new FormData();
        form.append("file", file);
        const data = await apiForm("/api/documents/upload", form);
        await loadDocuments();
        await loadDashboard();
        const analysis = data.document && data.document.metadata ? data.document.metadata.analysis : null;
        setHtml("documentAnalysisList", '<article class="list-item"><strong>' + escapeHtml(data.document.title) + '</strong><p class="muted">Documento enviado e analisado.</p><pre class="code-block">' + escapeHtml(JSON.stringify(analysis || {}, null, 2)) + '</pre></article>');
        showToast("Documento enviado e analisado.");
      }

      async function convertSelectedDocument() {
        const documentId = getValue("documentConvertSource");
        const toFormat = getValue("documentConvertFormat");
        if (!documentId) return showToast("Selecione um documento para converter.");
        const data = await api("/api/documents/convert", {
          method: "POST",
          body: JSON.stringify({ documentId: documentId, toFormat: toFormat })
        });
        if (data.success === false) {
          showToast(data.message || "Conversão ainda não disponível.");
          return;
        }
        await loadDocuments();
        showToast("Documento convertido com sucesso.");
      }

      function filteredFiles() {
        const search = (document.getElementById("fileSearch")?.value || "").trim().toLowerCase();
        const type = document.getElementById("fileTypeFilter")?.value || "";
        const category = document.getElementById("fileCategoryFilter")?.value || "";
        return currentFiles.filter(function(file) {
          const name = fileDisplayName(file).toLowerCase();
          const mime = fileMime(file).toLowerCase();
          const ext = fileExtension(file);
          const source = String(file.source || file.category || "").toLowerCase();
          const matchesSearch = !search || [name, mime, ext, source].join(" ").includes(search);
          const matchesType = !type || (type === "image" ? mime.startsWith("image/") : ext === type || mime.includes(type));
          const matchesCategory = !category || source === category || file.category === category || file.source === category;
          return matchesSearch && matchesType && matchesCategory;
        });
      }

      function renderFileStats() {
        const target = document.getElementById("fileStats");
        if (!target) return;
        const now = Date.now();
        const recent = currentFiles.filter(function(file) {
          const created = new Date(file.created_at || 0).getTime();
          return created && now - created < 7 * 24 * 60 * 60 * 1000;
        }).length;
        const items = [
          ["Todos", currentFiles.length, '${icon("file")}'],
          ["Recentes", recent, '${icon("history")}'],
          ["Favoritos", currentFiles.filter(function(file) { return Number(file.is_favorite) === 1 || file.is_favorite === true; }).length, '${icon("pin")}'],
          ["Compartilhados", currentFiles.filter(function(file) { return Number(file.is_shared) === 1 || file.is_shared === true; }).length, '${icon("share")}']
        ];
        target.innerHTML = items.map(function(item) {
          return '<article class="card stat-card"><span class="avatar">' + item[2] + '</span><strong>' + item[1] + '</strong><p class="muted">' + escapeHtml(item[0]) + '</p></article>';
        }).join("");
      }

      function renderFileList() {
        renderFileStats();
        const target = document.getElementById("fileList");
        if (!target) return;
        const files = filteredFiles();
        if (!files.length) {
          target.innerHTML = '<p class="muted">Nenhum arquivo encontrado.</p>';
          return;
        }
        target.innerHTML = files.map(function(file) {
          const name = escapeHtml(fileDisplayName(file));
          const id = escapeHtml(file.id || "");
          const source = escapeHtml(file.source === "generated" ? "Gerado pela IA" : file.category === "uploaded" || file.source === "upload" ? "Enviado" : file.source || file.category || "Arquivo");
          return '<article class="list-item"><div class="item-top"><div><strong>' + name + '</strong><p class="muted">' + fileMeta(file) + '</p><span class="status"><span class="dot"></span>' + source + '</span></div><div class="row"><button class="button" data-preview-file="' + id + '" type="button">Visualizar</button><button class="button" data-download-file="' + id + '" data-file-name="' + name + '" type="button">Baixar</button><button class="icon-button danger" data-delete-file="' + id + '" type="button" aria-label="Excluir arquivo">${icon("trash")}</button></div></div></article>';
        }).join("");
      }

      async function loadFiles() {
        const data = await api("/api/files");
        currentFiles = data.files || [];
        renderFileList();
      }

      async function uploadFileFromInput(file) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return showToast("Arquivo muito grande. Limite de 10 MB.");
        const form = new FormData();
        form.append("file", file);
        const status = document.getElementById("fileUploadStatus");
        if (status) status.innerHTML = '<article class="list-item"><p class="muted">Enviando ' + escapeHtml(file.name) + '...</p></article>';
        const data = await apiForm("/api/files/upload", form);
        if (status) status.innerHTML = '<article class="list-item"><strong>' + escapeHtml(fileDisplayName(data.file || {})) + '</strong><p class="muted">Arquivo enviado com sucesso.</p></article>';
        await loadFiles();
        await loadDashboard().catch(function() {});
        showToast("Arquivo enviado com sucesso.");
      }

      async function exportFileFromControls() {
        const format = getValue("fileExportFormat") || "pdf";
        const title = getValue("fileExportTitle").trim() || "arquivo-yara";
        const content = getValue("fileExportContent").trim();
        if (!content) return showToast("Informe o conteúdo que deseja exportar.");
        const data = await api("/api/export/" + format, {
          method: "POST",
          body: JSON.stringify({ title: title, content: content })
        });
        setValue("fileExportContent", "");
        await loadFiles();
        showToast("Arquivo gerado com sucesso.");
        if (data.file && data.file.id) await previewFile(data.file.id).catch(function() {});
      }

      async function handleFileListClick(event) {
        const previewButton = event.target.closest("[data-preview-file]");
        if (previewButton) {
          await previewFile(previewButton.dataset.previewFile);
          return;
        }
        const downloadButton = event.target.closest("[data-download-file]");
        if (downloadButton) {
          await downloadFile(downloadButton.dataset.downloadFile, downloadButton.dataset.fileName || "arquivo");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-file]");
        if (!deleteButton) return;
        if (!window.confirm("Excluir este arquivo?")) return;
        await api("/api/files/" + deleteButton.dataset.deleteFile, { method: "DELETE" });
        await loadFiles();
        await loadDashboard().catch(function() {});
        showToast("Arquivo removido.");
      }

      function imageMeta(image) {
        const dimensions = image.width && image.height ? image.width + "x" + image.height + " px" : "Dimensões não informadas";
        return escapeHtml(image.file_type || "imagem") + " · " + dimensions + " · " + formatFileSize(image.file_size || 0);
      }

      function clearPendingImage() {
        if (pendingImagePreviewUrl) URL.revokeObjectURL(pendingImagePreviewUrl);
        pendingImageFile = null;
        pendingImagePreviewUrl = "";
        const preview = document.getElementById("imagePreview");
        if (preview) preview.innerHTML = '<p class="muted">O preview aparecerá aqui antes do envio.</p>';
      }

      function setPendingImage(file) {
        clearPendingImage();
        if (!file) return;
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.type)) return showToast("Tipo de imagem não permitido.");
        if (file.size > 10 * 1024 * 1024) return showToast("Imagem muito grande.");
        pendingImageFile = file;
        pendingImagePreviewUrl = URL.createObjectURL(file);
        setHtml("imagePreview", '<img src="' + pendingImagePreviewUrl + '" alt="' + escapeHtml(file.name) + '" /><p class="muted">' + escapeHtml(file.name) + " · " + escapeHtml(file.type) + " · " + formatFileSize(file.size) + '</p>');
      }

      async function uploadPendingImage() {
        if (!pendingImageFile) return showToast("Escolha uma imagem antes de enviar.");
        const form = new FormData();
        form.append("file", pendingImageFile);
        const data = await apiForm("/api/images/upload", form);
        clearPendingImage();
        await loadImages();
        await loadDashboard();
        showToast("Imagem enviada com sucesso.");
        return data.image;
      }

      async function downloadImage(imageId, fileName) {
        return downloadProtectedPath("/api/images/" + imageId + "/download", fileName || "imagem");
      }

      async function loadImageThumbnails() {
        document.querySelectorAll("[data-image-thumb]").forEach(function(imageNode) {
          const imageId = imageNode.getAttribute("data-image-thumb");
          if (!imageId || imageNode.dataset.loaded === "true") return;
          imageNode.dataset.loaded = "true";
          fetchProtectedFile("/api/images/" + imageId + "/download")
            .then(function(blob) { imageNode.src = URL.createObjectURL(blob); })
            .catch(function() { imageNode.alt = "Imagem indisponível"; });
        });
      }

      function filteredImages() {
        const search = (document.getElementById("imageSearch")?.value || "").trim().toLowerCase();
        return currentImages.filter(function(image) {
          return !search || [image.original_name, image.file_name, image.file_type].join(" ").toLowerCase().includes(search);
        });
      }

      function renderImageSelects() {
        ["imageEditSource", "imageOcrSource"].forEach(function(selectId) {
          const select = document.getElementById(selectId);
          if (!select) return;
          select.innerHTML = currentImages.length
            ? currentImages.map(function(image) {
                return '<option value="' + image.id + '">' + escapeHtml(image.original_name || image.file_name) + ' · ' + escapeHtml(String(image.file_type || "").replace("image/", "").toUpperCase()) + '</option>';
              }).join("")
            : '<option value="">Nenhuma imagem disponível</option>';
        });
      }

      function renderImages() {
        const target = document.getElementById("imagesList");
        if (!target) return;
        const images = filteredImages();
        if (!images.length) {
          target.innerHTML = '<p class="muted">Nenhuma imagem enviada ainda.</p>';
          return;
        }
        target.innerHTML = images.map(function(image) {
          const name = escapeHtml(image.original_name || image.file_name || "Imagem");
          const id = escapeHtml(image.id);
          return '<article class="list-item"><div class="item-top"><div class="account-row"><img class="image-card-preview" data-image-thumb="' + id + '" alt="' + name + '" /><div><strong>' + name + '</strong><p class="muted">' + imageMeta(image) + '</p></div></div><div class="row"><button class="button" data-analyze-image="' + id + '" type="button">Analisar</button><button class="button" data-ocr-image="' + id + '" type="button">OCR</button><button class="button" data-edit-image="' + id + '" type="button">Editar</button><button class="button" data-send-image-chat="' + id + '" type="button">Enviar ao chat</button><button class="button" data-save-image-project="' + id + '" type="button">Salvar em projeto</button><button class="button" data-download-image="' + id + '" data-file-name="' + name + '" type="button">Baixar</button><button class="icon-button danger" data-delete-image="' + id + '" type="button" aria-label="Excluir imagem">${icon("trash")}</button></div></div></article>';
        }).join("");
        loadImageThumbnails();
      }

      function renderImageHistory(history) {
        const target = document.getElementById("imageHistoryList");
        if (!target) return;
        const analyses = history.analyses || [];
        const edits = history.edits || [];
        const items = analyses.slice(0, 8).map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.type || "análise") + '</strong><p class="muted">Imagem ' + escapeHtml(item.image_id || "") + ' · ' + escapeHtml(item.created_at || "") + '</p></article>';
        }).concat(edits.slice(0, 8).map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.edit_type || "edição") + '</strong><p class="muted">' + escapeHtml(item.status || "") + ' · ' + escapeHtml(item.provider || "sharp") + '</p></article>';
        }));
        const advanced = (history.advanced || []).slice(0, 6).map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.name) + '</strong><p class="muted">' + escapeHtml(item.message || "Recurso avançado em preparação.") + '</p></article>';
        });
        target.innerHTML = items.concat(advanced).join("") || '<p class="muted">Nenhum histórico de imagem ainda.</p>';
      }

      async function loadImages() {
        const data = await api("/api/images");
        const historyData = await api("/api/images/history");
        currentImages = data.images || [];
        renderImageSelects();
        renderImages();
        renderImageHistory(historyData.history || {});
      }

      async function analyzeSelectedImage(imageId) {
        const data = await api("/api/images/analyze", {
          method: "POST",
          body: JSON.stringify({ imageId: imageId })
        });
        await loadImages();
        openModal("Análise da imagem", data.image ? data.image.original_name : "Imagem", '<pre class="code-block">' + escapeHtml(JSON.stringify(data.analysis.result || {}, null, 2)) + '</pre>');
      }

      async function runImageOcr(imageId) {
        const data = await api("/api/images/ocr", {
          method: "POST",
          body: JSON.stringify({ imageId: imageId })
        });
        await loadImages();
        const result = data.ocr && data.ocr.result ? data.ocr.result : {};
        setText("imageOcrResult", result.text || result.message || "OCR ainda não configurado neste ambiente.");
        openModal("OCR da imagem", data.image ? data.image.original_name : "Imagem", '<pre class="code-block">' + escapeHtml(JSON.stringify(result, null, 2)) + '</pre>');
      }

      async function editImageFromControls(imageId) {
        const id = imageId || getValue("imageEditSource");
        if (!id) return showToast("Selecione uma imagem para editar.");
        const payload = {
          imageId: id,
          optimize: getChecked("imageEditOptimize"),
          brightness: Number(getValue("imageEditBrightness") || 1),
          contrast: Number(getValue("imageEditContrast") || 1),
          saturation: Number(getValue("imageEditSaturation") || 1)
        };
        const width = Number(getValue("imageEditWidth") || 0);
        const height = Number(getValue("imageEditHeight") || 0);
        const format = getValue("imageEditFormat");
        if (width) payload.width = width;
        if (height) payload.height = height;
        if (format) payload.format = format;
        const data = await api("/api/images/edit", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        await loadImages();
        showToast("Imagem editada com sucesso.");
        return data.image;
      }

      async function sendImageToChat(imageId) {
        const image = currentImages.find(function(item) { return item.id === imageId; });
        if (!image) return showToast("Imagem não encontrada.");
        const blob = await fetchProtectedFile("/api/images/" + imageId + "/download");
        const file = new File([blob], image.original_name || image.file_name || "imagem", { type: blob.type || image.file_type });
        setView("chat");
        setPendingAttachment(file);
        setValue(els.messageInput, "O que tem nessa imagem?");
        autoGrowMessageInput();
        byId("chatForm")?.requestSubmit();
      }

      async function showImageProjectPicker(imageId) {
        if (!projects.length) await loadProjects();
        if (!projects.length) return showToast("Crie um projeto antes de salvar a imagem.");
        openModal("Salvar imagem em projeto", "Escolha onde a imagem será organizada.", projects.map(function(project) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(project.name) + '</strong><button class="button" data-link-image-project="' + escapeHtml(imageId) + '" data-project-id="' + escapeHtml(project.id) + '" type="button">Salvar aqui</button></div><p class="muted">' + escapeHtml(project.description || project.type || "Projeto YARA AI") + '</p></article>';
        }).join(""));
      }

      async function handleImageListClick(event) {
        const analyzeButton = event.target.closest("[data-analyze-image]");
        if (analyzeButton) return analyzeSelectedImage(analyzeButton.dataset.analyzeImage);
        const ocrButton = event.target.closest("[data-ocr-image]");
        if (ocrButton) return runImageOcr(ocrButton.dataset.ocrImage);
        const editButton = event.target.closest("[data-edit-image]");
        if (editButton) {
          setValue("imageEditSource", editButton.dataset.editImage);
          return editImageFromControls(editButton.dataset.editImage);
        }
        const sendButton = event.target.closest("[data-send-image-chat]");
        if (sendButton) {
          return sendImageToChat(sendButton.dataset.sendImageChat);
        }
        const saveButton = event.target.closest("[data-save-image-project]");
        if (saveButton) {
          return showImageProjectPicker(saveButton.dataset.saveImageProject);
        }
        const downloadButton = event.target.closest("[data-download-image]");
        if (downloadButton) return downloadImage(downloadButton.dataset.downloadImage, downloadButton.dataset.fileName || "imagem");
        const deleteButton = event.target.closest("[data-delete-image]");
        if (!deleteButton) return;
        await api("/api/images/" + deleteButton.dataset.deleteImage, { method: "DELETE" });
        await loadImages();
        showToast("Imagem excluída.");
      }

      function eventDateTimeLabel(eventItem) {
        return escapeHtml(eventItem.date || "") + (eventItem.time ? " às " + escapeHtml(eventItem.time) : "");
      }

      function setDefaultAgendaDates() {
        const today = new Date();
        const yyyyMmDd = today.toISOString().slice(0, 10);
        const eventDate = document.getElementById("eventDate");
        if (eventDate && !eventDate.value) eventDate.value = yyyyMmDd;
        const reminderDate = document.getElementById("reminderScheduledAt");
        if (reminderDate && !reminderDate.value) {
          const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
          reminderDate.value = nextHour.toISOString().slice(0, 16);
        }
      }

      function calendarRangeDates() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(start);
        if (currentCalendarRange === "week") end.setDate(end.getDate() + 7);
        else if (currentCalendarRange === "month") end.setMonth(end.getMonth() + 1);
        return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
      }

      function renderCalendarStats(summary) {
        const target = document.getElementById("calendarStats");
        if (!target) return;
        const items = [
          ["Eventos hoje", (summary.today || []).length, '${icon("history")}'],
          ["Compromissos da semana", (summary.week || []).length, '${icon("save")}'],
          ["Próximos lembretes", (summary.reminders || []).length, '${icon("pin")}'],
          ["Notificações", (summary.notifications || []).length, '${icon("sparkles")}']
        ];
        target.innerHTML = items.map(function(item) {
          return '<article class="card stat-card"><span class="avatar">' + item[2] + '</span><strong>' + item[1] + '</strong><p class="muted">' + escapeHtml(item[0]) + '</p></article>';
        }).join("");
      }

      function renderCalendarEvents() {
        const target = document.getElementById("calendarEventsList");
        if (!target) return;
        if (!currentCalendarEvents.length) {
          target.innerHTML = '<p class="muted">Nenhum evento neste período.</p>';
          return;
        }
        target.innerHTML = currentCalendarEvents.map(function(eventItem) {
          return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(eventItem.title) + '</strong><p class="muted">' + eventDateTimeLabel(eventItem) + (eventItem.location ? " · " + escapeHtml(eventItem.location) : "") + '</p></div><div class="row"><button class="button" data-edit-event="' + eventItem.id + '" type="button">Editar</button><button class="icon-button danger" data-delete-event="' + eventItem.id + '" type="button" aria-label="Excluir evento">${icon("trash")}</button></div></div><p class="muted">' + escapeHtml(eventItem.description || "Sem descrição.") + '</p></article>';
        }).join("");
      }

      function renderReminders() {
        const target = document.getElementById("remindersList");
        if (!target) return;
        if (!currentReminders.length) {
          target.innerHTML = '<p class="muted">Nenhum lembrete criado ainda.</p>';
          return;
        }
        target.innerHTML = currentReminders.map(function(reminder) {
          const date = reminder.scheduled_at ? new Date(reminder.scheduled_at).toLocaleString("pt-BR") : "";
          return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(reminder.title) + '</strong><p class="muted">' + escapeHtml(date) + ' · ' + escapeHtml(reminder.recurrence || "none") + ' · ' + escapeHtml(reminder.status || "pending") + '</p></div><div class="row"><button class="button" data-edit-reminder="' + reminder.id + '" type="button">Editar</button><button class="icon-button danger" data-delete-reminder="' + reminder.id + '" type="button" aria-label="Excluir lembrete">${icon("trash")}</button></div></div><p class="muted">' + escapeHtml(reminder.message || "Sem mensagem.") + '</p></article>';
        }).join("");
      }

      function renderNotifications(items) {
        const target = document.getElementById("notificationsList");
        if (!target) return;
        if (!items.length) {
          target.innerHTML = '<p class="muted">Nenhuma notificação agendada.</p>';
          return;
        }
        target.innerHTML = items.map(function(item) {
          return '<article class="list-item"><strong>' + escapeHtml(item.title) + '</strong><p class="muted">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.status) + '</p><p class="muted">' + escapeHtml(item.message) + '</p></article>';
        }).join("");
      }

      async function loadCalendar() {
        setDefaultAgendaDates();
        const range = calendarRangeDates();
        const summary = await api("/api/calendar/summary");
        const events = await api("/api/calendar/events?from=" + range.from + "&to=" + range.to);
        const reminders = await api("/api/reminders");
        const notifications = await api("/api/notifications");
        currentCalendarEvents = events.events || [];
        currentReminders = reminders.reminders || [];
        renderCalendarStats(summary.summary || {});
        renderCalendarEvents();
        renderReminders();
        renderNotifications(notifications.notifications || []);
      }

      async function createEventFromForm(event) {
        event.preventDefault();
        const title = getValue("eventTitle").trim();
        if (title.length < 2) return showToast("Informe um título para o evento.");
        await api("/api/calendar/events", {
          method: "POST",
          body: JSON.stringify({
            title: title,
            description: getValue("eventDescription").trim() || null,
            date: getValue("eventDate"),
            time: getValue("eventTime") || null,
            location: getValue("eventLocation").trim() || null,
            participants: getValue("eventParticipants").trim() || null,
            reminderMinutes: getValue("eventReminder") ? Number(getValue("eventReminder")) : null
          })
        });
        event.currentTarget.reset();
        setDefaultAgendaDates();
        await loadCalendar();
        await loadDashboard();
        showToast("Evento criado.");
      }

      async function createReminderFromForm(event) {
        event.preventDefault();
        const title = getValue("reminderTitle").trim();
        const scheduledAt = getValue("reminderScheduledAt");
        if (title.length < 2 || !scheduledAt) return showToast("Informe título, data e hora para o lembrete.");
        await api("/api/reminders", {
          method: "POST",
          body: JSON.stringify({
            title: title,
            message: getValue("reminderMessage").trim() || null,
            scheduledAt: new Date(scheduledAt).toISOString(),
            recurrence: getValue("reminderRecurrence")
          })
        });
        event.currentTarget.reset();
        setDefaultAgendaDates();
        await loadCalendar();
        await loadDashboard();
        showToast("Lembrete criado.");
      }

      async function handleCalendarEventClick(event) {
        const editButton = event.target.closest("[data-edit-event]");
        if (editButton) {
          const current = currentCalendarEvents.find(function(item) { return item.id === editButton.dataset.editEvent; });
          if (!current) return;
          const title = window.prompt("Editar título do evento", current.title);
          if (title === null) return;
          await api("/api/calendar/events/" + current.id, { method: "PATCH", body: JSON.stringify({ title: title }) });
          await loadCalendar();
          showToast("Evento atualizado.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-event]");
        if (!deleteButton) return;
        await api("/api/calendar/events/" + deleteButton.dataset.deleteEvent, { method: "DELETE" });
        await loadCalendar();
        await loadDashboard();
        showToast("Evento excluído.");
      }

      async function handleReminderClick(event) {
        const editButton = event.target.closest("[data-edit-reminder]");
        if (editButton) {
          const current = currentReminders.find(function(item) { return item.id === editButton.dataset.editReminder; });
          if (!current) return;
          const title = window.prompt("Editar título do lembrete", current.title);
          if (title === null) return;
          await api("/api/reminders/" + current.id, { method: "PATCH", body: JSON.stringify({ title: title }) });
          await loadCalendar();
          showToast("Lembrete atualizado.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-reminder]");
        if (!deleteButton) return;
        await api("/api/reminders/" + deleteButton.dataset.deleteReminder, { method: "DELETE" });
        await loadCalendar();
        await loadDashboard();
        showToast("Lembrete excluído.");
      }

      async function callGoogleCalendar(path, method = "GET") {
        const status = document.getElementById("googleCalendarStatus");
        try {
          const data = await api(path, { method: method });
          if (status) status.textContent = data.message || data.url || "Google Calendar pronto.";
          if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
        } catch (error) {
          const message = error.message || "Google Calendar ainda não configurado pelo administrador.";
          if (status) status.textContent = message;
          showToast(message);
        }
      }

      function integrationStatusCard(title, item) {
        const connected = Boolean(item && item.connected);
        const configured = Boolean(item && item.configured);
        const status = connected ? "Conectado" : (configured ? "Pronto para conectar" : "Aguardando configuração");
        const lastSync = item && item.lastSyncAt ? item.lastSyncAt : "Sem sincronização";
        const error = item && item.lastError ? '<p class="muted danger-text">' + escapeHtml(item.lastError) + '</p>' : "";
        return '<article class="metric-card"><span class="metric-label">' + escapeHtml(title) + '</span><strong>' + status + '</strong><p class="muted">Última sincronização: ' + escapeHtml(lastSync) + '</p>' + error + '</article>';
      }

      function renderIntegrationResult(targetId, data) {
        const target = document.getElementById(targetId);
        if (!target) return;
        if (!data) {
          target.textContent = "Nenhuma resposta recebida.";
          return;
        }
        if (data.message) {
          target.textContent = data.message;
          return;
        }
        if (Array.isArray(data.events)) {
          target.innerHTML = data.events.length
            ? data.events.map(function(event) { return '<article class="list-item"><strong>' + escapeHtml(event.summary || event.title || "Evento") + '</strong><p class="muted">' + escapeHtml(event.start || event.event_date || "") + '</p></article>'; }).join("")
            : '<p class="muted">Nenhum evento retornado.</p>';
          return;
        }
        if (Array.isArray(data.messages)) {
          target.innerHTML = data.messages.length
            ? data.messages.map(function(message) { return '<article class="list-item"><strong>' + escapeHtml(message.subject || "E-mail") + '</strong><p class="muted">' + escapeHtml(message.from || "") + '</p><p>' + escapeHtml(message.snippet || "") + '</p></article>'; }).join("")
            : '<p class="muted">Nenhum e-mail retornado.</p>';
          return;
        }
        if (data.summary) {
          target.innerHTML = '<p>' + escapeHtml(data.summary) + '</p>';
          return;
        }
        if (data.notification) {
          target.textContent = "Notificação interna criada: " + (data.notification.title || "YARA AI");
          return;
        }
        target.textContent = JSON.stringify(data, null, 2);
      }

      async function callIntegration(path, targetId, options) {
        const target = document.getElementById(targetId);
        try {
          const data = await api(path, options || {});
          if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
          renderIntegrationResult(targetId, data);
          await loadIntegrations();
          return data;
        } catch (error) {
          if (target) target.textContent = error.message || "Não foi possível executar esta integração.";
          showToast(error.message || "Integração indisponível.");
          return null;
        }
      }

      async function loadIntegrations() {
        const statusTarget = document.getElementById("integrationsStatusGrid");
        const pushTarget = document.getElementById("integrationPushList");
        const auditTarget = document.getElementById("integrationAuditList");
        if (!statusTarget) return;
        try {
          const status = await api("/api/integrations/status");
          const integrations = status.integrations || {};
          statusTarget.innerHTML = [
            integrationStatusCard("Google Calendar", integrations.googleCalendar || {}),
            integrationStatusCard("Gmail", integrations.gmail || {}),
            integrationStatusCard("Google Drive", integrations.googleDrive || {}),
            integrationStatusCard("Telegram", integrations.telegram || {}),
            integrationStatusCard("WhatsApp", integrations.whatsapp || {}),
            integrationStatusCard("Push", integrations.push || {})
          ].join("");
          const fileSelect = document.getElementById("integrationDriveFileSelect");
          const filesData = await api("/api/files").catch(function() { return { files: [] }; });
          currentFiles = filesData.files || currentFiles || [];
          if (fileSelect) {
            fileSelect.innerHTML = currentFiles.length
              ? currentFiles.map(function(file) {
                  return '<option value="' + escapeHtml(file.id) + '">' + escapeHtml(fileDisplayName(file)) + '</option>';
                }).join("")
              : '<option value="">Nenhum arquivo YARA carregado</option>';
          }
          const subscriptions = await api("/api/push/subscriptions").catch(function() { return { subscriptions: [] }; });
          if (pushTarget) {
            pushTarget.innerHTML = (subscriptions.subscriptions || []).length
              ? subscriptions.subscriptions.map(function(item) { return '<article class="list-item"><strong>Push ativo</strong><p class="muted">' + escapeHtml(item.endpoint || item.id) + '</p></article>'; }).join("")
              : '<p class="muted">Nenhuma inscrição push ativa.</p>';
          }
          const audit = await api("/api/integrations/audit").catch(function() { return { logs: [] }; });
          if (auditTarget) {
            auditTarget.innerHTML = (audit.logs || []).slice(0, 8).map(function(log) {
              return '<article class="list-item"><strong>' + escapeHtml(log.service + " · " + log.action) + '</strong><p class="muted">' + escapeHtml(log.status + " · " + log.created_at) + '</p>' + (log.message ? '<p>' + escapeHtml(log.message) + '</p>' : "") + '</article>';
            }).join("") || '<p class="muted">Nenhum log de integração ainda.</p>';
          }
          await loadAutomations();
        } catch (error) {
          statusTarget.innerHTML = '<article class="list-item"><strong>Integrações indisponíveis</strong><p class="muted">' + escapeHtml(error.message || "Não foi possível carregar integrações.") + '</p></article>';
        }
      }

      function renderAutomations(automations, executions) {
        const list = document.getElementById("automationList");
        const executionList = document.getElementById("automationExecutionList");
        if (list) {
          list.innerHTML = (automations || []).length
            ? automations.map(function(item) {
                return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(item.name) + '</strong><p class="muted">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.scheduleExpression || 'manual') + ' · ' + escapeHtml(item.status) + '</p><p class="muted">Próxima execução: ' + escapeHtml(item.nextRunAt || "manual") + '</p></div><div class="row"><button class="button" data-run-automation="' + escapeHtml(item.id) + '" type="button">Executar</button><button class="button" data-pause-automation="' + escapeHtml(item.id) + '" data-status="' + escapeHtml(item.status) + '" type="button">' + (item.status === "paused" ? "Ativar" : "Pausar") + '</button><button class="icon-button danger" data-delete-automation="' + escapeHtml(item.id) + '" type="button" aria-label="Excluir automação">${icon("trash")}</button></div></div></article>';
              }).join("")
            : '<p class="muted">Nenhuma automação criada ainda.</p>';
        }
        if (executionList) {
          executionList.innerHTML = (executions || []).slice(0, 5).map(function(item) {
            return '<article class="list-item"><strong>Execução ' + escapeHtml(item.status) + '</strong><p class="muted">' + escapeHtml(item.started_at || "") + '</p></article>';
          }).join("") || '<p class="muted">Nenhuma execução registrada.</p>';
        }
      }

      async function loadAutomations() {
        const data = await api("/api/automations").catch(function() { return { automations: [] }; });
        const executions = await api("/api/automations/executions").catch(function() { return { executions: [] }; });
        renderAutomations(data.automations || [], executions.executions || []);
      }

      function renderAutomationWorkspaceDashboard(dashboard) {
        const target = document.getElementById("automationDashboardGrid");
        if (!target) return;
        const data = dashboard || {};
        target.innerHTML = [
          automationStatCard("Automações", String(data.total || 0), "Total criado"),
          automationStatCard("Ativas", String(data.active || 0), "Prontas para execução"),
          automationStatCard("Execuções hoje", String(data.runsToday || 0), "Histórico do dia"),
          automationStatCard("Falhas", String(data.failures || 0), "Exigem revisão")
        ].join("");
      }

      function automationStatCard(label, value, detail) {
        return '<article class="card stat-card"><span class="avatar">' + escapeHtml(value) + '</span><strong>' + escapeHtml(label) + '</strong><p class="muted">' + escapeHtml(detail || "") + '</p></article>';
      }

      function renderAutomationWorkspaceList(automations) {
        const target = document.getElementById("automationFlowList");
        if (!target) return;
        target.innerHTML = (automations || []).length
          ? automations.map(function(item) {
              const action = item.action && item.action.type ? item.action.type : "notify";
              return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(item.name) + '</strong><p class="muted">' + escapeHtml(item.description || "Fluxo YARA") + '</p><p class="muted">' + escapeHtml(item.triggerType || "scheduled") + ' · ' + escapeHtml(action) + ' · ' + escapeHtml(item.status || "active") + '</p></div><div class="row"><button class="button" data-test-automation="' + escapeHtml(item.id) + '" type="button">Testar</button><button class="button" data-run-automation-workspace="' + escapeHtml(item.id) + '" type="button">Executar</button><button class="button" data-toggle-automation="' + escapeHtml(item.id) + '" data-status="' + escapeHtml(item.status || "active") + '" type="button">' + (item.status === "active" ? "Desabilitar" : "Habilitar") + '</button><button class="icon-button danger" data-delete-automation-workspace="' + escapeHtml(item.id) + '" type="button" aria-label="Excluir automação">${icon("trash")}</button></div></div></article>';
            }).join("")
          : '<p class="muted">Nenhum fluxo criado ainda. Use o chat ou o formulário para criar uma automação.</p>';
      }

      function renderAutomationWorkspaceHistory(history) {
        const target = document.getElementById("automationRunList");
        if (!target) return;
        target.innerHTML = (history || []).length
          ? history.map(function(item) {
              const result = item.result ? safeJsonPreview(item.result) : "";
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.status || "running") + '</strong><span class="status">' + escapeHtml(String(item.duration || 0)) + ' ms</span></div><p class="muted">' + escapeHtml(item.createdAt || item.startTime || "") + '</p>' + (result ? '<p class="muted">' + result + '</p>' : "") + '</article>';
            }).join("")
          : '<p class="muted">Nenhuma execução registrada.</p>';
      }

      function renderAutomationWorkspaceLogs(logs) {
        const target = document.getElementById("automationLogList");
        if (!target) return;
        target.innerHTML = (logs || []).length
          ? logs.map(function(item) {
              return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml((item.level || "info").toUpperCase()) + '</strong><span class="status">' + escapeHtml(item.createdAt || "") + '</span></div><p>' + escapeHtml(item.message || "Log de automação.") + '</p></article>';
            }).join("")
          : '<p class="muted">Nenhum log de automação registrado.</p>';
      }

      async function loadAutomationWorkspace() {
        const data = await api("/api/automations/workspace");
        renderAutomationWorkspaceDashboard(data.dashboard || {});
        renderAutomationWorkspaceList(data.automations || []);
        renderAutomationWorkspaceHistory(data.history || []);
        renderAutomationWorkspaceLogs(data.logs || []);
      }

      async function createAutomationFlowFromUi() {
        const name = getValue("automationFlowName").trim();
        const description = getValue("automationFlowDescription").trim();
        const triggerType = getValue("automationFlowTrigger") || "scheduled";
        const actionType = getValue("automationFlowAction") || "generate_pdf";
        const scheduleExpression = getValue("automationFlowSchedule") || "manual";
        if (!name) return showToast("Informe o nome do fluxo.");
        await api("/api/automations", {
          method: "POST",
          body: JSON.stringify({
            name: name,
            description: description,
            type: actionType === "create_task" ? "recurring_task" : "auto_report",
            triggerType: triggerType,
            triggerConfig: { source: "workspace" },
            scheduleExpression: scheduleExpression,
            action: { type: actionType, title: name, message: description || name },
            actions: [{ type: actionType, config: { instruction: description || name } }]
          })
        });
        const form = document.getElementById("automationFlowForm");
        if (form && "reset" in form) form.reset();
        await loadAutomationWorkspace();
        await loadAutomations();
        showToast("Fluxo de automação criado.");
      }

      function appendAutomationChat(role, text) {
        const target = document.getElementById("automationChatMessages");
        if (!target) return;
        target.insertAdjacentHTML("beforeend", '<div class="message ' + escapeHtml(role) + '"><div class="message-content">' + escapeHtml(text) + '</div></div>');
        target.scrollTop = target.scrollHeight;
      }

      async function sendAutomationChatFromUi() {
        const input = document.getElementById("automationChatInput");
        const message = getValue("automationChatInput").trim();
        if (!message) return showToast("Descreva a automação.");
        appendAutomationChat("user", message);
        if (input && "value" in input) input.value = "";
        const data = await api("/api/automations/chat", {
          method: "POST",
          body: JSON.stringify({ message: message })
        });
        appendAutomationChat("assistant", data.reply || "Automação criada.");
        await loadAutomationWorkspace();
        await loadAutomations();
      }

      async function handleAutomationWorkspaceClick(event) {
        const testButton = event.target.closest("[data-test-automation]");
        if (testButton) {
          await api("/api/automations/test", {
            method: "POST",
            body: JSON.stringify({ automationId: testButton.dataset.testAutomation })
          });
          await loadAutomationWorkspace();
          showToast("Teste da automação concluído.");
          return;
        }
        const runButton = event.target.closest("[data-run-automation-workspace]");
        if (runButton) {
          await api("/api/automations/run", {
            method: "POST",
            body: JSON.stringify({ automationId: runButton.dataset.runAutomationWorkspace })
          });
          await loadAutomationWorkspace();
          showToast("Automação executada.");
          return;
        }
        const toggleButton = event.target.closest("[data-toggle-automation]");
        if (toggleButton) {
          await api(toggleButton.dataset.status === "active" ? "/api/automations/disable" : "/api/automations/enable", {
            method: "POST",
            body: JSON.stringify({ automationId: toggleButton.dataset.toggleAutomation })
          });
          await loadAutomationWorkspace();
          showToast("Status da automação atualizado.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-automation-workspace]");
        if (!deleteButton) return;
        if (!window.confirm("Excluir esta automação?")) return;
        await api("/api/automations/" + deleteButton.dataset.deleteAutomationWorkspace, { method: "DELETE" });
        await loadAutomationWorkspace();
        await loadAutomations();
        showToast("Automação excluída.");
      }

      function renderPluginDashboard(dashboard) {
        const target = document.getElementById("pluginDashboardGrid");
        if (!target) return;
        const data = dashboard || {};
        target.innerHTML = [
          automationStatCard("Instalados", String(data.installed || 0), "Plugins instalados"),
          automationStatCard("Ativos", String(data.active || 0), "Habilitados no workspace"),
          automationStatCard("Atualizações", String(data.updates || 0), "Prévias e novidades"),
          automationStatCard("Uso", String(data.usage || 0), "Eventos registrados")
        ].join("");
      }

      function pluginCard(plugin) {
        const permissions = (plugin.permissions || []).slice(0, 3).join(" · ");
        const integrations = plugin.metadata && plugin.metadata.integrations ? plugin.metadata.integrations.slice(0, 3).join(" · ") : "";
        return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(plugin.name) + '</strong><p class="muted">' + escapeHtml(plugin.description || "") + '</p><p class="muted">' + escapeHtml(plugin.category || "Geral") + ' · v' + escapeHtml(plugin.version || "1.0.0") + ' · ' + escapeHtml(plugin.status || "available") + '</p>' + (permissions ? '<p class="muted">Permissões: ' + escapeHtml(permissions) + '</p>' : "") + (integrations ? '<p class="muted">Integrações: ' + escapeHtml(integrations) + '</p>' : "") + '</div><div class="row">' + (plugin.installed ? '<button class="button" data-plugin-toggle="' + escapeHtml(plugin.id) + '" data-enabled="' + String(Boolean(plugin.enabled)) + '" type="button">' + (plugin.enabled ? "Desativar" : "Ativar") + '</button><button class="button danger" data-plugin-uninstall="' + escapeHtml(plugin.id) + '" type="button">Desinstalar</button>' : '<button class="primary-action" data-plugin-install="' + escapeHtml(plugin.id) + '" type="button">${icon("plus")}Instalar</button>') + '</div></div></article>';
      }

      function renderPluginLists(data, installedData, categoriesData, logsData) {
        renderPluginDashboard((data && data.dashboard) || (installedData && installedData.dashboard) || {});
        const marketplace = document.getElementById("pluginMarketplaceList");
        const installed = document.getElementById("pluginInstalledList");
        const categories = document.getElementById("pluginCategoryList");
        const updates = document.getElementById("pluginUpdatesList");
        const logs = document.getElementById("pluginLogList");
        const plugins = data && data.plugins ? data.plugins : [];
        const installedPlugins = installedData && installedData.plugins ? installedData.plugins : [];
        if (marketplace) {
          marketplace.innerHTML = plugins.length ? plugins.map(pluginCard).join("") : '<p class="muted">Marketplace indisponível.</p>';
        }
        if (installed) {
          installed.innerHTML = installedPlugins.length ? installedPlugins.map(pluginCard).join("") : '<p class="muted">Nenhum plugin instalado ainda.</p>';
        }
        if (categories) {
          const items = categoriesData && categoriesData.categories ? categoriesData.categories : [];
          categories.innerHTML = items.length
            ? items.map(function(item) { return '<article class="list-item"><strong>' + escapeHtml(item.name) + '</strong><p class="muted">' + escapeHtml(String(item.total || 0)) + ' plugins disponíveis</p></article>'; }).join("")
            : '<p class="muted">Nenhuma categoria encontrada.</p>';
        }
        if (updates) {
          const preview = plugins.filter(function(plugin) { return plugin.status === "preview"; });
          updates.innerHTML = preview.length
            ? preview.map(function(plugin) { return '<article class="list-item"><strong>' + escapeHtml(plugin.name) + '</strong><p class="muted">Prévia disponível · v' + escapeHtml(plugin.version || "") + '</p></article>'; }).join("")
            : '<p class="muted">Nenhuma atualização pendente.</p>';
        }
        if (logs) {
          const items = logsData && logsData.logs ? logsData.logs : [];
          logs.innerHTML = items.length
            ? items.map(function(item) { return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(item.pluginName || "Plugin") + '</strong><span class="status">' + escapeHtml(item.level || "info") + '</span></div><p>' + escapeHtml(item.message || "") + '</p><p class="muted">' + escapeHtml(item.createdAt || "") + '</p></article>'; }).join("")
            : '<p class="muted">Nenhum log de plugin registrado.</p>';
        }
      }

      async function loadMarketplace() {
        const data = await api("/api/plugins/marketplace");
        const installed = await api("/api/plugins/installed").catch(function() { return { plugins: [], dashboard: data.dashboard || {} }; });
        const categories = await api("/api/plugins/categories").catch(function() { return { categories: [] }; });
        const logs = await api("/api/plugins/logs").catch(function() { return { logs: [] }; });
        renderPluginLists(data, installed, categories, logs);
      }

      function appendPluginChat(role, text) {
        const target = document.getElementById("pluginChatMessages");
        if (!target) return;
        target.insertAdjacentHTML("beforeend", '<div class="message ' + escapeHtml(role) + '"><div class="message-content">' + escapeHtml(text) + '</div></div>');
        target.scrollTop = target.scrollHeight;
      }

      async function sendPluginChatFromUi() {
        const input = document.getElementById("pluginChatInput");
        const message = getValue("pluginChatInput").trim();
        if (!message) return showToast("Informe um comando para o marketplace.");
        appendPluginChat("user", message);
        if (input && "value" in input) input.value = "";
        const data = await api("/api/plugins/chat", {
          method: "POST",
          body: JSON.stringify({ message: message })
        });
        appendPluginChat("assistant", data.reply || "Comando processado.");
        await loadMarketplace();
      }

      async function handlePluginActionClick(event) {
        const install = event.target.closest("[data-plugin-install]");
        if (install) {
          await api("/api/plugins/install", { method: "POST", body: JSON.stringify({ pluginId: install.dataset.pluginInstall }) });
          await loadMarketplace();
          showToast("Plugin instalado.");
          return;
        }
        const toggle = event.target.closest("[data-plugin-toggle]");
        if (toggle) {
          await api(toggle.dataset.enabled === "true" ? "/api/plugins/disable" : "/api/plugins/enable", {
            method: "POST",
            body: JSON.stringify({ pluginId: toggle.dataset.pluginToggle })
          });
          await loadMarketplace();
          showToast("Plugin atualizado.");
          return;
        }
        const uninstall = event.target.closest("[data-plugin-uninstall]");
        if (!uninstall) return;
        if (!window.confirm("Desinstalar este plugin?")) return;
        await api("/api/plugins/uninstall", { method: "POST", body: JSON.stringify({ pluginId: uninstall.dataset.pluginUninstall }) });
        await loadMarketplace();
        showToast("Plugin desinstalado.");
      }

      function statusBadge(label, state, detail) {
        return '<article class="card stat-card"><span class="avatar">' + (state ? "OK" : "!") + '</span><strong>' + escapeHtml(label) + '</strong><p class="muted">' + escapeHtml(detail || (state ? "Operacional" : "Atenção necessária")) + '</p></article>';
      }

      function renderAuditStatus(status) {
        const target = byId("auditStatusGrid");
        if (!target) return;
        const counts = status && status.counts ? status.counts : {};
        const storage = status && status.storage ? status.storage : {};
        const apiOnline = typeof status.api === "boolean" ? status.api : Boolean(status.api && status.api.online);
        const databaseOnline = typeof status.database === "boolean" ? status.database : Boolean(status.database && status.database.online);
        const databaseDetail = typeof status.database === "boolean" ? "Conectado" : (status.database && status.database.type ? status.database.type : "Verificando");
        target.innerHTML = [
          statusBadge("API", apiOnline, apiOnline ? "Online" : "Verificando"),
          statusBadge("Banco", databaseOnline, databaseDetail),
          statusBadge("Armazenamento", true, formatFileSize(storage.sizeBytes || 0) + " em uso"),
          statusBadge("Auditoria", true, String(counts.auditEvents || 0) + " eventos"),
          statusBadge("Backups", true, String(counts.backups || 0) + " registros"),
          statusBadge("Automações", Boolean(status && status.automations), String(status && status.automations ? status.automations.active || 0 : 0) + " ativas")
        ].join("");
      }

      function renderAuditEvents(data) {
        const list = byId("auditList");
        const label = byId("auditPageLabel");
        const events = data && data.events ? data.events : [];
        if (label) {
          const total = data && data.total ? data.total : 0;
          label.textContent = "Página " + auditPage + " · " + total + " eventos";
        }
        if (!list) return;
        list.innerHTML = events.length
          ? events.map(function(item) {
              const metadata = item.metadata_json ? safeJsonPreview(item.metadata_json) : "";
              return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(item.category + " · " + item.action) + '</strong><p class="muted">' + escapeHtml(item.created_at || "") + (item.entity_type ? " · " + escapeHtml(item.entity_type) : "") + '</p></div><span class="status"><span class="dot"></span>' + escapeHtml(item.status || "ok") + '</span></div><p>' + escapeHtml(item.message || "Evento registrado.") + '</p>' + (metadata ? '<p class="muted">' + metadata + '</p>' : "") + '</article>';
            }).join("")
          : '<p class="muted">Nenhum evento encontrado.</p>';
      }

      function safeJsonPreview(value) {
        try {
          const parsed = typeof value === "string" ? JSON.parse(value) : value;
          const text = JSON.stringify(parsed);
          return escapeHtml(text.length > 180 ? text.slice(0, 180) + "..." : text);
        } catch (_error) {
          return escapeHtml(String(value || "").slice(0, 180));
        }
      }

      function renderApplicationLogs(data) {
        const list = byId("logList");
        const logs = data && data.logs ? data.logs : [];
        if (!list) return;
        list.innerHTML = logs.length
          ? logs.map(function(item) {
              return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml((item.level || "info").toUpperCase() + " · " + (item.channel || "app")) + '</strong><p class="muted">' + escapeHtml(item.created_at || "") + '</p></div></div><p>' + escapeHtml(item.message || "") + '</p>' + (item.context_json ? '<p class="muted">' + safeJsonPreview(item.context_json) + '</p>' : "") + '</article>';
            }).join("")
          : '<p class="muted">Nenhum log encontrado.</p>';
      }

      function renderBackups(data) {
        const list = byId("backupList");
        const backups = data && data.backups ? data.backups : [];
        if (!list) return;
        list.innerHTML = backups.length
          ? backups.map(function(item) {
              const name = item.file_name || item.fileName || item.id;
              return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(name) + '</strong><p class="muted">' + escapeHtml(item.type || "manual") + ' · ' + escapeHtml(item.status || "completed") + ' · ' + formatFileSize(item.file_size || item.fileSize || 0) + '</p><p class="muted">' + escapeHtml(item.created_at || item.createdAt || "") + '</p></div><button class="button" data-download-backup="' + escapeHtml(item.id) + '" data-file-name="' + escapeHtml(name) + '" type="button">Manifesto</button></div></article>';
            }).join("")
          : '<p class="muted">Nenhum backup criado ainda.</p>';
      }

      async function loadAudit() {
        const query = encodeURIComponent(getValue("auditSearch").trim());
        const category = encodeURIComponent(getValue("auditCategoryFilter"));
        const action = encodeURIComponent(getValue("auditActionFilter").trim());
        const params = ["page=" + auditPage, "pageSize=20"];
        if (query) params.push("query=" + query);
        if (category) params.push("category=" + category);
        if (action) params.push("action=" + action);

        const status = await api("/api/status/details").catch(function(error) {
          setHtml("auditStatusGrid", '<article class="card"><strong>Status indisponível</strong><p class="muted">' + escapeHtml(error.message) + '</p></article>');
          return null;
        });
        if (status && status.status) renderAuditStatus(status.status);

        const audit = await api("/api/audit?" + params.join("&")).catch(function(error) {
          setHtml("auditList", '<div class="module-error"><div><strong>Não foi possível carregar auditoria.</strong><span>' + escapeHtml(error.message) + '</span></div></div>');
          return null;
        });
        if (audit) renderAuditEvents(audit);

        const level = encodeURIComponent(getValue("logLevelFilter"));
        const logs = await api("/api/logs?pageSize=12" + (level ? "&level=" + level : "")).catch(function(error) {
          setHtml("logList", '<div class="module-error"><div><strong>Não foi possível carregar logs.</strong><span>' + escapeHtml(error.message) + '</span></div></div>');
          return null;
        });
        if (logs) renderApplicationLogs(logs);

        const backups = await api("/api/backups").catch(function(error) {
          setHtml("backupList", '<div class="module-error"><div><strong>Não foi possível carregar backups.</strong><span>' + escapeHtml(error.message) + '</span></div></div>');
          return null;
        });
        if (backups) renderBackups(backups);
      }

      async function createBackupFromUi() {
        const data = await api("/api/backups", { method: "POST", body: JSON.stringify({ type: "manual" }) });
        showToast("Backup criado com sucesso.");
        await loadAudit();
        return data;
      }

      async function loadPilarReport() {
        const data = await api("/api/reports/pilar-01");
        const report = data.report || {};
        setHtml("pilarReportBox", '<div class="list"><article class="list-item"><strong>' + escapeHtml(report.title || "Relatório Pilar 01") + '</strong><p class="muted">' + escapeHtml(report.generatedAt || "") + '</p></article><article class="list-item"><strong>Arquitetura</strong><p class="muted">' + safeJsonPreview(report.architecture || {}) + '</p></article><article class="list-item"><strong>Recursos</strong><p class="muted">' + escapeHtml((report.features || []).join(" · ")) + '</p></article><article class="list-item"><strong>Segurança</strong><p class="muted">' + escapeHtml((report.security || []).join(" · ")) + '</p></article></div>');
      }

      async function createAutomationFromForm(event) {
        event.preventDefault();
        const name = getValue("automationName").trim();
        const message = getValue("automationMessage").trim();
        if (!name) return showToast("Informe o nome da automação.");
        const payload = {
          name: name,
          type: getValue("automationType") || "reminder",
          scheduleExpression: getValue("automationSchedule") || "once",
          nextRunAt: getValue("automationNextRunAt") || null,
          action: {
            title: name,
            message: message || name
          }
        };
        await api("/api/automations", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        event.currentTarget.reset();
        await loadAutomations();
        showToast("Automação criada.");
      }

      async function handleAutomationListClick(event) {
        const runButton = event.target.closest("[data-run-automation]");
        if (runButton) {
          await api("/api/automations/" + runButton.dataset.runAutomation + "/run", { method: "POST" });
          await loadAutomations();
          showToast("Automação executada.");
          return;
        }
        const pauseButton = event.target.closest("[data-pause-automation]");
        if (pauseButton) {
          await api("/api/automations/" + pauseButton.dataset.pauseAutomation, {
            method: "PATCH",
            body: JSON.stringify({ status: pauseButton.dataset.status === "paused" ? "active" : "paused" })
          });
          await loadAutomations();
          showToast("Automação atualizada.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-automation]");
        if (!deleteButton) return;
        if (!window.confirm("Excluir esta automação?")) return;
        await api("/api/automations/" + deleteButton.dataset.deleteAutomation, { method: "DELETE" });
        await loadAutomations();
        showToast("Automação excluída.");
      }

      async function loadAiStatus() {
        const data = await api("/api/ai/status");
        setText("aiProvider", data.provider || "YARA");
        setText("aiModel", data.model || "Modelo ativo");
        setText("aiOnline", data.online ? "Online" : "Offline");
        const modelSelect = document.getElementById("modelSelect");
        if (modelSelect) {
          const label = (data.provider ? data.provider.toUpperCase() + " · " : "") + (data.model || "Modelo ativo");
          modelSelect.innerHTML = '<option>' + escapeHtml(label) + '</option>';
        }
      }

      async function loadSessions(targetId = "sessionList") {
        const data = await api("/api/users/sessions");
        const target = document.getElementById(targetId);
        if (!target) return;
        target.innerHTML = (data.sessions || []).map(function(session) {
          return '<article class="list-item"><strong>' + escapeHtml(session.device) + '</strong><p class="muted">' + escapeHtml(session.location) + " · " + (session.active ? "Ativa" : "Encerrada") + '</p></article>';
        }).join("");
      }

      async function loadSettings() {
        await api("/api/users/profile").catch(function() { return null; });
        const data = await api("/api/settings");
        const settings = data.settings || {};
        setValue("displayName", settings.display_name || (currentUser ? currentUser.name : ""));
        setValue("fullName", settings.full_name || (currentUser ? currentUser.name : ""));
        setValue("profileEmail", currentUser ? currentUser.email : "");
        setValue("profilePhone", currentUser && currentUser.phone ? currentUser.phone : "");
        setValue("avatarUrl", settings.avatar_url || "");
        setValue("aiStyle", settings.ai_style || "balanced");
        setValue("language", settings.language || "pt-BR");
        setValue("responseLength", settings.response_length || "medium");
        applyVoiceSettings(settings);
        setText("settingsName", currentUser ? currentUser.name : "Usuário");
        setText("settingsEmail", currentUser ? currentUser.email : "Conta YARA");
        setText(els.settingsAvatar, initials(currentUser ? currentUser.name : "YA"));
        await loadCognitiveProfile().catch(function() {});
      }

      function linesFromTextarea(id) {
        return getValue(id).split("\\n").map(function(item) { return item.trim(); }).filter(Boolean);
      }

      function setTextareaLines(id, values) {
        setValue(id, (values || []).join("\\n"));
      }

      function renderCognitiveProfile(data) {
        const profile = data.profile || {};
        const preferences = data.preferences || {};
        const goals = profile.goals || {};
        setValue("cognitiveProfession", profile.profession || "");
        setValue("cognitiveStudies", profile.studies || "");
        setTextareaLines("cognitiveProjects", profile.projects || []);
        setTextareaLines("cognitiveInterests", profile.interests || []);
        setValue("cognitiveGoalShort", goals.shortTerm || "");
        setValue("cognitiveGoalMedium", goals.mediumTerm || "");
        setValue("cognitiveGoalLong", goals.longTerm || "");
        setValue("cognitiveCommunication", preferences.communicationStyle || "");
        setValue("cognitiveLanguage", preferences.language || "pt-BR");
        setValue("cognitiveResponseStyle", preferences.responseStyle || "balanced");
        setValue("cognitiveResponseLength", preferences.responseLength || "medium");

        const cards = document.getElementById("cognitiveProfileCards");
        const facts = document.getElementById("cognitiveProfileFacts");
        if (cards) {
          cards.innerHTML = [
            ["Projetos", (profile.projects || []).length],
            ["Interesses", (profile.interests || []).length],
            ["Objetivos", (data.objectives || []).length],
            ["Fatos sugeridos", (data.facts || []).filter(function(fact) { return fact.status === "suggested"; }).length],
            ["Confiança", Math.round(Number(profile.confidenceScore || 0) * 100) + "%"]
          ].map(function(item) {
            return '<article class="metric-card"><span class="metric-label">' + escapeHtml(item[0]) + '</span><strong>' + escapeHtml(String(item[1])) + '</strong></article>';
          }).join("");
        }
        if (facts) {
          const rows = (data.facts || []).slice(0, 12);
          facts.innerHTML = rows.length ? rows.map(function(fact) {
            return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(fact.label || fact.fact_type) + '</strong><span class="status">' + escapeHtml(fact.status || "sugerido") + " · " + Math.round(Number(fact.confidence_score || 0) * 100) + '%</span></div><p class="muted">' + escapeHtml(fact.content || "") + '</p><p class="muted">Fonte: ' + escapeHtml(fact.source || "manual") + '</p></article>';
          }).join("") : '<p class="muted">Nenhum fato cognitivo sugerido ainda.</p>';
        }
      }

      async function loadCognitiveProfile() {
        const data = await api("/api/profile");
        renderCognitiveProfile(data);
        return data;
      }

      async function refreshUser() {
        const data = await api("/api/auth/me");
        currentUser = data.user;
        setText(els.accountName, data.user.name);
        setText(els.accountAvatar, initials(data.user.name));
        setText(els.accountEmail, data.user.email);
      }

      async function runChatMenuAction(action) {
        closeChatMenu();
        console.info("[YARA UI] Ação do menu:", action);
        if (action === "shareConversation") return shareConversation();
        if (action === "pinConversation") return pinConversation();
        if (action === "projectConversation") return showProjectPicker();
        if (action === "filesConversation") return showConversationFiles();
        if (action === "searchConversation") return toggleSearch();
        if (action === "searchHistory") return showSearchHistory();
        if (action === "archiveConversation") return archiveConversation();
        if (action === "deleteConversation") return deleteCurrentConversation();
        console.warn("[YARA UI] Ação de menu desconhecida:", action);
        showToast("Ação indisponível.");
      }

      function captureHandled(event, control, moduleName) {
        lastClickedControl = describeControl(control);
        if (moduleName) currentView = moduleName === "memory" ? "settings" : currentView;
        console.info("[YARA UI] Clique:", lastClickedControl);
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      }

      function runCapturedAction(label, event, control, action) {
        captureHandled(event, control, label);
        Promise.resolve()
          .then(action)
          .catch(function(error) {
            handleUiError("capture:" + label, error, { view: currentView });
          });
      }

      function coreButtonAction(buttonId) {
        const actions = {
          newConversationButton: newConversation,
          refreshDashboardButton: loadDashboard,
          closeSearchButton: function() {
            setValue("chatSearchInput", "");
            byId("chatSearchRow")?.classList.remove("open");
            document.querySelectorAll(".message").forEach(function(node) { node.classList.remove("hidden-by-search"); });
          },
          webSearchToggle: function() {
            setWebSearchNext(!useWebSearchNext);
            showToast(useWebSearchNext ? "A próxima mensagem usará pesquisa online." : "Pesquisa online desativada.");
          },
          conversationModeButton: function() { setConversationMode(!conversationMode); },
          attachButton: toggleAttachMenu,
          dictationButton: toggleDictation,
          openGeneratedProject: async function() {
            if (!generatedProject) return showToast("Gere um projeto primeiro.");
            setView("projects");
            await loadProjects();
            await selectProject(generatedProject.id);
          },
          continueGeneratedChat: async function() {
            if (!generatedProject) return showToast("Gere um projeto primeiro.");
            await newConversation();
            setValue(els.messageInput, "Vamos continuar o projeto " + generatedProject.name + ".");
            if (els.messageInput) els.messageInput.focus();
          },
          refreshSmartProjectsButton: loadSmartProjects,
          refreshGraphButton: loadGraph,
          rebuildGraphButton: rebuildGraphFromUi,
          refreshSmartSearchButton: loadSmartSearch,
          reindexSmartSearchButton: reindexSmartSearchFromUi,
          refreshConsolidatedMemoryButton: loadConsolidatedMemory,
          runMemoryConsolidationButton: runMemoryConsolidationFromUi,
          refreshProjectFilesButton: loadProjectUploadOptions,
          linkProjectFileButton: async function() {
            if (!selectedProject) return showToast("Selecione um projeto.");
            const uploadId = getValue("projectUploadSelect");
            if (!uploadId) return showToast("Escolha um arquivo para vincular.");
            await api("/api/projects/" + selectedProject.id + "/files", {
              method: "POST",
              body: JSON.stringify({ uploadId: uploadId })
            });
            const data = await api("/api/projects/" + selectedProject.id + "/details");
            renderProjectDetails(data);
            showToast("Arquivo vinculado ao projeto.");
          },
          continueProjectButton: async function() {
            if (!selectedProject) return showToast("Selecione um projeto.");
            await newConversation();
            setValue(els.messageInput, "Quero continuar o projeto " + selectedProject.name + ".");
            if (els.messageInput) els.messageInput.focus();
          },
          refreshTechnicalProjectsButton: loadTechnicalProjects,
          newTechnicalProjectButton: function() {
            const input = document.getElementById("technicalProjectDescription");
            if (input) input.focus();
          },
          technicalExportTxtButton: function() { return exportSelectedTechnicalProject("txt"); },
          technicalExportPdfButton: function() { return exportSelectedTechnicalProject("pdf"); },
          technicalExportDocxButton: function() { return exportSelectedTechnicalProject("docx"); },
          technicalExportDxfButton: function() { return exportSelectedTechnicalProject("dxf"); },
          technicalExportDwgButton: function() { return exportSelectedTechnicalProject("dwg"); },
          technicalExportIfcButton: function() { return exportSelectedTechnicalProject("ifc"); },
          deleteTechnicalProjectButton: deleteSelectedTechnicalProject,
          editProjectButton: async function() {
            if (!selectedProject) return showToast("Selecione um projeto.");
            const name = window.prompt("Nome do projeto", selectedProject.name || "");
            if (name === null) return;
            const description = window.prompt("Descrição do projeto", selectedProject.description || selectedProject.prompt || "");
            if (description === null) return;
            const data = await api("/api/projects/" + selectedProject.id, {
              method: "PATCH",
              body: JSON.stringify({ name: name, description: description, content: selectedProject.content || selectedProject.output || description })
            });
            selectedProject = data.project;
            await loadProjects();
            await selectProject(selectedProject.id);
            await loadDashboard();
            showToast("Projeto atualizado.");
          },
          archiveProjectButton: async function() {
            if (!selectedProject) return showToast("Selecione um projeto.");
            if (!window.confirm("Arquivar este projeto? Ele sairá da lista ativa, mas não será apagado.")) return;
            await api("/api/projects/" + selectedProject.id, {
              method: "PATCH",
              body: JSON.stringify({ isArchived: true })
            });
            selectedProject = null;
            currentProjectDetails = null;
            setText("projectDetailTitle", "Selecione um projeto");
            setText("projectDetailDescription", "Abra um projeto para ver detalhes, continuar no chat ou excluir.");
            setText("projectDetail", "Nenhum projeto selecionado.");
            setHidden("projectWorkspace", true);
            await loadProjects();
            await loadDashboard();
            showToast("Projeto arquivado.");
          },
          deleteProjectButton: async function() {
            if (!selectedProject) return showToast("Selecione um projeto.");
            if (!window.confirm("Excluir este projeto?")) return;
            await api("/api/projects/" + selectedProject.id, { method: "DELETE" });
            selectedProject = null;
            currentProjectDetails = null;
            setText("projectDetailTitle", "Selecione um projeto");
            setText("projectDetailDescription", "Abra um projeto para ver detalhes, continuar no chat ou excluir.");
            setText("projectDetail", "Nenhum projeto selecionado.");
            setHidden("projectWorkspace", true);
            await loadProjects();
            showToast("Projeto excluído.");
          },
          refreshDocumentsPageButton: loadDocuments,
          refreshDocumentsButton: loadDocuments,
          documentUploadButton: function() { byId("documentUploadInput")?.click(); },
          documentConvertButton: convertSelectedDocument,
          refreshImagesButton: loadImages,
          imageUploadButton: function() { byId("imageUploadInput")?.click(); },
          imageCameraButton: function() { byId("imageCameraInput")?.click(); },
          sendImageButton: uploadPendingImage,
          removeImagePreviewButton: function() {
            clearPendingImage();
            showToast("Preview removido.");
          },
          imageEditButton: editImageFromControls,
          imageOcrButton: function() {
            const imageId = getValue("imageOcrSource");
            if (!imageId) return showToast("Selecione uma imagem para OCR.");
            return runImageOcr(imageId);
          },
          refreshCalendarButton: loadCalendar,
          googleCalendarConnectButton: function() { return callGoogleCalendar("/api/calendar/google/connect"); },
          googleCalendarCalendarsButton: function() { return callGoogleCalendar("/api/calendar/google/calendars"); },
          googleCalendarSyncButton: function() { return callGoogleCalendar("/api/calendar/google/sync", "POST"); },
          refreshIntegrationsButton: loadIntegrations,
          integrationCalendarConnect: function() { return callIntegration("/api/integrations/google/calendar/connect", "integrationCalendarResult"); },
          integrationGmailConnect: function() { return callIntegration("/api/integrations/google/gmail/connect", "integrationGmailResult"); },
          integrationDriveConnect: function() { return callIntegration("/api/integrations/google/drive/connect", "integrationDriveResult"); },
          integrationDriveList: function() { return callIntegration("/api/integrations/drive/files?maxResults=10", "integrationDriveResult"); },
          integrationDriveSearch: function() {
            return callIntegration("/api/integrations/drive/files?query=" + encodeURIComponent(getValue("integrationDriveQuery").trim()) + "&maxResults=10", "integrationDriveResult");
          },
          integrationDriveCreateFolder: function() {
            return callIntegration("/api/integrations/drive/folders", "integrationDriveResult", {
              method: "POST",
              body: JSON.stringify({ name: getValue("integrationDriveFolderName").trim() })
            });
          },
          integrationDriveUploadFile: function() {
            const fileId = getValue("integrationDriveFileSelect");
            if (!fileId) return showToast("Escolha um arquivo da YARA.");
            return callIntegration("/api/integrations/drive/upload-file", "integrationDriveResult", {
              method: "POST",
              body: JSON.stringify({ fileId: fileId })
            });
          },
          refreshAutomationsButton: loadAutomations,
          refreshAutomationWorkspaceButton: loadAutomationWorkspace,
          refreshMarketplaceButton: loadMarketplace,
          integrationCalendarSync: function() { return callIntegration("/api/integrations/google/calendar/sync", "integrationCalendarResult", { method: "POST" }); },
          integrationCalendarList: function() { return callIntegration("/api/integrations/google/calendar/events", "integrationCalendarResult"); },
          integrationGmailRecent: function() { return callIntegration("/api/integrations/gmail/messages?maxResults=5", "integrationGmailResult"); },
          integrationGmailUnread: function() {
            return callIntegration("/api/integrations/gmail/summarize", "integrationGmailResult", {
              method: "POST",
              body: JSON.stringify({ query: "is:unread", maxResults: 5 })
            });
          },
          integrationGmailDraft: function() {
            return callIntegration("/api/integrations/gmail/drafts", "integrationGmailResult", {
              method: "POST",
              body: JSON.stringify({
                to: getValue("integrationGmailTo").trim(),
                subject: getValue("integrationGmailSubject").trim(),
                body: getValue("integrationGmailBody").trim()
              })
            });
          },
          integrationPushSubscribe: async function() {
            if (!("Notification" in window)) return showToast("Este navegador não oferece notificações web.");
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
              await callIntegration("/api/push/test", "integrationPushList", { method: "POST", body: JSON.stringify({ title: "Push YARA AI", message: "Permissão local validada." }) });
              showToast("Permissão local não concedida. Teste interno criado.");
              return;
            }
            showToast("Notificações autorizadas. Inscrição push remota preparada para service worker.");
            await callIntegration("/api/push/test", "integrationPushList", { method: "POST", body: JSON.stringify({ title: "Push YARA AI", message: "Canal de notificação validado." }) });
          },
          integrationPushTest: function() {
            return callIntegration("/api/push/test", "integrationPushList", { method: "POST", body: JSON.stringify({ title: "Teste YARA AI", message: "Notificação interna criada com sucesso." }) });
          },
          refreshAuditButton: loadAudit,
          refreshBackupsButton: loadAudit,
          createBackupButton: createBackupFromUi,
          loadPilarReportButton: loadPilarReport,
          auditPrevPage: function() {
            auditPage = Math.max(1, auditPage - 1);
            return loadAudit();
          },
          auditNextPage: function() {
            auditPage += 1;
            return loadAudit();
          },
          loadSessionsButton: function() { return loadSessions("sessionList"); },
          logoutAllButton: async function() {
            const data = await api("/api/users/logout-all", { method: "POST" });
            showToast(data.message || "Sessões encerradas.");
          },
          clearMemoriesButton: async function() {
            if (!window.confirm("Limpar todas as memórias da YARA?")) return;
            await api("/api/memories", { method: "DELETE" });
            await loadMemories();
            showToast("Memórias limpas.");
          },
          savePreferredTechButton: async function() {
            const value = getValue("preferredTech").trim();
            if (!value) return showToast("Informe as tecnologias preferidas.");
            await api("/api/memories", {
              method: "POST",
              body: JSON.stringify({ title: "Tecnologias preferidas", content: value })
            });
            setValue("preferredTech", "");
            await loadMemories();
            showToast("Tecnologias preferidas salvas na memória.");
          },
          manageFilesButton: function() {
            loadUploads();
            showToast("Arquivos atualizados.");
          },
          securitySessionsButton: function() {
            loadSessions("sessionList");
            selectSettingsTab("profile");
            showToast("Sessões carregadas na aba Perfil.");
          },
          securityDevicesButton: function() {
            loadSessions("securityLoginHistory");
            showToast("Dispositivos conectados carregados.");
          },
          testAiButton: async function() {
            const data = await api("/api/ai/test", { method: "POST" });
            showToast("IA conectada: " + (data.model || "modelo ativo"));
            await loadAiStatus();
          }
        };
        return actions[buttonId] || null;
      }

      function installCoreDelegation() {
        if (window.__yaraCoreDelegationInstalled) return;
        window.__yaraCoreDelegationInstalled = true;

        document.addEventListener("click", function(event) {
          try {
            const target = event.target && event.target.closest ? event.target : null;
            if (!target) return;
            const control = target.closest("button, [data-view], [data-view-target], [data-action], [data-settings-tab], [data-settings-tab-target], [data-retry-view], [data-retry-settings-tab]");
            if (!control) return;
            lastClickedControl = describeControl(control);

            const retryView = target.closest("[data-retry-view]");
            if (retryView) {
              return runCapturedAction("retry-view", event, retryView, function() {
                setView(retryView.dataset.retryView || "chat");
              });
            }

            const retrySettings = target.closest("[data-retry-settings-tab]");
            if (retrySettings) {
              return runCapturedAction("retry-settings", event, retrySettings, function() {
                return selectSettingsTab(retrySettings.dataset.retrySettingsTab || "profile");
              });
            }

            const viewButton = target.closest("[data-view]");
            if (viewButton) {
              return runCapturedAction("nav:" + (viewButton.dataset.view || "chat"), event, viewButton, function() {
                setView(viewButton.dataset.view || "chat");
              });
            }

            const viewTarget = target.closest("[data-view-target]");
            if (viewTarget) {
              return runCapturedAction("view-target:" + (viewTarget.dataset.viewTarget || "chat"), event, viewTarget, function() {
                setView(viewTarget.dataset.viewTarget || "chat");
              });
            }

            if (target.closest("[data-sidebar-toggle]")) {
              return runCapturedAction("mobile-menu", event, control, toggleSidebarDrawer);
            }
            if (target.closest("#sidebarSettingsButton")) {
              return runCapturedAction("sidebar-settings", event, control, function() { setView("settings"); });
            }
            if (target.closest("#quickSettingsButton")) {
              return runCapturedAction("quick-settings", event, control, openQuickSettingsModal);
            }
            if (target.closest("#helpButton")) {
              return runCapturedAction("help", event, control, openHelpModal);
            }
            if (target.closest("#termsButton")) {
              return runCapturedAction("terms", event, control, openTermsModal);
            }
            if (target.closest("#logoutButton")) {
              return runCapturedAction("logout", event, control, function() {
                stopSpeech(false);
                stopDictation();
                localStorage.removeItem("yaraToken");
                localStorage.removeItem("yaraUser");
                window.location.href = "/";
              });
            }
            if (target.closest("#chatMenuButton")) {
              return runCapturedAction("chat-menu-toggle", event, control, function() {
                toggleChatMenu(event);
              });
            }
            if (target.closest("#modalClose")) {
              return runCapturedAction("modal-close", event, control, closeModal);
            }

            const coreButton = target.closest("button[id]");
            if (coreButton) {
              const action = coreButtonAction(coreButton.id);
              if (action) {
                return runCapturedAction("button:" + coreButton.id, event, coreButton, action);
              }
            }

            const consolidationButton = target.closest("[data-open-consolidation]");
            if (consolidationButton) {
              return runCapturedAction("open-consolidation", event, consolidationButton, function() {
                return openConsolidationDetail(consolidationButton.dataset.openConsolidation);
              });
            }

            const resolveConflictButton = target.closest("[data-resolve-conflict]");
            if (resolveConflictButton) {
              return runCapturedAction("resolve-memory-conflict", event, resolveConflictButton, function() {
                return resolveMemoryConflictFromUi(resolveConflictButton.dataset.resolveConflict);
              });
            }

            const technicalProjectButton = target.closest("[data-open-technical-project]");
            if (technicalProjectButton) {
              return runCapturedAction("open-technical-project", event, technicalProjectButton, function() {
                return selectTechnicalProject(technicalProjectButton.dataset.openTechnicalProject);
              });
            }

            const technicalDownloadButton = target.closest("[data-download-technical-file]");
            if (technicalDownloadButton) {
              return runCapturedAction("download-technical-file", event, technicalDownloadButton, function() {
                return downloadProtectedPath(technicalDownloadButton.dataset.downloadTechnicalFile, technicalDownloadButton.dataset.fileName || "arquivo-tecnico");
              });
            }

            const chatAction = target.closest("#chatActionMenu [data-action]");
            if (chatAction) {
              return runCapturedAction("chat-action:" + chatAction.dataset.action, event, chatAction, function() {
                return runChatMenuAction(chatAction.dataset.action);
              });
            }

            const attachAction = target.closest("#attachMenu [data-action]");
            if (attachAction) {
              return runCapturedAction("attach-action:" + attachAction.dataset.action, event, attachAction, function() {
                openAttachmentPicker(attachAction.dataset.action);
              });
            }

            const settingsTab = target.closest("#settingsTabs [data-settings-tab]");
            if (settingsTab) {
              return runCapturedAction("settings-tab:" + settingsTab.dataset.settingsTab, event, settingsTab, function() {
                return selectSettingsTab(settingsTab.dataset.settingsTab || "profile");
              });
            }

            const settingsTabTarget = target.closest("[data-settings-tab-target]");
            if (settingsTabTarget) {
              return runCapturedAction("settings-tab-target:" + settingsTabTarget.dataset.settingsTabTarget, event, settingsTabTarget, function() {
                return selectSettingsTab(settingsTabTarget.dataset.settingsTabTarget || "profile");
              });
            }

            const choice = target.closest("#view-settings [data-choice-group]");
            if (choice) {
              return runCapturedAction("settings-choice:" + choice.dataset.choiceGroup, event, choice, async function() {
                document.querySelectorAll('[data-choice-group="' + choice.dataset.choiceGroup + '"]').forEach(function(item) {
                  item.classList.toggle("active", item === choice);
                });
                if (choice.dataset.choiceGroup === "theme") {
                  await api("/api/settings", {
                    method: "PATCH",
                    body: JSON.stringify({ theme: choice.textContent.trim().toLowerCase() })
                  });
                }
                showToast("Preferência salva.");
              });
            }
          } catch (error) {
            handleUiError("capture:click", error, { view: currentView });
          }
        }, true);

        document.addEventListener("submit", function(event) {
          const form = event.target;
          if (!form || !form.id) return;
          const handledForms = {
            chatForm: true,
            generatorForm: true,
            systemChatForm: true,
            systemGenerateForm: true,
            agentForm: true,
            agentChatForm: true,
            agentCollaborationForm: true,
            projectCreateForm: true,
            projectTaskForm: true,
            projectNoteForm: true,
            smartProjectForm: true,
            smartDecisionForm: true,
            smartPendingForm: true,
            smartCommitForm: true,
            smartMilestoneForm: true,
            graphQueryForm: true,
            semanticSearchForm: true,
            documentForm: true,
            documentPageForm: true,
            calendarEventForm: true,
            reminderForm: true,
            integrationCalendarForm: true,
            integrationGmailForm: true,
            automationForm: true,
            automationChatForm: true,
            automationFlowForm: true,
            pluginChatForm: true,
            integrationTelegramForm: true,
            integrationWhatsappForm: true,
            quickSettingsForm: true,
            profileForm: true,
            cognitiveProfileForm: true,
            cognitivePreferencesForm: true,
            passwordForm: true,
            preferencesForm: true,
            voiceForm: true,
            memoryForm: true,
            memorySearchForm: true
          };
          if (!handledForms[form.id]) return;
          captureHandled(event, form, currentView);
          Promise.resolve()
            .then(async function() {
              if (form.id === "chatForm") return sendMessage(event);
              if (form.id === "generatorForm") return submitGeneratorForm();
              if (form.id === "systemChatForm") return sendSystemChatFromUi();
              if (form.id === "systemGenerateForm") return generateSystemFromUi();
              if (form.id === "agentForm") return createAgentFromUi();
              if (form.id === "agentChatForm") return sendAgentChatFromUi();
              if (form.id === "agentCollaborationForm") return collaborateAgentsFromUi();
              if (form.id === "semanticSearchForm") return runSemanticSearchFromUi(event);
              if (form.id === "projectCreateForm") {
                const name = getValue("projectCreateName").trim();
                const description = getValue("projectCreateDescription").trim();
                if (name.length < 2) return showToast("Informe um nome para o projeto.");
                const data = await api("/api/projects", {
                  method: "POST",
                  body: JSON.stringify({ name: name, description: description, content: description, type: "Projeto" })
                });
                form.reset();
                await loadProjects();
                await loadDashboard();
                if (data.project && data.project.id) await selectProject(data.project.id);
                showToast("Projeto criado.");
                return;
              }
              if (form.id === "smartProjectForm") {
                const name = getValue("smartProjectName").trim();
                const description = getValue("smartProjectDescription").trim();
                if (name.length < 2) return showToast("Informe o nome do projeto inteligente.");
                const data = await api("/api/projects-memory", {
                  method: "POST",
                  body: JSON.stringify({ name: name, description: description, status: "active" })
                });
                form.reset();
                await loadSmartProjects();
                if (data.project && data.project.id) await selectSmartProject(data.project.id);
                showToast("Projeto inteligente criado.");
                return;
              }
              if (form.id === "smartDecisionForm") {
                if (!requireSmartProject()) return;
                const title = getValue("smartDecisionTitle").trim();
                const content = getValue("smartDecisionContent").trim();
                if (!title || !content) return showToast("Informe título e conteúdo da decisão.");
                await api("/api/projects-memory/" + selectedSmartProjectId + "/decisions", {
                  method: "POST",
                  body: JSON.stringify({ title: title, content: content, impact: getValue("smartDecisionImpact").trim() || undefined })
                });
                form.reset();
                await selectSmartProject(selectedSmartProjectId);
                showToast("Decisão registrada.");
                return;
              }
              if (form.id === "smartPendingForm") {
                if (!requireSmartProject()) return;
                const title = getValue("smartPendingTitle").trim();
                if (!title) return showToast("Informe a pendência.");
                await api("/api/projects-memory/" + selectedSmartProjectId + "/pending", {
                  method: "POST",
                  body: JSON.stringify({
                    title: title,
                    description: getValue("smartPendingDescription").trim() || undefined,
                    priority: getValue("smartPendingPriority") || "medium"
                  })
                });
                form.reset();
                await selectSmartProject(selectedSmartProjectId);
                showToast("Pendência registrada.");
                return;
              }
              if (form.id === "smartCommitForm") {
                if (!requireSmartProject()) return;
                const hash = getValue("smartCommitHash").trim();
                const message = getValue("smartCommitMessage").trim();
                if (!hash || !message) return showToast("Informe hash e mensagem do commit.");
                await api("/api/projects-memory/" + selectedSmartProjectId + "/commits", {
                  method: "POST",
                  body: JSON.stringify({ hash: hash, message: message, branch: getValue("smartCommitBranch").trim() || "main" })
                });
                form.reset();
                setValue("smartCommitBranch", "main");
                await selectSmartProject(selectedSmartProjectId);
                showToast("Commit registrado.");
                return;
              }
              if (form.id === "smartMilestoneForm") {
                if (!requireSmartProject()) return;
                const title = getValue("smartMilestoneTitle").trim();
                if (!title) return showToast("Informe o marco.");
                await api("/api/projects-memory/" + selectedSmartProjectId + "/milestones", {
                  method: "POST",
                  body: JSON.stringify({ title: title, description: getValue("smartMilestoneDescription").trim() || undefined })
                });
                form.reset();
                await selectSmartProject(selectedSmartProjectId);
                showToast("Marco registrado.");
                return;
              }
              if (form.id === "graphQueryForm") return queryGraphFromUi(event);
              if (form.id === "projectTaskForm") {
                if (!selectedProject) return showToast("Selecione um projeto.");
                const title = getValue("projectTaskTitle").trim();
                if (!title) return showToast("Informe a tarefa.");
                await api("/api/projects/" + selectedProject.id + "/tasks", {
                  method: "POST",
                  body: JSON.stringify({
                    title: title,
                    priority: getValue("projectTaskPriority") || "medium",
                    dueDate: getValue("projectTaskDueDate") || null
                  })
                });
                form.reset();
                await selectProject(selectedProject.id);
                await loadDashboard();
                showToast("Tarefa criada.");
                return;
              }
              if (form.id === "projectNoteForm") {
                if (!selectedProject) return showToast("Selecione um projeto.");
                const content = getValue("projectNoteContent").trim();
                if (!content) return showToast("Escreva uma nota.");
                await api("/api/projects/" + selectedProject.id + "/notes", {
                  method: "POST",
                  body: JSON.stringify({ content: content })
                });
                form.reset();
                await selectProject(selectedProject.id);
                showToast("Nota salva.");
                return;
              }
              if (form.id === "documentForm") {
                return createDocumentFromControls({
                  titleId: "documentTitle",
                  templateId: "documentTemplate",
                  formatId: "documentFormat",
                  fieldsId: "documentFields"
                });
              }
              if (form.id === "documentPageForm") {
                return createDocumentFromControls({
                  titleId: "documentPageTitle",
                  templateId: "documentPageTemplate",
                  formatId: "documentPageFormat",
                  fieldsId: "documentPageFields"
                });
              }
              if (form.id === "calendarEventForm") return createEventFromForm(event);
              if (form.id === "reminderForm") return createReminderFromForm(event);
              if (form.id === "integrationCalendarForm") {
                const title = getValue("integrationCalendarTitle").trim();
                const date = getValue("integrationCalendarDate");
                const time = getValue("integrationCalendarTime");
                const location = getValue("integrationCalendarLocation").trim();
                if (!title || !date) return showToast("Informe título e data do evento.");
                return callIntegration("/api/integrations/google/calendar/events", "integrationCalendarResult", {
                  method: "POST",
                  body: JSON.stringify({ title: title, date: date, time: time || null, location: location || null })
                });
              }
              if (form.id === "integrationGmailForm") {
                return callIntegration("/api/integrations/gmail/send", "integrationGmailResult", {
                  method: "POST",
                  body: JSON.stringify({
                    to: getValue("integrationGmailTo").trim(),
                    subject: getValue("integrationGmailSubject").trim(),
                    body: getValue("integrationGmailBody").trim()
                  })
                });
              }
              if (form.id === "automationForm") {
                return createAutomationFromForm(event);
              }
              if (form.id === "automationChatForm") return sendAutomationChatFromUi();
              if (form.id === "automationFlowForm") return createAutomationFlowFromUi();
              if (form.id === "pluginChatForm") return sendPluginChatFromUi();
              if (form.id === "integrationTelegramForm") {
                return callIntegration("/api/integrations/telegram/send", "integrationTelegramResult", {
                  method: "POST",
                  body: JSON.stringify({
                    chatId: getValue("integrationTelegramChatId").trim(),
                    text: getValue("integrationTelegramText").trim()
                  })
                });
              }
              if (form.id === "integrationWhatsappForm") {
                return callIntegration("/api/integrations/whatsapp/send", "integrationWhatsappResult", {
                  method: "POST",
                  body: JSON.stringify({
                    to: getValue("integrationWhatsappTo").trim(),
                    text: getValue("integrationWhatsappText").trim()
                  })
                });
              }
              if (form.id === "quickSettingsForm") {
                await api("/api/settings", {
                  method: "PATCH",
                  body: JSON.stringify({
                    language: getValue("quickLanguage"),
                    aiStyle: getValue("quickAiStyle"),
                    responseLength: getValue("quickResponseLength"),
                    theme: "dark"
                  })
                });
                closeModal();
                showToast("Configurações salvas.");
                return;
              }
              if (form.id === "profileForm") {
                const displayName = getValue("displayName").trim();
                const fullName = getValue("fullName").trim();
                const email = getValue("profileEmail").trim();
                const phone = getValue("profilePhone").trim();
                const avatarUrl = getValue("avatarUrl").trim();
                await api("/api/users/profile", {
                  method: "PATCH",
                  body: JSON.stringify({ name: displayName || fullName, email: email, phone: phone || null })
                });
                await api("/api/settings", {
                  method: "PATCH",
                  body: JSON.stringify({ displayName: displayName || fullName, fullName: fullName, avatarUrl: avatarUrl })
                });
                await refreshUser();
                await loadSettings();
                showToast("Perfil atualizado.");
                return;
              }
              if (form.id === "cognitiveProfileForm") {
                await api("/api/profile", {
                  method: "PUT",
                  body: JSON.stringify({
                    preferredName: getValue("displayName").trim(),
                    profession: getValue("cognitiveProfession").trim(),
                    studies: getValue("cognitiveStudies").trim(),
                    projects: linesFromTextarea("cognitiveProjects"),
                    interests: linesFromTextarea("cognitiveInterests"),
                    goals: {
                      shortTerm: getValue("cognitiveGoalShort").trim(),
                      mediumTerm: getValue("cognitiveGoalMedium").trim(),
                      longTerm: getValue("cognitiveGoalLong").trim()
                    },
                    source: "manual",
                    confidenceScore: 0.95
                  })
                });
                await loadCognitiveProfile();
                showToast("Perfil cognitivo atualizado.");
                return;
              }
              if (form.id === "cognitivePreferencesForm") {
                const preferences = {
                  communicationStyle: getValue("cognitiveCommunication").trim(),
                  language: getValue("cognitiveLanguage"),
                  responseStyle: getValue("cognitiveResponseStyle"),
                  responseLength: getValue("cognitiveResponseLength"),
                  source: "manual",
                  confidenceScore: 0.92
                };
                await api("/api/profile/preferences", { method: "PUT", body: JSON.stringify(preferences) });
                await api("/api/settings", {
                  method: "PATCH",
                  body: JSON.stringify({
                    aiStyle: preferences.responseStyle,
                    language: preferences.language,
                    responseLength: preferences.responseLength,
                    theme: "dark"
                  })
                });
                await loadSettings();
                showToast("Preferências cognitivas salvas.");
                return;
              }
              if (form.id === "passwordForm") {
                await api("/api/users/password", {
                  method: "PATCH",
                  body: JSON.stringify({
                    currentPassword: getValue("currentPassword"),
                    newPassword: getValue("newPassword"),
                    confirmPassword: getValue("confirmPassword")
                  })
                });
                form.reset();
                showToast("Senha atualizada com segurança.");
                return;
              }
              if (form.id === "preferencesForm") {
                await api("/api/settings", {
                  method: "PATCH",
                  body: JSON.stringify({
                    aiStyle: getValue("aiStyle"),
                    language: getValue("language"),
                    responseLength: getValue("responseLength"),
                    theme: "dark"
                  })
                });
                showToast("Preferências salvas.");
                return;
              }
              if (form.id === "voiceForm") {
                const payload = {
                  voiceEnabled: getChecked("voiceEnabled"),
                  voiceLanguage: getValue("voiceLanguage"),
                  voiceRate: Number(getValue("voiceRate") || 1),
                  voicePitch: Number(getValue("voicePitch") || 1),
                  voiceGender: getValue("voiceGender"),
                  voiceAutoRead: getChecked("voiceAutoRead")
                };
                const data = await api("/api/settings", { method: "PATCH", body: JSON.stringify(payload) });
                applyVoiceSettings(data.settings || {});
                if (!voiceSettings.enabled) {
                  stopSpeech(false);
                  stopDictation();
                  setConversationMode(false);
                }
                showToast("Configurações de voz salvas.");
                return;
              }
              if (form.id === "memoryForm") {
                const title = getValue("memoryTitle").trim();
                const category = getValue("memoryCategory");
                const importance = Number(getValue("memoryImportance") || 3);
                const content = getValue("memoryContent").trim();
                if (content.length < 2) return showToast("Escreva uma memória para salvar.");
                await api("/api/memory", {
                  method: "POST",
                  body: JSON.stringify({ title: title || undefined, category: category, importance: importance, content: content })
                });
                form.reset();
                await loadMemories();
                showToast("Memória salva.");
                return;
              }
              if (form.id === "memorySearchForm") {
                const query = getValue("memorySearchQuery").trim();
                if (query.length < 2) return showToast("Informe uma busca para a memória.");
                const data = await api("/api/memory/search?query=" + encodeURIComponent(query));
                renderMemorySearchResults(data.results || []);
              }
            })
            .catch(function(error) {
              handleUiError("capture:submit:" + form.id, error, { view: currentView });
            });
        }, true);
      }

      installCoreDelegation();

      async function init() {
        console.info("[YARA UI] Build:", uiBuild);
        if (!token) {
          window.location.href = "/?auth=login";
          return;
        }
        try {
          await refreshUser();
          const settingsData = await api("/api/settings").catch(function() { return { settings: {} }; });
          applyVoiceSettings(settingsData.settings || {});
          setView("chat");
          await loadConversations();
          await loadAiStatus().catch(function() {});
        } catch {
          localStorage.removeItem("yaraToken");
          localStorage.removeItem("yaraUser");
          window.location.href = "/?auth=login";
        }
      }

      document.querySelectorAll(".nav-button").forEach(function(button) {
        on(button, "click", function() { setView(button.dataset.view); });
      });
      safeDocumentListener("click", function(event) {
        const retry = event.target.closest("[data-retry-view]");
        if (retry) {
          setView(retry.dataset.retryView);
          return;
        }
        const target = event.target.closest("[data-view-target]");
        if (target) setView(target.dataset.viewTarget);
      });

      on(els.pinnedList, "click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });
      on(els.conversationList, "click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });

      on("newConversationButton", "click", newConversation);
      on("refreshDashboardButton", "click", loadDashboard);
      on("view-dashboard", "click", async function(event) {
        const projectButton = event.target.closest("[data-dashboard-project]");
        if (projectButton) {
          setView("projects");
          await loadProjects();
          await selectProject(projectButton.dataset.dashboardProject);
          return;
        }
        const conversationButton = event.target.closest("[data-dashboard-conversation]");
        if (conversationButton) {
          setView("chat");
          await openConversation(conversationButton.dataset.dashboardConversation);
        }
      });
      on("chatForm", "submit", sendMessage);
      on("messageInput", "input", autoGrowMessageInput);
      on("messageInput", "keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          byId("chatForm")?.requestSubmit();
        }
      });
      on("mobileToggle", "click", toggleSidebarDrawer);
      on("mobileTopbarToggle", "click", toggleSidebarDrawer);
      on("quickSettingsButton", "click", openQuickSettingsModal);
      on("sidebarSettingsButton", "click", function() { setView("settings"); });
      on("helpButton", "click", openHelpModal);
      on("termsButton", "click", openTermsModal);
      on("chatMenuButton", "click", toggleChatMenu);
      on("attachButton", "click", function(event) {
        if (event) event.stopPropagation();
        toggleAttachMenu();
      });
      on("webSearchToggle", "click", function() {
        setWebSearchNext(!useWebSearchNext);
        showToast(useWebSearchNext ? "A próxima mensagem usará pesquisa online." : "Pesquisa online desativada.");
      });
      on("dictationButton", "click", toggleDictation);
      on("conversationModeButton", "click", function() {
        setConversationMode(!conversationMode);
      });
      on("modalClose", "click", closeModal);
      on(els.modalOverlay, "click", function(event) { if (event.target === els.modalOverlay) closeModal(); });
      safeDocumentListener("click", function(event) {
        if (!els.chatActionMenu || !els.chatActionMenu.classList.contains("open")) return;
        if (event.target.closest("#chatActionMenu") || event.target.closest("#chatMenuButton")) return;
        closeChatMenu();
      });
      safeDocumentListener("click", function(event) {
        if (!els.sidebar || !els.sidebar.classList.contains("open")) return;
        if (event.target.closest("#sidebar") || event.target.closest("[data-sidebar-toggle]")) return;
        closeSidebarDrawer();
      });
      window.addEventListener("resize", normalizeSidebarForViewport);
      normalizeSidebarForViewport();
      safeDocumentListener("click", function(event) {
        if (!els.attachMenu || !els.attachMenu.classList.contains("open")) return;
        if (event.target.closest("#attachMenu") || event.target.closest("#attachButton")) return;
        closeAttachMenu();
      });
      safeDocumentListener("keydown", function(event) {
        if (event.key !== "Escape") return;
        closeChatMenu();
        closeSidebarDrawer();
        closeAttachMenu();
      });
      window.addEventListener("resize", function() {
        try {
          if (window.innerWidth > 860) {
            closeSidebarDrawer();
            closeChatMenu();
          }
          closeAttachMenu();
        } catch (error) {
          handleUiError("window:resize", error, { toast: false });
        }
      });
      on(els.attachmentPreview, "click", function(event) {
        const button = event.target.closest("#removeAttachmentButton");
        if (!button) return;
        clearPendingAttachment();
        showToast("Anexo removido.");
      });
      on(els.messages, "click", async function(event) {
        const promptButton = event.target.closest("[data-prompt]");
        if (promptButton) {
          setValue(els.messageInput, promptButton.dataset.prompt || "");
          autoGrowMessageInput();
          if (els.messageInput) els.messageInput.focus();
          return;
        }

        const codeButton = event.target.closest("[data-copy-code]");
        if (codeButton) {
          await navigator.clipboard.writeText(codeButton.dataset.copyCode || "").catch(function() {});
          showToast("Código copiado.");
          return;
        }

        const copyButton = event.target.closest("[data-copy-message]");
        if (copyButton) {
          await copyMessage(copyButton.dataset.copyMessage);
          return;
        }

        const speakButton = event.target.closest("[data-speak-message]");
        if (speakButton) {
          speakMessage(speakButton.dataset.speakMessage);
          return;
        }

        const pauseSpeechButton = event.target.closest("[data-pause-speech]");
        if (pauseSpeechButton) {
          toggleSpeechPause();
          return;
        }

        const stopSpeechButton = event.target.closest("[data-stop-speech]");
        if (stopSpeechButton) {
          stopSpeech();
          return;
        }

        const editButton = event.target.closest("[data-edit-message]");
        if (editButton) {
          await editMessage(editButton.dataset.editMessage);
          return;
        }

        const regenerateButton = event.target.closest("[data-regenerate-message]");
        if (regenerateButton) {
          await regenerateMessage(regenerateButton.dataset.regenerateMessage);
          return;
        }

        const feedbackButton = event.target.closest("[data-feedback-message]");
        if (feedbackButton) {
          await sendFeedback(feedbackButton.dataset.feedbackMessage, feedbackButton.dataset.feedbackValue);
          return;
        }

        const previewFileButton = event.target.closest("[data-preview-file]");
        if (previewFileButton) {
          await previewFile(previewFileButton.dataset.previewFile);
          return;
        }

        const downloadFileButton = event.target.closest("[data-download-file]");
        if (downloadFileButton) {
          await downloadFile(downloadFileButton.dataset.downloadFile, downloadFileButton.dataset.fileName || "arquivo");
          return;
        }

        const button = event.target.closest("[data-download-upload]");
        if (!button) return;
        await downloadUpload(button.dataset.downloadUpload, button.dataset.fileName || "arquivo");
      });

      on("chatActionMenu", "click", async function(event) {
        const item = event.target.closest("[data-action]");
        if (!item) return;
        const action = item.dataset.action;
        closeChatMenu();
        if (action === "shareConversation") await shareConversation();
        if (action === "pinConversation") await pinConversation();
        if (action === "projectConversation") await showProjectPicker();
        if (action === "filesConversation") await showConversationFiles();
        if (action === "searchConversation") toggleSearch();
        if (action === "searchHistory") await showSearchHistory();
        if (action === "archiveConversation") await archiveConversation();
        if (action === "deleteConversation") await deleteCurrentConversation();
      });

      on("attachMenu", "click", async function(event) {
        const item = event.target.closest("[data-action]");
        if (!item) return;
        openAttachmentPicker(item.dataset.action);
      });

      [els.fileInputImages, els.fileInputDocument, els.fileInputPdf, els.fileInputCamera].forEach(function(input) {
        on(input, "change", function(event) {
          const file = event.target.files && event.target.files[0];
          setPendingAttachment(file);
          event.target.value = "";
        });
      });

      on("modalBody", "click", async function(event) {
        const deployActionButton = event.target.closest("[data-deploy-action]");
        if (deployActionButton) {
          await runDeployAction(deployActionButton.dataset.deployAction, deployActionButton.dataset.projectId);
          return;
        }

        const settingsTab = event.target.closest("[data-modal-settings-tab]");
        if (settingsTab) {
          document.querySelectorAll("[data-modal-settings-tab]").forEach(function(tab) {
            tab.classList.toggle("active", tab === settingsTab);
          });
          document.querySelectorAll("[data-modal-pane]").forEach(function(pane) {
            pane.hidden = pane.dataset.modalPane !== settingsTab.dataset.modalSettingsTab;
          });
          return;
        }

        const fullSettingsButton = event.target.closest("#openFullSettingsFromModal");
        if (fullSettingsButton) {
          closeModal();
          setView("settings");
          return;
        }

        const searchButton = event.target.closest("[data-open-search]");
        if (searchButton) {
          await showSearchDetails(searchButton.dataset.openSearch);
          return;
        }

        const downloadButton = event.target.closest("[data-download-upload]");
        if (downloadButton) {
          await downloadUpload(downloadButton.dataset.downloadUpload, downloadButton.dataset.fileName || "arquivo");
          return;
        }
        const previewFileButton = event.target.closest("[data-preview-file]");
        if (previewFileButton) {
          await previewFile(previewFileButton.dataset.previewFile);
          return;
        }
        const downloadFileButton = event.target.closest("[data-download-file]");
        if (downloadFileButton) {
          await downloadFile(downloadFileButton.dataset.downloadFile, downloadFileButton.dataset.fileName || "arquivo");
          return;
        }
        const imageProjectButton = event.target.closest("[data-link-image-project]");
        if (imageProjectButton) {
          await api("/api/images/" + imageProjectButton.dataset.linkImageProject + "/project", {
            method: "POST",
            body: JSON.stringify({ projectId: imageProjectButton.dataset.projectId })
          });
          closeModal();
          await loadImages();
          showToast("Imagem salva no projeto.");
          return;
        }
        const projectButton = event.target.closest("[data-link-project]");
        if (!projectButton) return;
        await api("/api/conversations/" + currentConversationId + "/projects", {
          method: "POST",
          body: JSON.stringify({ projectId: projectButton.dataset.linkProject })
        });
        closeModal();
        showToast("Conversa adicionada ao projeto.");
      });

      on("modalBody", "submit", async function(event) {
        if (event.target && event.target.id === "quickSettingsForm") {
          event.preventDefault();
          await api("/api/settings", {
            method: "PATCH",
            body: JSON.stringify({
              language: getValue("quickLanguage"),
              aiStyle: getValue("quickAiStyle"),
              responseLength: getValue("quickResponseLength"),
              theme: "dark"
            })
          });
          closeModal();
          showToast("Configurações salvas.");
        }
      });

      on("chatSearchInput", "input", function(event) {
        const query = event.target.value.trim().toLowerCase();
        document.querySelectorAll(".message").forEach(function(node) {
          node.classList.toggle("hidden-by-search", query && !node.textContent.toLowerCase().includes(query));
        });
      });
      on("closeSearchButton", "click", function() {
        setValue("chatSearchInput", "");
        byId("chatSearchRow")?.classList.remove("open");
        document.querySelectorAll(".message").forEach(function(node) { node.classList.remove("hidden-by-search"); });
      });

      async function submitGeneratorForm() {
        const prompt = getValue("generatorPrompt").trim();
        const type = getValue("systemType");
        if (prompt.length < 8) return showToast("Descreva melhor o sistema que você quer criar.");
        const result = document.getElementById("generatorResult");
        if (!result) return showToast("Área do gerador indisponível.");
        result.textContent = "A YARA está estruturando o sistema...";
        try {
          const data = await api("/api/generator", {
            method: "POST",
            body: JSON.stringify({ type: type, prompt: prompt })
          });
          generatedProject = data.project;
          result.textContent = data.project.content || data.project.output;
          setValue("generatorPrompt", "");
          showToast("Sistema gerado e salvo em Meus Projetos.");
        } catch (error) {
          result.textContent = "Não foi possível gerar agora.";
          showToast(error.message);
        }
      }

      on("generatorForm", "submit", async function(event) {
        event.preventDefault();
        await submitGeneratorForm();
      });

      on("openGeneratedProject", "click", async function() {
        if (!generatedProject) return showToast("Gere um projeto primeiro.");
        setView("projects");
        await loadProjects();
        await selectProject(generatedProject.id);
      });

      on("continueGeneratedChat", "click", async function() {
        if (!generatedProject) return showToast("Gere um projeto primeiro.");
        await newConversation();
        setValue(els.messageInput, "Vamos continuar o projeto " + generatedProject.name + ".");
        if (els.messageInput) els.messageInput.focus();
      });

      on("systemsHistoryButton", "click", async function() {
        await loadSystems();
        openSystemsHistoryDrawer();
      });
      on("systemsHistoryClose", "click", closeSystemsHistoryDrawer);
      on("systemsList", "click", async function(event) {
        const button = event.target.closest("[data-open-system]");
        if (!button) return;
        await selectSystem(button.dataset.openSystem);
      });
      on("systemChatMessages", "click", async function(event) {
        const promptButton = event.target.closest("[data-system-prompt]");
        if (promptButton) {
          setValue("systemChatInput", promptButton.dataset.systemPrompt || "");
          const input = document.getElementById("systemChatInput");
          if (input) input.focus();
          return;
        }
        const deployPanelButton = event.target.closest("[data-deploy-panel]");
        if (deployPanelButton) {
          await openDeployPanel(deployPanelButton.dataset.deployPanel);
          return;
        }
        const panelButton = event.target.closest("[data-system-panel]");
        if (panelButton) {
          openSystemPanel(panelButton.dataset.systemPanel);
          return;
        }
        const exportButton = event.target.closest("[data-export-system]");
        if (exportButton) {
          await exportSelectedSystem(exportButton.dataset.exportSystem);
          return;
        }
        const publishButton = event.target.closest("[data-publish-system]");
        if (publishButton) {
          await publishSelectedSystem();
          return;
        }
        const duplicateButton = event.target.closest("[data-duplicate-system]");
        if (duplicateButton) {
          await duplicateSelectedSystem();
          return;
        }
        const continueButton = event.target.closest("[data-continue-system]");
        if (continueButton) continueSystemEvolution();
      });

      on("refreshAgentsButton", "click", async function() {
        await loadAgents();
        showToast("Agentes atualizados.");
      });
      on("agentSelect", "change", function() {
        selectedAgentId = getValue("agentSelect") || null;
        selectedAgentConversationId = null;
        agentMessages = [];
        renderAgentMessages();
      });
      on("agentsList", "click", async function(event) {
        const selectButton = event.target.closest("[data-select-agent]");
        if (selectButton) {
          selectedAgentId = selectButton.dataset.selectAgent;
          setValue("agentSelect", selectedAgentId || "");
          selectedAgentConversationId = null;
          agentMessages = [];
          renderAgentMessages();
          showToast("Agente selecionado.");
          return;
        }
        const toggleButton = event.target.closest("[data-toggle-agent]");
        if (toggleButton) {
          const currentStatus = toggleButton.dataset.status === "active" ? "inactive" : "active";
          await api("/api/agents/" + toggleButton.dataset.toggleAgent, {
            method: "PUT",
            body: JSON.stringify({ status: currentStatus })
          });
          await loadAgents();
          showToast("Status do agente atualizado.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-agent]");
        if (!deleteButton) return;
        if (!window.confirm("Excluir este agente?")) return;
        await api("/api/agents/" + deleteButton.dataset.deleteAgent, { method: "DELETE" });
        selectedAgentId = null;
        await loadAgents();
        showToast("Agente excluído.");
      });
      on("agentConversations", "click", async function(event) {
        const button = event.target.closest("[data-open-agent-conversation]");
        if (!button) return;
        selectedAgentConversationId = button.dataset.openAgentConversation;
        selectedAgentId = button.dataset.agentId;
        setValue("agentSelect", selectedAgentId || "");
        const history = await api("/api/agents/chat/history?agentId=" + encodeURIComponent(selectedAgentId) + "&conversationId=" + encodeURIComponent(selectedAgentConversationId));
        agentMessages = history.messages || [];
        renderAgentMessages();
      });

      on("projectSearch", "input", renderProjects);
      on("projectList", "click", function(event) {
        const button = event.target.closest("[data-open-project]");
        if (button) selectProject(button.dataset.openProject);
      });
      on("refreshSmartProjectsButton", "click", async function() {
        await loadSmartProjects();
        showToast("Projetos inteligentes atualizados.");
      });
      on("smartProjectList", "click", async function(event) {
        const button = event.target.closest("[data-open-smart-project]");
        if (!button) return;
        await selectSmartProject(button.dataset.openSmartProject);
      });
      on("refreshGraphButton", "click", async function() {
        await loadGraph();
        showToast("Conhecimento atualizado.");
      });
      on("rebuildGraphButton", "click", async function() {
        await rebuildGraphFromUi();
      });
      on("graphQueryForm", "submit", queryGraphFromUi);
      on("refreshSmartSearchButton", "click", async function() {
        await loadSmartSearch();
        showToast("Busca inteligente atualizada.");
      });
      on("reindexSmartSearchButton", "click", async function() {
        await reindexSmartSearchFromUi();
      });
      on("semanticSearchForm", "submit", runSemanticSearchFromUi);
      on("projectTaskList", "click", async function(event) {
        if (!selectedProject) return;
        const toggle = event.target.closest("[data-toggle-task]");
        if (toggle) {
          await api("/api/projects/" + selectedProject.id + "/tasks/" + toggle.dataset.toggleTask, {
            method: "PATCH",
            body: JSON.stringify({ status: toggle.checked ? "done" : "pending" })
          });
          await selectProject(selectedProject.id);
          showToast("Tarefa atualizada.");
          return;
        }
        const editButton = event.target.closest("[data-edit-task]");
        if (editButton) {
          const title = window.prompt("Editar tarefa", editButton.dataset.title || "");
          if (title === null) return;
          const dueDate = window.prompt("Prazo da tarefa (AAAA-MM-DD, opcional)", editButton.dataset.dueDate || "");
          if (dueDate === null) return;
          const priority = window.prompt("Prioridade: baixa, média ou alta", editButton.dataset.priority === "high" ? "alta" : editButton.dataset.priority === "low" ? "baixa" : "média");
          if (priority === null) return;
          const normalizedPriority = /^alta$/i.test(priority.trim()) ? "high" : /^baixa$/i.test(priority.trim()) ? "low" : "medium";
          await api("/api/projects/" + selectedProject.id + "/tasks/" + editButton.dataset.editTask, {
            method: "PATCH",
            body: JSON.stringify({ title: title, dueDate: dueDate || null, priority: normalizedPriority })
          });
          await selectProject(selectedProject.id);
          await loadDashboard();
          showToast("Tarefa atualizada.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-task]");
        if (!deleteButton) return;
        await api("/api/projects/" + selectedProject.id + "/tasks/" + deleteButton.dataset.deleteTask, { method: "DELETE" });
        await selectProject(selectedProject.id);
        showToast("Tarefa removida.");
      });
      on("projectNoteList", "click", async function(event) {
        if (!selectedProject) return;
        const editButton = event.target.closest("[data-edit-note]");
        if (editButton) {
          const content = window.prompt("Editar nota do projeto", editButton.dataset.content || "");
          if (content === null) return;
          await api("/api/projects/" + selectedProject.id + "/notes/" + editButton.dataset.editNote, {
            method: "PATCH",
            body: JSON.stringify({ content: content })
          });
          await selectProject(selectedProject.id);
          showToast("Nota atualizada.");
          return;
        }
        const deleteButton = event.target.closest("[data-delete-note]");
        if (!deleteButton) return;
        await api("/api/projects/" + selectedProject.id + "/notes/" + deleteButton.dataset.deleteNote, { method: "DELETE" });
        await selectProject(selectedProject.id);
        showToast("Nota removida.");
      });
      on("linkProjectFileButton", "click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        const uploadId = getValue("projectUploadSelect");
        if (!uploadId) return showToast("Envie um arquivo antes de vincular.");
        await api("/api/projects/" + selectedProject.id + "/files", {
          method: "POST",
          body: JSON.stringify({ uploadId: uploadId })
        });
        await selectProject(selectedProject.id);
        showToast("Arquivo vinculado ao projeto.");
      });
      on("refreshProjectFilesButton", "click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        await selectProject(selectedProject.id);
        showToast("Arquivos do projeto atualizados.");
      });
      on("projectFileList", "click", async function(event) {
        const button = event.target.closest("[data-download-upload]");
        if (button) await downloadUpload(button.dataset.downloadUpload, button.dataset.fileName || "arquivo");
      });
      on("projectConversationList", "click", async function(event) {
        const button = event.target.closest("[data-open-conversation]");
        if (!button) return;
        setView("chat");
        await openConversation(button.dataset.openConversation);
      });
      on("continueProjectButton", "click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        await newConversation();
        setValue(els.messageInput, "Quero continuar o projeto " + selectedProject.name + ".");
        if (els.messageInput) els.messageInput.focus();
      });
      on("deleteProjectButton", "click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        if (!window.confirm("Excluir este projeto?")) return;
        await api("/api/projects/" + selectedProject.id, { method: "DELETE" });
        selectedProject = null;
        currentProjectDetails = null;
        setText("projectDetailTitle", "Selecione um projeto");
        setText("projectDetailDescription", "Abra um projeto para ver detalhes, continuar no chat ou excluir.");
        setText("projectDetail", "Nenhum projeto selecionado.");
        setHidden("projectWorkspace", true);
        await loadProjects();
        showToast("Projeto excluído.");
      });

      on("settingsTabs", "click", async function(event) {
        const button = event.target.closest("[data-settings-tab]");
        if (!button) return;
        await selectSettingsTab(button.dataset.settingsTab);
      });

      on("view-settings", "click", async function(event) {
        const retrySettings = event.target.closest("[data-retry-settings-tab]");
        if (retrySettings) {
          await selectSettingsTab(retrySettings.dataset.retrySettingsTab);
          return;
        }

        const tabTarget = event.target.closest("[data-settings-tab-target]");
        if (tabTarget) {
          await selectSettingsTab(tabTarget.dataset.settingsTabTarget);
          return;
        }

        const choice = event.target.closest("[data-choice-group]");
        if (choice) {
          document.querySelectorAll('[data-choice-group="' + choice.dataset.choiceGroup + '"]').forEach(function(item) {
            item.classList.toggle("active", item === choice);
          });
          if (choice.dataset.choiceGroup === "theme") {
            await api("/api/settings", {
              method: "PATCH",
              body: JSON.stringify({ theme: choice.textContent.trim().toLowerCase() })
            });
          }
          showToast("Preferência salva.");
          return;
        }
      });

      on("profileForm", "submit", async function(event) {
        event.preventDefault();
        const displayName = getValue("displayName").trim();
        const fullName = getValue("fullName").trim();
        const email = getValue("profileEmail").trim();
        const phone = getValue("profilePhone").trim();
        const avatarUrl = getValue("avatarUrl").trim();
        await api("/api/users/profile", {
          method: "PATCH",
          body: JSON.stringify({ name: displayName || fullName, email: email, phone: phone || null })
        });
        await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify({ displayName: displayName || fullName, fullName: fullName, avatarUrl: avatarUrl })
        });
        await refreshUser();
        await loadSettings();
        showToast("Perfil atualizado.");
      });

      on("cognitiveProfileForm", "submit", async function(event) {
        event.preventDefault();
        await api("/api/profile", {
          method: "PUT",
          body: JSON.stringify({
            preferredName: getValue("displayName").trim(),
            profession: getValue("cognitiveProfession").trim(),
            studies: getValue("cognitiveStudies").trim(),
            projects: linesFromTextarea("cognitiveProjects"),
            interests: linesFromTextarea("cognitiveInterests"),
            goals: {
              shortTerm: getValue("cognitiveGoalShort").trim(),
              mediumTerm: getValue("cognitiveGoalMedium").trim(),
              longTerm: getValue("cognitiveGoalLong").trim()
            },
            source: "manual",
            confidenceScore: 0.95
          })
        });
        await loadCognitiveProfile();
        showToast("Perfil cognitivo atualizado.");
      });

      on("cognitivePreferencesForm", "submit", async function(event) {
        event.preventDefault();
        const preferences = {
          communicationStyle: getValue("cognitiveCommunication").trim(),
          language: getValue("cognitiveLanguage"),
          responseStyle: getValue("cognitiveResponseStyle"),
          responseLength: getValue("cognitiveResponseLength"),
          source: "manual",
          confidenceScore: 0.92
        };
        await api("/api/profile/preferences", {
          method: "PUT",
          body: JSON.stringify(preferences)
        });
        await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify({
            aiStyle: preferences.responseStyle,
            language: preferences.language,
            responseLength: preferences.responseLength,
            theme: "dark"
          })
        });
        await loadSettings();
        showToast("Preferências cognitivas salvas.");
      });

      on("passwordForm", "submit", async function(event) {
        event.preventDefault();
        const currentPassword = getValue("currentPassword");
        const newPassword = getValue("newPassword");
        const confirmPassword = getValue("confirmPassword");
        await api("/api/users/password", {
          method: "PATCH",
          body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword, confirmPassword: confirmPassword })
        });
        event.currentTarget.reset();
        showToast("Senha atualizada com segurança.");
      });

      on("preferencesForm", "submit", async function(event) {
        event.preventDefault();
        await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify({
            aiStyle: getValue("aiStyle"),
            language: getValue("language"),
            responseLength: getValue("responseLength"),
            theme: "dark"
          })
        });
        showToast("Preferências salvas.");
      });

      on("voiceForm", "submit", async function(event) {
        event.preventDefault();
        const payload = {
          voiceEnabled: getChecked("voiceEnabled"),
          voiceLanguage: getValue("voiceLanguage"),
          voiceRate: Number(getValue("voiceRate") || 1),
          voicePitch: Number(getValue("voicePitch") || 1),
          voiceGender: getValue("voiceGender"),
          voiceAutoRead: getChecked("voiceAutoRead")
        };
        const data = await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
        applyVoiceSettings(data.settings || {});
        if (!voiceSettings.enabled) {
          stopSpeech(false);
          stopDictation();
          setConversationMode(false);
        }
        showToast("Configurações de voz salvas.");
      });

      on("memoryForm", "submit", async function(event) {
        event.preventDefault();
        const title = getValue("memoryTitle").trim();
        const category = getValue("memoryCategory");
        const importance = Number(getValue("memoryImportance") || 3);
        const content = getValue("memoryContent").trim();
        if (content.length < 2) return showToast("Escreva uma memória para salvar.");
        await api("/api/memory", {
          method: "POST",
          body: JSON.stringify({ title: title || undefined, category: category, importance: importance, content: content })
        });
        event.currentTarget.reset();
        await loadMemories();
        showToast("Memória salva.");
      });

      on("memorySearchForm", "submit", async function(event) {
        event.preventDefault();
        const query = getValue("memorySearchQuery").trim();
        if (query.length < 2) return showToast("Informe uma busca para a memória.");
        const data = await api("/api/memory/search?query=" + encodeURIComponent(query));
        renderMemorySearchResults(data.results || []);
      });

      on("memoryList", "click", async function(event) {
        const editButton = event.target.closest("[data-edit-memory]");
        if (editButton) {
          const title = window.prompt("Editar título da memória", editButton.dataset.title || "Memória");
          if (title === null) return;
          const content = window.prompt("Editar conteúdo da memória", editButton.dataset.content || "");
          if (content === null) return;
          await api("/api/memory/" + editButton.dataset.editMemory, {
            method: "PUT",
            body: JSON.stringify({ title: title, content: content })
          });
          await loadMemories();
          showToast("Memória atualizada.");
          return;
        }
        const pinButton = event.target.closest("[data-pin-memory]");
        if (pinButton) {
          await api("/api/memory/" + pinButton.dataset.pinMemory, {
            method: "PUT",
            body: JSON.stringify({ pinned: pinButton.dataset.pinned !== "true" })
          });
          await loadMemories();
          showToast("Memória atualizada.");
          return;
        }
        const button = event.target.closest("[data-delete-memory]");
        if (!button) return;
        await api("/api/memory/" + button.dataset.deleteMemory, { method: "DELETE" });
        await loadMemories();
        showToast("Memória removida.");
      });

      on("clearMemoriesButton", "click", async function() {
        if (!window.confirm("Limpar todas as memórias da YARA?")) return;
        await api("/api/memories", { method: "DELETE" });
        await loadMemories();
        showToast("Memórias limpas.");
      });

      on("loadSessionsButton", "click", function() {
        loadSessions("sessionList");
      });

      on("logoutAllButton", "click", async function() {
        const data = await api("/api/users/logout-all", { method: "POST" });
        showToast(data.message || "Sessões encerradas.");
      });

      on("securitySessionsButton", "click", function() {
        loadSessions("sessionList");
        selectSettingsTab("profile");
        showToast("Sessões carregadas na aba Perfil.");
      });

      on("securityDevicesButton", "click", function() {
        loadSessions("securityLoginHistory");
        showToast("Dispositivos conectados carregados.");
      });

      on("savePreferredTechButton", "click", async function() {
        const value = getValue("preferredTech").trim();
        if (!value) return showToast("Informe as tecnologias preferidas.");
        await api("/api/memories", {
          method: "POST",
          body: JSON.stringify({ title: "Tecnologias preferidas", content: value })
        });
        setValue("preferredTech", "");
        await loadMemories();
        showToast("Tecnologias preferidas salvas na memória.");
      });

      on("manageFilesButton", "click", function() {
        loadUploads();
        showToast("Arquivos atualizados.");
      });

      on("uploadsList", "click", async function(event) {
        const downloadButton = event.target.closest("[data-download-upload]");
        if (downloadButton) {
          await downloadUpload(downloadButton.dataset.downloadUpload, downloadButton.dataset.fileName || "arquivo");
          return;
        }
        const button = event.target.closest("[data-delete-upload]");
        if (!button) return;
        await api("/api/uploads/" + button.dataset.deleteUpload, { method: "DELETE" });
        await loadUploads();
        showToast("Arquivo removido.");
      });

      on("refreshDocumentsButton", "click", async function() {
        await loadDocuments();
        showToast("Documentos atualizados.");
      });
      on("refreshDocumentsPageButton", "click", async function() {
        await loadDocuments();
        showToast("Documentos atualizados.");
      });

      on("documentForm", "submit", async function(event) {
        event.preventDefault();
        await createDocumentFromControls({
          titleId: "documentTitle",
          templateId: "documentTemplate",
          formatId: "documentFormat",
          fieldsId: "documentFields"
        });
      });

      on("documentPageForm", "submit", async function(event) {
        event.preventDefault();
        await createDocumentFromControls({
          titleId: "documentPageTitle",
          templateId: "documentPageTemplate",
          formatId: "documentPageFormat",
          fieldsId: "documentPageFields"
        });
      });
      on("documentsList", "click", handleDocumentListClick);
      on("documentsPageList", "click", handleDocumentListClick);
      on("documentSearch", "input", function() {
        renderDocumentList("documentsPageList", filteredDocuments());
      });
      on("documentFormatFilter", "change", function() {
        renderDocumentList("documentsPageList", filteredDocuments());
      });
      on("documentCategoryFilter", "change", function() {
        renderDocumentList("documentsPageList", filteredDocuments());
      });
      on("documentUploadButton", "click", function() {
        byId("documentUploadInput")?.click();
      });
      on("documentUploadInput", "change", async function(event) {
        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!file) return;
        try {
          await uploadDocumentFromInput(file);
        } catch (error) {
          showToast(error.message || "Não foi possível enviar o documento.");
        }
      });
      on("documentConvertButton", "click", async function() {
        try {
          await convertSelectedDocument();
        } catch (error) {
          showToast(error.message || "Não foi possível converter.");
        }
      });

      on("refreshFilesButton", "click", async function() {
        await loadFiles();
        showToast("Arquivos atualizados.");
      });
      on("fileUploadButton", "click", function() {
        byId("fileUploadInput")?.click();
      });
      on("fileUploadInput", "change", async function(event) {
        const file = event.target.files && event.target.files[0];
        event.target.value = "";
        if (!file) return;
        try {
          await uploadFileFromInput(file);
        } catch (error) {
          showToast(error.message || "Não foi possível enviar este arquivo.");
        }
      });
      on("fileExportButton", "click", async function() {
        try {
          await exportFileFromControls();
        } catch (error) {
          showToast(error.message || "Não foi possível gerar este arquivo.");
        }
      });
      on("fileSearch", "input", renderFileList);
      on("fileTypeFilter", "change", renderFileList);
      on("fileCategoryFilter", "change", renderFileList);
      on("fileList", "click", async function(event) {
        await handleFileListClick(event);
      });

      on("refreshImagesButton", "click", async function() {
        await loadImages();
        showToast("Imagens atualizadas.");
      });
      on("imageUploadButton", "click", function() {
        byId("imageUploadInput")?.click();
      });
      on("imageCameraButton", "click", function() {
        byId("imageCameraInput")?.click();
      });
      ["imageUploadInput", "imageCameraInput"].forEach(function(inputId) {
        on(inputId, "change", function(event) {
          const file = event.target.files && event.target.files[0];
          event.target.value = "";
          setPendingImage(file);
        });
      });
      on("removeImagePreviewButton", "click", function() {
        clearPendingImage();
        showToast("Preview removido.");
      });
      on("sendImageButton", "click", async function() {
        try {
          await uploadPendingImage();
        } catch (error) {
          showToast(error.message || "Não foi possível enviar a imagem.");
        }
      });
      on("imageOcrButton", "click", async function() {
        try {
          const imageId = getValue("imageOcrSource");
          if (!imageId) return showToast("Selecione uma imagem para OCR.");
          await runImageOcr(imageId);
        } catch (error) {
          showToast(error.message || "Não foi possível executar OCR.");
        }
      });
      on("imageEditButton", "click", async function() {
        try {
          await editImageFromControls();
        } catch (error) {
          showToast(error.message || "Não foi possível editar a imagem.");
        }
      });
      on("imageSearch", "input", renderImages);
      on("imagesList", "click", async function(event) {
        try {
          await handleImageListClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível concluir a ação.");
        }
      });

      on("technicalProjectForm", "submit", createTechnicalProjectFromForm);
      on("technicalChatForm", "submit", sendTechnicalChatFromForm);
      on("technicalInspectionForm", "submit", inspectTechnicalProjectFromForm);
      on("technicalFileForm", "submit", async function(event) {
        try {
          await uploadTechnicalFileFromForm(event);
        } catch (error) {
          showToast(error.message || "Não foi possível anexar arquivo técnico.");
        }
      });

      on("refreshCalendarButton", "click", async function() {
        await loadCalendar();
        showToast("Agenda atualizada.");
      });
      on("calendarEventForm", "submit", createEventFromForm);
      on("reminderForm", "submit", createReminderFromForm);
      on("calendarRangeTabs", "click", async function(event) {
        const button = event.target.closest("[data-calendar-range]");
        if (!button) return;
        currentCalendarRange = button.dataset.calendarRange;
        document.querySelectorAll("[data-calendar-range]").forEach(function(tab) {
          tab.classList.toggle("active", tab === button);
        });
        await loadCalendar();
      });
      on("calendarEventsList", "click", async function(event) {
        try {
          await handleCalendarEventClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível atualizar o evento.");
        }
      });
      on("remindersList", "click", async function(event) {
        try {
          await handleReminderClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível atualizar o lembrete.");
        }
      });
      on("googleCalendarConnectButton", "click", function() {
        callGoogleCalendar("/api/calendar/google/connect");
      });
      on("googleCalendarCalendarsButton", "click", function() {
        callGoogleCalendar("/api/calendar/google/calendars");
      });
      on("googleCalendarSyncButton", "click", function() {
        callGoogleCalendar("/api/calendar/google/sync", "POST");
      });

      on("refreshIntegrationsButton", "click", loadIntegrations);
      on("integrationCalendarConnect", "click", function() {
        callIntegration("/api/integrations/google/calendar/connect", "integrationCalendarResult");
      });
      on("integrationGmailConnect", "click", function() {
        callIntegration("/api/integrations/google/gmail/connect", "integrationGmailResult");
      });
      on("integrationDriveConnect", "click", function() {
        callIntegration("/api/integrations/google/drive/connect", "integrationDriveResult");
      });
      on("integrationDriveList", "click", function() {
        callIntegration("/api/integrations/drive/files?maxResults=10", "integrationDriveResult");
      });
      on("integrationDriveSearch", "click", function() {
        callIntegration("/api/integrations/drive/files?query=" + encodeURIComponent(getValue("integrationDriveQuery").trim()) + "&maxResults=10", "integrationDriveResult");
      });
      on("integrationDriveCreateFolder", "click", function() {
        callIntegration("/api/integrations/drive/folders", "integrationDriveResult", {
          method: "POST",
          body: JSON.stringify({ name: getValue("integrationDriveFolderName").trim() })
        });
      });
      on("integrationDriveUploadFile", "click", function() {
        const fileId = getValue("integrationDriveFileSelect");
        if (!fileId) return showToast("Escolha um arquivo da YARA.");
        callIntegration("/api/integrations/drive/upload-file", "integrationDriveResult", {
          method: "POST",
          body: JSON.stringify({ fileId: fileId })
        });
      });
      on("integrationCalendarSync", "click", function() {
        callIntegration("/api/integrations/google/calendar/sync", "integrationCalendarResult", { method: "POST" });
      });
      on("integrationCalendarList", "click", function() {
        callIntegration("/api/integrations/google/calendar/events", "integrationCalendarResult");
      });
      on("integrationCalendarForm", "submit", function(event) {
        event.preventDefault();
        const title = getValue("integrationCalendarTitle").trim();
        const date = getValue("integrationCalendarDate");
        const time = getValue("integrationCalendarTime");
        const location = getValue("integrationCalendarLocation").trim();
        if (!title || !date) {
          showToast("Informe título e data do evento.");
          return;
        }
        callIntegration("/api/integrations/google/calendar/events", "integrationCalendarResult", {
          method: "POST",
          body: JSON.stringify({ title: title, date: date, time: time || null, location: location || null })
        });
      });
      on("integrationGmailRecent", "click", function() {
        callIntegration("/api/integrations/gmail/messages?maxResults=5", "integrationGmailResult");
      });
      on("integrationGmailUnread", "click", function() {
        callIntegration("/api/integrations/gmail/summarize", "integrationGmailResult", {
          method: "POST",
          body: JSON.stringify({ query: "is:unread", maxResults: 5 })
        });
      });
      on("integrationGmailDraft", "click", function() {
        callIntegration("/api/integrations/gmail/drafts", "integrationGmailResult", {
          method: "POST",
          body: JSON.stringify({
            to: getValue("integrationGmailTo").trim(),
            subject: getValue("integrationGmailSubject").trim(),
            body: getValue("integrationGmailBody").trim()
          })
        });
      });
      on("integrationGmailForm", "submit", function(event) {
        event.preventDefault();
        callIntegration("/api/integrations/gmail/send", "integrationGmailResult", {
          method: "POST",
          body: JSON.stringify({
            to: getValue("integrationGmailTo").trim(),
            subject: getValue("integrationGmailSubject").trim(),
            body: getValue("integrationGmailBody").trim()
          })
        });
      });
      on("automationForm", "submit", createAutomationFromForm);
      on("refreshAutomationsButton", "click", loadAutomations);
      on("automationChatForm", "submit", function(event) {
        event.preventDefault();
        sendAutomationChatFromUi();
      });
      on("automationFlowForm", "submit", function(event) {
        event.preventDefault();
        createAutomationFlowFromUi();
      });
      on("refreshAutomationWorkspaceButton", "click", loadAutomationWorkspace);
      on("automationFlowList", "click", async function(event) {
        try {
          await handleAutomationWorkspaceClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível atualizar a automação.");
        }
      });
      on("pluginChatForm", "submit", function(event) {
        event.preventDefault();
        sendPluginChatFromUi();
      });
      on("refreshMarketplaceButton", "click", loadMarketplace);
      on("pluginMarketplaceList", "click", async function(event) {
        try {
          await handlePluginActionClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível atualizar o plugin.");
        }
      });
      on("pluginInstalledList", "click", async function(event) {
        try {
          await handlePluginActionClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível atualizar o plugin.");
        }
      });
      on("automationList", "click", async function(event) {
        try {
          await handleAutomationListClick(event);
        } catch (error) {
          showToast(error.message || "Não foi possível atualizar a automação.");
        }
      });
      on("integrationTelegramForm", "submit", function(event) {
        event.preventDefault();
        callIntegration("/api/integrations/telegram/send", "integrationTelegramResult", {
          method: "POST",
          body: JSON.stringify({
            chatId: getValue("integrationTelegramChatId").trim(),
            text: getValue("integrationTelegramText").trim()
          })
        });
      });
      on("integrationWhatsappForm", "submit", function(event) {
        event.preventDefault();
        callIntegration("/api/integrations/whatsapp/send", "integrationWhatsappResult", {
          method: "POST",
          body: JSON.stringify({
            to: getValue("integrationWhatsappTo").trim(),
            text: getValue("integrationWhatsappText").trim()
          })
        });
      });
      on("integrationPushSubscribe", "click", async function() {
        if (!("Notification" in window)) {
          showToast("Este navegador não oferece notificações web.");
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          showToast("Permissão de notificação não concedida.");
          return;
        }
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          showToast("Permissão local concedida. Push remoto exige service worker/VAPID no ambiente.");
          await callIntegration("/api/push/test", "integrationPushList", { method: "POST", body: JSON.stringify({ title: "Push YARA AI", message: "Permissão local validada." }) });
          return;
        }
        showToast("Notificações autorizadas. Inscrição push remota preparada para service worker.");
        await callIntegration("/api/push/test", "integrationPushList", { method: "POST", body: JSON.stringify({ title: "Push YARA AI", message: "Canal de notificação validado." }) });
      });
      on("integrationPushTest", "click", function() {
        callIntegration("/api/push/test", "integrationPushList", { method: "POST", body: JSON.stringify({ title: "Teste YARA AI", message: "Notificação interna criada com sucesso." }) });
      });

      on("refreshAuditButton", "click", async function() {
        await loadAudit();
        showToast("Auditoria atualizada.");
      });
      on("refreshBackupsButton", "click", async function() {
        await loadAudit();
        showToast("Backups atualizados.");
      });
      on("createBackupButton", "click", async function() {
        await createBackupFromUi();
      });
      on("loadPilarReportButton", "click", async function() {
        await loadPilarReport();
        showToast("Relatório carregado.");
      });
      on("auditSearch", "input", function() {
        auditPage = 1;
        loadAudit();
      });
      on("auditCategoryFilter", "change", function() {
        auditPage = 1;
        loadAudit();
      });
      on("auditActionFilter", "input", function() {
        auditPage = 1;
        loadAudit();
      });
      on("logLevelFilter", "change", function() {
        loadAudit();
      });
      on("auditPrevPage", "click", async function() {
        auditPage = Math.max(1, auditPage - 1);
        await loadAudit();
      });
      on("auditNextPage", "click", async function() {
        auditPage += 1;
        await loadAudit();
      });
      on("backupList", "click", async function(event) {
        const button = event.target.closest("[data-download-backup]");
        if (!button) return;
        await downloadProtectedPath("/api/backups/" + button.dataset.downloadBackup + "/download", (button.dataset.fileName || "backup") + "-manifest.json");
      });

      on("testAiButton", "click", async function() {
        try {
          const data = await api("/api/ai/test", { method: "POST" });
          showToast("IA conectada: " + (data.model || "modelo ativo"));
          await loadAiStatus();
        } catch (error) {
          showToast(error.message);
        }
      });

      on("logoutButton", "click", function() {
        stopSpeech(false);
        stopDictation();
        localStorage.removeItem("yaraToken");
        localStorage.removeItem("yaraUser");
        window.location.href = "/";
      });

      if (speechSynthesisSupported) {
        window.speechSynthesis.onvoiceschanged = updateSpeechSupportText;
      }
      updateSpeechSupportText();
      refreshVoiceControls();
      init();
    </script>
  </body>
</html>`;
}

function navButton(view: string, label: string, iconName: IconName, active = false) {
  return `<button class="nav-button ${active ? "active" : ""}" id="nav-${view}" data-view="${view}" type="button">${icon(iconName)}${label}</button>`;
}

function menuButton(action: string, label: string, iconName: IconName, danger = false) {
  return `<button class="menu-item ${danger ? "danger" : ""}" id="menu-${action}" data-action="${action}" type="button">${icon(iconName)}${label}</button>`;
}

function settingsInfoCard(title: string, description: string, iconName: IconName) {
  return `<article class="card"><div class="item-top"><h2>${title}</h2><span class="avatar">${icon(iconName)}</span></div><p class="muted">${description}</p></article>`;
}

function statCard(title: string, value: string, description: string) {
  return `<article class="card stat-card"><span class="avatar">${value}</span><strong>${title}</strong><p class="muted">${description}</p></article>`;
}

function toggleRow(title: string, description: string, active: boolean) {
  return `<article class="toggle-row"><div><strong>${title}</strong><p class="muted">${description}</p></div><span class="toggle ${active ? "active" : ""}" aria-label="${title}"></span></article>`;
}

type IconName =
  | "archive"
  | "arrowUp"
  | "brain"
  | "camera"
  | "chat"
  | "close"
  | "code"
  | "dots"
  | "file"
  | "folder"
  | "history"
  | "image"
  | "logout"
  | "menu"
  | "mic"
  | "paperclip"
  | "pin"
  | "plus"
  | "save"
  | "search"
  | "send"
  | "settings"
  | "share"
  | "shield"
  | "sparkles"
  | "trash"
  | "users";

function icon(name: IconName) {
  const icons: Record<IconName, string> = {
    archive: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16v13H4V7Zm2-4h12l2 4H4l2-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V5m0 0-6 6m6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4.5A3 3 0 0 0 6 7.5v.2A3.4 3.4 0 0 0 4 11a3.4 3.4 0 0 0 2 3.1v.4A3 3 0 0 0 9 17.5h1V4.5H9Zm6 0a3 3 0 0 1 3 3v.2A3.4 3.4 0 0 1 20 11a3.4 3.4 0 0 1-2 3.1v.4a3 3 0 0 1-3 3h-1V4.5h1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h2m4 0h2M8 13h2m4 0h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H9l1.5-2h3L15 6h2.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke="currentColor" stroke-width="1.8"/><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.8"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4A3.5 3.5 0 0 1 3 10.5v-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-10-3 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 18 18H6a2.5 2.5 0 0 1-2.5-2.5v-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7M4 4v4.7h4.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" stroke-width="1.8"/><path d="m5 17 4.5-4.5 3 3L15 13l4 4M9 8.5h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 6H6.5A2.5 2.5 0 0 0 4 8.5v7A2.5 2.5 0 0 0 6.5 18H10m4-3 3-3-3-3m3 3H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" stroke="currentColor" stroke-width="1.8"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    paperclip: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 11.5-8.5 8.5a5 5 0 0 1-7.1-7.1l9.2-9.2a3.4 3.4 0 1 1 4.8 4.8l-9.3 9.3a1.8 1.8 0 0 1-2.5-2.5l8.5-8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 4 6 6-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4 1-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h11l3 3v13H5V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 4v6h8M8 20v-6h8v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 12 16-8-5 16-3-6-8-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m12 14 8-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.8"/><path d="M19 13.3v-2.6l-2-.7a5.7 5.7 0 0 0-.7-1.6l.9-1.9-1.8-1.8-1.9.9a5.7 5.7 0 0 0-1.6-.7L11.3 3H8.7L8 5a5.7 5.7 0 0 0-1.6.7l-1.9-.9-1.8 1.8.9 1.9A5.7 5.7 0 0 0 3 10.1l-2 .6v2.6l2 .7c.2.6.4 1.1.7 1.6l-.9 1.9 1.8 1.8 1.9-.9c.5.3 1 .5 1.6.7l.6 2h2.6l.7-2c.6-.2 1.1-.4 1.6-.7l1.9.9 1.8-1.8-.9-1.9c.3-.5.5-1 .7-1.6l1.9-.7Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 12h8M14 6l6 6-6 6M4 4v16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 2.8 8.4 7 10 4.2-1.6 7-5.5 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Zm6 10 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13ZM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2m-8 0 1 13h8l1-13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 8a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M16 16a5 5 0 0 1 5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  return icons[name];
}
