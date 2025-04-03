import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams }) {
  // First get the accounts
  const accounts = await getUserAccounts();
  
  // Properly handle searchParams as a server component with safe access
  let isEditMode = false;
  let initialData = null;
  
  try {
    // Safe approach to check for edit parameter without triggering warnings
    const editId = searchParams?.edit;
    
    if (editId) {
      isEditMode = true;
      const transaction = await getTransaction(editId);
      initialData = transaction;
    }
  } catch (error) {
    console.error("Error handling search params:", error);
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">
          {isEditMode ? "Edit" : "Add"} Transaction
        </h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={isEditMode}
        initialData={initialData}
      />
    </div>
  );
}
