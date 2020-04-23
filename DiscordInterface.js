//Include Discord Library
const Discord = require('discord.js')

//Required for the Client
const client = new Discord.Client();

//Configuratio file include
const config = require("./config.json");

//Channel the game is being played in
var mainChannelId;

//Leader of this session
var hostId;

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

  /* Ping Command */
  if (command === "ping") {
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
    hostId = message.author.id;
    mainChannelId = message.channel.id;
    newGame(message.author.id);
  };

  /* Join Command */
  if (command === "join") {
    if (!preparing) {
      messageMainChannel(`There is currently no game being prepared.. why not start one yourself?`);
      return;
    }

    if (numPlayers >= maxPlayers) {
      messageMainChannel(`It appears that the max players has been reached.. wait how do you have this many friends?`);
      return;
    }

    if (players.includes(message.author.id)) {
      messageMainChannel(`It seems like you have already joined the game... :thinking:`);
      return;
    }
    addPlayer(message.author.id);
    messageMainChannel(`${message.author.username} has joined as player ${numPlayers}`);
  }

  /* Start Game Command */
  if (command === "startgame") {
    try {
      mainChannelId = message.channel.id;
      if (!preparing) {
        messageMainChannel(`Sorry, ${message.author}. No game is happenin' right now :()`);
        return;
      }
      if (playing) {
        messageMainChannel(`Can't start what's started, so don't get started with me.`);
        return;
      }
      if (numPlayers < minPlayers) {
        messageMainChannel(`${message.author} is a loser with no friends.`);
        return;
      }
      if (message.author.id != players[0]) {
        messageMainChannel(`Only the leader can start the game.`);
        return;
      }
      startGame(message.author.id);
    }
    catch{
      console.log("mainChannel has not been assigned properly...");
    }
  }

  if (command === "endgame") {
    if (preparing && message.channel.id == mainChannelId && players.indexOf(message.author.id) === 0) {
      messageMainChannel(`Game has ended.`);
      preparing = false;
    }
  }

  /* TESTING ONLY COMMANDS*/
  if(command === "_getplayers"){
    message.channel.send(returnPlayers());
  }

  if (command === "_toggleplaying") {
    if (playing) {
      messageMainChannel(`Setting *playing* to false.`);
      playing = false;
    }
    else {
      messageMainChannel(`Setting *playing* to true.`);
      playing = true;
    }
  }

  if (command === "_phaseselect") {
    message.channel.send(`You are setting the phase to: ${args}`);
    phase = args;
  }

  if(command === "_getphase"){
    message.channel.send(phase);
  }

  if (command === "_werewolfadd") {
    message.channel.send(`${message.author} is now a werewolf.`);
    werewolves.push(message.author.id);
  }

  if (command === "_listwerewolves") {
    var j;
    for (let i = 0; i < numWerewolves; i++) {
      j = i + 1;
      message.channel.send(`${j}. ${(await client.users.fetch(werewolves[i])).username}`);
    }
  }

  if (command === "_playerIndexCheck"){
    message.channel.send(players.indexOf(message.author.id));
  }

  if (command === "_testmainchannelmessage"){
    messageMainChannel("~testing~");
  }

  // if(command === "_test2"){
  //   if(message.member.voice.channel){
  //     let channel = message.member.voice.channel;
  //     for(let member of channel.members){
  //       member[1].setMute(true);
  //     }
  //   }
  // }

  /* Non-command centric messages */

  /* Werewolf Phase */
  if (phase === 0 & !werewolvesNotified & playing) {
    //Reset this value
    morningNotified = false;

    //Message the channel
    messageMainChannel(`**Everyone**, pretend you're closing your eyes and slapping a bag of soil to cover up any noise.\nThe **night** is upon us and the werewolves are about to choose their first target. :fork_and_knife:\n*We're hoping it's not you too!*`);

    //Message the Werwolves
    messageWereWolves(`You are a werewolf :wolf: :full_moon:! Get ready to **!kill** some b- ... uh.. I mean villagers.`);
    var msg1 = `Here's the wolf pack tonight:`;
    for (let i = 0; i < numWerewolves; i++) {
      msg1 = msg1.concat(`\nWerewolf ${i + 1}. ${(await client.users.fetch(players[werewolves[i]])).username}`)
    }
    messageWereWolves(msg1);

    //Message the kill list
    var msg2 = `Okay, let's get to the fun part. **!kill**-ing. Type **!kill** # for the player ya want to slaughter.`
    
    for (let i = 0; i < numPlayers; i++) {
      if (!werewolves.includes(i)) {
        msg2 = msg2.concat(`\nPlayer ${i + 1}. ${(await client.users.fetch(players[i])).username}`)
      }
    }
    messageWereWolves(msg2)
    playersWhoVotedToKill = [];
    werewolvesNotified = true;
  }

  if (phase === 0 & werewolvesNotified & playing) {
    if (command === "kill") {

      //Only message if it's a dm channel
      if (message.channel.type == "dm") {

        //If not a werwolf yeet em outta this logic
        if (!werewolves.includes(players.indexOf(message.author.id))) {
          return; //Not a werwolf
        }

        //If voted already, yeet
        if(playersWhoVotedToKill.includes(message.author.id)){
          message.channel.send(`Ya voted already d00d.`);
        }

        //Try/Catch since args could be bad
        try {
          if (!werewolves.includes(args-1)) {
            console.log(`id: ${players.indexOf(message.author.id)} selected ${players[args-1]} to be sent to killFolks command`);
            killFolks(players.indexOf(message.author.id), args-1);
            playersWhoVotedToKill.push(message.author.id);
            message.channel.send(`You set out to try to kill ${(await client.users.fetch(players[args-1])).username} tonight. Let's see how it goes!`);
          }
          else {
            message.channel.send(`yo ${args} is a werewolf, not a villager. Try again;`);
          }
        }
        catch(e){
          message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
          console.log(e);
        }
      }
      else {
        messageMainChannel(`Yo ${message.author}, you tryna out yourself or? This is a *DM only* command.`);
      }
    }
  }

  if (phase === 1 & !seerNotified & playing) {
    console.log(`Seer message entered!`);
    //Reset this value
    werewolvesNotified = false;

    //Message the seer
    var msg = `You are the Seer :eye: :see_no_evil:! **!inspect** from the following contestants:`
    for (let i = 0; i < numPlayers; i++) {
      msg = msg.concat(`\n${i + 1}. ${(await client.users.fetch(players[i])).username}`)
    }
    messageUser(players[seer], msg);
    seerNotified = true;
  }

  if (phase === 1 & seerNotified & playing) {
    if (command === "inspect") {
      if (message.channel.type == "dm") {
        console.log(`Inspect entered!`);
        //Are they seer or are they naught
        if (players.indexOf(message.author.id) != seer) {
          console.log(`Not the seer! ${message.author.id}`);
          return; //not a seer
        }

        //try/catch cuz args
        try {
          if (seer != args-1) {
            if (players[args - 1] != 'undefined') {
              var whatAreThey = inspectaDeck(seer, args-1);
              var theyAre;
              console.log(`Entering switch case with argument ${whatAreThey}`)
              switch (whatAreThey) {
                case 0:
                  theyAre = `Werewolf`;
                  break;

                case 1:
                  theyAre = `Doctor`;
                  break;

                case 2:
                  theyAre = `Villager`;
                  break;
              }
              console.log(`The response is ${theyAre}`);
              message.channel.send(`Looks like the person you are inspecting is a ... ${theyAre}!`);
            }
            else {
              message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
            }
          }
          else {
            message.channel.send(`Why you tryna inspect yourself? To each their own?`);
          }
        }
        catch{
          message.channel.send(`It looks like your argument was invalid, please select a # from the list above.`);
        }
      }
      else {
        messageMainChannel(`Yo ${message.author}, you tryna out yourself or? This is a *DM only* command.`);
      }
    }
  }

  if (phase === 2 & !doctorNotified & playing) {
    //Reset this value
    seerNotified = false;

    //Message the doctor
    var msg = `You are the doctor :heart: :cross:! Who do you want to **!heal** (it can even be yourself :wink:):`;
    for (let i = 0; i < numPlayers; i++) {
      msg = msg.concat(`\n${i + 1}. ${(await client.users.fetch(players[i])).username}`);
    }
    messageUser(players[doctor], msg);
    doctorNotified = true;
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
          if (players[args-1] != 'undefined') {
            heal(args-1);
            message.channel.send(`You set out to heal ${(await client.users.fetch(healingId)).username} tonight, let's see how it goes!`);
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

  if (phase === 3 & !morningNotified & playing) {
    //Reset this value
    doctorNotified = false;

    //Alert the masses who dieddd
    var nameOfKilled = (await client.users.fetch(dyingId)).username;
    console.log(`morning phase, dying is ${nameOfKilled}`);
    messageMainChannel(`Everybody... **WAKE UP!**.\n${nameOfKilled} was *mutilated* in their sleep! :scream:`);
    if (dyingId == players[healing]) {
      messageMainChannel(`... but luckily the doctor patched em up, so no life lost!`);
    }

    //Alert if werewolves win
    if (numWerewolves >= (numPlayers - numWerewolves)) {
      messageMainChannel(`Well everyone, you tried your best, but it just wasn't good enough. Werewolves win...`);
      endGame();
      return;
    }

    //okay if werewolves didn't win lets talk about lynching
    var msg1 = `Talk amongst yourselves and try to figure out **who** among you is not who they say!\n If you think you know who is a werewolf, you may vote to kill a player from the list below by typing **!vote** ***x***:\n`;
    for (let i = 0; i < numPlayers; i++) {
      msg1 = msg1.concat(`\n ${i + 1}. ${(await client.users.fetch(players[i])).username}`);
    }
    msg1 = msg1.concat(`\n`);
    msg1 = msg1.concat(`\n`);
    msg1 = msg1.concat(`If you aren't sure who could be a filthy, no good, two-timing werewolf, ${(await client.users.fetch(players[0])).username} can type !sleep to move to night time.`)
    messageMainChannel(msg1);

    //Morning notification complete
    morningNotified = true;

    //Reset this array
    playersWhoVoted = [];
  }

  if (phase === 3 & playing & morningNotified & mainChannelId === message.channel.id) {
    if (command === "vote") {
      if(players.includes(message.author.id)){
        if (!playersWhoVoted.includes(message.author.id)) {
          if (players[args-1] != 'undefined') {
            messageMainChannel(`${message.author} has voted to lynch ${(await client.users.fetch(players[args-1])).username}! That's ${voted} out of ${players.length}`);
            playersWhoVoted.push[message.author.id];
            var sacrificeTime = vote(args - 1);
            if (sacrificeTime != null) {
              console.log(`entering sacrifice time`);
              if (sacrificeTime === -1) {
                messageMainChannel(`Looks like nobody dies today... let's see how that plays out..`);
              }
              if (sacrificeTime === true) {
                //messageMainChannel(`Looks like ${(await client.users.fetch(dyingId)).username} was a werewolf! Nice!`);
                messageMainChannel(`Looks like the lynched was a no good werewolf! Good job villagers!!\n`);
              }
              //end game state
              if (sacrificeTime === 1) {
                messageMainChannel(`Well everyone, you tried your best, but it just wasn't good enough.\n\n\n **Werewolves** win... :wolf::wolf::wolf:`);
                resetVars();
              }
              //end game state
              else if (sacrificeTime === 2) {
                messageMainChannel(`Suck it werewolves!\n**Villagers** win! :person_tipping_hand:`);
                resetVars();
              }
            }
          }
        }
        else {
          messageMainChannel(`Hey ${message.author} you already voted!`);
        }
      }
    }
    if (command === "sleep" & players.indexOf(message.author.id) === 0) {
      skipDay();
    }
  }

  function messageWereWolves(message) {
    for (let i = 0; i < numWerewolves; i++) {
      messageUser(players[werewolves[i]], message);
    }
  }

  function messageUser(userId, message) {
    client.users.fetch(userId).then(user => { user.send(message) });
  }

  function messageMainChannel(message) {
    client.channels.fetch(mainChannelId).then(channel => { channel.send(message) });
  }

  function messageChannelAndReturn(message) {
    message.channel.send(message);
    return;
  }

  // function returnPlayers(){
  //   var playersReturn;
  //   for(let i = 0; i < players.length; i++){
  //     playersReturn = playersReturn.concat(`Index ${i}. ${(await client.users.fetch(players[i])).username}\n`);
  //   }
  //   return playersReturn;
  // }
  

});

