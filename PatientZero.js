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
    if (numPlayers >= maxPlayers) {
        console.log("Error: Too many players.");
        return;
    }
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

function playGame() {
    if (!playing) {
        console.log("Error: There ain't be no game to be played 'round 'ere.");
        return;
    }
    if (preparing) {
        console.log("Error: You want to play before you start? Do you also put your car into drive before you turn the key?? Fucking weirdo.");
        return;
    }
    switch (phase) {
        // Werewolf Phase
        case 0:
            
            console.log ("Everyone, pretend you're closing your eyes and slapping a bag of soil to cover up any noise.\nThe night is upon us and the werewolves are about to choose their first target.\n *We're hoping it's not you too!*");
            if (numWerewolves == 2) {
                var msg1 = players[werewolves[0]] + ": " + players[werewolves[1]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
                var msg2 = players[werewolves[1]] + ": " + players[werewolves[0]] + " is your fellow werewolf. Message them to discuss who to kill tonight and then reply with !kill *X*\nLook at the table below to find the appropriate *X* value for your victim.\n```\n";
                for (var i = 0; i < numPlayers; i++) {
                    if (i < 10) 
                        msg1 += i + "       - " + players[i] + "\n";
                    else 
                        msg1 += i + "      - " + players[i] + "\n";
                }
                msg1 += "```";
                msg2 += "```";
                console.log(msg1);
                console.log(msg2);
            }
            break;        
        case 1:

        case 2:

    }
};

function testGame() {
    newGame("P McGee");
    for (var i = 0; i < 7; i++) {
        addPlayer("P " + (i + 2));
    }
};
