import {
  Activity,
  Circle,
  Command,
  Copy,
  Keyboard,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  MoreHorizontal,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  X,
} from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";

import { SHELL_LAYERS } from "./shell-layers";

type PaletteName = "HOK Dark" | "Termius-like" | "High Contrast";
type Session = {
  id: number;
  name: string;
  host: string;
  state: "live" | "idle";
};

const PALETTES: Record<
  PaletteName,
  {
    bg: string;
    panel: string;
    panelRaised: string;
    ink: string;
    muted: string;
    line: string;
    accent: string;
    accentSoft: string;
    terminal: string;
    terminalInk: string;
    terminalMuted: string;
    terminalLine: string;
    tmux: string;
  }
> = {
  "HOK Dark": {
    bg: "#0d0d0d",
    panel: "#151515",
    panelRaised: "#20201e",
    ink: "#f4efe5",
    muted: "#9a9388",
    line: "#34302a",
    accent: "#F59E0B",
    accentSoft: "#68430a",
    terminal: "#0d0d0d",
    terminalInk: "#f4efe5",
    terminalMuted: "#82796c",
    terminalLine: "#2a261f",
    tmux: "#83c889",
  },
  "Termius-like": {
    bg: "#011627",
    panel: "#0a2233",
    panelRaised: "#12344a",
    ink: "#e8f1f2",
    muted: "#8ca6ad",
    line: "#294b5c",
    accent: "#7fdbca",
    accentSoft: "#245b65",
    terminal: "#01111f",
    terminalInk: "#d6e7e9",
    terminalMuted: "#6f929d",
    terminalLine: "#17384a",
    tmux: "#9fe3b1",
  },
  "High Contrast": {
    bg: "#121313",
    panel: "#1d1f1e",
    panelRaised: "#2a2d2a",
    ink: "#fbf9ed",
    muted: "#b7bbad",
    line: "#4c534b",
    accent: "#f2c46d",
    accentSoft: "#67502c",
    terminal: "#080b0a",
    terminalInk: "#f5f7dd",
    terminalMuted: "#a5b39d",
    terminalLine: "#445047",
    tmux: "#b9ee8e",
  },
};

const INITIAL_SESSIONS: Session[] = [
  { id: 1, name: "edge-router", host: "prod / iad-02", state: "live" },
  { id: 2, name: "log-stream", host: "ops / fra-01", state: "idle" },
  { id: 3, name: "staging", host: "dev / sfo-03", state: "idle" },
];

const specialKeys = [
  { label: "Ctrl", short: "⌃" },
  { label: "Esc", short: "Esc" },
  { label: "↑", short: "↑" },
  { label: "↓", short: "↓" },
  { label: "←", short: "←" },
  { label: "→", short: "→" },
  { label: "Shift + Tab", short: "⇧ Tab" },
];

const extraKeys = [
  "Alt",
  "Tab",
  "Space",
  "Backspace",
  "Enter",
  "Home",
  "End",
  "PgUp",
  "PgDn",
  "Insert",
  "Delete",
  "~",
  "|",
  "\\",
  "?",
  "-",
  ":",
  ";",
  "!",
  "@",
  "$",
  "*",
  "^",
  "%",
  "=",
  "`",
  "<",
  ">",
  "(",
  ")",
  "{",
  "}",
  "[",
  "]",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "Ctrl+W",
  "Ctrl+R",
  "Ctrl+X",
  "Ctrl+C",
  "Ctrl+D",
  "Ctrl+L",
  "Ctrl+S",
  "Ctrl+Z",
];

const iconForDock = (label: string) => {
  if (label === "Chat") return MessageCircle;
  if (label === "N8N") return Workflow;
  if (label === "Config") return Settings2;
  return Terminal;
};

