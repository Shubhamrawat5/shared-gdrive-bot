/* --------------------------------- TG BOT --------------------------------- */
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.token;
const myChatId = "649341653"; //My chat ID
console.log("!!! STARTING BOT !!!");
const bot = new TelegramBot(token, { polling: true });
bot.sendMessage(
  myChatId,
  "Bot starting!\nVisit /getAuthURL to authorize your gdrive!"
);

const startBotListener = () => {
  console.log("!!! STARTING startBotListener function !!!");
  bot.sendMessage(myChatId, "Starting startBotListener function");

  // bot.onText(/\/test (.+)/, async (msg, match) => {
  //   const chatId = msg.chat.id;
  //   const text = match[1];

  //   bot.sendMessage(chatId, JSON.stringify(oAuth2Client.credentials));
  // });

  function generateMessage(searchType, count, arr) {
    if (arr.length === 0) return "";
    let msg = "\n------------------------------\n";
    msg += `🔍 ${searchType} : ${arr.length}\n\n`;

    arr.slice(0, count).forEach((url, index) => {
      msg += `${index + 1}) Name: ${
        url.name
      }\nLink: https://drive.google.com/folderview?id=${url.id}\n\n`;
    });

    return msg;
  }

  // listener
  bot.sendMessage(myChatId, "REMOVING BOT OLD LISTNERS");
  console.log("REMOVING BOT OLD LISTNERS");
  bot.removeTextListener(/\/PVX (.+)/); // helps to remove given regex previous eventListneners

  bot.sendMessage(myChatId, "ADD BOT LISTNER TO /PVX");
  console.log("ADD BOT LISTNER TO /PVX");
  let chatId;
  bot.onText(/\/PVX (.+)/, async (msg, match) => {
    try {
      chatId = msg.chat.id;
      const text = match[1];
      bot.sendMessage(myChatId, "Query request from TG: " + text);
      bot.sendMessage(
        myChatId,
        "oAuth2Client Credentials: \n" +
          JSON.stringify(oAuth2Client.credentials)
      );

      console.log("QUERY TO SEARCH: ", text);
      let message = "💾 PVX GDRIVE 💾\n\n";
      message += `🔍 Query: ${text} 🔍\n`;

      /* ------------------------------ FOLDER SEARCH ----------------------------- */
      let queryData = {
        ...extraData,
        q: `mimeType = 'application/vnd.google-apps.folder' and name contains '${text}'`,
      };

      let response = await drive.files.list(queryData);
      message += generateMessage("FOLDERS (TOP 10)", 10, response.data.files);

      /* ------------------------------- MP4 SEARCH ------------------------------- */
      queryData = {
        ...extraData,
        q: `mimeType = 'video/mp4' and name contains '${text}'`,
      };
      response = await drive.files.list(queryData);
      message += generateMessage("MP4 (TOP 2)", 2, response.data.files);

      /* ------------------------------- MKV SEARCH ------------------------------- */
      queryData = {
        ...extraData,
        q: `mimeType = 'video/x-matroska' and name contains '${text}'`,
      };
      response = await drive.files.list(queryData);
      message += generateMessage("MKV (TOP 2)", 2, response.data.files);

      /* ------------------------------- TAR SEARCH ------------------------------- */
      queryData = {
        ...extraData,
        q: `mimeType = 'application/x-tar' and name contains '${text}'`,
      };
      response = await drive.files.list(queryData);
      message += generateMessage("TAR (TOP 10)", 10, response.data.files);

      /* ------------------------------- ZIP SEARCH ------------------------------- */
      queryData = {
        ...extraData,
        q: `mimeType = 'application/zip' and name contains '${text}'`,
      };
      response = await drive.files.list(queryData);
      message += generateMessage("ZIP (TOP 10)", 10, response.data.files);

      /* ------------------------------- PDF SEARCH ------------------------------- */
      queryData = {
        ...extraData,
        q: `mimeType = 'application/pdf' and name contains '${text}'`,
      };
      response = await drive.files.list(queryData);
      message += generateMessage("PDF (TOP 10)", 10, response.data.files);

      /* -------------------------------- message ------------------------------- */

      // no data found!
      if (!/-/g.test(message)) message += `\nno data found!`;

      message = message.slice(0, 4096); // tg message limit is 4096
      bot.sendMessage(chatId, message);
      // send a message to the chat acknowledging receipt of their message
    } catch (err) {
      console.log("<startBotListener> ERROR: ", err.toString());
      bot.sendMessage(myChatId, err.toString());
      bot.sendMessage(ChatId, err.toString());
    }
  });
};

