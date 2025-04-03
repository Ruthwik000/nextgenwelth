import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("No authenticated user found");
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    if (!user.emailAddresses?.length) {
      throw new Error("User email is required");
    }

    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.emailAddresses[0].emailAddress.split('@')[0];

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl || "",
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    throw error;
  }
};
