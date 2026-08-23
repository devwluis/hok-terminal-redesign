import {
  Activity,
  ArrowDownToLine,
  Check,
  ChevronDown,
  Circle,
  Copy,
  GitCompare,
  Keyboard,
  Link2,
  Maximize2,
  Minus,
  MoreHorizontal,
  Palette,
  PanelRightClose,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  SplitSquareVertical,
  TerminalSquare,
  X,
} from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

type PaletteName = "HOK Dark" | "Mineral" | "High Contrast";

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
    raised: string;
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
    key: string;
  }
> = {
  "HOK Dark": {
    bg: "#0e0f0e",
    panel: "#171917",
    raised: "#222520",
    ink: "#f1ecdf",
    muted: "#98988d",
    line: "#363a31",
    accent: "#e1a84a",
    accentSoft: "#62491f",
    terminal: "#0a0d0b",
    terminalInk: "#e7eadb",
    terminalMuted: "#7f8a78",
    terminalLine: "#293029",
    tmux: "#93cb85",
    key: "#252923",
  },
  Mineral: {
    bg: "#111817",
    panel: "#192321",
    raised: "#24312d",
    ink: "#e6eee4",
    muted: "#8fa39a",
    line: "#3b4d45",
    accent: "#c5c16a",
    accentSoft: "#58603a",
    terminal: "#0b1210",
    terminalInk: "#e1eee3",
    terminalMuted: "#7b9688",
    terminalLine: "#294037",
    tmux: "#9cdaa1",
    key: "#293833",
  },
  "High Contrast": {
    bg: "#111311",
    panel: "#1b1e1b",
    raised: "#292e28",
    ink: "#faf6e7",
    muted: "#b5bcad",
    line: "#4a5348",
    accent: "#f3c96d",
    accentSoft: "#765d2d",
    terminal: "#070a08",
    terminalInk: "#f1f4df",
    terminalMuted: "#9eae98",
    terminalLine: "#465444",
    tmux: "#baf28d",
    key: "#30372f",
  },
};

const INITIAL_SESSIONS: Session[] = [
  { id: 1, name: "edge-router", host: "prod / iad-02", state: "live" },
  { id: 2, name: "log-stream", host: "ops / fra-01", state: "idle" },
  { id: 3, name: "staging", host: "dev / sfo-03", state: "idle" },
];

const LEFT_LINES = [
  { text: "hok ttyd / primary surface", tone: "muted" },
  { text: "operator@edge-router:~$ kubectl get pods -n edge", tone: "prompt" },
  { text: "NAME                         READY   STATUS    AGE", tone: "muted" },
  { text: "edge-gateway-7c9d88f4c9    1/1     Running   14d", tone: "green" },
  { text: "edge-worker-5d8f7bbf88      1/1     Running   14d", tone: "green" },
  { text: "edge-cache-0                1/1     Running   14d", tone: "green" },
  { text: "operator@edge-router:~$ ", tone: "prompt" },
];

const RIGHT_LINES = [
  { text: "hok ttyd / mirrored surface", tone: "muted" },
  { text: "operator@edge-router:~$ watch -n 5 'uptime; free -h'", tone: "prompt" },
  { text: " 14:32:08 up 14 days, 6:22,  8 users,  load average: 0.42", tone: "muted" },
  { text: "               total        used        free      shared", tone: "muted" },
  { text: "Mem:            31Gi        12Gi        6.8Gi       1.2Gi", tone: "green" },
  { text: "Swap:          2.0Gi       0.0Gi       2.0Gi", tone: "green" },
  { text: "watch refreshed · sync channel A", tone: "accent" },
];

