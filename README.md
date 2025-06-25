# Sistem Informasi Manajemen Laundry (Laundry-App-Demo)

## Cara Menjalankan Proyek

Pastikan Anda telah menginstal [Docker Desktop](https://www.docker.com/products/docker-desktop/) di sistem Anda.

1.  **Clone Repositori:**
    ```bash
    git clone [URL_REPOSITORI_ANDA]
    cd laundry-app-demo
    ```

2.  **Bangun dan Jalankan Kontainer:**
    Navigasikan ke direktori utama proyek `laundry-app-demo` (tempat file `docker-compose.yml` berada) dan jalankan perintah ini:
    ```bash
    docker compose up --build -d
    ```
    * Perintah ini akan membangun image Docker yang diperlukan dan menjalankan semua layanan (`frontend`, `backend`, `db`, `mailhog`) di latar belakang.

3.  **Inisialisasi Database (Jika Diperlukan):**
    Jika ini adalah pertama kali Anda menjalankan proyek atau setelah Anda menjalankan `docker compose down -v` sebelumnya (yang menghapus data database), Anda mungkin perlu menambahkan kembali kolom `created_at` ke tabel `transactions`.
    ```bash
    docker exec -it laundry-app-demo-db-1 psql -U user -d laundrydb
    ALTER TABLE transactions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    \q
    ```
    *(Pastikan nama kontainer database `laundry-app-demo-db-1` sesuai dengan yang terlihat di `docker ps`.)*

4.  **Akses Aplikasi:**
    Setelah semua kontainer berjalan dengan sukses (Anda bisa cek dengan `docker ps`), buka browser Anda dan akses:
    * **Aplikasi Laundry (Frontend):** `http://localhost/`
    * **Mailhog (untuk melihat email test):** `http://localhost:8025/`

---
