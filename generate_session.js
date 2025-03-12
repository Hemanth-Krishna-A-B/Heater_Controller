const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // Install this package if missing

require("dotenv").config({ path: ".env.local" });

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  console.log("🔹 Generating a new Telegram session. Please log in.");
  await client.start({
    phoneNumber: async () => await input.text("Enter your phone number: "),
    password: async () => await input.text("Enter your password (if 2FA enabled): "),
    phoneCode: async () => await input.text("Enter the code sent to Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("✅ Session generated successfully!");
  console.log("Copy this session string and add it to .env.local:");
  console.log(client.session.save());
})();
