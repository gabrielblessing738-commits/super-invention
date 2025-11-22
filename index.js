import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import express from "express";

const GROUP1_NAME = "Group 1";
const GROUP2_NAME = "Group 2";
const KEYWORD = "[Appointment]";

// Express web server to show QR
const app = express();
let qrCodeData = "";

app.get("/", (req, res) => {
    if (!qrCodeData) {
        return res.send("<h2>QR not generated yet. Please wait…</h2>");
    }

    res.send(`
        <html>
        <body style="font-family: Arial; text-align: center;">
            <h2>Scan WhatsApp QR Code</h2>
            <img src="${qrCodeData}" width="300">
        </body>
        </html>
    `);
});

app.listen(3000, () =>
    console.log("QR Server running at http://localhost:3000")
);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect.error =
                    new Boom(lastDisconnect.error)?.output?.statusCode) !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("WhatsApp bot connected!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        if (!msg.key.remoteJid.endsWith("@g.us")) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        if (groupMetadata.subject !== GROUP1_NAME) return;
        if (!text.includes(KEYWORD)) return;

        const formatted = formatAppointment(text);

        const allGroups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(allGroups);
        const group2 = groupList.find((g) => g.subject === GROUP2_NAME);

        if (!group2) {
            console.log("Group 2 not found!");
            return;
        }

        await sock.sendMessage(group2.id, { text: formatted });
    });
}

function formatAppointment(text) {
    text = text.replace("[Appointment]", "").trim();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    let out = "📌 *New Appointment Received*\n\n";

    for (const line of lines) {
        if (line.includes(":")) {
            const [k, v] = line.split(":");
            out += `• *${k.trim()}*: ${v.trim()}\n`;
        } else {
            out += `*${line}*\n`;
        }
    }

    return out;
}

startBot();

