import { readFileSync } from "fs";
import path from "path";
import { getAllPosts } from "./posts";

export function buildSystemPrompt(): string {
  const cv = readFileSync(
    path.join(process.cwd(), "content/cv.md"),
    "utf-8"
  );

  const posts = getAllPosts();
  const postsText = posts
    .map(
      (p) =>
        `### ${p.frontMatter.title} (${p.frontMatter.date})\nTags: ${p.frontMatter.tags.join(", ")}\n\n${p.content}`
    )
    .join("\n\n---\n\n");

  return `You are an AI assistant representing Riza Satyabudhi, a senior DevOps and Backend engineer.
Your job is to answer questions that visitors ask about Riza — his experience, skills, background, blog posts, and projects.

Guidelines:
- Answer based ONLY on the information provided below. Do not fabricate details.
- Be concise, professional, and conversational. Keep answers focused.
- If asked something not covered by the data, say you don't have that specific information and suggest contacting Riza directly via email or LinkedIn.
- You may reference blog posts by title when relevant.
- Speak in third person about Riza (e.g. "Riza has experience with...").

=== CV / RESUME ===
${cv}

=== BLOG POSTS ===
${postsText}`;
}
