//Include Discord Library
const Discord = require('discord.js')

//Required for the Client
const client = new Discord.Client()

//Configuratio file include
const config = require("./config.json");

//Channel the game is being played in
var mainChannel;

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
  // if(command === "chair"){
  //   message.channel.send(`Hmmm, what about this one: ${chairs[Math.floor(Math.random() * chairs.length)]} ${message.author}?`)
  // }

  // if(command === "leapday"){
  //   message.channel.send(`Leap day is February 29th ${message.author} :thinking:`);
  // }
  ////////////////////////////!MEMES

  /* Ping Command */
  if(command === "ping"){
    const response = await message.channel.send("Ping?");
    response.edit(`Pong! Latency is ${response.createdTimestamp - message.createdTimestamp}ms. API latency is ${Math.round(client.ping)}ms`);
  }

  /* New Game Command */
  if (command === "newgame") {
    if (preparing) {
      message.channel.send(`A game is already being prepared yo'`);
      return;
    }
    if (playing) {
      message.channel.send(`Y'all playing a game right now!`);
      return;
    }

    message.channel.send(`${message.author} wants to start a game of Werewolf! To join please type **${config.prefix}join**`);
    newGame(message.author);
  };

  /* Join Command */  
  if(command === "join"){
    if (!preparing) {
      message.channel.send(`There is currently no game being prepared.. why not start one yourself?`);
      return;
    }

    if (numPlayers >= maxPlayers) {
      message.channel.send(`It appears that the max players has been reached.. wait how do you have this many friends?`);
      return;
    }

    if(players.includes(message.author.id)){
      message.channel.send(`It seems like you have already joined the game... :thinking:`);
      return;
    }
    addPlayer(message.author.id);
    message.channel.send(`${message.author.username} has joined as player ${numPlayers}`);
  }

  /* Start Game Command */
  if (command === "startgame") {
    if (!preparing) {
      message.channel.send(`Sorry, ${message.author}. No game is happenin' right now :()`);
      return;
    }
    if (playing) {
      message.channel.send(`Can't start what's started, so don't get started with me.`);
      return;
    }
    if (players < minPlayers) {
      message.channel.send(`${message.author} is a loser with no friends.`);
      return;
    }
    if(message.author.id != players[0]){
      message.channel.send(`Only the leader can start the game.`);
      return;
    }
    startGame();
    try{
      mainChannel = message.channel;
    }
    catch{
      console.log("mainChannel has not been assigned properly...");
    }
  }

  if(command === "endgame"){
    if(preparing && message.channel == channel && players.indexOf(message.author.id) === 0){
      message.channel.send(`Game has ended.`);
      preparing = false;
    }
  }

  /* TESTING ONLY COMMANDS*/
  if (command === "_toggleplaying") {
    if(playing){
      message.channel.send(`Setting *playing* to false.`);
      playing = false;
    }
    else{
      message.channel.send(`Setting *playing* to true.`);
      playing = true;
    }
  }

  if(command === "_phaseselect"){
    message.channel.send(`You are setting the phase to: ${args}`);
    phase = args;
  }

  if(command === "_werewolfadd"){
    message.channel.send(`${message.author} is now a werewolf.`);
    werewolves.push(message.author.id);
  }

  if(command === "_listwerewolves"){
    var j;
    for(let i = 0; i < werewolves.length; i++){
      j = i + 1;
      message.channel.send(`${j}. ${(await client.users.fetch(werewolves[i])).username}`);
    }
  }

  /* Non-command centric messages */
  
  /* Werewolf Phase */
  if(phase === 0 & !werewolvesNotified & playing){
    //Reset this value
    morningNotified = false;

    //Message the channel
    message.mainChannel.send(`Everyone, pretend you're closing your eyes and slapping a bag of soil to cover up any noise.\nThe night is upon us and the werewolves are about to choose their first target.\n *We're hoping it's not you too!*`);
    
    //Message the Werwolves
    messageWereWolves(`You are a werewolf :wolf: :full_moon:! Get ready to **!kill** some b- ... uh.. I mean villagers.`);
    var msg1 = `Here's the wolf pack tonight:`;
    for(let i = 0; i < werewolves.length; i++){
      msg1 = msg1.concat(`\nWerewolf ${i+1}. ${(await client.users.fetch(werewolves[i])).username}`)
    }
    messageWereWolves(msg1);

    //Message the kill list
    var msg2 = `Okay, let's get to the fun part. **!kill**-ing. Type **!kill** # for the player ya want to slaughter.`
    var playersToKill = [];
    for(let i = 0; i < players.length; i++){
      if (!werewolves.includes(players[i])){
        msg2 = msg2.concat(`\nPlayer ${i+1}. ${(await client.users.fetch(players[i])).username}`)
      }
    }
    messageWereWolves(msg2)

    werewolvesNotified = true;
  }

  if(phase === 0 & werewolvesNotified & playing){    
    if (command === "kill") {
      
      //Only message if it's a dm channel
      if (message.channel.type == "dm") {

        //If not a werwolf yeet em outta this logic
        if(!werewolves.includes(players.indexOf(message.author.id))){
          return; //Not a werwolf
        }
        
        //Try/Catch since args could be bad
        try{
          if(!werewolves.includes(players[args-1])){
            killFolks(players.indexOf(message.author.id), args-1);
          }
          else{
            message.channel.send(`yo ${args} is a werewolf, not a villager. Try again;`);
          }
        }
        catch{
          message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
        }
      }
      else {
        message.channel.send(`Yo ${message.author}, you tryna out yourself or? This is a *DM only* command.`);
      }
    }
  }

  if(phase === 1 & !seerNotified & playing){

    //Reset this value
    werewolvesNotified = false;

    //Message the seer
    var msg = `You are the Seer :eye: :see_no_evil:! **!inspect** from the following contestants:`
    for(let i = 0; i < players.length; i++){
      msg = msg.concat(`\n${i+1}. ${(await client.users.fetch(players[i])).username}`)
    }
    messageUser(players[seer], msg);
    seerNotified = true;
  }

  if(phase === 1 & seerNotified & playing){
    if(command === "inspect"){
      if(message.channel.type == "dm"){

        //Are they seer or are they naught
        if(players.indexOf(message.author.id) != seer){
          return; //not a seer
        }

        //try/catch cuz args
        try{
          if(seer != args-1){
            if(players[args-1] != 'undefined'){
              var whatAreThey = inspectaDeck(seer, args-1);
              var theyAre;
              switch (whatAreThey) {
                case 0:
                  theyAre = `Doctor`;
                  break;
  
                case 1:
                  theyAre = `Werewolf`;
                  break;
  
                case 2:
                  theyAre = `Villager`;
                  break;
              }

              message.channel.send(`Looks like the person you are inspecting is a ... ${theyAre}!`);
            }
            else{
              message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
            }
          }
          else{
            message.channel.send(`Why you tryna inspect yourself? To each their own?`);
          }
        }
        catch{
          message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
        }
      }
      else{
        message.channel.send(`Yo ${message.author}, you tryna out yourself or? This is a *DM only* command.`);
      }
    }
  }

  if(phase === 2 & !doctorNotified & playing){
    //Reset this value
    seerNotified = false;

    //Message the doctor
    var msg = `You are the doctor :heart: :cross:! Who do you want to **!heal** (it can even be yourself :wink:):`;
    for(let i = 0; i < players.length; i++){
      msg = msg.concat(`\n${i+1}. ${(await client.users.fetch(players[i])).username}`);
    }
    messageUser(players[doctor]);
  }

  if (phase === 2 & doctorNotified & playing) {
    if (command === "heal") {
      if (message.channel.type == "dm") {

        //To doc or not to docto
        if (players.indexOf(message.author.id) != doctor) {
          return; //not a docman
        }

        //try catch yea yea
        try {
          if (players[args - 1] != 'undefined') {
            heal(args - 1);
          }
          else {
            message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
          }
        }
        catch{
          message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
        }
      }
    }
  }

  if(phase === 3 & !morningNotified & playing){
    //Reset this value
    doctorNotified = false;

    //Alert the masses who dieddd
    message.mainChannel.send(`Everybody wake up. ${(await client.users.fetch(players[dying]))} was mutilated in their sleep!`);
    if(dying === healing){
      message.mainChannel.send(`... but luckily the doctor patched em up, so no life lost!`);
    }

    //Alert if werewolves win
    if(numWerewolves >= (numPlayers - numWerewolves)){
      message.mainChannel.send(`Well everyone, you tried your best, but it just wasn't good enough. Werewolves win...`);
      resetVars();
      return;
    }

    //okay if werewolves didn't win lets talk about lynching
    var msg1 = `Talk amongst yourselves and try to figure out *who* among you is not who they say!\n If you think you know who is a werewolf, you may vote to kill a player from the list below by typing **!vote** ***x***:\n`;
    for (let i = 0; i < players.length; i++){
        msg1 = msg1.concat(`\n ${i+1}. ${(await client.users.fetch(players[i])).username}`);
    }
    msg1 = msg1.concat(`\n`);
    msg1 = msg1.concat(`If you aren't sure who could be a filthy, no good, two-timing werewolf, ${(await client.users.fetch(players[0])).username} can type !sleep to move to night time.`)
    message.mainChannel.send(msg1);

    //Morning notification complete
    morningNotified = true;

    //Reset this array
    playersWhoVoted = [];
  }

  if(phase === 3 & playing & morningNotified & message.channel === mainChannel){
    if(command === "vote"){
      if (!playersWhoVoted.includes(message.author.id)){
        if(players[args - 1] != 'undefined'){
          var sacrificeTime = vote(args-1);
          if(sacrificeTime != null){
            var ret = sacrificeTime();
            if (ret === null){
              message.mainChannel.send(`Looks like nobody dies today. Good luck tonight!`);
            }
            if(ret === true){
              message.mainChannel.send(`Looks like ${(await client.users.fetch(players[dying])).username} was a werewolf! Nice!`);
            }
            //end game state
            if(numWerewolves >= (numPlayers - numWerewolves)){
              message.mainChannel.send(`Well everyone, you tried your best, but it just wasn't good enough. Werewolves win...`);
              resetVars();
            }
            //end game state
            else if(numWerewolves == 0){
              message.mainChannel.send(`Fuck you, werewolves!!!!!\n**Villagers win!**`);
              resetVars();
            }
          }
        }
      }
      else{
        message.mainChannel.send(`Hey ${message.author} you already voted!`);
      }
    }
    if(command === "sleep" & players.indexOf(message.author.id) === 0){
      skipDay();
    }
  }
  
  function messageWereWolves(message){
    for(let i = 0; i < werewolves.length; i++){
      messageUser(players[werewolves[i]], message);
    }
  }

   function messageUser(userId, message){
     client.users.fetch(userId).then(user => {user.send(message)});
   }

   function messageChannelAndReturn(message){
     message.channel.send(message);
     return;
   }
});

