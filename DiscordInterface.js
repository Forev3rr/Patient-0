//Include Discord Library
const Discord = require('discord.js')

//Required for the Client
const client = new Discord.Client()

//Configuratio file include
const config = require("./config.json");

const olivia = require("./olivia.json");

//After this all the bot will respond to messages
client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
})

client.on("message", async message => {

  //If bot with message, do nothing
  if (message.author.bot) return;
  
  //Ingore messages with other prefixes
  if (message.content.indexOf(config.prefix) !== 0) return;

  //Separates command and arguments for command
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  /////////////////////////////MEMES
  if(command === "chair"){
    message.channel.send(`Hmmm, what about this one: ${chairs[Math.floor(Math.random() * chairs.length)]} ${message.author}?`)
  }

  if(command === "leapday"){
    message.channel.send(`Leap day is February 29th ${message.author} :thinking:`);
  }
  ////////////////////////////!MEMES

  /* Ping Command */
  if(command === "ping"){
    const response = await message.channel.send("Ping?");
    response.edit(`Pong! Latency is ${response.createdTimestamp - message.createdTimestamp}ms. API latency is ${Math.round(client.ping)}ms`);
  }

  /* New Game Command */
  if(command === "newgame"){
    if(!preparing & !playing){
      message.channel.send(`${message.author} wants to start a game of Werewolf! To join please type **${config.prefix}join**`);
      newGame(message.author);
      /*players.add(message.author);
      numPlayers = 1;
      preparing = true;*/
    }
    else{
      message.channel.send(`It looks like there is a game being prepared or played!`);
    }
  };

  /* Join Command */  
  if(command === "join"){
      if(preparing){
        if(numPlayers < maxPlayers){
          if(!players.includes(message.author)){
            addPlayer(`${message.author.username}:${message.author.id}`);
            message.channel.send(`${message.author.username} has joined as player ${numPlayers}`);
          }
          else{
            message.channel.send(`It seems like you have already joined the game... :thinking:`);
          }   
        }
        else{
          message.channel.send(`It appears that the max players has been reached.. wait how do you have this many friends?`);
        }
    }
    else{
      message.channel.send(`There is currently no game being prepared.. why not start one yourself?`);
    }
  }

  /* Start Game Command */
  if(command === "startgame"){ 
    if(players >= minPlayers){
      if(message.author === players[0]){
        startGame();
        werewolves.forEach(element => messageWerewolf(getUserId(element)));
        //messageSeer()
        //messageDoctor()
      }
      else {
        message.channel.send(`Only the leader can start the game.`);
      }
    }
    else{
      message.channel.send(`Minimum players has not been reached.`);
    }
   }

  if(command === "endgame"){
    if(preparing){
      message.channel.send(`Game has ended.`);
      preparing = false;
    }
  }

  if(command === "dog"){
    message.channel.send(`werewolf test`);
    werewolfPhase = true;
  }

  if(werewolfPhase){
    message.channel.send(`test`);
  }

  function messageWerewolf(userId) {
    messageUser(userId, `You have become a werewolf :wolf: :full_moon:! ArroOoOoOoOoOOooOOo`);
    var msg = `Here are all the werewolves this game:`;
    for(let i = 0; i < werewolves.length; i++){
      msg.concat(`\n${i}. ${werewolves[i]}`)
    }
    messageUser(userId, msg);
  }

  function messageSeer(userId) {
    messageUser(userId, `You have become the Seer! Go out inspect some folks :eye: :see_no_evil:`);
  }

  function messageDoctor(userId) {
    messageUser(userId, `You have become the doctor! Go out and heal some folks :stetoscope: :hearts:`);
  }

   function messageUser(userId, message){
     client.users.fetch(userId).then(user => {user.send(message)});
   }

   function returnName(userId){
     client.users.fetch(userId).then.name;
   }
});

var werewolfPhase = false;

