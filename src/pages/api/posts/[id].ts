import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import type { IPost } from '@/types/blog';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<IPost | { error: string }>
) {
    const {
        query: { id },
        method,
    } = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const post = await Post.findById(id);
                if (!post) {
                    return res.status(404).json({ error: 'Post not found' });
                }
                res.status(200).json(post);
            } catch (error) {
                res.status(400).json({ error: 'Failed to fetch post' });
            }
            break;

        case 'PUT':
            try {
                const post = await Post.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true,
                });
                if (!post) {
                    return res.status(404).json({ error: 'Post not found' });
                }
                res.status(200).json(post);
            } catch (error) {
                res.status(400).json({ error: 'Failed to update post' });
            }
            break;

        case 'DELETE':
            try {
                const post = await Post.findByIdAndDelete(id);
                if (!post) {
                    return res.status(404).json({ error: 'Post not found' });
                }
                res.status(204).end();
            } catch (error) {
                res.status(400).json({ error: 'Failed to delete post' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
}