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
        z-index: 35;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      svg {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
      }

      .app-shell {
        height: 100vh;
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
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }

      .topbar {
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
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
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
        min-height: 0;
        overflow: auto;
        padding: clamp(18px, 4vw, 34px);
      }

      .view[hidden] {
        display: none;
      }

      .chat-view {
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
        max-width: min(760px, 82%);
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
        display: grid;
        gap: 10px;
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
        background: linear-gradient(180deg, rgba(8, 17, 32, 0), rgba(8, 17, 32, 0.96) 32%);
      }

      .composer-tools {
        max-width: 920px;
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

      .floating-menu {
        max-height: min(520px, calc(100vh - 120px));
        overflow: auto;
      }

      .floating-menu.open,
      .attach-menu.open {
        display: grid;
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
        display: grid;
        grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
        gap: 18px;
      }

      .documents-layout {
        display: grid;
        grid-template-columns: minmax(320px, 0.78fr) minmax(0, 1.22fr);
        gap: 18px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 14px;
      }

      .panel,
      .card {
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
        display: grid;
        gap: 9px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        border-radius: 15px;
        padding: 14px;
        background: rgba(2, 6, 23, 0.32);
      }

      .item-top {
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
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tab {
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
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .option-grid {
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

      @media (max-width: 1024px) {
        .layout-grid,
        .settings-grid,
        .documents-layout { grid-template-columns: 1fr; }
        .settings-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .inline-form { grid-template-columns: 1fr; }
      }

      @media (max-width: 860px) {
        body { overflow: hidden; }
        .app-shell { height: 100dvh; grid-template-columns: 1fr; }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          width: min(86vw, 330px);
          transform: translateX(-102%);
          border-right: 1px solid var(--line);
          border-bottom: 0;
          transition: transform 180ms ease;
          box-shadow: 28px 0 70px rgba(0, 0, 0, 0.34);
        }
        .mobile-toggle { display: inline-flex; }
        .sidebar-body { display: flex; }
        .sidebar.open { transform: translateX(0); }
        .sidebar.open { z-index: 60; }
        .main { height: 100dvh; }
        .topbar {
          min-height: 64px;
          align-items: center;
          flex-direction: row;
          padding: 10px 12px;
        }
        .topbar-title { align-items: center; }
        .topbar h1 { font-size: 18px; }
        .topbar p { display: none; }
        .status { padding: 7px 9px; font-size: 0; }
        .status::after { content: "Ativo"; font-size: 12px; }
        .model-select { max-width: 128px; }
        .floating-menu.open {
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
        .floating-menu.open::before {
          content: "";
          width: 42px;
          height: 4px;
          justify-self: center;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.44);
          margin: 2px 0 6px;
        }
        .messages { padding-inline: 4px; }
      }

      @keyframes sheetIn {
        from { transform: translateY(14px); opacity: 0.7; }
        to { transform: translateY(0); opacity: 1; }
      }

      @media (max-width: 640px) {
        .sidebar,
        .view,
        .topbar { padding: 14px; }
        .chat-view { padding: 8px 10px 10px; gap: 8px; }
        .messages { gap: 14px; padding-bottom: 4px; }
        .composer-wrap { padding-top: 6px; }
        .composer-tools { margin-bottom: 6px; overflow-x: auto; }
        .composer { grid-template-columns: auto auto minmax(0, 1fr) auto; border-radius: 16px; }
        .composer .primary-action { width: 44px; min-width: 44px; padding: 0; font-size: 0; }
        .composer .primary-action svg { margin: 0; }
        .composer textarea { max-height: 96px; }
        .message { max-width: 100%; }
        .message.assistant { margin-left: 38px; }
        .message-avatar { left: -38px; width: 30px; height: 30px; }
        .typing-indicator { font-size: 13px; }
        .button { width: 100%; }
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
        .settings-hero { align-items: flex-start; flex-direction: column; }
        .settings-card-grid,
        .option-grid,
        .dashboard-grid { grid-template-columns: 1fr; }
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
          <button class="icon-button mobile-toggle" id="mobileToggle" type="button" aria-label="Abrir menu">${icon("menu")}</button>
        </div>
        <div class="sidebar-body">
          <button class="primary-action" id="newConversationButton" type="button">${icon("plus")}Nova conversa</button>
          <nav class="nav" aria-label="Navegação">
            ${navButton("chat", "Chat", "chat", true)}
            ${navButton("generator", "Gerador de Sistemas", "code")}
            ${navButton("projects", "Projetos", "folder")}
            ${navButton("documents", "Documentos", "file")}
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
            <button class="icon-button" id="chatMenuButton" type="button" aria-label="Ações da conversa">${icon("dots")}</button>
            <div class="floating-menu" id="chatActionMenu">
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
              <div class="list" id="projectList"></div>
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
                  <button class="button danger" id="deleteProjectButton" type="button">${icon("trash")}Excluir projeto</button>
                </div>
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
                <h2>Novo documento</h2>
                <p class="muted">Escolha um modelo, preencha os campos em JSON e gere PDF ou CSV protegido.</p>
                <form class="form" id="documentPageForm">
                  <label>Título do documento</label>
                  <input class="field" id="documentPageTitle" placeholder="Ex.: Orçamento para cliente" required />
                  <label>Modelo</label>
                  <select class="select" id="documentPageTemplate"></select>
                  <label>Formato</label>
                  <select class="select" id="documentPageFormat">
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
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
                <h2>Documentos gerados</h2>
                <div class="list" id="documentsPageList"></div>
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
            </div>

            <div class="settings-pane settings-grid" id="settings-memory" hidden>
              <form class="card" id="memoryForm">
                <h2>Memória da YARA</h2>
                <p class="muted">A YARA usa essas informações para personalizar respostas.</p>
                <input class="field" id="memoryTitle" placeholder="Título opcional" />
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
    <script>
      const token = localStorage.getItem("yaraToken");
      let currentUser = null;
      let currentConversationId = null;
      let currentConversation = null;
      let currentMessages = [];
      let conversations = [];
      let projects = [];
      let selectedProject = null;
      let generatedProject = null;
      let pendingAttachment = null;
      let currentProjectDetails = null;
      let audioRecorder = null;
      let audioStream = null;
      let audioChunks = [];
      let documentTemplates = [];
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
          .replace(/(\/\/.*)$/gm, '<span class="code-comment">$1</span>')
          .replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, '<span class="code-string">$1</span>')
          .replace(/\b(const|let|var|function|return|async|await|import|export|from|class|type|interface|if|else|for|while|try|catch|new)\b/g, '<span class="code-keyword">$1</span>');
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

      function showToast(message) {
        els.toast.textContent = message;
        els.toast.classList.add("show");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function() {
          els.toast.classList.remove("show");
        }, 3600);
      }

      function openModal(title, text, body) {
        els.modalTitle.textContent = title;
        els.modalText.textContent = text || "";
        els.modalBody.innerHTML = body || "";
        els.modalOverlay.classList.add("open");
      }

      function closeModal() {
        els.modalOverlay.classList.remove("open");
        els.modalBody.innerHTML = "";
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
        document.getElementById("quickLanguage").value = settings.language || "pt-BR";
        document.getElementById("quickAiStyle").value = settings.ai_style || "balanced";
        document.getElementById("quickResponseLength").value = settings.response_length || "medium";
      }

      function openHelpModal() {
        openModal("Ajuda e suporte", "Como usar a YARA AI no dia a dia.", '<div class="list"><article class="list-item"><strong>Chat</strong><p class="muted">Faça perguntas, envie arquivos, grave áudio e continue conversas pelo histórico.</p></article><article class="list-item"><strong>Projetos</strong><p class="muted">Vincule conversas, tarefas, notas e arquivos para organizar entregas reais.</p></article><article class="list-item"><strong>Gerador</strong><p class="muted">Use o módulo separado para criar sistemas, APIs, dashboards e apps.</p></article></div>');
      }

      function openTermsModal() {
        openModal("Termos e privacidade", "Resumo de segurança da plataforma.", '<div class="list"><article class="list-item"><strong>Privacidade</strong><p class="muted">Seus arquivos e conversas exigem autenticação para acesso.</p></article><article class="list-item"><strong>IA segura</strong><p class="muted">Gemini/OpenAI são acessados apenas pelo backend, nunca diretamente pelo navegador ou APK.</p></article><article class="list-item"><strong>Credenciais</strong><p class="muted">Nenhuma chave, token ou segredo é exibido na interface.</p></article></div>');
      }

      function setView(view) {
        const requestedView = view;
        if (view === "memory") {
          view = "settings";
          window.setTimeout(function() { selectSettingsTab("memory"); }, 0);
        }
        document.querySelectorAll(".view").forEach(function(item) {
          item.hidden = item.id !== "view-" + view;
        });
        const activeView = requestedView === "memory" ? "memory" : view;
        document.querySelectorAll(".nav-button").forEach(function(item) {
          item.classList.toggle("active", item.dataset.view === activeView);
        });
        const labels = {
          chat: ["YARA AI", "Chat geral com a YARA."],
          dashboard: ["Dashboard", "Resumo da sua atividade."],
          generator: ["Gerador de Sistemas", "Crie sistemas completos em um módulo separado."],
          projects: ["Projetos", "Organize projetos, tarefas, notas e arquivos."],
          documents: ["Documentos", "Gere e baixe documentos protegidos."],
          settings: ["Configurações", "Preferências, conta e memória da YARA."]
        };
        els.pageTitle.textContent = labels[view][0];
        els.pageSubtitle.textContent = labels[view][1];
        els.sidebar.classList.remove("open");
        els.chatActionMenu.classList.remove("open");
        els.attachMenu.classList.remove("open");
        document.body.classList.remove("drawer-open", "menu-open");
        if (view === "dashboard") loadDashboard();
        if (view === "projects") loadProjects();
        if (view === "documents") loadDocuments();
        if (view === "settings") loadSettings();
      }

      function selectSettingsTab(tabName) {
        document.querySelectorAll(".tab").forEach(function(tab) {
          tab.classList.toggle("active", tab.dataset.settingsTab === tabName);
        });
        document.querySelectorAll(".settings-pane").forEach(function(pane) {
          pane.hidden = pane.id !== "settings-" + tabName;
        });
        if (tabName === "memory") loadMemories();
        if (tabName === "files") loadUploads();
        if (tabName === "documents") loadDocuments();
        if (tabName === "ai") loadAiStatus();
      }

      function closeChatMenu() {
        els.chatActionMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
      }

      function toggleChatMenu() {
        const willOpen = !els.chatActionMenu.classList.contains("open");
        els.chatActionMenu.classList.toggle("open", willOpen);
        document.body.classList.toggle("menu-open", willOpen);
      }

      function closeSidebarDrawer() {
        els.sidebar.classList.remove("open");
        document.body.classList.remove("drawer-open");
      }

      function toggleSidebarDrawer() {
        const willOpen = !els.sidebar.classList.contains("open");
        els.sidebar.classList.toggle("open", willOpen);
        document.body.classList.toggle("drawer-open", willOpen);
      }

      function renderConversationGroup(target, items, emptyText) {
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
        els.messageInput.style.height = "auto";
        els.messageInput.style.height = Math.min(132, els.messageInput.scrollHeight) + "px";
      }

      function scrollMessagesToBottom() {
        window.requestAnimationFrame(function() {
          els.messages.scrollTop = els.messages.scrollHeight;
        });
      }

      function setResponseState(state) {
        responseState = state;
        isResponding = state === "sending" || state === "thinking" || state === "typing";
        els.sendButton.disabled = isResponding;
        els.sendButton.setAttribute("aria-busy", isResponding ? "true" : "false");
        els.sendButton.innerHTML = isResponding
          ? '<span class="send-spinner" aria-hidden="true"></span><span>Enviando</span>'
          : '${icon("send")}Enviar';
      }

      function setWebSearchNext(active) {
        useWebSearchNext = Boolean(active);
        els.webSearchToggle.classList.toggle("active", useWebSearchNext);
        els.webSearchToggle.setAttribute("aria-pressed", useWebSearchNext ? "true" : "false");
      }

      function setVoiceStatus(message, state) {
        const safeState = state || "idle";
        els.voiceStatus.className = "voice-status " + safeState;
        els.voiceStatus.innerHTML = '<span class="voice-waves" aria-hidden="true"><span></span><span></span><span></span></span><strong>' + escapeHtml(message) + '</strong>';
      }

      function refreshVoiceControls() {
        els.dictationButton.classList.toggle("listening", isListening);
        els.dictationButton.setAttribute("aria-pressed", isListening ? "true" : "false");
        els.conversationModeButton.classList.toggle("active", conversationMode);
        els.conversationModeButton.setAttribute("aria-pressed", conversationMode ? "true" : "false");
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
          els.messageInput.value = (base + speechText).trim();
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
          const hasText = els.messageInput.value.trim().length > 0 && els.messageInput.value.trim() !== voiceBaseText;
          isListening = false;
          refreshVoiceControls();
          if (conversationMode && hasText && !isResponding) {
            setVoiceStatus("Enviando fala para a YARA...", "speaking");
            document.getElementById("chatForm").requestSubmit();
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
        voiceBaseText = els.messageInput.value.trim();
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
          const uploads = message.uploads && message.uploads.length
            ? '<div class="message-attachments">' + message.uploads.map(renderAttachment).join("") + '</div>'
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
        els.messageInput.focus();
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
        els.attachmentPreview.hidden = true;
        els.attachmentPreview.innerHTML = "";
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

        els.attachmentPreview.innerHTML = visual + '<span class="attachment-meta"><strong>' + escapeHtml(file.name) + '</strong><span>' + escapeHtml(file.type || "arquivo") + " · " + formatFileSize(file.size) + '</span></span><button class="icon-button danger" id="removeAttachmentButton" type="button" aria-label="Remover anexo">${icon("trash")}</button>';
        els.attachmentPreview.hidden = false;
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
          throw new Error(data.error && data.error.message ? data.error.message : "Erro ao conversar com YARA.");
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
        const message = els.messageInput.value.trim();
        if (!message && !pendingAttachment) return;
        els.messageInput.value = "";
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
          const text = error.message || "Não foi possível enviar este arquivo.";
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
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(file.original_name || file.file_name) + '</strong><button class="button" data-download-upload="' + file.id + '" data-file-name="' + escapeHtml(file.original_name || file.file_name) + '" type="button">Abrir</button></div><p class="muted">' + attachmentMeta(file) + '</p></article>';
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
        document.getElementById("chatSearchRow").classList.add("open");
        document.getElementById("chatSearchInput").focus();
      }

      function openAttachmentPicker(action) {
        els.attachMenu.classList.remove("open");
        if (action === "attachGallery" || action === "attachImage") els.fileInputImages.click();
        if (action === "attachDocument") els.fileInputDocument.click();
        if (action === "attachPdf") els.fileInputPdf.click();
        if (action === "attachCamera") els.fileInputCamera.click();
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
          ["Tarefas pendentes", stats.pendingTasks || 0, '${icon("save")}']
        ];
        document.getElementById("dashboardStats").innerHTML = statItems.map(function(item) {
          return '<article class="card"><div class="item-top"><span class="avatar">' + item[2] + '</span><strong>' + escapeHtml(item[0]) + '</strong></div><h2>' + item[1] + '</h2></article>';
        }).join("");

        const projectTarget = document.getElementById("dashboardProjects");
        const recentProjects = dashboard.recentProjects || [];
        projectTarget.innerHTML = recentProjects.length ? recentProjects.map(function(project) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(project.name) + '</strong><button class="button" data-dashboard-project="' + project.id + '" type="button">Abrir</button></div><p class="muted">' + escapeHtml(project.description || project.type || "Projeto YARA AI") + '</p></article>';
        }).join("") : '<p class="muted">Nenhum projeto criado ainda.</p>';

        const taskTarget = document.getElementById("dashboardTasks");
        const recentTasks = dashboard.recentTasks || [];
        taskTarget.innerHTML = recentTasks.length ? recentTasks.map(function(task) {
          const due = task.due_date ? " · prazo " + escapeHtml(task.due_date) : "";
          return '<article class="list-item"><div class="item-top"><strong class="task-title ' + (task.status === "done" ? "done" : "") + '">' + escapeHtml(task.title) + '</strong><span class="status"><span class="dot"></span>' + (task.status === "done" ? "Concluída" : "Pendente") + '</span></div><p class="muted">' + escapeHtml(task.project_name || "Projeto") + due + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma tarefa registrada.</p>';

        const conversationTarget = document.getElementById("dashboardConversations");
        const recentConversations = dashboard.recentConversations || [];
        conversationTarget.innerHTML = recentConversations.length ? recentConversations.map(function(conversation) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(conversation.title || "Conversa") + '</strong><button class="button" data-dashboard-conversation="' + conversation.id + '" type="button">Abrir</button></div><p class="muted">Atualizada em ' + escapeHtml(conversation.updated_at || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma conversa recente.</p>';

        const suggestionTarget = document.getElementById("dashboardSuggestions");
        suggestionTarget.innerHTML = (dashboard.suggestions || []).map(function(text) {
          return '<article class="list-item"><p class="muted">' + escapeHtml(text) + '</p></article>';
        }).join("");
      }

      async function loadProjects(render = true) {
        const data = await api("/api/projects");
        projects = data.projects || [];
        if (render) renderProjects();
      }

      function renderProjects() {
        const query = document.getElementById("projectSearch").value.trim().toLowerCase();
        const visible = projects.filter(function(project) {
          return !query || String(project.name + " " + (project.description || project.prompt || "")).toLowerCase().includes(query);
        });
        const target = document.getElementById("projectList");
        if (!visible.length) {
          target.innerHTML = '<p class="muted">Nenhum projeto encontrado.</p>';
          return;
        }
        target.innerHTML = visible.map(function(project) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(project.name) + '</strong><button class="button" data-open-project="' + project.id + '" type="button">Abrir projeto</button></div><p class="muted">' + escapeHtml(project.description || project.prompt || "Projeto YARA AI") + '</p></article>';
        }).join("");
      }

      async function loadProjectUploadOptions() {
        const select = document.getElementById("projectUploadSelect");
        const data = await api("/api/uploads");
        const uploads = data.uploads || [];
        select.innerHTML = uploads.length
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

        document.getElementById("projectTaskList").innerHTML = tasks.length ? tasks.map(function(task) {
          return '<article class="list-item"><div class="item-top"><label class="row"><input type="checkbox" data-toggle-task="' + task.id + '" ' + (task.status === "done" ? "checked" : "") + ' /><strong class="task-title ' + (task.status === "done" ? "done" : "") + '">' + escapeHtml(task.title) + '</strong></label><button class="icon-button danger" data-delete-task="' + task.id + '" type="button" aria-label="Excluir tarefa">${icon("trash")}</button></div><p class="muted">' + escapeHtml(task.description || (task.due_date ? "Prazo: " + task.due_date : "Sem prazo definido")) + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma tarefa criada para este projeto.</p>';

        document.getElementById("projectNoteList").innerHTML = notes.length ? notes.map(function(note) {
          return '<article class="list-item"><div class="item-top"><strong>Nota do projeto</strong><div class="row"><button class="icon-button" data-edit-note="' + note.id + '" data-content="' + escapeHtml(note.content) + '" type="button" aria-label="Editar nota">${icon("save")}</button><button class="icon-button danger" data-delete-note="' + note.id + '" type="button" aria-label="Excluir nota">${icon("trash")}</button></div></div><p class="muted">' + escapeHtml(note.content) + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma nota salva.</p>';

        document.getElementById("projectFileList").innerHTML = files.length ? files.map(function(file) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(file.original_name || file.file_name || "Arquivo") + '</strong><button class="button" data-download-upload="' + file.id + '" data-file-name="' + escapeHtml(file.original_name || file.file_name || "arquivo") + '" type="button">Abrir</button></div><p class="muted">' + attachmentMeta(file) + '</p></article>';
        }).join("") : '<p class="muted">Nenhum arquivo vinculado a este projeto.</p>';

        document.getElementById("projectConversationList").innerHTML = conversations.length ? conversations.map(function(conversation) {
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(conversation.title || "Conversa") + '</strong><button class="button" data-open-conversation="' + conversation.id + '" type="button">Abrir</button></div><p class="muted">Atualizada em ' + escapeHtml(conversation.updated_at || "") + '</p></article>';
        }).join("") : '<p class="muted">Nenhuma conversa vinculada ainda.</p>';

        document.getElementById("projectHistoryList").innerHTML = history.length ? history.map(function(item) {
          const label = item.type === "task" ? "Tarefa" : item.type === "file" ? "Arquivo" : "Nota";
          return '<article class="list-item"><div class="item-top"><strong>' + label + '</strong><span class="muted">' + escapeHtml(item.updated_at || "") + '</span></div><p class="muted">' + escapeHtml(item.label || "") + '</p></article>';
        }).join("") : '<p class="muted">O histórico aparecerá conforme você criar tarefas, notas e arquivos.</p>';
      }

      async function selectProject(projectId) {
        selectedProject = projects.find(function(project) { return project.id === projectId; }) || null;
        if (!selectedProject) return;
        document.getElementById("projectDetailTitle").textContent = selectedProject.name;
        document.getElementById("projectDetailDescription").textContent = selectedProject.description || selectedProject.prompt || "Projeto criado na YARA AI.";
        document.getElementById("projectDetail").textContent = selectedProject.content || selectedProject.output || selectedProject.prompt || "";
        document.getElementById("projectWorkspace").hidden = false;
        const data = await api("/api/projects/" + selectedProject.id + "/details");
        renderProjectDetails(data);
        await loadProjectUploadOptions();
      }

      async function loadMemories() {
        const data = await api("/api/memories");
        const memories = data.memories || [];
        const target = document.getElementById("memoryList");
        if (!memories.length) {
          target.innerHTML = '<p class="muted">Nenhuma memória salva ainda.</p>';
          return;
        }
        target.innerHTML = memories.map(function(memory) {
          const badge = memory.readonly ? '<span class="status"><span class="dot"></span>Aprendido</span>' : "";
          const edit = memory.readonly ? "" : '<button class="icon-button" data-edit-memory="' + memory.id + '" data-title="' + escapeHtml(memory.title || "Memória") + '" data-content="' + escapeHtml(memory.content) + '" type="button" aria-label="Editar memória">${icon("save")}</button>';
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(memory.title || "Memória") + '</strong><div class="row">' + badge + edit + '<button class="icon-button danger" data-delete-memory="' + memory.id + '" type="button" aria-label="Excluir memória">${icon("trash")}</button></div></div><p class="muted">' + escapeHtml(memory.content) + '</p></article>';
        }).join("");
      }

      async function loadUploads() {
        const data = await api("/api/uploads");
        const uploads = data.uploads || [];
        const target = document.getElementById("uploadsList");
        const total = uploads.reduce(function(sum, item) { return sum + Number(item.file_size || 0); }, 0);
        document.getElementById("storageText").textContent = Math.round(total / 1024 / 1024 * 10) / 10 + " MB em arquivos enviados.";
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
        const raw = document.getElementById(fieldId).value.trim();
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
        const documents = documentData.documents || [];
        ["documentTemplate", "documentPageTemplate"].forEach(function(selectId) {
          const select = document.getElementById(selectId);
          if (!select || select.options.length) return;
          select.innerHTML = documentTemplates.map(function(template) {
            return '<option value="' + escapeHtml(template.id) + '">' + escapeHtml(template.label) + '</option>';
          }).join("");
        });
        renderDocumentList("documentsList", documents);
        renderDocumentList("documentsPageList", documents);
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
          return '<article class="list-item"><div class="item-top"><div><strong>' + escapeHtml(documentItem.title) + '</strong><p class="muted">' + escapeHtml(label || documentItem.template) + ' · ' + escapeHtml(String(documentItem.format).toUpperCase()) + ' · ' + size + '</p></div><div class="row"><button class="button" data-download-document="' + documentItem.id + '" data-file-name="' + escapeHtml(documentItem.file_name) + '" type="button">Baixar</button><button class="icon-button danger" data-delete-document="' + documentItem.id + '" type="button" aria-label="Excluir documento">${icon("trash")}</button></div></div></article>';
        }).join("");
      }

      async function createDocumentFromControls(config) {
        const title = document.getElementById(config.titleId).value.trim();
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
            template: document.getElementById(config.templateId).value,
            format: document.getElementById(config.formatId).value,
            fields: fields
          })
        });
        document.getElementById(config.titleId).value = "";
        await loadDocuments();
        await loadDashboard();
        showToast("Documento gerado com sucesso.");
      }

      async function handleDocumentListClick(event) {
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

      async function loadAiStatus() {
        const data = await api("/api/ai/status");
        document.getElementById("aiProvider").textContent = data.provider || "YARA";
        document.getElementById("aiModel").textContent = data.model || "Modelo ativo";
        document.getElementById("aiOnline").textContent = data.online ? "Online" : "Offline";
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
        document.getElementById("displayName").value = settings.display_name || (currentUser ? currentUser.name : "");
        document.getElementById("fullName").value = settings.full_name || (currentUser ? currentUser.name : "");
        document.getElementById("profileEmail").value = currentUser ? currentUser.email : "";
        document.getElementById("profilePhone").value = currentUser && currentUser.phone ? currentUser.phone : "";
        document.getElementById("avatarUrl").value = settings.avatar_url || "";
        document.getElementById("aiStyle").value = settings.ai_style || "balanced";
        document.getElementById("language").value = settings.language || "pt-BR";
        document.getElementById("responseLength").value = settings.response_length || "medium";
        applyVoiceSettings(settings);
        document.getElementById("settingsName").textContent = currentUser ? currentUser.name : "Usuário";
        document.getElementById("settingsEmail").textContent = currentUser ? currentUser.email : "Conta YARA";
        els.settingsAvatar.textContent = initials(currentUser ? currentUser.name : "YA");
      }

      async function refreshUser() {
        const data = await api("/api/auth/me");
        currentUser = data.user;
        els.accountName.textContent = data.user.name;
        els.accountAvatar.textContent = initials(data.user.name);
        els.accountEmail.textContent = data.user.email;
      }

      async function init() {
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
        button.addEventListener("click", function() { setView(button.dataset.view); });
      });
      document.body.addEventListener("click", function(event) {
        const target = event.target.closest("[data-view-target]");
        if (target) setView(target.dataset.viewTarget);
      });

      els.pinnedList.addEventListener("click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });
      els.conversationList.addEventListener("click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });

      document.getElementById("newConversationButton").addEventListener("click", newConversation);
      document.getElementById("refreshDashboardButton").addEventListener("click", loadDashboard);
      document.getElementById("view-dashboard").addEventListener("click", async function(event) {
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
      document.getElementById("chatForm").addEventListener("submit", sendMessage);
      document.getElementById("messageInput").addEventListener("input", autoGrowMessageInput);
      document.getElementById("messageInput").addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          document.getElementById("chatForm").requestSubmit();
        }
      });
      document.getElementById("mobileToggle").addEventListener("click", toggleSidebarDrawer);
      document.getElementById("quickSettingsButton").addEventListener("click", openQuickSettingsModal);
      document.getElementById("sidebarSettingsButton").addEventListener("click", function() { setView("settings"); });
      document.getElementById("helpButton").addEventListener("click", openHelpModal);
      document.getElementById("termsButton").addEventListener("click", openTermsModal);
      document.getElementById("chatMenuButton").addEventListener("click", toggleChatMenu);
      document.getElementById("attachButton").addEventListener("click", function() { els.attachMenu.classList.toggle("open"); });
      document.getElementById("webSearchToggle").addEventListener("click", function() {
        setWebSearchNext(!useWebSearchNext);
        showToast(useWebSearchNext ? "A próxima mensagem usará pesquisa online." : "Pesquisa online desativada.");
      });
      document.getElementById("dictationButton").addEventListener("click", toggleDictation);
      document.getElementById("conversationModeButton").addEventListener("click", function() {
        setConversationMode(!conversationMode);
      });
      document.getElementById("modalClose").addEventListener("click", closeModal);
      els.modalOverlay.addEventListener("click", function(event) { if (event.target === els.modalOverlay) closeModal(); });
      document.addEventListener("click", function(event) {
        if (!els.chatActionMenu.classList.contains("open")) return;
        if (event.target.closest("#chatActionMenu") || event.target.closest("#chatMenuButton")) return;
        closeChatMenu();
      });
      document.addEventListener("click", function(event) {
        if (!els.sidebar.classList.contains("open")) return;
        if (event.target.closest("#sidebar") || event.target.closest("#mobileToggle")) return;
        closeSidebarDrawer();
      });
      document.addEventListener("keydown", function(event) {
        if (event.key !== "Escape") return;
        closeChatMenu();
        closeSidebarDrawer();
        els.attachMenu.classList.remove("open");
      });
      els.attachmentPreview.addEventListener("click", function(event) {
        const button = event.target.closest("#removeAttachmentButton");
        if (!button) return;
        clearPendingAttachment();
        showToast("Anexo removido.");
      });
      els.messages.addEventListener("click", async function(event) {
        const promptButton = event.target.closest("[data-prompt]");
        if (promptButton) {
          els.messageInput.value = promptButton.dataset.prompt || "";
          autoGrowMessageInput();
          els.messageInput.focus();
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

        const button = event.target.closest("[data-download-upload]");
        if (!button) return;
        await downloadUpload(button.dataset.downloadUpload, button.dataset.fileName || "arquivo");
      });

      document.getElementById("chatActionMenu").addEventListener("click", async function(event) {
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

      document.getElementById("attachMenu").addEventListener("click", async function(event) {
        const item = event.target.closest("[data-action]");
        if (!item) return;
        openAttachmentPicker(item.dataset.action);
      });

      [els.fileInputImages, els.fileInputDocument, els.fileInputPdf, els.fileInputCamera].forEach(function(input) {
        input.addEventListener("change", function(event) {
          const file = event.target.files && event.target.files[0];
          setPendingAttachment(file);
          event.target.value = "";
        });
      });

      document.getElementById("modalBody").addEventListener("click", async function(event) {
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
        const projectButton = event.target.closest("[data-link-project]");
        if (!projectButton) return;
        await api("/api/conversations/" + currentConversationId + "/projects", {
          method: "POST",
          body: JSON.stringify({ projectId: projectButton.dataset.linkProject })
        });
        closeModal();
        showToast("Conversa adicionada ao projeto.");
      });

      document.getElementById("modalBody").addEventListener("submit", async function(event) {
        if (event.target && event.target.id === "quickSettingsForm") {
          event.preventDefault();
          await api("/api/settings", {
            method: "PATCH",
            body: JSON.stringify({
              language: document.getElementById("quickLanguage").value,
              aiStyle: document.getElementById("quickAiStyle").value,
              responseLength: document.getElementById("quickResponseLength").value,
              theme: "dark"
            })
          });
          closeModal();
          showToast("Configurações salvas.");
        }
      });

      document.getElementById("chatSearchInput").addEventListener("input", function(event) {
        const query = event.target.value.trim().toLowerCase();
        document.querySelectorAll(".message").forEach(function(node) {
          node.classList.toggle("hidden-by-search", query && !node.textContent.toLowerCase().includes(query));
        });
      });
      document.getElementById("closeSearchButton").addEventListener("click", function() {
        document.getElementById("chatSearchInput").value = "";
        document.getElementById("chatSearchRow").classList.remove("open");
        document.querySelectorAll(".message").forEach(function(node) { node.classList.remove("hidden-by-search"); });
      });

      document.getElementById("generatorForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const prompt = document.getElementById("generatorPrompt").value.trim();
        const type = document.getElementById("systemType").value;
        if (prompt.length < 8) return showToast("Descreva melhor o sistema que você quer criar.");
        const result = document.getElementById("generatorResult");
        result.textContent = "A YARA está estruturando o sistema...";
        try {
          const data = await api("/api/generator", {
            method: "POST",
            body: JSON.stringify({ type: type, prompt: prompt })
          });
          generatedProject = data.project;
          result.textContent = data.project.content || data.project.output;
          document.getElementById("generatorPrompt").value = "";
          showToast("Sistema gerado e salvo em Meus Projetos.");
        } catch (error) {
          result.textContent = "Não foi possível gerar agora.";
          showToast(error.message);
        }
      });

      document.getElementById("openGeneratedProject").addEventListener("click", async function() {
        if (!generatedProject) return showToast("Gere um projeto primeiro.");
        setView("projects");
        await loadProjects();
        await selectProject(generatedProject.id);
      });

      document.getElementById("continueGeneratedChat").addEventListener("click", async function() {
        if (!generatedProject) return showToast("Gere um projeto primeiro.");
        await newConversation();
        els.messageInput.value = "Vamos continuar o projeto " + generatedProject.name + ".";
        els.messageInput.focus();
      });

      document.getElementById("projectSearch").addEventListener("input", renderProjects);
      document.getElementById("projectList").addEventListener("click", function(event) {
        const button = event.target.closest("[data-open-project]");
        if (button) selectProject(button.dataset.openProject);
      });
      document.getElementById("projectTaskForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        if (!selectedProject) return showToast("Selecione um projeto.");
        const title = document.getElementById("projectTaskTitle").value.trim();
        const dueDate = document.getElementById("projectTaskDueDate").value;
        if (title.length < 2) return showToast("Informe uma tarefa válida.");
        await api("/api/projects/" + selectedProject.id + "/tasks", {
          method: "POST",
          body: JSON.stringify({ title: title, dueDate: dueDate || null })
        });
        event.currentTarget.reset();
        await selectProject(selectedProject.id);
        showToast("Tarefa adicionada.");
      });
      document.getElementById("projectTaskList").addEventListener("click", async function(event) {
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
        const deleteButton = event.target.closest("[data-delete-task]");
        if (!deleteButton) return;
        await api("/api/projects/" + selectedProject.id + "/tasks/" + deleteButton.dataset.deleteTask, { method: "DELETE" });
        await selectProject(selectedProject.id);
        showToast("Tarefa removida.");
      });
      document.getElementById("projectNoteForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        if (!selectedProject) return showToast("Selecione um projeto.");
        const content = document.getElementById("projectNoteContent").value.trim();
        if (content.length < 2) return showToast("Escreva uma nota válida.");
        await api("/api/projects/" + selectedProject.id + "/notes", {
          method: "POST",
          body: JSON.stringify({ content: content })
        });
        event.currentTarget.reset();
        await selectProject(selectedProject.id);
        showToast("Nota salva.");
      });
      document.getElementById("projectNoteList").addEventListener("click", async function(event) {
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
      document.getElementById("linkProjectFileButton").addEventListener("click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        const uploadId = document.getElementById("projectUploadSelect").value;
        if (!uploadId) return showToast("Envie um arquivo antes de vincular.");
        await api("/api/projects/" + selectedProject.id + "/files", {
          method: "POST",
          body: JSON.stringify({ uploadId: uploadId })
        });
        await selectProject(selectedProject.id);
        showToast("Arquivo vinculado ao projeto.");
      });
      document.getElementById("refreshProjectFilesButton").addEventListener("click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        await selectProject(selectedProject.id);
        showToast("Arquivos do projeto atualizados.");
      });
      document.getElementById("projectFileList").addEventListener("click", async function(event) {
        const button = event.target.closest("[data-download-upload]");
        if (button) await downloadUpload(button.dataset.downloadUpload, button.dataset.fileName || "arquivo");
      });
      document.getElementById("projectConversationList").addEventListener("click", async function(event) {
        const button = event.target.closest("[data-open-conversation]");
        if (!button) return;
        setView("chat");
        await openConversation(button.dataset.openConversation);
      });
      document.getElementById("continueProjectButton").addEventListener("click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        await newConversation();
        els.messageInput.value = "Quero continuar o projeto " + selectedProject.name + ".";
        els.messageInput.focus();
      });
      document.getElementById("deleteProjectButton").addEventListener("click", async function() {
        if (!selectedProject) return showToast("Selecione um projeto.");
        if (!window.confirm("Excluir este projeto?")) return;
        await api("/api/projects/" + selectedProject.id, { method: "DELETE" });
        selectedProject = null;
        currentProjectDetails = null;
        document.getElementById("projectDetailTitle").textContent = "Selecione um projeto";
        document.getElementById("projectDetailDescription").textContent = "Abra um projeto para ver detalhes, continuar no chat ou excluir.";
        document.getElementById("projectDetail").textContent = "Nenhum projeto selecionado.";
        document.getElementById("projectWorkspace").hidden = true;
        await loadProjects();
        showToast("Projeto excluído.");
      });

      document.getElementById("settingsTabs").addEventListener("click", function(event) {
        const button = event.target.closest("[data-settings-tab]");
        if (!button) return;
        selectSettingsTab(button.dataset.settingsTab);
      });

      document.getElementById("view-settings").addEventListener("click", async function(event) {
        const tabTarget = event.target.closest("[data-settings-tab-target]");
        if (tabTarget) {
          selectSettingsTab(tabTarget.dataset.settingsTabTarget);
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

      document.getElementById("profileForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const displayName = document.getElementById("displayName").value.trim();
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("profileEmail").value.trim();
        const phone = document.getElementById("profilePhone").value.trim();
        const avatarUrl = document.getElementById("avatarUrl").value.trim();
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

      document.getElementById("passwordForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        await api("/api/users/password", {
          method: "PATCH",
          body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword, confirmPassword: confirmPassword })
        });
        event.currentTarget.reset();
        showToast("Senha atualizada com segurança.");
      });

      document.getElementById("preferencesForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        await api("/api/settings", {
          method: "PATCH",
          body: JSON.stringify({
            aiStyle: document.getElementById("aiStyle").value,
            language: document.getElementById("language").value,
            responseLength: document.getElementById("responseLength").value,
            theme: "dark"
          })
        });
        showToast("Preferências salvas.");
      });

      document.getElementById("voiceForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const payload = {
          voiceEnabled: document.getElementById("voiceEnabled").checked,
          voiceLanguage: document.getElementById("voiceLanguage").value,
          voiceRate: Number(document.getElementById("voiceRate").value || 1),
          voicePitch: Number(document.getElementById("voicePitch").value || 1),
          voiceGender: document.getElementById("voiceGender").value,
          voiceAutoRead: document.getElementById("voiceAutoRead").checked
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

      document.getElementById("memoryForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const title = document.getElementById("memoryTitle").value.trim();
        const content = document.getElementById("memoryContent").value.trim();
        if (content.length < 2) return showToast("Escreva uma memória para salvar.");
        await api("/api/memories", {
          method: "POST",
          body: JSON.stringify({ title: title || undefined, content: content })
        });
        event.currentTarget.reset();
        await loadMemories();
        showToast("Memória salva.");
      });

      document.getElementById("memoryList").addEventListener("click", async function(event) {
        const editButton = event.target.closest("[data-edit-memory]");
        if (editButton) {
          const title = window.prompt("Editar título da memória", editButton.dataset.title || "Memória");
          if (title === null) return;
          const content = window.prompt("Editar conteúdo da memória", editButton.dataset.content || "");
          if (content === null) return;
          await api("/api/memories/" + editButton.dataset.editMemory, {
            method: "PATCH",
            body: JSON.stringify({ title: title, content: content })
          });
          await loadMemories();
          showToast("Memória atualizada.");
          return;
        }
        const button = event.target.closest("[data-delete-memory]");
        if (!button) return;
        await api("/api/memories/" + button.dataset.deleteMemory, { method: "DELETE" });
        await loadMemories();
        showToast("Memória removida.");
      });

      document.getElementById("clearMemoriesButton").addEventListener("click", async function() {
        if (!window.confirm("Limpar todas as memórias da YARA?")) return;
        await api("/api/memories", { method: "DELETE" });
        await loadMemories();
        showToast("Memórias limpas.");
      });

      document.getElementById("loadSessionsButton").addEventListener("click", function() {
        loadSessions("sessionList");
      });

      document.getElementById("logoutAllButton").addEventListener("click", async function() {
        const data = await api("/api/users/logout-all", { method: "POST" });
        showToast(data.message || "Sessões encerradas.");
      });

      document.getElementById("securitySessionsButton").addEventListener("click", function() {
        loadSessions("sessionList");
        selectSettingsTab("profile");
        showToast("Sessões carregadas na aba Perfil.");
      });

      document.getElementById("securityDevicesButton").addEventListener("click", function() {
        loadSessions("securityLoginHistory");
        showToast("Dispositivos conectados carregados.");
      });

      document.getElementById("savePreferredTechButton").addEventListener("click", async function() {
        const value = document.getElementById("preferredTech").value.trim();
        if (!value) return showToast("Informe as tecnologias preferidas.");
        await api("/api/memories", {
          method: "POST",
          body: JSON.stringify({ title: "Tecnologias preferidas", content: value })
        });
        document.getElementById("preferredTech").value = "";
        await loadMemories();
        showToast("Tecnologias preferidas salvas na memória.");
      });

      document.getElementById("manageFilesButton").addEventListener("click", function() {
        loadUploads();
        showToast("Arquivos atualizados.");
      });

      document.getElementById("uploadsList").addEventListener("click", async function(event) {
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

      document.getElementById("refreshDocumentsButton").addEventListener("click", async function() {
        await loadDocuments();
        showToast("Documentos atualizados.");
      });
      document.getElementById("refreshDocumentsPageButton").addEventListener("click", async function() {
        await loadDocuments();
        showToast("Documentos atualizados.");
      });

      document.getElementById("documentForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        await createDocumentFromControls({
          titleId: "documentTitle",
          templateId: "documentTemplate",
          formatId: "documentFormat",
          fieldsId: "documentFields"
        });
      });

      document.getElementById("documentPageForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        await createDocumentFromControls({
          titleId: "documentPageTitle",
          templateId: "documentPageTemplate",
          formatId: "documentPageFormat",
          fieldsId: "documentPageFields"
        });
      });
      document.getElementById("documentsList").addEventListener("click", handleDocumentListClick);
      document.getElementById("documentsPageList").addEventListener("click", handleDocumentListClick);

      document.getElementById("testAiButton").addEventListener("click", async function() {
        try {
          const data = await api("/api/ai/test", { method: "POST" });
          showToast("IA conectada: " + (data.model || "modelo ativo"));
          await loadAiStatus();
        } catch (error) {
          showToast(error.message);
        }
      });

      document.getElementById("logoutButton").addEventListener("click", function() {
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
  return `<button class="nav-button ${active ? "active" : ""}" data-view="${view}" type="button">${icon(iconName)}${label}</button>`;
}

function menuButton(action: string, label: string, iconName: IconName, danger = false) {
  return `<button class="menu-item ${danger ? "danger" : ""}" data-action="${action}" type="button">${icon(iconName)}${label}</button>`;
}

function settingsInfoCard(title: string, description: string, iconName: IconName) {
  return `<article class="card"><div class="item-top"><h2>${title}</h2><span class="avatar">${icon(iconName)}</span></div><p class="muted">${description}</p></article>`;
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
