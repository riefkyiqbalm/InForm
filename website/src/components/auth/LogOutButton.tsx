'use-client'
import React, { useState } from 'react';

/**
 * PENTING: Jika alias @sharedUI menyebabkan error di lingkungan lokal,
 * pastikan konfigurasi path di tsconfig.json atau next.config.js sudah benar.
 * Di sini kita menggunakan alias sesuai struktur proyek Anda.
 */
import Modal from '@sharedUI/components/Modal';
import Icon from '@sharedUI/components/IconStyles';

/**
 * ── GUNAKAN SHARED HOOK ──
 * Kita memanggil useAuth dari SharedAuthContext agar komponen ini 
 * dapat bekerja di manapun ia diletakkan (Website maupun SharedUI).
 */
import { useAuth } from '@sharedUI/context/SharedAuthContext';

export default function LogOut() {
  // Mengambil fungsi logout dari SharedAuthContext
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const handleConfirm = () => {
    logout();
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <a 
        onClick={handleLogoutClick} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          padding: '10px 12px', 
          borderRadius: '10px', 
          fontSize: '13px', 
          color: 'var(--red)', 
          cursor: 'pointer', 
          textDecoration: 'none', 
          transition: 'all .15s' 
        }}
      >
        <Icon name="red-logout" size={20} invert={false}/>
        Keluar
      </a>
      
      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        message="Keluar dari InForm?"
      />
    </>
  );
}