import { GetServerSideProps } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import { IPost } from '@/types/blog';
import PostList from '@/components/blog/PostList';

interface HomeProps {
  latestPosts: IPost[];
}

export default function Home({ latestPosts = [] }: HomeProps) {
  return (
      <div>

        {/* Latest Posts Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Nieuwste Posts</h2>
              <Link
                  href="/blog"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Zie alle posts →
              </Link>
            </div>
            {latestPosts && <PostList posts={latestPosts} />}
          </div>
        </section>

      </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    await dbConnect();

    // Fetch latest 6 posts
    const posts = await Post.find()
        .sort({ date: -1 })
        .limit(6)
        .lean();

    return {
      props: {
        latestPosts: JSON.parse(JSON.stringify(posts)) || [], // Add fallback empty array
      },
    };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return {
      props: {
        latestPosts: [], // Return empty array on error
      },
    };
  }
};