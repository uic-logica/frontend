"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { ReceiptScan, type ScannedReceipt } from "./ReceiptScan";
import { useConfirm } from "./useConfirm";
import { useUrlState } from "./useUrlState";
import { Arrow, Icon } from "./Icon";
import {
  type BoardItem,
  type BoardKind,
  type Budgets,
  type Event,
  type Member,
  date,
  initials,
  money,
  OUTREACH_CATEGORIES,
  OUTREACH_CHANNELS,
  personName,
  relativeDay,
  STAGE_LABEL,
  STAGES,
  stageTone,
} from "./types";

/**
 * Money and outreach are the same screen.
 *
 * A spend and a company we're talking to are both "a thing at a stage that
 * somebody owns and owes a next move on", so one component renders both and
 * only the columns differ. Two near-identical files would drift the first
 * time someone changed the stage filter in one of them.
 *
 * Built out of the speaker directory's vocabulary — summary strip, toolbar,
 * table, detail panel underneath — because that pattern already works here
 * and a board member shouldn't have to learn a second one.
 */

type Props = {
  kind: BoardKind;
  members: Member[] | null;
  events: Event[] | null;
};

const COPY = {
  MONEY: {
    title: "Money",
    description: "Know what is available, committed, reimbursable, and waiting for approval.",
    add: "+ Log a cost",
    formTitle: "Log a cost",
    formHelp:
      "What it is and roughly what it costs. It starts as a request — approve it once the board has.",
    searchLabel: "Search costs",
    searchPlaceholder: "Search what it's for, a note, a vendor…",
    emptyTitle: "Nothing logged yet",
    emptyBody: "Log the first cost and the budget starts keeping itself.",
  },
  OUTREACH: {
    title: "Pipeline",
    description: "Companies, sponsors and partner clubs we're talking to. Once someone's coming to speak, turn their card into a guest.",
    add: "+ Add a contact",
    formTitle: "Add a contact",
    formHelp:
      "A company or a person we want in front of the club. It starts as a prospect.",
    searchLabel: "Search contacts",
    searchPlaceholder: "Search company, person, note…",
    emptyTitle: "No conversations yet",
    emptyBody: "Add the first company and the pipeline starts here.",
  },
} as const;

