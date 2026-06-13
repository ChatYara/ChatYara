export function renderLandingPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="YARA AI é a plataforma oficial de inteligência artificial para conversar, criar sistemas, organizar projetos e acelerar ideias."
    />
    <title>YARA AI | Plataforma oficial</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #020617;
        --bg-soft: #07182f;
        --panel: rgba(15, 23, 42, 0.72);
        --panel-strong: rgba(2, 6, 23, 0.84);
        --line: rgba(125, 211, 252, 0.26);
        --line-strong: rgba(56, 189, 248, 0.54);
        --text: #f0f9ff;
        --muted: #9fb2c8;
        --soft: #dbeafe;
        --neon: #38bdf8;
        --neon-strong: #7dd3fc;
        --ok: #34d399;
        --warning: #a5f3fc;
        --shadow: rgba(56, 189, 248, 0.24);
        --radius: 8px;
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 18% 8%, rgba(14, 165, 233, 0.24), transparent 30rem),
          radial-gradient(circle at 86% 18%, rgba(37, 99, 235, 0.18), transparent 32rem),
          radial-gradient(circle at 48% 92%, rgba(8, 145, 178, 0.14), transparent 34rem),
          linear-gradient(140deg, #020617 0%, #06162b 46%, #020617 100%);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        overflow-x: hidden;
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(rgba(125, 211, 252, 0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(125, 211, 252, 0.045) 1px, transparent 1px);
        background-size: 54px 54px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent 78%);
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .shell {
        width: min(1180px, calc(100% - 36px));
        margin: 0 auto;
      }

      .site-header {
        position: sticky;
        top: 0;
        z-index: 20;
        border-bottom: 1px solid rgba(125, 211, 252, 0.12);
        background: rgba(2, 6, 23, 0.78);
        backdrop-filter: blur(18px);
      }

      .nav {
        min-height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .brand,
      .footer-brand {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-weight: 900;
        letter-spacing: 0;
      }

      .brand-mark {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border: 1px solid var(--line-strong);
        border-radius: 10px;
        color: #e0f2fe;
        background: linear-gradient(145deg, rgba(56, 189, 248, 0.28), rgba(15, 23, 42, 0.88));
        box-shadow: 0 0 24px var(--shadow), inset 0 0 18px rgba(125, 211, 252, 0.12);
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 22px;
        color: var(--muted);
        font-size: 14px;
        font-weight: 700;
      }

      .nav-links a:hover {
        color: var(--neon-strong);
      }

      .button {
        min-height: 46px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 1px solid rgba(125, 211, 252, 0.42);
        border-radius: var(--radius);
        padding: 12px 18px;
        color: #e0f2fe;
        font-size: 14px;
        font-weight: 900;
        background: rgba(14, 165, 233, 0.14);
        box-shadow: 0 0 28px rgba(56, 189, 248, 0.18);
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }

      .button:hover {
        transform: translateY(-2px);
        border-color: rgba(125, 211, 252, 0.82);
        background: rgba(14, 165, 233, 0.22);
      }

      .button.primary {
        color: #00111f;
        border-color: rgba(125, 211, 252, 0.9);
        background: linear-gradient(135deg, #7dd3fc, #38bdf8);
        box-shadow: 0 0 34px rgba(56, 189, 248, 0.34);
      }

      .hero {
        min-height: calc(100vh - 76px);
        display: grid;
        grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1.08fr);
        align-items: center;
        gap: clamp(28px, 5vw, 68px);
        padding: clamp(42px, 7vw, 84px) 0 62px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 22px;
        padding: 8px 12px;
        border: 1px solid rgba(52, 211, 153, 0.34);
        border-radius: 999px;
        color: #bbf7d0;
        background: rgba(6, 78, 59, 0.28);
        font-size: 13px;
        font-weight: 900;
      }

      .dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: var(--ok);
        box-shadow: 0 0 18px var(--ok);
        animation: pulse 1.9s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.35);
          opacity: 0.72;
        }
      }

      h1,
      h2,
      h3,
      p {
        margin-top: 0;
      }

      h1 {
        margin-bottom: 18px;
        font-size: clamp(64px, 11vw, 132px);
        line-height: 0.86;
        letter-spacing: 0;
        color: #f8fbff;
        text-shadow: 0 0 36px rgba(56, 189, 248, 0.38);
      }

      .hero-kicker {
        margin-bottom: 18px;
        color: #bae6fd;
        font-size: clamp(26px, 4vw, 48px);
        line-height: 1.02;
        font-weight: 900;
        letter-spacing: 0;
      }

      .hero-copy {
        max-width: 660px;
        color: var(--muted);
        font-size: clamp(17px, 2vw, 20px);
        line-height: 1.72;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-top: 34px;
      }

      .hero-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 34px;
      }

      .metric {
        min-height: 88px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        border-radius: var(--radius);
        padding: 14px;
        background: rgba(15, 23, 42, 0.5);
      }

      .metric strong {
        display: block;
        color: #e0f2fe;
        font-size: 22px;
      }

      .metric span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .chat-stage {
        position: relative;
      }

      .glow-frame {
        position: absolute;
        inset: -18px;
        border-radius: 28px;
        background:
          radial-gradient(circle at 30% 16%, rgba(125, 211, 252, 0.2), transparent 22rem),
          linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(37, 99, 235, 0.04));
        filter: blur(2px);
        opacity: 0.9;
      }

      .chat-mockup {
        position: relative;
        min-height: 560px;
        display: grid;
        grid-template-columns: 178px minmax(0, 1fr);
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(2, 6, 23, 0.76);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.36), 0 0 42px rgba(56, 189, 248, 0.18);
        backdrop-filter: blur(20px);
        animation: floatCard 6s ease-in-out infinite;
      }

      @keyframes floatCard {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }

      .mock-sidebar {
        border-right: 1px solid rgba(125, 211, 252, 0.16);
        padding: 18px;
        background: rgba(15, 23, 42, 0.58);
      }

      .mock-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 22px;
        color: #e0f2fe;
        font-weight: 900;
      }

      .mock-dot {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        color: #03111f;
        background: #7dd3fc;
        font-size: 12px;
        font-weight: 950;
      }

      .side-item {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 42px;
        margin-bottom: 8px;
        border: 1px solid rgba(125, 211, 252, 0.1);
        border-radius: var(--radius);
        padding: 10px;
        color: var(--muted);
        background: rgba(2, 6, 23, 0.28);
        font-size: 12px;
        font-weight: 800;
      }

      .side-item.active {
        color: #e0f2fe;
        border-color: rgba(125, 211, 252, 0.34);
        background: rgba(14, 165, 233, 0.16);
      }

      .side-icon,
      .feature-icon {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 8px;
        border: 1px solid rgba(125, 211, 252, 0.22);
        color: #bae6fd;
        background: rgba(14, 165, 233, 0.12);
        font-size: 12px;
        font-weight: 950;
      }

      .mock-chat {
        min-width: 0;
        display: flex;
        flex-direction: column;
        padding: 20px;
      }

      .mock-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 22px;
      }

      .mock-title {
        min-width: 0;
      }

      .mock-title strong {
        display: block;
        color: #f0f9ff;
      }

      .mock-title span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .mini-status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        border: 1px solid rgba(52, 211, 153, 0.28);
        border-radius: 999px;
        padding: 7px 10px;
        color: #bbf7d0;
        background: rgba(6, 78, 59, 0.24);
        font-size: 12px;
        font-weight: 900;
      }

      .message {
        max-width: 84%;
        margin-bottom: 14px;
        border: 1px solid rgba(125, 211, 252, 0.16);
        border-radius: 14px;
        padding: 14px;
        color: #dbeafe;
        line-height: 1.55;
        background: rgba(15, 23, 42, 0.58);
      }

      .message.user {
        align-self: flex-end;
        border-color: rgba(125, 211, 252, 0.3);
        background: rgba(14, 165, 233, 0.16);
      }

      .message small {
        display: block;
        margin-bottom: 7px;
        color: #7dd3fc;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .fake-input {
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-top: auto;
        border: 1px solid rgba(125, 211, 252, 0.22);
        border-radius: 14px;
        padding: 10px 10px 10px 16px;
        color: #64748b;
        background: rgba(2, 6, 23, 0.72);
      }

      .send-button {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 10px;
        color: #00111f;
        background: linear-gradient(135deg, #7dd3fc, #38bdf8);
        font-weight: 950;
      }

      section {
        padding: clamp(54px, 8vw, 96px) 0;
      }

      .section-heading {
        max-width: 780px;
        margin-bottom: 34px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        color: #7dd3fc;
        font-size: 13px;
        font-weight: 950;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h2 {
        margin-bottom: 16px;
        color: #f8fbff;
        font-size: clamp(34px, 5vw, 58px);
        line-height: 1;
        letter-spacing: 0;
      }

      .section-heading p,
      .security-copy p,
      .cta p {
        color: var(--muted);
        font-size: 18px;
        line-height: 1.72;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .card {
        min-height: 194px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        border-radius: var(--radius);
        padding: 20px;
        background: rgba(15, 23, 42, 0.56);
        box-shadow: 0 16px 42px rgba(0, 0, 0, 0.22);
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }

      .card:hover {
        transform: translateY(-6px);
        border-color: rgba(125, 211, 252, 0.62);
        background: rgba(15, 23, 42, 0.76);
      }

      .card h3 {
        margin: 16px 0 8px;
        color: #e0f2fe;
        font-size: 18px;
      }

      .card p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }

      .generator-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 14px;
      }

      .generator-card {
        min-height: 132px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        border-radius: var(--radius);
        padding: 16px;
        background:
          linear-gradient(145deg, rgba(14, 165, 233, 0.12), rgba(15, 23, 42, 0.68)),
          rgba(2, 6, 23, 0.52);
      }

      .generator-card strong {
        display: block;
        margin-bottom: 10px;
        color: #e0f2fe;
      }

      .generator-card span {
        color: var(--muted);
        line-height: 1.5;
        font-size: 14px;
      }

      .status-panel,
      .security-panel,
      .cta {
        border: 1px solid rgba(125, 211, 252, 0.22);
        border-radius: 18px;
        background: rgba(2, 6, 23, 0.72);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(18px);
      }

      .status-panel {
        display: grid;
        grid-template-columns: 0.88fr 1.12fr;
        gap: 26px;
        padding: clamp(24px, 4vw, 38px);
      }

      .status-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .status-item {
        min-height: 98px;
        border: 1px solid rgba(125, 211, 252, 0.16);
        border-radius: var(--radius);
        padding: 16px;
        background: rgba(15, 23, 42, 0.58);
      }

      .status-item span {
        display: block;
        color: var(--muted);
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .status-item strong {
        display: block;
        margin-top: 10px;
        color: #e0f2fe;
        font-size: 18px;
      }

      .security-panel {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 28px;
        padding: clamp(24px, 4vw, 40px);
      }

      .secure-list,
      .roadmap-list {
        display: grid;
        gap: 12px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .secure-list li,
      .roadmap-list li {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 48px;
        border: 1px solid rgba(125, 211, 252, 0.14);
        border-radius: var(--radius);
        padding: 12px 14px;
        color: #dbeafe;
        background: rgba(15, 23, 42, 0.48);
      }

      .check {
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 999px;
        color: #022c22;
        background: #6ee7b7;
        font-size: 12px;
        font-weight: 950;
      }

      .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .roadmap-list li {
        min-height: 58px;
      }

      .cta {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 24px;
        padding: clamp(26px, 5vw, 46px);
      }

      .cta h2 {
        margin-bottom: 10px;
      }

      .footer {
        border-top: 1px solid rgba(125, 211, 252, 0.12);
        padding: 34px 0;
        color: var(--muted);
        background: rgba(2, 6, 23, 0.64);
      }

      .footer-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        font-size: 14px;
        font-weight: 700;
      }

      .footer-links a:hover {
        color: var(--neon-strong);
      }

      .auth-overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: none;
        place-items: center;
        padding: 20px;
        background: rgba(2, 6, 23, 0.78);
        backdrop-filter: blur(18px);
      }

      .auth-overlay.open {
        display: grid;
      }

      .auth-modal {
        width: min(100%, 980px);
        max-height: calc(100vh - 40px);
        display: grid;
        grid-template-columns: 0.9fr 1.1fr;
        overflow: hidden;
        border: 1px solid rgba(125, 211, 252, 0.28);
        border-radius: 18px;
        background: rgba(2, 6, 23, 0.94);
        box-shadow: 0 30px 90px rgba(0, 0, 0, 0.48), 0 0 46px rgba(56, 189, 248, 0.18);
      }

      .auth-panel {
        padding: clamp(24px, 4vw, 42px);
        background:
          radial-gradient(circle at 20% 16%, rgba(56, 189, 248, 0.2), transparent 18rem),
          rgba(15, 23, 42, 0.62);
      }

      .auth-panel h2 {
        margin-bottom: 14px;
      }

      .auth-panel p {
        color: var(--muted);
        line-height: 1.7;
      }

      .auth-card {
        padding: clamp(22px, 4vw, 36px);
        overflow-y: auto;
      }

      .auth-close {
        float: right;
        width: 38px;
        height: 38px;
        border: 1px solid rgba(125, 211, 252, 0.24);
        border-radius: 8px;
        color: #e0f2fe;
        background: rgba(15, 23, 42, 0.72);
        cursor: pointer;
        font-weight: 950;
      }

      .auth-tabs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin: 18px 0 22px;
      }

      .auth-tab {
        min-height: 42px;
        border: 1px solid rgba(125, 211, 252, 0.16);
        border-radius: 8px;
        color: var(--muted);
        background: rgba(15, 23, 42, 0.48);
        cursor: pointer;
        font-weight: 900;
      }

      .auth-tab.active {
        color: #00111f;
        border-color: rgba(125, 211, 252, 0.8);
        background: linear-gradient(135deg, #7dd3fc, #38bdf8);
      }

      .auth-form {
        display: none;
        gap: 12px;
      }

      .auth-form.active {
        display: grid;
      }

      .field {
        display: grid;
        gap: 7px;
      }

      .field label,
      .terms {
        color: #dbeafe;
        font-size: 13px;
        font-weight: 800;
      }

      .field input {
        min-height: 48px;
        width: 100%;
        border: 1px solid rgba(125, 211, 252, 0.22);
        border-radius: 8px;
        padding: 0 14px;
        color: #f0f9ff;
        background: rgba(15, 23, 42, 0.7);
        outline: none;
      }

      .field input:focus {
        border-color: rgba(125, 211, 252, 0.72);
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.14);
      }

      .terms {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        line-height: 1.5;
      }

      .terms input {
        margin-top: 3px;
      }

      .auth-message {
        min-height: 24px;
        color: #bae6fd;
        font-size: 14px;
        line-height: 1.5;
      }

      .auth-message.error {
        color: #fecdd3;
      }

      .auth-link {
        border: 0;
        padding: 0;
        color: #7dd3fc;
        background: transparent;
        cursor: pointer;
        font-weight: 900;
      }

      @media (max-width: 980px) {
        .nav-links {
          display: none;
        }

        .hero,
        .status-panel,
        .security-panel,
        .cta {
          grid-template-columns: 1fr;
        }

        .chat-mockup {
          min-height: 520px;
        }

        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .generator-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .auth-modal {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 680px) {
        .shell {
          width: min(100% - 24px, 1180px);
        }

        .nav {
          min-height: 66px;
        }

        .button {
          width: 100%;
        }

        .hero {
          min-height: auto;
          padding-top: 38px;
        }

        .hero-actions,
        .hero-metrics,
        .status-list,
        .grid,
        .generator-grid,
        .roadmap-grid,
        .footer-content {
          grid-template-columns: 1fr;
        }

        .hero-actions,
        .footer-content {
          display: grid;
        }

        .chat-mockup {
          grid-template-columns: 1fr;
          min-height: auto;
        }

        .mock-sidebar {
          border-right: 0;
          border-bottom: 1px solid rgba(125, 211, 252, 0.16);
        }

        .mock-chat {
          min-height: 420px;
        }

        .message {
          max-width: 100%;
        }

        .section-heading p,
        .security-copy p,
        .cta p {
          font-size: 16px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  </head>
  <body>
    <header class="site-header">
      <nav class="shell nav" aria-label="Navegacao principal">
        <a class="brand" href="#inicio" aria-label="YARA AI inicio">
          <span class="brand-mark">YA</span>
          <span>YARA AI</span>
        </a>
        <div class="nav-links" aria-label="Secoes">
          <a href="#inicio">Inicio</a>
          <a href="#recursos">Recursos</a>
          <a href="#gerador">Gerador</a>
          <a href="#status">Status</a>
        <a href="#documentacao">Documentação</a>
        </div>
        <button class="button primary" type="button" data-open-auth="register">Criar minha conta</button>
      </nav>
    </header>

    <main id="inicio">
      <section class="shell hero" aria-labelledby="hero-title">
        <div>
          <div class="badge"><span class="dot"></span>YARA Online</div>
          <h1 id="hero-title">YARA AI</h1>
          <div class="hero-kicker">Sua inteligência. Sem limites.</div>
          <p class="hero-copy">
            A YARA AI ajuda você a conversar, criar sistemas, organizar projetos e transformar
            ideias em soluções reais com inteligência artificial.
          </p>
          <div class="hero-actions">
            <button class="button primary" type="button" data-open-auth="register">Criar minha conta</button>
            <button class="button" type="button" data-open-auth="login">Entrar</button>
          </div>
          <div class="hero-metrics" aria-label="Indicadores da plataforma">
            <div class="metric"><strong>Ideias</strong><span>Da conversa ao plano de ação</span></div>
            <div class="metric"><strong>Sistemas</strong><span>Estrutura para produtos reais</span></div>
            <div class="metric"><strong>Projetos</strong><span>Organização para evoluir</span></div>
          </div>
        </div>

        <div class="chat-stage" aria-label="Mockup da interface YARA AI">
          <div class="glow-frame"></div>
          <article class="chat-mockup">
            <aside class="mock-sidebar" aria-label="Menu do app YARA AI">
              <div class="mock-logo"><span class="mock-dot">AI</span><span>Console YARA</span></div>
              <div class="side-item active"><span class="side-icon">+</span>Nova Conversa</div>
              <div class="side-item"><span class="side-icon">M</span>Memória</div>
              <div class="side-item"><span class="side-icon">G</span>Gerador de Sistemas</div>
              <div class="side-item"><span class="side-icon">P</span>Projetos</div>
            </aside>
            <div class="mock-chat">
              <div class="mock-topbar">
                <div class="mock-title">
                  <strong>Chat YARA AI</strong>
                  <span>Experiência inteligente para criar e organizar ideias</span>
                </div>
                <div class="mini-status"><span class="dot"></span>Online</div>
              </div>
              <div class="message user">
                <small>Usuário</small>
                Crie um sistema de estoque para minha empresa.
              </div>
              <div class="message">
                <small>YARA</small>
                Claro. Vou gerar a estrutura completa com frontend, backend, banco de dados e painel administrativo.
              </div>
              <div class="message">
                <small>YARA</small>
                Também posso organizar os módulos, regras de acesso, telas principais e próximos passos.
              </div>
              <div class="fake-input">
                <span>Digite sua mensagem...</span>
                <span class="send-button" aria-hidden="true">></span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="recursos" class="shell" aria-labelledby="resources-title">
        <div class="section-heading">
          <span class="eyebrow">Recursos</span>
          <h2 id="resources-title">Tudo para transformar ideias em sistemas.</h2>
          <p>
            A YARA AI combina chat, memória, geração de sistemas e organização de projetos
            em uma experiência pensada para produtividade real.
          </p>
        </div>
        <div class="grid">
          <article class="card"><span class="feature-icon">${landingIcon("chat")}</span><h3>Chat IA</h3><p>Converse com a YARA para planejar, criar e evoluir produtos digitais.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("brain")}</span><h3>Memória inteligente</h3><p>Contexto persistente para respostas mais alinhadas ao seu projeto.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("code")}</span><h3>Gerador de Sistemas</h3><p>Crie arquiteturas, módulos e experiências completas a partir de um briefing.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("folder")}</span><h3>Meus Projetos</h3><p>Centralize ideias, escopos, gerações e histórico de evolução.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("dashboard")}</span><h3>Dashboard</h3><p>Visualize sua operação, progresso e próximos passos com clareza.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("spark")}</span><h3>Automação</h3><p>Acelere tarefas repetitivas e transforme processos em fluxos inteligentes.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("mobile")}</span><h3>Mobile App</h3><p>Acesse uma experiência pensada para produtividade no Android.</p></article>
          <article class="card"><span class="feature-icon">${landingIcon("shield")}</span><h3>Segurança</h3><p>Conta protegida e informações tratadas por uma camada segura.</p></article>
        </div>
      </section>

      <section id="gerador" class="shell" aria-labelledby="generator-title">
        <div class="section-heading">
          <span class="eyebrow">Gerador de Sistemas</span>
          <h2 id="generator-title">A YARA cria sistemas completos com IA.</h2>
          <p>
            Descreva o objetivo, público e regras. A plataforma ajuda a estruturar entregas
            profissionais de ponta a ponta.
          </p>
        </div>
        <div class="generator-grid">
          <div class="generator-card"><strong>Web App</strong><span>Interfaces modernas, fluxos de usuário e telas responsivas.</span></div>
          <div class="generator-card"><strong>Aplicações</strong><span>Contratos, regras de negócio e experiências conectadas.</span></div>
          <div class="generator-card"><strong>Dashboard</strong><span>Painéis operacionais para leitura, decisão e acompanhamento.</span></div>
          <div class="generator-card"><strong>Banco de Dados</strong><span>Modelagem, tabelas, relações e persistência segura.</span></div>
          <div class="generator-card"><strong>Mobile App</strong><span>Aplicativos conectados à plataforma YARA AI.</span></div>
          <div class="generator-card"><strong>Automação</strong><span>Rotinas, processos e integrações para acelerar operações.</span></div>
        </div>
      </section>

      <section id="status" class="shell" aria-labelledby="status-title">
        <div class="status-panel">
          <div class="section-heading">
            <span class="eyebrow">Status da plataforma</span>
            <h2 id="status-title">Tudo pronto para criar.</h2>
            <p>
              A YARA AI está disponível para login, criação de conta e organização dos seus projetos.
            </p>
            <button class="button primary" type="button" data-open-auth="register">Criar minha conta</button>
          </div>
          <div class="status-list">
            <div class="status-item"><span>Conta</span><strong>Autenticação segura</strong></div>
            <div class="status-item"><span>Projetos</span><strong>Organização inteligente</strong></div>
            <div class="status-item"><span>Criação</span><strong>Sistemas com IA</strong></div>
            <div class="status-item"><span>Status</span><strong>YARA Online</strong></div>
            <div class="status-item"><span>Experiência</span><strong>Web e mobile</strong></div>
            <div class="status-item"><span>Plataforma</span><strong>Em evolução</strong></div>
          </div>
        </div>
      </section>

      <section class="shell" aria-labelledby="security-title">
        <div class="security-panel">
          <div class="security-copy">
            <span class="eyebrow">Segurança</span>
            <h2 id="security-title">Arquitetura protegida por design.</h2>
            <p>
              Sua conta, seus projetos e suas informações são tratados com uma camada segura
              desenhada para proteger a experiência da plataforma.
            </p>
          </div>
          <ul class="secure-list">
            <li><span class="check">OK</span>Seus dados protegidos com segurança.</li>
            <li><span class="check">OK</span>Sua conta com autenticação segura.</li>
            <li><span class="check">OK</span>Suas informações não ficam expostas no aplicativo.</li>
            <li><span class="check">OK</span>A IA é acessada por uma camada segura do servidor.</li>
            <li><span class="check">OK</span>Credenciais sensíveis permanecem protegidas.</li>
          </ul>
        </div>
      </section>

      <section class="shell" aria-labelledby="roadmap-title">
        <div class="section-heading">
          <span class="eyebrow">Roadmap</span>
          <h2 id="roadmap-title">Próximos recursos da plataforma.</h2>
          <p>
            A YARA AI está evoluindo para uma experiência completa de criação, memória e
            entrega de sistemas com IA.
          </p>
        </div>
        <div class="roadmap-grid">
          <ul class="roadmap-list">
            <li><span class="check">1</span>Chat inteligente completo</li>
            <li><span class="check">2</span>Login e cadastro</li>
            <li><span class="check">3</span>Histórico de conversas</li>
            <li><span class="check">4</span>Favoritos</li>
          </ul>
          <ul class="roadmap-list">
            <li><span class="check">5</span>Memória personalizada</li>
            <li><span class="check">6</span>Geração de APK</li>
            <li><span class="check">7</span>Painel administrativo</li>
            <li><span class="check">8</span>Deploys e automações</li>
          </ul>
        </div>
      </section>

      <section id="cta" class="shell" aria-labelledby="cta-title">
        <div class="cta">
          <div>
            <span class="eyebrow">Comece agora</span>
            <h2 id="cta-title">Comece agora com a YARA AI</h2>
            <p>Entre na plataforma oficial e transforme suas ideias em projetos com uma experiência moderna e segura.</p>
          </div>
          <div class="cta-actions">
            <button class="button primary" type="button" data-open-auth="register">Criar minha conta</button>
            <a id="documentacao" class="button" href="https://github.com/ChatYara/ChatYara">Ver documentação</a>
          </div>
        </div>
      </section>
    </main>

    <div class="auth-overlay" id="authOverlay" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <div class="auth-modal">
        <section class="auth-panel">
          <span class="eyebrow">Acesso YARA AI</span>
          <h2 id="authTitle">Entre na plataforma oficial.</h2>
          <p>
            Acesse sua conta, organize projetos e continue criando com a YARA AI em um ambiente seguro.
          </p>
          <div class="status" style="margin-top: 24px;"><span class="dot"></span>YARA Online</div>
        </section>
        <section class="auth-card">
          <button class="auth-close" id="authClose" type="button" aria-label="Fechar">X</button>
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab active" type="button" data-auth-tab="login">Login</button>
            <button class="auth-tab" type="button" data-auth-tab="register">Cadastro</button>
            <button class="auth-tab" type="button" data-auth-tab="forgot">Senha</button>
          </div>

          <form class="auth-form active" id="loginForm">
            <div class="field">
              <label for="loginIdentifier">E-mail</label>
              <input id="loginIdentifier" name="identifier" type="email" autocomplete="username" required />
            </div>
            <div class="field">
              <label for="loginPassword">Senha</label>
              <input id="loginPassword" name="password" type="password" autocomplete="current-password" required />
            </div>
            <button class="button primary" type="submit">Entrar</button>
            <button class="auth-link" type="button" data-auth-tab="forgot">Esqueci minha senha</button>
            <button class="auth-link" type="button" data-auth-tab="register">Criar conta</button>
          </form>

          <form class="auth-form" id="registerForm">
            <div class="field">
              <label for="registerName">Como você quer ser chamado?</label>
              <input id="registerName" name="name" autocomplete="name" required />
            </div>
            <div class="field">
              <label for="registerEmail">E-mail</label>
              <input id="registerEmail" name="email" type="email" autocomplete="email" required />
            </div>
            <div class="field">
              <label for="registerPhone">Telefone (opcional)</label>
              <input id="registerPhone" name="phone" inputmode="tel" autocomplete="tel" />
            </div>
            <div class="field">
              <label for="registerPassword">Senha</label>
              <input id="registerPassword" name="password" type="password" autocomplete="new-password" required />
            </div>
            <div class="field">
              <label for="registerConfirmPassword">Confirmar senha</label>
              <input id="registerConfirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required />
            </div>
            <label class="terms">
              <input id="registerTerms" type="checkbox" required />
              Aceito os termos e quero criar minha conta na YARA AI.
            </label>
            <button class="button primary" type="submit">Criar conta</button>
            <button class="auth-link" type="button" data-auth-tab="login">Já tenho conta</button>
          </form>

          <form class="auth-form" id="forgotForm">
            <div class="field">
              <label for="forgotIdentifier">E-mail</label>
              <input id="forgotIdentifier" name="identifier" type="email" autocomplete="username" required />
            </div>
            <p style="margin: 0 0 4px; color: var(--muted); font-size: 14px;">Informe seu e-mail para receber as instruções de recuperação.</p>
            <button class="button primary" type="submit">Enviar instruções</button>
            <button class="auth-link" type="button" data-auth-tab="login">Voltar para login</button>
          </form>
          <div class="auth-message" id="authMessage" aria-live="polite"></div>
        </section>
      </div>
    </div>

    <footer class="footer">
      <div class="shell footer-content">
        <div class="footer-brand">
          <span class="brand-mark">YA</span>
          <span>YARA AI</span>
        </div>
        <div class="footer-links">
          <a href="https://github.com/ChatYara/ChatYara">GitHub</a>
          <a href="/api/health">Status técnico</a>
          <span>Status: Online</span>
          <span>Copyright 2026 YARA AI</span>
        </div>
      </div>
    </footer>
    <script>
      const authOverlay = document.getElementById("authOverlay");
      const authClose = document.getElementById("authClose");
      const authMessage = document.getElementById("authMessage");
      const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
      const forms = {
        login: document.getElementById("loginForm"),
        register: document.getElementById("registerForm"),
        forgot: document.getElementById("forgotForm")
      };

      function setAuthMessage(message, isError = false) {
        authMessage.textContent = message;
        authMessage.classList.toggle("error", isError);
      }

      function showAuthTab(tab) {
        for (const item of tabs) {
          item.classList.toggle("active", item.dataset.authTab === tab);
        }
        for (const [key, form] of Object.entries(forms)) {
          form.classList.toggle("active", key === tab);
        }
        setAuthMessage("");
      }

      function openAuth(tab = "login") {
        authOverlay.classList.add("open");
        showAuthTab(tab);
      }

      function closeAuth() {
        authOverlay.classList.remove("open");
      }

      async function api(path, body) {
        const response = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error?.message || "Nao foi possivel concluir a solicitacao.");
        }

        return data;
      }

      for (const button of document.querySelectorAll("[data-open-auth]")) {
        button.addEventListener("click", () => {
          if (localStorage.getItem("yaraToken")) {
            window.location.href = "/app";
            return;
          }
          openAuth(button.dataset.openAuth || "login");
        });
      }

      for (const tab of tabs) {
        tab.addEventListener("click", () => showAuthTab(tab.dataset.authTab));
      }

      authClose.addEventListener("click", closeAuth);
      authOverlay.addEventListener("click", (event) => {
        if (event.target === authOverlay) closeAuth();
      });

      document.getElementById("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        setAuthMessage("Entrando...");
        const form = new FormData(event.currentTarget);
        try {
          const data = await api("/api/auth/login", {
            identifier: String(form.get("identifier") || ""),
            password: String(form.get("password") || "")
          });
          localStorage.setItem("yaraToken", data.token);
          localStorage.setItem("yaraUser", JSON.stringify(data.user));
          window.location.href = "/app";
        } catch (error) {
          setAuthMessage(error.message, true);
        }
      });

      document.getElementById("registerForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const terms = document.getElementById("registerTerms");
        if (!terms.checked) {
          setAuthMessage("Aceite os termos para criar sua conta.", true);
          return;
        }

        setAuthMessage("Criando conta...");
        const form = new FormData(event.currentTarget);
        try {
          const data = await api("/api/auth/register", {
            name: String(form.get("name") || ""),
            email: String(form.get("email") || ""),
            phone: String(form.get("phone") || ""),
            password: String(form.get("password") || ""),
            confirmPassword: String(form.get("confirmPassword") || "")
          });
          localStorage.setItem("yaraToken", data.token);
          localStorage.setItem("yaraUser", JSON.stringify(data.user));
          window.location.href = "/app";
        } catch (error) {
          setAuthMessage(error.message, true);
        }
      });

      document.getElementById("forgotForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        setAuthMessage("Preparando instruções...");
        const form = new FormData(event.currentTarget);
        try {
          const data = await api("/api/auth/forgot-password", {
            identifier: String(form.get("identifier") || "")
          });
          setAuthMessage(data.message || "Se os dados estiverem cadastrados, enviaremos instruções.");
        } catch (error) {
          setAuthMessage(error.message, true);
        }
      });

      if (new URLSearchParams(window.location.search).get("auth")) {
        openAuth("login");
      }
    </script>
  </body>
