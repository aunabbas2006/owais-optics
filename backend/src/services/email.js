const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass || process.env.DEMO_MODE === 'true') {
        console.log('⚠️  Email demo mode');
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
        return transporter;
    } catch (err) {
        console.error('❌ Email transporter failed:', err.message);
        return null;
    }
}

// Simple template engine
function renderTemplate(html, variables) {
    let rendered = html;
    for (const [key, value] of Object.entries(variables)) {
        rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }
    return rendered;
}

async function sendEmail(to, subject, templateName, variables) {
    const transport = getTransporter();
    const templatePath = path.join(__dirname, '..', '..', 'views', 'emails', `${templateName}.html`);
    
    let html = 'Template not found';
    if (fs.existsSync(templatePath)) {
        html = fs.readFileSync(templatePath, 'utf-8');
        html = renderTemplate(html, variables);
    }

    if (!transport) {
        console.log(`📧 [DEMO EMAIL] To: ${to} | Subject: ${subject}`);
        return { demo: true };
    }

    try {
        const info = await transport.sendMail({
            from: `"Owais Optics" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return info;
    } catch (err) {
        console.error(`❌ Email send failed to ${to}:`, err.message);
        throw err;
    }
}

async function sendWelcomeEmail(customer) {
    return sendEmail(customer.email, 'Welcome to Owais Optics! 👓', 'welcome', {
        name: customer.name,
        email: customer.email,
    });
}

async function sendOrderConfirmation(customer, order) {
    const rightRx = order.prescriptions.find(p => p.eye === 'right');
    const leftRx = order.prescriptions.find(p => p.eye === 'left');

    return sendEmail(customer.email, `Order Confirmed — #${order.id} | Owais Optics`, 'order-placed', {
        name: customer.name,
        orderId: String(order.id),
        frameShape: order.frame_shape,
        frameColor: order.frame_color,
        totalPrice: order.total_price,
        lensType: order.lens_type,
        rightSph: rightRx?.sph || 'N/A',
        rightCyl: rightRx?.cyl || 'N/A',
        leftSph: leftRx?.sph || 'N/A',
        leftCyl: leftRx?.cyl || 'N/A',
        date: new Date(order.created_at).toLocaleDateString(),
    });
}

module.exports = { sendWelcomeEmail, sendOrderConfirmation };
