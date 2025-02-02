import type { IPost } from '@/types/blog';
import PostCard from './PostCard';

interface PostListProps {
    posts: IPost[];
}

const PostList = ({ posts = [] }: PostListProps) => {
    if (!posts?.length) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-600">No blog posts found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
                <PostCard key={post._id} post={post} />
            ))}
        </div>
    );
};

export default PostList;