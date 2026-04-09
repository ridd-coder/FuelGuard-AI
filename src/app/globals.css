@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* ============================================
   DESIGN SYSTEM TOKENS
   ============================================ */
:root {
  /* Core palette — deep space dark theme */
  --bg-base: #050a0f;
  --bg-surface: #0a1520;
  --bg-card: #0d1e2e;
  --bg-card-hover: #112438;
  --bg-elevated: #162d42;
  --bg-overlay: rgba(5, 10, 15, 0.85);

  /* Brand neon accents */
  --neon-cyan: #00d4ff;
  --neon-cyan-glow: rgba(0, 212, 255, 0.25);
  --neon-cyan-subtle: rgba(0, 212, 255, 0.08);
  --neon-green: #00ff88;
  --neon-green-glow: rgba(0, 255, 136, 0.25);
  --neon-orange: #ff7a30;
  --neon-orange-glow: rgba(255, 122, 48, 0.25);
  --neon-red: #ff3366;
  --neon-red-glow: rgba(255, 51, 102, 0.25);
  --neon-purple: #9b59ff;
  --neon-purple-glow: rgba(155, 89, 255, 0.25);
  --neon-yellow: #ffd700;
  --neon-yellow-glow: rgba(255, 215, 0, 0.25);

  /* Severity system */
  --color-operational: #00ff88;
  --color-critical: #ff7a30;
  --color-offline: #ff3366;
  --color-warning: #ffd700;
  --color-info: #00d4ff;

  /* Text hierarchy */
  --text-primary: #e8f4ff;
  --text-secondary: #7aa8cc;
  --text-muted: #4a7299;
  --text-disabled: #2a4a66;

  /* Borders */
  --border-subtle: rgba(0, 212, 255, 0.08);
  --border-default: rgba(0, 212, 255, 0.15);
  --border-emphasis: rgba(0, 212, 255, 0.35);
  --border-glow: rgba(0, 212, 255, 0.6);

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Sidebar */
  --sidebar-width: 260px;
  --sidebar-collapsed: 64px;
  --topbar-height: 64px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 5, 20, 0.6);
  --shadow-glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
  --shadow-glow-green: 0 0 20px rgba(0, 255, 136, 0.3);
  --shadow-glow-red: 0 0 20px rgba(255, 51, 102, 0.3);
}

/* ============================================
   RESET & BASE
   ============================================ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-base);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-surface); }
::-webkit-scrollbar-thumb { background: var(--border-emphasis); border-radius: var(--radius-full); }
::-webkit-scrollbar-thumb:hover { background: var(--neon-cyan); }

/* Selection */
::selection { background: var(--neon-cyan-glow); color: var(--neon-cyan); }

/* ============================================
   TYPOGRAPHY
   ============================================ */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

h1 { font-size: clamp(1.75rem, 3vw, 2.5rem); }
h2 { font-size: clamp(1.375rem, 2.5vw, 2rem); }
h3 { font-size: clamp(1.125rem, 2vw, 1.5rem); }
h4 { font-size: 1.125rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }

p { color: var(--text-secondary); line-height: 1.7; }
a { color: var(--neon-cyan); text-decoration: none; transition: color var(--transition-fast); }
a:hover { color: var(--text-primary); }
code, pre { font-family: 'JetBrains Mono', 'Courier New', monospace; }
small { font-size: 0.8125rem; }

/* ============================================
   LAYOUT
   ============================================ */
.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  transition: width var(--transition-slow);
  overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: var(--topbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 40;
  gap: var(--space-4);
  backdrop-filter: blur(12px);
}

.page-content {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
.grid-1-2 { display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-4); }
.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-4); }
.grid-3-1 { display: grid; grid-template-columns: 3fr 1fr; gap: var(--space-4); }

@media (max-width: 1280px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .main-content { margin-left: 0; }
  .grid-2, .grid-3, .grid-4, .grid-1-2, .grid-2-1, .grid-3-1 { grid-template-columns: 1fr; }
}

/* ============================================
   SIDEBAR STYLES
   ============================================ */
.sidebar-logo {
  padding: var(--space-5) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-glow-cyan);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  line-height: 1;
}

.logo-sub {
  font-size: 0.7rem;
  color: var(--neon-cyan);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
}

.nav-section-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: var(--space-3) var(--space-3) var(--space-2);
  margin-top: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: var(--neon-cyan-subtle);
  color: var(--neon-cyan);
  border-color: var(--border-subtle);
}

.nav-item.active {
  background: var(--neon-cyan-subtle);
  color: var(--neon-cyan);
  border-color: var(--border-default);
  box-shadow: inset 0 0 20px var(--neon-cyan-glow);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--neon-cyan);
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px var(--neon-cyan);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
}

