import { serve } from "inngest/next";

import { inngest, isInngestConfigured } from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
  monitorLargeTransactions,
} from "@/lib/inngest/function";

// If Inngest is properly configured, set up the API route with all functions
// Otherwise, provide a fallback response for development
export const { GET, POST, PUT } = isInngestConfigured()
  ? serve({
      client: inngest,
      functions: [
        processRecurringTransaction,
        triggerRecurringTransactions,
        generateMonthlyReports,
        checkBudgetAlerts,
        monitorLargeTransactions,
      ],
    })
  : {
      // Basic handler implementations that return a 200 OK during development
      GET: async () => new Response(JSON.stringify({ status: "Inngest not configured - Development Mode" }), { status: 200 }),
      POST: async () => new Response(JSON.stringify({ status: "Inngest not configured - Development Mode" }), { status: 200 }),
      PUT: async () => new Response(JSON.stringify({ status: "Inngest not configured - Development Mode" }), { status: 200 }),
    };
