import "server-only";
import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "mongoose";
const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    tags: [{ type: String, trim: true }],
    author: {
      name: { type: String, default: "Ian Mondelaers" },
    },
    readingTime: Number,
    status: { type: String, enum: ["draft", "published"] },
    publishedAt: Date,
    seoTitle: String,
    seoDescription: String,
    schemaVersion: Number,
  },
  { timestamps: true, collection: "posts", strict: true, autoIndex: false },
);
postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
export type PostDocument = InferSchemaType<typeof postSchema>;
export const PostModel =
  (models.Post as Model<PostDocument> | undefined) ??
  model<PostDocument>("Post", postSchema);
