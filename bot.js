const TelegramBot = require("node-telegram-bot-api")
const express = require("express")
const cors = require("cors")
const { MongoClient } = require("mongodb")

const app = express()
app.use(cors())
app.use(express.json())

const token = "8711486536:AAFLD6rzXMoTrhihQ0yrcrfShvu0u6-zmvc"

const bot = new TelegramBot(token,{polling:true})

const ADMINS=[8361561237,7216419737]

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URL)

let db

async function connectDB(){
await client.connect()
db = client.db("masjid")
console.log("MongoDB connected")
}

connectDB()

async function getTimes(){
const data = await db.collection("times").findOne({name:"masjid"})
return data
}

async function saveTimes(data){
await db.collection("times").updateOne(
{ name:"masjid" },
{ $set:data },
{ upsert:true }
)
}

// API for website
app.get("/api/times", async (req,res)=>{
const data = await getTimes()
res.json(data)
})

// Telegram start
bot.onText(/\/start/, async msg=>{

const times = await getTimes()

const text=`
🕌 Sunni Jama Masjid Abu Hanifa

Fajr: ${times.fajr}
Zuhr: ${times.zuhr}
Asr: ${times.asr}
Maghrib: ${times.maghrib}
Isha: ${times.isha}

Jumma: ${times.jumma}
`

bot.sendMessage(msg.chat.id,text)

})

// Update command
bot.onText(/\/update (.+)/, async (msg,match)=>{

const chatId=msg.chat.id
const userId=msg.from.id

if(!ADMINS.includes(userId)){
return bot.sendMessage(chatId,"Admin only command")
}

const input=match[1].trim()

const first=input.indexOf(" ")

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

const dbData = await getTimes()

dbData[map[key]] = value

await saveTimes(dbData)

bot.sendMessage(chatId,"Updated successfully")

})

// list
bot.onText(/\/list/, async msg=>{

const t = await getTimes()

let text="Current Times\n\n"

for(let k in t){
text+=`${k} : ${t[k]}\n`
}

bot.sendMessage(msg.chat.id,text)

})

app.listen(process.env.PORT || 3000)