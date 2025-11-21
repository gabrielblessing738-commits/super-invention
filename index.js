import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import express from "express";

const GROUP1_NAME = "Group 1"; // Agents group
const GROUP2_NAME = "Group 2"; // Management group
const KEYWORD = "[Appointment]";

// Express server to show QR on the browser
const app = express();
let qrCodeData = "";

app.get("/", (req, res) => {
    if (!qrCodeData) {
        return res.send("<h2>QR not generated yet. Please wait…</h2>");
    }
    res.send(`
        <html>
        <body style="font-family: Arial; text-align: center; margin-top: 40px;">
            <h2>Scan WhatsApp QR Code</h2>
            <img src="${qrCodeData}" style="width: 300px; border: 2px solid #ddd; padding: 10px;">
            <p>Keep your phone online to stay connected.</p>
        </body>
        </html>
    `);
});

app.listen(3000, () => console.log("QR Server running on port 3000"));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    // Show QR on the web page
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Convert to base64 PNG for browser display
            qrCodeData =
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect.error =
                    new Boom(lastDisconnect.error)?.output?.statusCode) !==
                DisconnectReason.loggedOut;

            console.log("Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("WhatsApp bot is connected!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // When a new message is received
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.remoteJid.endsWith("@g.us")) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);

        if (groupMetadata.subject !== GROUP1_NAME) return;
        if (!text.includes(KEYWORD)) return;

        console.log("Appointment detected!");

        const formatted = formatAppointment(text);

        // Find Group 2 by name
        const allGroups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(allGroups);

        const group2 = groupList.find((g) => g.subject === GROUP2_NAME);

        if (!group2) {
            console.log("❌ Group 2 not found");
            return;
        }

        await sock.sendMessage(group2.id, { text: formatted });

        console.log("Forwarded appointment to Group 2");
    });
}

// Format the appointment message
function formatAppointment(text) {
    text = text.replace("[Appointment]", "").trim();

    let lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l);

    let output = "📌 *New Appointment Received*\n\n";

    lines.forEach((line) => {
        if (line.includes(":")) {
            const [key, value] = line.split(":");
            output += `• *${key.trim()}*: ${value.trim()}\n`;
        } else {
            output += `*${line}*\n`;
        }
    });

    return output;
}

startBot();
