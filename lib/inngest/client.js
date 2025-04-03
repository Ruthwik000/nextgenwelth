import { Inngest } from "inngest";

// Check if we have required environment variables
const hasInngestCredentials = process.env.INNGEST_EVENT_KEY && process.env.INNGEST_EVENT_KEY.length > 0;

export const inngest = new Inngest({
  id: "finance-platform", // Unique app ID
  name: "Finance Platform",
  eventKey: hasInngestCredentials ? process.env.INNGEST_EVENT_KEY : undefined,
  signingKey: hasInngestCredentials ? process.env.INNGEST_SIGNING_KEY : undefined,
  isDev: process.env.NODE_ENV !== "production" || !hasInngestCredentials,
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});

// Helper function to check if Inngest is properly configured
export const isInngestConfigured = () => {
  return hasInngestCredentials;
};