.nav-badge {
  margin-left: auto;
  background: var(--neon-red);
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
  box-shadow: 0 0 8px var(--neon-red-glow);
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--neon-cyan-subtle);
  border: 1px solid var(--border-subtle);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-info { overflow: hidden; }
.user-name { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.6875rem; color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }

/* ============================================
   CARDS
   ============================================ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-default), transparent);
}

.card:hover {
  border-color: var(--border-default);
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  gap: var(--space-3);
}

.card-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* Stat Card */
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-color, var(--neon-cyan));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-slow);
}

.stat-card:hover::after { transform: scaleX(1); }
.stat-card:hover { border-color: var(--border-default); transform: translateY(-2px); box-shadow: var(--shadow-card); }

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: var(--space-2);
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.up { color: var(--neon-green); }
.stat-change.down { color: var(--neon-red); }
.stat-change.neutral { color: var(--text-muted); }

/* ============================================
   STATUS BADGES & CHIPS
   ============================================ */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-operational {
  background: rgba(0, 255, 136, 0.12);
  color: var(--neon-green);
  border: 1px solid rgba(0, 255, 136, 0.25);
}

.badge-critical {
  background: rgba(255, 122, 48, 0.12);
  color: var(--neon-orange);
  border: 1px solid rgba(255, 122, 48, 0.25);
}

.badge-offline {
  background: rgba(255, 51, 102, 0.12);
  color: var(--neon-red);
  border: 1px solid rgba(255, 51, 102, 0.25);
}

.badge-warning {
  background: rgba(255, 215, 0, 0.12);
  color: var(--neon-yellow);
  border: 1px solid rgba(255, 215, 0, 0.25);
}

.badge-info {
  background: rgba(0, 212, 255, 0.12);
  color: var(--neon-cyan);
  border: 1px solid rgba(0, 212, 255, 0.25);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 2s ease infinite;
}

.pulse-dot.green { background: var(--neon-green); box-shadow: 0 0 6px var(--neon-green); }
.pulse-dot.orange { background: var(--neon-orange); box-shadow: 0 0 6px var(--neon-orange); }
.pulse-dot.red { background: var(--neon-red); box-shadow: 0 0 6px var(--neon-red); }
.pulse-dot.cyan { background: var(--neon-cyan); box-shadow: 0 0 6px var(--neon-cyan); }

@keyframes pulse-ring {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* ============================================
   BUTTONS
   ============================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid transparent;
  font-family: inherit;
  white-space: nowrap;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.btn:hover::before { opacity: 1; }

.btn-primary {
  background: linear-gradient(135deg, var(--neon-cyan), rgba(0, 178, 214, 0.8));
  color: var(--bg-base);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(0, 212, 255, 0.5);
}

.btn-danger {
  background: linear-gradient(135deg, var(--neon-red), rgba(200, 30, 70, 0.8));
  color: white;
  box-shadow: 0 4px 15px var(--neon-red-glow);
}

.btn-success {
  background: linear-gradient(135deg, var(--neon-green), rgba(0, 180, 90, 0.8));
  color: var(--bg-base);
  box-shadow: 0 4px 15px var(--neon-green-glow);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-default);
}

.btn-ghost:hover {
  background: var(--neon-cyan-subtle);
  color: var(--neon-cyan);
  border-color: var(--border-emphasis);
}

