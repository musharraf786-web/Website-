const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(express.json())

const token = "8711486536:AAFLD6rzXMoTrhihQ0yrcrfShvu0u6-zmvc"

const bot = new TelegramBot(token,{polling:true})

const ADMINS=[8361561237,7216419737]

/* ------------------- MongoDB ------------------- */

mongoose.connect("MONGO_URI=mongodb+srv://musharraf:Musharraf7860@cluster0.5pjp3kv.mongodb.net/masjid?retryWrites=true&w=majority&appName=Cluster0")

const Times = mongoose.model("Times", new mongoose.Schema({
fajr:String,
zuhr:String,
asr:String,
maghrib:String,
isha:String,
jumma:String,
eidFitr:String,
eidAdha:String,
hijri:String
}))

async function loadDB(){

let data = await Times.findOne()

if(!data){

data = await Times.create({
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

async function saveDB(data){
await Times.updateOne({},data,{upsert:true})
}

/* ------------------- API ------------------- */

app.get("/api/times",async(req,res)=>{
const data = await loadDB()
res.json(data)
})

/* ------------------- BOT ------------------- */

bot.onText(/\/start/,async msg=>{

const times=await loadDB()

const text=`
🕌 Sunni Jama Masjid Abu Hanifa

Today's Prayer Times

Fajr: ${times.fajr}
Zuhr: ${times.zuhr}
Asr: ${times.asr}
Maghrib: ${times.maghrib}
Isha: ${times.isha}

📅 Jumma: ${times.jumma}

Admin command
/update fajr 5:00 AM
`

bot.sendMessage(msg.chat.id,text)

})

bot.onText(/\/update (.+)/,async (msg,match)=>{

const chatId=msg.chat.id
const userId=msg.from.id

if(!ADMINS.includes(userId)){
return bot.sendMessage(chatId,"❌ Admin only command")
}

const input=match[1].trim()

const first=input.indexOf(" ")

if(first===-1){
return bot.sendMessage(chatId,"❌ Format\n/update fajr 5:00 AM")
}

let key=input.substring(0,first).toLowerCase()
let value=input.substring(first+1)

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

const db=await loadDB()

db[map[key]]=value

await saveDB(db)

bot.sendMessage(chatId,"✅ Updated successfully")

})

bot.onText(/\/list/,async msg=>{

const t=await loadDB()

let text="📋 Current Times\n\n"

for(let k in t._doc){
text+=`${k} : ${t[k]}\n`
}

bot.sendMessage(msg.chat.id,text)

})

bot.on("polling_error",err=>{
console.log(err.message)
})

app.listen(3000,()=>console.log("Server running"))