# shared-gdrive-bot

To create a telegram bot to send your google shared drive files direct links to your telegram channel.

<img src="https://i.ibb.co/hLNqGKq/gdrive.png"/>

## Enable google drive api

1- Go to https://console.cloud.google.com/

login and create a new project

2- Search "Google Drive API" and enable it

3- In "OAuth consent screen" , fill details with (Testing, External, Add Test users -> your gmail accounts)

4- In "Credentials" , Create new "OAuth 2.0 Client IDs" with

Authorised JavaScript origins (Url from which authorization request will come) -> https://localhost

Authorised redirect URIs (Url after authorization will open) -> https://localhost/getToken

NOTE: change localhost URLs to your hosting url like yourapp.herokuapp.com/getToken in redirect URLs

5- Download your OAuth 2.0 Client json file and change its name to "credentials.json" and place it in your repo folder

## TG Bot

1- Create Telegram bot from BotFather and get token

2- Create a local ".env" file with

token = your-bot-token

## Run

> git clone https://github.com/Shubhamrawat5/shared-gdrive-bot.git

> cd shared-gdrive-bot

> npm install

> node app.js

Now https://localhost will show "api running" if everything is ok!

Now open https://localhost/getAuthURL will give Oauth gmail authentication then give permission and it will redirect to a page that will show "token accepted" and bot will start running!

- File app.js is the main file , tg.js and gdrive.js files are just for my testing.

- Also change shared gdrive id in app.js file to your shared drive id

- read documentation and it've a cool helpful feature to directly try the API -> https://developers.google.com/drive/api/v3/reference/

- Bot running in TG group https://t.me/PVX_Community_Group and contact https://t.me/KryptonPVX for any query !
