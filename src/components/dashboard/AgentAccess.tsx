"use client";
import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { useConfirm } from "./useConfirm";
import { Heading } from "./Overview";
import { Icon } from "./Icon";

type Connection = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
};
type Overview = {
  role: string;
  tokens: Connection[];
  /** Plain lines for this person's own tools; never names or agent text. */
  tools: string[];
  example: string;
};

/**
 * The MCP Connections section — mints a token so someone can just tell
 * their assistant what they want instead of filling in the form themselves.
 *
 * Its own section rather than a panel buried in Settings: what an agent
 * can do as you is worth a page you can read before you hand it over,
 * not a box under your email preferences.
 *
 * The token is shown once and never again — the server keeps only a hash.
 * Which tools it gets is derived from the person's role at call time, and
 * the server sends only that role's lines, so nobody reads what another
 * role's agent could do.
 */
export function AgentAccess() {
  const [confirm, confirmDialog] = useConfirm();
  const [data, setData] = useState<Overview | null>(() => peek<Overview>("/api/mcp-tokens") ?? null);
  const [fresh, setFresh] = useState<{ name: string; secret: string } | null>(
    null,
  );
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [showTools, setShowTools] = useState(true);
  const [reload, setReload] = useState(0);

  const url =
    typeof window === "undefined" ? "" : `${window.location.origin}/api/mcp`;

  useEffect(() => {
    let alive = true;
    api<Overview>("/api/mcp-tokens")
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError("");
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [reload]);
  const load = () => setReload((v) => v + 1);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await api<Connection & { secret: string }>(
        "/api/mcp-tokens",
        { method: "POST", body: JSON.stringify({ name: name.trim() }) },
      );
      setFresh({ name: created.name, secret: created.secret });
      setName("");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (
      !(await confirm({
        title: "Revoke this connection?",
        body: "Any agent using this token stops working at once. You can make a new one any time.",
        action: "Revoke",
        danger: true,
      }))
    )
      return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/mcp-tokens/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  return (
    <>
      {confirmDialog}
      <Heading
        title="MCP Connections"
        description="Connect an AI assistant to your LOGICA account."
      />

      <section className="d-panel d-settings">
        <h2>How to connect</h2>
        <p>
          Point your assistant at the server below and give it a token. Then you
          can just tell it what you want{data && <>, like &ldquo;{data.example}&rdquo;,</>} instead
          of filling in the form yourself.
        </p>

        <div className="d-agent-url">
          <span>
            <small>Server URL</small>
            <code>{url}</code>
          </span>
          <button
            className="d-button secondary"
            onClick={() => copy("url", url)}
          >
            {copied === "url" ? "Copied" : "Copy"}
          </button>
        </div>

        {fresh && (
          <div className="d-agent-secret" role="status">
            <strong>
              <Icon name="check" /> {fresh.name} is connected
            </strong>
            <p>
              Copy this token into your agent now — it won&apos;t be shown
              again.
            </p>
            <div>
              <code>{fresh.secret}</code>
              <button
                className="d-button"
                onClick={() => copy("secret", fresh.secret)}
              >
                {copied === "secret" ? "Copied" : "Copy token"}
              </button>
            </div>
            <button className="d-text-button" onClick={() => setFresh(null)}>
              Done
            </button>
          </div>
        )}

        {error && (
          <p className="d-error" role="alert">
            {error}
          </p>
        )}

        {data?.tokens.map((t) => (
          <div className="d-setting-row" key={t.id}>
            <span>
              <strong>{t.name}</strong>
              <small>
                {t.lastUsedAt
                  ? `Last used ${new Date(t.lastUsedAt).toLocaleDateString()}`
                  : "Never used"}
              </small>
            </span>
            <button
              className="d-text-button"
              disabled={busy}
              onClick={() => revoke(t.id)}
            >
              Revoke
            </button>
          </div>
        ))}

        <form className="d-agent-new" onSubmit={create}>
          <label className="sr-only" htmlFor="agent-name">
            Name this connection
          </label>
          <input
            id="agent-name"
            value={name}
            required
            placeholder="Name it, e.g. “Claude on my laptop”"
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="d-button" disabled={busy}>
            {busy ? "Working…" : "Create token"}
          </button>
        </form>
      </section>

      {/* Its own panel now this is a page of its own, and open by default:
          the whole reason to come here is to see what you'd be handing
          over before you hand it over. */}
      {!!data?.tools.length && (
        <section className="d-panel">
          <div className="d-section-head">
            <h2>What your assistant can do</h2>
            <button
              className="d-text-button"
              aria-expanded={showTools}
              onClick={() => setShowTools(!showTools)}
            >
              {showTools ? "Hide" : "Show"} all {data.tools.length}
            </button>
          </div>
          <p className="d-footnote">
            Exactly this, and nothing else. It&apos;s checked on every call.
          </p>
          {showTools && (
            <ul className="d-tool-list">
              {data.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
