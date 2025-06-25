// backend/server.js
require("dotenv").config(); // Untuk baca .env
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors"); // Penting buat komunikasi frontend-backend

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Buat baca JSON dari request
app.use(cors()); // Izinkan frontend akses backend

// Konfigurasi koneksi PostgreSQL (nanti diambil dari Docker Compose)
const pool = new Pool({
  user: process.env.DB_USER || "user",
  host: process.env.DB_HOST || "db", // 'db' adalah nama service database di Docker Compose
  database: process.env.DB_NAME || "laundrydb",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

// Test koneksi DB
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("Connected to PostgreSQL database!");
  release(); // Lepas client
});

// --- API Sederhana ---

// Login (dummy, gak pake multi-role & password hashing dulu biar cepat)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.json({ success: true, message: "Login berhasil!", role: "admin" });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Username atau password salah!" });
  }
});

// Tambah Customer
app.post("/api/customers", async (req, res) => {
  // Frontend mengirim 'name', 'address', 'phone'. Sesuaikan dengan nama kolom di DB
  const { name, address, phone } = req.body; // Mengambil 'address' dan 'phone' dari frontend
  try {
    const result = await pool.query(
      "INSERT INTO customers (name, contact) VALUES ($1, $2) RETURNING *", // Kolom 'contact' di DB mungkin perlu diganti jadi 'address' atau 'phone' jika skema DB berbeda
      [name, phone] // Menggunakan 'phone' untuk kolom 'contact' (asumsi: contact = phone)
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah customer" });
  }
});

// Ambil Daftar Customer
app.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar customer" });
  }
});

// Tambah Transaksi
app.post("/api/transactions", async (req, res) => {
    // Sesuaikan dengan nama yang dikirim dari frontend
    const { customer_id, service_type, weight, total_price, status } = req.body; // <--- Perubahan di sini!
    try {
        const result = await pool.query(
            "INSERT INTO transactions (customer_id, item_type, weight, total_cost, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *", // <--- Tambah created_at jika belum ada, pakai NOW()
            [customer_id, service_type, weight, total_price, status] // <--- Gunakan service_type untuk item_type, dan total_price untuk total_cost, serta status dari frontend
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        // Detail error dari DB sangat membantu di sini
        res.status(500).json({ error: "Gagal menambah transaksi", details: err.message });
    }
});

// Ambil Daftar Transaksi
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as customer_name
             FROM transactions t
             JOIN customers c ON t.customer_id = c.id
             ORDER BY t.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar transaksi" });
  }
});

// Ambil Detail Transaksi untuk Invoice (minimalis)
app.get("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as customer_name, c.contact as customer_contact
             FROM transactions t
             JOIN customers c ON t.customer_id = c.id
             WHERE t.id = $1`,
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil detail transaksi" });
  }
});

// Laporan Harian (sangat sederhana) - Pastikan kolom created_at ada di DB
app.get("/api/reports/daily", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT SUM(total_cost) as total_daily_revenue, COUNT(id) as total_transactions
             FROM transactions
             WHERE created_at::date = CURRENT_DATE` // <--- Perubahan di sini: Pakai created_at jika itu nama kolom tanggal di DB
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil laporan harian" });
  }
});

// --- Laporan Umum (dengan filter tanggal) ---
app.get("/api/reports", async (req, res) => {
    const { start_date, end_date } = req.query; // Ambil dari query params

    if (!start_date || !end_date) {
        return res.status(400).json({ error: "Mohon sediakan start_date dan end_date untuk laporan." });
    }

    try {
        // Query untuk mendapatkan ringkasan harian dalam rentang tanggal
        const result = await pool.query(
            `SELECT
                DATE(created_at) as date,
                COUNT(id) as total_transactions,
                SUM(total_cost) as total_revenue
            FROM transactions
            WHERE created_at::date BETWEEN $1 AND $2
            GROUP BY DATE(created_at)
            ORDER BY date ASC`,
            [start_date, end_date]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil laporan", details: err.message });
    }
});


// Start Server
app.listen(port, () => {
  console.log(`Backend server berjalan di http://localhost:${port}`);
});