"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { Icon } from "./Icon";
import {
  type BoardItem,
  type Budgets,
  type ClubInsights,
  type Event,
  type Member,
  type Officer,
  type SessionUser,
  type Speaker,
  date,
  money,
  OFFICER_LABEL,
  personName,
  relativeDay,
  STAGE_LABEL,
  stageTone,
} from "./types";

/**
 * The board's front page.
 *
 * Everyone on the board can open everything — an officer title only decides
 * what's pinned at the top, so the treasurer lands on the money and the
 * outreach lead lands on who's waiting for a reply. Underneath, it's the
 * same page for everyone: what's on you, then how the club is doing.
 */

type Props = {
  user: SessionUser;
  members: Member[] | null;
  events: Event[] | null;
  speakers: Speaker[] | null;
};

export function BoardHome({ user, members, events, speakers }: Props) {
  const [items, setItems] = useState<BoardItem[] | null>(null);
  const [budgets, setBudgets] = useState<Budgets | null>(null);
  const [insights, setInsights] = useState<ClubInsights | null>(null);

  useEffect(() => {
    let alive = true;
    const soak = <T,>(set: (v: T) => void) => (d: T) => alive && set(d);
    // Each widget fails on its own — one dead endpoint must not blank the page.
    api<BoardItem[]>("/api/board/items").then(soak(setItems)).catch(() => alive && setItems([]));
    api<Budgets>("/api/board/budgets").then(soak(setBudgets)).catch(() => {});
    api<ClubInsights>("/api/board/insights").then(soak(setInsights)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const me = members?.find((m) => m.id === user.id) ?? null;
  const officer = me?.officer ?? null;
  const live = items?.filter((i) => !i.archivedAt) ?? [];
  const mine = live
    .filter((i) => i.ownerId === user.id || i.nextStepAt)
    .sort((a, b) => (a.nextStepAt ?? "9999").localeCompare(b.nextStepAt ?? "9999"))
    .slice(0, 6);

  const pot = budgets?.budgets[0] ?? null;
  const awaiting = live.filter((i) => i.kind === "MONEY" && i.stage === "REQUESTED");
  const needsReply = live.filter((i) => i.stage === "NEEDS_REPLY");
  const toDecide = speakers?.filter((s) => s.status === "PENDING" && s.availabilityConfirmedAt) ?? [];

  return (
    <>
      <Heading
        title={greeting(user.name, officer)}
        description={
          officer
            ? `You're down as ${OFFICER_LABEL[officer].toLowerCase()} — that's what's pinned first. Everything else is still yours to open.`
            : "Everything the club is carrying right now. Nothing here is hidden from anyone on the board."
        }
      />

      <div className="d-board-pin">
        {pinsFor(officer, {
          pot,
          awaiting: awaiting.length,
          needsReply: needsReply.length,
          toDecide: toDecide.length,
          insights,
          live: live.length,
        }).map((pin) => (
          <Link key={pin.label} href={pin.href} className="d-pin">
            <span className="d-pin-icon">
              <Icon name={pin.icon} />
            </span>
            <strong className={pin.money ? "d-money" : undefined}>{pin.value}</strong>
            <span>{pin.label}</span>
            {pin.note && <small>{pin.note}</small>}
          </Link>
        ))}
      </div>

      {/* align-items: start via d-columns-top — a short waiting list should
          not stretch its panel to match the two stacked on the right. */}
      <div className="d-columns d-columns-top">
        <section className="d-panel">
          <div className="d-section-head">
            <h2>What&apos;s waiting</h2>
            <Link className="d-text-link" href="/dashboard/pipeline">
              All of it ↗
            </Link>
          </div>
          {items === null ? (
            <p className="d-muted">Loading…</p>
          ) : mine.length === 0 ? (
            <Empty title="Nothing is waiting on anyone">
              Give something an owner and a date and it turns up here.
            </Empty>
          ) : (
            <ul className="d-waiting">
              {mine.map((item) => (
                <li key={item.id}>
                  <Link href={item.kind === "MONEY" ? "/dashboard/money" : "/dashboard/pipeline"}>
                    <span className="d-task-circle gold">
                      <Icon name={item.kind === "MONEY" ? "money" : "pipeline"} />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        <span className={`d-badge ${stageTone(item.stage)}`}>
                          {STAGE_LABEL[item.stage] ?? item.stage}
                        </span>
                        {item.ownerId === user.id ? " yours" : ` ${personName(item.owner) ?? "unassigned"}`}
                        {item.kind === "MONEY" && item.amountCents !== null && ` · ${money(item.amountCents)}`}
                      </small>
                    </span>
                    {item.nextStepAt && (
                      <span className={overdue(item.nextStepAt) ? "d-overdue" : "d-muted"}>
                        {relativeDay(item.nextStepAt)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div>
          <section className="d-panel">
            <div className="d-section-head">
              <h2>The club right now</h2>
              <Link className="d-text-link" href="/dashboard/insights">
                Insights ↗
              </Link>
            </div>
            {insights ? (
              <dl className="d-stats">
                <div>
                  <dt>Members</dt>
                  <dd>{insights.members.total}</dd>
                </div>
                <div>
                  <dt>Still active</dt>
                  <dd>
                    {insights.members.active}
                    <span>{insights.members.activeWindowDays}-day window</span>
                  </dd>
                </div>
                <div>
                  <dt>Events run</dt>
                  <dd>{insights.events.length}</dd>
                </div>
              </dl>
            ) : (
              <p className="d-muted">Loading…</p>
            )}
          </section>

          <section className="d-panel">
            <div className="d-section-head">
              <h2>Next up</h2>
              <Link className="d-text-link" href="/dashboard/events">
                Calendar ↗
              </Link>
            </div>
            {upcoming(events).length === 0 ? (
              <p className="d-muted">Nothing on the calendar yet.</p>
            ) : (
              <ul className="d-event-row-list">
                {upcoming(events)
                  .slice(0, 3)
                  .map((event) => (
                    <li className="d-event-row" key={event.id}>
                      <span className="d-date-tile">
                        <small>{date(event.startsAt, { month: "short" })}</small>
                        <strong>{date(event.startsAt, { day: "numeric" })}</strong>
                      </span>
                      <span>
                        <strong>{event.title}</strong>
                        <small>{event.location || "Location to come"}</small>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function overdue(value: string) {
  return new Date(value).getTime() < Date.now();
}

function upcoming(events: Event[] | null) {
  const now = Date.now();
  return (events ?? []).filter((e) => new Date(e.startsAt).getTime() >= now);
}

function greeting(name: string | null, officer: Officer | null) {
  const first = name?.split(" ")[0];
  if (officer === "TREASURER") return first ? `The money, ${first}.` : "The money.";
  if (officer === "OUTREACH") return first ? `Who's waiting, ${first}.` : "Who's waiting.";
  if (officer === "SECRETARY") return first ? `The record, ${first}.` : "The record.";
  return first ? `Running the club, ${first}.` : "Running the club.";
}

type Pin = {
  label: string;
  value: string | number;
  href: string;
  icon: "money" | "pipeline" | "speakers" | "insights" | "documents" | "members";
  note?: string;
  money?: boolean;
};

/**
 * Four tiles, ordered by what this person is responsible for. The set is
 * the same for everyone — only the order changes — so nobody has to learn
 * a different home when they swap jobs next year.
 */
function pinsFor(
  officer: Officer | null,
  data: {
    pot: Budgets["budgets"][number] | null;
    awaiting: number;
    needsReply: number;
    toDecide: number;
    insights: ClubInsights | null;
    live: number;
  },
): Pin[] {
  const { pot, awaiting, needsReply, toDecide, insights } = data;

  const budget: Pin = {
    label: pot ? `left of ${money(pot.amountCents)}` : "No budget set",
    value: pot ? money(pot.remainingCents) : "—",
    href: "/dashboard/money",
    icon: "money",
    note: pot?.owedBackCents ? `${money(pot.owedBackCents)} owed back to people` : undefined,
    money: true,
  };
  const approvals: Pin = {
    label: awaiting === 1 ? "cost to approve" : "costs to approve",
    value: awaiting,
    href: "/dashboard/money",
    icon: "money",
  };
  const replies: Pin = {
    label: needsReply === 1 ? "conversation needs a reply" : "conversations need a reply",
    value: needsReply,
    href: "/dashboard/pipeline",
    icon: "pipeline",
  };
  const guests: Pin = {
    label: toDecide === 1 ? "guest to decide on" : "guests to decide on",
    value: toDecide,
    href: "/dashboard/speakers",
    icon: "speakers",
  };
  const active: Pin = {
    label: "members still turning up",
    value: insights ? insights.members.active : "—",
    href: "/dashboard/insights",
    icon: "insights",
    note: insights ? `${insights.members.lapsed} have gone quiet` : undefined,
  };
  const docs: Pin = {
    label: "the club's documents",
    value: "Drive",
    href: "/dashboard/documents",
    icon: "documents",
  };

  if (officer === "TREASURER") return [budget, approvals, replies, active];
  if (officer === "OUTREACH") return [replies, guests, budget, active];
  if (officer === "SECRETARY") return [active, docs, guests, budget];
  if (officer === "PRESIDENT") return [active, budget, replies, guests];
  return [replies, budget, guests, active];
}
