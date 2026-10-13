# Naureen Mini Garden

Halaman `galeri.html` menampilkan foto, tautan video ke akun resmi TikTok dan Instagram, serta rating dan testimoni pengunjung yang menggunakan penyimpanan ulasan situs. Halaman `sejarah.html` memuat linimasa perjalanan Naureen Mini Garden. Halaman `sewa-gazebo.html` menampilkan pilihan gazebo dan cottage, harga per sesi, fasilitas, jadwal, dan kontak admin untuk pemesanan. Halaman `terapi-ikan.html` menampilkan informasi terapi ikan berbayar beserta pilihan harga dan durasi. Beranda juga memuat informasi terapi ikan gratis dan aktivitas pemancingan.
Halaman `edukasi.html` memuat tiket masuk, fasilitas edukasi gratis, pilihan paket kegiatan, dan dokumentasi kegiatan edukasi.

## Rating dan ulasan pengunjung

Setiap kiriman wajib berisi nama tampilan dan ulasan (10–500 karakter); rating 1–5 bintang bersifat opsional. Jika diisi, nama, rating, dan ulasan disimpan bersama dalam satu record. Semua ulasan tersimpan dapat dibaca oleh pengunjung secara bertahap. Database menolak perubahan dan penghapusan record melalui aplikasi. Administrator project tetap dapat mengubah database, dan layanan online tidak bisa dijamin bebas kehilangan data; buat serta simpan cadangan database secara berkala.

1. Buat project Supabase di [supabase.com](https://supabase.com/).
2. Buka **SQL Editor**, jalankan seluruh isi `supabase-schema.sql`. Jika skema lama sudah pernah diaktifkan, jalankan ulang file ini untuk migrasi; data ulasan dan rating lama tidak dihapus, serta ulasan lama ditampilkan atas nama "Pengunjung". Fungsi ulasan mengambil semua kiriman dalam halaman-halaman kecil agar batas respons API tidak menyembunyikan ulasan lama.
3. Buka **Project Settings → API**. Salin **Project URL** dan **anon/public key** ke `supabase-config.js`.
   Jangan pernah menaruh `service_role` key di file situs.
4. Publikasikan ulang situs dan buka melalui HTTPS. Pastikan tulisan **"Database online aktif"** terlihat di bagian ulasan agar chat tersimpan online dan dapat dilihat pengunjung lain. Jika Supabase belum siap, form pengiriman dinonaktifkan agar tidak memberi kesan chat tersimpan online padahal hanya di browser.

Jika konfigurasi Supabase belum diisi, situs memakai penyimpanan lokal sebagai mode sementara; data itu hanya ada di browser/perangkat tersebut dan dapat hilang. Jangan gunakan mode ini untuk ulasan yang harus dibagikan atau dipertahankan. Nama yang dimasukkan akan terlihat publik; minta pengunjung memakai nama tampilan yang nyaman mereka bagikan.
