export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  suggestions: string[];
}

export interface FinancialContext {
  riskProfile: string;
  investmentGoals: Array<{
    name: string;
    targetAmount: number;
    targetDate: string;
  }>;
  currentPortfolio: {
    stocks: {
      total: number;
      breakdown: Record<string, number>;
    };
    bonds: {
      total: number;
      breakdown: Record<string, number>;
    };
    mutualFunds: {
      total: number;
      breakdown: Record<string, number>;
    };
    cash: number;
  };
  spendingHistory: {
    monthly: Record<string, Record<string, number>>;
    trends: Record<string, string>;
    averageMonthly: Record<string, number>;
  };
  budgetLimits: {
    monthly: Record<string, number>;
    annual: Record<string, number>;
  };
  income: {
    monthly: number;
    sources: Record<string, number>;
  };
  financialHealth: {
    savingsRate: string;
    debtToIncome: string;
    emergencyFundMonths: number;
    creditScore: number;
  };
} 