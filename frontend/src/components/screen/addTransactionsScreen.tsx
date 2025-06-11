'use client';
import { useState } from 'react';
import { Wallet, Calendar, Tag, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note?: string;
  date: string;
}

export default function AddTransaction() {
  const router = useRouter();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const categories = {
    expense: [
      { id: 'food', name: 'Makanan & Minuman' },
      { id: 'shopping', name: 'Belanja' },
      { id: 'electricity', name: 'Listrik' },
      { id: 'health', name: 'Kesehatan' },
      { id: 'transport', name: 'Transportasi' },
      { id: 'other', name: 'Lainnya' },
    ],
    income: [
      { id: 'salary', name: 'Gaji' },
      { id: 'bonus', name: 'Bonus' },
      { id: 'gift', name: 'Hadiah' },
      { id: 'investment', name: 'Investasi' },
      { id: 'other', name: 'Lainnya' },
    ],
  };

  const currentDate = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handleCategorySelect = (catId: string) => {
    if (catId === 'other') {
      setShowCustomCategory(true);
      setCategory('');
    } else {
      setShowCustomCategory(false);
      setCategory(catId);
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      toast.error('Jumlah harus lebih dari 0');
      return;
    }
    
    const finalCategory = showCustomCategory ? customCategory : category;
    if (!finalCategory) {
      toast.error('Kategori wajib diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        type,
        category: finalCategory,
        amount: Number(amount),
        note: note || 'Tidak ada catatan',
        date: new Date().toISOString()
      };

      const token = localStorage.getItem('laravelToken');
      if (!token) {
        toast.error('Anda harus login terlebih dahulu');
        router.push('/');
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
        transactionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Transaksi berhasil ditambahkan');
        router.push('/dashboard');
      } else {
        toast.error(response.data.message || 'Gagal menambahkan transaksi');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menambahkan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-4 pb-24"
    >
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
          >
            Tambah Transaksi
          </motion.h1>
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-cyan-200">
          <Calendar size={16} />
          <span>
            {days[currentDate.getDay()]}, {currentDate.getDate()} {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipe Transaksi */}
        <div className="grid grid-cols-2 gap-2 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] p-1 rounded-lg border border-[#2e3a5b]">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('');
              setShowCustomCategory(false);
            }}
            className={`py-3 rounded-md transition-all ${
              type === 'expense' 
                ? 'bg-gradient-to-r from-red-500/80 to-purple-600/80' 
                : 'bg-transparent'
            }`}
          >
            Pengeluaran
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              setType('income');
              setCategory('');
              setShowCustomCategory(false);
            }}
            className={`py-3 rounded-md transition-all ${
              type === 'income' 
                ? 'bg-gradient-to-r from-cyan-500/80 to-emerald-600/80' 
                : 'bg-transparent'
            }`}
          >
            Pendapatan
          </motion.button>
        </div>

        {/* Jumlah */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-cyan-200">
            <Wallet size={18} />
            <span>Jumlah</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-300">Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-lg py-3 pl-10 pr-4 text-xl font-medium border border-[#2e3a5b]"
              required
              min="1"
            />
          </div>
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-cyan-200">
            <Tag size={18} />
            <span>Kategori</span>
          </label>
          
          {showCustomCategory ? (
            <div className="relative">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Masukkan kategori baru"
                className="w-full bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-lg py-3 px-4 font-medium border border-cyan-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomCategory(false);
                  setCustomCategory('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-300"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories[type].map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`py-3 rounded-lg transition-all border ${
                    (category === cat.id || (cat.id === 'other' && showCustomCategory))
                      ? 'border-cyan-400 bg-cyan-500/20'
                      : 'border-[#2e3a5b] bg-gradient-to-b from-[#1e293b] to-[#1e1b4b]'
                  }`}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Catatan */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-cyan-200">
            <FileText size={18} />
            <span>Catatan (Opsional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan deskripsi..."
            className="w-full bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-lg p-3 min-h-[100px] border border-[#2e3a5b]"
          />
        </div>

        {/* Button Group */}
        <div className="fixed bottom-4 left-0 right-0 px-4 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-1/3 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] py-3 rounded-lg font-medium shadow-lg border border-[#2e3a5b]"
          >
            Batal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-2/3 bg-gradient-to-r from-cyan-500 to-purple-600 py-3 rounded-lg font-medium shadow-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}