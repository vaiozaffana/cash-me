'use client';
import { useSession } from 'next-auth/react';
import { useUser } from '../UserProvider';
import { motion } from 'framer-motion';
import { Edit, Settings, LogOut, User, Mail, Calendar, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { user: localuser } = useUser();
  const { setUser } = useUser()
  const router = useRouter();

  const currentUser = session?.user || localuser;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Data contoh
  const joinDate = new Date(currentUser?.createdAt || Date.now());
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      if (session) {
        await signOut({ callbackUrl: '/' });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null)
        window.location.href = '/';
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
        // Di sini Anda bisa mengupload gambar ke server
        // dan mengupdate session setelah upload berhasil
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Simpan perubahan nama (dan avatar jika ada)
      await update({
        ...session,
        user: {
          ...currentUser,
          name: name,
          image: avatarPreview || currentUser?.image,
        },
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Gagal mengupdate profil:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pb-20"
    >
      {/* Header */}
      <div className="relative h-40 bg-gradient-to-r from-cyan-500/30 to-purple-600/30">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-black/30 p-2 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4">
        <motion.div 
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="relative -top-12"
        >
          <div className="relative w-24 h-24 rounded-full border-4 border-[#0f172a] bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mx-auto">
            {avatarPreview || currentUser?.image ? (
              <img 
                src={avatarPreview || currentUser?.image || ''} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : currentUser?.name ? (
              <span className="text-3xl font-bold">
                {currentUser?.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={32} />
            )}

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1.5"
            >
              <Edit size={14} className="text-white" />
            </button>
          </div>

          <div className="text-center mt-4">
            <h1 className="text-xl font-bold">{currentUser?.name || 'Pengguna'}</h1>
            <p className="text-cyan-200 mt-1 flex items-center justify-center gap-1">
              <Mail size={14} />
              {currentUser?.email || 'email@contoh.com'}
            </p>
            <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Calendar size={14} />
              Bergabung {months[joinDate.getMonth()]} {joinDate.getFullYear()}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 mb-8">
          {[
            { value: '1.2jt', label: 'Saldo' },
            { value: '24', label: 'Transaksi' },
            { value: '5', label: 'Kategori' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-b from-[#1e293b] to-[#1e1b4b] p-3 rounded-xl border border-[#2e3a5b] text-center"
            >
              <p className="font-bold text-lg">{stat.value}</p>
              <p className="text-xs text-cyan-200">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEditModal(true)}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-xl border border-[#2e3a5b]"
          >
            <div className="text-cyan-300"><Edit size={18} /></div>
            <span className="flex-1 text-left">Edit Profil</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/settings')}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-xl border border-[#2e3a5b]"
          >
            <div className="text-cyan-300"><Settings size={18} /></div>
            <span className="flex-1 text-left">Pengaturan</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#1e293b] to-[#1e1b4b] rounded-xl border border-[#2e3a5b] text-red-400"
          >
            <div className="text-red-400"><LogOut size={18} /></div>
            <span className="flex-1 text-left">Keluar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </motion.button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>CashMe App v1.0.0</p>
          <p className="mt-1">© 2023 Dibuat dengan Next.js</p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-b from-[#1e293b] to-[#1e1b4b] p-6 rounded-xl w-full max-w-md border border-[#2e3a5b]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Edit Profil</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center overflow-hidden">
                    {avatarPreview || currentUser?.image ? (
                      <img 
                        src={avatarPreview || currentUser?.image || ''} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1.5"
                  >
                    <Edit size={12} className="text-white" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-cyan-200 mb-1">Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#2e3a5b] rounded-lg p-3"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-3 rounded-lg font-medium mt-4"
              >
                Simpan Perubahan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}