</html>`;
}

type LandingIconName = "chat" | "brain" | "code" | "folder" | "dashboard" | "spark" | "mobile" | "shield";

function landingIcon(name: LandingIconName) {
  const icons: Record<LandingIconName, string> = {
    chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-4.5 4v-4A3.5 3.5 0 0 1 3 10.5v-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4.5A3 3 0 0 0 6 7.5v.2A3.4 3.4 0 0 0 4 11a3.4 3.4 0 0 0 2 3.1v.4A3 3 0 0 0 9 17.5h1V4.5H9Zm6 0a3 3 0 0 1 3 3v.2A3.4 3.4 0 0 1 20 11a3.4 3.4 0 0 1-2 3.1v.4a3 3 0 0 1-3 3h-1V4.5h1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h2m4 0h2M8 13h2m4 0h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-10-3 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 18 18H6a2.5 2.5 0 0 1-2.5-2.5v-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 16V10m4 6V8m4 8v-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3.5h8A2.5 2.5 0 0 1 18.5 6v12A2.5 2.5 0 0 1 16 20.5H8A2.5 2.5 0 0 1 5.5 18V6A2.5 2.5 0 0 1 8 3.5Z" stroke="currentColor" stroke-width="1.8"/><path d="M10 17.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 19 6v5.2c0 4.2-2.8 7.7-7 9.3-4.2-1.6-7-5.1-7-9.3V6l7-2.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  return icons[name];
}