var chairs = [
  `https://secretlabchairs.ca/collections/omega-series?utm_source=google&utm_campaign=ca-google-shop&utm_medium=cpc&utm_content=datafeed#omega_2020-stealth&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWTqq_fx-XKjgA6bhzize2-5s_GdqpifKt2Sy6VZgm2XQ_P8AhbokV4aAocwEALw_wcB`,
  `https://www.uline.ca/Product/Detail/H-6238/Office-Chairs/All-Mesh-Task-Chair?pricode=YE963&gadtype=pla&id=H-6238&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWThPufhQbT5mXbrrs_tacwRckdBQe-ODaE9-K2vbJWY4XUpnOEUFmYaAoWiEALw_wcB&gclsrc=aw.ds`,
  `https://www.wayfair.ca/Astoria-Grand--Pridemore-Executive-Chair-QOFY2117-L10-K~PNEX1006.html?refid=GX311258840124-PNEX1006_36834961&device=c&ptid=649949315489&targetid=pla-649949315489&network=g&ireid=85639976&PiID%5B%5D=36834961&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWQzK3qMqJSOrYIiKD7F0uyJiaPqzmEnF6vXoa2fCTmKTs2CvBO4UI4aAtt3EALw_wcB`,
  `https://secretlabchairs.ca/collections/omega-series?utm_source=google&utm_campaign=ca-google-shop&utm_medium=cpc&utm_content=datafeed#omega_2020_softweave-cookies_and_cream&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWRcza7MQ3_FlwKGptBKHyNJMyTl_BIeKVG8LOOGEXR9ACavoTQwRcYaAhbSEALw_wcB`,
  `https://www.wayfair.ca/Humanscale--Freedom-Executive-Chair-F213M-L10-K~C002538720.html?refid=GX381867373331-C002538720_915915054_915915057&device=c&ptid=847715690613&targetid=pla-847715690613&network=g&ireid=101795271&PiID%5B%5D=915915057&PiID%5B%5D=915915054&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWT_aTrSXghwEZBitvtwDXKSdZlYF9Xr_Wf56p-TOpHG9PEXQiWFM4YaAmu9EALw_wcB`,
  `https://www.wayfair.ca/Ebern-Designs--PC-and-Racing-Game-Chair-X113086327-L861-K~C002934008.html?refid=GX185650310553-C002934008&device=c&ptid=881637038879&targetid=aud-835011429296:pla-881637038879&network=g&ireid=110590688&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWQY9DwtbF8RjJ8Ctb-F0DhjvvB0LtLe4IVtt9vl8am5NUuE1FHspvUaAvvyEALw_wcB`,
  `https://www.ikea.com/ca/en/p/poaeng-armchair-black-brown-hillared-anthracite-s59306555/`,
  `https://www.staples.ca/products/394403-en-staples-mesh-task-chair-black`,
  `https://www.staples.ca/products/2888298-en-staples-hyken-technical-mesh-task-chair-red`,
  `https://www.staples.ca/products/2715730-en-staples-denaly-bonded-leather-big-tall-managers-chair-black-51468-ca`,
  `https://www.staples.ca/products/2896921-en-staples-racing-style-managers-chair-pink-53348-ca`,
  `https://www.staples.ca/products/2883935-en-staples-vartan-gaming-chair-red`,
  `https://www.staples.ca/products/2956057-en-anda-seat-e-series-gaming-chair-black`,
  `https://www.staples.ca/products/2883936-en-staples-vartan-gaming-chair-blue`
];

//bot_secret_token = "Njk5Nzg4NTE0MzYzMTc5MDE4.XpZfkw.RSgmt2e374hsQkRBhTngZRuXqWM"
client.login(config.token)

//////////// DISCORD LAYER END

//////////// PATIENT ZERO LAYER START
const maxPlayers = 16;
const minPlayers = 5;
var numPlayers = 0;
var players = [];

var preparing = false;
var playing = false;

var seer;
var doctor;
var werewolves = [];
var numWerewolves = 2;

// acknowledged is used when a comm
var acknowledge = false;
var restart = false;

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
        console.log("Random " + n + ": " + result[n]);
    }
    return result;
}

function resetVars() {
    numPlayers = 0;
    players = [];
    numWerewolves = 2;
    playing = false;
};

function addPlayer(name) {
    /*if (numPlayers >= maxPlayers) {
        console.log("Error: Too many players.");
        return;
    }*/
    players[numPlayers] = name;
    numPlayers++;
    console.log(name + " has ***joined***.");
    console.log("That makes " + numPlayers + " players.\n\n")
};

function removePlayer(name) {
    if (numPlayers <= 0) {
        console.log("Error: There ain't no GD players.");
        return;
    }
    if (name == players[0]) {
        console.log("Error: How you gon' play with no leader, blood?");
        return;
    }
    var tempPlayers = [];
    var found = false;
    for (var i = 0; i < numPlayers; i++) {
        if (found)
            tempPlayers[i-1] = players[i];

        else
            tempPlayers[i] = players[i];

        if (players[i] == name)
            found = true;
    }
    if (!found) {
        console.log("Error: " + name + " is a little princess and is therefore in another castle.");
        return;
    }
    players = tempPlayers;
    numPlayers--;
    
    console.log(name + " has ***left***.");
    console.log("That makes " + numPlayers + " players.\n\n")
};

function newGame(name) {
    if (preparing) {
        console.log ("Error: You're already creating a new game, shithead.");
        return;
    }
    if (playing) {
        console.log ("Are you sure you want to start a new game?");
        acknowledge = true;
        return;
    }
    console.log("***" + name + "*** has started a new game of Werewolf.\nTo play, type ***!join***\n\nOnce everyone is in, ***" + name + "*** can type ***!start*** to begin the game");
    preparing = true;

    resetVars();
    players[0] = name;
    numPlayers = 1;
};

function startGame(name) {
    if (!preparing) {
        console.log("Error: Sorry, dog. No game is happening right now :(");
        return;
    }
    if (playing) {
        console.log("Error: Can't start what's started, so don't get started with me.");
        return;
    }
    if (name != players[0]) {
        console.log("Error: You is no leader.");
        return;
    }
    if (numPlayers < minPlayers) {
        console.log("Error: You're a loser with no friends.");
        return;
    }
    preparing = false;
    playing = true;

    if (numPlayers >= 14)
        numWerewolves = 3;

    var rolePlayerNames = [];
    var rolePlayerNumbers = [];
    var numRoles = 2 + numWerewolves;

    rolePlayerNames = getRandom(players, numRoles);
    for (var i = 0; i < numRoles; i++) {
        for (var j = 0; j < numPlayers; j++) {
            if (players[j] == rolePlayerNames[i]) {
                rolePlayerNumbers[i] = j;
            }
        }
    }

    seer = rolePlayerNumbers[0];
    doctor = rolePlayerNumbers[1];
    for (var i = 0; i < numWerewolves; i++)
        werewolves[i] = rolePlayerNumbers[i + 2];
        
    console.log(players[seer] + " is the Seer.");
    console.log(players[doctor] + " is the Doctor.");
};

function testGame() {
    newGame("P McGee");
    for (var i = 0; i < 7; i++) {
        addPlayer("P " + (i + 2));
    }
}

///// PATIENT LAYER END