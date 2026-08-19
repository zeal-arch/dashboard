export type BlogPostType = "own" | "external";
export type BlogPostStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  type: BlogPostType;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  date: string | null;
  read_time: string | null;
  content: string | null;
  external_url: string | null;
  slug: string | null;
  status: BlogPostStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type BlogPostInsert = Omit<BlogPost, "id" | "created_at" | "updated_at">;
export type BlogPostUpdate = Partial<BlogPostInsert>;
