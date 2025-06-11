"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Transaction {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = session?.laravelToken || localStorage.getItem("laravelToken");
      if (!token) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setTransactions(response.data.transactions);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching transactions", err);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  useEffect(() => {
    let temp = [...transactions];

    if (search.trim()) {
      temp = temp.filter(
        (txn) =>
          txn.category.toLowerCase().includes(search.toLowerCase()) ||
          txn.note?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter) {
      temp = temp.filter((txn) => txn.category === categoryFilter);
    }

    if (dateFilter) {
      temp = temp.filter((txn) =>
        txn.date.startsWith(dateFilter)
      ); // format: "2025-06"
    }

    setFiltered(temp);
  }, [search, categoryFilter, dateFilter, transactions]);

  const uniqueCategories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4">
      <h1 className="text-xl font-bold mb-4">Semua Transaksi</h1>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari kategori / catatan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] focus:outline-none w-full"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] w-full md:w-48"
        >
          <option value="">Semua Kategori</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] w-full md:w-48"
        />
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-cyan-300">Tidak ada transaksi ditemukan.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((txn) => (
            <motion.div
              key={txn.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-xl border border-[#2e3a5b] flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-sm">{txn.category}</p>
                {txn.note && <p className="text-xs text-cyan-300">{txn.note}</p>}
                <p className="text-xs text-cyan-500 mt-1">
                  {format(new Date(txn.date), "d MMMM yyyy", { locale: localeId })}
                </p>
              </div>
              <div className={`text-sm font-bold ${txn.type === "income" ? "text-green-400" : "text-red-400"}`}>
                {txn.type === "income" ? "+" : "-"}Rp{Math.abs(txn.amount).toLocaleString("id-ID")}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
