const TelegramBot = require("node-telegram-bot-api");

require("dotenv").config();
const token = process.env.token;
const chatId = "-1001402505332";

const bot = new TelegramBot(token, { polling: true });
bot.sendMessage(chatId, "Bot starting!");

let message = "";
for (let i = 0; i < 4500; ++i) {
  message += "z";
}

message = message.slice(0, 4096); //limit 4096 characters

bot.sendMessage(chatId, message);

// bot.on("message", (msg) => {
//   console.log(msg);
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, "Received your message");
// });

bot.onText(/\/PVX (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});
