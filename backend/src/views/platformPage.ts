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

      .message.hidden-by-search {
        display: none;
      }

      .composer-wrap {
        position: relative;
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

      @media (max-width: 1060px) {
        .layout-grid,
        .settings-grid { grid-template-columns: 1fr; }
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
      }

      @media (max-width: 620px) {
        .sidebar,
        .view,
        .topbar { padding: 14px; }
        .composer { grid-template-columns: auto minmax(0, 1fr); }
        .composer .primary-action { grid-column: 1 / -1; width: 100%; }
        .message { max-width: 100%; }
        .button { width: 100%; }
        .project-toolbar,
        .row { align-items: stretch; flex-direction: column; }
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
            ${navButton("generator", "Gerador de Sistemas", "code")}
            ${navButton("projects", "Projetos", "folder")}
            ${navButton("settings", "Configurações", "settings")}
          </nav>
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
              ${menuButton("peopleConversation", "Adicionar pessoas", "users")}
              ${menuButton("projectConversation", "Adicionar ao projeto", "folder")}
              ${menuButton("filesConversation", "Arquivos enviados", "file")}
              ${menuButton("searchConversation", "Buscar no chat", "search")}
              ${menuButton("topConversation", "Adicionar ao início", "arrowUp")}
              ${menuButton("archiveConversation", "Arquivar conversa", "archive")}
              ${menuButton("deleteConversation", "Excluir conversa", "trash", true)}
            </div>
          </div>
        </header>

        <section class="view chat-view" id="view-chat">
          <div class="search-row" id="chatSearchRow">
            <input class="field" id="chatSearchInput" placeholder="Buscar nesta conversa..." />
            <button class="button" id="closeSearchButton" type="button">Fechar</button>
          </div>
          <div class="messages" id="messages">
            <div class="empty-chat">
              <div class="empty-brand">${renderLogoYara({ variant: "icon", className: "logo-yara--auth" })}</div>
              <h2>Como posso ajudar hoje?</h2>
              <p>Converse com a YARA, gere sistemas, conecte ideias a projetos e mantenha seu histórico organizado.</p>
            </div>
          </div>
          <div class="composer-wrap">
            <div class="attach-menu" id="attachMenu">
              ${menuButton("attachGallery", "Foto da galeria", "image")}
              ${menuButton("attachImage", "Imagem", "image")}
              ${menuButton("attachDocument", "Documento/PDF", "file")}
              ${menuButton("attachCamera", "Câmera", "camera")}
            </div>
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
            <h2>Configurações</h2>
            <div class="tabs" id="settingsTabs">
              <button class="tab active" data-settings-tab="profile" type="button">Perfil</button>
              <button class="tab" data-settings-tab="account" type="button">Conta</button>
              <button class="tab" data-settings-tab="security" type="button">Segurança</button>
              <button class="tab" data-settings-tab="preferences" type="button">Preferências da YARA</button>
              <button class="tab" data-settings-tab="memory" type="button">Memória</button>
            </div>

            <div class="settings-pane settings-grid" id="settings-profile">
              <form class="card" id="profileForm">
                <h2>Perfil</h2>
                <input class="field" id="displayName" placeholder="Como você quer ser chamado?" />
                <input class="field" id="fullName" placeholder="Nome completo" />
                <input class="field" id="profileEmail" placeholder="E-mail" type="email" />
                <input class="field" id="profilePhone" placeholder="Telefone opcional" />
                <input class="field" id="avatarUrl" placeholder="Avatar/foto de perfil (URL futura)" />
                <button class="primary-action" type="submit">${icon("save")}Salvar perfil</button>
              </form>
              <article class="card">
                <h2>Identidade da conta</h2>
                <div class="account-row">
                  <span class="avatar" id="settingsAvatar">YA</span>
                  <div>
                    <strong id="settingsName">Usuário</strong>
                    <p class="muted" id="settingsEmail">Conta YARA</p>
                  </div>
                </div>
              </article>
            </div>

            <div class="settings-pane settings-grid" id="settings-account" hidden>
              <article class="card">
                <h2>Conta</h2>
                <p class="muted">Altere e-mail e telefone pela aba Perfil. Exclusão de conta será preparada em uma próxima etapa com confirmação reforçada.</p>
              </article>
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
                <p class="muted">A YARA nunca mostra sua senha atual e o backend salva a nova senha com criptografia.</p>
              </article>
            </div>

            <div class="settings-pane settings-grid" id="settings-preferences" hidden>
              <form class="card" id="preferencesForm">
                <h2>Preferências da YARA</h2>
                <select class="select" id="aiStyle">
                  <option value="balanced">Equilibrada</option>
                  <option value="direct">Direta</option>
                  <option value="technical">Técnica</option>
                  <option value="creative">Criativa</option>
                </select>
                <select class="select" id="language">
                  <option value="pt-BR">Português</option>
                  <option value="en-US">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>
                <select class="select" id="responseLength">
                  <option value="short">Curta</option>
                  <option value="medium">Média</option>
                  <option value="detailed">Detalhada</option>
                </select>
                <button class="primary-action" type="submit">${icon("save")}Salvar preferências</button>
              </form>
            </div>

            <div class="settings-pane settings-grid" id="settings-memory" hidden>
              <form class="card" id="memoryForm">
                <h2>Memória da YARA</h2>
                <p class="muted">A YARA usa essas informações para personalizar respostas.</p>
                <input class="field" id="memoryTitle" placeholder="Título opcional" />
                <textarea class="field" id="memoryContent" rows="5" placeholder="O que a YARA deve lembrar?"></textarea>
                <button class="primary-action" type="submit">${icon("plus")}Adicionar memória</button>
              </form>
              <article class="card">
                <h2>Memórias salvas</h2>
                <div class="list" id="memoryList"></div>
              </article>
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

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
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
        document.querySelectorAll(".view").forEach(function(item) {
          item.hidden = item.id !== "view-" + view;
        });
        document.querySelectorAll(".nav-button").forEach(function(item) {
          item.classList.toggle("active", item.dataset.view === view);
        });
        const labels = {
          chat: ["YARA AI", "Chat inteligente com histórico, anexos e ações avançadas."],
          generator: ["Gerador de Sistemas", "Crie sistemas completos e salve automaticamente como projeto."],
          projects: ["Meus Projetos", "Organize, busque e continue projetos com a YARA."],
          settings: ["Configurações", "Perfil, segurança, preferências e memória da YARA."]
        };
        els.pageTitle.textContent = labels[view][0];
        els.pageSubtitle.textContent = labels[view][1];
        els.sidebar.classList.remove("open");
        els.chatActionMenu.classList.remove("open");
        els.attachMenu.classList.remove("open");
        if (view === "projects") loadProjects();
        if (view === "settings") loadSettings();
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

      function renderMessages(messages) {
        currentMessages = messages || [];
        if (!currentMessages.length) {
          els.messages.innerHTML = '<div class="empty-chat"><h2>Como posso ajudar hoje?</h2><p>Envie uma mensagem para começar uma nova conversa com a YARA.</p></div>';
          return;
        }
        els.messages.innerHTML = currentMessages.map(function(message) {
          const who = message.role === "user" ? "Você" : "YARA";
          return '<article class="message ' + message.role + '"><small>' + who + '</small>' + escapeHtml(message.content) + '</article>';
        }).join("");
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

      async function sendMessage(event) {
        event.preventDefault();
        const message = els.messageInput.value.trim();
        if (!message) return;
        els.messageInput.value = "";
        renderMessages(currentMessages.concat([{ role: "user", content: message }, { role: "assistant", content: "YARA está pensando..." }]));
        try {
          const data = await api("/api/chat", {
            method: "POST",
            body: JSON.stringify({ conversationId: currentConversationId || undefined, message: message })
          });
          currentConversationId = data.conversationId;
          const conversation = await api("/api/conversations/" + currentConversationId);
          currentConversation = conversation.conversation;
          renderMessages(conversation.messages || []);
          await loadConversations();
        } catch (error) {
          showToast(error.message);
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
        openModal("Arquivos enviados", "Anexos preparados para esta conversa.", files.length ? files.map(function(file) {
          return '<article class="list-item"><strong>' + escapeHtml(file.file_name) + '</strong><p class="muted">' + escapeHtml(file.file_type) + " · " + Math.ceil(file.file_size / 1024) + ' KB</p></article>';
        }).join("") : '<p class="muted">Nenhum arquivo preparado nesta conversa.</p>');
      }

      async function showProjectPicker() {
        if (!currentConversationId) return showToast("Selecione uma conversa.");
        await loadProjects(false);
        openModal("Adicionar ao projeto", "Escolha um projeto para conectar esta conversa.", projects.length ? projects.map(function(project) {
          return '<button class="menu-item" data-link-project="' + project.id + '" type="button">${icon("folder")}' + escapeHtml(project.name) + '</button>';
        }).join("") : '<p class="muted">Nenhum projeto disponível.</p>');
      }

      function showPeopleModal() {
        openModal("Adicionar pessoas", "Colaboração será ativada em uma próxima etapa.", '<div class="card"><p class="muted">Convide membros, defina papéis e acompanhe colaboração em conversas compartilhadas.</p></div>');
      }

      function toggleSearch() {
        document.getElementById("chatSearchRow").classList.add("open");
        document.getElementById("chatSearchInput").focus();
      }

      async function prepareUpload(kind) {
        await ensureConversation();
        const samples = {
          gallery: { fileName: "foto-da-galeria.jpg", fileType: "image/jpeg", fileSize: 480000 },
          image: { fileName: "imagem-yara.png", fileType: "image/png", fileSize: 520000 },
          document: { fileName: "documento.pdf", fileType: "application/pdf", fileSize: 840000 },
          camera: { fileName: "camera-yara.jpg", fileType: "image/jpeg", fileSize: 460000 }
        };
        const file = samples[kind];
        await api("/api/uploads", {
          method: "POST",
          body: JSON.stringify(Object.assign({ conversationId: currentConversationId }, file))
        });
        els.attachMenu.classList.remove("open");
        showToast("Anexo preparado com validação segura. Storage real será conectado na próxima etapa.");
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

      function selectProject(projectId) {
        selectedProject = projects.find(function(project) { return project.id === projectId; }) || null;
        if (!selectedProject) return;
        document.getElementById("projectDetailTitle").textContent = selectedProject.name;
        document.getElementById("projectDetailDescription").textContent = selectedProject.description || selectedProject.prompt || "Projeto criado na YARA AI.";
        document.getElementById("projectDetail").textContent = selectedProject.content || selectedProject.output || selectedProject.prompt || "";
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
          return '<article class="list-item"><div class="item-top"><strong>' + escapeHtml(memory.title || "Memória") + '</strong><button class="icon-button danger" data-delete-memory="' + memory.id + '" type="button" aria-label="Excluir memória">${icon("trash")}</button></div><p class="muted">' + escapeHtml(memory.content) + '</p></article>';
        }).join("");
      }

      async function loadSettings() {
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
        await loadMemories();
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

      els.pinnedList.addEventListener("click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });
      els.conversationList.addEventListener("click", function(event) {
        const button = event.target.closest("[data-conversation]");
        if (button) openConversation(button.dataset.conversation);
      });

      document.getElementById("newConversationButton").addEventListener("click", newConversation);
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

      document.getElementById("chatActionMenu").addEventListener("click", async function(event) {
        const item = event.target.closest("[data-action]");
        if (!item) return;
        const action = item.dataset.action;
        els.chatActionMenu.classList.remove("open");
        if (action === "shareConversation") await shareConversation();
        if (action === "pinConversation") await pinConversation();
        if (action === "peopleConversation") showPeopleModal();
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
        if (item.dataset.action === "attachGallery") await prepareUpload("gallery");
        if (item.dataset.action === "attachImage") await prepareUpload("image");
        if (item.dataset.action === "attachDocument") await prepareUpload("document");
        if (item.dataset.action === "attachCamera") await prepareUpload("camera");
      });

      document.getElementById("modalBody").addEventListener("click", async function(event) {
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
        selectProject(generatedProject.id);
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
        document.getElementById("projectDetailTitle").textContent = "Selecione um projeto";
        document.getElementById("projectDetail").textContent = "Nenhum projeto selecionado.";
        await loadProjects();
        showToast("Projeto excluído.");
      });

      document.getElementById("settingsTabs").addEventListener("click", function(event) {
        const button = event.target.closest("[data-settings-tab]");
        if (!button) return;
        document.querySelectorAll(".tab").forEach(function(tab) { tab.classList.toggle("active", tab === button); });
        document.querySelectorAll(".settings-pane").forEach(function(pane) { pane.hidden = pane.id !== "settings-" + button.dataset.settingsTab; });
        if (button.dataset.settingsTab === "memory") loadMemories();
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
        const button = event.target.closest("[data-delete-memory]");
        if (!button) return;
        await api("/api/memories/" + button.dataset.deleteMemory, { method: "DELETE" });
        await loadMemories();
        showToast("Memória removida.");
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

type IconName =
  | "archive"
  | "arrowUp"
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