var seerNotified = false;
var doctorNotified = false;
var werewolvesNotified = false;
var morningNotified = false;
var playersWhoVoted = [];

// var chairs = [
//   `https://secretlabchairs.ca/collections/omega-series?utm_source=google&utm_campaign=ca-google-shop&utm_medium=cpc&utm_content=datafeed#omega_2020-stealth&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWTqq_fx-XKjgA6bhzize2-5s_GdqpifKt2Sy6VZgm2XQ_P8AhbokV4aAocwEALw_wcB`,
//   `https://www.uline.ca/Product/Detail/H-6238/Office-Chairs/All-Mesh-Task-Chair?pricode=YE963&gadtype=pla&id=H-6238&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWThPufhQbT5mXbrrs_tacwRckdBQe-ODaE9-K2vbJWY4XUpnOEUFmYaAoWiEALw_wcB&gclsrc=aw.ds`,
//   `https://www.wayfair.ca/Astoria-Grand--Pridemore-Executive-Chair-QOFY2117-L10-K~PNEX1006.html?refid=GX311258840124-PNEX1006_36834961&device=c&ptid=649949315489&targetid=pla-649949315489&network=g&ireid=85639976&PiID%5B%5D=36834961&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWQzK3qMqJSOrYIiKD7F0uyJiaPqzmEnF6vXoa2fCTmKTs2CvBO4UI4aAtt3EALw_wcB`,
//   `https://secretlabchairs.ca/collections/omega-series?utm_source=google&utm_campaign=ca-google-shop&utm_medium=cpc&utm_content=datafeed#omega_2020_softweave-cookies_and_cream&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWRcza7MQ3_FlwKGptBKHyNJMyTl_BIeKVG8LOOGEXR9ACavoTQwRcYaAhbSEALw_wcB`,
//   `https://www.wayfair.ca/Humanscale--Freedom-Executive-Chair-F213M-L10-K~C002538720.html?refid=GX381867373331-C002538720_915915054_915915057&device=c&ptid=847715690613&targetid=pla-847715690613&network=g&ireid=101795271&PiID%5B%5D=915915057&PiID%5B%5D=915915054&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWT_aTrSXghwEZBitvtwDXKSdZlYF9Xr_Wf56p-TOpHG9PEXQiWFM4YaAmu9EALw_wcB`,
//   `https://www.wayfair.ca/Ebern-Designs--PC-and-Racing-Game-Chair-X113086327-L861-K~C002934008.html?refid=GX185650310553-C002934008&device=c&ptid=881637038879&targetid=aud-835011429296:pla-881637038879&network=g&ireid=110590688&gclid=Cj0KCQjw4dr0BRCxARIsAKUNjWQY9DwtbF8RjJ8Ctb-F0DhjvvB0LtLe4IVtt9vl8am5NUuE1FHspvUaAvvyEALw_wcB`,
//   `https://www.ikea.com/ca/en/p/poaeng-armchair-black-brown-hillared-anthracite-s59306555/`,
//   `https://www.staples.ca/products/394403-en-staples-mesh-task-chair-black`,
//   `https://www.staples.ca/products/2888298-en-staples-hyken-technical-mesh-task-chair-red`,
//   `https://www.staples.ca/products/2715730-en-staples-denaly-bonded-leather-big-tall-managers-chair-black-51468-ca`,
//   `https://www.staples.ca/products/2896921-en-staples-racing-style-managers-chair-pink-53348-ca`,
//   `https://www.staples.ca/products/2883935-en-staples-vartan-gaming-chair-red`,
//   `https://www.staples.ca/products/2956057-en-anda-seat-e-series-gaming-chair-black`,
//   `https://www.staples.ca/products/2883936-en-staples-vartan-gaming-chair-blue`
// ];

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


