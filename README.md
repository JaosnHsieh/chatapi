My chat app backend server built with Express.js, Sequelize.js

### !Important

This project and [j-chat-app](https://github.com/JaosnHsieh/j-chat-web) are in the development phrase.

### React Web App

[j-chat-app](https://github.com/JaosnHsieh/j-chat-web)

### Start the Development Server

```
git clone https://github.com/JaosnHsieh/chatapi.git
git checkout develop
npm i
npm start
```


### Build dev image

`docker build -t chatapi:dev --target dev .`


### Run Development Server from container

`docker run --rm -it --init -v "${PWD}:/usr/src/app" chatapi:dev npm start`


### Run web app and api server with docker-compose

`git clone https://github.com/JaosnHsieh/j-chat-web.git`

`cd ./j-chat-web`

`docker build -t j-chat-web:dev --target dev .`

`cd ..`

`git clone https://github.com/JaosnHsieh/chatapi.git`

`cd ./chatapi`

`docker build -t chatapi:dev --target dev .`

replace your local machine ip by

`vim ./.env`

`docker-compose up -d`

check web app on 

`http://localhost:3031`