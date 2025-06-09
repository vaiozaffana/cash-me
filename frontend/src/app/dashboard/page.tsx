// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/home"); // arahkan balik ke login jika belum login
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <>
        <nav className="bg-slate-900 flex justify-between items-center">
        <img
          src={session.user?.image ?? ""}
          alt="User avatar"
          className="w-8 h-8 rounded-full mx-6 my-6"
        />
        <p className="flex items-center">Welcome, {session.user?.name}</p>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex justify-end items-center px-2 py-1 mr-6 bg-red-500 text-white rounded cursor-pointer"
        >
          Sign Out
        </button>
        </nav>


        <div>
            <p className="flex justify-center items-center text-8xl text-slate-900 h-screen">This is Dashboard</p>
        </div>
      </>
    );
  }

  return <div>Not signed in</div>;
}
