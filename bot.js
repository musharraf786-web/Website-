const TelegramBot = require("node-telegram-bot-api")
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()

app.use(cors())
app.use(express.json())

// Telegram Bot Token
const token = "8711486536:AAFLD6rzXMoTrhihQ0yrcrfShvu0u6-zmvc"

const bot = new TelegramBot(token,{polling:true})

// MongoDB Connection
mongoose.connect("mongodb+srv://mushrraf:Mhod786@@cluster0.cqkczl3.mongodb.net/?appName=Cluster0")

.then(()=>console.log("MongoDB Connected"))

.catch(err=>console.log(err))

// Schema
const PrayerSchema = new mongoose.Schema({

fajr:String,
zuhr:String,
asr:String,
maghrib:String,
isha:String,
jumma:String,
eidFitr:String,
eidAdha:String,
hijri:String

})

const Prayer = mongoose.model("Prayer",PrayerSchema)

// Admin IDs
const ADMINS=[8361561237,7216419737]

// Get or create data
async function getTimes(){

let data = await Prayer.findOne()

if(!data){

data = await Prayer.create({

fajr:"5:32 AM",
zuhr:"12:45 PM",
asr:"4:18 PM",
maghrib:"6:52 PM",
isha:"8:10 PM",
jumma:"1:30 PM · Friday",
eidFitr:"10 April 2026 · 9:00 AM",
eidAdha:"17 June 2026 · 9:30 AM",
hijri:"١ رمضان ١٤٤٧ هـ"

})

}

return data

}

// API for Website
app.get("/api/times",async(req,res)=>{

const data = await getTimes()

res.json(data)

})

// Start command
bot.onText(/\/start/,async(msg)=>{

const t = await getTimes()

const text = `
🕌 Sunni Jama Masjid Abu Hanifa

Fajr: ${t.fajr}
Zuhr: ${t.zuhr}
Asr: ${t.asr}
Maghrib: ${t.maghrib}
Isha: ${t.isha}

📅 Jumma: ${t.jumma}

Admin command:
/update fajr 5:00 AM
`

bot.sendMessage(msg.chat.id,text)

})

// Update command
bot.onText(/\/update (.+)/,async(msg,match)=>{

const chatId = msg.chat.id
const userId = msg.from.id

if(!ADMINS.includes(userId)){

return bot.sendMessage(chatId,"❌ Admin only")

}

const input = match[1]

const first = input.indexOf(" ")

const key = input.substring(0,first).toLowerCase()

const value = input.substring(first+1)

const map={

fajr:"fajr",
zuhr:"zuhr",
asr:"asr",
maghrib:"maghrib",
isha:"isha",
jumma:"jumma",
eidfitr:"eidFitr",
eidadha:"eidAdha",
hijri:"hijri"

}

if(!map[key]){

return bot.sendMessage(chatId,"❌ Invalid key")

}

let data = await getTimes()

data[map[key]] = value

await data.save()

bot.sendMessage(chatId,"✅ Updated Successfully")

})

// List command
bot.onText(/\/list/,async(msg)=>{

const t = await getTimes()

let text = "📋 Current Times\n\n"

for(let k in t._doc){

if(k !== "_id" && k !== "__v"){

text += `${k} : ${t[k]}\n`

}

}

bot.sendMessage(msg.chat.id,text)

})

// Polling error handler
bot.on("polling_error",err=>{

console.log(err.message)

})

app.listen(3000,()=>console.log("Server running"))