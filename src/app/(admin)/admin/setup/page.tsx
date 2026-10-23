import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { setupState } from "@/lib/server/first-admin";
import { SetupForm } from "./SetupForm";

export const metadata: Metadata = { title: "Set up" };

export default function SetupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-10 font-display text-3xl font-semibold">Create the first admin</h1>
        <Suspense>
          <Setup />
        </Suspense>
      </div>
    </main>
  );
}

async function Setup() {
  await connection();
  const state = await setupState();
  if (state === "open") {
    return (
      <>
        <p className="mt-4 text-mist">This page works once, to create the owner’s admin account.</p>
        <SetupForm />
      </>
    );
  }
  return (
    <p className="mt-6 text-mist">
      {state === "done" ? "Setup is complete. " : "Setup is turned off (no ADMIN_SETUP_TOKEN). "}
      <Link href="/admin/login/" className="text-accent hover:underline">
        Sign in
      </Link>
      .
    </p>
  );
}
