const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const token = '8673118424:AAHtYpieMHFObdXTV7ydazcK62pyxHbao20';
const bot = new TelegramBot(token, { polling: true });

// Admin IDs - yahan apna ID daalo
const ADMINS = [7216419737]; 

// Database (simple object, aap MongoDB bhi use kar sakte ho)
let timesDB = {
  fajr: "5:32 AM",
  zuhr: "12:45 PM",
  asr: "4:18 PM",
  maghrib: "6:52 PM",
  isha: "8:10 PM",
  jumma: "1:30 PM · 21 March 2025 · Friday",
  eidFitr: "10 April 2025 · Thursday · 9:00 AM",
  eidAdha: "17 June 2025 · Tuesday · 9:30 AM"
};

// Website ke liye API
app.get('/api/times', (req, res) => {
  res.json(timesDB);
});

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `🕌 *Sunni Jama Masjid Abu Hanifa*\n\n` +
    `*Today's Prayer Times:*\n` +
    `Fajr (فجر): ${timesDB.fajr}\n` +
    `Zuhr (ظہر): ${timesDB.zuhr}\n` +
    `Asr (عصر): ${timesDB.asr}\n` +
    `Maghrib (مغرب): ${timesDB.maghrib}\n` +
    `Isha (عشاء): ${timesDB.isha}\n\n` +
    `📅 *Jumma:* ${timesDB.jumma}\n\n` +
    `_Admins: /update prayer time_`;
  
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// Command: /update
bot.onText(/\/update (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!ADMINS.includes(userId)) {
    return bot.sendMessage(chatId, "❌ Aap admin nahi hain");
  }

  const input = match[1].trim();
  const parts = input.split(' ');
  const prayer = parts[0].toLowerCase();
  const time = parts.slice(1).join(' ');

  const validPrayers = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'jumma', 'eidfitr', 'eidadha'];
  
  if (validPrayers.includes(prayer)) {
    timesDB[prayer] = time;
    await bot.sendMessage(chatId, `✅ ${prayer} update kar diya: ${time}`);
    
    // Sab users ko broadcast (optional)
    // broadcastToAll(`${prayer} ka time update: ${time}`);
  } else {
    bot.sendMessage(chatId, "❌ Sahi prayer likho: fajr, zuhr, asr, maghrib, isha, jumma, eidfitr, eidadha");
  }
});

// Command: /list
bot.onText(/\/list/, (msg) => {
  let list = "📋 *Current Times:*\n\n";
  for(let [key, value] of Object.entries(timesDB)) {
    list += `${key}: ${value}\n`;
  }
  bot.sendMessage(msg.chat.id, list, { parse_mode: 'Markdown' });
});

app.listen(3000, () => console.log('Bot + API running'));