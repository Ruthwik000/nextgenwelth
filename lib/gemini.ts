import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface InvestmentGoal {
  name: string;
  targetAmount: number;
  targetDate: string;
}

interface PortfolioBreakdown {
  total: number;
  breakdown: Record<string, number>;
}

interface MonthlySpending {
  [category: string]: number;
}

interface SpendingHistory {
  monthly: Record<string, MonthlySpending>;
  trends: Record<string, string>;
  averageMonthly: MonthlySpending;
}

interface BudgetLimits {
  monthly: MonthlySpending;
  annual: MonthlySpending;
}

interface Income {
  monthly: number;
  sources: Record<string, number>;
}

interface FinancialHealth {
  savingsRate: string;
  debtToIncome: string;
  emergencyFundMonths: number;
  creditScore: number;
}

export async function generateFinancialAdvice(
  userMessage: string,
  context?: {
    riskProfile?: string;
    investmentGoals?: InvestmentGoal[];
    currentPortfolio?: {
      stocks: PortfolioBreakdown;
      bonds: PortfolioBreakdown;
      mutualFunds: PortfolioBreakdown;
      cash: number;
    };
    spendingHistory?: SpendingHistory;
    budgetLimits?: BudgetLimits;
    income?: Income;
    financialHealth?: FinancialHealth;
  }
) {
  try {
    // Use Gemini 2.0 Flash model with optimized configuration
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.5, // Lower temperature for more focused responses
        topK: 20, // Reduced for faster generation
        topP: 0.9,
        maxOutputTokens: 1024, // Reduced for faster responses
      }
    });

    const contextString = context
      ? `
      User Context:
      - Risk Profile: ${context.riskProfile || 'Not specified'}
      - Investment Goals: ${context.investmentGoals?.map(goal => `${goal.name} (₹${goal.targetAmount} by ${goal.targetDate})`).join(', ') || 'Not specified'}
      - Current Portfolio: ${JSON.stringify(context.currentPortfolio) || 'Not specified'}
      - Spending History: ${JSON.stringify(context.spendingHistory) || 'Not specified'}
      - Budget Limits: ${JSON.stringify(context.budgetLimits) || 'Not specified'}
      - Monthly Income: ₹${context.income?.monthly || 'Not specified'}
      - Financial Health: ${JSON.stringify(context.financialHealth) || 'Not specified'}
    `
      : '';

    const trainingPrompt = `
      You are an advanced AI financial assistant with the following capabilities:

      1. User Authentication & Data Privacy
      - Access user financial history securely
      - Maintain strict data privacy standards
      - Handle sensitive financial information with care

      2. Real-Time Banking & Transaction Insights
      - Analyze transaction history
      - Categorize spending (Rent, Food, Travel, Entertainment)
      - Detect spending patterns and anomalies
      - Answer specific transaction queries

      3. Smart Budgeting & Expense Tracking
      - Predict monthly expenses based on trends
      - Monitor budget limits per category
      - Provide spending alerts and recommendations
      - Visualize financial data

      4. AI-Powered Investment Guidance
      - Assess risk tolerance (Conservative, Moderate, High-Risk)
      - Suggest investment strategies
      - Analyze past financial decisions
      - Support goal-based investing

      5. Conversational NLP Engine
      - Understand natural language finance queries
      - Generate personalized financial tips
      - Provide actionable recommendations

      6. Automated Alerts & Notifications
      - Monitor spending thresholds
      - Send budget alerts
      - Generate financial reports

      Example Responses:
      - "You spent ₹8,200 on food in March, which is 15% higher than February. Consider reducing dining out expenses!"
      - "Based on your current savings and spending, I recommend: 50% in Mutual Funds, 30% in Fixed Deposits, and 20% in Stocks for a balanced portfolio."
      - "I'll notify you if your travel spending crosses ₹5,000 this month."
    `;

    const prompt = `
      ${trainingPrompt}

      User Query: "${userMessage}"
      
      ${contextString}
      
      Please provide a comprehensive response that:
      1. Addresses the user's specific query
      2. Considers their financial context
      3. Offers actionable recommendations
      4. Includes relevant insights from their spending history
      5. Suggests appropriate investment strategies if relevant
      6. Provides specific numbers and percentages when possible
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating financial advice:', error);
    throw new Error('Failed to generate financial advice');
  }
}