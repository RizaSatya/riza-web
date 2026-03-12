import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { extractTOC } from "@/lib/toc";
import { PostHeader } from "@/components/blog/PostHeader";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { PostChat } from "@/components/blog/PostChat";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import { absoluteUrl, siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.frontMatter.title,
    description: post.frontMatter.excerpt,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.frontMatter.title,
      description: post.frontMatter.excerpt,
      type: "article",
      url: absoluteUrl(`/blog/${slug}`),
      publishedTime: post.frontMatter.date,
      tags: post.frontMatter.tags,
      images: [
        {
          url: absoluteUrl(
            `/og?title=${encodeURIComponent(post.frontMatter.title)}&tags=${post.frontMatter.tags.join(",")}`
          ),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontMatter.title,
      description: post.frontMatter.excerpt,
      images: [
        absoluteUrl(
          `/og?title=${encodeURIComponent(post.frontMatter.title)}&tags=${post.frontMatter.tags.join(",")}`
        ),
      ],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const toc = extractTOC(post.content);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20">
      <PostHeader post={post} />

      <div className="relative flex gap-16">
        <article className="animate-in prose min-w-0 max-w-none flex-1" style={{ "--stagger": 1 } as React.CSSProperties}>
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    { behavior: "wrap" },
                  ],
                  [
                    rehypePrettyCode,
                    {
                      theme: "github-dark-dimmed",
                      keepBackground: false,
                    },
                  ],
                ],
              },
            }}
          />

          {/* Mobile chat at end of article */}
          <div id="post-chat" className="mt-12 border-t border-border pt-8 lg:hidden">
            <PostChat postTitle={post.frontMatter.title} postContent={post.content} />
          </div>
        </article>

        <aside className="hidden w-64 shrink-0 lg:block">
          <TableOfContents items={toc} />
          <PostChat postTitle={post.frontMatter.title} postContent={post.content} />
        </aside>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: post.frontMatter.title,
            datePublished: post.frontMatter.date,
            description: post.frontMatter.excerpt,
            author: {
              "@type": "Person",
              name: siteConfig.name,
              url: siteConfig.url,
            },
            keywords: post.frontMatter.tags,
            mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
          }),
        }}
      />
    </div>
  );
}
