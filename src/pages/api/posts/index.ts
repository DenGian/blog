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
                const limit = parseInt(req.query.limit?.toString() || '10');
                const tag = req.query.tag?.toString();

                // Build query
                const query = tag ? { tags: tag } : {};

                // Execute query with pagination
                const skip = (page - 1) * limit;
                const total = await Post.countDocuments(query);
                const posts = await Post.find(query)
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(limit);

                // Return paginated results
                res.status(200).json({
                    posts,
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
                res.status(201).json(post);
            } catch (error) {
                res.status(400).json({ error: 'Failed to create post' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
}