function KeyButton({
  label,
  active = false,
  wide = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  wide?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center justify-center rounded-md border px-3 text-[11px] font-semibold tracking-[0.01em] transition-transform duration-150 active:scale-[0.96] ${
        wide ? "min-w-[82px]" : "min-w-[42px]"
      }`}
      style={{
        color: active ? "var(--hok-bg)" : "var(--hok-ink)",
        background: active ? "var(--hok-accent)" : "var(--hok-key)",
        borderColor: active ? "var(--hok-accent)" : "var(--hok-line)",
        boxShadow: active
          ? "0 2px 0 color-mix(in srgb, var(--hok-accent) 56%, #000)"
          : "0 2px 0 color-mix(in srgb, var(--hok-line) 65%, #000)",
      }}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--hok-muted)" }}>
      {children}
    </span>
  );
}

export default function HokTerminal() {
  const [paletteName, setPaletteName] = useState<PaletteName>("Termius-like");
  const [zoom, setZoom] = useState(100);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState(false);
  const [ctrlSticky, setCtrlSticky] = useState(false);
  const [altSticky, setAltSticky] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [lastInput, setLastInput] = useState("ready · attach to ttyd");
  const [activeDock, setActiveDock] = useState("Terminal");
  const palette = PALETTES[paletteName];

  const themeStyle = {
    "--hok-bg": palette.bg,
    "--hok-panel": palette.panel,
    "--hok-raised": palette.panelRaised,
    "--hok-ink": palette.ink,
    "--hok-muted": palette.muted,
    "--hok-line": palette.line,
    "--hok-accent": palette.accent,
    "--hok-accent-soft": palette.accentSoft,
    "--hok-terminal": palette.terminal,
    "--hok-terminal-ink": palette.terminalInk,
    "--hok-terminal-muted": palette.terminalMuted,
    "--hok-terminal-line": palette.terminalLine,
    "--hok-tmux": palette.tmux,
    "--hok-key": palette.panelRaised,
  } as CSSProperties;

  const cyclePalette = () => {
    const names = Object.keys(PALETTES) as PaletteName[];
    setPaletteName(names[(names.indexOf(paletteName) + 1) % names.length]);
  };

  const addSession = () => {
    const id = Math.max(...sessions.map((session) => session.id), 0) + 1;
    const next = { id, name: `shell-${String(id).padStart(2, "0")}`, host: "new / local", state: "live" as const };
    setSessions((current) => [...current, next]);
    setActiveSessionId(id);
    setMinimized(false);
    setLastInput(`opened ${next.name}`);
  };

  const closeSession = (id: number) => {
    if (sessions.length === 1) {
      setLastInput("one session must remain attached");
      return;
    }
    const next = sessions.filter((session) => session.id !== id);
    setSessions(next);
    if (id === activeSessionId) {
      setActiveSessionId(next[Math.max(0, next.length - 1)].id);
    }
    setLastInput("session closed");
  };

  const pressKey = (label: string) => {
    setLastInput(`${ctrlSticky ? "Ctrl + " : ""}${altSticky ? "Alt + " : ""}${label}  ·  sent`);
  };

  const changeZoom = (delta: number) => {
    setZoom((value) => Math.min(160, Math.max(70, value + delta)));
  };

  const currentSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const dockItems = ["Chat", "Terminal", "N8N", "Config"];

  if (minimized) {
    return (
      <div className="min-h-[100dvh] w-full p-4 sm:p-6" style={{ ...themeStyle, background: "var(--hok-bg)", color: "var(--hok-ink)" }}>
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-5xl flex-col items-center justify-center">
          <div
            className="group relative flex flex-col items-center gap-3"
            style={{ zIndex: SHELL_LAYERS.keysBarMinimized }}
          >
            <button
              type="button"
              onClick={() => setMinimized(false)}
              aria-label="Restore HOK terminal"
              className="flex h-[74px] w-[74px] items-center justify-center rounded-2xl border transition-transform duration-200 hover:-translate-y-1 active:scale-95"
              style={{ background: "var(--hok-panel)", borderColor: "var(--hok-accent)", color: "var(--hok-accent)", boxShadow: "0 10px 32px rgba(0,0,0,.28)" }}
            >
              <Terminal size={26} strokeWidth={1.7} />
              <span className="absolute right-[-3px] top-[-3px] h-2.5 w-2.5 rounded-full border-2" style={{ background: "var(--hok-tmux)", borderColor: "var(--hok-bg)" }} />
            </button>
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-[0.12em]">HOK TERMINAL</p>
              <p className="mt-1 text-[10px]" style={{ color: "var(--hok-muted)" }}>session minimized · {currentSession.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="mt-8 flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-white/5"
            style={{ color: "var(--hok-muted)" }}
          >
            <Minimize2 size={13} /> Restore instrument
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-[100dvh] w-full overflow-hidden text-sm"
      style={{
        ...themeStyle,
        background: "var(--hok-bg)",
        color: "var(--hok-ink)",
        fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col">
        <header
          className={`${maximized ? "hidden" : "flex"} h-[62px] shrink-0 items-center justify-between border-b px-4 sm:px-6`}
          style={{ borderColor: "var(--hok-line)", background: "var(--hok-panel)", zIndex: SHELL_LAYERS.terminalTabs }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--hok-accent)", color: "var(--hok-bg)" }}>
              <Command size={17} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold tracking-[0.16em]">HOK OS</span>
                <span className="hidden rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] sm:inline" style={{ color: "var(--hok-accent)", borderColor: "var(--hok-accent-soft)" }}>Hokmá ecosystem</span>
              </div>
              <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--hok-muted)" }}>micro SaaS command surface / {sessions.length} sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 rounded-md border p-1" style={{ borderColor: "var(--hok-line)", background: "var(--hok-bg)" }}>
              <button type="button" aria-label="Decrease zoom" disabled={zoom <= 70} onClick={() => changeZoom(-10)} className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 disabled:opacity-30">
                <Minus size={13} />
              </button>
              <span className="w-9 text-center font-mono text-[10px]" style={{ color: "var(--hok-muted)" }}>{zoom}%</span>
              <button type="button" aria-label="Increase zoom" disabled={zoom >= 160} onClick={() => changeZoom(10)} className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-white/10 disabled:opacity-30">
                <Plus size={13} />
              </button>
            </div>
            <button
              type="button"
              onClick={cyclePalette}
              title={`Cycle palette · ${paletteName}`}
              className="flex h-8 items-center gap-2 rounded-md border px-2.5 text-[10px] font-semibold transition-colors hover:bg-white/10"
              style={{ borderColor: "var(--hok-line)", color: "var(--hok-ink)" }}
            >
              <Palette size={14} style={{ color: "var(--hok-accent)" }} />
              <span className="hidden sm:inline">{paletteName}</span>
            </button>
            <button type="button" onClick={() => setMinimized(true)} title="Minimize terminal to floating icon" className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-white/10" style={{ borderColor: "var(--hok-line)", color: "var(--hok-muted)" }}>
              <Minimize2 size={14} />
            </button>
          </div>
        </header>

        <section className={`${maximized ? "fixed inset-0 flex" : "flex min-h-0 flex-1"} flex-col`} style={{ zIndex: SHELL_LAYERS.terminalContent, background: "var(--hok-bg)" }}>
          <div
            className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto border-b px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderColor: "var(--hok-line)", background: "var(--hok-panel)", zIndex: SHELL_LAYERS.terminalTabs }}
          >
            <SectionLabel>sessions</SectionLabel>
            <div className="h-5 w-px shrink-0" style={{ background: "var(--hok-line)" }} />
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => { setActiveSessionId(session.id); setLastInput(`attached ${session.name}`); }}
                className="group flex h-8 min-w-[148px] shrink-0 items-center gap-2 rounded-md border px-2.5 text-left transition-colors"
                style={{
                  color: session.id === activeSessionId ? "var(--hok-ink)" : "var(--hok-muted)",
                  background: session.id === activeSessionId ? "var(--hok-raised)" : "transparent",
                  borderColor: session.id === activeSessionId ? "var(--hok-accent-soft)" : "transparent",
                }}
              >
                <Circle size={8} fill={session.state === "live" ? "var(--hok-tmux)" : "transparent"} style={{ color: session.state === "live" ? "var(--hok-tmux)" : "var(--hok-muted)" }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold">{session.name}</span>
                  <span className="block truncate font-mono text-[9px]" style={{ color: "var(--hok-muted)" }}>{session.host}</span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Close ${session.name}`}
                  onClick={(event) => { event.stopPropagation(); closeSession(session.id); }}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.stopPropagation(); closeSession(session.id); } }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-50 transition-opacity hover:bg-white/10 hover:opacity-100"
                >
                  <X size={12} />
                </span>
              </button>
            ))}
            <button type="button" aria-label="New terminal session" onClick={addSession} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed transition-colors hover:bg-white/10" style={{ borderColor: "var(--hok-line)", color: "var(--hok-accent)" }}>
              <Plus size={15} />
            </button>
            <div className="ml-auto hidden shrink-0 items-center gap-2 pr-1 sm:flex">
              <span className="font-mono text-[9px]" style={{ color: "var(--hok-muted)" }}>tty/0{currentSession.id}</span>
              <span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: "var(--hok-tmux)" }}><Activity size={11} /> attached</span>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col px-2 pb-[122px] pt-2 sm:px-5 sm:pb-[126px] sm:pt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--hok-tmux)" }} />
                <span className="truncate font-mono text-[10px]" style={{ color: "var(--hok-terminal-muted)" }}>{lastInput}</span>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setLastInput("terminal search is simulated locally")} title="Search terminal" className="rounded p-1 transition-colors hover:bg-white/10" style={{ color: "var(--hok-muted)" }}><Search size={13} /></button>
                <button type="button" onClick={() => setLastInput("terminal buffer copied")} title="Copy terminal buffer" className="rounded p-1 transition-colors hover:bg-white/10" style={{ color: "var(--hok-muted)" }}><Copy size={13} /></button>
                <button type="button" onClick={() => setLastInput("reconnect requested")} title="Reconnect session" className="rounded p-1 transition-colors hover:bg-white/10" style={{ color: "var(--hok-muted)" }}><RotateCcw size={13} /></button>
                <button type="button" onClick={() => setMaximized((value) => !value)} title={maximized ? "Exit full-screen terminal" : "Maximize terminal"} className="rounded p-1 transition-colors hover:bg-white/10" style={{ color: "var(--hok-accent)" }}>
                  {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>
            <div
              className="relative min-h-[360px] flex-1 overflow-hidden rounded-lg border"
              style={{ background: "var(--hok-terminal)", borderColor: "var(--hok-terminal-line)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.025)" }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(var(--hok-terminal-ink) 1px, transparent 1px)", backgroundSize: "100% 24px" }} />
              <div className="relative flex h-full flex-col justify-between p-4 sm:p-6">
                <div className="max-w-xl font-mono text-[11px] leading-[2] sm:text-xs" style={{ color: "var(--hok-terminal-ink)" }}>
                  <div style={{ color: "var(--hok-terminal-muted)" }}>Hokmá micro SaaS / cross-origin ttyd surface</div>
                  <div className="mt-3"><span style={{ color: "var(--hok-tmux)" }}>operator@{currentSession.name}</span><span style={{ color: "var(--hok-terminal-muted)" }}>:</span><span style={{ color: "var(--hok-accent)" }}>~</span><span style={{ color: "var(--hok-terminal-muted)" }}>$</span> systemctl status edge-gateway</div>
                  <div className="mt-1" style={{ color: "var(--hok-tmux)" }}>● edge-gateway.service — active (running)</div>
                  <div style={{ color: "var(--hok-terminal-muted)" }}>   loaded: enabled · uptime: 14d 06h 22m</div>
                  <div style={{ color: "var(--hok-terminal-muted)" }}>   memory: 384.7M · workers: 8 · region: iad-02</div>
                  <div className="mt-3"><span style={{ color: "var(--hok-tmux)" }}>operator@{currentSession.name}</span><span style={{ color: "var(--hok-terminal-muted)" }}>:</span><span style={{ color: "var(--hok-accent)" }}>~</span><span style={{ color: "var(--hok-terminal-muted)" }}>$</span> <span className="inline-block h-3.5 w-[6px] align-[-2px] animate-pulse" style={{ background: "var(--hok-accent)" }} /></div>
                </div>
                <div className="border-t pt-3 font-mono text-[9px]" style={{ borderColor: "var(--hok-terminal-line)", color: "var(--hok-terminal-muted)" }}>
                  cross-origin ttyd placeholder · terminal text is owned by the embedded surface
                </div>
              </div>
              <div
                className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-between border-t px-3 font-mono text-[9px] font-semibold"
                style={{ background: "var(--hok-tmux)", color: "#132016", borderColor: "color-mix(in srgb, var(--hok-tmux) 55%, #000)" }}
              >
                <span className="flex items-center gap-1.5"><ShieldCheck size={11} /> 0:edge-router*</span>
                <span className="hidden sm:inline">HOK / tmux · UTF-8</span>
                <span>14:32:08</span>
              </div>
            </div>
          </div>
        </section>

        <div
          className="fixed inset-x-0 flex justify-center px-2 transition-[bottom] duration-200 sm:px-5"
          style={{
            bottom: keyboardOpen ? "min(48vh, 380px)" : "56px",
            zIndex: expandedKeys ? SHELL_LAYERS.keysBarExpanded : SHELL_LAYERS.keysBarMinimized,
          }}
        >
          <div className="w-full max-w-[1440px] rounded-t-xl border px-2 pb-2 pt-2 sm:px-4" style={{ background: "color-mix(in srgb, var(--hok-panel) 96%, transparent)", borderColor: "var(--hok-line)", boxShadow: "0 -8px 30px rgba(0,0,0,.16)", backdropFilter: "blur(12px)" }}>
            {expandedKeys && (
              <div className="mb-2 flex max-h-[124px] flex-wrap gap-1.5 overflow-y-auto border-b pb-2 sm:max-h-none" style={{ borderColor: "var(--hok-line)" }}>
                {extraKeys.map((key) => (
                  <KeyButton key={key} label={key} active={key === "Alt" && altSticky} wide={key.length > 5} onClick={() => key === "Alt" ? setAltSticky((value) => !value) : pressKey(key)} />
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="mr-1 hidden shrink-0 items-center gap-1.5 sm:flex">
                <SectionLabel>{keyboardOpen ? "keyboard up" : "keys"}</SectionLabel>
                <span className="h-3 w-px" style={{ background: "var(--hok-line)" }} />
              </div>
              <KeyButton label="Ctrl" active={ctrlSticky} onClick={() => setCtrlSticky((value) => !value)} />
              {specialKeys.slice(1).map((key) => (
                <KeyButton key={key.label} label={key.label} wide={key.label.length > 3} onClick={() => pressKey(key.short)} />
              ))}
              <button type="button" aria-label={expandedKeys ? "Collapse extra keys" : "Expand extra keys"} aria-expanded={expandedKeys} onClick={() => setExpandedKeys((value) => !value)} className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors hover:bg-white/10" style={{ borderColor: "var(--hok-line)", color: expandedKeys ? "var(--hok-accent)" : "var(--hok-muted)" }}>
                <MoreHorizontal size={16} />
              </button>
              <button type="button" aria-pressed={keyboardOpen} onClick={() => setKeyboardOpen((value) => !value)} title="Toggle simulated virtual keyboard" className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-[10px] font-semibold transition-colors hover:bg-white/10" style={{ borderColor: keyboardOpen ? "var(--hok-accent-soft)" : "var(--hok-line)", color: keyboardOpen ? "var(--hok-accent)" : "var(--hok-muted)" }}>
                <Keyboard size={14} /> <span className="hidden sm:inline">{keyboardOpen ? "keyboard up" : "virtual keys"}</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 flex h-14 justify-center border-t" style={{ background: "var(--hok-panel)", borderColor: "var(--hok-line)", zIndex: SHELL_LAYERS.dock }}>
          <div className="flex w-full max-w-lg items-stretch justify-around px-2">
            {dockItems.map((item) => {
              const Icon = iconForDock(item);
              const selected = activeDock === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => { setActiveDock(item); setLastInput(item === "Terminal" ? "terminal focused" : `${item} module is local preview only`); }}
                  className="relative flex min-w-[62px] flex-col items-center justify-center gap-1 px-3 text-[9px] font-semibold tracking-[0.04em] transition-colors"
                  style={{ color: selected ? "var(--hok-accent)" : "var(--hok-muted)" }}
                >
                  {selected && <span className="absolute top-0 h-0.5 w-7 rounded-b" style={{ background: "var(--hok-accent)" }} />}
                  <Icon size={17} strokeWidth={selected ? 2.2 : 1.7} />
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="pointer-events-none fixed bottom-[69px] left-3 hidden items-center gap-2 text-[9px] sm:flex" style={{ color: "var(--hok-muted)", zIndex: SHELL_LAYERS.dock }}>
          <Sparkles size={11} style={{ color: "var(--hok-accent)" }} /> <span>theme vars simulated · {zoom}%</span>
        </div>
      </div>
    </main>
  );
}