export function Board({ kind, members, events }: Props) {
  const copy = COPY[kind];
  const stages = STAGES[kind];

  const [items, setItems] = useState<BoardItem[] | null>(() => peek<BoardItem[]>(`/api/board/items?kind=${kind}`) ?? null);
  const [budgets, setBudgets] = useState<Budgets | null>(() => (kind === "MONEY" ? peek<Budgets>("/api/board/budgets") ?? null : null));
  // In the URL, so refresh, Back and a pasted link keep the open item and filters.
  const [stage, setStage] = useUrlState("stage", "ALL");
  const [query, setQuery] = useUrlState("q");
  const [openId, setOpenId] = useUrlState("id");
  // Table or board is a per-person habit, so it's remembered on this device.
  const [view, setViewState] = useState<"table" | "board">(() => {
    try {
      return localStorage.getItem(`logica-board-view-${kind}`) === "board" ? "board" : "table";
    } catch {
      return "table";
    }
  });
  const setView = (v: "table" | "board") => {
    setViewState(v);
    try {
      localStorage.setItem(`logica-board-view-${kind}`, v);
    } catch {}
  };
  const [saved, setSaved] = useState("");
  const [confirm, confirmDialog] = useConfirm();
  const open = openId || null;
  const setOpen = (id: string | null) => {
    setSaved("");
    setError("");
    setOpenId(id ?? "", { push: !!id });
  };
  const [adding, setAdding] = useState(false);
  const [newTerm, setNewTerm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    // Not cleared first: on a refresh after an edit, keeping the old rows
    // on screen until the new ones land is steadier than blanking the
    // table. Switching pipelines remounts (see the key in Dashboard.tsx),
    // so MONEY rows can never show under OUTREACH.
    api<BoardItem[]>(`/api/board/items?kind=${kind}`)
      .then((d) => alive && (setItems(d), setError("")))
      .catch((e: Error) => alive && setError(e.message));
    if (kind === "MONEY") {
      api<Budgets>("/api/board/budgets")
        .then((d) => alive && setBudgets(d))
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [kind, reload]);
  const refresh = () => setReload((v) => v + 1);

  const filtered = useMemo(() => {
    if (!items) return null;
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (stage !== "ALL" && item.stage !== stage) return false;
      if (!needle) return true;
      return [
        item.title,
        item.detail,
        item.org,
        item.contactName,
        item.contactEmail,
        item.channel,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [items, stage, query]);

  const counts = useMemo(() => {
    const at = (s: string) => items?.filter((i) => i.stage === s).length ?? 0;
    if (kind === "MONEY") {
      const pot = budgets?.budgets[0];
      const loose = budgets?.unbudgeted;
      // Money filed under no budget still left the account. Showing only the
      // budget's own total would tell the treasurer they have more than they
      // do — so the strip is the real position, and the bar below is the
      // budget on its own.
      const spent = (pot?.spentCents ?? 0) + (loose?.spentCents ?? 0);
      const pending = (pot?.pendingCents ?? 0) + (loose?.pendingCents ?? 0);
      return [
        ["Budget", pot ? money(pot.amountCents) : "—"],
        ["Spent", budgets ? money(spent) : "—"],
        ["Committed", budgets ? money(pending) : "—"],
        ["Left", pot ? money(pot.amountCents - spent - pending) : "—"],
        [
          "Owed back",
          budgets
            ? money((pot?.owedBackCents ?? 0) + (loose?.owedBackCents ?? 0))
            : "—",
        ],
      ] as const;
    }
    return [
      ["Conversations", items?.length ?? "—"],
      ["Needs a reply", at("NEEDS_REPLY")],
      ["Scheduled", at("SCHEDULED")],
      ["Landed", at("DONE")],
    ] as const;
  }, [items, budgets, kind]);

  const addForm = useRef<HTMLFormElement>(null);
  /** Fill the empty fields of the new cost from a scanned receipt; anything typed already stays. */
  function fillFromReceipt(r: ScannedReceipt) {
    const f = addForm.current;
    if (!f) return;
    const set = (name: string, value: string | null | undefined, always = false) => {
      const el = f.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el && value && (always || !el.value)) el.value = value;
    };
    set("title", r.vendor);
    set("amount", r.total != null ? r.total.toFixed(2) : null);
    set("receiptUrl", r.url, true);
    set("detail", [r.date && `Receipt dated ${r.date}`, r.vendor && `from ${r.vendor}`].filter(Boolean).join(" ") || null);
  }

  async function create(form: FormData) {
    setBusy("create");
    setError("");
    const body: Record<string, unknown> = {
      kind,
      title: String(form.get("title") ?? ""),
      detail: String(form.get("detail") ?? ""),
    };
    if (kind === "MONEY") {
      const dollars = String(form.get("amount") ?? "").trim();
      // The form takes dollars because that is what a receipt says; the API
      // takes cents because no total should ever be a float.
      if (dollars) body.amountCents = Math.round(Number(dollars) * 100);
      if (form.get("paidByUserId"))
        body.paidByUserId = form.get("paidByUserId");
      if (budgets?.budgets[0]) body.budgetId = budgets.budgets[0].id;
      if (form.get("receiptUrl")) body.receiptUrl = form.get("receiptUrl");
    } else {
      body.org = String(form.get("org") ?? "");
      body.contactName = String(form.get("contactName") ?? "");
      body.contactEmail = String(form.get("contactEmail") ?? "");
      body.channel = String(form.get("channel") ?? "");
      body.category = String(form.get("category") ?? "");
      body.link = String(form.get("link") ?? "");
    }
    if (form.get("eventId")) body.eventId = form.get("eventId");
    try {
      await api("/api/board/items", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setAdding(false);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, note = "Saved.") {
    setBusy(id);
    setError("");
    setSaved("");
    try {
      const updated = await api<BoardItem>(`/api/board/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      // Show the saved row at once; the refresh below catches anything else.
      setItems((rows) => rows?.map((row) => (row.id === id ? updated : row)) ?? rows);
      setSaved(note);
      refresh();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  }

  // Pipeline is for organizations; a person who'll speak belongs in the
  // Speaker directory. This starts their guest entry from the card.
  async function toGuest(item: BoardItem) {
    const category = (item.category ?? "").toLowerCase();
    const kind = category === "workshop" ? "WORKSHOP" : category === "company visit" ? "COMPANY_VISIT" : "TALK";
    if (
      !(await confirm({
        title: `Start a guest entry for ${item.contactName || item.org || item.title}?`,
        body: "It goes into the Speaker directory as a draft with this card's contact and company, so you can send them an invite link and track the visit there. This card stays here.",
        action: "Create guest",
      }))
    )
      return;
    setBusy(item.id);
    setError("");
    try {
      const draft = await api<{ id: string }>("/api/speakers/drafts", {
        method: "POST",
        body: JSON.stringify({
          kind,
          ...(item.contactName ? { name: item.contactName } : {}),
          ...(item.contactEmail ? { email: item.contactEmail } : {}),
          organization: item.org || item.title,
        }),
      });
      // A full load on purpose: the Speaker directory's list is loaded once and
      // kept, so a client-side push would open it without the new guest in it.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/dashboard/speakers?id=${draft.id}`;
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function archive(id: string) {
    if (
      !(await confirm({
        title: "Archive this?",
        body: "It comes off the board. The record is kept, nothing is deleted.",
        action: "Archive",
      }))
    )
      return;
    setBusy(id);
    setError("");
    try {
      await api(`/api/board/items/${id}`, { method: "DELETE" });
      setOpen(null);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  /**
   * The money section is exec-only and POST /api/board/budgets is exec-only,
   * so everyone who can see this can do it. Until now the page said "an exec
   * can add one" and offered no way to — a budget could not be created
   * through the product at all.
   */
  async function createBudget(form: FormData) {
    setBusy("budget");
    setError("");
    try {
      const dollars = Number(String(form.get("amount") ?? "").trim());
      if (!Number.isFinite(dollars) || dollars < 0) {
        throw new Error("Give the term a budget in dollars.");
      }
      await api("/api/board/budgets", {
        method: "POST",
        body: JSON.stringify({
          label: String(form.get("label") ?? ""),
          amountCents: Math.round(dollars * 100),
          startsAt: String(form.get("startsAt") ?? ""),
          endsAt: String(form.get("endsAt") ?? ""),
        }),
      });
      setNewTerm(false);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const detail = items?.find((i) => i.id === open) ?? null;
  const hasDetail = !!detail;
  // When the detail stacks under the list, bring it into view.
  useEffect(() => {
    if (open && matchMedia("(max-width: 1200px)").matches)
      requestAnimationFrame(() => document.getElementById("board-detail")?.scrollIntoView());
  }, [open, hasDetail]);

  return (
    <>
      {confirmDialog}
      <Heading
        title={copy.title}
        description={copy.description}
        action={
          <button className="d-button" onClick={() => setAdding(!adding)}>
            {adding ? "Close" : copy.add}
          </button>
        }
      />

      <div className="d-directory-summary">
        {counts.map(([label, value]) => (
          <div key={label}>
            <strong className={kind === "MONEY" ? "d-money" : undefined}>
              {value}
            </strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {kind === "MONEY" && budgets?.budgets[0] && (
        <BudgetBar
          budget={budgets.budgets[0]}
          onNewTerm={() => setNewTerm(!newTerm)}
          newTermOpen={newTerm}
        />
      )}

      {kind === "MONEY" && !!unbudgeted(budgets) && (
        <p className="d-footnote">
          {money(unbudgeted(budgets))} of that isn&apos;t filed under a budget,
          so the bar above doesn&apos;t count it. Open one and set &ldquo;counts
          against&rdquo; to fix that.
        </p>
      )}

      {kind === "MONEY" && budgets && !budgets.budgets.length && !newTerm && (
        <section className="d-panel d-note-panel">
          <span className="d-note-icon">
            <Icon name="money" />
          </span>
          <div>
            <h2>No budget set yet</h2>
            <p>
              Costs are still tracked without one — they just aren&apos;t
              counted against anything, so nothing can tell you what&apos;s
              left.
            </p>
            <button className="d-button" onClick={() => setNewTerm(true)}>
              Set this term&apos;s budget
            </button>
          </div>
        </section>
      )}

      {kind === "MONEY" && newTerm && (
        <form
          className="d-panel d-form"
          onSubmit={(e) => {
            e.preventDefault();
            createBudget(new FormData(e.currentTarget));
          }}
        >
          <h2>
            {budgets?.budgets.length
              ? "Start a new term"
              : "Set this term's budget"}
          </h2>
          <p>
            What the club has to spend between these dates. Costs filed against
            it draw it down; the balance is worked out on the fly, so a
            correction here can never leave a stale number behind.
          </p>
          <div className="d-form-grid">
            <label>
              Term
              <input
                name="label"
                required
                placeholder="Fall 2026"
                maxLength={120}
              />
            </label>
            <label>
              Amount
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="4000"
              />
            </label>
            <label>
              Starts
              <input name="startsAt" type="date" required />
            </label>
            <label>
              Ends
              <input name="endsAt" type="date" required />
            </label>
          </div>
          <div className="d-actions">
            <button className="d-button" disabled={busy === "budget"}>
              {busy === "budget" ? "Saving…" : "Save budget"}
            </button>
            <button
              type="button"
              className="d-text-button"
              onClick={() => setNewTerm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {adding && (
        <form
          ref={addForm}
          className="d-panel d-form"
          onSubmit={(e) => {
            e.preventDefault();
            create(new FormData(e.currentTarget));
          }}
        >
          <h2>{copy.formTitle}</h2>
          <p>{copy.formHelp}</p>
          {kind === "MONEY" && (
            <>
              <ReceiptScan onScanned={fillFromReceipt} />
              <input type="hidden" name="receiptUrl" />
            </>
          )}
          <div className="d-form-grid">
            <label>
              {kind === "MONEY" ? "What's it for" : "What is this"}
              <input
                name="title"
                required
                placeholder={
                  kind === "MONEY"
                    ? "Pizza for the Aon visit"
                    : "Zebra — spring workshop"
                }
              />
            </label>
            {kind === "MONEY" ? (
              <>
                <label>
                  Amount
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="84.50"
                  />
                </label>
                <label>
                  Fronted by
                  <select name="paidByUserId" defaultValue="">
                    <option value="">Nobody — club card</option>
                    {members?.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.email}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label>
                  Company
                  <input name="org" placeholder="Zebra" />
                </label>
                <label>
                  Contact
                  <input
                    name="contactName"
                    placeholder="Who we're talking to"
                  />
                </label>
                <label>
                  Their email
                  <input name="contactEmail" type="email" />
                </label>
                <label>
                  How we reached them
                  <select name="channel" defaultValue="">
                    <option value="">—</option>
                    {OUTREACH_CHANNELS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  What for
                  <select name="category" defaultValue="">
                    <option value="">—</option>
                    {OUTREACH_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Link
                  <input
                    name="link"
                    type="url"
                    placeholder="https://linkedin.com/in/…"
                  />
                </label>
              </>
            )}
            <label>
              Event
              <select name="eventId" defaultValue="">
                <option value="">Not tied to one</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea name="detail" rows={2} />
          </label>
          <button className="d-button" disabled={busy === "create"}>
            {busy === "create" ? "Saving…" : copy.formTitle}
          </button>
        </form>
      )}

      {error && !detail && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}

      {/* Stage is the question people actually arrive with, so it's the
          primary control rather than a dropdown inside the toolbar. */}
      <div
        className="d-tabs d-stage-tabs"
        role="group"
        aria-label="Filter by stage"
      >
        <button aria-pressed={stage === "ALL"} onClick={() => setStage("ALL")}>
          All <span>{items?.length ?? 0}</span>
        </button>
        {stages.map((s) => {
          const n = items?.filter((i) => i.stage === s).length ?? 0;
          return (
            <button
              key={s}
              aria-pressed={stage === s}
              onClick={() => setStage(s)}
            >
              {STAGE_LABEL[s] ?? s} <span>{n}</span>
            </button>
          );
        })}
      </div>

      <div className={detail ? "d-board-split" : undefined}>
      <section className="d-panel d-directory">
        <div className="d-directory-toolbar">
          <label className="d-search">
            <span className="sr-only">{copy.searchLabel}</span>
            <input
              placeholder={copy.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="d-segmented" role="group" aria-label="Layout">
            {(["table", "board"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "table" ? "Table" : "Board"}
              </button>
            ))}
          </div>
        </div>
        {view === "board" && !!filtered?.length && (
          <div
            className="d-kanban"
            tabIndex={0}
            role="region"
            aria-label={`${copy.title} by stage`}
          >
            {(stage === "ALL" ? stages : [stage]).map((s) => {
              const column = filtered.filter((i) => i.stage === s);
              return (
                <section key={s} aria-labelledby={`stage-${s}`}>
                  <h3 id={`stage-${s}`}>
                    <span className={`d-badge ${stageTone(s)}`}>
                      {STAGE_LABEL[s] ?? s}
                    </span>
                    <span>{column.length}</span>
                  </h3>
                  <ul>
                    {column.map((item) => (
                      <li key={item.id}>
                        <button
                          className="d-kanban-card"
                          aria-expanded={open === item.id}
                          aria-current={open === item.id ? "true" : undefined}
                          onClick={() => setOpen(item.id)}
                        >
                          <strong>{item.title}</strong>
                          <small>
                            {[
                              kind === "MONEY"
                                ? money(item.amountCents, { cell: true })
                                : item.org || item.category,
                              personName(item.owner) ?? "Unassigned",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                          {item.nextStepAt && (
                            <small
                              className={
                                isOverdue(item.nextStepAt)
                                  ? "d-overdue"
                                  : undefined
                              }
                            >
                              Next: {relativeDay(item.nextStepAt)}
                            </small>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
        {/* Focusable: below ~680px this scrolls sideways, and a scroll
            container a keyboard can't reach is a WCAG 2.1.1 failure. */}
        {view === "table" && (
        <div className="d-table-scroll" tabIndex={0} role="region" aria-label={copy.searchLabel}>
          <table>
            <thead>
              <tr>
                <th>{kind === "MONEY" ? "What for" : "Who"}</th>
                <th>{kind === "MONEY" ? "Amount" : "What for"}</th>
                <th>Stage</th>
                <th>Owner</th>
                <th>Next</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button className="d-row-link" aria-current={open === item.id ? "true" : undefined} onClick={() => setOpen(item.id)}>
                      <strong>{item.title}</strong>
                    </button>
                    {kind === "OUTREACH" && item.org && (
                      <small>{item.org}</small>
                    )}
                    {kind === "MONEY" && item.paidBy && (
                      <small>fronted by {personName(item.paidBy)}</small>
                    )}
                  </td>
                  <td className={kind === "MONEY" ? "d-money" : undefined}>
                    {kind === "MONEY"
                      ? money(item.amountCents, { cell: true })
                      : item.category || "—"}
                  </td>
                  <td>
                    <span className={`d-badge ${stageTone(item.stage)}`}>
                      {STAGE_LABEL[item.stage] ?? item.stage}
                    </span>
                  </td>
                  <td>
                    {personName(item.owner) ?? (
                      <span className="d-muted">Unassigned</span>
                    )}
                  </td>
                  <td>
                    {item.nextStepAt ? (
                      <span
                        className={
                          isOverdue(item.nextStepAt) ? "d-overdue" : undefined
                        }
                      >
                        {relativeDay(item.nextStepAt)}
                      </span>
                    ) : (
                      <span className="d-muted">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="d-text-button"
                      aria-expanded={open === item.id}
                      onClick={() => setOpen(open === item.id ? null : item.id)}
                    >
                      {open === item.id ? "Close" : "Open"}
                      <span className="sr-only"> {item.title}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        {filtered?.length === 0 && (
          <Empty
            title={items?.length ? "Nothing at this stage" : copy.emptyTitle}
          >
            {items?.length
              ? "Try another stage or a different search."
              : copy.emptyBody}
          </Empty>
        )}
        {!items && !error && <p className="d-muted">Loading…</p>}
      </section>

      {detail && (
        <Detail
          key={detail.id}
          item={detail}
          kind={kind}
          members={members}
          events={events}
          busy={busy === detail.id}
          saved={saved}
          error={error}
          onClose={() => setOpen(null)}
          budgets={budgets}
          onPatch={(body, note) => patch(detail.id, body, note)}
          onArchive={() => archive(detail.id)}
          onToGuest={() => toGuest(detail)}
        />
      )}
      </div>
    </>
  );
}

function isOverdue(value: string) {
  return new Date(value).getTime() < Date.now();
}

/** Money that's real but sits outside every budget. */
function unbudgeted(budgets: Budgets | null) {
  if (!budgets) return 0;
  return budgets.unbudgeted.spentCents + budgets.unbudgeted.pendingCents;
}

/** The gold <progress> the identity card already uses — no new bar. */
function BudgetBar({
  budget,
  onNewTerm,
  newTermOpen,
}: {
  budget: Budgets["budgets"][number];
  onNewTerm: () => void;
  newTermOpen: boolean;
}) {
  const used = budget.spentCents + budget.pendingCents;
  const over = budget.remainingCents < 0;
  return (
    <section className="d-panel d-budget">
      <div className="d-progress-label">
        <span>
          {budget.label} —{" "}
          <strong className="d-money">{money(budget.remainingCents)}</strong>{" "}
          left
          <button className="d-text-button d-term-button" onClick={onNewTerm}>
            {newTermOpen ? "Cancel" : "New term"}
          </button>
        </span>
        <span className="d-muted">
          {money(budget.spentCents)} spent
          {budget.pendingCents > 0 &&
            ` · ${money(budget.pendingCents)} committed`}
          {" of "}
          {money(budget.amountCents)}
        </span>
      </div>
      <progress
        value={Math.min(used, budget.amountCents)}
        max={budget.amountCents || 1}
      />
      {over && (
        <p className="d-error" role="status">
          This term is over budget by {money(-budget.remainingCents)}.
        </p>
      )}
      {budget.owedBackCents > 0 && (
        <p className="d-footnote">
          {money(budget.owedBackCents)} is owed back to people who paid out of
          pocket.
        </p>
      )}
    </section>
  );
}

/** A <input type="date"> value from an ISO timestamp, or "". */
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

function Detail({
  item,
  kind,
  members,
  events,
  budgets,
  busy,
  saved,
  error,
  onClose,
  onPatch,
  onArchive,
  onToGuest,
}: {
  item: BoardItem;
  kind: BoardKind;
  members: Member[] | null;
  events: Event[] | null;
  budgets: Budgets | null;
  busy: boolean;
  saved: string;
  error: string;
  onClose: () => void;
  onPatch: (body: Record<string, unknown>, note?: string) => Promise<boolean>;
  onArchive: () => void;
  onToGuest: () => void;
}) {
  const stages = STAGES[kind];
  let next: string | undefined = stages[stages.indexOf(item.stage) + 1];
  // The last stage of each list is the "didn't happen" one — reachable from
  // the dropdown, but not offered as the natural next step.
  if (next === stages[stages.length - 1]) next = undefined;
  // Nothing to pay back on a club-card purchase; that path only exists for
  // someone who was out of pocket.
  if (next === "REIMBURSED" && !item.paidByUserId) next = undefined;
  // Bumped on Cancel so the uncontrolled fields reset to the saved values.
  const [formKey, setFormKey] = useState(0);
  const [dirty, setDirty] = useState(false);

  // One explicit Save for every field, instead of saving on each blur:
  // nothing is disabled while you type, and a half-typed date never saves.
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !dirty) return;
    const f = new FormData(e.currentTarget);
    const get = (name: string) => String(f.get(name) ?? "");
    const body: Record<string, unknown> = {
      title: get("title"),
      detail: get("detail"),
      ownerId: get("ownerId"),
      nextStepAt: get("nextStepAt"),
      eventId: get("eventId"),
    };
    if (kind === "MONEY") {
      body.amountCents = get("amount") === "" ? null : Math.round(Number(get("amount")) * 100);
      body.budgetId = get("budgetId");
      body.paidByUserId = get("paidByUserId");
      body.receiptUrl = get("receiptUrl");
    } else {
      for (const name of ["org", "contactName", "contactEmail", "channel", "category", "link", "lastTouchAt"]) body[name] = get(name);
    }
    if (await onPatch(body)) setDirty(false);
  }

  return (
    <section id="board-detail" className="d-panel d-speaker-detail d-board-detail" aria-labelledby="board-detail-title">
      <div className="d-section-head">
        <h2 id="board-detail-title">{item.title}</h2>
        <button className="d-text-button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="d-board-stage">
        <span className={`d-badge ${stageTone(item.stage)}`}>{STAGE_LABEL[item.stage] ?? item.stage}</span>
        {item.stageChangedBy && (
          <small className="d-muted">
            {" "}
            by {personName(item.stageChangedBy)}
            {item.stageChangedAt && ` · ${date(item.stageChangedAt)}`}
          </small>
        )}
        <small className="d-muted">
          {" · "}added by{" "}
          {item.createdBy
            ? personName(item.createdBy)
            : item.channel === "Website"
              ? "the website"
              : "a former board member"}
        </small>
      </p>

      <div className="d-actions">
        {next && (
          <button className="d-button" disabled={busy} onClick={() => onPatch({ stage: next }, `Moved to ${STAGE_LABEL[next!] ?? next}.`)}>
            <Icon name="check" /> {STAGE_LABEL[next] ?? next}
          </button>
        )}
        <label className="d-inline-select">
          <span>Move to</span>
          <select value={item.stage} disabled={busy} onChange={(e) => onPatch({ stage: e.target.value }, `Moved to ${STAGE_LABEL[e.target.value] ?? e.target.value}.`)}>
            {stages.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s] ?? s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {saved && !dirty && <p className="d-success" role="status">{saved}</p>}
      {error && <p className="d-error" role="alert">{error}</p>}

      <form key={formKey} className="d-form" onSubmit={save} onChange={() => setDirty(true)}>
        <label>
          {kind === "MONEY" ? "What for" : "Who"}
          <input name="title" required maxLength={200} defaultValue={item.title} />
        </label>
        <div className="d-form-grid">
          {kind === "MONEY" ? (
            <>
              <label>
                Amount
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={item.amountCents === null ? "" : (item.amountCents / 100).toFixed(2)}
                />
              </label>
              <label>
                Counts against
                <select name="budgetId" defaultValue={item.budgetId ?? ""}>
                  <option value="">No budget</option>
                  {budgets?.budgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fronted by
                <select name="paidByUserId" defaultValue={item.paidByUserId ?? ""}>
                  <option value="">Nobody, club card</option>
                  {members?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Receipt link
                <input name="receiptUrl" type="url" defaultValue={item.receiptUrl ?? ""} placeholder="https://drive.google.com/…" />
                {item.receiptUrl && (
                  <a href={item.receiptUrl} target="_blank" rel="noreferrer noopener">
                    Open receipt <Arrow />
                  </a>
                )}
              </label>
            </>
          ) : (
            <>
              <label>
                Company
                <input name="org" maxLength={200} defaultValue={item.org ?? ""} />
              </label>
              <label>
                What for
                <select name="category" defaultValue={item.category ?? ""}>
                  <option value="">Not set</option>
                  {[...new Set([...OUTREACH_CATEGORIES, ...(item.category ? [item.category] : [])])].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Contact name
                <input name="contactName" maxLength={200} defaultValue={item.contactName ?? ""} />
              </label>
              <label>
                Contact email
                <input name="contactEmail" type="email" maxLength={320} defaultValue={item.contactEmail ?? ""} />
              </label>
              <label>
                Reached via
                <select name="channel" defaultValue={item.channel ?? ""}>
                  <option value="">Not set</option>
                  {[...new Set([...OUTREACH_CHANNELS, ...(item.channel ? [item.channel] : [])])].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Link
                <input name="link" type="url" defaultValue={item.link ?? ""} placeholder="https://" />
              </label>
              <label>
                Last spoke
                <input name="lastTouchAt" type="date" defaultValue={day(item.lastTouchAt)} />
              </label>
            </>
          )}
          <label>
            Whose move is it
            <select name="ownerId" defaultValue={item.ownerId ?? ""}>
              <option value="">Nobody yet</option>
              {members?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Next move due
            <input name="nextStepAt" type="date" defaultValue={day(item.nextStepAt)} />
          </label>
          <label>
            Event
            <select name="eventId" defaultValue={item.eventId ?? ""}>
              <option value="">Not tied to one</option>
              {events?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} · {date(e.startsAt)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Notes
          <textarea name="detail" rows={4} maxLength={5000} defaultValue={item.detail ?? ""} />
        </label>
        <div className="d-actions">
          {/* Never disabled: a disabled button drops keyboard focus to the page. */}
          <button className="d-button" aria-busy={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
          {dirty && (
            <button
              type="button"
              className="d-button secondary"
              onClick={() => {
                setFormKey((k) => k + 1);
                setDirty(false);
              }}
            >
              Cancel
            </button>
          )}
          {item.kind === "OUTREACH" && ["talk", "workshop", "company visit"].includes((item.category ?? "").toLowerCase()) && (
            <button type="button" className="d-button secondary" disabled={busy} onClick={onToGuest}>
              Turn into a guest <Arrow />
            </button>
          )}
          <button type="button" className="d-text-button d-push-right" disabled={busy} onClick={onArchive}>
            Archive
          </button>
        </div>
      </form>
      <p className="d-footnote">Archiving keeps the record and takes it off the board. Nothing here is ever deleted.</p>
    </section>
  );
}

/** Reused by the board home for the "waiting on you" list. */
export function itemInitials(item: BoardItem) {
  return initials(item.org || item.title);
}
