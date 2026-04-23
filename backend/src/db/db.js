const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

let initialized = false;

// --- IN-MEMORY DEMO STORAGE ---
const demoStore = {
    customers: [
        { id: 99, name: 'Demo User', email: 'demo@example.com' }
    ],
    orders: [],
    pricing: [
        { id: 1, category: 'frame', name: 'Round', price: 1500 },
        { id: 2, category: 'frame', name: 'Aviator', price: 2500 },
        { id: 3, category: 'lens', name: 'Single Vision', price: 500 },
        { id: 4, category: 'lens', name: 'Progressive', price: 2500 }
    ],
    prescriptions: []
};

async function getDb() {
    if (process.env.DEMO_MODE === 'true') {
        return {
            query: async () => ({ rows: [] }),
            connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} })
        };
    }

    if (!initialized && (process.env.POSTGRES_URL || process.env.DATABASE_URL)) {
        try {
            const client = await pool.connect();
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
            await client.query(schema);
            console.log('✅ Database initialized (Postgres)');
            initialized = true;
            client.release();
        } catch (err) {
            console.error('⚠️ Database init skipped/failed:', err.message);
        }
    }
    return pool;
}

// --- Pricing Methods ---

async function getAllPricing() {
    if (process.env.DEMO_MODE === 'true') {
        return demoStore.pricing;
    }
    const db = await getDb();
    const res = await db.query('SELECT * FROM pricing ORDER BY category, name');
    return res.rows;
}

async function updatePricing(id, price) {
    if (process.env.DEMO_MODE === 'true') {
        const item = demoStore.pricing.find(p => p.id === Number(id));
        if (item) item.price = Number(price);
        return;
    }
    const db = await getDb();
    await db.query('UPDATE pricing SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [price, id]);
}

// --- Customer Methods ---

async function findCustomerByEmail(email) {
    if (process.env.DEMO_MODE === 'true') {
        return demoStore.customers.find(c => c.email === email.toLowerCase());
    }
    const db = await getDb();
    const res = await db.query('SELECT * FROM customers WHERE email = $1', [email]);
    return res.rows[0];
}

async function createCustomer(name, email) {
    if (process.env.DEMO_MODE === 'true') {
        const existing = await findCustomerByEmail(email);
        if (existing) {
            existing.name = name;
            return existing;
        }
        const newCustomer = { id: demoStore.customers.length + 100, name, email: email.toLowerCase() };
        demoStore.customers.push(newCustomer);
        return newCustomer;
    }
    const db = await getDb();
    const existing = await findCustomerByEmail(email);
    if (existing) {
        await db.query('UPDATE customers SET name = $1 WHERE email = $2', [name, email]);
        return await findCustomerByEmail(email);
    }
    const res = await db.query(
        'INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id, name, email',
        [name, email]
    );
    return res.rows[0];
}

async function getCustomerById(id) {
    if (process.env.DEMO_MODE === 'true') {
        return demoStore.customers.find(c => c.id === Number(id));
    }
    const db = await getDb();
    const res = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    return res.rows[0];
}

// --- Order Methods ---

async function createOrder(customerId, frameShape, frameColor, frameImageId, lensType, totalPrice, notes) {
    if (process.env.DEMO_MODE === 'true') {
        const newOrder = {
            id: demoStore.orders.length + 1000,
            customer_id: Number(customerId),
            frame_shape: frameShape,
            frame_color: frameColor,
            frame_image_id: frameImageId,
            lens_type: lensType,
            total_price: totalPrice,
            status: 'Pending',
            notes: notes || null,
            created_at: new Date().toISOString()
        };
        demoStore.orders.push(newOrder);
        return newOrder.id;
    }
    const db = await getDb();
    const res = await db.query(
        `INSERT INTO orders (customer_id, frame_shape, frame_color, frame_image_id, lens_type, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [customerId, frameShape, frameColor, frameImageId, lensType, totalPrice, notes || null]
    );
    return res.rows[0].id;
}

async function createPrescription(orderId, eye, sph, cyl, axis, addPower, pd) {
    if (process.env.DEMO_MODE === 'true') {
        demoStore.prescriptions.push({ order_id: Number(orderId), eye, sph, cyl, axis, add_power: addPower, pd });
        return;
    }
    const db = await getDb();
    await db.query(
        `INSERT INTO prescriptions (order_id, eye, sph, cyl, axis, add_power, pd)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, eye, sph, cyl, axis, addPower, pd]
    );
}

async function getOrdersByCustomer(customerId) {
    if (process.env.DEMO_MODE === 'true') {
        const orders = demoStore.orders.filter(o => o.customer_id === Number(customerId));
        return orders.map(o => ({
            ...o,
            prescriptions: demoStore.prescriptions.filter(p => p.order_id === o.id)
        }));
    }
    const db = await getDb();
    const res = await db.query(
        'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
        [customerId]
    );
    const orders = res.rows;
    for (const order of orders) {
        const rxRes = await db.query('SELECT * FROM prescriptions WHERE order_id = $1', [order.id]);
        order.prescriptions = rxRes.rows;
    }
    return orders;
}

async function getOrderById(orderId) {
    if (process.env.DEMO_MODE === 'true') {
        const order = demoStore.orders.find(o => o.id === Number(orderId));
        if (order) {
            order.prescriptions = demoStore.prescriptions.filter(p => p.order_id === order.id);
            order.customer = demoStore.customers.find(c => c.id === order.customer_id);
        }
        return order;
    }
    const db = await getDb();
    const res = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    const order = res.rows[0];
    if (order) {
        const rxRes = await db.query('SELECT * FROM prescriptions WHERE order_id = $1', [order.id]);
        order.prescriptions = rxRes.rows;
        order.customer = await getCustomerById(order.customer_id);
    }
    return order;
}

async function getAllOrders() {
    if (process.env.DEMO_MODE === 'true') {
        return demoStore.orders.map(o => {
            const customer = demoStore.customers.find(c => c.id === o.customer_id);
            return {
                ...o,
                customer_name: customer?.name,
                customer_email: customer?.email,
                prescriptions: demoStore.prescriptions.filter(p => p.order_id === o.id)
            };
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const db = await getDb();
    const res = await db.query(`
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
    `);
    const orders = res.rows;
    for (const order of orders) {
        const rxRes = await db.query('SELECT * FROM prescriptions WHERE order_id = $1', [order.id]);
        order.prescriptions = rxRes.rows;
    }
    return orders;
}

async function updateOrderStatus(orderId, status) {
    if (process.env.DEMO_MODE === 'true') {
        const order = demoStore.orders.find(o => o.id === Number(orderId));
        if (order) order.status = status;
        return;
    }
    const db = await getDb();
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
}

module.exports = {
    getDb,
    getAllPricing,
    updatePricing,
    findCustomerByEmail,
    createCustomer,
    getCustomerById,
    createOrder,
    createPrescription,
    getOrdersByCustomer,
    getOrderById,
    getAllOrders,
    updateOrderStatus
};
