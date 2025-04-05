import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // Get user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request data for ArcJet
    const ajReq = await request();

    // Check rate limit with ArcJet
    const decision = await aj.protect(ajReq, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Request blocked" },
        { status: 403 }
      );
    }

    // Get the request body
    const { message, chatHistory } = await req.json();

    console.log('Retrieving data for user ID:', userId);

    // Get user data from the database with ALL transactions and detailed information
    let user;
    try {
      user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
          accounts: {
            include: {
              transactions: true,
            }
          },
          transactions: {
            orderBy: { date: 'desc' },
            take: 100, // Get more transactions for better analysis
          },
          budgets: true,
        },
      });

      if (!user) {
        console.error('User not found in database for clerkUserId:', userId);
        return NextResponse.json(
          { error: "User profile not found. Please complete your profile setup to get personalized advice." },
          { status: 404 }
        );
      }

      // Verify that we have at least some financial data to work with
      const hasFinancialData = (
        (user.accounts && user.accounts.length > 0) ||
        (user.transactions && user.transactions.length > 0) ||
        (user.budgets && user.budgets.length > 0)
      );

      if (!hasFinancialData) {
        console.warn('User has no financial data:', userId);
        return NextResponse.json(
          { error: "No financial data found. Please add your accounts or transactions to get personalized advice." },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Database error when fetching user data:', dbError);
      return NextResponse.json(
        { error: "Error accessing financial data. Please try again later." },
        { status: 500 }
      );
    }

    console.log('User data retrieved:', {
      name: user.name,
      email: user.email,
      accountsCount: user.accounts?.length || 0,
      transactionsCount: user.transactions?.length || 0,
      budgetsCount: user.budgets?.length || 0
    });

    console.log('Raw user data:', {
      name: user.name,
      accounts: user.accounts.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance?.toString()
      })),
      transactions: user.transactions.slice(0, 5).map(t => ({
        type: t.type,
        amount: t.amount?.toString(),
        category: t.category,
        date: t.date
      })),
      budgets: user.budgets.map(b => ({
        amount: b.amount?.toString()
      }))
    });

    // Calculate financial metrics with safety checks - EXACT CALCULATIONS
    const totalSavings = user.accounts && user.accounts.length > 0
      ? user.accounts.reduce((sum, account) => {
          return sum + (account.balance ? account.balance.toNumber() : 0);
        }, 0)
      : 0;

    // Get all income transactions
    const incomeTransactions = user.transactions
      .filter(t => t.type === 'INCOME')
      .map(t => ({
        amount: t.amount ? t.amount.toNumber() : 0,
        date: new Date(t.date)
      }));

    // Calculate monthly income more accurately
    let monthlyIncome = 0;
    if (incomeTransactions.length > 0) {
      // Sort by date
      incomeTransactions.sort((a, b) => b.date - a.date);

      // Get the most recent income transaction
      const mostRecentIncome = incomeTransactions[0].amount;

      // Use the most recent income as monthly income if available
      monthlyIncome = mostRecentIncome || 0;
    }

    console.log('Monthly income calculation:', {
      incomeTransactionsCount: incomeTransactions.length,
      calculatedMonthlyIncome: monthlyIncome
    });

    // Get all expense transactions from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const recentExpenses = user.transactions
      .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= thirtyDaysAgo)
      .map(t => ({
        amount: t.amount ? t.amount.toNumber() : 0,
        category: t.category || 'Other',
        date: new Date(t.date)
      }));

    // Group expenses by category with safety checks - ONLY RECENT EXPENSES
    const expensesByCategory = {};
    recentExpenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });

    console.log('Expenses by category:', expensesByCategory);

    // Calculate monthly expenses more accurately
    const totalMonthlyExpenses = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate savings rate based on accurate monthly figures
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalMonthlyExpenses) / monthlyIncome) * 100 : 0;

    // Get top spending categories from recent expenses
    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));

    console.log('Top spending categories:', topCategories);

    // Get budget information
    const budgetInfo = user.budgets && user.budgets.length > 0
      ? user.budgets.map(b => ({
          amount: b.amount ? b.amount.toNumber() : 0,
          spent: totalMonthlyExpenses, // Use actual monthly expenses as spent amount
          remaining: (b.amount ? b.amount.toNumber() : 0) - totalMonthlyExpenses,
          percentUsed: b.amount && b.amount.toNumber() > 0
            ? (totalMonthlyExpenses / b.amount.toNumber() * 100)
            : 0
        }))[0] // Use the first budget if multiple exist
      : null;

    console.log('Budget information:', budgetInfo);

    // Calculate debt metrics if available
    const debts = user.accounts && user.accounts.length > 0
      ? user.accounts
          .filter(a => a.type === 'LOAN' || a.type === 'CREDIT')
          .map(a => ({
            name: a.name || 'Debt',
            balance: a.balance ? a.balance.toNumber() : 0,
            interestRate: a.interestRate || 'Unknown'
          }))
      : [];

    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 0;

    // Prepare financial context with actual user data - ACCURATE CALCULATIONS
    const financialContext = {
      user: {
        name: user.name || 'User',
        monthlyIncome: monthlyIncome ? monthlyIncome.toFixed(2) : '0.00',
        totalSavings: totalSavings ? totalSavings.toFixed(2) : '0.00',
        savingsRate: savingsRate.toFixed(2) + '%',
        expenses: {
          monthlyTotal: totalMonthlyExpenses.toFixed(2),
          categories: expensesByCategory || {},
          topCategories: topCategories.map(cat => ({
            category: cat.category,
            amount: cat.amount.toFixed(2),
            percentOfTotal: totalMonthlyExpenses > 0 ? ((cat.amount / totalMonthlyExpenses) * 100).toFixed(2) + '%' : '0%'
          }))
        },
        accounts: user.accounts.map(account => ({
          name: account.name,
          type: account.type,
          balance: account.balance ? account.balance.toNumber().toFixed(2) : '0.00'
        })),
        investments: user.accounts && user.accounts.length > 0
          ? user.accounts
              .filter(a => a.type === 'INVESTMENT')
              .map(a => ({
                name: a.name || 'Investment',
                balance: a.balance ? a.balance.toNumber().toFixed(2) : '0.00'
              }))
          : [],
        debt: {
          total: totalDebt.toFixed(2),
          debtToIncomeRatio: debtToIncomeRatio.toFixed(2) + '%',
          accounts: debts.map(debt => ({
            name: debt.name,
            balance: debt.balance.toFixed(2)
          }))
        },
        budget: budgetInfo ? {
          monthlyLimit: budgetInfo.amount.toFixed(2),
          spent: budgetInfo.spent.toFixed(2),
          remaining: budgetInfo.remaining.toFixed(2),
          percentUsed: budgetInfo.percentUsed.toFixed(2) + '%'
        } : null
      },
      // Include real-time market data based on current date
      marketData: {
        currentDate: new Date().toISOString().split('T')[0],
        currentTrends: {
          inflation: "3.2%", // This would ideally come from a real-time API
          stockMarket: "Moderate growth",
          interestRates: "Stable"
        },
        disclaimer: "Market data is for informational purposes only and should not be the sole basis for investment decisions."
      }
    };

    // Prepare the prompt with conversation history and financial context
    let prompt = `You are WelthGPT, an AI financial advisor integrated into the Welth finance platform.

    CRITICAL INSTRUCTION: You MUST ONLY use the REAL financial data for this specific user provided below. DO NOT use any demo, example, or made-up data. If the data shows the user has $0 in savings, acknowledge that fact - don't pretend they have savings.

    Financial Context (REAL USER DATA - USE THIS DATA ONLY):
    ${JSON.stringify(financialContext, null, 2)}

    Previous conversation:
    ${chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

    User's new message: ${message}

    MANDATORY REQUIREMENTS:
    1. ONLY use the real user data provided above - NEVER make up or use demo data
    2. ALWAYS refer to SPECIFIC NUMBERS from their financial data (exact income amount, exact expenses, exact savings rate, etc.)
    3. ALWAYS mention their TOP SPENDING CATEGORIES BY NAME when relevant (e.g., "Your highest spending category is [actual category name] at $[exact amount]")
    4. ALWAYS reference their ACTUAL savings rate of ${financialContext.user.savingsRate} and debt-to-income ratio of ${financialContext.user.debt.debtToIncomeRatio} when giving advice
    5. If they have investment accounts (${financialContext.user.investments.length > 0 ? 'they do' : 'they do not'}), mention the ACTUAL balances
    6. If they have a monthly budget (${financialContext.user.budget ? 'they do' : 'they do not'}), reference their ACTUAL budget of ${financialContext.user.budget ? financialContext.user.budget.monthlyLimit : '0.00'} and that they've spent ${financialContext.user.budget ? financialContext.user.budget.spent : '0.00'} (${financialContext.user.budget ? financialContext.user.budget.percentUsed : '0%'} of budget)

    Your response MUST be:
    1. Personalized using their ACTUAL name (${financialContext.user.name}) and their REAL financial data
    2. Evidence-based using their REAL financial metrics (not general advice)
    3. Risk-aware based on their ACTUAL financial profile
    4. Actionable with specific next steps based on their REAL situation
    5. Compliant with financial regulations (include disclaimer when needed)

    Format your response with:
    1. Clear section headings when appropriate
    2. Numbered lists for sequential steps or prioritized advice
    3. Bullet points for related items or options
    4. Proper paragraph spacing for readability
    5. Consistent alignment of text

    Keep responses under 250 words, focus on practical advice, use simple language.
    Never recommend specific stocks, always include risk warnings, and emphasize diversification.

    If the user data shows limited or no financial activity, acknowledge this fact and offer guidance on how to start building their financial profile.

    Always end your response with a brief disclaimer about financial advice.
    `;

    try {
      // Generate AI response using Gemini 2
      console.log('Using Gemini model: gemini-2.0-flash-001');
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-001",
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      });

      console.log('Generating content with prompt length:', prompt.length);

      // Check if prompt is too long
      if (prompt.length > 100000) {
        console.warn('Prompt is very long, truncating to avoid token limit issues');
        prompt = prompt.substring(0, 100000);
      }

      // Add a timeout to the generateContent call
      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000); // 30 second timeout
      });

      const result = await Promise.race([generatePromise, timeoutPromise]);

      console.log('Content generated successfully');
      const response = result.response.text();

      return NextResponse.json({ response });
    } catch (modelError) {
      console.error('Error generating content with Gemini:', modelError);

      // Fallback to the previous model if the new one fails
      try {
        console.log('Falling back to gemini-1.5-pro model');
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-1.5-pro",
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        });
        // Add a timeout to the fallback generateContent call
        const fallbackGeneratePromise = fallbackModel.generateContent(prompt);
        const fallbackTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Fallback request timed out')), 30000); // 30 second timeout
        });

        const fallbackResult = await Promise.race([fallbackGeneratePromise, fallbackTimeoutPromise]);
        const fallbackResponse = fallbackResult.response.text();

        return NextResponse.json({ response: fallbackResponse });
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        return NextResponse.json(
          { error: "Failed to generate AI response. Please try again later." },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
