"use client";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import {
  type Member,
  type Officer,
  type SessionUser,
  date,
  initials,
  OFFICER_LABEL,
} from "./types";

const OFFICERS: Officer[] = ["PRESIDENT", "TREASURER", "SECRETARY", "OUTREACH", "OTHER"];

/**
 * The roster. Board members can see who's here and when they last turned
 * up; only exec can change someone's role or officer title, because
 * promoting someone hands them the club's finances.
 */
export function Members({
  user,
  members,
  onChange,
}: {
  user: SessionUser;
  members: Member[] | null;
  onChange: () => void;
}) {
  const isExec = user.role === "EXEC_BOARD";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    if (!members) return null;
    const needle = query.trim().toLowerCase();
    return members.filter((m) => {
      if (filter === "BOARD" && m.role === "MEMBER") return false;
      if (filter === "ACTIVE" && !m.lastSeenAt) return false;
      if (filter === "QUIET" && m.lastSeenAt) return false;
      if (!needle) return true;
      return [m.name, m.email, m.major].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [members, query, filter]);

  async function update(id: string, body: Record<string, unknown>) {
    setBusy(id);
    setError("");
    try {
      await api("/api/board/members", { method: "PATCH", body: JSON.stringify({ id, ...body }) });
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Heading
        title="Who's in the club."
        description={
          isExec
            ? "Everyone signed up, what they do, and when they last turned up. You can change roles here."
            : "Everyone signed up, what they do, and when they last turned up."
        }
      />

      <div className="d-directory-summary">
        <div>
          <strong>{members?.length ?? "—"}</strong>
          <span>Members</span>
        </div>
        <div>
          <strong>{members?.filter((m) => m.role !== "MEMBER").length ?? "—"}</strong>
          <span>On the board</span>
        </div>
        <div>
          <strong>{members?.filter((m) => m.lastSeenAt).length ?? "—"}</strong>
          <span>Have attended</span>
        </div>
        <div>
          <strong>{members?.filter((m) => m.officer).length ?? "—"}</strong>
          <span>Officers</span>
        </div>
      </div>

      {error && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}

      <section className="d-panel d-directory">
        <div className="d-directory-toolbar">
          <label className="d-search">
            <span className="sr-only">Search members</span>
            <input
              placeholder="Search name, email, or major…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="d-filter">
            <span>Show</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">Everyone</option>
              <option value="BOARD">Board and exec</option>
              <option value="ACTIVE">Has attended something</option>
              <option value="QUIET">Never attended</option>
            </select>
          </label>
        </div>
        <div className="d-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Studying</th>
                <th>Attended</th>
                <th>Last seen</th>
                <th>Role</th>
                <th>Officer</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="d-table-person">
                      <span className="d-avatar">{initials(m.name)}</span>
                      <span>
                        <strong>{m.name || "No name yet"}</strong>
                        <small>{m.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    {[m.major, m.gradYear].filter(Boolean).join(" · ") || (
                      <span className="d-muted">Not filled in</span>
                    )}
                  </td>
                  <td>{m.eventsAttended}</td>
                  <td>
                    {m.lastSeenAt ? (
                      <span>
                        {date(m.lastSeenAt)}
                        {m.lastSeenAt_event && <small>{m.lastSeenAt_event}</small>}
                      </span>
                    ) : (
                      <span className="d-muted">Never</span>
                    )}
                  </td>
                  <td>
                    {isExec ? (
                      <select
                        aria-label={`Role for ${m.name || m.email}`}
                        value={m.role}
                        disabled={busy === m.id}
                        onChange={(e) => update(m.id, { role: e.target.value })}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="BOARD">Board</option>
                        <option value="EXEC_BOARD">Exec board</option>
                      </select>
                    ) : (
                      <span className={`d-badge ${m.role === "MEMBER" ? "pending" : "confirmed"}`}>
                        {m.role === "EXEC_BOARD" ? "Exec" : m.role === "BOARD" ? "Board" : "Member"}
                      </span>
                    )}
                  </td>
                  <td>
                    {m.role === "MEMBER" ? (
                      <span className="d-muted">—</span>
                    ) : isExec ? (
                      <select
                        aria-label={`Officer title for ${m.name || m.email}`}
                        value={m.officer ?? ""}
                        disabled={busy === m.id}
                        onChange={(e) => update(m.id, { officer: e.target.value })}
                      >
                        <option value="">No title</option>
                        {OFFICERS.map((o) => (
                          <option key={o} value={o}>
                            {OFFICER_LABEL[o]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      (m.officer && OFFICER_LABEL[m.officer]) || <span className="d-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered?.length === 0 && (
          <Empty title="Nobody matches that">Try a different search or filter.</Empty>
        )}
        {!members && <p className="d-muted">Loading…</p>}
      </section>

      {isExec && (
        <p className="d-footnote">
          An officer title only changes what that person sees first on their
          own dashboard. Everyone on the board can open everything.
        </p>
      )}
    </>
  );
}
