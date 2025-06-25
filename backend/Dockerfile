# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Salin file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install semua dependensi Node.js
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# Port yang digunakan aplikasi Node.js Anda
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["node", "server.js"]