function ToolButton({
  label,
  children,
  onClick,
  active = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md border transition-transform duration-150 hover:-translate-y-px active:translate-y-px"
      style={{
        color: active ? "var(--split-accent)" : "var(--split-muted)",
        borderColor: active ? "var(--split-accent-soft)" : "var(--split-line)",
        background: active ? "var(--split-accent-soft)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

function SessionPill({
  session,
  active,
  onClick,
  onClose,
}: {
  session: Session;
  active: boolean;
  onClick: () => void;
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-9 min-w-[150px] shrink-0 items-center gap-2 rounded-md border px-2.5 text-left transition-colors"
      style={{
        color: active ? "var(--split-ink)" : "var(--split-muted)",
        background: active ? "var(--split-raised)" : "transparent",
        borderColor: active ? "var(--split-accent-soft)" : "transparent",
      }}
    >
      <Circle
        size={8}
        fill={session.state === "live" ? "var(--split-tmux)" : "transparent"}
        style={{ color: session.state === "live" ? "var(--split-tmux)" : "var(--split-muted)" }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold">{session.name}</span>
        <span className="block truncate font-mono text-[9px]" style={{ color: "var(--split-muted)" }}>
          {session.host}
        </span>
      </span>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Close ${session.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-40 transition-opacity hover:bg-white/10 hover:opacity-100"
      >
        <X size={12} />
      </span>
    </button>
  );
}

function TerminalPane({
  side,
  sessionName,
  lines,
  focused,
  onFocus,
}: {
  side: "primary" | "mirror";
  sessionName: string;
  lines: { text: string; tone: string }[];
  focused: boolean;
  onFocus: () => void;
}) {
  const toneColor = (tone: string) => {
    if (tone === "green") return "var(--split-tmux)";
    if (tone === "prompt") return "var(--split-terminal-ink)";
    if (tone === "accent") return "var(--split-accent)";
    return "var(--split-terminal-muted)";
  };

  return (
    <article
      className="relative flex min-h-[298px] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border"
      style={{
        background: "var(--split-terminal)",
        borderColor: focused ? "var(--split-accent-soft)" : "var(--split-terminal-line)",
        boxShadow: focused ? "inset 0 0 0 1px color-mix(in srgb, var(--split-accent) 20%, transparent)" : "inset 0 1px 0 rgba(255,255,255,.025)",
      }}
      onClick={onFocus}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(var(--split-terminal-ink) 1px, transparent 1px)", backgroundSize: "100% 24px" }} />
      <header className="relative flex h-9 shrink-0 items-center justify-between border-b px-3" style={{ borderColor: "var(--split-terminal-line)", background: "color-mix(in srgb, var(--split-panel) 62%, transparent)" }}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--split-tmux)" }} />
          <span className="truncate font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "var(--split-terminal-muted)" }}>
            {side}
          </span>
          <span className="font-mono text-[9px]" style={{ color: "var(--split-line)" }}>·</span>
          <span className="truncate font-mono text-[9px]" style={{ color: "var(--split-terminal-muted)" }}>{sessionName}</span>
        </div>
        <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "var(--split-tmux)" }}><Activity size={10} /> ttyd 01</span>
      </header>
      <div className="relative flex-1 p-3 font-mono text-[10px] leading-[1.9] sm:p-4 sm:text-[11px]">
        {lines.map((line, index) => (
          <div key={`${side}-${index}`} className={index === lines.length - 1 ? "mt-3" : index === 1 ? "mt-2" : ""} style={{ color: toneColor(line.tone) }}>
            {line.text}
            {index === lines.length - 1 && side === "primary" && <span className="ml-1 inline-block h-3.5 w-[6px] align-[-2px] animate-pulse" style={{ background: "var(--split-accent)" }} />}
          </div>
        ))}
      </div>
      <footer className="relative flex h-6 shrink-0 items-center justify-between border-t px-3 font-mono text-[9px]" style={{ borderColor: "var(--split-terminal-line)", color: "var(--split-terminal-muted)" }}>
        <span>{focused ? "input focus" : "click to focus"}</span>
        <span>{side === "primary" ? "source" : "mirror · read/write"}</span>
      </footer>
    </article>
  );
}

export default function HokTerminalSplit() {
  const [paletteName, setPaletteName] = useState<PaletteName>("HOK Dark");
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [focusedPane, setFocusedPane] = useState<"primary" | "mirror">("primary");
  const [syncOn, setSyncOn] = useState(true);
  const [keyboardOn, setKeyboardOn] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [command, setCommand] = useState("");
  const [notice, setNotice] = useState("channel A · panes synchronized");
  const [compact, setCompact] = useState(false);

  const palette = PALETTES[paletteName];
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const paletteNames = useMemo(() => Object.keys(PALETTES) as PaletteName[], []);
  const themeStyle = {
    "--split-bg": palette.bg,
    "--split-panel": palette.panel,
    "--split-raised": palette.raised,
    "--split-ink": palette.ink,
    "--split-muted": palette.muted,
    "--split-line": palette.line,
    "--split-accent": palette.accent,
    "--split-accent-soft": palette.accentSoft,
    "--split-terminal": palette.terminal,
    "--split-terminal-ink": palette.terminalInk,
    "--split-terminal-muted": palette.terminalMuted,
    "--split-terminal-line": palette.terminalLine,
    "--split-tmux": palette.tmux,
    "--split-key": palette.key,
  } as CSSProperties;

  const addSession = () => {
    const id = Math.max(...sessions.map((session) => session.id), 0) + 1;
    const next = { id, name: `shell-${String(id).padStart(2, "0")}`, host: "new / local", state: "live" as const };
    setSessions((current) => [...current, next]);
    setActiveSessionId(id);
    setNotice(`opened ${next.name} · split pair ready`);
  };

  const closeSession = (id: number) => {
    if (sessions.length === 1) {
      setNotice("one session must remain attached");
      return;
    }
    const next = sessions.filter((session) => session.id !== id);
    setSessions(next);
    if (id === activeSessionId) setActiveSessionId(next[0].id);
    setNotice("session closed · pair reattached");
  };

  const sendCommand = () => {
    const clean = command.trim();
    if (!clean) {
      setNotice("type a command before sending");
      return;
    }
    setNotice(syncOn ? `sent to primary + mirror · ${clean}` : `sent to ${focusedPane} · ${clean}`);
    setCommand("");
  };

  const cyclePalette = () => {
    const next = paletteNames[(paletteNames.indexOf(paletteName) + 1) % paletteNames.length];
    setPaletteName(next);
    setNotice(`palette changed · ${next}`);
  };

  if (!activeSession) return null;

  return (
    <main className="min-h-[100dvh] w-full overflow-hidden" style={{ ...themeStyle, background: "var(--split-bg)", color: "var(--split-ink)", fontFamily: "'DM Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <div className={`${maximized ? "fixed inset-0 z-50" : "mx-auto min-h-[100dvh] max-w-[1480px]"} flex flex-col`}>
        <header className="flex min-h-[62px] shrink-0 items-center justify-between gap-3 border-b px-3 sm:px-6" style={{ borderColor: "var(--split-line)", background: "var(--split-panel)" }}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--split-accent)", color: "var(--split-bg)" }}><SplitSquareVertical size={17} strokeWidth={2.2} /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold tracking-[0.16em]">HOK OS</span>
                <span className="hidden rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] sm:inline" style={{ color: "var(--split-accent)", borderColor: "var(--split-accent-soft)" }}>split session</span>
              </div>
              <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--split-muted)" }}>paired command surface / {sessions.length} sessions</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={cyclePalette} className="flex h-8 items-center gap-2 rounded-md border px-2.5 text-[10px] font-semibold transition-colors hover:bg-white/10" style={{ borderColor: "var(--split-line)", color: "var(--split-ink)" }}><Palette size={14} style={{ color: "var(--split-accent)" }} /><span className="hidden sm:inline">{paletteName}</span><ChevronDown size={12} style={{ color: "var(--split-muted)" }} /></button>
            <ToolButton label={maximized ? "Exit full screen" : "Maximize split terminal"} onClick={() => setMaximized((value) => !value)} active={maximized}>{maximized ? <PanelRightClose size={14} /> : <Maximize2 size={14} />}</ToolButton>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col" style={{ background: "var(--split-bg)" }}>
          <div className="flex min-h-[52px] shrink-0 items-center gap-2 overflow-x-auto border-b px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ borderColor: "var(--split-line)", background: "var(--split-panel)" }}>
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--split-muted)" }}>sessions</span>
            <span className="h-5 w-px shrink-0" style={{ background: "var(--split-line)" }} />
            {sessions.map((session) => (
              <SessionPill key={session.id} session={session} active={session.id === activeSessionId} onClick={() => { setActiveSessionId(session.id); setNotice(`attached ${session.name} · both panes ready`); }} onClose={() => closeSession(session.id)} />
            ))}
            <button type="button" aria-label="New split session" onClick={addSession} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed transition-colors hover:bg-white/10" style={{ borderColor: "var(--split-line)", color: "var(--split-accent)" }}><Plus size={15} /></button>
            <div className="ml-auto hidden shrink-0 items-center gap-2 pr-1 sm:flex"><span className="font-mono text-[9px]" style={{ color: "var(--split-muted)" }}>pair / 0{activeSession.id}</span><span className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: "var(--split-tmux)" }}><Link2 size={11} /> linked</span></div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-2 pb-4 pt-3 sm:px-5 sm:pt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex min-w-0 items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: syncOn ? "var(--split-tmux)" : "var(--split-accent)" }} /><span className="truncate font-mono text-[10px]" style={{ color: "var(--split-terminal-muted)" }}>{notice}</span></div>
              <div className="flex items-center gap-1.5">
                <ToolButton label="Search paired buffer" onClick={() => setNotice("search is simulated across both ttyd buffers")}><Search size={13} /></ToolButton>
                <ToolButton label="Copy paired buffer" onClick={() => setNotice("paired terminal buffer copied")}><Copy size={13} /></ToolButton>
                <ToolButton label="Reconnect both ttyd surfaces" onClick={() => setNotice("reconnect requested · waiting for ttyd")}><RotateCcw size={13} /></ToolButton>
              </div>
            </div>

            <div className={`${compact ? "gap-1" : "gap-2 sm:gap-3"} flex min-h-0 flex-1 flex-col md:flex-row`}>
              <TerminalPane side="primary" sessionName={activeSession.name} lines={LEFT_LINES} focused={focusedPane === "primary"} onFocus={() => setFocusedPane("primary")} />
              <div className="relative flex h-8 shrink-0 items-center justify-center md:h-auto md:w-7">
                <div className="absolute h-px w-full md:h-full md:w-px" style={{ background: "var(--split-line)" }} />
                <button type="button" aria-label={syncOn ? "Pause synchronization" : "Resume synchronization"} aria-pressed={syncOn} onClick={() => { setSyncOn((value) => !value); setNotice(syncOn ? "sync paused · panes now independent" : "sync resumed · channel A linked"); }} className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:scale-105" style={{ borderColor: syncOn ? "var(--split-tmux)" : "var(--split-line)", background: "var(--split-panel)", color: syncOn ? "var(--split-tmux)" : "var(--split-muted)" }}><Link2 size={12} /></button>
              </div>
              <TerminalPane side="mirror" sessionName={activeSession.name} lines={RIGHT_LINES} focused={focusedPane === "mirror"} onFocus={() => setFocusedPane("mirror")} />
            </div>

            <div className="mt-3 flex flex-col gap-2 rounded-lg border p-2 sm:mt-4 sm:flex-row sm:items-center" style={{ borderColor: "var(--split-line)", background: "var(--split-panel)" }}>
              <div className="flex items-center gap-2 px-1 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--split-muted)" }}><TerminalSquare size={13} style={{ color: "var(--split-accent)" }} /><span>{syncOn ? "broadcast" : focusedPane}</span></div>
              <div className="flex min-w-0 flex-1 items-center rounded-md border" style={{ borderColor: "var(--split-line)", background: "var(--split-terminal)" }}>
                <span className="pl-2 font-mono text-[11px]" style={{ color: "var(--split-tmux)" }}>$</span>
                <input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendCommand(); }} placeholder={syncOn ? "send one command to both ttyd placeholders…" : `send to ${focusedPane} pane…`} className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-[11px] outline-none placeholder:opacity-50" style={{ color: "var(--split-terminal-ink)" }} />
              </div>
              <button type="button" onClick={sendCommand} className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-transform active:scale-[0.97]" style={{ background: "var(--split-accent)", color: "var(--split-bg)" }}><Send size={13} /> Send</button>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[9px]" style={{ color: "var(--split-muted)" }}>
              <div className="flex items-center gap-3"><span className="flex items-center gap-1.5"><GitCompare size={11} style={{ color: "var(--split-accent)" }} /> sequence lock: {syncOn ? "on" : "off"}</span><span className="flex items-center gap-1.5"><ShieldCheck size={11} style={{ color: "var(--split-tmux)" }} /> sandbox preview</span></div>
              <div className="flex items-center gap-2"><span className="font-mono">UTF-8</span><button type="button" onClick={() => { setKeyboardOn((value) => !value); setNotice(keyboardOn ? "virtual keys hidden" : "virtual keys shown below"); }} className="flex items-center gap-1 rounded px-1.5 py-1 font-semibold transition-colors hover:bg-white/10" style={{ color: keyboardOn ? "var(--split-accent)" : "var(--split-muted)" }}><Keyboard size={12} /> {keyboardOn ? "keys up" : "virtual keys"}</button><button type="button" onClick={() => { setCompact((value) => !value); setNotice(compact ? "roomy pane spacing restored" : "compact pane spacing enabled"); }} className="flex items-center gap-1 rounded px-1.5 py-1 font-semibold transition-colors hover:bg-white/10" style={{ color: "var(--split-muted)" }}><MoreHorizontal size={12} /> {compact ? "roomy" : "compact"}</button></div>
            </div>

            {keyboardOn && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto rounded-lg border p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ borderColor: "var(--split-line)", background: "var(--split-panel)" }}>
                {["Ctrl", "Esc", "Tab", "↑", "↓", "←", "→", "Enter", "Ctrl+C", "Ctrl+R"].map((key) => (
                  <button key={key} type="button" onClick={() => setNotice(`${key} sent to ${syncOn ? "primary + mirror" : focusedPane}`)} className="h-8 shrink-0 rounded-md border px-3 font-mono text-[10px] font-semibold transition-colors hover:bg-white/10" style={{ borderColor: "var(--split-line)", background: "var(--split-key)", color: "var(--split-ink)" }}>{key}</button>
                ))}
                <button type="button" aria-label="Hide virtual keys" onClick={() => setKeyboardOn(false)} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: "var(--split-line)", color: "var(--split-muted)" }}><Minus size={13} /></button>
              </div>
            )}
          </div>
        </section>

        <footer className="flex h-12 shrink-0 items-center justify-between border-t px-3 sm:px-6" style={{ background: "var(--split-panel)", borderColor: "var(--split-line)" }}>
          <div className="flex items-center gap-2 font-mono text-[9px]" style={{ color: "var(--split-muted)" }}><span className="flex items-center gap-1.5" style={{ color: "var(--split-tmux)" }}><Check size={11} /> connected</span><span>·</span><span>ttyd placeholders / 2</span></div>
          <div className="flex items-center gap-2 font-mono text-[9px]" style={{ color: "var(--split-muted)" }}><ArrowDownToLine size={11} /><span>14:32:08</span><span className="hidden sm:inline">HOK / tmux</span></div>
        </footer>
      </div>
    </main>
  );
}