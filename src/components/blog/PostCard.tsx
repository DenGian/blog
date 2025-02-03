import Link from 'next/link';
import type { IPost } from '@/types/blog';
import { formatDate } from '@/utils/formatDate';

interface PostCardProps {
    post: IPost;
}

const PostCard = ({ post }: PostCardProps) => {
    const defaultImage = '/default-blog.png';

    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="relative h-48 w-full">
                <img
                    src={post.coverImage || defaultImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultImage;
                    }}
                />
            </div>
            <div className="p-6 flex-grow flex flex-col">
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
                <Link
                    href={`/blog/${post.slug}`}
                    className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600"
                >
                    {post.title}
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center">
                        {post.author.image ? (
                            <img
                                src={post.author.image}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full mr-2"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
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