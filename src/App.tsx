import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { GatewayClient } from "./gateway/client";
import { listBots, type BotProfile } from "./gateway/profiles";

type Attachment = { role: string; pid: number; host: string; port: number; token: string };
type Connection = { kind: "idle" | "connecting" | "connected" | "error"; detail?: string };

const BOT_COLORS = ["slate", "acid", "paper", "coral", "blue", "sand"] as const;

function botColor(name: string): (typeof BOT_COLORS)[number] {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return BOT_COLORS[hash % BOT_COLORS.length];
}

function initials(bot: BotProfile): string {
  const words = (bot.display_name || bot.name).split(/[\s_-]+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "B";
}

function Icon({ name }: { name: "plus" | "search" | "details" | "arrow" | "refresh" }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4 4" /></>,
    details: <path d="M5 5h14v14H5zM9 9h6M9 12h6M9 15h4" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    refresh: <><path d="M19 7v5h-5M5 17v-5h5" /><path d="M18 12a6 6 0 0 0-10.5-4M6 12a6 6 0 0 0 10.5 4" /></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function App() {
  const [connection, setConnection] = useState<Connection>({ kind: "idle" });
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const client = useRef<GatewayClient | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const findButton = useRef<HTMLButtonElement>(null);
  const searchDialog = useRef<HTMLElement>(null);
  const searchInvoker = useRef<HTMLButtonElement | null>(null);
  const selectedBot = bots.find((bot) => bot.name === selected) ?? null;
  const visibleBots = bots.filter((bot) => `${bot.display_name || ""} ${bot.name} ${bot.description || ""}`.toLowerCase().includes(query.toLowerCase()));

  async function connect() {
    if (connection.kind === "connecting") return;
    setConnection({ kind: "connecting" });
    setSelected(null);
    client.current?.close();
    try {
      const attachment = await invoke<Attachment>("discover_backend");
      const gateway = new GatewayClient(attachment);
      await gateway.connect();
      const profiles = await listBots(gateway);
      client.current = gateway;
      setBots(profiles);
      setConnection({ kind: "connected", detail: attachment.role });
    } catch (error) {
      setBots([]);
      setConnection({ kind: "error", detail: error instanceof Error ? error.message : String(error) });
    }
  }

  useEffect(() => () => client.current?.close(), []);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    if (!searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [...document.querySelectorAll<HTMLElement>(".sidebar, .topbar, .workspace, .inspector")];
    background.forEach((element) => { element.inert = true; });
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => { element.inert = false; });
      const trigger = searchInvoker.current?.offsetParent ? searchInvoker.current : searchTrigger.current?.offsetParent ? searchTrigger.current : findButton.current;
      trigger?.focus();
    };
  }, [searchOpen]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && bots.length) {
        event.preventDefault();
        if (!searchOpen) searchInvoker.current = searchTrigger.current?.offsetParent ? searchTrigger.current : findButton.current;
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") setSearchOpen(false);
      if (event.key === "Tab" && searchOpen && searchDialog.current) {
        const focusable = [...searchDialog.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, [tabindex]:not([tabindex='-1'])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bots.length, searchOpen]);

  function openSearch(invoker: HTMLButtonElement) {
    searchInvoker.current = invoker;
    setSearchOpen(true);
  }

  const connectionText = connection.kind === "connected"
    ? `Local backend · ${connection.detail}`
    : connection.kind === "connecting" ? "Checking local backend…"
    : connection.kind === "error" ? "Connection needs attention" : "Backend not connected";

  return (
    <div className={`app-shell ${detailsOpen ? "with-inspector" : ""}`}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">H</span><strong>HermesBot</strong><span className="edition">LOCAL</span></div>
        <button className="new-chat" disabled={!selectedBot} title={selectedBot ? "Bot Chat is not implemented yet" : "Connect and select a bot first"}><Icon name="plus" />New conversation</button>
        <div className="sidebar-heading"><span>Bot register</span><span>{bots.length.toString().padStart(2, "0")}</span></div>
        {bots.length > 0 && <button ref={searchTrigger} className="search-trigger" onClick={(event) => openSearch(event.currentTarget)}><Icon name="search" /><span>Find a bot</span><kbd>⌘K</kbd></button>}
        <nav className="bot-list" aria-label="Bots">
          {visibleBots.map((bot) => (
            <button className={`bot-row ${selected === bot.name ? "selected" : ""}`} key={bot.name} onClick={() => { setSelected(bot.name); setSearchOpen(false); }} aria-pressed={selected === bot.name}>
              <span className={`avatar ${botColor(bot.name)}`}>{initials(bot)}</span>
              <span className="bot-copy"><strong>{bot.display_name || bot.name}</strong><small>{bot.model || "Backend default"}</small></span>
              {bot.is_default && <span className="default-mark" title="Default bot">D</span>}
            </button>
          ))}
          {bots.length > 0 && visibleBots.length === 0 && <p className="sidebar-empty">No bots match “{query}”.</p>}
        </nav>
        <div className="group-placeholder"><div className="sidebar-heading"><span>Group jobs</span><span>00</span></div><p>Group Chat joins this register in a later milestone.</p></div>
        <div className={`backend-state ${connection.kind}`}><span className="status-mark" />{connectionText}</div>
      </aside>

      <header className="topbar">
        <div className="document-title"><strong>{selectedBot ? selectedBot.display_name || selectedBot.name : "Connection desk"}</strong><span>{selectedBot ? "Bot profile · Chat not connected" : "Local Hermes workspace"}</span></div>
        <div className="top-actions">
          {bots.length > 0 && <button ref={findButton} className="text-button" onClick={(event) => openSearch(event.currentTarget)}><Icon name="search" />Find</button>}
          <button className={`text-button details-toggle ${detailsOpen ? "active" : ""}`} onClick={() => setDetailsOpen((open) => !open)} aria-pressed={detailsOpen}><Icon name="details" />Details</button>
        </div>
      </header>

      <main className="workspace">
        {!selectedBot ? (
          <section className={`connection-sheet ${connection.kind}`} aria-labelledby="connection-title">
            <div className="sheet-register"><span>Hermes / local service</span><span>{connection.kind === "connected" ? "REGISTERED" : "AWAITING CONNECTION"}</span></div>
            <div className="sheet-body">
              <div className="sheet-index" aria-hidden="true">01</div>
              <div className="sheet-copy">
                <h1 id="connection-title">{connection.kind === "error" ? "The backend didn’t answer." : connection.kind === "connected" ? "Your bot register is ready." : "Bring your bots to the desk."}</h1>
                <p>{connection.kind === "error" ? connection.detail : connection.kind === "connected" ? `${bots.length} ${bots.length === 1 ? "bot" : "bots"} found on the attached Hermes backend.${bots.length ? " Select a bot to inspect its profile." : " Create a bot profile in Hermes to get started."}` : "HermesBot attaches to an existing backend on this machine. Your profiles, credentials, and conversations stay with Hermes."}</p>
              </div>
            </div>
            <div className="sheet-action">
              <button className="primary-action" onClick={connect} disabled={connection.kind === "connecting"}>
                {connection.kind === "connecting" ? <Icon name="refresh" /> : <Icon name="arrow" />}
                {connection.kind === "connecting" ? "Connecting to Hermes…" : connection.kind === "error" ? "Try connection again" : connection.kind === "connected" ? "Refresh bot register" : "Connect to Hermes"}
              </button>
              <span>{connection.kind === "error" ? "Check `hermes serve`, then retry. Attached backends are never stopped." : connection.kind === "connecting" ? "Verifying identity and reading profiles." : connection.kind === "connected" && bots.length === 0 ? "No bot profiles are configured. Create one with `hermes profile create`, then refresh." : connection.kind === "idle" ? "Connect to load the local bot register." : "Select a bot from the register to continue."}</span>
            </div>
            <div className="sheet-foot"><span>LOOPBACK ONLY</span><span>TOKEN-SAFE ERRORS</span><span>BACKEND AUTHORITATIVE</span></div>
          </section>
        ) : (
          <section className="bot-sheet" aria-labelledby="bot-title">
            <div className="sheet-register"><span>Bot registration</span><span>{selectedBot.is_default ? "DEFAULT PROFILE" : "NAMED PROFILE"}</span></div>
            <div className="bot-identity"><span className={`avatar large ${botColor(selectedBot.name)}`}>{initials(selectedBot)}</span><div><h1 id="bot-title">{selectedBot.display_name || selectedBot.name}</h1><p>{selectedBot.description || "No description is configured for this bot."}</p></div></div>
            <div className="job-ticket"><span className="ticket-label">Next available job</span><div className="ticket-track"><span className="complete">Profile loaded</span><i /><span>Bot Chat</span><i /><span>Reply</span></div><p>Bot Chat is not implemented yet. This profile is live backend data; no conversation has been created.</p></div>
            <button className="primary-action" disabled title="Bot Chat is not implemented yet"><Icon name="plus" />Bot Chat coming next</button>
          </section>
        )}
      </main>

      {detailsOpen && <aside className="inspector" aria-label="Workspace details">
        <div className="inspector-heading"><strong>{selectedBot ? "Registration notes" : "Service notes"}</strong><span>{selectedBot ? "BOT" : "LOCAL"}</span></div>
        {selectedBot ? <dl>
          <div><dt>Profile name</dt><dd>{selectedBot.name}</dd></div>
          <div><dt>Model</dt><dd>{selectedBot.model || "Backend default"}</dd></div>
          <div><dt>Provider</dt><dd>{selectedBot.provider || "Backend default"}</dd></div>
          <div><dt>Skills</dt><dd>{selectedBot.skill_count ?? "Not reported"}</dd></div>
          <div><dt>Session</dt><dd>No session created</dd></div>
        </dl> : <dl>
          <div><dt>Connection</dt><dd>{connectionText}</dd></div>
          <div><dt>Network</dt><dd>Loopback only</dd></div>
          <div><dt>Backend lifecycle</dt><dd>Attach only. Existing backends stay running.</dd></div>
          <div><dt>Bot register</dt><dd>{connection.kind === "connected" ? `${bots.length} loaded from profiles.list` : "Available after connection"}</dd></div>
        </dl>}
        <div className="inspector-note"><span>Registration rule</span><p>{selectedBot ? "Profile details come directly from Hermes. Bot editing is not enabled in this milestone." : "A successful connection verifies the host identity before any bot data is read."}</p></div>
      </aside>}

      {searchOpen && <div className="search-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
        <section ref={searchDialog} className="search-dialog" role="dialog" aria-modal="true" aria-label="Find a bot">
          <div className="search-field"><Icon name="search" /><input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a bot by name or description…" aria-label="Find a bot" /><kbd>ESC</kbd></div>
          <div className="search-results">{visibleBots.map((bot) => <button className="bot-row" key={bot.name} onClick={() => { setSelected(bot.name); setSearchOpen(false); setQuery(""); }}><span className={`avatar ${botColor(bot.name)}`}>{initials(bot)}</span><span className="bot-copy"><strong>{bot.display_name || bot.name}</strong><small>{bot.description || bot.model || "Backend default"}</small></span><Icon name="arrow" /></button>)}{visibleBots.length === 0 && <p>No bots match “{query}”.</p>}</div>
        </section>
      </div>}
    </div>
  );
}