/* --------------------------- SERVER & GOOGLE API --------------------------- */
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const { google } = require("googleapis");
const credentials = require("./credentials.json"); //create api credentials file
const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

let drive; //will hold our shared gdrive object
let ourTeamDriveId = "0AIHchxZOKWruUk9PVA"; // ADI drive id
let extraData = {
  corpora: "drive",
  driveId: ourTeamDriveId,
  includeItemsFromAllDrives: true,
  supportsAllDrives: true,
};
// q: "mimeType = 'application/vnd.google-apps.folder' and name contains 'hello'",

let refreshToken = ""; // refersh token use to get new access token
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
// this scope can access team drive

app.get("/", (req, res) => res.send(" API Running"));

app.get("/getAuthURL", (req, res) => {
  bot.sendMessage(myChatId, "REQ to /getAuthURL");

  bot.sendMessage(myChatId, "REMOVING oAuth2Client OLD LISTNERS");
  console.log("REMOVING oAuth2Client OLD LISTNERS");
  oAuth2Client.removeAllListeners(); // helps to remove all previous eventListneners

  // tokens evernt - handle refresh token - RT is used to get new access token as AT expires in 1 hour.. [listener]
  oAuth2Client.on("tokens", (tokens) => {
    console.log(
      "(tokens) This tokens event only occurs in the first authorization!"
    );
    if (tokens.refresh_token) {
      console.log("(tokens) SAVING REFRESH TOKEN: ", tokens.refresh_token);
      refreshToken = tokens.refresh_token;
      bot.sendMessage(myChatId, "(tokens) REFRESH_TOKEN: \n" + refreshToken);

      // After every 55 min, remove all the token details from oAuth2Client.credentials and set only refresh_token which will make to generate a new access_token
      setInterval(() => {
        console.log(
          "(tokens) SET INTERVAL TO PUT REFRESH_TOKEN TO GET NEW ACCESS TOKEN !!"
        );
        bot.sendMessage(
          myChatId,
          "(tokens) CALL SET INTERVAL TO PUT REFRESH TOKEN! "
        );
        // we are removing access_token and other details from credentials and only putting the refresh_token
        // so if access_token won't be there then google will check refresh_token value and will provide a access_token automatically
        oAuth2Client.setCredentials({
          refresh_token: refreshToken,
        });

        bot.sendMessage(
          myChatId,
          "oAuth2Client Credentials: \n" +
            JSON.stringify(oAuth2Client.credentials)
        );
      }, 1000 * 60 * 55); //55 min
    }
    console.log("(tokens) ACCESS_TOKEN: ", tokens.access_token);
    bot.sendMessage(
      myChatId,
      "(tokens) ACCESS_TOKEN: \n" + tokens.access_token
    );
  });

  // prompt variable to get refresh token also everytime
  const authUrl = oAuth2Client.generateAuthUrl({
    prompt: "consent",
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("AUTH URL: ", authUrl);
  res.redirect(authUrl);
  // return res.send(authUrl);
});

const getAndSetToken = async (code) => {
  // getToken give {access_token, refresh_token, scope, expiry_date}
  const { tokens } = await oAuth2Client.getToken(code);
  console.log(tokens);
  bot.sendMessage(myChatId, "Tokens: \n" + JSON.stringify(tokens));
  oAuth2Client.setCredentials(tokens); // set token
  return tokens;
};

app.get("/getToken", async (req, res) => {
  if (!req.query.code && req.query.code.length < 10) {
    bot.sendMessage(myChatId, "TOKEN REJECTED!");
    return res.status(400).send("Invalid Request");
  }

  let token = await getAndSetToken(req.query.code);
  drive = google.drive({ version: "v3", auth: oAuth2Client });

  bot.sendMessage(myChatId, "TOKEN ACCEPTED!");
  startBotListener();
  // res.send(token);
  res.send("TOKEN ACCEPTED");
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server Started ${PORT}`));
//
