export type PostStatus = "draft" | "published";
export interface PostView {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  coverImage: string | null;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readingTime: number;
  seoTitle: string | null;
  seoDescription: string | null;
  legacy: boolean;
}
export interface PostPageResult {
  posts: PostView[];
  total: number;
  page: number;
  totalPages: number;
}
