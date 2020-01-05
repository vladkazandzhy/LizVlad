// the Player object will keep track of tokens and points
function Player(num, name, gold, silver, bronze, plain, defender, bomb) {
  this.num = num;
  this.name = name;
  this.gold = gold;
  this.silver = silver;
  this.bronze = bronze;
  this.plain = plain;
  this.defender = defender;
  this.bomb = bomb;

  this.playGold = function() {
    this.gold--;
    this.addTokenClass("gold");
    this.display();
  };

  this.playSilver = function() {
    this.silver--;
    this.addTokenClass("silver");
    this.display();
  };

  this.playBronze = function() {
    this.bronze--;
    this.addTokenClass("bronze");
    this.display();
  };

  this.playPlain = function() {
    this.plain--;
    this.addTokenClass("plain");
    this.display();
  };

  this.playDefender = function(tileNum) {
    this.defender--;
    this.addTokenClass("defender");
	
	// note that the surrounding tiles are now defended
	let surSpaces = getSurroundingSpaces(tileNum);
	for (i = 0; i < surSpaces.length; i++) {
		$("#" + surSpaces[i]).addClass("defendedByPlayer" + this.num.toString());
	}
	
    this.display();
  };

  this.playBomb = function(tileNum) {
    this.bomb--;
	
	let opponent = Math.abs(num - 1).toString();
	console.log("opponent is " + opponent);
	
	// destroy the surrounding vulnerable tiles (they no longer count as points, image removed, classes removed)
	let surSpaces = getSurroundingSpaces(tileNum);
	for (i = 0; i < surSpaces.length; i++) {
		// if it has the opponent's token that isn't defended
		if ($("#" + surSpaces[i]).hasClass("player" + opponent) && !$("#" + surSpaces[i]).hasClass("defendedByPlayer" + opponent)) {
			// remove the player class and image
			$("#" + surSpaces[i]).removeClass("player" + opponent);
			$("#" + surSpaces[i] + " img:last-child").remove();
			
			// remove the bronze/silver/gold class
			if ($("#" + surSpaces[i]).hasClass("gold")) {
				$("#" + surSpaces[i]).removeClass("gold");
			} else if ($("#" + surSpaces[i]).hasClass("silver")) {
				$("#" + surSpaces[i]).removeClass("silver");
			} else if ($("#" + surSpaces[i]).hasClass("bronze")) {
				$("#" + surSpaces[i]).removeClass("bronze");
			}
			
			// put the number back in the space if unoccupied
			if (!$("#" + surSpaces[i]).hasClass("filled")) {
				$("#" + surSpaces[i]).text(surSpaces[i]);
			}
		}
	}
	
    this.display();
  };

  // display current statistics
  this.display = function() {
    let string = "<b><u>" + this.name + "</u></b><br>";
    string += "Gold x " + this.gold + "<br>";
    string += "Silver x " + this.silver + "<br>";
    string += "Bronze x " + this.bronze + "<br>";
    string += "Plain x " + this.plain + "<br>";
    string += "Defender x " + this.defender + "<br>";
    string += "Bomb x " + this.bomb + "<br><br>";

    $("#tokenDisplay" + this.num).html(string);
  };

  this.addTokenClass = function(type) {
    // note what token it is and what player played it
    let tile = $("#" + bag.getCurrent());
	
	// defenders don't have a separate "player0" or "player1" because that will be used to record points
	if (type == "defender") {
		tile.addClass("player" + this.num + "Defender");
	} else {
		tile.addClass(type);
		tile.addClass("player" + num);
	}

    // add the relevant picture to the board
    tile.text("");
    tile.append(
      "<img src='images/tokens/" +
        type +
        playerNum.toString() +
        ".png' alt='token' style='width:20px;height:20px;'>"
    );
  };
}

