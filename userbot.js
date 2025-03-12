require("dotenv").config({ path: ".env.local" }); // Explicitly load .env.local

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const sessionString = process.env.TELEGRAM_SESSION;
const botUsername = process.env.ESP32_BOT_USERNAME;

if (!apiId || !apiHash || !sessionString) {
  console.error("❌ Missing Telegram API credentials in .env.local file.");
  console.error("Check if TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_SESSION are set.");
  process.exit(1);
}

console.log("✅ Environment variables loaded successfully!");

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.start();
  console.log("🚀 Userbot started!");

  async function sendCommandToESP(command) {
    await client.sendMessage(botUsername, { message: command });
    console.log(`📡 Sent command: ${command}`);
  }

  sendCommandToESP("/on"); // Example command
})();
