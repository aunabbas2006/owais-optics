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

async function getDb() {
    if (!initialized) {
        const client = await pool.connect();
        try {
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
            await client.query(schema);
            console.log('✅ Database initialized (Postgres)');
            initialized = true;
        } catch (err) {
            console.error('❌ Database initialization failed:', err);
            throw err;
        } finally {
            client.release();
        }
    }
    return pool;
}

// --- Pricing Methods ---

async function getAllPricing() {
    const db = await getDb();
    const res = await db.query('SELECT * FROM pricing ORDER BY category, name');
    return res.rows;
}

async function updatePricing(id, price) {
    const db = await getDb();
    await db.query('UPDATE pricing SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [price, id]);
}

// --- Customer Methods ---

async function findCustomerByEmail(email) {
    const db = await getDb();
    const res = await db.query('SELECT * FROM customers WHERE email = $1', [email]);
    return res.rows[0];
}

async function createCustomer(name, email) {
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
    const db = await getDb();
    const res = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    return res.rows[0];
}

// --- Order Methods ---

async function createOrder(customerId, frameShape, frameColor, frameImageId, lensType, totalPrice, notes) {
    const db = await getDb();
    const res = await db.query(
        `INSERT INTO orders (customer_id, frame_shape, frame_color, frame_image_id, lens_type, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [customerId, frameShape, frameColor, frameImageId, lensType, totalPrice, notes || null]
    );
    return res.rows[0].id;
}

async function createPrescription(orderId, eye, sph, cyl, axis, addPower, pd) {
    const db = await getDb();
    await db.query(
        `INSERT INTO prescriptions (order_id, eye, sph, cyl, axis, add_power, pd)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, eye, sph, cyl, axis, addPower, pd]
    );
}

async function getOrdersByCustomer(customerId) {
    const db = await getDb();
    const res = await db.query(
        'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
        [customerId]
    );
    const orders = res.rows;

    for (const order of orders) {
        const rxRes = await db.query(
            'SELECT * FROM prescriptions WHERE order_id = $1',
            [order.id]
        );
        order.prescriptions = rxRes.rows;
    }
    return orders;
}

async function getOrderById(orderId) {
    const db = await getDb();
    const res = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    const order = res.rows[0];
    
    if (order) {
        const rxRes = await db.query(
            'SELECT * FROM prescriptions WHERE order_id = $1',
            [order.id]
        );
        order.prescriptions = rxRes.rows;
        order.customer = await getCustomerById(order.customer_id);
    }
    return order;
}

async function getAllOrders() {
    const db = await getDb();
    const res = await db.query(`
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.created_at DESC
    `);
    const orders = res.rows;

    for (const order of orders) {
        const rxRes = await db.query(
            'SELECT * FROM prescriptions WHERE order_id = $1',
            [order.id]
        );
        order.prescriptions = rxRes.rows;
    }
    return orders;
}

async function updateOrderStatus(orderId, status) {
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
