import mongoose from 'mongoose';
import type { IPost } from '@/types/blog';

const postSchema = new mongoose.Schema<IPost>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        excerpt: {
            type: String,
            required: [true, 'Excerpt is required'],
        },
        coverImage: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        author: {
            name: {
                type: String,
                required: [true, 'Author name is required'],
            },
            image: {
                type: String,
            },
        },
        readingTime: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Add index for better query performance
postSchema.index({ tags: 1 });
postSchema.index({ date: -1 });

export default mongoose.models.Post || mongoose.model<IPost>('Post', postSchema, 'posts');