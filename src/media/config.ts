import "server-only";
import { validateCloudinaryEnvironment } from "@/lib/env";
export function isMediaConfigured(): boolean {
  const env = validateCloudinaryEnvironment();
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );
}
