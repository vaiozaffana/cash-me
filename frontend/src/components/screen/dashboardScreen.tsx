"use client";

import { useSession } from "next-auth/react";

export function UserProfile() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.name}</p>
        <img 
          src={session.user?.image ?? ""} 
          alt="User avatar" 
          className="w-8 h-8 rounded-full"
        />
      </div>
    );
  }

  return <div>Not signed in</div>;
}