.btn-sm { padding: var(--space-1) var(--space-3); font-size: 0.8125rem; }
.btn-lg { padding: var(--space-3) var(--space-8); font-size: 1rem; }
.btn-icon { padding: var(--space-2); width: 36px; height: 36px; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

/* ============================================
   PROGRESS BARS
   ============================================ */
.progress-bar {
  height: 6px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 1s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
}

.progress-fill.green { background: linear-gradient(90deg, var(--neon-green), #00cc66); box-shadow: 0 0 8px var(--neon-green-glow); }
.progress-fill.orange { background: linear-gradient(90deg, var(--neon-orange), #ff5500); box-shadow: 0 0 8px var(--neon-orange-glow); }
.progress-fill.red { background: linear-gradient(90deg, var(--neon-red), #cc1144); box-shadow: 0 0 8px var(--neon-red-glow); }
.progress-fill.cyan { background: linear-gradient(90deg, var(--neon-cyan), #0088cc); box-shadow: 0 0 8px var(--neon-cyan-glow); }

/* ============================================
   INPUTS & FORMS
   ============================================ */
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }

.form-input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
  outline: none;
}

.form-input:focus {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 0 3px var(--neon-cyan-glow);
}

.form-input::placeholder { color: var(--text-muted); }

.form-select {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a7299' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.form-select:focus { border-color: var(--neon-cyan); box-shadow: 0 0 0 3px var(--neon-cyan-glow); }

/* ============================================
   TABLES
   ============================================ */
.table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead {
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-subtle);
}

th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  vertical-align: middle;
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--neon-cyan-subtle); color: var(--text-primary); }

/* ============================================
   ALERTS & NOTIFICATIONS
   ============================================ */
.alert-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  transition: all var(--transition-fast);
}

.alert-item:hover { transform: translateX(2px); }

.alert-critical { background: rgba(255, 51, 102, 0.07); border-color: rgba(255, 51, 102, 0.2); }
.alert-high { background: rgba(255, 122, 48, 0.07); border-color: rgba(255, 122, 48, 0.2); }
.alert-medium { background: rgba(255, 215, 0, 0.07); border-color: rgba(255, 215, 0, 0.2); }
.alert-low { background: rgba(0, 212, 255, 0.07); border-color: rgba(0, 212, 255, 0.2); }

.alert-icon { font-size: 1.1rem; margin-top: 1px; flex-shrink: 0; }
.alert-content { flex: 1; min-width: 0; }
.alert-msg { font-size: 0.875rem; color: var(--text-primary); font-weight: 500; line-height: 1.4; }
.alert-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; display: flex; gap: var(--space-3); }

/* ============================================
   TABS
   ============================================ */
.tabs {
  display: flex;
  gap: 2px;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: 3px;
}

.tab-btn {
  flex: 1;
  padding: var(--space-2) var(--space-4);
  border-radius: calc(var(--radius-md) - 2px);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  text-align: center;
}

.tab-btn.active {
  background: var(--bg-card);
  color: var(--neon-cyan);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tab-btn:hover:not(.active) { color: var(--text-secondary); background: rgba(255,255,255,0.03); }

/* ============================================
   MAP STYLES
   ============================================ */
.map-container {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.map-grid {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  position: relative;
}

.station-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  transition: transform var(--transition-fast);
}

.station-marker:hover { transform: translate(-50%, -50%) scale(1.3); }

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--bg-base);
  position: relative;
}

.marker-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid;
  opacity: 0.4;
  animation: marker-pulse 2s ease infinite;
}

@keyframes marker-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.4); opacity: 0; }
}

.marker-dot.green { background: var(--neon-green); box-shadow: 0 0 10px var(--neon-green); }
.marker-dot.orange { background: var(--neon-orange); box-shadow: 0 0 10px var(--neon-orange); }
.marker-dot.red { background: var(--neon-red); box-shadow: 0 0 10px var(--neon-red); }

.station-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-elevated);
  border: 1px solid var(--border-emphasis);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  white-space: nowrap;
  font-size: 0.75rem;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  z-index: 100;
}

/* ============================================
   CHATBOT
   ============================================ */
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chatbot-header {
  padding: var(--space-3) var(--space-4);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.chat-message {
  display: flex;
  gap: var(--space-3);
  max-width: 90%;
}

.chat-message.user { flex-direction: row-reverse; margin-left: auto; }

.chat-bubble {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 360px;
}

.chat-bubble.ai {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: 4px var(--radius-md) var(--radius-md) var(--radius-md);
}

.chat-bubble.user {
  background: linear-gradient(135deg, var(--neon-cyan), rgba(0, 178, 214, 0.8));
  color: var(--bg-base);
  font-weight: 500;
  border-radius: var(--radius-md) 4px var(--radius-md) var(--radius-md);
}

.chatbot-input-row {
  padding: var(--space-3) var(--space-4);
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: var(--space-2);
}

.chatbot-input {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
}

.chatbot-input:focus { border-color: var(--neon-cyan); }

/* ============================================
   BLOCKCHAIN LEDGER
   ============================================ */
.blockchain-block {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  position: relative;
  transition: all var(--transition-fast);
}

.blockchain-block:hover { border-color: var(--border-emphasis); }

.blockchain-block::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: var(--space-3);
  background: linear-gradient(to bottom, var(--neon-cyan), transparent);
  transform: translateX(-50%);
}

.blockchain-block:last-child::before { display: none; }

.block-hash {
  color: var(--neon-cyan);
  word-break: break-all;
  line-height: 1.4;
}

.block-verified {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--neon-green);
  font-size: 0.6875rem;
  font-weight: 700;
}

/* ============================================
   WHATSAPP PANEL
   ============================================ */
