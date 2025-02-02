import { GetServerSideProps } from 'next';
import { useState } from 'react';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import { IPost } from '@/types/blog';
import PostList from '@/components/blog/PostList';
import SearchBar from '@/components/blog/SearchBar';

interface BlogPageProps {
    posts: IPost[];
    tags: string[];
    currentPage: number;
    totalPages: number;
    activeTag: string | null;
}

export default function BlogPage({
                                     posts = [],
                                     tags = [],
                                     currentPage = 1,
                                     totalPages = 1,
                                     activeTag = null
                                 }: BlogPageProps) {
    const [selectedTag, setSelectedTag] = useState(activeTag);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
                <p className="text-lg text-gray-600">
                    Explore my thoughts, experiences and learnings during my internship.
                </p>
            </div>

            {/* Search */}
            <SearchBar />

            {/* Tags filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
                <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-4 py-2 rounded-full ${
                        !selectedTag
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    All
                </button>
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-4 py-2 rounded-full ${
                            selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Posts */}
            <PostList posts={posts} />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <a
                            key={page}
                            href={`/blog?page=${page}${selectedTag ? `&tag=${selectedTag}` : ''}`}
                            className={`px-4 py-2 rounded ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {page}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    try {
        await dbConnect();

        const page = parseInt(query.page?.toString() || '1');
        const tag = query.tag?.toString() || null;
        const search = query.search?.toString() || null;
        const limit = 9;

        // Build query
        let queryFilter: any = {};

        if (tag) {
            queryFilter.tags = tag;
        }

        if (search) {
            queryFilter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Post.countDocuments(queryFilter);
        const totalPages = Math.ceil(total / limit);

        // Fetch posts with pagination
        const posts = await Post.find(queryFilter)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Get all unique tags
        const allTags = await Post.distinct('tags');

        return {
            props: {
                posts: JSON.parse(JSON.stringify(posts)),
                tags: allTags,
                currentPage: page,
                totalPages,
                activeTag: tag,
            },
        };
    } catch (error) {
        console.error('Failed to fetch blog data:', error);
        return {
            props: {
                posts: [],
                tags: [],
                currentPage: 1,
                totalPages: 1,
                activeTag: null,
            },
        };
    }
};