var votes = [];
var voted = 0;
var dying = null;
var healing = null;

// phase is in charge of remembering what part of the round we're on
//      0 = Night Start
//      1 = 
var phase = 0;

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
        //console.log("Random " + n + ": " + result[n]);
    }
    return result;
}

function resetVars() {
    numPlayers = 0;
    players = [];
    numWerewolves = 2;
    playing = false;
    votes = [];
    voted = 0;
    dying = null;
    healing = null;
    phase = 0;
};

function addPlayer(id) {
    if (numPlayers >= maxPlayers) {
        console.log("Error: Too many players.");
        return;
    }
    players[numPlayers] = id;
    numPlayers++;
    console.log(id + " has ***joined***.");
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
    playGame();
};

function playGame() {
    if (!playing) {
        console.log("Error: There ain't be no game to be played 'round 'ere.");
        return;
    }
    if (preparing) {
        console.log("Error: You want to play before you start? Do you also put your car into drive before you turn the key?? Fucking weirdo.");
        return;
    }
    // There's no default phase, sue me
    switch (phase) {
        // Werewolf Phase
        case 0:
            werewolfPhase();
            break;        
        case 1:
            seerPhase();
            break;
        case 2:
            doctorPhase();
            break;
        case 3:
            morningPhase();
            break;
    }
};