// the NumberBag object will keep track of the numbers that are drawn
function NumberBag() {
  let numberBag = [];
  let previousNumber = -1;
  let currentNumber = -1;

  // fill up the number bag array
  this.fillBag = function() {
    for (let i = 0; i < 10; i++) {
      numberBag.push(i);
    }
    console.log("Filled bag with " + numberBag.length + " numbers.");
  };

  this.randomize = function() {
    // take the highlight away from the previous number
    if ($("#" + previousNumber).hasClass("current")) {
      $("#" + previousNumber).removeClass("current");
    }

    // choose a random number from what's left in the number bag
    let randInt = Math.floor(Math.random() * numberBag.length);
    currentNumber = numberBag[randInt];

    // discard that random tile
    numberBag.splice(randInt, 1);

    // keep track of previous number to remove the highlight later
    previousNumber = currentNumber;

    // highlight the current tile in red
    let tile = $("#" + currentNumber);
    tile.addClass("current");

    return currentNumber;
  };

  this.checkIfEnd = function() {
    //console.log("Numbers left in the bag: " + numberBag);
	console.log("There are " + numberBag.length + " numbers left.");
    if (numberBag.length == 0) {
      return true;
    } else {
      return false;
    }
  };

  this.getCurrent = function() {
    return currentNumber;
  };
}

/*
const showModal = () => {
  let divEl = document.getElementsByClassName("modal");
  divEl[0].style.visibility = "visible";
  divEl[0].style.transform = "translate(0, 100px)";
  divEl[0].style.opasity = "1.0";
};

const closeModal = () => {
  let divEl = document.getElementsByClassName("modal");
  divEl[0].style.visibility = "hidden";
};

const showBackdrop = () => {
  let divEl = document.getElementsByClassName("backdrop");
  divEl[0].style.visibility = "visible";
};

const closeBackdrop = () => {
  let divEl = document.getElementsByClassName("backdrop");
  divEl[0].style.visibility = "hidden";
};
*/

/******************************************* USER TURN *******************************************/
let playerNum = 1;

// start the user's turn when "Draw a Number" is clicked
$("#pickNumber").click(function() {
  $("#pickNumber").hide();
  // draw a random number
  let tileNum = drawNumber();
  takeTurn(tileNum);

  /*
  if (bagOfQuestions.includes(tileNum)) {
    showModal();
    showBackdrop();

    $("#back").click(function() {
      closeModal();
      closeBackdrop();
    });

    $("#backdrop").click(function() {
      closeModal();
      closeBackdrop();
    });
  } else {
    // take a turn with that number
    takeTurn(tileNum);
  }
  */
});

// this function will be the same for both the user and computer
function drawNumber() {
  // IMPORTANT: keeps the players alernating
  playerNum = (playerNum + 1) % 2;

  // return a random number
  let rand = bag.randomize();

  // just console.log
  let whoseTurn;
  playerNum == 0 ? (whoseTurn = "Liz") : (whoseTurn = "Robot");
  console.log(`${whoseTurn} random number is: ${rand}`);

  return rand;
}

function takeTurn(rand) {
  // determine if it's the user or computer playing
  if (playerNum == 0) {
    $("#turnDisplay").text("You drew " + rand + ". What would you like to do?");
    displayTurnChoices();
  } else {
    $("#turnChoices").hide();
    $("#turnDisplay").text("Robot drew " + rand + ".");
    calculateRobotChoice(rand);
  }
}

// display the appropriate choices based on token inventory
function displayTurnChoices() {
  $("#turnChoices").show();

  if (players[playerNum].gold == 0) {
    $("#playGold").hide();
  }
  if (players[playerNum].silver == 0) {
    $("#playSilver").hide();
  }
  if (players[playerNum].bronze == 0) {
    $("#playBronze").hide();
  }
  if (players[playerNum].plain == 0) {
    $("#playPlain").hide();
  }
  if (players[playerNum].defender == 0) {
    $("#playDefender").hide();
  }
  if (players[playerNum].bomb == 0) {
    $("#playBomb").hide();
  }
}

// user choices
$("#doNothing").click(function() {
  endTurn();
});
$("#playGold").click(function() {
  players[playerNum].playGold();
  endTurn();
});
$("#playSilver").click(function() {
  players[playerNum].playSilver();
  endTurn();
});
$("#playBronze").click(function() {
  players[playerNum].playBronze();
  endTurn();
});
$("#playPlain").click(function() {
  players[playerNum].playPlain();
  endTurn();
});
$("#playDefender").click(function() {
  players[playerNum].playDefender();
  endTurn();
});
$("#playBomb").click(function() {
  players[playerNum].playBomb();
  endTurn();
});

