export interface IPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    date: Date;
    tags: string[];
    author: IAuthor;
    readingTime?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthor {
    name: string;
    image?: string;
}

export interface IPaginatedPosts {
    posts: IPost[];
    total: number;
    currentPage: number;
    totalPages: number;
}