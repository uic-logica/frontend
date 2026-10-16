"use client";

import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { useConfirm } from "./useConfirm";
import { useUrlState } from "./useUrlState";
import { type BlogPost, type SessionUser, date, initials, runsWorkspace } from "./types";
import { Arrow } from "./Icon";

const LABEL: Record<BlogPost["status"], string> = {
  DRAFT: "Draft",
  SUBMITTED: "In review",
  PUBLISHED: "Live",
  REJECTED: "Sent back",
};
const tone = (status: BlogPost["status"]) =>
  status === "PUBLISHED" ? "confirmed" : status === "REJECTED" ? "declined" : "pending";
const paragraphs = (body: string) => body.split(/\n\s*\n/).filter((p) => p.trim());

/**
 * Members write posts here and send them to the exec board; exec gets a
 * Review tab to publish them on /blog or send them back with a note.
 */
export function Blog({ user }: { user: SessionUser | null }) {
  const [view, setView] = useUrlState("view", "mine");
  const exec = !!user && runsWorkspace(user);
  return (
    <>
      <Heading
        title="Blog"
        description={
          exec && view === "review"
            ? "Posts members sent in. Publish them to the site or send them back with a note."
            : "Write a post for logicauic.org/blog. The exec board reviews it before it goes live."
        }
      />
      {exec && (
        <div className="d-tabs d-stage-tabs" aria-label="Blog view">
          <button aria-pressed={view !== "review"} onClick={() => setView("mine")}>My posts</button>
          <button aria-pressed={view === "review"} onClick={() => setView("review")}>Review</button>
        </div>
      )}
      {exec && view === "review" ? <Review /> : <MyPosts />}
    </>
  );
}

