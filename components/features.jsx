// Main React import
import React from "react";
// Importing icons from lucide-react for feature cards
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  CreditCard, 
  PieChart, 
  Bell, 
  Clock
} from "lucide-react";

// Array defining all platform features with icons, titles and descriptions
const features = [
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "AI Financial Analysis",
    description: "Get personalized insights and recommendations based on your spending patterns."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Investment Tracking",
    description: "Monitor your investments and get AI-powered suggestions to optimize your portfolio."
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Secure Transactions",
    description: "End-to-end encryption ensures your financial data remains private and secure."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Real-time Insights",
    description: "Immediate feedback on your financial decisions with predictive analysis."
  },
  {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: "Expense Categories",
    description: "Automatically categorize and organize your transactions for better tracking."
  },
  {
    icon: <PieChart className="h-8 w-8 text-primary" />,
    title: "Budget Planning",
    description: "Set smart budgets that adapt to your spending habits and financial goals."
  },
  {
    icon: <Bell className="h-8 w-8 text-primary" />,
    title: "Smart Alerts",
    description: "Get notifications for unusual spending, upcoming bills, and saving opportunities."
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Future Forecasting",
    description: "Predict future expenses and income to plan ahead with confidence."
  }
];

/**
 * FeatureCard component - Displays an individual feature with icon, title and description
 * @param {ReactNode} icon - The icon component for the feature
 * @param {string} title - The title of the feature
 * @param {string} description - Detailed description of the feature
 */
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-card glass-effect p-6 rounded-xl transition-all duration-500 card-hover">
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 inline-block">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

/**
 * Features component - Displays all platform features in a responsive grid
 * Includes animated background elements and gradient effects
 */
const Features = () => {
  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-background z-0"></div>
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0"></div>
      
      {/* Glowing orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl z-0"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-6 py-3 rounded-full glass-effect text-primary font-medium inline-block mb-4">
            AI-Powered Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-title animate-gradient-x">
            Transform Your Financial Management
          </h2>
          <p className="text-lg text-muted-foreground glass-effect p-6 rounded-xl">
            Our platform combines cutting-edge AI with intuitive design to give you
            unprecedented control and insight into your financial life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;