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
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to My Portfolio Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Follow my journey as a developer, sharing experiences and learnings along the way.
            </p>
            <Link
                href="/blog"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Read My Blog
            </Link>
          </div>
        </section>

        {/* Latest Posts Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Latest Posts</h2>
              <Link
                  href="/blog"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                View all posts →
              </Link>
            </div>
            {latestPosts && <PostList posts={latestPosts} />}
          </div>
        </section>

        {/* About Preview Section */}
        <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
            <p className="text-lg text-gray-600 mb-8">
              I'm a passionate developer documenting my internship journey and sharing valuable insights along the way.
            </p>
            <Link
                href="/about"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Learn More
            </Link>
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