CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- 'frame', 'lens'
    name TEXT NOT NULL,     -- 'Round', 'Single Vision'
    price DECIMAL(10,2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    frame_shape TEXT NOT NULL,
    frame_color TEXT NOT NULL,
    frame_image_id TEXT,
    lens_type TEXT NOT NULL,
    total_price DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    eye TEXT NOT NULL CHECK(eye IN ('right', 'left')),
    sph REAL,
    cyl REAL,
    axis INTEGER,
    add_power REAL,
    pd REAL
);

-- Seed initial pricing data
INSERT INTO pricing (category, name, price) VALUES
('frame', 'Round', 1500.00),
('frame', 'Aviator', 2500.00),
('frame', 'Cat-Eye', 1800.00),
('frame', 'Rectangle', 1200.00),
('frame', 'Wayfarer', 2000.00),
('frame', 'Rimless', 3000.00),
('lens', 'Single Vision', 500.00),
('lens', 'Bifocal', 1200.00),
('lens', 'Progressive', 2500.00),
('lens', 'Blue Light', 1500.00)
ON CONFLICT DO NOTHING;