/******************************************* ROBOT TURN *******************************************/

let isFirstMove = true;
let robotChoices = [];

function calculateRobotChoice(tileNum) {
	// determine which spaces are around the drawn tile
	let surSpaces = getSurroundingSpaces(tileNum);
	console.log(surSpaces);
	
	// find out how many animal figures and player points are around
	animalTiles = 0;
	playerPoints = 0;
	
	for (i = 0; i < surSpaces.length; i++) {
		// only count animal figures if the opponent doesn't have a token there and it isn't already defended
		if ($("#" + surSpaces[i]).hasClass("animal")
			&& !$("#" + surSpaces[i]).hasClass("player0")
			&& !$("#" + surSpaces[i]).hasClass("defendedByPlayer1")) {
			// this if/else gives the animals different weights based on size
			if ($("#" + surSpaces[i]).hasClass("xs")) {
				animalTiles++;
			} else if ($("#" + surSpaces[i]).hasClass("s")) {
				animalTiles += 2;
			} else if ($("#" + surSpaces[i]).hasClass("m")) {
				animalTiles += 3;
			} else if ($("#" + surSpaces[i]).hasClass("l")) {
				animalTiles += 4;
			} else if ($("#" + surSpaces[i]).hasClass("xl")) {
				animalTiles += 5;
			}
		}
		// only count player's points if they are undefended
		if ($("#" + surSpaces[i]).hasClass("player0") && !$("#" + surSpaces[i]).hasClass("defendedByPlayer0")) {
			playerPoints++;
		}
	}
	
	console.log("animalTiles is " + animalTiles);
	console.log("surrounding playerPoints is " + playerPoints);
	
	// if there are a significant number of animal tiles around that aren't the opponent's,
	// then place a defender
	if ((players[1].defender > 0) && (animalTiles >= 12)) {
		players[1].playDefender(tileNum);
	}
	// if there are at least 1 opponent points around, then play a bomb
	else if ((players[1].defender > 0) && (playerPoints >= 1)) {
		players[1].playBomb(tileNum);
	}
	
	/*
  if (isFirstMove) {
    robotChoices = [
      "doNothing",
      "gold",
      "silver",
      "bronze",
      "plain",
      "defender",
      "bomb"
    ];
    isFirstMove = false;
  }

  let randChoice = Math.floor(Math.random() * robotChoices.length);
  robotChoice = robotChoices[randChoice];

  if (bagOfQuestions.includes(tileNum)) {
    showModal();
    showBackdrop();

    $("#back").click(function() {
      closeModal();
      closeBackdrop();
    });

    $("#backdrop").click(function() {
      closeModal();
      closeBackdrop();
    });
  } else {
    if (robotChoice == "gold") {
      players[playerNum].playGold();
    } else if (robotChoice == "silver") {
      players[playerNum].playSilver();
    } else if (robotChoice == "bronze") {
      players[playerNum].playBronze();
    } else if (robotChoice == "plain") {
      players[playerNum].playPlain();
    } else if (robotChoice == "defender") {
      players[playerNum].playDefender();
    } else if (robotChoice == "bomb") {
      players[playerNum].playBomb();
    }
  }

  function deleteChoice(choice) {
    let i = robotChoices.indexOf(choice);
    // i == -1 - choice was deleted already
    if (i != -1) {
      robotChoices.splice(i, 1);
    }
  }

  if (players[playerNum].gold == 0) {
    deleteChoice("gold");
  }
  if (players[playerNum].silver == 0) {
    deleteChoice("silver");
  }
  if (players[playerNum].bronze == 0) {
    deleteChoice("bronze");
  }
  if (players[playerNum].plain == 0) {
    deleteChoice("plain");
  }
  if (players[playerNum].defender == 0) {
    deleteChoice("defender");
  }
  if (players[playerNum].bomb == 0) {
    deleteChoice("bomb");
  }

  console.log("Robot choice is: " + robotChoice);
  console.log("Length:" + robotChoices.length);
  console.log(robotChoices);
  */
}

