const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const fs = require('fs')

const app = express()

app.use(cors())
app.use(express.json())

const token = "8711486536:AAFLD6rzXMoTrhihQ0yrcrfShvu0u6-zmvc"

const bot = new TelegramBot(token,{polling:true})

const ADMINS=[8361561237,7216419737]

function loadDB(){
return JSON.parse(fs.readFileSync("times.json"))
}

function saveDB(data){
fs.writeFileSync("times.json",JSON.stringify(data,null,2))
}

app.get("/api/times",(req,res)=>{
res.json(loadDB())
})

bot.onText(/\/start/,msg=>{

const times=loadDB()

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

bot.onText(/\/update (.+)/,(msg,match)=>{

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

const db=loadDB()

db[map[key]]=value

saveDB(db)

bot.sendMessage(chatId,"✅ Updated successfully")
})

bot.onText(/\/list/,msg=>{

const t=loadDB()

let text="📋 Current Times\n\n"

for(let k in t){
text+=`${k} : ${t[k]}\n`
}

bot.sendMessage(msg.chat.id,text)
})

bot.on("polling_error",err=>{
console.log(err.message)
})

app.listen(3000,()=>console.log("Server running"))