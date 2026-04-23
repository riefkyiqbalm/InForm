/**
 * Komponen ini menyuntikkan keyframes global yang diperlukan untuk 
 * animasi pada alur verifikasi (Pulse, Spin, Checkmark Draw, dll).
 */
import React from 'react';

export default function VerifyAnimation() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* Rotasi Spinner pada VerifyingView */
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Efek Riak (Ripple) pada WaitingView */
      @keyframes ripple {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(1.6); opacity: 0; }
      }

      /* Animasi Menggambar Centang pada SuccessView */
      @keyframes checkDraw {
        to { stroke-dashoffset: 0; }
      }

      /* Animasi Menggambar Tanda Silang pada ErrorView */
      @keyframes xDraw {
        to { stroke-dashoffset: 0; }
      }

      /* Efek Mengambang untuk Orb Background */
      @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        33% { transform: translate(30px, -50px); }
        66% { transform: translate(-20px, 20px); }
      }

      /* Animasi Masuk Content (Fade In Up) */
      @keyframes fadeInUp {
        from { 
          opacity: 0; 
          transform: translateY(10px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
    `}} />
  );
}