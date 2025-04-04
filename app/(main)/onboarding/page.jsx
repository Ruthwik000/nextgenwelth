import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OnboardingPage() {
  try {
    const user = await checkUser();
    if (user) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("Error during onboarding:", error);
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-red-600">Account Setup Failed</h1>
          <p className="text-muted-foreground">
            {error.message || "There was an error setting up your account. Please try again."}
          </p>
          <Link href="/" className="text-blue-600 hover:underline mt-4">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Setting up your account...</h1>
        <p className="text-muted-foreground">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}