var seerNotified = false;
var doctorNotified = false;
var werewolvesNotified = false;
var morningNotified = false;
var playersWhoVoted = [];
var playersWhoVotedToKill = [];

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
var dyingId = null;
var healing = null;
var killedId;

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
  dyingId = null;
  healing = null;
  healingId = null;
  phase = 0;
};

function addPlayer(id) {
  if (numPlayers >= maxPlayers) {
    console.log("Error: Too many players.");
    return null;
  }
  if (players.includes(id))
    return null;
  players[numPlayers] = id;
  numPlayers++;
  console.log(id + " has ***joined***.");
  console.log("That makes " + numPlayers + " players.\n\n")
  return numPlayers;
};

function removePlayer(name) {
  if (numPlayers <= 0) {
    console.log("Error: There ain't no GD players.");
    return;
  }
  // if (name == players[0]) {
  //   console.log("Error: How you gon' play with no leader, blood?");
  //   return;
  // }
  var tempPlayers = [];
  var found = false;
  for (var i = 0; i < numPlayers; i++) {
    if (found) {
      tempPlayers[i - 1] = players[i];
      if (seer != null) {
        if (i == seer)
          seer = i - 1;
        else if (i == doctor)
          doctor = i - 1;
        else {
          for (var j = 0; j < numWerewolves; j++) {
            if (werewolves[j] == i)
              werewolves[j] = i - 1;
          }
        }
      }
    }
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
    console.log("Error: You're already creating a new game, shithead.");
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

function killFolks(player, target) {
  // console.log(`player ${player} and target ${target}`);
  // var found = false;
  // for (var i = 0; i < numWerewolves; i++) {
  //   if (werewolves[i] == player) {
  //     found = true;
  //     break;
  //   }
  // }
  // if (!found) {
  //   console.log("Error: You ain't no wulf.");
  //   return;
  // }
  // /*if (whoVoted[player] == true) {
  //   console.log("Error: You no good, lilly-livered, dog-trash, sister-fucking, foul-smelling piece of shit. You already voted.");
  //   return;
  // }*/
  votes[voted] = target;
  voted++;
  if (voted == numWerewolves) {
    console.log(`going to sacrifice function..`);
    return (sacrifice());
  }
  console.log(`returning null`);
  return null;
};

function sacrifice() {
  var pickedPlayers = [];
  var pickedTimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
        if (pickedPlayers[j] == votes[i]) {
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
      var who2pick = Math.floor(Math.random() * 2);
      if (who2pick == 0) {
        highestVotes = pickedTimes[i];
        highestPlayer = i;
      }
    }
  }
  votes = [];
  voted = 0;
  dying = pickedPlayers[highestPlayer];
  dyingId = players[dying];
  phase++;
  console.log(`dying is ${dying}`);
  return pickedPlayers[highestPlayer];
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
  return whatThey;
};

function heal(target) {
  healing = target;
  healingId = players[healing];
  if (healing != dying){
    removePlayer(players[dying]);
  }
  phase++;
};

function vote(target) {
  votes[voted] = target;
  voted++;
  if (voted == numPlayers) {
    return (sacrificeIITurboHDRemix());
  }
  return null;
};

function sacrificeIITurboHDRemix() {
  var pickedPlayers = [];
  var pickedTimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
        if (pickedPlayers[j] == votes[i]) {
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
      var who2pick = Math.floor(Math.random() * 2);
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
    dyingId = null;
    healing = null;
    phase = 0;
    return -1;
  }

  //This only happens if there's no tie
  dying = pickedPlayers[highestPlayer];
  console.log(`Players[dying] = ${players[dying]}`);
  dyingId = players[dying];
  console.log(`Dying ID: ${dyingId}`);
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
    return 1;
  }
  else if (numWerewolves == 0) {
    console.log("Fuck you, werewolves!!!!!\n**Villagers win!**");
    endGame();
    return 2;
  }

  votes = [];
  voted = 0;
  dying = null;
  healing = null;
  phase = 0;
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
};

function endGame() {
  preparing = false;
  playing = false;
};

function testGame() {
  newGame("P McGee");
  for (var i = 0; i < 7; i++) {
    addPlayer("P " + (i + 2));
  }
};