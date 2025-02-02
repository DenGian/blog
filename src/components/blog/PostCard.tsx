import Link from 'next/link';
import type { IPost } from '@/types/blog';
import { formatDate } from '@/utils/formatDate';

interface PostCardProps {
    post: IPost;
}

const PostCard = ({ post }: PostCardProps) => {
    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {post.coverImage && (
                <div className="relative w-full h-48">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600">
                    <Link href={`/blog/${post.slug}`}>
                        {post.title}
                    </Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {post.author.image && (
                            <img
                                src={post.author.image}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full mr-2"
                            />
                        )}
                        <span className="text-gray-700">{post.author.name}</span>
                    </div>
                    <time className="text-gray-500 text-sm">
                        {formatDate(post.date)}
                    </time>
                </div>
            </div>
        </article>
    );
};

export default PostCard;