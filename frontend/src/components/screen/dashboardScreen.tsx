"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Wallet, Plus, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useUser } from "../UserProvider";
import axios from "axios";

interface Transaction {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  note?: string;
  date: string;
}

interface MonthGroup {
  monthYear: string;
  monthName: string;
  year: string;
  transactions: Transaction[];
  isOpen: boolean;
}

export default function DashboardScreen() {
  const { data: session } = useSession();
  const { user: localUser } = useUser();
  const [laravelToken, setLaravelToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expense: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(null);

  useEffect(() => {
    if (session?.laravelToken) {
      localStorage.setItem("laravelToken", session.laravelToken);
      setLaravelToken(session.laravelToken);
    } else {
      // fallback ke localStorage jika session belum siap
      const tokenFromStorage = localStorage.getItem("laravelToken");
      if (tokenFromStorage) {
        setLaravelToken(tokenFromStorage);
      }
    }
  }, [session]);

  console.log('Token: ', laravelToken)
  

  useEffect(() => {
    if (!laravelToken) return;

    const fetchData = async () => {
      try {
        // Fetch summary data
        const summaryResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions/summary`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("laravelToken")}`,
              Accept: 'application/json'
            },
          }
        );
        setSummary(summaryResponse.data);

        // Fetch transactions
        const transactionsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("laravelToken")}`,
              Accept: 'application/json'
            },
          }
        );
        setTransactions(transactionsResponse.data.transactions);
        setIsLoading(false);
      } catch (err: any) {
        setIsError(err.response?.data?.message || "Something went wrong");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [laravelToken]);

  useEffect(() => {
    if (transactions.length > 0) {
      const grouped = groupTransactionsByMonth(transactions);
      setMonthGroups(grouped);
    }
  }, [transactions]);

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "Pengguna");
    } else if (localUser) {
      setUserName(localUser.name || "Pengguna");
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "Pengguna");
      }
    }
  }, [session, localUser]);

  const groupTransactionsByMonth = (transactions: Transaction[]): MonthGroup[] => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const groupsMap = new Map<string, Transaction[]>();

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group by month-year
    sortedTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)?.push(transaction);
    });

    // Convert to array of MonthGroup objects
    return Array.from(groupsMap.entries()).map(([key, transactions]) => {
      const [year, month] = key.split('-');
      return {
        monthYear: key,
        monthName: monthNames[parseInt(month)],
        year,
        transactions,
        isOpen: parseInt(month) === new Date().getMonth() && parseInt(year) === new Date().getFullYear()
      };
    });
  };

  const toggleMonthGroup = (monthYear: string) => {
    setMonthGroups(prevGroups =>
      prevGroups.map(group =>
        group.monthYear === monthYear
          ? { ...group, isOpen: !group.isOpen }
          : group
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pb-24">
      {/* Header */}
      <header className="p-4 sticky top-0 z-10 bg-[#0f172a]/90 backdrop-blur-sm border-b border-[#1e293b]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="max-w-[70%]">
            <p className="text-sm text-cyan-200 truncate">Selamat datang</p>
            <h1 className="text-xl font-bold truncate">
              {session?.user?.name || localUser?.name || "Pengguna"}
            </h1>
          </div>
          <Link href="/profile" className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              {(session?.user?.name || localUser?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          </Link>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Balance Card */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="p-4 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-2xl shadow-lg mb-6 border border-[#2e3a5b]"
        >
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="text-cyan-300" size={20} />
            <h2 className="text-cyan-200 text-sm">Saldo Kamu</h2>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-bold">
              Rp{summary.balance.toLocaleString("id-ID")}
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                +Rp{summary.income.toLocaleString("id-ID")}
              </span>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                -Rp{summary.expense.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Monthly Transaction Groups */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-white text-base">Transaksi Bulanan</h2>
            <Link href="/transactions" className="text-sm text-cyan-300">
              Lihat Semua
            </Link>
          </div>

          {monthGroups.length > 0 ? (
            <div className="space-y-4">
              {monthGroups.map((group) => (
                <div key={group.monthYear} className="bg-[#1e293b]/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleMonthGroup(group.monthYear)}
                    className="w-full flex justify-between items-center p-3 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b]"
                  >
                    <h3 className="font-medium text-cyan-200">
                      {group.monthName} {group.year}
                    </h3>
                    {group.isOpen ? (
                      <ChevronUp className="text-cyan-300" size={18} />
                    ) : (
                      <ChevronDown className="text-cyan-300" size={18} />
                    )}
                  </button>

                  {group.isOpen && (
                    <div className="space-y-2 p-2">
                      {group.transactions.map((txn) => (
                        <motion.div
                          key={txn.id}
                          whileHover={{ scale: 1.01 }}
                          className="flex justify-between items-center p-3 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-lg border border-[#2e3a5b]"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`p-1.5 rounded-full ${
                                txn.type === "income" ? "bg-green-900/30" : "bg-red-900/30"
                              }`}
                            >
                              <ArrowUpDown
                                size={18}
                                className={
                                  txn.type === "income"
                                    ? "text-green-400 rotate-45"
                                    : "text-red-400 rotate-[-45deg]"
                                }
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{txn.category}</p>
                              {txn.note && (
                                <p className="text-xs text-cyan-200 truncate">{txn.note}</p>
                              )}
                              <p className="text-xs text-cyan-300 mt-0.5">
                                {new Date(txn.date).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <p
                            className={`font-bold text-sm whitespace-nowrap ml-2 ${
                              txn.type === "income" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {txn.type === "income" ? "+" : "-"}Rp
                            {Math.abs(txn.amount).toLocaleString("id-ID")}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-cyan-300">
              Tidak ada transaksi
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href="/transactions/add">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <Plus size={20} />
        </motion.button>
      </Link>
    </div>
  );
}