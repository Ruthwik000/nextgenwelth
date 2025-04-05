"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Import these components directly to avoid circular dependencies
const ChatMessage = ({ message, isLoading }) => {
  const isUser = message.role === "user";

  // Format the message content to improve spacing and alignment
  const formatContent = (content) => {
    if (!content) return "";

    // Process the content for better formatting
    return content
      .split('\n\n')
      .map(paragraph => {
        // Handle numbered lists
        if (paragraph.trim().match(/^\d+\.\s/)) {
          const items = paragraph.split('\n').map(item => {
            if (item.trim().match(/^\d+\.\s/)) {
              return `<li class="ml-5 pl-2 my-1">${item.trim()}</li>`;
            }
            return item;
          });
          return `<ol class="list-decimal my-3 pl-2">${items.join('')}</ol>`;
        }

        // Handle bullet points
        if (paragraph.trim().match(/^[•\-\*]\s/)) {
          const items = paragraph.split('\n').map(item => {
            if (item.trim().match(/^[•\-\*]\s/)) {
              return `<li class="ml-5 pl-2 my-1">${item.trim().replace(/^[•\-\*]\s/, '')}</li>`;
            }
            return item;
          });
          return `<ul class="list-disc my-3 pl-2">${items.join('')}</ul>`;
        }

        // Handle normal paragraphs with proper spacing
        return `<p class="my-3">${paragraph.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');
  };

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 py-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow mt-1">
          <MessageSquare className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 rounded-lg px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isLoading ? (
          <div className="animate-pulse">{message.content}</div>
        ) : (
          <div
            className="prose prose-sm max-w-none leading-relaxed text-left"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
            style={{ lineHeight: '1.6', letterSpacing: '0.01em' }}
          />
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow mt-1">
          <MessageSquare className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

const ChatInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center space-x-2 p-4 border-t"
    >
      <input
        type="text"
        placeholder="Ask about your finances..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
        className="flex-1 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || !input.trim()}
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </form>
  );
};

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi there! I'm WelthGPT, your AI financial advisor. How can I help you with your finances today?",
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isDashboardMode, setIsDashboardMode] = useState(false);
  const messagesEndRef = useRef(null);
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  // Show the chat bot on all pages when user is signed in
  // We'll also show it on the home page for all users
  const shouldShowChatBot = isSignedIn || pathname === '/';

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listen for custom event to open chat
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const handleSendMessage = async (content) => {
    // Add user message to chat
    const userMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    // Set loading state
    setIsLoading(true);

    try {
      // Use a fallback response in case the API call fails
      let aiResponse = "";

      try {
        // Try to fetch response from Gemini API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            chatHistory: messages,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.error) {
            console.warn("API returned an error:", data.error);
            throw new Error(data.error);
          }
          if (!data.response) {
            console.warn("API returned no response data");
            throw new Error('No response data received from the server');
          }
          aiResponse = data.response;
        } else {
          // Get the error details from the response
          let errorMessage = 'API response not OK';
          try {
            const errorData = await response.json();
            console.warn("API response not OK:", response.status, errorData);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            console.warn("Could not parse error response:", parseError);
          }

          // Handle specific error cases
          if (response.status === 401) {
            throw new Error('Please sign in to access personalized financial advice');
          } else if (response.status === 404) {
            throw new Error('User profile not found. Please complete your profile setup to get personalized advice');
          } else if (response.status === 500) {
            throw new Error('The server encountered an error. This might be due to high demand or temporary issues with the AI service.');
          } else {
            throw new Error(errorMessage);
          }
        }
      } catch (apiError) {
        console.warn("API call failed, using fallback response", apiError);

        // Customize the fallback response based on the error message
        let errorMessage = apiError.message || '';
        let customIntro = '';
        let customAction = '';

        if (errorMessage.includes('sign in')) {
          customIntro = 'To access personalized financial advice, please sign in to your account.';
          customAction = 'Click the "Sign In" button at the top of the page to get started.';
        } else if (errorMessage.includes('profile')) {
          customIntro = 'To get personalized recommendations, please complete your profile setup with your financial information.';
          customAction = 'Visit your profile page to add your financial details.';
        } else if (errorMessage.includes('No financial data')) {
          customIntro = 'I notice you haven\'t added any financial accounts or transactions yet.';
          customAction = 'To get personalized advice, please add your accounts, income, and expenses in the dashboard.';
        } else if (errorMessage.includes('server') || errorMessage.includes('high demand')) {
          customIntro = 'I apologize, but our AI service is currently experiencing high demand or temporary issues.';
          customAction = 'Please try again in a few moments. Our team is working to ensure smooth operation of the service.';
        } else {
          customIntro = 'I apologize, but I\'m currently unable to access your financial data.';
        }

        aiResponse = `${customIntro}

${customAction ? customAction + '\n\n' : ''}
When connected to your account data, I can provide personalized recommendations based on:

1. Your income and spending patterns
2. Current savings rate and goals
3. Debt-to-income ratio analysis
4. Investment portfolio allocation
5. Budget progress and optimization

How can I help you today?

• Would you like general advice on budgeting strategies?
• Need information about investment approaches?
• Interested in debt management techniques?
• Want to learn about savings optimization?

${customAction ? '' : 'You can also try again later when the system connection is restored.\n\n'}
**Disclaimer:** The information provided is educational in nature, not personalized financial advice. Please consult with a qualified financial professional for guidance specific to your situation.`;
      }

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in message handling:", error);
      toast.error("Failed to get a response. Please try again.");

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later.",
        },
      ]);
      setIsLoading(false);
    }
  };

  if (!shouldShowChatBot) {
    return null;
  }

  // Toggle dashboard mode
  const toggleDashboardMode = () => {
    setIsDashboardMode(!isDashboardMode);
    if (!isDashboardMode) {
      setIsFullScreen(true);
    }
  };

  // Handle closing the chat
  const handleCloseChat = () => {
    if (isDashboardMode) {
      setIsDashboardMode(false);
      setIsFullScreen(false);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseChat}>
        <DialogContent
          className={cn(
            "flex flex-col p-0 transition-all duration-300",
            isFullScreen || isDashboardMode
              ? "w-screen h-screen max-w-none rounded-none"
              : "sm:max-w-[425px] h-[600px]"
          )}
        >
          <DialogHeader className={cn(
            "p-4 border-b flex flex-row items-center justify-between",
            isDashboardMode && "bg-primary text-primary-foreground"
          )}>
            <DialogTitle className="flex items-center gap-2">
              {!isDashboardMode && <MessageSquare className="h-5 w-5" />}
              WelthGPT Financial Advisor
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={isDashboardMode ? "secondary" : "ghost"}
                size="sm"
                onClick={toggleDashboardMode}
                className={cn("h-8", isDashboardMode && "bg-white/10 hover:bg-white/20")}
              >
                {isDashboardMode ? "Chat Mode" : "Dashboard Mode"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="h-8 w-8"
              >
                {isFullScreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          {isDashboardMode ? (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                <div className="col-span-full">
                  <h2 className="text-2xl font-bold mb-4">Financial Assistant Dashboard</h2>
                  <p className="text-muted-foreground mb-6">Ask questions about your finances and get personalized advice powered by Gemini 2.</p>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm border">
                  <h3 className="font-medium mb-2">Quick Questions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsDashboardMode(false);
                        handleSendMessage("What's my current financial health?");
                      }}
                    >
                      What's my current financial health?
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsDashboardMode(false);
                        handleSendMessage("How can I improve my savings?");
                      }}
                    >
                      How can I improve my savings?
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsDashboardMode(false);
                        handleSendMessage("What investment strategies should I consider?");
                      }}
                    >
                      What investment strategies should I consider?
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm border">
                  <h3 className="font-medium mb-2">Ask Anything</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const question = formData.get('question');
                    if (question) {
                      setIsDashboardMode(false);
                      handleSendMessage(question.toString());
                      e.target.reset();
                    }
                  }}>
                    <div className="space-y-2">
                      <input
                        name="question"
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Type your financial question..."
                      />
                      <Button type="submit" className="w-full">Ask Question</Button>
                    </div>
                  </form>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm border">
                  <h3 className="font-medium mb-2">Recent Conversations</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {messages.filter(m => m.role === 'user').slice(-3).map((message, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left truncate"
                        onClick={() => setIsDashboardMode(false)}
                      >
                        {message.content}
                      </Button>
                    ))}
                    {messages.filter(m => m.role === 'user').length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent conversations</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    isLoading={isLoading && index === messages.length - 1}
                  />
                ))}
                {isLoading && (
                  <ChatMessage
                    message={{ role: "assistant", content: "Thinking..." }}
                    isLoading={true}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatBot;
