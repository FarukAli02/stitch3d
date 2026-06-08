import { redirect } from "next/navigation";

/**
 * @file page.js
 * @description Root Landing Page.
 * Automatically redirects users to the main application home page.
 */
export default function RootPage() {
  redirect("/home");
}