function werewolfPhase(){
    console.log ("Everyone, pretend you're closing your eyes and slapping a bag of soil to cover up any noise.\nThe night is upon us and the werewolves are about to choose their first target.\n *We're hoping it's not you too!*");
    if (numWerewolves == 2) {
        var msg1 = players[werewolves[0]] + ": " + players[werewolves[1]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
        var msg2 = players[werewolves[1]] + ": " + players[werewolves[0]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
        for (var i = 0; i < numPlayers; i++) {
            if (i < 10) {
                msg1 += i + "       - " + players[i] + "\n";
                msg2 += i + "       - " + players[i] + "\n";
            }
            else { 
                msg1 += i + "      - " + players[i] + "\n";
                msg2 += i + "      - " + players[i] + "\n";
            }
        }
        msg1 += "```";
        msg2 += "```";
        console.log(msg1);
        console.log(msg2);
    }
    if (numWerewolves == 2) {
        var msg1 = players[werewolves[0]] + ": " + players[werewolves[1]] + " & " + players[werewolves[2]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
        var msg2 = players[werewolves[1]] + ": " + players[werewolves[0]] + " & " + players[werewolves[2]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
        var msg3 = players[werewolves[2]] + ": " + players[werewolves[0]] + " & " + players[werewolves[1]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
        for (var i = 0; i < numPlayers; i++) {
            if (i < 10) {
                msg1 += i + "       - " + players[i] + "\n";
                msg2 += i + "       - " + players[i] + "\n";
                msg3 += i + "       - " + players[i] + "\n";
            }
            else { 
                msg1 += i + "      - " + players[i] + "\n";
                msg2 += i + "      - " + players[i] + "\n";
                msg3 += i + "      - " + players[i] + "\n";
            }
        }
        msg1 += "```";
        msg2 += "```";
        msg3 += "```";
        console.log(msg1);
        console.log(msg2);
        console.log(msg3);
    }
};

function killFolks(player, target) {
    var found = false;
    for (var i = 0; i < numWerewolves; i++){
        if (werewolves[i] == player) {
            found = true;
            break;
        }
    }
    if (!found) {
        console.log("Error: You ain't no wulf.");
        return;
    }
    if (whoVoted[player] == true) {
        console.log("Error: You no good, lilly-livered, dog-trash, sister-fucking, foul-smelling piece of shit. You already voted.");
        return;
    }
    votes[voted] = target;
    voted++;
    if (voted == numWerewolves) {
        return (sacrifice());
    }
    return null;
};

function sacrifice() {
    var pickedPlayers = [];
    var pickedTimes = [];
    var numPicked = 0;
    var highestVotes = 0;
    var highestPlayer = "";
    for (var i = 0; i < voted; i++) {
        if (i == 0) {
            pickedPlayers[numPicked] = votes[i];
            pickedTimes[numPicked]++;
            numPicked++;
        }
        else {
            var found = false;
            for (var j = 0; j < numPicked; j++) {
                if (pickPlayers[j] == votes[i]) {
                    pickedTimes[j]++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                pickedPlayers[numPicked] = votes[i];
                pickedTimes[numPicked]++;
                numPicked++;
            }
        }
    }
    for (var i = 0; i < numPicked; i++) {
        if (pickedTimes[i] > highestVotes) {
            highestVotes = pickedTimes[i];
            highestPlayer = i;
        }
        else if (pickedTimes[i] == highestVotes) {
            // Flip a coin. If it's heads, we got a new winner.
            var who2pick = Math.floor(Math.random()*2);
            if (who2pick == 0) {
                highestVotes = pickedTimes[i];
                highestPlayer = i;
            }
        }
    }
    dying = pickedPlayers[highestPlayer];
    phase++;
    playGame();
    return pickedPlayers[highestPlayer];
};

function seerPhase() {
    var msg1 = players[seer] + ": Choose a player from the list below to see what their role is.\n```\n";
    for (var i = 0; i < numPlayers; i++) {
        if (i < 10) 
            msg1 += i + "       - " + players[i] + "\n";
        else 
            msg1 += i + "      - " + players[i] + "\n";
    }
    msg1 += "```";
    console.log(msg1);
};

function inspectaDeck(seer, target) {
    var found = false;
    var whatThey;
    if (target == doctor) {
        console.log(players[seer] + ": " + players[target] + " is the doctor.");
        found = true;
        whatThey = 1;
    }
    else {
        for (var i = 0; i < numWerewolves; i++) {
            if (werewolves[i] == target) {
                console.log(players[seer] + ": " + players[target] + " is a werewolf.");
                found = true;
                whatThey = 0;
                break;
            }
        }
    }
    if (!found) {
        console.log(players[seer] + ": " + players[target] + " is a villager.");
        whatThey = 2;
    }
    phase++;
    playGame();
    return whatThey;
};

function doctorPhase() {
    var msg1 = players[doctor] + ": Choose a player from the list below to keep safe through the night.\n```\n";
    for (var i = 0; i < numPlayers; i++) {
        if (i < 10) 
            msg1 += i + "       - " + players[i] + "\n";
        else 
            msg1 += i + "      - " + players[i] + "\n";
    }
    msg1 += "```";
    console.log(msg1);
};

function heal(target) {
    var found = false;
    healing = target;
    phase++;
    playGame();
};

function morningPhase() {
    console.log("Everybody wake up. " + players[dying] + " was killed by the werewolf.");
    votes = [];
    voted = 0;
    if (dying == healing) {
        console.log("...but luckily the doctor healed them, so there was no life loss!");
    }
    else {
        removePlayer(players[dying]);
    }

    if (numWerewolves >= (numPlayers - numWerewolves)) {
        console.log("Well everyone, you tried your best, but it just wasn't good enough. Werewolves win...");
        endGame();
        return;
    }
    var msg1 = "Talk amongst yourselves and try to figure out *who* among you is not who they say!\n If you think you know who is a werewolf, you may vote to kill a player from the list below by typing **!vote** ***x***:\n```\n";
    for (var i = 0; i < numPlayers; i++) {
        if (i < 10) 
            msg1 += i + "       - " + players[i] + "\n";
        else 
            msg1 += i + "      - " + players[i] + "\n";
    }
    msg1 += "```\n";
    msg1 += "If you aren't sure who could be a filthy, no good, two-timing werewolf, " + players[0] + " can type !sleep to move to night time.";
    console.log(msg1);
};

function vote(player) {
    votes[voted] = target;
    voted++;
    if (voted == numPlayers) {
        return(sacrificeIITurboHDRemix());
    }
    return null;
};

function sacrificeIITurboHDRemix() {
    var pickedPlayers = [];
    var pickedTimes = [];
    var numPicked = 0;
    var highestVotes = 0;
    var highestPlayer = "";
    var youAWolf = false;
    for (var i = 0; i < voted; i++) {
        if (i == 0) {
            pickedPlayers[numPicked] = votes[i];
            pickedTimes[numPicked]++;
            numPicked++;
        }
        else {
            var found = false;
            for (var j = 0; j < numPicked; j++) {
                if (pickPlayers[j] == votes[i]) {
                    pickedTimes[j]++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                pickedPlayers[numPicked] = votes[i];
                pickedTimes[numPicked]++;
                numPicked++;
            }
        }
    }
    var tied = false;
    for (var i = 0; i < numPicked; i++) {
        if (pickedTimes[i] > highestVotes) {
            highestVotes = pickedTimes[i];
            highestPlayer = i;
            tied = false;
        }
        else if (pickedTimes[i] == highestVotes) {
            // Flip a coin. If it's heads, we got a new winner.
            tie = true;
            var who2pick = Math.floor(Math.random()*2);
            if (who2pick == 0) {
                highestVotes = pickedTimes[i];
                highestPlayer = i;
            }
        }
    }
    if (tied) {
        console.log("Looks like nobody dies today. Good luck tonight!")
        votes = [];
        voted = 0;
        dying = null;
        healing = null;
        phase = 0;
        playGame();
        return null;
    }

    //This only happens if there's no tie
    dying = pickedPlayers[highestPlayer];
    var found = false;
    for (var i = 0; i < numWerewolves; i++) {
        if (werewolves[i] == dying) {
            killWolf(i);
            found = true;
            console.log("Good job! " + players[dying] + " was a werewolf.");
            youAWolf = true;
            break;
        }
    }
    if (!found)
        console.log("Big oof! " + players[dying] + " is not a werewolf.");

    removePlayer(players[dying]);

    if (numWerewolves >= (numPlayers - numWerewolves)) {
        console.log("Well everyone, you tried your best, but it just wasn't good enough.\n**Werewolves win...**");
        endGame();
        return;
    } 
    else if (numWerewolves == 0) {
        console.log("Fuck you, werewolves!!!!!\n**Villagers win!**");
        endGame();
        return;
    }
    
    votes = [];
    voted = 0;
    dying = null;
    healing = null;
    phase = 0;
    playGame();
    return youAWolf;
};

function killWolf(index) {
    for (var i = index; i < numWerewolves; i++) {
        if (i == (numWerewolves - 1)) {
            werewolves[i] = null;
        }
        else
            werewolves[i] = werewolves[i + 1];
    }
    numWerewolves--;
};

function skipDay() {
    console.log(players[0] + " skipped the vote, so good luck!");
    
    votes = [];
    voted = 0;
    dying = null;
    healing = null;
    phase = 0;
    playGame();
};

function endGame() {
    preparing = false;
    //resetVars();
};

function testGame() {
    newGame("P McGee");
    for (var i = 0; i < 7; i++) {
        addPlayer("P " + (i + 2));
    }
};