.whatsapp-container {
  background: #0a1520;
  border: 1px solid rgba(37, 211, 102, 0.2);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.whatsapp-header {
  background: #075E54;
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.whatsapp-chat-area {
  height: 320px;
  overflow-y: auto;
  padding: var(--space-3);
  background: #0d2137;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(0,212,255,0.04)'/%3E%3C/svg%3E");
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.wa-message {
  max-width: 80%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.wa-message.incoming {
  background: #1a2f47;
  border: 1px solid rgba(0,212,255,0.1);
  align-self: flex-start;
  border-radius: 4px var(--radius-md) var(--radius-md) var(--radius-md);
}

.wa-message.outgoing {
  background: #0b5c4b;
  align-self: flex-end;
  border-radius: var(--radius-md) 4px var(--radius-md) var(--radius-md);
}

.wa-sender { font-size: 0.6875rem; color: #25D366; font-weight: 700; margin-bottom: 3px; }
.wa-text { color: #e8f4ff; line-height: 1.5; }
.wa-time { font-size: 0.625rem; color: rgba(255,255,255,0.4); margin-top: 3px; text-align: right; }

/* ============================================
   CREDIT RING
   ============================================ */
.credit-ring-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.credit-ring-svg { transform: rotate(-90deg); }

/* ============================================
   QR CODE MODAL
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.2s ease;
}

.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-emphasis);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  width: min(480px, 90vw);
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), var(--shadow-glow-cyan);
  animation: slide-up 0.3s ease;
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ============================================
   TOPBAR ELEMENTS
   ============================================ */
.topbar-title { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); }
.topbar-subtitle { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }

.crisis-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 700;
  border: 1px solid;
}

.crisis-indicator.medium {
  background: rgba(255, 215, 0, 0.08);
  border-color: rgba(255, 215, 0, 0.25);
  color: var(--neon-yellow);
}

.crisis-indicator.high {
  background: rgba(255, 122, 48, 0.08);
  border-color: rgba(255, 122, 48, 0.25);
  color: var(--neon-orange);
}

.crisis-indicator.critical {
  background: rgba(255, 51, 102, 0.08);
  border-color: rgba(255, 51, 102, 0.25);
  color: var(--neon-red);
}

.live-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--neon-green);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ============================================
   HEATMAP GRID
   ============================================ */
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  padding: var(--space-3);
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 3px;
  cursor: pointer;
  transition: transform var(--transition-fast);
  position: relative;
}

.heatmap-cell:hover { transform: scale(1.2); z-index: 10; }

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 10px var(--neon-cyan-glow); }
  50% { box-shadow: 0 0 25px var(--neon-cyan-glow), 0 0 50px rgba(0, 212, 255, 0.1); }
}

.glow-pulse { animation: glow-pulse 3s ease infinite; }
.float { animation: float 4s ease infinite; }

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.slide-in { animation: slide-in-right 0.4s ease; }

/* ============================================
   SCROLLABLE LISTS
   ============================================ */
.scroll-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 360px;
  overflow-y: auto;
  padding-right: var(--space-1);
}

/* ============================================
   RECHARTS DARK OVERRIDES
   ============================================ */
.recharts-cartesian-grid-horizontal line,
.recharts-cartesian-grid-vertical line {
  stroke: var(--border-subtle);
}

.recharts-tooltip-wrapper .recharts-default-tooltip {
  background: var(--bg-elevated) !important;
  border: 1px solid var(--border-emphasis) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
}

.recharts-text { fill: var(--text-muted) !important; }

/* ============================================
   RANGE SLIDER
   ============================================ */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--neon-cyan);
  cursor: pointer;
  box-shadow: 0 0 8px var(--neon-cyan-glow);
  border: 2px solid var(--bg-base);
}

/* ============================================
   LANDING PAGE
   ============================================ */
.hero-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
  animation: float 8s ease infinite;
}

.hero-orb-1 { width: 600px; height: 600px; background: var(--neon-cyan); top: -200px; left: -100px; }
.hero-orb-2 { width: 400px; height: 400px; background: var(--neon-purple); bottom: -100px; right: -100px; animation-delay: -4s; }
.hero-orb-3 { width: 300px; height: 300px; background: var(--neon-green); top: 40%; left: 50%; animation-delay: -2s; }

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ============================================
   UTILITY CLASSES
   ============================================ */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.w-full { width: 100%; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-cyan { color: var(--neon-cyan); }
.text-green { color: var(--neon-green); }
.text-red { color: var(--neon-red); }
.text-orange { color: var(--neon-orange); }
.text-yellow { color: var(--neon-yellow); }
.text-muted { color: var(--text-muted); }
.text-secondary { color: var(--text-secondary); }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.opacity-60 { opacity: 0.6; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ml-auto { margin-left: auto; }
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-4 { margin-bottom: var(--space-4); }
.p-4 { padding: var(--space-4); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-2 { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.rounded { border-radius: var(--radius-md); }
.border { border: 1px solid var(--border-subtle); }
.bg-elevated { background: var(--bg-elevated); }
.bg-card { background: var(--bg-card); }
.relative { position: relative; }
.overflow-hidden { overflow: hidden; }
.z-10 { z-index: 10; }
.mb-6 { margin-bottom: var(--space-6); }
.shrink-0 { flex-shrink: 0; }
