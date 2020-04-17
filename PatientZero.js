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

function doctor(doctor, target) {
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
    resetVars();
};

function testGame() {
    newGame("P McGee");
    for (var i = 0; i < 7; i++) {
        addPlayer("P " + (i + 2));
    }
};
