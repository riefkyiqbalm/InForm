'use client';

import React, { useEffect, useState } from 'react';
import LeftPanel from '@/components/profiles/LeftPanel';
import SummaryCard from '@/components/profiles/SummaryCard';
import PersonalInfo from '@/components/profiles/PersonalInfo';
import DangerZoneCard from '@/components/profiles/DangerZoneCard';
import Toast from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import Cookies from 'js-cookie';
import TopPanel from '@/components/profiles/TopPanel';

export default function AuthPage() {
  const { user } = useAuth();
  const { logout } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [profileName, setProfileName] = useState('User name');
  const [profileEmail, setProfileEmail] = useState('email@example.com');
  const [profileRoles, setProfileRoles] = useState<string[]>(['User']);

  useEffect(() => {
    if (user) {
      const fallbackName = user.name || user.email || 'User name';
      const fallbackEmail = user.email || user.name || 'email@example.com';
      setProfileName(fallbackName);
      setProfileEmail(fallbackEmail);
      setProfileRoles(['User']);
    }
  }, [user]);

  const updateProfileFromDb = (data: { name: string; email: string; role: string }) => {
    setProfileName(data.name || data.email || 'User name');
    setProfileEmail(data.email || 'email@example.com');
    setProfileRoles(data.role ? [data.role] : ['User']);
  };

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2800);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = Cookies.get('_auth_token');
      
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Jika sukses hapus di DB, bersihkan cookies dan tendang ke login
        logout(); 
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus akun');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <div style={S.pageRoot}>
      <TopPanel title="BG-AI" subtitle="Profil" />

      <div style={S.pageBody}>
        <LeftPanel />

        <div style={S.main}>
          <div style={S.headingContainer}>
            <div style={S.title}>Pengaturan Akun</div>
            <div style={S.subtitle}>Kelola profil, keamanan, dan preferensi platform Anda.</div>
          </div>

          <SummaryCard name={profileName} email={profileEmail} roles={profileRoles} />

          <PersonalInfo onProfileUpdated={updateProfileFromDb} />

          <DangerZoneCard  onDeleteAccount={() => setIsModalOpen(true)} onDeleteAll={() => displayToast('Semua data chat dihapus (dummy).')} />
        </div>
      </div>

      
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          message="Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDeleteAccount}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {showToast && <Toast message={toastMessage} type="success" />}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  pageRoot: {
    background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column'
  },
  pageBody: { display: 'flex', flex: 1 },
  main: { flex: 1, padding: '36px 40px', overflowY: 'auto', maxWidth: '900px' },
  headingContainer: { marginBottom: '24px' },
  title: { fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' },
  subtitle: { color: 'var(--muted)', fontSize: '14px' },
};