// this returns an array with all the numbers of the surrounding spaces for each drawn number
function getSurroundingSpaces(num) {
	let surSpaces = [];
	
	switch(num) {
		case 0: surSpaces = [1, 10, 11];
		break;
		case 9: surSpaces = [8, 18, 19];
		break;
		case 90: surSpaces = [80, 81, 91];
		break;
		case 99: surSpaces = [88, 89, 98];
		break;
		case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8:
			surSpaces = [(num-1), (num+1), (num+9), (num+10), (num+11)];
		break;
		case 91: case 92: case 93: case 94: case 95: case 96: case 97: case 98:
			surSpaces = [(num-1), (num+1), (num-9), (num-10), (num-11)];
		break;
		case 10: case 20: case 30: case 40: case 50: case 60: case 70: case 80:
			surSpaces = [(num-10), (num+10), (num-9), (num+1), (num+11)];
		break;
		case 19: case 29: case 39: case 49: case 59: case 69: case 79: case 89:
			surSpaces = [(num-10), (num+10), (num+9), (num-1), (num-11)];
		break;
		default:
			surSpaces = [(num-10), (num+10), (num-9), (num+9), (num-11), (num+11), (num-1), (num+1)];
	}
	
	surSpaces.sort();
	return surSpaces;
}

// start the robot's turn
function endTurn() {
  if (!bag.checkIfEnd()) {
    let tileNum = drawNumber();
    takeTurn(tileNum);
  } else {
    alert("Game over!");
  }

  if (bag.checkIfEnd()) {
    alert("Game over!");
  } else {
    $("#pickNumber").show();
  }
}

/******************************************* BOARD SETUP *******************************************/

// set the board up initially
let boardSetUp = false;
let placementError = false;
$("#setBoard").click(function() {
  $("#startGame").prop("disabled", false);
  clearBoard();
  boardSetUp = false;
  placementError = false;
  while (boardSetUp == false) {
    setUpBoard();
    $("#setBoard").prop("disabled", true);
  }
});

// place all the animal figures and question tiles on the board
function setUpBoard() {
  // place 1 very large animal
  placeAnimal(4, 3, 1, "xl");
  // place 2 large animals
  for (let i = 2; i < 4; i++) {
    placeAnimal(4, 2, i, "l");
  }
  // place 3 medium animals
  for (let i = 4; i < 7; i++) {
    placeAnimal(3, 2, i, "m");
  }
  // place 4 small animals
  for (let i = 7; i < 11; i++) {
    placeAnimal(2, 2, i, "sm");
  }
  // place 4 very small animals
  for (let i = 11; i < 15; i++) {
    placeAnimal(2, 1, i, "xs");
  }
  // place 1 very small animals (lynx)
  placeAnimal(1, 2, 15, "xs");

  if (placementError) {
    clearBoard();
  } else {
    // place 20 question tiles
    for (let i = 1; i <= 20; i++) {
      placeQuestions(i);
    }

    // we can move on now that the board is properly set up
    boardSetUp = true;
  }
}

// properly clear the board to randomize again if user wants to
function clearBoard() {
  for (let i = 0; i < 100; i++) {
    let tile = $("#" + i);
    if (tile.hasClass("filled")) {
      tile.removeClass("filled");
      tile.addClass("free");
      tile.css("background-image", "none");

      // remove individual ids if there are any
      for (let j = 1; j < 16; j++) {
        if (tile.hasClass(j.toString())) {
          tile.removeClass(j.toString());
        }
      }
    }
    if (tile.hasClass("question")) {
      for (let j = 1; j < 21; j++) {
        if (tile.hasClass("q" + j.toString())) {
          tile.removeClass("q" + j.toString());
        }
      }
    }
    tile.text(i);
  }
}

