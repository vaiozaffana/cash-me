'use client';
import React from 'react'
import dynamic from 'next/dynamic'

const DashboardScreen = dynamic(() => import('../../components/screen/dashboardScreen'), { ssr: false })

export default function DashboardPage() {
  return (
    <DashboardScreen />
  )
}