function MyPosts() {
  const [items, setItems] = useState<BlogPost[] | null>(() => peek<BlogPost[]>("/api/blog/mine") ?? null);
  const [openId, setOpenId] = useUrlState("id");
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    let alive = true;
    api<BlogPost[]>("/api/blog/mine")
      .then((data) => alive && (setItems(data), setError("")))
      .catch((e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [reload]);

  // "new" opens an empty editor; otherwise the picked post, else the newest.
  const creating = openId === "new" || items?.length === 0;
  const detail = creating ? null : (items?.find((p) => p.id === openId) ?? items?.[0] ?? null);

  return (
    <>
      {confirmDialog}
      {error && (
        <p className="d-error" role="alert">
          {error}{" "}
          {!items && <button className="d-text-button" onClick={() => setReload((v) => v + 1)}>Retry loading</button>}
        </p>
      )}
      {(items || !error) && (
        <div className="d-split">
          <section className="d-panel d-split-list" aria-label="Your posts">
            <div className="d-blog-new">
              <button className="d-button" aria-pressed={creating} onClick={() => setOpenId("new", { push: true })}>New post</button>
            </div>
            {!items && <p className="d-muted" role="status">Loading your posts…</p>}
            {items?.length === 0 && <Empty title="No posts yet">Your drafts and submitted posts show up here.</Empty>}
            {!!items?.length && (
              <ul>
                {items.map((post) => (
                  <li key={post.id}>
                    <button aria-current={detail?.id === post.id ? "true" : undefined} aria-controls="blog-editor" onClick={() => setOpenId(post.id, { push: true })}>
                      <span>
                        <strong>{post.title}</strong>
                        <small>Edited {date(post.updatedAt)}</small>
                      </span>
                      <span className="d-split-meta">
                        <span className={`d-badge ${tone(post.status)}`}>{LABEL[post.status]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {(creating || detail) && (
            <Editor
              key={detail?.id ?? "new"}
              post={detail}
              confirm={confirm}
              onSaved={(post) => {
                setOpenId(post?.id ?? "");
                setReload((v) => v + 1);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}

function Editor({
  post,
  confirm,
  onSaved,
}: {
  post: BlogPost | null;
  confirm: ReturnType<typeof useConfirm>[0];
  onSaved: (post: BlogPost | null) => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const live = post?.status === "PUBLISHED";

  async function save(submit?: boolean) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const next = await api<BlogPost>(post ? `/api/blog/mine/${post.id}` : "/api/blog/mine", {
        method: post ? "PATCH" : "POST",
        body: JSON.stringify({ title, body, ...(submit !== undefined && { submit }) }),
      });
      setSaved(submit ? "Sent to the exec board. You'll get a notification when they decide." : submit === false ? "Pulled back to a draft." : "Draft saved.");
      onSaved(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!post) return;
    if (!(await confirm({ title: `Delete "${post.title}"?`, body: "The post and its text are gone for good.", action: "Delete", danger: true }))) return;
    setBusy(true);
    try {
      await api(`/api/blog/mine/${post.id}`, { method: "DELETE" });
      onSaved(null);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section id="blog-editor" className="d-panel d-split-detail" aria-label={post ? `Edit ${post.title}` : "New post"}>
      {post && (
        <div className="d-blog-status">
          <span className={`d-badge ${tone(post.status)}`}>{LABEL[post.status]}</span>
          {post.status === "SUBMITTED" && <span className="d-muted">The exec board has it. You can still edit it.</span>}
          {live && post.slug && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">View on the site <Arrow /></a>}
        </div>
      )}
      {post?.reviewNote && post.status === "REJECTED" && (
        <p className="d-callout" role="note"><strong>Note from the exec board:</strong> {post.reviewNote}</p>
      )}
      {live && <p className="d-muted">This post is live. Ask an exec to unpublish it if it needs changes.</p>}
      {saved && <p className="d-success" role="status">{saved}</p>}
      {error && <p className="d-error" role="alert">{error}</p>}
      <form
        className="d-form"
        onSubmit={(event) => {
          event.preventDefault();
          void save(post?.status === "SUBMITTED" ? undefined : true);
        }}
      >
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} disabled={live} />
        </label>
        <label>
          Post
          <textarea
            className="d-blog-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={20000}
            rows={16}
            disabled={live}
            aria-describedby="blog-body-hint"
          />
        </label>
        <p id="blog-body-hint" className="d-muted">Plain text. Leave a blank line between paragraphs.</p>
        {!live && (
          <div className="d-actions" aria-busy={busy}>
            <button className="d-button" type="submit" disabled={busy}>
              {post?.status === "SUBMITTED" ? "Save changes" : "Submit for review"}
            </button>
            {post?.status !== "SUBMITTED" && (
              <button className="d-button secondary" type="button" disabled={busy || !title.trim() || !body.trim()} onClick={() => save()}>
                Save draft
              </button>
            )}
            {post?.status === "SUBMITTED" && (
              <button className="d-button secondary" type="button" disabled={busy} onClick={() => save(false)}>
                Withdraw
              </button>
            )}
            {post && (
              <button className="d-button secondary danger" type="button" disabled={busy} onClick={remove}>
                Delete
              </button>
            )}
          </div>
        )}
      </form>
    </section>
  );
}

const REVIEW_TABS = ["SUBMITTED", "PUBLISHED", "REJECTED"] as const;

function Review() {
  const [items, setItems] = useState<BlogPost[] | null>(() => peek<BlogPost[]>("/api/blog/review") ?? null);
  const [tab, setTab] = useUrlState("status", "SUBMITTED");
  const [openId, setOpenId] = useUrlState("id");
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [sendingBack, setSendingBack] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    let alive = true;
    api<BlogPost[]>("/api/blog/review")
      .then((data) => alive && (setItems(data), setError("")))
      .catch((e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [reload]);

  const filtered = items?.filter((p) => p.status === tab);
  // The decided post stays open after it moves tabs, so the next click never lands on someone else.
  const detail = items?.find((p) => p.id === openId) ?? filtered?.[0];

  async function decide(post: BlogPost, action: "publish" | "reject" | "unpublish", reviewNote = "") {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await api(`/api/blog/review/${post.id}`, { method: "PATCH", body: JSON.stringify({ action, note: reviewNote }) });
      setOpenId(post.id);
      setSaved(action === "publish" ? "Published. It's on /blog now." : action === "reject" ? "Sent back to the author with your note." : "Taken off the site and sent back to the author.");
      setSendingBack(false);
      setNote("");
      setReload((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {confirmDialog}
      {error && !items && (
        <p className="d-error" role="alert">
          {error} <button className="d-text-button" onClick={() => setReload((v) => v + 1)}>Retry loading</button>
        </p>
      )}
      <div className="d-split-toolbar">
        <div className="d-tabs d-stage-tabs" aria-label="Filter posts by status">
          {REVIEW_TABS.map((value) => (
            <button key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setOpenId(""); }}>
              {LABEL[value]} <span>{items ? items.filter((p) => p.status === value).length : "—"}</span>
            </button>
          ))}
        </div>
      </div>
      {(items || !error) && (
        <div className="d-split">
          <section className="d-panel d-split-list" aria-label="Posts to review">
            {!items && <p className="d-muted" role="status">Loading posts…</p>}
            {filtered?.length === 0 && (
              <Empty title={tab === "SUBMITTED" ? "Nothing waiting" : "Nothing here"}>
                {tab === "SUBMITTED" ? "Posts members submit show up here." : "Try another tab."}
              </Empty>
            )}
            {!!filtered?.length && (
              <ul>
                {filtered.map((post) => (
                  <li key={post.id}>
                    <button
                      aria-current={detail?.id === post.id ? "true" : undefined}
                      aria-controls="blog-review"
                      onClick={() => { setOpenId(post.id, { push: true }); setSaved(""); setSendingBack(false); }}
                    >
                      <span className="d-avatar">{initials(post.author?.name ?? null)}</span>
                      <span>
                        <strong>{post.title}</strong>
                        <small>{post.author?.name ?? "Member"}</small>
                      </span>
                      <span className="d-split-meta">
                        <time dateTime={post.publishedAt ?? post.submittedAt ?? post.updatedAt}>{date(post.publishedAt ?? post.submittedAt ?? post.updatedAt)}</time>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {detail && (
            <section id="blog-review" className="d-panel d-split-detail" aria-labelledby="blog-review-title">
              <div className="d-blog-status">
                <span className={`d-badge ${tone(detail.status)}`}>{LABEL[detail.status]}</span>
                <span className="d-muted">
                  {detail.author?.name ?? "Member"}
                  {detail.submittedAt && ` · sent ${date(detail.submittedAt, { month: "long", day: "numeric" })}`}
                </span>
                {detail.status === "PUBLISHED" && detail.slug && <a href={`/blog/${detail.slug}`} target="_blank" rel="noreferrer">View on the site <Arrow /></a>}
              </div>
              {saved && <p className="d-success" role="status">{saved}</p>}
              {error && items && <p className="d-error" role="alert">{error}</p>}
              <article className="d-blog-read">
                <h2 id="blog-review-title">{detail.title}</h2>
                {paragraphs(detail.body).map((p, i) => <p key={i}>{p}</p>)}
              </article>
              {detail.reviewNote && detail.status === "REJECTED" && (
                <p className="d-callout" role="note"><strong>Your note:</strong> {detail.reviewNote}</p>
              )}
              {sendingBack && (
                <form className="d-review-form" onSubmit={(e) => { e.preventDefault(); void decide(detail, detail.status === "PUBLISHED" ? "unpublish" : "reject", note.trim()); }}>
                  <label htmlFor="blog-review-note">{detail.status === "PUBLISHED" ? "Why is it coming down? (the author sees this)" : "What should the author change?"}</label>
                  <textarea id="blog-review-note" required={detail.status !== "PUBLISHED"} maxLength={2000} rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="d-actions">
                    <button className="d-button" type="submit" disabled={busy}>{detail.status === "PUBLISHED" ? "Unpublish" : "Send back"}</button>
                    <button className="d-button secondary" type="button" onClick={() => setSendingBack(false)}>Cancel</button>
                  </div>
                </form>
              )}
              {!sendingBack && detail.status !== "REJECTED" && (
                <div className="d-actions" aria-busy={busy}>
                  {detail.status === "SUBMITTED" && (
                    <button
                      className="d-button"
                      disabled={busy}
                      onClick={async () => {
                        if (await confirm({ title: `Publish "${detail.title}"?`, body: "It goes live on logicauic.org/blog with the author's name.", action: "Publish" }))
                          void decide(detail, "publish");
                      }}
                    >
                      Publish
                    </button>
                  )}
                  <button className={`d-button secondary${detail.status === "PUBLISHED" ? " danger" : ""}`} disabled={busy} onClick={() => setSendingBack(true)}>
                    {detail.status === "PUBLISHED" ? "Unpublish…" : "Send back…"}
                  </button>
                </div>
              )}
              {detail.status === "REJECTED" && <p className="d-muted">Back with the author. It returns here when they submit again.</p>}
            </section>
          )}
        </div>
      )}
    </>
  );
}