// place an animal on the board based on its width and height (the third parameter is the animal's id)
function placeAnimal(w, h, id, animalType) {
  let tries = 0;
  let placed = false;
  while (!placed || tries > 10000) {
    // determine an initial candidate for the top left corner of the animal
    let rand = Math.floor(Math.random() * 100);

    // check if there's enough space to the right
    let col = rand % 10;
    if (10 - col >= w) {
      // because it fits, we just move on to check other conditions
    } else {
      // because it doesn't fit, we start over with another random number
      continue;
    }

    // check if there's enough space below
    let row = Math.floor(rand / 10);

    if (10 - row >= h) {
      // because it fits, we just move on to check other conditions
    } else {
      // because it doesn't fit, we start over with another random number
      continue;
    }

    // check if all needed spaces are free
    // create an array of needed spaces
    let animalTiles = [];
    let leftCorner = rand;
    let c = col;
    let r = row;
    let rightCol = c + w;
    let bottomRow = r + h;

    // make one exception for the vertical lynx
    if (id == 15) {
      animalTiles.push(leftCorner);
      animalTiles.push(leftCorner + 10);
    } else {
      for (; c < rightCol; c++) {
        let temp = leftCorner;
        for (; r < bottomRow; r++) {
          animalTiles.push(temp);
          temp = temp + 10;
        }
        leftCorner++;
        r = row;
      }
    }
    animalTiles.sort(function(a, b) {
      return a - b;
    });

    let spaceIsFilled = false;
    // check each space to see if it is free
    for (let i = 0; i < animalTiles.length; i++) {
      let tile = $("#" + animalTiles[i]);
      if (tile.hasClass("filled")) {
        spaceIsFilled = true;
        break;
      }
    }
    if (spaceIsFilled) {
      // because some space is filled, we start over with another random number
      continue;
    }

    // make all the tiles "filled" and add the animal's id and picture
    for (let i = 0; i < animalTiles.length; i++) {
      let tile = $("#" + animalTiles[i]);
      tile.removeClass("free");
      tile.addClass("filled");
	  tile.addClass("animal");
	  tile.addClass(animalType);
      tile.addClass(id.toString());

      let imageUrl = "images/" + id + "/" + (i + 1) + ".jpg";
      tile.css("background-image", "url(" + imageUrl + ")");
      tile.css("background-size", "32px 32px");

      // remove number
      tile.text("");
    }

    // break the while loop because we finally placed the animal
    placed = true;

    // this is to avoid an infinite loop
    tries++;
  }

  // start completely over if in danger of infinite loop
  if (!placed) {
    placementError = true;
    console.log("avoiding infinite loop");
  }
}

let bagOfQuestions = [];
// place the 20 question tiles in free places
function placeQuestions(id) {
  let placed = false;

  while (!placed) {
    // determine an initial candidate for the question
    let rand = Math.floor(Math.random() * 100);
    let tile = $("#" + rand);

    // if it's free, we make it filled and designate that it's a question
    if (tile.hasClass("free")) {
      tile.removeClass("free");
      tile.addClass("filled");
      tile.addClass("question");
      tile.addClass("q" + id);

      // remove number and add image
      tile.text("");
      tile.css("background-image", "url(images/questionTile.jpg)");
      tile.css("background-size", "32px 32px");

      // break the loop because we placed the question
      placed = true;

      bagOfQuestions.push(rand);
    }
  }
}

let bag;
// start the game by filling the numbers and tokens and displaying them
$("#startGame").click(function() {
  $("#setBoard").hide();
  $("#startGame").hide();
  $("#pickNumber").show();

  bag = new NumberBag();
  bag.fillBag();

  fillTokens();

  players[0].display();
  players[1].display();
});

// set up the number of tokens for the players
let players = [];
function fillTokens() {
  let player = new Player(0, "Liz", 2, 5, 8, 40, 5, 5);
  let comp = new Player(1, "Robot", 2, 5, 8, 40, 5, 5);
  players.push(player);
  players.push(comp);

  console.log("Filled tokens for each player.");

  console.log(
    `${players[0].name} {id:${players[0].num}, gold:${players[0].gold}, silver:${players[0].silver}, bronze:${players[0].bronze}, plain:${players[0].plain}, defender:${players[0].defender}, bomb:${players[0].bomb}}`
  );
  console.log(
    `${players[1].name} {id:${players[1].num}, gold:${players[1].gold}, silver:${players[1].silver}, bronze:${players[1].bronze}, plain:${players[1].plain}, defender:${players[1].defender}, bomb:${players[1].bomb}}`
  );
}
