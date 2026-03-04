const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const token = '8673118424:AAHtYpieMHFObdXTV7ydazcK62pyxHbao20';
const bot = new TelegramBot(token, { polling: true });

// 🔐 Admin ID
const ADMINS = [8361561237,7216419737];

// 📿 Database
let timesDB = {
  fajr: "5:32 AM",
  zuhr: "12:45 PM",
  asr: "4:18 PM",
  maghrib: "6:52 PM",
  isha: "8:10 PM",
  jumma: "1:30 PM · Friday",
  eidFitr: "10 April 2026 · 9:00 AM",
  eidAdha: "17 June 2026 · 9:30 AM"
};

// 🌐 API for website
app.get('/api/times', (req, res) => {
  res.json(timesDB);
});

// ▶ Start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const text = `
🕌 *Sunni Jama Masjid Abu Hanifa*

*Today's Prayer Times:*

Fajr: ${timesDB.fajr}
Zuhr: ${timesDB.zuhr}
Asr: ${timesDB.asr}
Maghrib: ${timesDB.maghrib}
Isha: ${timesDB.isha}

📅 *Jumma:* ${timesDB.jumma}
🌙 *Eid ul Fitr:* ${timesDB.eidFitr}
🐐 *Eid ul Adha:* ${timesDB.eidAdha}

_Admin Command:_
/update fajr 5:00 AM
`;

  bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
});

// 🔥 FULLY FIXED UPDATE COMMAND
bot.onText(/\/update (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!ADMINS.includes(userId)) {
    return bot.sendMessage(chatId, "❌ Aap admin nahi hain");
  }

  const input = match[1].trim();
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    return bot.sendMessage(chatId,
      "❌ Format galat hai.\n\nExample:\n/update jumma 1:45 PM"
    );
  }

  let key = input.substring(0, firstSpace).toLowerCase();
  const value = input.substring(firstSpace + 1);

  // 🔁 Normalize keys
  const keyMap = {
    fajr: "fajr",
    zuhr: "zuhr",
    asr: "asr",
    maghrib: "maghrib",
    isha: "isha",
    jumma: "jumma",
    eidfitr: "eidFitr",
    eidadha: "eidAdha"
  };

  if (!keyMap[key]) {
    return bot.sendMessage(chatId,
      "❌ Sahi keyword likho:\n\n" +
      "fajr\nzuhr\nasr\nmaghrib\nisha\njumma\neidFitr\neidAdha"
    );
  }

  const correctKey = keyMap[key];
  timesDB[correctKey] = value;

  await bot.sendMessage(chatId,
    `✅ ${correctKey} successfully update ho gaya:\n\n${value}`
  );
});

// 📋 List Command
bot.onText(/\/list/, (msg) => {
  let list = "📋 *Current Times:*\n\n";

  for (let [key, value] of Object.entries(timesDB)) {
    list += `${key} : ${value}\n`;
  }

  bot.sendMessage(msg.chat.id, list, { parse_mode: "Markdown" });
});

// 🚀 Server Start
app.listen(3000, () => console.log("✅ Bot + API running on port 3000"));
