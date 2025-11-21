const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");

// ========= CONFIG ========= //
const KEYWORD = "[Appointment]";

// Replace these after buyer gives real group IDs
const GROUP_1_ID = "GROUP1ID@g.us"; 
const GROUP_2_ID = "GROUP2ID@g.us"; 

// ======== FORMATTER FUNCTION ======== //
function formatProfessional(message) {
    return `
📌 *New Appointment Received*

${message}

🗂️ Forwarded automatically to management.
`.trim();
}

// ===================================== //

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state,
        logger: pino({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    console.log("✅ Bot is running… Waiting for messages.");

    sock.ev.on("messages.upsert", async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;

            if (!messageContent) return;

            // Only monitor Group 1
            if (from !== GROUP_1_ID) return;

            // Keyword detection
            if (messageContent.includes(KEYWORD)) {
                console.log("📌 Appointment message detected!");

                const formatted = formatProfessional(messageContent);

                await sock.sendMessage(GROUP_2_ID, { text: formatted });

                console.log("📤 Forwarded to Group 2");
            }

        } catch (err) {
            console.error("❌ Error processing message:", err);
        }
    });
}

startBot();

