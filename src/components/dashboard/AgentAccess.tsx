"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
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
  tools: { name: string; description: string }[];
};

/**
 * "Connect your AI agent" — mints an MCP token so someone can just tell
 * their assistant when they're free (or, for the board, who to confirm)
 * instead of filling in the form themselves.
 *
 * The token is shown once and never again: the server only keeps a hash.
 * Which tools the agent gets is derived from the person's role at call
 * time, so this panel shows what they'd actually be handing over.
 */
export function AgentAccess() {
  const [data, setData] = useState<Overview | null>(null);
  const [fresh, setFresh] = useState<{ name: string; secret: string } | null>(
    null,
  );
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [showTools, setShowTools] = useState(false);
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
    <section className="d-panel d-settings">
      <h2>Connect your AI agent</h2>
      <p>
        Give an assistant like Claude access to LOGICA and it can do this for
        you — tell it when you&apos;re free and it fills in your availability
        itself. It only ever gets the tools for your role
        {data ? ` (${data.role.toLowerCase()})` : ""}.
      </p>

      <div className="d-agent-url">
        <span>
          <small>Server URL</small>
          <code>{url}</code>
        </span>
        <button className="d-button secondary" onClick={() => copy("url", url)}>
          {copied === "url" ? "Copied" : "Copy"}
        </button>
      </div>

      {fresh && (
        <div className="d-agent-secret" role="status">
          <strong>
            <Icon name="check" /> {fresh.name} is connected
          </strong>
          <p>
            Copy this token into your agent now — it won&apos;t be shown again.
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
          placeholder="Name it — “Claude on my laptop”"
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="d-button" disabled={busy}>
          {busy ? "Working…" : "Create token"}
        </button>
      </form>

      {!!data?.tools.length && (
        <>
          <button
            className="d-text-button d-standalone"
            aria-expanded={showTools}
            onClick={() => setShowTools(!showTools)}
          >
            {showTools ? "Hide" : "Show"} what your agent can do (
            {data.tools.length} tools)
          </button>
          {showTools && (
            <ul className="d-tool-list">
              {data.tools.map((t) => (
                <li key={t.name}>
                  <code>{t.name}</code>
                  <span>{t.description}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
