import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import { formatDate } from '@/utils/formatDate';
import type { IPost } from '@/types/blog';

interface ManagePostsProps {
    posts: IPost[];
}

export default function ManagePostsPage({ posts = [] }: ManagePostsProps) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleDelete = async (postId: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        setDeleteId(postId);
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            // Refresh the page to show updated list
            router.reload();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Manage Posts</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => router.push('/admin')}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => router.push('/admin/posts/new')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Create New Post
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tags
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                        <tr key={post._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {post.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {post.excerpt.substring(0, 100)}...
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(post.date)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                                {tag}
                                            </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                    target="_blank"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => router.push(`/admin/posts/${post._id}/edit`)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    disabled={isDeleting && deleteId === post._id}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    {isDeleting && deleteId === post._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        await dbConnect();

        const posts = await Post.find().sort({ date: -1 });

        return {
            props: {
                posts: JSON.parse(JSON.stringify(posts)),
            },
        };
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return {
            props: {
                posts: [],
            },
        };
    }
};