import { NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import "dotenv/config";

const API_ID = process.env.TG_API_ID;
const API_HASH = process.env.TG_API_HASH;
const SESSION_STRING = process.env.TG_SESSION;
const CHAT_ID = process.env.TG_CHAT_ID;

export async function GET() {
  try {
    const client = new TelegramClient(new StringSession(SESSION_STRING), API_ID, API_HASH, { connectionRetries: 5 });
    await client.start();

    const messages = await client.getMessages(CHAT_ID, { limit: 10 });
    
    let tempMessage = "No temperature data received yet.";
    for (const msg of messages) {
      if (msg.message.includes("🌡 Temperature")) {
        tempMessage = msg.message;
        break;
      }
    }

    return NextResponse.json({ success: true, tempData: tempMessage });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
