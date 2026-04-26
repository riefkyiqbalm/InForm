@echo off
setlocal
title InForm Monorepo Installer

echo ============================================
echo 📦 MEMULAI INSTALASI DEPENDENSI (MONOREPO)
echo ============================================

:: 1. Menjalankan npm install di root
echo 🚀 Menjalankan npm install di folder root...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Gagal menginstall dependensi di root.
    goto :error
)

:: 2. Menjalankan Prisma Generate di folder website
echo.
echo 💎 Menghasilkan Prisma Client (Website)...
if exist "website\prisma" (
    cd website
    call npx prisma generate
    cd ..
) else (
    echo ⚠️ Folder prisma tidak ditemukan di folder website. Melewati langkah ini.
)

:: 3. Selesai
echo.
echo ============================================
echo ✅ SEMUA BERHASIL DIINSTALL!
echo ============================================
echo Sekarang Anda bisa menjalankan:
echo - npm run dev (di root untuk semua)
echo - atau masuk ke sub-folder masing-masing.
pause
exit /b 0

:error
echo.
echo 🛑 Terjadi kesalahan saat proses instalasi.
pause
exit /b 1