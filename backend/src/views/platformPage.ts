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
        grid-template-columns: 304px minmax(0, 1fr);
      }

      .sidebar {
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 18px;
        border-right: 1px solid var(--line);
        padding: 18px;
        background: rgba(2, 6, 23, 0.76);
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
        gap: 14px;
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
        gap: 6px;
        overflow: auto;
        padding-right: 2px;
      }

      .conversation-button {
        min-height: 38px;
        font-size: 13px;
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
        min-height: 78px;
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
        padding-bottom: 18px;
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
        gap: 14px;
        overflow: auto;
        border: 1px solid var(--line);
        border-radius: 20px;
        padding: clamp(16px, 3vw, 26px);
        background:
          radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.06), transparent 32rem),
          rgba(8, 17, 32, 0.72);
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
        margin: 0 0 10px;
        font-size: clamp(30px, 5vw, 56px);
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
        max-width: min(780px, 88%);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 20px;
        padding: 14px 16px;
        background: rgba(15, 23, 42, 0.72);
        line-height: 1.65;
        white-space: pre-wrap;
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.16);
      }

      .message.user {
        align-self: flex-end;
        border-color: rgba(56, 189, 248, 0.35);
        background: linear-gradient(145deg, rgba(10, 132, 255, 0.28), rgba(15, 23, 42, 0.78));
      }

      .message.assistant {
        align-self: flex-start;
      }

      .message small {
        display: block;
        margin-bottom: 6px;
        color: #bae6fd;
        font-weight: 800;
      }

      .message-content {
        display: grid;
        gap: 10px;
      }

      .message-content p {
        margin: 0;
      }

      .message-content pre {
        overflow: auto;
        border: 1px solid rgba(56, 189, 248, 0.2);
        border-radius: 12px;
        padding: 12px;
        background: rgba(2, 6, 23, 0.72);
        white-space: pre;
      }

      .message-content code {
        border-radius: 6px;
        padding: 2px 5px;
        background: rgba(2, 6, 23, 0.62);
        color: #bae6fd;
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
        background: linear-gradient(180deg, rgba(8, 17, 32, 0), rgba(8, 17, 32, 0.94) 34%);
      }

      .composer {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
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
        max-height: 150px;
        resize: vertical;
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
        .settings-grid { grid-template-columns: 1fr; }
        .settings-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .inline-form { grid-template-columns: 1fr; }
      }

      @media (max-width: 860px) {
        body { overflow: auto; }
        .app-shell { min-height: 100vh; height: auto; grid-template-columns: 1fr; }
        .sidebar {
          position: sticky;
          top: 0;
          z-index: 30;
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }
        .mobile-toggle { display: inline-flex; }
        .sidebar-body { display: none; }
        .sidebar.open .sidebar-body { display: flex; }
        .main { min-height: calc(100vh - 84px); }
        .topbar { align-items: flex-start; flex-direction: column; }
        .topbar-title { align-items: flex-start; }
        .messages { min-height: calc(100dvh - 360px); }
      }

      @media (max-width: 640px) {
        .sidebar,
        .view,
        .topbar { padding: 14px; }
        .composer { grid-template-columns: auto minmax(0, 1fr); }
        .composer .primary-action { grid-column: 1 / -1; width: 100%; }
        .message { max-width: 100%; }
        .button { width: 100%; }
        .project-toolbar,
        .row { align-items: stretch; flex-direction: column; }
        .settings-hero { align-items: flex-start; flex-direction: column; }
        .settings-card-grid,
        .option-grid,
        .dashboard-grid { grid-template-columns: 1fr; }
        .quick-prompts { justify-content: stretch; }
        .quick-prompt { flex: 1 1 calc(50% - 9px); }
        .attachment-card,
        .attachment-preview { grid-template-columns: auto minmax(0, 1fr); }
        .attachment-card .button,
        .attachment-preview .icon-button { grid-column: 1 / -1; width: 100%; }
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
            ${navButton("chat", "Histórico", "history", true)}
            ${navButton("dashboard", "Dashboard", "sparkles")}
            ${navButton("generator", "Gerador de Sistemas", "code")}
            ${navButton("projects", "Projetos", "folder")}
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
            <button class="button danger" id="logoutButton" type="button">${icon("logout")}Sair</button>
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
            <div class="status"><span class="dot"></span>YARA Online</div>
            <button class="icon-button" id="chatMenuButton" type="button" aria-label="Ações da conversa">${icon("dots")}</button>
            <div class="floating-menu" id="chatActionMenu">
              ${menuButton("shareConversation", "Compartilhar conversa", "share")}
              ${menuButton("pinConversation", "Fixar conversa", "pin")}
              ${menuButton("projectConversation", "Adicionar ao projeto", "folder")}
              ${menuButton("filesConversation", "Arquivos enviados", "file")}
              ${menuButton("searchConversation", "Buscar no chat", "search")}
              ${menuButton("topConversation", "Adicionar ao início", "arrowUp")}
              ${menuButton("archiveConversation", "Arquivar conversa", "archive")}
              ${menuButton("deleteConversation", "Excluir conversa", "trash", true)}
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
              <div class="empty-brand">${renderLogoYara({ variant: "icon", className: "logo-yara--auth" })}</div>
              <h2>Olá! Eu sou a YARA.</h2>
              <p>Posso conversar com você, responder perguntas, ajudar nos estudos, criar textos, analisar ideias, organizar projetos, pesquisar quando necessário e também criar sistemas quando você quiser.</p>
              <div class="quick-prompts" data-quick-prompts>
                <button class="quick-prompt" data-prompt="Pergunte qualquer coisa" type="button">Pergunte qualquer coisa</button>
                <button class="quick-prompt" data-prompt="Crie um texto curto sobre uma ideia importante" type="button">Criar um texto</button>
                <button class="quick-prompt" data-prompt="Me ajude a estudar um assunto" type="button">Me ajude a estudar</button>
                <button class="quick-prompt" data-prompt="Organize esta ideia comigo" type="button">Organizar uma ideia</button>
                <button class="quick-prompt" data-prompt="Analise o arquivo que vou anexar" type="button">Analisar um arquivo</button>
                <button class="quick-prompt" data-prompt="Pesquise na internet sobre este assunto" type="button">Pesquisar na internet</button>
                <button class="quick-prompt" data-prompt="Vamos continuar um assunto anterior" type="button">Continuar um assunto</button>
              </div>
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
            <form class="composer" id="chatForm">
              <button class="icon-button" id="attachButton" type="button" aria-label="Anexar arquivo">${icon("paperclip")}</button>
              <textarea id="messageInput" placeholder="Digite sua mensagem..." rows="1" autocomplete="off"></textarea>
              <button class="primary-action" type="submit" aria-label="Enviar mensagem">${icon("send")}Enviar</button>
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
              <button class="tab" data-settings-tab="notifications" type="button">Notificações</button>
              <button class="tab" data-settings-tab="security" type="button">Segurança</button>
              <button class="tab" data-settings-tab="appearance" type="button">Aparência</button>
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

      function renderMarkdown(value) {
        let html = escapeHtml(value || "");
        const tick = String.fromCharCode(96);
        const fence = tick + tick + tick;
        html = html.replace(new RegExp(fence + "([\\\\s\\\\S]*?)" + fence, "g"), function(_, code) {
          return '<pre><code>' + code.trim() + '</code></pre>';
        });
        html = html.replace(new RegExp(tick + "([^" + tick + "]+)" + tick, "g"), '<code>$1</code>');
        html = html.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>');
        html = html.split(/\\n{2,}/).map(function(block) {
          return block.startsWith("<pre>") ? block : '<p>' + block.replace(/\\n/g, "<br />") + '</p>';
        }).join("");
        return html;
      }

      function emptyChatHtml() {
        const prompts = [
          ["Pergunte qualquer coisa", "Pergunte qualquer coisa"],
          ["Criar um texto", "Faça um texto de aniversário"],
          ["Me ajude a estudar", "Explique a Revolução Baiana"],
          ["Organizar uma ideia", "Organize uma escala de trabalho"],
          ["Analisar um arquivo", "Analise o arquivo que vou anexar"],
          ["Pesquisar na internet", "Pesquise na internet sobre este assunto"],
          ["Continuar um assunto", "Vamos continuar um assunto anterior"]
        ];

        return '<div class="empty-chat"><h2>Olá! Eu sou a YARA.</h2><p>Posso conversar com você, responder perguntas, ajudar nos estudos, criar textos, analisar ideias, organizar projetos, pesquisar quando necessário e também criar sistemas quando você quiser.</p><div class="quick-prompts">' + prompts.map(function(item) {
          return '<button class="quick-prompt" data-prompt="' + escapeHtml(item[1]) + '" type="button">' + escapeHtml(item[0]) + '</button>';
        }).join("") + '</div></div>';
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

      function setView(view) {
        if (view === "memory") {
          view = "settings";
          window.setTimeout(function() { selectSettingsTab("memory"); }, 0);
        }
        document.querySelectorAll(".view").forEach(function(item) {
          item.hidden = item.id !== "view-" + view;
        });
        document.querySelectorAll(".nav-button").forEach(function(item) {
          item.classList.toggle("active", item.dataset.view === view);
        });
        const labels = {
          chat: ["YARA AI", "Converse com a YARA, pergunte qualquer coisa e organize ideias, estudos, trabalho e projetos."],
          dashboard: ["Dashboard", "Veja sua atividade real, projetos recentes, arquivos e tarefas pendentes."],
          generator: ["Gerador de Sistemas", "Crie sistemas completos e salve automaticamente como projeto."],
          projects: ["Meus Projetos", "Organize, busque e continue projetos com a YARA."],
          settings: ["Configurações", "Perfil, segurança, preferências e memória da YARA."]
        };
        els.pageTitle.textContent = labels[view][0];
        els.pageSubtitle.textContent = labels[view][1];
        els.sidebar.classList.remove("open");
        els.chatActionMenu.classList.remove("open");
        els.attachMenu.classList.remove("open");
        if (view === "dashboard") loadDashboard();
        if (view === "projects") loadProjects();
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
        if (tabName === "ai") loadAiStatus();
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

      function renderConversations() {
        const pinned = conversations.filter(function(item) { return Number(item.is_pinned) === 1; });
        const history = conversations.filter(function(item) { return Number(item.is_pinned) !== 1; });
        renderConversationGroup(els.pinnedList, pinned, "Nenhuma conversa fixada.");
        renderConversationGroup(els.conversationList, history, "Nenhuma conversa ainda.");
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
        try {
          const blob = await fetchProtectedFile("/api/uploads/" + uploadId + "/download");
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName || "arquivo";
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        } catch (error) {
          showToast(error.message || "Não foi possível abrir este arquivo.");
        }
      }

      function findMessage(messageId) {
        return currentMessages.find(function(message) { return message.id === messageId; });
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
          return;
        }
        els.messages.innerHTML = currentMessages.map(function(message) {
          const who = message.role === "user" ? "Você" : "YARA";
          const id = escapeHtml(message.id || "");
          const uploads = message.uploads && message.uploads.length
            ? '<div class="message-attachments">' + message.uploads.map(renderAttachment).join("") + '</div>'
            : "";
          const edited = message.edited_at ? '<span class="muted"> · editada</span>' : "";
          const actions = '<div class="message-actions"><button class="message-action" data-copy-message="' + id + '" type="button">Copiar</button>' +
            (message.role === "user" && id ? '<button class="message-action" data-edit-message="' + id + '" type="button">Editar</button>' : "") +
            (message.role === "assistant" && id ? '<button class="message-action" data-regenerate-message="' + id + '" type="button">Regenerar</button><button class="message-action ' + (message.feedback === "like" ? "active" : "") + '" data-feedback-message="' + id + '" data-feedback-value="like" type="button">Curtir</button><button class="message-action ' + (message.feedback === "dislike" ? "active" : "") + '" data-feedback-message="' + id + '" data-feedback-value="dislike" type="button">Não curtir</button>' : "") +
            '</div>';
          return '<article class="message ' + message.role + '" data-message-id="' + id + '"><small>' + who + edited + '</small><div class="message-content">' + renderMarkdown(message.content) + '</div>' + uploads + actions + '</article>';
        }).join("");
        hydrateProtectedImages();
        els.messages.scrollTop = els.messages.scrollHeight;
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

        renderMessages(baseMessages.concat([
          { role: "user", content: userMessageText || "Anexo enviado.", uploads: [] },
          { role: "assistant", content: "" }
        ]));

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
              renderMessages(baseMessages.concat([
                { role: "user", content: userMessageText || "Anexo enviado.", uploads: [] },
                { role: "assistant", content: assistantText }
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
        const message = els.messageInput.value.trim();
        if (!message && !pendingAttachment) return;
        els.messageInput.value = "";
        const baseMessages = currentMessages.slice();
        try {
          const upload = await uploadPendingAttachment();
          const payload = {
            conversationId: currentConversationId || undefined,
            message: message,
            uploadIds: upload ? [upload.id] : []
          };
          const data = await streamChat(payload, baseMessages, message);
          currentConversationId = data.conversationId;
          const conversation = await api("/api/conversations/" + currentConversationId);
          currentConversation = conversation.conversation;
          renderMessages(conversation.messages || []);
          await loadConversations();
        } catch (error) {
          const text = error.message || "Não foi possível enviar este arquivo.";
          showToast(text);
          if (currentConversationId) {
            const conversation = await api("/api/conversations/" + currentConversationId).catch(function() { return { messages: [] }; });
            renderMessages(conversation.messages || []);
          } else {
            renderMessages([]);
          }
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

      async function loadAiStatus() {
        const data = await api("/api/ai/status");
        document.getElementById("aiProvider").textContent = data.provider || "YARA";
        document.getElementById("aiModel").textContent = data.model || "Modelo ativo";
        document.getElementById("aiOnline").textContent = data.online ? "Online" : "Offline";
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
          setView("chat");
          await loadConversations();
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
      document.getElementById("messageInput").addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          document.getElementById("chatForm").requestSubmit();
        }
      });
      document.getElementById("mobileToggle").addEventListener("click", function() { els.sidebar.classList.toggle("open"); });
      document.getElementById("chatMenuButton").addEventListener("click", function() { els.chatActionMenu.classList.toggle("open"); });
      document.getElementById("attachButton").addEventListener("click", function() { els.attachMenu.classList.toggle("open"); });
      document.getElementById("modalClose").addEventListener("click", closeModal);
      els.modalOverlay.addEventListener("click", function(event) { if (event.target === els.modalOverlay) closeModal(); });
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
          els.messageInput.focus();
          return;
        }

        const copyButton = event.target.closest("[data-copy-message]");
        if (copyButton) {
          await copyMessage(copyButton.dataset.copyMessage);
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
        els.chatActionMenu.classList.remove("open");
        if (action === "shareConversation") await shareConversation();
        if (action === "pinConversation") await pinConversation();
        if (action === "projectConversation") await showProjectPicker();
        if (action === "filesConversation") await showConversationFiles();
        if (action === "searchConversation") toggleSearch();
        if (action === "topConversation") await moveConversationTop();
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
        localStorage.removeItem("yaraToken");
        localStorage.removeItem("yaraUser");
        window.location.href = "/";
      });

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
