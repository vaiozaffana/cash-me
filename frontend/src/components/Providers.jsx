'use client';
import React from 'react'
// import { SessionDriver } from "next-auth/react";
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
