const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const PORT = process.env.PORT || 3001;

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, { small: true });
    console.log('Please scan the QR code above to authenticate.');
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on('message', async msg => {

    // Ignore messages from the bot itself, status broadcasts, or group chats
    if (msg.from === 'status@broadcast' || msg.fromMe || msg.from.includes('@g.us')) return;
    console.log(`Received message from ${msg.from}: ${msg.body}`);

    let actualNumber = msg.from;
    try {
        const contact = await msg.getContact();
        if (contact && contact.number) {
            actualNumber = contact.number;
        }
    } catch (e) {
        console.error("Could not resolve contact number", e);
    }

    console.log(`Resolved actual number for backend: ${actualNumber}`);

    try {
        // Forward message to Python FastAPI backend
        const response = await axios.post(`${BACKEND_URL}/api/chat/whatsapp`, {
            from: actualNumber,
            body: msg.body,
            timestamp: msg.timestamp
        });

        // The Python backend should return the text response
        if (response.data && response.data.reply) {
            client.sendMessage(msg.from, response.data.reply);
        }
    } catch (error) {
        console.error('Error forwarding message to backend:', error.message);
    }
});

client.initialize();

// Express Endpoints for Proactive Messaging
app.post('/api/send', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Please provide both number and message' });
    }

    try {
        // WhatsApp IDs are usually formatted as [country_code][number]@c.us
        // Strip any non-numeric characters from the input
        const cleanNumber = number.replace(/\D/g, '');
        const chatId = `${cleanNumber}@c.us`;

        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp Microservice API running on port ${PORT}`);
});
