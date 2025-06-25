-- init.sql
-- Buat tabel customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    item_type VARCHAR(100) NOT NULL,
    weight DECIMAL(10, 2),
    total_cost DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Baru Masuk',
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_completed TIMESTAMP WITH TIME ZONE
);

-- Insert dummy customer for easy testing
INSERT INTO customers (name, contact) VALUES ('Hotel ABC', '08123456789');
INSERT INTO customers (name, contact) VALUES ('Villa XYZ', '08765432100');