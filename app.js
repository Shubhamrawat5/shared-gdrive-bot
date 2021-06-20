/* --------------------------------- TG BOT --------------------------------- */
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.token;
const myChatId = "649341653"; //My chat ID

const startBot = () => {
  console.log("!!! STARTING BOT !!!");
  const bot = new TelegramBot(token, { polling: true });
  bot.sendMessage(myChatId, "Bot starting!");

  // bot.onText(/\/test (.+)/, async (msg, match) => {
  //   const chatId = msg.chat.id;
  //   const text = match[1];

  //   bot.sendMessage(chatId, JSON.stringify(oAuth2Client.credentials));
  // });

  // listener
  bot.onText(/\/PVX (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    console.log("QUERY TO SEARCH: ", text);
    let message = "💾 PVX GDRIVE 💾\n\n";
    message += `🔍 Query: ${text} 🔍\n\n`;

    /* ------------------------------ FOLDER SEARCH ----------------------------- */
    let queryData = {
      ...extraData,
      q: `mimeType = 'application/vnd.google-apps.folder' and name contains '${text}'`,
    };

    let response = await drive.files.list(queryData);
    const folderArray = response.data.files;
    // console.log("TOTAL RESULT (FOLDER) : ", folderArray.length);
    message += `🔍 FOLDERS (TOP 10) : ${folderArray.length}\n\n`;

    folderArray.slice(0, 10).forEach((folder, index) => {
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
    // message += `\n🔍 MP4 FILES (Top 2) : ${mp4Array.length}\n\n`;

    mp4Array.slice(0, 2).forEach((mp4, index) => {
      message += `${index + 1}) Name: ${
        mp4.name
      }\nLink: https://drive.google.com/file/d/${mp4.id}\n\n`;
    });

    /* ------------------------------- MKV SEARCH ------------------------------- */
    queryData = {
      ...extraData,
      q: `mimeType = 'video/x-matroska' and name contains '${text}'`,
    };
    response = await drive.files.list(queryData);
    const mkvArray = response.data.files;
    // console.log("TOTAL RESULT (mp4) :", mkvArray.length);
    message += `\n🔍 MKV FILES (Top 2) : ${mkvArray.length}\n\n`;

    mkvArray.slice(0, 2).forEach((mkv, index) => {
      message += `${index + 1}) Name: ${
        mkv.name
      }\nLink: https://drive.google.com/folderview?id=${mkv.id}\n\n`;
    });

    /* ------------------------------- TAR SEARCH ------------------------------- */
    queryData = {
      ...extraData,
      q: `mimeType = 'application/x-tar' and name contains '${text}'`,
    };
    response = await drive.files.list(queryData);
    const tarArray = response.data.files;
    // console.log("TOTAL RESULT (tar)  :", tarArray.length);
    message += `\n🔍 TAR FILES (TOP 10) : ${tarArray.length}\n\n`;

    tarArray.slice(0, 10).forEach((tar, index) => {
      message += `${index + 1}) Name: ${
        tar.name
      }\nLink: https://drive.google.com/folderview?id=${tar.id}\n\n`;
    });

    /* ------------------------------- ZIP SEARCH ------------------------------- */
    queryData = {
      ...extraData,
      q: `mimeType = 'application/zip' and name contains '${text}'`,
    };
    response = await drive.files.list(queryData);
    const zipArray = response.data.files;
    // console.log("TOTAL RESULT (zip) :", zipArray.length);
    message += `\n🔍 ZIP FILES (TOP 10) : ${zipArray.length}\n\n`;

    zipArray.slice(0, 10).forEach((zip, index) => {
      message += `${index + 1}) Name: ${
        zip.name
      }\nLink: https://drive.google.com/folderview?id=${zip.id}\n\n`;
    });

    /* ------------------------------- PDF SEARCH ------------------------------- */
    queryData = {
      ...extraData,
      q: `mimeType = 'application/pdf' and name contains '${text}'`,
    };
    response = await drive.files.list(queryData);
    const pdfArray = response.data.files;
    // console.log("TOTAL RESULT (pdf) :", pdfArray.length);
    message += `\n🔍 PDF FILES (TOP 10) : ${pdfArray.length}\n\n`;

    pdfArray.slice(0, 10).forEach((pdf, index) => {
      message += `${index + 1}) Name: ${
        pdf.name
      }\nLink: https://drive.google.com/folderview?id=${pdf.id}\n\n`;
    });

    message = message.slice(0, 4096); // tg message limit is 4096
    bot.sendMessage(chatId, message);
    // send a message to the chat acknowledging receipt of their message
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
  // handle refresh token - RT is used to get new access token as AT expires in 1 hour.. [listener]
  oAuth2Client.on("tokens", (tokens) => {
    console.log("This tokens event only occurs in the first authorization!");
    if (tokens.refresh_token) {
      console.log("SAVING REFRESH TOKEN: ", tokens.refresh_token);
      refreshToken = tokens.refresh_token;

      // After every 55 min, remove all the token details from oAuth2Client.credentials and set only refresh_token which will make to generate a new access_token
      setInterval(() => {
        console.log(
          "SET INTERVAL TO PUT REFRESH_TOKEN TO GET NEW ACCESS TOKEN !!"
        );
        // we are removing access_token and other details from credentials and only putting the refresh_token
        // so if access_token won't be there then google will check refresh_token value and will provide a access_token automatically
        oAuth2Client.setCredentials({
          refresh_token: refreshToken,
        });
      }, 1000 * 60 * 55); //55 min
    }
    console.log("ACCESS_TOKEN: ", tokens.access_token);
  });

  const authUrl = oAuth2Client.generateAuthUrl({
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
  oAuth2Client.setCredentials(tokens); // set token
  return tokens;
};

app.get("/getToken", async (req, res) => {
  if (!req.query.code && req.query.code.length < 10)
    return res.status(400).send("Invalid Request");

  let token = await getAndSetToken(req.query.code);
  drive = google.drive({ version: "v3", auth: oAuth2Client });

  startBot();
  // res.send(token);
  res.send("TOKEN ACCEPTED");
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server Started ${PORT}`));
//
