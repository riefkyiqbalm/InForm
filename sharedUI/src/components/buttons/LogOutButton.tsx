import React, { useState } from 'react';
import { useAuth } from '@sharedUI/context/AuthContext';
import Modal from '../Modal';
import Icon from '../IconStyles';

export default function LogOut() {
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
      <a onClick={handleLogoutClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--red)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
        <Icon name="logout" size={20} invert = {false}/>
        Keluar
      </a>
      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        message="Keluar dari BG-AI?"
      />
    </>
  );
}