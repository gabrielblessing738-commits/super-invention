WhatsApp Appointment Forwarder

Automatically forwards WhatsApp messages containing [Appointment]
from Group 1 → Group 2 using the Baileys WhatsApp API.

This bot runs on Fly.io, stays logged in using a persistent volume, and displays the WhatsApp QR code in a browser page.

🚀 Deploy on Fly.io
1️⃣ Create a Fly.io Volume (stores WhatsApp login)

This keeps your bot logged in even after restart.

fly volumes create whatsapp_data --region sin --size 1

2️⃣ Deploy your app
fly deploy

3️⃣ View QR Code in logs (optional)

You can also view the QR code printed in Fly logs:

fly logs

🌐 4️⃣ Scan the QR Code (web page)

Your app also hosts the QR code at:

https://YOUR-APP-NAME.fly.dev


Example:

https://super-invention.fly.dev


Open the link → scan the QR with WhatsApp → bot connects automatically.

✔️ What the bot does

Listens to messages in Group 1

Detects messages containing [Appointment]

Formats the appointment data

Forwards it to Group 2

Fully automated.
