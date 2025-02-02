import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import type { IPost } from '@/types/blog';

interface EditPostPageProps {
    post: IPost;
}

export default function EditPostPage({ post }: EditPostPageProps) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        coverImage: post.coverImage || '',
        tags: post.tags.join(', '),
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setError('');

        try {
            const response = await fetch(`/api/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(tag => tag.trim()),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update post');
            }

            setStatus('success');
            await router.push('/admin/posts');
        } catch (err) {
            console.error('Failed to update post:', err);
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to update post');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
                <button
                    onClick={() => router.push('/admin/posts')}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                >
                    Back to Posts
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.title}
                        onChange={(e) => {
                            setFormData(prev => ({
                                ...prev,
                                title: e.target.value,
                            }));
                        }}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                        Slug
                    </label>
                    <input
                        type="text"
                        id="slug"
                        required
                        className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                </div>

                {/* Cover Image URL */}
                <div>
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                        Cover Image URL (optional)
                    </label>
                    <input
                        type="url"
                        id="coverImage"
                        className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.coverImage}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    />
                </div>

                {/* Excerpt */}
                <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                        Excerpt
                    </label>
                    <textarea
                        id="excerpt"
                        required
                        rows={3}
                        className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        required
                        className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        id="content"
                        required
                        rows={15}
                        className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    />
                </div>

                {error && (
                    <div className="text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/posts')}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {status === 'submitting' ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    try {
        await dbConnect();

        const post = await Post.findById(params?.id);

        if (!post) {
            return {
                notFound: true,
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
            notFound: true,
        };
    }
};