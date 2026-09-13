import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const trimSlash = (url?: string) => url?.trim().replace(/\/+$/, "");

// APP_URL may hold several comma separated origins (deployed + local).
const appUrls = (process.env.APP_URL ?? "")
  .split(",")
  .map((origin) => trimSlash(origin))
  .filter((origin): origin is string => Boolean(origin));

// Where Stripe sends customers back to. Falls back to the frontend's
// /payment/success and /payment/cancel pages on the first APP_URL.
const clientUrl = trimSlash(process.env.CLIENT_URL) ?? appUrls[0] ?? "http://localhost:3000";

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  app_urls: appUrls,
  client_url: clientUrl,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN ?? "1d",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  client_success_url:
    trimSlash(process.env.CLIENT_SUCCESS_URL) || `${clientUrl}/payment/success`,
  client_cencel_url:
    trimSlash(process.env.CLIENT_CENCEL_URL ?? process.env.CLIENT_CANCEL_URL) ||
    `${clientUrl}/payment/cancel`,
  SEED_ADMIN_NAME: process.env.SEED_ADMIN_NAME,
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
  node_env: process.env.NODE_ENV,
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  },
};
