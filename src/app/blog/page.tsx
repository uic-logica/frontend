import Link from "next/link";
import { ClubShell } from "@/components/club/ClubShell";
import { getPosts, postDate } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Blog", "Posts by LOGICA members at UIC: what they're building, learning and sharing.", "/blog");

/**
 * Layout is logica.pen V4 "06 Blog". Members write posts in the dashboard
 * (Blog section); they show here once the exec board publishes them.
 */
export default async function BlogPage() {
  const { posts, error } = await getPosts();
  return (
    <ClubShell>
      <main className="site-page">
        <header className="site-page-head">
          <h1 className="serif">Blog</h1>
        </header>
        {posts.length ? (
          <>
            <ul className="blog-list">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="site-card blog-item">
                    <h2 className="serif">{post.title}</h2>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <small>{post.author.name ?? "LOGICA member"} · <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time></small>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="blog-write">
              LOGICA member? <Link href="/signin?next=/dashboard/blog" className="site-link">Write a post</Link>
            </p>
          </>
        ) : (
          <section className="site-card blog-empty">
            <span className="blog-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.4 3.6a2 2 0 0 1 2.9 2.9L7.5 18.3 3.5 19.5l1.2-4z" />
              </svg>
            </span>
            <h2 className="serif">{error ? "Posts didn't load" : "No posts yet"}</h2>
            <p>{error ? "Try again in a minute." : "Members write them from the dashboard. The first one lands here."}</p>
            <div className="blog-empty-actions">
              <Link href="/signin?next=/dashboard/blog" className="site-btn">Write a post</Link>
              <Link href="/events" className="site-btn secondary">See events</Link>
            </div>
          </section>
        )}
      </main>
    </ClubShell>
  );
}
