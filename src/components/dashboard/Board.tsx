"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { Icon } from "./Icon";
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
    title: "Where the money goes.",
    description:
      "Every cost the club takes on, from the moment someone asks for it to the moment it's paid back.",
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
    title: "Who we're talking to.",
    description:
      "Companies, speakers and partners — where each conversation got to, and whose move it is next.",
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

  const [items, setItems] = useState<BoardItem[] | null>(null);
  const [budgets, setBudgets] = useState<Budgets | null>(null);
  const [stage, setStage] = useState("ALL");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
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

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    setError("");
    try {
      await api(`/api/board/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function archive(id: string) {
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

  return (
    <>
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
          className="d-panel d-form"
          onSubmit={(e) => {
            e.preventDefault();
            create(new FormData(e.currentTarget));
          }}
        >
          <h2>{copy.formTitle}</h2>
          <p>{copy.formHelp}</p>
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

      {error && (
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
        </div>
        <div className="d-table-scroll">
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
                    <strong>{item.title}</strong>
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
                      <span className="sr-only"> {item.title}</span> ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          item={detail}
          kind={kind}
          members={members}
          busy={busy === detail.id}
          onClose={() => setOpen(null)}
          budgets={budgets}
          onPatch={(body) => patch(detail.id, body)}
          onArchive={() => archive(detail.id)}
        />
      )}
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

function Detail({
  item,
  kind,
  members,
  budgets,
  busy,
  onClose,
  onPatch,
  onArchive,
}: {
  item: BoardItem;
  kind: BoardKind;
  members: Member[] | null;
  budgets: Budgets | null;
  busy: boolean;
  onClose: () => void;
  onPatch: (body: Record<string, unknown>) => void;
  onArchive: () => void;
}) {
  const stages = STAGES[kind];
  let next: string | undefined = stages[stages.indexOf(item.stage) + 1];
  // The last stage of each list is the "didn't happen" one — reachable from
  // the dropdown, but not offered as the natural next step.
  if (next === stages[stages.length - 1]) next = undefined;
  // Nothing to pay back on a club-card purchase; that path only exists for
  // someone who was out of pocket.
  if (next === "REIMBURSED" && !item.paidByUserId) next = undefined;

  return (
    <section className="d-panel d-speaker-detail">
      <div className="d-section-head">
        <h2>{item.title}</h2>
        <button className="d-text-button" onClick={onClose}>
          Close details
        </button>
      </div>

      <dl>
        <div>
          <dt>Stage</dt>
          <dd>
            <span className={`d-badge ${stageTone(item.stage)}`}>
              {STAGE_LABEL[item.stage] ?? item.stage}
            </span>
            {item.stageChangedBy && (
              <small className="d-muted">
                {" "}
                by {personName(item.stageChangedBy)}
                {item.stageChangedAt && ` · ${date(item.stageChangedAt)}`}
              </small>
            )}
          </dd>
        </div>
        {kind === "MONEY" ? (
          <>
            <div>
              <dt>Amount</dt>
              <dd className="d-money">
                {money(item.amountCents, { cell: true })}
              </dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{item.budget?.label ?? "Not counted against a budget"}</dd>
            </div>
            <div>
              <dt>Paid out of pocket by</dt>
              <dd>{personName(item.paidBy) ?? "Nobody — club card"}</dd>
            </div>
            <div>
              <dt>Receipt</dt>
              <dd>
                {item.receiptUrl ? (
                  <a
                    href={item.receiptUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Open receipt ↗
                  </a>
                ) : (
                  "None attached"
                )}
              </dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>Company</dt>
              <dd>{item.org ?? "—"}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                {item.contactName ?? "—"}
                {item.contactEmail && (
                  <>
                    {" · "}
                    <a href={`mailto:${item.contactEmail}`}>
                      {item.contactEmail}
                    </a>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Reached via</dt>
              <dd>
                {item.channel ?? "—"}
                {item.link && (
                  <>
                    {" · "}
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Open ↗
                    </a>
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>What for</dt>
              <dd>{item.category ?? "—"}</dd>
            </div>
            <div>
              <dt>Last spoke</dt>
              <dd>
                {item.lastTouchAt ? date(item.lastTouchAt) : "Not recorded"}
              </dd>
            </div>
          </>
        )}
        <div>
          <dt>Event</dt>
          <dd>{item.event?.title ?? "Not tied to one"}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{item.detail || "None"}</dd>
        </div>
      </dl>

      {/* `d-form` as well as the grid: the label-stacking and input styling
          both hang off .d-form, and this panel isn't a form element.

          Everything the API accepts on a PATCH is editable here. Three of
          these were read-only rows in the <dl> above with no way to set
          them, while the page told you to "open a cost to put it on a
          budget" and the detail showed "Receipt — none attached". */}
      <div className="d-form d-form-grid">
        {kind === "MONEY" && (
          <>
            <label>
              Counts against
              <select
                value={item.budgetId ?? ""}
                disabled={busy}
                onChange={(e) => onPatch({ budgetId: e.target.value })}
              >
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
              <select
                value={item.paidByUserId ?? ""}
                disabled={busy}
                onChange={(e) => onPatch({ paidByUserId: e.target.value })}
              >
                <option value="">Nobody — club card</option>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Receipt link
              {/* Keyed on the saved value: these are uncontrolled, so
                  without it they keep whatever was typed and go stale when
                  the row changes underneath — another exec editing, or the
                  same person's agent doing it over MCP. */}
              <input
                key={item.receiptUrl ?? ""}
                type="url"
                defaultValue={item.receiptUrl ?? ""}
                disabled={busy}
                placeholder="https://drive.google.com/…"
                onBlur={(e) =>
                  e.target.value !== (item.receiptUrl ?? "") &&
                  onPatch({ receiptUrl: e.target.value })
                }
              />
            </label>
            <label>
              Amount
              <input
                key={item.amountCents ?? ""}
                type="number"
                step="0.01"
                min="0"
                defaultValue={
                  item.amountCents === null
                    ? ""
                    : (item.amountCents / 100).toFixed(2)
                }
                disabled={busy}
                onBlur={(e) => {
                  const cents =
                    e.target.value === ""
                      ? null
                      : Math.round(Number(e.target.value) * 100);
                  if (cents !== item.amountCents)
                    onPatch({ amountCents: cents });
                }}
              />
            </label>
          </>
        )}
        <label>
          Whose move is it
          <select
            value={item.ownerId ?? ""}
            disabled={busy}
            onChange={(e) => onPatch({ ownerId: e.target.value })}
          >
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
          <input
            key={item.nextStepAt ?? ""}
            type="date"
            disabled={busy}
            defaultValue={item.nextStepAt ? item.nextStepAt.slice(0, 10) : ""}
            onChange={(e) => onPatch({ nextStepAt: e.target.value })}
          />
        </label>
        <label>
          Move to
          <select
            value={item.stage}
            disabled={busy}
            onChange={(e) => onPatch({ stage: e.target.value })}
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABEL[s] ?? s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="d-actions">
        {next && (
          <button
            className="d-button"
            disabled={busy}
            onClick={() => onPatch({ stage: next })}
          >
            <Icon name="check" /> {STAGE_LABEL[next] ?? next}
          </button>
        )}
        <button className="d-text-button" disabled={busy} onClick={onArchive}>
          Archive
        </button>
      </div>
      <p className="d-footnote">
        Archiving keeps the record and takes it off the board — nothing here is
        ever deleted.
      </p>
    </section>
  );
}

/** Reused by the board home for the "waiting on you" list. */
export function itemInitials(item: BoardItem) {
  return initials(item.org || item.title);
}
