/* --------------------------------- TG BOT --------------------------------- */
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.token;
const channelChatId = "-1001402505332"; //<{PVX}> Movies & Music

const startBot = () => {
  console.log("!!! STARTING BOT !!!");
  const bot = new TelegramBot(token, { polling: true });
  bot.sendMessage(channelChatId, "Bot starting!");

  // listener for /PVX query messages
  bot.onText(/\/PVX (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    console.log("QUERY TO SEARCH: ", text);
    let message = "💾 PVX GDRIVE 💾\n\n";

    /* ------------------------------ FOLDER SEARCH ----------------------------- */
    let queryData = {
      ...extraData,
      q: `mimeType = 'application/vnd.google-apps.folder' and name contains '${text}'`,
    };

    let response = await drive.files.list(queryData);
    const folderArray = response.data.files;
    console.log("TOTAL RESULT (FOLDER) : ", folderArray.length);
    message += `🔍 MATCHED FOLDERS: ${folderArray.length}\n\n`;

    folderArray.forEach((folder, index) => {
      message += `${index + 1}) Name: ${
        folder.name
      }\nLink: https://drive.google.com/folderview?id=${folder.id}\n\n`;
    });

    /* ------------------------------- MP4 SEARCH ------------------------------- */
    queryData = {
      ...extraData,
      q: `mimeType = 'video/mp4' and name contains '${text}'`,
    };
    response = await drive.files.list(queryData);
    const mp4Array = response.data.files;
    console.log("TOTAL RESULT (mp4) :", mp4Array.length);
    message += `\n🔍 MATCHED MP4 FILES: ${mp4Array.length}\n\n`;

    mp4Array.forEach((mp4, index) => {
      message += `${index + 1}) Name: ${
        mp4.name
      }\nLink: https://drive.google.com/folderview?id=${mp4.id}\n\n`;
    });

    /* ------------------------------- MKV SEARCH ------------------------------- */
    queryData = {
      ...extraData,
      q: `mimeType = 'video/x-matroska' and name contains '${text}'`,
    };
    response = await drive.files.list(queryData);
    const mkvArray = response.data.files;
    console.log("TOTAL RESULT (mp4) :", mkvArray.length);
    message += `\n🔍 MATCHED MKV FILES: ${mkvArray.length}\n\n`;

    mkvArray.forEach((mkv, index) => {
      message += `${index + 1}) Name: ${
        mkv.name
      }\nLink: https://drive.google.com/folderview?id=${mkv.id}\n\n`;
    });

    message = message.slice(0, 4096); // tg message limit is 4096
    bot.sendMessage(chatId, message);
    // send a message to the chat acknowledging receipt of their message
  });
};

const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const { google } = require("googleapis");
const credentials = require("./credentials.json"); //have credentials.json file with OAuth 2.0 Client ID info
const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

let drive;
let ourTeamDriveId = "0AIHchxZOKWruUk9PVA"; // ADI drive id, to get - check gdrive.js file code inside /readDrive
let extraData = {
  corpora: "drive",
  driveId: ourTeamDriveId,
  includeItemsFromAllDrives: true,
  supportsAllDrives: true,
};
// q: "mimeType = 'application/vnd.google-apps.folder' and name contains 'hello'", <- query for only folder type with name having hello in it

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
// this scope can access team drive

app.get("/", (req, res) => res.send(" API Running"));

app.get("/getAuthURL", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log(authUrl);
  return res.send(authUrl);
});

app.get("/getToken", (req, res) => {
  if (req.query.code == null) return res.status(400).send("Invalid Request");
  oAuth2Client.getToken(req.query.code, (err, token) => {
    if (err) {
      console.error("Error retrieving access token", err);
      return res.status(400).send("Error retrieving access token");
    }
    console.log(token);
    oAuth2Client.setCredentials(token); // set token
    drive = google.drive({ version: "v3", auth: oAuth2Client });
    startBot();
    res.send(token);
  });
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server Started ${PORT}`));
