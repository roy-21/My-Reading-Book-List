"use server";

import { revalidatePath } from "next/cache";
import { loginAdmin, logoutAdmin, isAdminAuthenticated } from "@/lib/auth/session";
import { saveBook, deleteBook, promoteBook, resetDatabase } from "@/lib/db/books";

export async function loginAction(username, password) {
  const result = await loginAdmin(username, password);
  if (result.success) {
    revalidatePath("/", "layout");
  }
  return result;
}

export async function logoutAction() {
  await logoutAdmin();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function checkAdminAction() {
  const isAuth = await isAdminAuthenticated();
  return { isAdmin: isAuth };
}

export async function saveBookAction(bookData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }
  
  try {
    const saved = await saveBook(bookData);
    revalidatePath("/", "layout");
    return { success: true, book: saved };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteBookAction(id) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    await deleteBook(id);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function promoteBookAction(id, newStatus) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const promoted = await promoteBook(id, newStatus);
    revalidatePath("/", "layout");
    return { success: true, book: promoted };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function resetDatabaseAction() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    await resetDatabase();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
