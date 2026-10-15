import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { getPost, paragraphs, postDate } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post === "missing") return pageMetadata("Blog", "Posts by LOGICA members at UIC.", `/blog/${slug}`);
  const first = paragraphs(post.body)[0] ?? "";
  return pageMetadata(post.title, first.length > 160 ? `${first.slice(0, 157).trimEnd()}...` : first, `/blog/${post.slug}`);
}

/** One published post. Same reading column as the rest of the site. */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (post === "missing") notFound();

  return (
    <ClubShell>
      <main className="site-page blog-post">
        <Link href="/blog" className="site-back"><SiteIcon name="arrow" /> All posts</Link>
        {post ? (
          <article>
            <header>
              <h1 className="serif">{post.title}</h1>
              <p className="blog-byline">{post.author.name ?? "LOGICA member"} · <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time></p>
            </header>
            <div className="blog-body serif">
              {paragraphs(post.body).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </article>
        ) : (
          <p className="site-error" role="alert">This post didn&apos;t load. Try again in a minute.</p>
        )}
      </main>
    </ClubShell>
  );
}
