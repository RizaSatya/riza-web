import Image from "next/image";
import type { MDXComponents as MDXComponentsType } from "mdx/types";
import { CopyButton } from "./CopyButton";

export const mdxComponents: MDXComponentsType = {
  img: ({ src, alt, ...props }) => (
    <span className="my-8 block overflow-hidden rounded-xl border border-border">
      <Image
        src={src || ""}
        alt={alt || ""}
        width={800}
        height={450}
        className="w-full"
        {...props}
      />
    </span>
  ),
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent decoration-accent/0 underline-offset-4 transition-all duration-200 hover:underline hover:decoration-accent/60"
      {...props}
    >
      {children}
    </a>
  ),
  pre: ({ children, ...props }) => {
    const rawCode =
      typeof children === "object" && children !== null && "props" in children
        ? (children as { props?: { children?: string } }).props?.children || ""
        : "";

    return (
      <div className="group relative my-6">
        <CopyButton text={typeof rawCode === "string" ? rawCode : ""} />
        <pre {...props}>{children}</pre>
      </div>
    );
  },
  table: ({ children, ...props }) => (
    <div className="my-8 overflow-x-auto rounded-xl">
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-border bg-accent/5 px-4 py-3 text-left text-sm font-medium text-muted"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-border/50 px-4 py-3 text-sm" {...props}>
      {children}
    </td>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-8 rounded-r-lg border-l-[3px] border-accent bg-accent/5 py-4 pl-6 pr-4 italic text-muted"
      {...props}
    >
      {children}
    </blockquote>
  ),
};
