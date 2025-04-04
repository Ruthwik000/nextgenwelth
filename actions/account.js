"use server";

/**
 * This file contains server actions for managing user accounts and their transactions.
 * It handles operations like fetching account details, deleting transactions, and updating default accounts.
 * Uses Clerk for authentication and Prisma for database operations.
 */

import { db } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Utility function to serialize Prisma Decimal types to regular numbers
 * This is necessary because Prisma Decimal objects can't be directly serialized to JSON
 * @param {Object} obj - Object containing potential Decimal values
 * @returns {Object} Serialized object with Decimal values converted to numbers
 */
const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

/**
 * Retrieves an account and its associated transactions for a given account ID
 * Includes authentication check and data serialization
 * @param {string} accountId - The ID of the account to fetch
 * @returns {Promise<Object|null>} Account data with transactions or null if not found
 * @throws {Error} If user is unauthorized or not found
 */
export async function getAccountWithTransactions(accountId) {
  // Verify user authentication using Clerk
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Find the user in our database using their Clerk ID
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const account = await db.account.findUnique({
    where: {
      id: accountId,
      userId: user.id,
    },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  };
}

/**
 * Deletes multiple transactions and updates account balances accordingly
 * Uses a database transaction to ensure data consistency
 * @param {string[]} transactionIds - Array of transaction IDs to delete
 * @returns {Promise<Object>} Success status and error message if applicable
 */
export async function bulkDeleteTransactions(transactionIds) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Ensure user exists in our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Updates the default account for a user
 * Ensures only one account is marked as default at a time
 * @param {string} accountId - The ID of the account to set as default
 * @returns {Promise<Object>} Success status and updated account data
 */
export async function updateDefaultAccount(accountId) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Ensure user exists in our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // First, unset any existing default account
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set the new default account
    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
