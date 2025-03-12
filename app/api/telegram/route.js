import { NextResponse } from "next/server";
import { StringSession } from "telegram/sessions";
import { TelegramClient } from "telegram";

export async function POST(req) {
    try {
        const { command } = await req.json();

        const API_ID = Number(process.env.TELEGRAM_API_ID);
        const API_HASH = process.env.TELEGRAM_API_HASH;
        const STRING_SESSION = process.env.TELEGRAM_SESSION;
        const BOT_USERNAME = process.env.ESP32_BOT_USERNAME; // The ESP32 bot username

        console.log("Sending command:", command);

        const client = new TelegramClient(new StringSession(STRING_SESSION), API_ID, API_HASH, {
            connectionRetries: 5,
        });

        await client.start(); // Ensure the userbot is connected

        // Send command as a message to the ESP32 bot
        await client.sendMessage(BOT_USERNAME, { message: command });

        // Fetch recent messages from the chat
        const messages = await client.getMessages(BOT_USERNAME, { limit:2 });
        console.log("Received messages:", messages.map(msg => msg.message));

        // Find the most recent temperature and humidity message
        let temperature = "--";
        let humidity = "--";

        for (const msg of messages) {
            const tempMatch = msg.message.match(/Temperature:\s*([\d.]+)°C/);
            const humidityMatch = msg.message.match(/Humidity:\s*([\d.]+)%/);

            if (tempMatch && humidityMatch) {
                temperature = `${tempMatch[1]} °C`;
                humidity = `${humidityMatch[1]} %`;
                break;
            }
        }

        console.log("Extracted Temperature:", temperature);
        console.log("Extracted Humidity:", humidity);

        return NextResponse.json({ 
            success: true, 
            temperature, 
            humidity 
        });

    } catch (error) {
        console.error("Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}