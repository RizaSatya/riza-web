export interface FrontMatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  frontMatter: FrontMatter;
  content: string;
  readingTime: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}
