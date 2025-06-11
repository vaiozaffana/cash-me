'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Wallet, PieChart, History, Plus } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '../UserProvider';

export default function DashboardScreen() {
  const { data: session } = useSession();
  const { user: localUser } = useUser();
  const [userName, setUserName] = useState<string | null>(null);

useEffect(() => {
  if (session?.user) {
    setUserName(session.user.name || 'Pengguna');
  } else if (localUser) {
    setUserName(localUser.name || 'Pengguna');
  } else {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || 'Pengguna');
    }
  }
}, [session, localUser]);
  const balance = 12500;
  const transactions = [
    { id: 1, name: 'Belanja', amount: -150, category: 'Shopping', date: '2023-05-15' },
    { id: 2, name: 'Gaji', amount: 2500, category: 'Income', date: '2023-05-10' },
    { id: 3, name: 'Makan', amount: -75, category: 'Food', date: '2023-05-08' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pb-20">
      {/* Header */}
      <header className="p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <p className="text-sm text-cyan-200">Selamat datang</p>
            <h1 className="text-xl font-bold">{userName || 'Pengguna'}</h1>
          </div>
          <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            {userName?.charAt(0) || 'U'}
          </div>
          </Link>
        </motion.div>
      </header>

      {/* Balance Card */}
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="mx-4 p-6 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-2xl shadow-lg mb-6 border border-[#2e3a5b]"
      >
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="text-cyan-300" />
          <h2 className="text-cyan-200">Saldo Kamu</h2>
        </div>
        <div className="flex justify-between items-end">
          <p className="text-3xl font-bold">IDR. {balance.toLocaleString()}</p>
          <button className="text-xs bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1 rounded-full">
            Lihat Detail
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mx-4 mb-6">
        {[
          { icon: <Plus />, label: 'Tambah' },
          { icon: <ArrowUpDown />, label: 'Transfer' },
          { icon: <PieChart />, label: 'Statistik' },
          { icon: <History />, label: 'Riwayat' },
        ].map((item, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-3 bg-gradient-to-b from-[#1e293b] to-[#1e1b4b] rounded-xl border border-[#2e3a5b]"
          >
            <div className="text-cyan-300 mb-1">{item.icon}</div>
            <span className="text-xs">{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-white">Transaksi Terakhir</h2>
          <button className="text-sm text-white">
            Lihat Semua
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((txn) => (
            <motion.div
              key={txn.id}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-xl border border-[#2e3a5b]"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  txn.amount > 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                }`}>
                  {txn.amount > 0 ? (
                    <ArrowUpDown className="text-green-400 rotate-45" />
                  ) : (
                    <ArrowUpDown className="text-red-400 rotate-[-45deg]" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{txn.name}</p>
                  <p className="text-xs text-cyan-200">{txn.category}</p>
                </div>
              </div>
              <p className={`font-bold ${
                txn.amount > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {txn.amount > 0 ? '+' : ''}{txn.amount}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/transactions/add">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
      </Link>
    </div>
  );
}