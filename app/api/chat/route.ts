import { NextResponse } from 'next/server';
import { generateFinancialAdvice } from '../../../lib/gemini';
import { auth } from '@clerk/nextjs/server';

interface ChatRequest {
  message: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { message } = await req.json() as ChatRequest;
    
    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const response = await generateFinancialAdvice(message);
    
    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}