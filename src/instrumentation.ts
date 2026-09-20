import {
  getSiteUrl,
  validateAuthEnvironment,
  validateCloudinaryEnvironment,
  validateGiscusEnvironment,
  validatePublicLinks,
  validateRateLimitEnvironment,
} from "@/lib/env";
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  getSiteUrl();
  validateAuthEnvironment();
  validateRateLimitEnvironment();
  validateCloudinaryEnvironment();
  validateGiscusEnvironment();
  validatePublicLinks();
}
