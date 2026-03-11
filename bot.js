const TelegramBot = require("node-telegram-bot-api")
const express = require("express")
const cors = require("cors")
const { MongoClient } = require("mongodb")

const app = express()
app.use(cors())
app.use(express.json())

const token = process.env.BOT_TOKEN
const MONGO_URL = process.env.MONGO_URL

const bot = new TelegramBot(token,{polling:true})

const ADMINS=[8361561237,7216419737]

async function startServer(){

const client = new MongoClient(MONGO_URL)
await client.connect()

const db = client.db("masjid")

console.log("MongoDB Connected")

// function to get data
async function getTimes(){
return await db.collection("times").findOne({name:"masjid"})
}

// function to save
async function saveTimes(data){
await db.collection("times").updateOne(
{ name:"masjid"},
{ $set:data },
{ upsert:true }
)
}

// API
app.get("/api/times", async(req,res)=>{
const data = await getTimes()
res.json(data)
})

// Telegram start
bot.onText(/\/start/, async msg=>{

const t = await getTimes()

bot.sendMessage(msg.chat.id,`
🕌 Masjid Times

Fajr: ${t.fajr}
Zuhr: ${t.zuhr}
Asr: ${t.asr}
Maghrib: ${t.maghrib}
Isha: ${t.isha}
`)
})

// update
bot.onText(/\/update (.+)/, async (msg,match)=>{

const chatId=msg.chat.id
const userId=msg.from.id

if(!ADMINS.includes(userId)){
return bot.sendMessage(chatId,"Admin only")
}

const input=match[1]

const first=input.indexOf(" ")

const key=input.substring(0,first).toLowerCase()
const value=input.substring(first+1)

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

const data = await getTimes() || {name:"masjid"}

data[map[key]] = value

await saveTimes(data)

bot.sendMessage(chatId,"✅ Updated")

})

// list
bot.onText(/\/list/, async msg=>{

const t = await getTimes()

let text="📋 Current Times\n\n"

for(let k in t){
text+=`${k} : ${t[k]}\n`
}

bot.sendMessage(msg.chat.id,text)

})

app.listen(process.env.PORT || 3000,()=>{
console.log("Server Running")
})

}

startServer()
