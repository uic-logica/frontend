import type { Metadata } from "next";
import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { blogSlug, firstText, getPost } from "@/lib/blog";
import { eventDate, getEvent, getEvents, rsvpWindowOpen } from "@/lib/events";
import { pageMetadata } from "@/lib/seo";
import { Description } from "../EventsList";
import { EventActions } from "./EventActions";

// Every event page is prerendered and cached like /events, so a click (or the
// link's prefetch) gets finished HTML, not "Loading…". A new event renders on
// its first visit, then is cached too; edits show within 5 minutes.
// ponytail: RSVP window is checked at render, so it can close up to 5 min late.
export async function generateStaticParams() {
  const { upcoming, past } = await getEvents();
  return [...upcoming, ...past].map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { event } = await getEvent(id);
  if (!event) return { title: "Event" };
  const d = eventDate(event.startsAt, event.endsAt);
  return pageMetadata(event.title, [d.full, event.location].filter(Boolean).join(" · "), `/events/${id}`);
}

/** Public event details (logica.pen V4 "04 Event detail"). Board tools (materials, check-in) live in the dashboard's Events section. */
export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { event, error } = await getEvent(id);
  const d = event && eventDate(event.startsAt, event.endsAt);
  const slug = blogSlug(event?.link);
  const post = slug ? await getPost(slug) : null;

  return (
    <ClubShell>
      <main className="site-page event-page">
        <Link href="/events" className="site-back"><SiteIcon name="arrow" /> All events</Link>
        {event && d ? (
          <>
            <header className="event-head">
              <span className="site-date event-date"><b>{d.month}</b><span>{d.day}</span></span>
              <h1 className="serif">{event.title}</h1>
            </header>
            {/* Picture left, details right on desktop; stacked on phones (picture, details, about, blog). */}
            <div className={event.image ? "event-body has-image" : "event-body"}>
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded pictures have no known size */}
              {event.image && <img className="event-image" src={event.image} alt="" />}
              <div className="event-main">
                <ul className="event-meta">
                  <li><SiteIcon name="calendar" /> {d.full}</li>
                  {event.location && <li><SiteIcon name="pin" /> {event.location}</li>}
                </ul>
                <EventActions event={event} rsvpOpen={rsvpWindowOpen(event.startsAt)} />
                {event.description && (
                  <section className="event-about" aria-labelledby="about-event">
                    <h2 id="about-event" className="serif">About this event</h2>
                    <Description text={event.description} className="event-description" />
                  </section>
                )}
                {post && post !== "missing" && (
                  <Link href={`/blog/${post.slug}`} className="site-card blog-item event-post">
                    <small>From the blog</small>
                    <h2 className="serif">{post.title}</h2>
                    <p>{firstText(post.body)}</p>
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <header className="site-page-head event-missing">
            <h1 className="serif">{error === "missing" ? "Event not found" : "Event details"}</h1>
            <p>
              {error === "missing" ? (
                <>That event doesn&apos;t exist, or it&apos;s been taken down. <Link href="/events">See what&apos;s coming up</Link>.</>
              ) : (
                "Event details are not available right now. Please try again later."
              )}
            </p>
          </header>
        )}
      </main>
    </ClubShell>
  );
}
