import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import type { IPost } from '@/types/blog';

interface PostPageProps {
    post: IPost | null;
}

export default function PostPage({ post }: PostPageProps) {
    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
                    <Link
                        href="/blog"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← Back to blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back button */}
            <Link
                href="/blog"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
            >
                <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Back to blog
            </Link>

            {/* Post header */}
            <header className="mb-8">
                {post.coverImage && (
                    <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="flex gap-2 mb-4">
                    {post.tags.map((tag) => (
                        <Link
                            key={tag}
                            href={`/blog?tag=${tag}`}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {post.title}
                </h1>
                <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center">
                        {post.author.image && (
                            <img
                                src={post.author.image}
                                alt={post.author.name}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        )}
                        <div>
                            <p className="font-medium text-gray-900">{post.author.name}</p>
                            <time className="text-sm">
                                {formatDate(post.date)}
                            </time>
                        </div>
                    </div>
                    {post.readingTime && (
                        <span className="text-sm">
                            {post.readingTime} min read
                        </span>
                    )}
                </div>
            </header>

            {/* Post content */}
            <div className="prose prose-lg max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                        {paragraph}
                    </p>
                ))}
            </div>
        </article>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    try {
        await dbConnect();

        const post = await Post.findOne({ slug: params?.slug }).lean();

        if (!post) {
            return {
                props: {
                    post: null,
                },
            };
        }

        return {
            props: {
                post: JSON.parse(JSON.stringify(post)),
            },
        };
    } catch (error) {
        console.error('Failed to fetch post:', error);
        return {
            props: {
                post: null,
            },
        };
    }
};