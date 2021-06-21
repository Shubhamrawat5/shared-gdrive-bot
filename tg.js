const TelegramBot = require("node-telegram-bot-api");

require("dotenv").config();
const token = process.env.token;
const chatId = "649341653"; // my tg id

const bot = new TelegramBot(token, { polling: true });
bot.sendMessage(chatId, "Bot starting!");

function checkLimit() {
  let message = "";
  for (let i = 0; i < 4500; ++i) {
    message += "z";
  }
  message = message.slice(0, 4096); //limit 4096 characters
  bot.sendMessage(chatId, message);
}

function checkForAnyMsg() {
  console.log("CHECK FOR ANY MSG");

  bot.removeAllListeners(); // helps to remove all previous eventListneners
  bot.on("message", (msg) => {
    console.log(msg);
    const chatId = msg.chat.id;
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, msg.text);
  });
}

// checkForAnyMsg();
// checkForAnyMsg();
// checkForAnyMsg();

function checkForSpecificMsg() {
  console.log("CHECK FOR SPECIFIC MSG");
  bot.removeTextListener(/\/z (.+)/);
  bot.onText(/\/z (.+)/, (msg, match) => {
    console.log("MATCH");
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
  });
}

checkForSpecificMsg();
checkForSpecificMsg();
checkForSpecificMsg();
