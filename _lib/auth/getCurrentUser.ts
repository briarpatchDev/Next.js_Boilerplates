import { connectToDatabase } from "@/app/lib/mongodb";
import { cookies } from "next/headers";

// Fetches user data for a logged in user using their sessionId
// This will be used in server layouts, server pages, and in userContexts
export async function getCurrentUser(fields?: string[]) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;
    if (!sessionId) return null;
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    const account = await accounts.findOne({ sessionId: sessionId });
    if (!account) {
      cookieStore.delete("sessionId");
      return null;
    }
    const returnObject: any = {
      loggedIn: true,
    };
    fields?.forEach((field) => {
      if (field in account) {
        returnObject[field] = account[field];
      }
    });
    const forbiddenFields = ["_id", "password"];
    forbiddenFields.forEach((field) => {
      if (field in returnObject) {
        delete returnObject[field];
      }
    });
    return returnObject;
  } catch {
    return null;
  }
}
