const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ------------------------------
// CONFIGURATION
// ------------------------------
const GROUP1_NAME = "Group 1";   // Agents group
const GROUP2_NAME = "Group 2";   // Management group
const KEYWORD = "[Appointment]"; // Trigger keyword
// ------------------------------

console.log("Bot starting…");

const client = new Client({
    authStrategy: new LocalAuth(), // saves login session
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Show QR on first login
client.on('qr', qr => {
    console.log("Scan the QR Code to login:");
    qrcode.generate(qr, { small: true });
});

// Logged in successfully
client.on('ready', async () => {
    console.log("WhatsApp bot is ready!");

    const chats = await client.getChats();

    global.group1 = chats.find(c => c.isGroup && c.name === GROUP1_NAME);
    global.group2 = chats.find(c => c.isGroup && c.name === GROUP2_NAME);

    if (!group1) console.log(`❌ Group "${GROUP1_NAME}" not found`);
    if (!group2) console.log(`❌ Group "${GROUP2_NAME}" not found`);

    if (group1 && group2) {
        console.log("Both groups found. Monitoring started…");
    }
});

// ------------------------------
// MESSAGE LISTENER
// ------------------------------
client.on('message', async msg => {
    try {
        // Ignore if groups not detected yet
        if (!group1 || !group2) return;

        const chat = await msg.getChat();

        // Only monitor Group 1
        if (!chat.isGroup || chat.id._serialized !== group1.id._serialized) return;

        // Only trigger on "[Appointment]"
        if (!msg.body.includes(KEYWORD)) return;

        console.log("Appointment detected — processing…");

        // Clean & reformat
        const formatted = formatAppointment(msg.body);

        // Forward to Group 2
        await client.sendMessage(group2.id._serialized, formatted);

        console.log("Appointment forwarded!");

    } catch (err) {
        console.error("Error processing appointment:", err);
    }
});

// ------------------------------
// FORMAT THE APPOINTMENT
// ------------------------------
function formatAppointment(text) {

    // Remove "[Appointment]"
    text = text.replace("[Appointment]", "").trim();

    // Split into lines
    let lines = text.split("\n").map(l => l.trim()).filter(l => l);

    let output = "📌 *New Appointment Received*\n\n";

    lines.forEach(line => {
        // Turn things like "Date: 12 Dec" into "**Date:** 12 Dec"
        if (line.includes(":")) {
            const [key, value] = line.split(":");
            output += `• *${key.trim()}*: ${value.trim()}\n`;
        } else {
            // Titles like “Breeze Hill Appointment”
            output += `*${line}*\n`;
        }
    });

    return output;
}

// Start
client.initialize();
