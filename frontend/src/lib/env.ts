import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("CareerLens"),
  NEXT_PUBLIC_API_BASE_URL: z.string().default("http://localhost:3001/v1"),
  NEXT_PUBLIC_COGNITO_USER_POOL_ID: z.string().default("local-user-pool"),
  NEXT_PUBLIC_COGNITO_CLIENT_ID: z.string().default("local-client-id"),
  NEXT_PUBLIC_AWS_REGION: z.string().default("us-east-1"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
});
