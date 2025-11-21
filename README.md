WhatsApp Appointment Forwarder

This bot automatically forwards WhatsApp messages containing [Appointment]
from Group 1 → Group 2 using the Baileys WhatsApp API.

It works on Fly.io, stays logged in permanently using a persistent volume,
and shows the QR code on a browser page.

🚀 Deploy on Fly.io
1. Create a Fly.io Volume (persistent session)

This stores your WhatsApp login so the bot stays connected.

fly volumes create whatsapp_data --region sin --size 1

2. Deploy your app
fly deploy

3. View QR Code in logs (optional)

You can see the QR in the terminal:

fly logs

4. Open QR page in browser

Your app also hosts a QR page at:

https://YOUR-APP-NAME.fly.dev


Example:

https://super-invention.fly.dev


Scan the QR with WhatsApp and the bot will connect.
