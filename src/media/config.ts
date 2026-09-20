import "server-only";
import { validateServerEnvironment } from "@/lib/env";
export function isMediaConfigured(): boolean {
  const env = validateServerEnvironment();
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );
}
