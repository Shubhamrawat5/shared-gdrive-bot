const { google } = require("googleapis");
const express = require("express");
const credentials = require("./credentials.json");
const app = express();
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

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
    res.send(token);
  });
});

app.get("/readDrive", async (req, res) => {
  const drive = google.drive({ version: "v3", auth: oAuth2Client });

  console.log("DRIVE DRIVES:", drive.teamdrives);

  // get shared drive IDs
  let ourTeamDriveId = "";
  drive.teamdrives.list((err, response) => {
    if (err) {
      console.log("The API returned an error: " + err);
      return res.status(400).send(err);
    }
    let teamDrivesList = response.data.teamDrives;
    // finding id for our team drive

    console.log("TEAM DRIVES LIST: ", teamDrivesList);
    teamDrivesList.forEach((teamDrive) => {
      if (teamDrive.name == "Adi") {
        ourTeamDriveId = teamDrive.id;
      }
    });

    console.log("OUR TEAM DRIVE: ", ourTeamDriveId);
    //get all data of files in team drive
    //mimeType set to show only folders
    extraData = {
      corpora: "drive",
      driveId: ourTeamDriveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q: "mimeType = 'application/vnd.google-apps.folder' and name contains 'hello'",
    };
    drive.files.list(extraData, (err, response) => {
      console.log(response.data.files);
    });
    // drive.files.list(extraData, (err, response) => {
    //   if (err) {
    //     console.log("The API returned an error: " + err);
    //     return res.status(400).send(err);
    //   } else {
    //     console.log(response.data.files);
    //     res.send(response.data.files);
    //   }
    // });
  });

  // GET OUR GDRIVE FILES LIST
  // drive.files.list(
  //   {
  //     pageSize: 100,
  //   },
  //   (err, response) => {
  //     if (err) {
  //       console.log("The API returned an error: " + err);
  //       return res.status(400).send(err);
  //     }
  //     const files = response.data.files;
  //     if (files.length) {
  //       console.log("Files:");
  //       files.map((file) => {
  //         console.log(`${file.name} (${file.id})`);
  //       });
  //     } else {
  //       console.log("No files found.");
  //     }
  //     res.send(files);
  //   }
  // );
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server Started ${PORT}`));
