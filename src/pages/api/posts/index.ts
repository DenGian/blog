import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import type { IPost, IPaginatedPosts } from '@/types/blog';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IPaginatedPosts | IPost | { error: string }>
) {
    const { method } = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                // Get query parameters for pagination
                const page = parseInt(req.query.page?.toString() || '1');
                const limit = parseInt(req.query.limit?.toString() || '9');
                const tag = req.query.tag?.toString();
                const search = req.query.search?.toString();

                // Build query
                let query: any = {};

                if (tag) {
                    query.tags = tag;
                }

                if (search) {
                    query.$or = [
                        { title: { $regex: search, $options: 'i' } },
                        { content: { $regex: search, $options: 'i' } },
                        { tags: { $regex: search, $options: 'i' } }
                    ];
                }

                // Execute query with pagination
                const skip = (page - 1) * limit;
                const total = await Post.countDocuments(query);

                const posts = await Post.find(query)
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(limit);

                // Transform the posts to match IPost interface
                const transformedPosts: IPost[] = posts.map(post => ({
                    _id: post._id.toString(),
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    excerpt: post.excerpt,
                    coverImage: post.coverImage,
                    date: post.date,
                    tags: post.tags,
                    author: post.author,
                    readingTime: post.readingTime,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }));

                res.status(200).json({
                    posts: transformedPosts,
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                });
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch posts' });
            }
            break;

        case 'POST':
            try {
                // Create new post
                const post = await Post.create(req.body);
                res.status(201).json(post.toObject() as IPost);
            } catch (error) {
                res.status(400).json({ error: 'Failed to create post' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
}