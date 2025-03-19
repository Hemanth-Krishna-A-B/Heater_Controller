import { NextResponse } from "next/server";
import { StringSession } from "telegram/sessions";
import { TelegramClient } from "telegram";

const API_ID = Number(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;
const STRING_SESSION = process.env.TELEGRAM_SESSION;
const BOT_USERNAME = process.env.ESP32_BOT_USERNAME;

// Function to fetch the latest sensor data from Telegram messages
async function fetchSensorData() {
    const client = new TelegramClient(new StringSession(STRING_SESSION), API_ID, API_HASH, {
        connectionRetries: 5,
    });

    try {
        await client.start();

        // Fetch the last 2 messages from the bot
        const messages = await client.getMessages(BOT_USERNAME, { limit: 2 });
        console.log("Received messages:", messages.map(msg => msg.message));

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

        return { success: true, temperature, humidity };
    } catch (error) {
        console.error("Error fetching sensor data:", error.message);
        return { success: false, error: error.message };
    } finally {
        await client.disconnect(); // ✅ Ensures disconnection after fetching data
    }
}

// Handle GET request to fetch sensor data
export async function GET() {
    console.log("Handling GET request for sensor data...");
    const data = await fetchSensorData();
    return NextResponse.json(data);
}

// Handle POST request to send commands
export async function POST(req) {
    const client = new TelegramClient(new StringSession(STRING_SESSION), API_ID, API_HASH, {
        connectionRetries: 5,
    });

    try {
        const { command } = await req.json();
        console.log("Sending command:", command);

        await client.start();
        await client.sendMessage(BOT_USERNAME, { message: command });

        return NextResponse.json({ success: true, message: `Command '${command}' sent successfully` });
    } catch (error) {
        console.error("Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        await client.disconnect(); // ✅ Ensures disconnection after sending message
    }
}
