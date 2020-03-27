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
	console.log("Player " + num + " played gold.");
  };

  this.playSilver = function() {
    this.silver--;
    this.addTokenClass("silver");
    this.display();
	console.log("Player " + num + " played silver.");
  };

  this.playBronze = function() {
    this.bronze--;
    this.addTokenClass("bronze");
    this.display();
	console.log("Player " + num + " played bronze.");
  };

  this.playPlain = function() {
    this.plain--;
    this.addTokenClass("plain");
    this.display();
	console.log("Player " + num + " played plain.");
  };

  this.playDefender = function(tileNum) {
    this.defender--;
    this.addTokenClass("defender");

    // note that the surrounding tiles are now defended
    let surSpaces = getSurroundingSpaces(tileNum);
    for (i = 0; i < surSpaces.length; i++) {
      $("#" + surSpaces[i]).addClass("defendedbyplayer" + this.num.toString());
    }

    this.display();
	console.log("Player " + num + " played defender.");
  };

  this.playBomb = function(tileNum) {
    this.bomb--;

    let opponent = Math.abs(num - 1).toString();

    // destroy the surrounding vulnerable tiles (they no longer count as points, image removed, classes removed)
    let surSpaces = getSurroundingSpaces(tileNum);
    for (i = 0; i < surSpaces.length; i++) {
      // if it has the opponent's token that isn't defended
      if (
        $("#" + surSpaces[i]).hasClass("player" + opponent) &&
        !$("#" + surSpaces[i]).hasClass("defendedbyplayer" + opponent)
      ) {
		  // destroy it
		  this.destroyToken(surSpaces[i], opponent);
      }
    }

    this.display();
	console.log("Player " + num + " played bomb.");
  };
  
  // making this a separate function because it will be used by question tiles
  this.destroyToken = function(tileNum, player) {
	    console.log("Destroying token of player " + player + " on tile #" + tileNum + ".");
		
		// give it a second to work
		setTimeout(destroyEverything, 750);
		
		function destroyEverything() {
			// remove the player class and image
			$("#" + tileNum).removeClass("player" + player);
			$("#" + tileNum + " img:last-child").remove();

			// remove the bronze/silver/gold class
			if ($("#" + tileNum).hasClass("gold")) {
			  $("#" + tileNum).removeClass("gold");
			} else if ($("#" + tileNum).hasClass("silver")) {
			  $("#" + tileNum).removeClass("silver");
			} else if ($("#" + tileNum).hasClass("bronze")) {
			  $("#" + tileNum).removeClass("bronze");
			}

			// put the number back in the space if unoccupied
			if (!$("#" + tileNum).hasClass("filled")) {
			  $("#" + tileNum).text(tileNum);
			}
		}
  }

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
      tile.addClass("player" + this.num + "defender");
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
  
  this.addGold = function() {
	  this.gold++;
	  this.display();
  }
  
  this.addSilver = function() {
	  this.silver++;
	  this.display();
  }
  
  this.addBronze = function() {
	  this.bronze++;
	  this.display();
  }
  
  this.addDefender = function() {
	  this.defender++;
	  this.display();
  }
  
  this.loseBomb = function() {
	  this.bomb--;
	  this.display();
  }
}

// the NumberBag object will keep track of the numbers that are drawn
function NumberBag() {
  let numberBag = [];
  let previousNumber = -1;
  let currentNumber = -1;

  // fill up the number bag array
  this.fillBag = function() {
    for (let i = 0; i < 100; i++) {
      numberBag.push(i);
    }
    console.log("Filled bag with " + numberBag.length + " numbers.");
  };

  this.randomize = function() {
    // take the highlight away from the previous number
    if ($("#" + previousNumber).hasClass("current")) {
      $("#" + previousNumber).removeClass("current");
    }
	
	// remove highlights if needed
	if (highlighted.length > 0) {
		this.removeHighlights();
	}
	
	// remove question tile if needed
	if ($("#" + previousNumber).hasClass("question")) {
		let questionId = getQuestionId(previousNumber);
		$("#" + previousNumber).removeAttr("style");
		$("#" + previousNumber).removeClass("filled");
		$("#" + previousNumber).removeClass("question");
		$("#" + previousNumber).removeClass("q" + questionId);
		$("#" + previousNumber).addClass("free");
		$("#" + previousNumber).text(previousNumber.toString());
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
    if (numberBag.length == 0) {
      return true;
    } else {
      return false;
    }
  };

  this.getCurrent = function() {
    return currentNumber;
  };
  
  // remove all highlights and set the highlighted array back to empty
  this.removeHighlights = function() {
	 for (let i = 0; i < highlighted.length; i++) {
		let highlightedTile = $("#" + highlighted[i]);
		highlightedTile.removeClass("highlight");
	 }
	 highlighted.length = 0;
  }
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
// we need to declare tileNum as global so that the player can play a bomb or defender later
// and the program knows what to destroy or defend
let tileNum;

// start the user's turn when "Draw a Number" is clicked
$("#pickNumber").click(function() {
  $("#pickNumber").hide();
  
  // hide the extra defender button if needed
  if (!$("#playDefenderRule3").css("display", "none")) {
	  $("#playDefenderRule3").hide();
  }
  
  // draw a random number
  tileNum = drawNumber();
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
	// IMPORTANT: keeps the players alernating (IF NOT DOUBLE TURN)
	playerNum = (playerNum + 1) % 2;
	

  // return a random number
  let rand = bag.randomize();
  
  console.log("Player " + playerNum + " just drew tile " + rand +".");

  // just console.log
  //let whoseTurn;
  //playerNum == 0 ? (whoseTurn = "Liz") : (whoseTurn = "Robot");
  //console.log(`${whoseTurn} random number is: ${rand}`);

  return rand;
}


function takeTurn(rand) {
	let questionId = getQuestionId(rand);
	
	// if it's a question, handle specially
	if (questionId > 0) {
		handleQuestion(rand, questionId);
	}
	// if it's anything else, resume gameplay as normal
	else {
		// determine if it's the user or computer playing
	  if (playerNum == 0) {
		$("#turnDisplay").text("You drew " + rand + ". What would you like to do?");
		displayTurnChoices();
	  } else {
		$("#turnChoices").hide();
		$("#turnDisplay").text("Robot drew " + rand + ".");
		calculateRobotChoice(rand);
		endCompTurn();
	  }
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

// display the appropriate choices based on token inventory
function displayTurnChoicesRule2() {
  // originally show everything
  $("#turnChoices").show();
  $("#playGold").show();
  $("#playSilver").show();
  $("#playBronze").show();

  // hide unnecessary buttons
  $("#turnText").hide();
  $("#doNothing").hide();
  $("#playDefender").hide();
  $("#playBomb").hide();
  $("#playPlain").hide();
  
  // only display coin if user has it
  if (players[playerNum].gold == 0) {
    $("#playGold").hide();
  }
  if (players[playerNum].silver == 0) {
    $("#playSilver").hide();
  }
  if (players[playerNum].bronze == 0) {
    $("#playBronze").hide();
  }
  
  // only display the relevant higher coin
  if ($("#" + rule2Choice).hasClass("silver")) {
	$("#playSilver").hide();
	$("#playBronze").hide();
  } else if ($("#" + rule2Choice).hasClass("bronze")) {
	$("#playBronze").hide();
  }
  
}

// user choices (for usual turns)
$("#doNothing").click(function() {
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
});
$("#playGold").click(function() {
	// take into account question 2
	if (rule2Choice < 0) {
		players[playerNum].playGold();
	} else {
		handleRule2("gold", 0);
	}
	
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}

});
$("#playSilver").click(function() {
	// take into account question 2
	if (rule2Choice < 0) {
		players[playerNum].playSilver();
	} else {
		handleRule2("silver", 0);
	}
  
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}	
});
$("#playBronze").click(function() {
	// take into account question 2
	if (rule2Choice < 0) {
		players[playerNum].playBronze();
	} else {
		handleRule2("bronze", 0);
	}
	
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
});
$("#playPlain").click(function() {
  players[playerNum].playPlain();
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
});
$("#playDefender").click(function() {
  players[playerNum].playDefender(tileNum); 
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
});
$("#playBomb").click(function() {
  players[playerNum].playBomb(tileNum);
	if (!extraTurn) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
});

// special case for question 2
function handleRule2(type, playerNum) {
	// find what token was originally on the space and return it to the user's possession (need to add addBronze)
	console.log("rule2Choice is " + rule2Choice);
	if ($("#" + rule2Choice).hasClass("silver")) {
		players[playerNum].addSilver();
	} else if ($("#" + rule2Choice).hasClass("bronze")) {
		players[playerNum].addBronze();
	}
	
	// remove from inventory like usual
	if (type == "gold") {
		players[playerNum].gold--;
	} else if (type == "silver") {
		players[playerNum].silver--;
	} else if (type == "bronze") {
		players[playerNum].bronze--;
	}
	
	// add the new tile (adapted from addTokenClass) by removing previous image and adding new
	// note what token it is and what player played it
    let tile = $("#" + rule2Choice);
      tile.empty();
      tile.addClass(type);

    // add the relevant picture to the board
    tile.append(
      "<img src='images/tokens/" +
        type +
        "0.png' alt='token' style='width:20px;height:20px;'>"
    );
	
	players[playerNum].display();
	
	// reset so that program doesn't think we're still handling rule 2
	rule2Choice = -1;
	$("#continue").hide();
}

// special case for question 3
$("#playDefenderRule3").click(function() {
  players[0].playDefender(tileNum);
  $("#playDefenderRule3").hide();
  $("#turnDisplay").text("You played a Defender. Click below to continue with your next turn.");
});

// this function prompts the user to draw another number,
// ensures the player is still the user, and then starts
// the user's second turn
function takeExtraTurn() {
    $('#turnDisplay').text("Click below to take your second turn.");
	$("#turnChoices").hide();
    playerNum++;
	extraTurn = false;
	endCompTurn();
}

// this is shown during certain questions
$("#continue").click(function() {
	$("#continue").hide();
	endHumanTurn();
});

// when the user clicks this, the tokens are destroyed and the user can continue playing
$("#seeChanges").click(function() {
	destroy();
	$("#seeChanges").hide();
	if (playerNum == 0) {
		$("#continue").show();
	} else {
		$("#pickNumber").show();
	}
});
	 
// do the destroying where needed
function destroy() {
	for (let i = 0; i < highlighted.length; i++) {
		let nearbyTile = $("#" + highlighted[i]);
		if (nearbyTile.hasClass("player0") && !(nearbyTile.hasClass("defendedbyplayer0"))) {
			players[0].destroyToken(highlighted[i], 0);
		} else if (nearbyTile.hasClass("player1") && !(nearbyTile.hasClass("defendedbyplayer1"))) {
			players[1].destroyToken(highlighted[i], 1);
		}
	}
}

/******************************************* ROBOT TURN *******************************************/

let isFirstMove = true;
let robotChoices = [];

function calculateRobotChoice(tileNum) {
  // determine which spaces are around the drawn tile
  let surSpaces = getSurroundingSpaces(tileNum);
  //console.log(surSpaces);

  // find out how many animal figure points are around
  // (I made this a separate function because it's used in question 3)
  let animalTiles = countPotentialNearbyAnimals(surSpaces);
  
  // find out how many animal figures and player points are around
  let playerPoints = 0;

  for (i = 0; i < surSpaces.length; i++) {
    // only count player's points if they are undefended
    if (
      $("#" + surSpaces[i]).hasClass("player0") &&
      !$("#" + surSpaces[i]).hasClass("defendedbyplayer0")
    ) {
      if ($("#" + surSpaces[i]).hasClass("gold")) {
        playerPoints += 6;
      } else if ($("#" + surSpaces[i]).hasClass("silver")) {
        playerPoints += 4;
      } else if ($("#" + surSpaces[i]).hasClass("bronze")) {
        playerPoints += 2;
      } else {
        playerPoints++;
      }
    }
  }

  // if there are a significant number of animal tiles around that aren't the opponent's,
  // then place a defender if you have one
  if (players[1].defender > 0 && animalTiles >= 13) {
    players[1].playDefender(tileNum);
	$("#turnDisplay").append(" It played a Defender token.");
  }
  // if there are at least 5 opponent points around, then play a bomb if you have one
  else if (players[1].defender > 0 && playerPoints >= 5) {
    players[1].playBomb(tileNum);
	$("#turnDisplay").append(" It played a Bomb token and destroyed your surrounding tiles!");
  }
  // if it's an unclaimed animal space, find the best token to place
  else if ($("#" + tileNum).hasClass("animal")) {
		let tokenPlayed = findBestToken(tileNum);
		switch(tokenPlayed) {
		case "gold coin":
			players[1].playGold();
			break;
		case "silver coin":
			players[1].playSilver();
			break;
		case "bronze coin":
			players[1].playBronze();
			break;
		case "plain token":
			players[1].playPlain();
			break;
	}
	  
	  $("#turnDisplay").append(" It played a " + tokenPlayed + ".");
  } else {
	  $("#turnDisplay").append(" It chose to do nothing.");
  }

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
  }
  */
}

// turning this into a separate function so questions can use it
function findBestToken(tile) {
	// find the animal size
	let animalSize = "";
	if ($("#" + tile).hasClass("xs")) {
		animalSize = "xs";
	} else if ($("#" + tile).hasClass("sm")) {
		animalSize = "sm";
	} else if ($("#" + tile).hasClass("m")) {
		animalSize = "m";
	} else if ($("#" + tile).hasClass("l")) {
		animalSize = "l";
	} else if ($("#" + tile).hasClass("xl")) {
		animalSize = "xl";
	}
	
	// find how many points are on the animal figure
	let animalId = getAnimalId(tile);
	let compPoints = checkAnimalPoints(animalId, 0);
	let playerPoints = checkAnimalPoints(animalId, 1);
	
	/*
	console.log("id is " + animalId);
	console.log("size is " + animalSize);
	console.log("compPoints is " + compPoints);
	console.log("playerPoints is " + playerPoints);
	*/
	
	// determine if the computer is winning
	let compWinning;
	if (compPoints >= playerPoints) {
		compWinning = true;
	} else {
		compWinning = false;
	}
	
	// determine if the score is close on that particular animal
	let closeScore;
	if (Math.abs(compPoints - playerPoints) >= 3) {
		closeScore = true;
	} else {
		closeScore = false;
	}
	
	/*
	console.log("compWinning is " + compWinning);
	console.log("closeScore is " + closeScore);
	*/
	
	let defended = false;
	if ($("#" + tile).hasClass("defendedbyplayer1")) {
		defended = true;
	}
	// logic for maximum token to play
	// TO DO: maybe add defendedbyplayer1 to logic?
	let choice;
	switch(animalSize) {
		case "xs":
			choice = playMax("plain");
			break;
		case "sm":
			if (defended) {
				choice = playMax("bronze");
			} else {
				choice = playMax("plain");
			}
			break;
		case "m":
			if (defended) {
				choice = playMax("silver");
			} else {
				choice = playMax("bronze");
			}
			break;
		case "l":
		case "xl":
			if (defended) {
				choice = playMax("gold");
			} else {
				if (closeScore && !compWinning) {
					choice = playMax("silver");
				} else if (closeScore && compWinning) {
					choice = playMax("bronze");
				} else {
					choice = playMax("plain");
				}
			}
			break;
	}
	
	return choice;
}

function countPotentialNearbyAnimals(surSpaces) {
	// find out how many animal figures and player points are around
  let animalTiles = 0;

  for (i = 0; i < surSpaces.length; i++) {
    // only count animal figures if empty there and it isn't already defended
    if (
      $("#" + surSpaces[i]).hasClass("animal") &&
      !$("#" + surSpaces[i]).hasClass("player0") &&
      !$("#" + surSpaces[i]).hasClass("player1") &&
      !$("#" + surSpaces[i]).hasClass("player0defender") &&
      !$("#" + surSpaces[i]).hasClass("defendedbyplayer1")
    ) {
      // this if/else gives the animals different weights based on the animal size
      if ($("#" + surSpaces[i]).hasClass("xs")) {
        animalTiles++;
      } else if ($("#" + surSpaces[i]).hasClass("sm")) {
        animalTiles += 2;
      } else if ($("#" + surSpaces[i]).hasClass("m")) {
        animalTiles += 3;
      } else if ($("#" + surSpaces[i]).hasClass("l")) {
        animalTiles += 4;
      } else if ($("#" + surSpaces[i]).hasClass("xl")) {
        animalTiles += 5;
      }
    }
  }
  
  return animalTiles;
}

// this just returns the id of the animal in the current space
function getAnimalId(tileNum) {
	
	if ($("#" + tileNum).hasClass("a1")) {
		return 1;
	} else if ($("#" + tileNum).hasClass("a2")) {
		return 2;
	} else if ($("#" + tileNum).hasClass("a3")) {
		return 3;
	} else if ($("#" + tileNum).hasClass("a4")) {
		return 4;
	} else if ($("#" + tileNum).hasClass("a5")) {
		return 5;
	} else if ($("#" + tileNum).hasClass("a6")) {
		return 6;
	} else if ($("#" + tileNum).hasClass("a7")) {
		return 7;
	} else if ($("#" + tileNum).hasClass("a8")) {
		return 8;
	} else if ($("#" + tileNum).hasClass("a9")) {
		return 9;
	} else if ($("#" + tileNum).hasClass("a10")) {
		return 10;
	} else if ($("#" + tileNum).hasClass("a11")) {
		return 11;
	} else if ($("#" + tileNum).hasClass("a12")) {
		return 12;
	} else if ($("#" + tileNum).hasClass("a13")) {
		return 13;
	} else if ($("#" + tileNum).hasClass("a14")) {
		return 14;
	} else if ($("#" + tileNum).hasClass("a15")) {
		return 15;
	} else {
		return 0;
	}
}

// this determines the points on the given animal for a certain player
function checkAnimalPoints(animalId, playerId) {
  let playerPoints = 0;
  let animalSquares = [];

	// find all the spaces where the player has tokens on that specific animal
  for (var i = 0; i < 100; i++) {
    if ($("#" + i).hasClass("a" + animalId) && $("#" + i).hasClass("player" + playerId)) {
      animalSquares.push(i);
    }
  }

  for (var i = 0; i < animalSquares.length; i++) {
    if ($("#" + animalSquares[i]).hasClass("gold")) {
      playerPoints += 6;
    } else if ($("#" + animalSquares[i]).hasClass("silver")) {
      playerPoints += 4;
    } else if ($("#" + animalSquares[i]).hasClass("bronze")) {
      playerPoints += 2;
    } else {
      playerPoints++;
    }
  }

	//console.log("points on animal " + animalId + " for player " + playerId + " is " + playerPoints + ".");
  return playerPoints;
}

// this is used by the computer to play a maximum number
// of points depending on what tokens are left
function playMax(tokenName) {
	
	let choice = "";
	
	// determine what tokens the computer has
	let hasGold = false;
	let hasSilver = false;
	let hasBronze = false;
	if (players[1].gold > 0) {
		hasGold = true;
	}
	if (players[1].silver > 0) {
		hasSilver = true
	}
	if (players[1].bronze > 0) {
		hasBronze = true;
	}
	
	switch(tokenName) {
		case "gold":
			if (hasGold) {
				choice = "gold coin";
			} else if (hasSilver) {
				choice = "silver coin";
			} else if (hasBronze) {
				choice = "bronze coin";
			} else {
				choice = "plain token";
			}
			break;
		case "silver":
			if (hasSilver) {
				choice = "silver coin";
			} else if (hasBronze) {
				choice = "bronze coin";
			} else {
				choice = "plain token";
			}
			break;
		case "bronze":
			if (hasBronze) {
				choice = "bronze coin";
			} else {
				choice = "plain token";
			}
			break;
		case "plain":
			choice = "plain token";
			break;
	}
	
	return choice;
}

// this returns an array with all the numbers of the surrounding spaces for each drawn number
function getSurroundingSpaces(num) {
  let surSpaces = [];

  switch (num) {
    case 0:
      surSpaces = [1, 10, 11];
      break;
    case 9:
      surSpaces = [8, 18, 19];
      break;
    case 90:
      surSpaces = [80, 81, 91];
      break;
    case 99:
      surSpaces = [88, 89, 98];
      break;
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      surSpaces = [num - 1, num + 1, num + 9, num + 10, num + 11];
      break;
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 97:
    case 98:
      surSpaces = [num - 1, num + 1, num - 9, num - 10, num - 11];
      break;
    case 10:
    case 20:
    case 30:
    case 40:
    case 50:
    case 60:
    case 70:
    case 80:
      surSpaces = [num - 10, num + 10, num - 9, num + 1, num + 11];
      break;
    case 19:
    case 29:
    case 39:
    case 49:
    case 59:
    case 69:
    case 79:
    case 89:
      surSpaces = [num - 10, num + 10, num + 9, num - 1, num - 11];
      break;
    default:
      surSpaces = [
        num - 10,
        num + 10,
        num - 9,
        num + 9,
        num - 11,
        num + 11,
        num - 1,
        num + 1
      ];
  }

  surSpaces.sort();
  return surSpaces;
}

// start the robot's turn
function endHumanTurn() {
	// if there are still numbers, comp takes turn
	if (!bag.checkIfEnd()) {
		let tileNum = drawNumber();
		takeTurn(tileNum);
	} else {
		alert("Game over!");
		countFinalScore();
	}
}

function endCompTurn() {	
	// if there are still numbers, human takes turn
	if (!bag.checkIfEnd()) {
		$("#pickNumber").show();
	} else {
		alert("Game over!");
		countFinalScore();
	}
}

// calculate the final score
function countFinalScore() {
	let playerPoints = 0;
	let compPoints = 0;
	let animalsWonByPlayer = [];
	let animalsWonByComp = [];
	
	// this loops through each animal and counts up who won each
	for (var i = 1; i <= 15; i++) {
		playerPoints = checkAnimalPoints(i, 0);
		compPoints = checkAnimalPoints(i, 1);
		
		if (playerPoints > compPoints) {
			animalsWonByPlayer.push(i);
		} else if (compPoints > playerPoints) {
			animalsWonByComp.push(i);
		}
		
		//reset the points because we're moving to the next animal
		playerPoints = 0;
		compPoints = 0;
	}
	
	console.log("The player won the following animals:");
	console.log(animalsWonByPlayer);
	console.log("The computer won the following animals:");
	console.log(animalsWonByComp);

	let playerFinalScore = 0;
	let compFinalScore = 0;
	// count the points for each animal won by player and comp
	if (animalsWonByPlayer.length > 0) {
		for (var i = 0; i < animalsWonByPlayer.length; i++) {
			playerFinalScore += calculateAnimalScore(animalsWonByPlayer[i]);
		}
	}
	
	if (animalsWonByComp.length > 0) {
		for (var i = 0; i < animalsWonByComp.length; i++) {
			compFinalScore += calculateAnimalScore(animalsWonByComp[i]);
		}
	}
	
	// implement the rule that unused bombs count as 10 points each
	playerFinalScore += (players[0].bomb * 10);
	compFinalScore += (players[1].bomb * 10);
	
	console.log("Player's final score is " + playerFinalScore);
	console.log("Comp's final score is " + compFinalScore);
}

function calculateAnimalScore(animalId) {
	switch(animalId) {
		case 1:
			return 60;
			break;
		case 2:
		case 3:
			return 50;
			break;
		case 4:
		case 5:
		case 6:
			return 40;
			break;
		case 7:
		case 8:
		case 9:
		case 10:
			return 30;
			break;
		case 11:
		case 12:
		case 13:
		case 14:
		case 15:
			return 20;
			break;
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
    //$("#setBoard").prop("disabled", true);
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
	
	// find the tg style class to return it after removing other classes
	var classList = $(tile).attr('class').split(/\s+/);
	
    if (tile.hasClass("filled")) {
		// remove all classes and styles
		tile.removeClass();
		tile.removeAttr("style");
		
		// add the classes and text that were originally there
		tile.addClass("free");
		tile.addClass(classList[0]);
		tile.text(i);
	}
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

    // check if all needed spaces are free for one specific animal
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
    // sort the animal's tile numbers from least to greatest
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
	  
	  // we have to add a before the id so that ids don't overlap
      tile.addClass("a" + id.toString());

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
      tile.addClass("q" + 2);

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
  let player = new Player(0, "Liz", 2, 5, 8, 50, 5, 5);
  let comp = new Player(1, "Robot", 2, 5, 8, 50, 5, 5);
  players.push(player);
  players.push(comp);


  console.log(
    `${players[0].name} {id:${players[0].num}, gold:${players[0].gold}, silver:${players[0].silver}, bronze:${players[0].bronze}, plain:${players[0].plain}, defender:${players[0].defender}, bomb:${players[0].bomb}}`
  );
  console.log(
    `${players[1].name} {id:${players[1].num}, gold:${players[1].gold}, silver:${players[1].silver}, bronze:${players[1].bronze}, plain:${players[1].plain}, defender:${players[1].defender}, bomb:${players[1].bomb}}`
  );
}

/******************************************* TWENTY QUESTIONS *******************************************/
/************************* COMPLETED: 1, 2, 3, 4, 5, 12, 13, 15, 17, 18, 20 *****************************/
/*********************************** TO DO: 6, 7, 8, 9, 10, 11, 14, 16, 19 ******************************/
/************** change line 1143 to make all cards a single question (good for testing) *****************/

// return question number if question, or 0 if not
function getQuestionId(tileNum) {
	if ($("#" + tileNum).hasClass("q1")) {
		return 1;
	} else if ($("#" + tileNum).hasClass("q2")) {
		return 2;
	} else if ($("#" + tileNum).hasClass("q3")) {
		return 3;
	} else if ($("#" + tileNum).hasClass("q4")) {
		return 4;
	} else if ($("#" + tileNum).hasClass("q5")) {
		return 5;
	} else if ($("#" + tileNum).hasClass("q6")) {
		return 6;
	} else if ($("#" + tileNum).hasClass("q7")) {
		return 7;
	} else if ($("#" + tileNum).hasClass("q8")) {
		return 8;
	} else if ($("#" + tileNum).hasClass("q9")) {
		return 9;
	} else if ($("#" + tileNum).hasClass("q10")) {
		return 10;
	} else if ($("#" + tileNum).hasClass("q11")) {
		return 11;
	} else if ($("#" + tileNum).hasClass("q12")) {
		return 12;
	} else if ($("#" + tileNum).hasClass("q13")) {
		return 13;
	} else if ($("#" + tileNum).hasClass("q14")) {
		return 14;
	} else if ($("#" + tileNum).hasClass("q15")) {
		return 15;
	} else if ($("#" + tileNum).hasClass("q16")) {
		return 16;
	} else if ($("#" + tileNum).hasClass("q17")) {
		return 17;
	} else if ($("#" + tileNum).hasClass("q18")) {
		return 18;
	} else if ($("#" + tileNum).hasClass("q19")) {
		return 19;
	} else if ($("#" + tileNum).hasClass("q20")) {
		return 20;
	} else {
		return 0;
	}
}

function handleQuestion(tileNum, id) {
	switch (id) {
		case 1: q1(tileNum); break;
		case 2: q2(tileNum); break;
		case 3: q3(tileNum); break;
		case 4: q4(tileNum); break;
		case 5: q5(tileNum); break;
		case 6: q6(tileNum); break;
		case 7: q7(tileNum); break;
		case 8: q8(tileNum); break;
		case 9: q9(tileNum); break;
		case 10: q10(tileNum); break;
		case 11: q11(tileNum); break;
		case 12: q12(tileNum); break;
		case 13: q13(tileNum); break;
		case 14: q14(tileNum); break;
		case 15: q15(tileNum); break;
		case 16: q16(tileNum); break;
		case 17: q17(tileNum); break;
		case 18: q18(tileNum); break;
		case 19: q19(tileNum); break;
		case 20: q20(tileNum); break;
	}
}

// important variable for highlighting and then removing highlights later
let highlighted = [];
let ruleForClicking = 0;

function q1(tileNum) {
	let qText = "An epidemic has struck! All tokens (both yours and others players') are destroyed in the two spaces to the left and the two spaces to the right of the question tile if not protected by defenders."; 
	console.log(qText);
	
	// determine which tiles are relevant
	highlighted.push(tileNum - 2);
	highlighted.push(tileNum - 1);
	highlighted.push(tileNum + 1);
	highlighted.push(tileNum + 2);
	
	// only count the tiles if they are in the same row as the question tile, then highlight them
	let row = Math.floor(tileNum / 10);
	for (let i = 0; i < highlighted.length; i++) {
		
		// determine the row of the nearby tile
		let tileRow;
		if (highlighted[i] == 0) {
			tileRow = 0;
		} else {
			tileRow = Math.floor(highlighted[i] / 10);
		}
		
		// if it's not in the same row as the current tile, remove it from the array
		if (tileRow != row) {
			highlighted.splice(i, 1);
			i--;
		} else {
			let nearbyTile = $("#" + highlighted[i]);
			nearbyTile.addClass("highlight");
		}
		
	}
	
	// check if there will be tiles destroyed (any token not defended by its player)
	let boardChanged = false;
	for (let i = 0; i < highlighted.length; i++) {
		let nearbyTile = $("#" + highlighted[i]);
		if (nearbyTile.hasClass("player0") && !(nearbyTile.hasClass("defendedbyplayer0"))) {
			boardChanged = true;
		} else if (nearbyTile.hasClass("player1") && !(nearbyTile.hasClass("defendedbyplayer1"))) {
			boardChanged = true;
		}
	}
	
	let msg;
	// show the user what is happening, prompt them to view the changes if there are any
	 if (playerNum == 0) {
		msg = "<p>You drew Question A at tile " + tileNum + ":</p><p>" + qText + "</p>";
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click to continue.</p>";
			$("#continue").show();
		}
	 }
	 // if it's the robot turn, still explain what is happening, prompt user to view changes
	 else {
		$("#turnChoices").hide();
		
		msg = "<p>Robot drew Question A at tile " + tileNum + ":</p><p>" + qText + "</p>";
		
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click to continue.</p>";
			$("#continue").hide();
			$("#pickNumber").show();
		}
	 }
	 
	 $("#turnDisplay").html(msg);
}

function q2(tileNum) {
	let qText = "B. The animal population is growing! You may increase the value of any one of your tokens on the gameboard by replacing it with a higher-valued coin if you have one. If you already had a bronze or silver coin in that space, return it to your possession.";
	console.log(qText);
	
	let msg;
	// FOR USER
	if (playerNum == 0) {
		msg = "<p>You drew Question B at tile " + tileNum + ":</p><p>" + qText + "</p>";
		
		// create array of all user tokens that are single, bronze, or silver and highlight them
		// determine what tokens the player has
		let hasGold = false;
		let hasSilver = false;
		let hasBronze = false;
		if (players[0].gold > 0) {
			hasGold = true;
		}
		if (players[0].silver > 0) {
			hasSilver = true
		}
		if (players[0].bronze > 0) {
			hasBronze = true;
		}
	
		for (var i = 0; i < 100; i++) {
			if ($("#" + i).hasClass("player0")) {
				// don't count gold ones
				if (!$("#" + i).hasClass("gold")) {
					// only count if you have a higher coin to replace it with
					if (($("#" + i).hasClass("silver") && hasGold)
						|| ($("#" + i).hasClass("bronze") && (hasGold || hasSilver))
						|| ($("#" + i).hasClass("plain") && (hasGold || hasSilver || hasBronze))) {
						highlighted.push(i);
						$("#" + i).addClass("highlight");
					}
				}
			}
		}
		
		// if there are no valid tiles
		if (highlighted.length === 0) {
			msg += "<p>You have no valued tokens that can be increased in value. Click below to continue with Robot's turn.</p>"
			$("#turnDisplay").html(msg);
		}
		// if there is at least one valid tile option
		else {
			// prompt the user to click on one of these highlighted spaces, or to continue without doing anything
			msg += "<p>Please select which token you want to increase the value of, or click continue if you don't want to select anything.</p>";
			ruleForClicking = 2;
			
			// this then jumps to the end of the code, search for: if (ruleForClicking == 2)
		}
		$("#continue").show();
	}
	// FOR COMP
	else {
		$("#turnChoices").hide();
		msg = "<p>Robot drew Question B at tile " + tileNum + ":</p><p>" + qText + "</p>";
		
		// create array of all user tokens that are single, bronze, or silver and highlight them
		// determine what tokens the player has
		let hasGold = false;
		let hasSilver = false;
		let hasBronze = false;
		if (players[1].gold > 0) {
			hasGold = true;
		}
		if (players[1].silver > 0) {
			hasSilver = true
		}
		if (players[1].bronze > 0) {
			hasBronze = true;
		}
	
		for (let i = 0; i < 100; i++) {
			if ($("#" + i).hasClass("player1")) {
				// don't count gold ones
				if (!$("#" + i).hasClass("gold")) {
					// only count if you have a higher coin to replace it with
					if (($("#" + i).hasClass("silver") && hasGold)
						|| ($("#" + i).hasClass("bronze") && (hasGold || hasSilver))
						|| ($("#" + i).hasClass("plain") && (hasGold || hasSilver || hasBronze))) {
						highlighted.push(i);
					}
				}
			}
		}
		console.log(highlighted);
		
		// if there are no valid tiles
		if (highlighted.length === 0) {
			msg += "<p>The Robot has no valued tokens that can be increased in value. Click below to continue with your turn.</p>"
			$("#pickNumber").show();
		}
		// if there is at least one valid tile option
		else {
			let idList = [];
			// find largest animal (smallest ID)
			for (let i = 0; i < highlighted.length; i++) {
				let animalId = getAnimalId(highlighted[i]);
				idList.push(animalId);
			}
			
			var lowestIdIndex = 0;
			for (var i = 1; i < idList.length; i++) {
				if (idList[i] < idList[lowestIdIndex]) lowestIdIndex = i;
			}
			console.log("lowest ID index is " + lowestIdIndex);
			
			// select token on highest animal, take note of what token it is
			let chosenTile = highlighted[lowestIdIndex]
			
			let originalPoints;
			if ($("#" + chosenTile).hasClass("silver")) {
				originalPoints = 4;
			} else if ($("#" + chosenTile).hasClass("bronze")) {
				originalPoints = 2;
			} else if ($("#" + chosenTile).hasClass("plain")) {
				originalPoints = 1;
			}
			
			// determine what the ideal choice would be for this space
			let newCoin = findBestToken(chosenTile);
			let newCoinPoints;
			let coinName;
			switch(newCoin) {
				case "gold coin":
					newCoinPoints = 6;
					coinName = "gold";
					break;
				case "silver coin":
					newCoinPoints = 4;
					coinName = "silver";
					break;
				case "bronze coin":
					newCoinPoints = 2;
					coinName = "bronze";
					break;
				case "plain token":
					newCoinPoints = 1;
					coinName = "plain";
					break;
			}
			
			// if it's worth changing, change it
			if (newCoinPoints > originalPoints) {
				console.log("need to replace");
				rule2Choice = chosenTile;
				handleRule2(coinName, 1);
			}
			
			// otherwise, move on without doing anything
			else {
				msg += "<p>The Robot chose to do nothing. Click below to continue with your turn.</p>"
			}
						
			$("#pickNumber").show();
		}
	}
	
	$("#turnDisplay").html(msg);
}

function q3(tileNum) {
	let qText = "The government has funded another animal reserve for your opponent. The next player has won a defender token and may place it in the current space or keep it for later.";
	console.log(qText);
	
	let msg;
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>You drew Question C at tile " + tileNum + ":</p><p>" + qText + "</p>";
		players[1].addDefender();
		
		// decide if comp wants to use defender
		let surSpaces = getSurroundingSpaces(tileNum);
		let animalTiles = countPotentialNearbyAnimals(surSpaces);
		
		if (players[1].defender > 0 && animalTiles >= 13) {
			players[1].playDefender(tileNum);
			msg += "<p>It played a Defender token. Click below to continue.</p>";
		} else {
			msg += "<p>It decided not to play the Defender here. Click below to continue.</p>";
		}
		
		$("#continue").show();
	} else {
		msg = "<p>Robot drew Question C at tile " + tileNum + ":</p><p>" + qText + "</p><p>What would you like to do?</p>";
		players[0].addDefender();
		$("#turnChoices").hide();
		
		// give the user the choice to play a defender or continue with their turn
		$("#playDefenderRule3").show();
		$("#pickNumber").show();
	}
	
	$("#turnDisplay").html(msg);
}

function q4(tileNum) {
	let qText = "Congratulations! You have won a gold coin from an anonymous donor. Now you can you can save more animals!";
	console.log(qText);
	
	let msg;
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>You drew Question D at tile " + tileNum + ":</p><p>" + qText + "</p><p>Click to continue.</p>";
		players[0].addGold();
		$("#continue").show();
	} else {
		msg = "<p>Robot drew Question D at tile " + tileNum + ":</p><p>" + qText + "</p><p>Click to continue.</p>";
		players[1].addGold();
		$("#turnChoices").hide();
		$("#pickNumber").show();
	}
	
	$("#turnDisplay").html(msg);
}

function q5(tileNum) {
	let qText = "A wealthy family has transferred money to your opponent's endangered animal fund. The next player has won a silver coin!";
	console.log(qText);
	
	let msg;
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>You drew Question E at tile " + tileNum + ":</p><p>" + qText + "</p><p>Click to continue.</p>";
		players[1].addSilver();
		$("#continue").show();
	} else {
		msg = "<p>Robot drew Question E at tile " + tileNum + ":</p><p>" + qText + "</p><p>Click to continue.</p>";
		players[0].addSilver();
		$("#turnChoices").hide();
		$("#pickNumber").show();
	}
	
	$("#turnDisplay").html(msg);
}

function q6(tileNum) {
	let qText = "F. Congratulations! You've won a free round-trip flight. Travel to any space on the gameboard that isn't occupied and place any token (except a bomb).";
	console.log(qText);
	
	// FOR USER
		// loop through all spaces, create array of all unoccupied spaces and highlight them
	
		// prompt the user to click on one of these highlighted spaces
	
		// ask the user what they want to do on this space, or invite them to choose a different space
	
		// do the appropriate action
	
	
	// FOR COMP
		// loop through all spaces, create an array of all defended spots that have animals on them
	
		// if there are defended spots, find the best animal and call calculateRobotChoice
	
		// if there aren't defended spots and the comp has a defender, play it in the place with the most animal spaces around
	
			// loop through the board (except for questions), for each space determine how many surrounding animal spaces there are
	
			// wherever there are the greatest points, place the defender
	
}

function q7(tileNum) {
	let qText = "G. A government leader has issued your opponent a private jet and has asked you to assist them. Place one of the next player's single tokens (worth 1 point) on any animal figure on the board that isn't occupied.";
	console.log(qText);
	
	// create an array of unoccupied animal figures
	
	// FOR USER
		// highlight the array
		
		// prompt the user to click on one of these highlighted spaces
	
		// ask the user to confirm that space, or invite them to choose a different space
	
		// do the appropriate action
	
	// FOR COMP
		
		// for each animal in the array, determine the player's score, comp's score
		
		// if the player is winning by a lot, place it there
		
		// else if the comp is winning by a lot, place it there
		
		// else choose randomly
		
}

function q8(tileNum) {
	let qText = "H. A one-month expedition of your organization was successful. You may place any valued token on any animal in this row if the space is not occupied.";
	console.log(qText);
	
	// create an array of unoccupied animal figures in the current row
	
	// FOR USER
		// if there is an array, highlight them and prompt the user to pick one or do nothing
		
		// if not, inform the user and prompt them to continue with the robot's turn
		
	// FOR COMP		
		// if there is an array, pick one at random and call calculateRobotChoice
		
		// if not, inform the user and prompt them to continue with their turn
		
}

function q9(tileNum) {
	let qText = "I. This space can't be occupied because of hazardous waste. Move two spaces up or down. You may place any token (including a bomb) in one of these spaces. If another player's token is already there and not protected by a defender, you may replace it with your own token of any value.";
	console.log(qText);
	
	// (see questions 10 and 16 for similar logic)
	
	// create an array of all 3 spaces
	
	// FOR USER
		// highlight the relevant spaces
		
		// prompt the user to click on one of these highlighted spaces or do nothing
	
		// ask the user to confirm that space, or invite them to choose a different space
	
		// do the appropriate action, destroying the comp token in the process if needed
	
	// FOR COMP
		// find the biggest animal in the possible spaces
		
		// if there's no animal, decide what to do in the current space
		
		// if there's an animal, call calculateRobotChoice on the best space, destroying the user token in the process if needed
		
}

function q10(tileNum) {
	let qText = "J. You're feeling adventurous! Move three spaces up or down. If not occupied, you may place any token (including a bomb) in one of these spaces. If occupied, you may place any token in the original space.";
	console.log(qText);
	
	// (see question 16 for similar logic)
	
	// create an array of the 3 possible spaces
	
	// FOR USER
		// highlight the relevant spaces
		
		// prompt the user to click on one of these highlighted spaces or do nothing
	
		// ask the user to confirm that space, or invite them to choose a different space
	
		// do the appropriate action
	
	// FOR COMP
		// find the biggest animal in the possible spaces
		
		// if there's no animal, decide what to do in the current space
		
		// if there's an animal, call calculateRobotChoice on the best space
		
}

function q11(tileNum) {
	let qText = "K. You have been granted unlimited authority in this area. You may place any token (except a bomb) on any space in the current column. If another person's token is occupying the space you'd like (and it isn't protected by a defender) you may discard that token and place your own instead.";
	console.log(qText);
	
	// create an array of unoccupied animal figures in the current column
	
	// FOR USER		
		// if there is an array, highlight them and prompt the user to pick one or do nothing
		
		// if not, inform the user and prompt them to continue with the robot's turn
		
	// FOR COMP
		
		// if there is an array, pick one at random and call calculateRobotChoice
		
		// if not, inform the user and prompt them to continue with their turn
		
}

let extraTurn = false;
function q12(tileNum) {
	let qText = "All the members of your team have suddenly become ill, so you've lost your next turn.";
	console.log(qText);
	
	let msg;
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>You drew Question L at tile " + tileNum + ":</p><p>" + qText + "</p><p id='robotTurnMsg'>Click below to have the robot take its first turn.</p><button type='button' id='compFirstTurn'>Continue</button>";
	} else {
		extraTurn = true;
		$("#turnChoices").hide();
		msg = "<p>Robot drew Question L at tile " + tileNum + ":</p><p>" + qText + "</p><p>You will now have two turns in a row.</p>";
		$("#pickNumber").show();
	}
	
	$("#turnDisplay").html(msg);
	
	// when the user clicks continue, the computer takes its turn, then the user is prompted to have the comp take its second turn
	$("body").on("click", "#compFirstTurn", function() {
		console.log("compFirstTurn");
		endHumanTurn();
		$("#pickNumber").hide();
		$('#turnDisplay').append("<p>Click below to have the robot take its second turn.</p><button type='button' id='compSecondTurn'>Continue</button>");
	});

	// when the user clicks to have comp take second turn, this makes sure the player
	// stays as comp and then comp takes its turn
	$("body").on("click", "#compSecondTurn", function() {
		playerNum++;
		console.log("compSecondTurn");
		endHumanTurn();
	});

}

function q13(tileNum) {
	let qText = "M. Poachers have attacked! All tokens (both yours and others players') are destroyed in the two spaces above and the two spaces below the question tile if not protected by defenders.";
	console.log(qText);

	// (see question 1 for similar logic)

	// determine which tiles are relevant
	highlighted.push(tileNum - 20);
	highlighted.push(tileNum - 10);
	highlighted.push(tileNum + 10);
	highlighted.push(tileNum + 20);
	
	// only count the tiles if they exist, then highlight them
	for (let i = 0; i < highlighted.length; i++) {		
		// if it's not in the same column as the current tile, remove it from the array
		if (highlighted[i] < 0 || highlighted[i] > 99) {
			highlighted.splice(i, 1);
			i--;
		} else {
			let nearbyTile = $("#" + highlighted[i]);
			nearbyTile.addClass("highlight");
		}
		
	}
	
	// check if there will be tiles destroyed (any token not defended by its player)
	let boardChanged = false;
	for (let i = 0; i < highlighted.length; i++) {
		let nearbyTile = $("#" + highlighted[i]);
		if (nearbyTile.hasClass("player0") && !(nearbyTile.hasClass("defendedbyplayer0"))) {
			boardChanged = true;
		} else if (nearbyTile.hasClass("player1") && !(nearbyTile.hasClass("defendedbyplayer1"))) {
			boardChanged = true;
		}
	}
	
	let msg;
	// show the user what is happening, prompt them to view the changes if there are any
	 if (playerNum == 0) {
		msg = "<p>You drew Question M at tile " + tileNum + ":</p><p>" + qText + "</p>";
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click to continue.</p>";
			$("#continue").show();
		}
	 }
	 // if it's the robot turn, still explain what is happening, prompt user to view changes
	 else {
		$("#turnChoices").hide();
		
		msg = "<p>Robot drew Question M at tile " + tileNum + ":</p><p>" + qText + "</p>";
		
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click to continue.</p>";
			$("#continue").hide();
			$("#pickNumber").show();
		}
	 }
	 
	 $("#turnDisplay").html(msg);	 
}

function q14(tileNum) {
	let qText = "N. Your team has discovered valuable information about how to help the animals in this area. You may place any token (except a bomb) in any space surrounding the current question tile.";
	console.log(qText);
	
	// create array of surrounding spaces that are not occupied
	
	// FOR USER
		// if there are spaces, highlight them and prompt the user to pick one or do nothing, then do the action
		
		// if not, tell the user and prompt them to move on
		
	// FOR COMP
		// if there are spaces, find largest animal and call calculateRobotChoice
		
		// if not, tell the user and prompt them to move on
		
}

function q15(tileNum) {
	let qText = "Your opponent's team has become stranded in the wilderness, so the next player loses their next turn.";
	console.log(qText);
	
	let msg;
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "You drew Question O at tile " + tileNum + ":</p><p>" + qText + "</p><p>Click below to take another turn.</p>";
		$("#pickNumber").show();
	} else {
		$("#turnChoices").hide();
		$("#pickNumber").hide();
		msg = "Robot drew Question O at tile " + tileNum + ":</p><p>" + qText + "</p><p>Click below to have the Robot take another turn.</p><button type='button' id='compTurnAgain'>Continue</button>";
	}
	
	$("#turnDisplay").html(msg);
	
	// this will alternate the player
	playerNum++;
	
	$("body").on("click", "#compTurnAgain", function() {
		endHumanTurn();
	});
	
}

function q16(tileNum) {
	let qText = "P. Volunteers have arrived to help you further your mission. Move three spaces to the right or to the left. If not occupied, you may place any token (including a bomb) in one of these spaces. If occupied, you may place any token in the original space.";
	console.log(qText);
	
	// (see question 10 for similar logic)
	
	// create an array of the 3 possible spaces
	
	// FOR USER
		// highlight the relevant spaces
		
		// prompt the user to click on one of these highlighted spaces or do nothing
	
		// ask the user to confirm that space, or invite them to choose a different space
	
		// do the appropriate action
	
	// FOR COMP
		// find the biggest animal in the possible spaces
		
		// if there's no animal, decide what to do in the current space
		
		// if there's an animal, call calculateRobotChoice on the best space
		
}

function q17(tileNum) {
	let qText = "Q. A pack of wolves has attacked some of the bison. You must remove a valued token from the bison figure if you have one placed there that isn't protected by a defender.";
	console.log(qText);
	
	destroyTokenOnAnimal("a2", "bison", "Q", tileNum, qText);
}

function q18(tileNum) {
	let qText = "R. Hunters seeking ivory have entered the elephants' territory. You must remove a valued token from the elephant figure if you have one placed there that isn't protected by a defender.";
	console.log(qText);
	
	destroyTokenOnAnimal("a1", "elephant", "R", tileNum, qText);
}

// this applies to questions 17 and 18
function destroyTokenOnAnimal(animalId, animalName, questionLetter, tileNum, qText) {
	let undefendedPlayer = [];
	let undefendedComp = [];
	
	// create two arrays of all elephant tokens that aren't defended
	for (var i = 0; i < 100; i++) {
		if ($("#" + i).hasClass(animalId)) {
			// for the player
			if ($("#" + i).hasClass("player0") && !($("#" + i).hasClass("defendedbyplayer0"))) {
				undefendedPlayer.push(i);
			} 
			// for the comp
			else if ($("#" + i).hasClass("player1") && !$("#" + i).hasClass("defendedbyplayer1")) {
				undefendedComp.push(i);
			}
		}
	}	
	
	let msg;
	// FOR USER
	if (playerNum === 0) {		
		msg = "You drew Question " + questionLetter + " at tile " + tileNum + ":</p><p>" + qText + "</p>";
		
		// if there are undefended tokens, highlight them
		if (undefendedPlayer.length > 0) {
			highlighted = undefendedPlayer.slice();
			for (let i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).addClass("highlight");
			}
			
			// prompt the user to pick one, the rest of the logic is at the end of this file
			msg += "<p>Please select which token you want to remove.</p>";
			ruleForClicking = 18;
		}			
		// if there aren't, inform user and prompt them to move on
		else {
			msg += "<p>You have no undefended tokens on the " + animalName + ". Click to continue.</p>";
			
			$("#continue").show();
		}
	}
	// FOR COMP
	else {
		msg = "Robot drew Question " + questionLetter + " at tile " + tileNum + ":</p><p>" + qText + "</p>";
		
		// if there are undefended tokens, find the lowest value and call destroyToken, prompt user to move on
		let choice;
		let numPlain = [];
		let numBronze = [];
		let numSilver = [];
		let numGold = [];
		
		if (undefendedComp.length > 0) {			
			for (let i = 0; i < undefendedComp.length; i++) {
				let tileWithToken = $("#" + undefendedComp[i]);
				if (tileWithToken.hasClass("plain")) {
					numPlain.push(undefendedComp[i]);
				} else if (tileWithToken.hasClass("bronze")) {
					numBronze.push(undefendedComp[i]);
				} else if (tileWithToken.hasClass("silver")) {
					numSilver.push(undefendedComp[i]);
				} else if (tileWithToken.hasClass("gold")) {
					numGold.push(undefendedComp[i]);
				}
			}
			
			if (numPlain.length > 0) {
				choice = numPlain[0];
			} else if (numBronze.length > 0) {
				choice = numBronze[0];
			} else if (numSilver.length > 0) {
				choice = numSilver[0];
			} else {
				choice = numGold[0];
			}
		
			msg += "<p>Robot has removed a token from tile " + choice + ". Click below to continue with your turn.</p>";
			players[1].destroyToken(choice, 1);
			
		}
		else {
			// if there aren't, inform user and prompt them to move on
			msg += "<p>Robot has no undefended tokens on the " + animalName + ". Click below to continue with your turn.</p>";
		}
		$("#turnChoices").hide();
		$("#pickNumber").show();
	}
	
	$("#turnDisplay").html(msg);
}

function q19(tileNum) {
	let qText = "S. Your opponent keeps getting one step ahead of you! The next player may place any token (except a bomb) in any space surrounding the current question tile.";
	console.log(qText);
	
	// (see question 14 for similar logic, just opposite)
	
	// create array of surrounding spaces that are not occupied
	
	// FOR USER
		// if there are spaces, find largest animal and call calculateRobotChoice
		
		// if not, tell the user and prompt them to move on
		
	// FOR COMP
		// if there are spaces, highlight them and prompt the user to pick one or do nothing, then do the action
		
		// if not, tell the user and prompt them to move on
	
}

function q20(tileNum) {
	let qText = "T. Your opponent has made the decision to cooperate more with other wildlife organizations. The next player discards one of their bombs if they have one. ";
	console.log(qText);
	
	let msg;
	// FOR USER
	if (playerNum === 0) {
		msg = "You drew Question T at tile " + tileNum + ":</p><p>" + qText + "</p>";
		// if comp has a bomb, discard it
		if (players[1].bomb > 0) {
			msg += "<p>The Robot has discarded a bomb.</p><p>Click to continue.</p>";
			players[1].loseBomb();
		} else {
			msg += "<p>The Robot didn't have any bombs, so nothing was discarded.</p><p>Click to continue.</p>";	
		}
		$("#continue").show();
	}
	// FOR COMP
	else {
		msg = "The Robot drew Question T at tile " + tileNum + ":</p><p>" + qText + "</p>";
		if (players[0].bomb > 0) {
			msg += "<p>One of your bombs has been discarded.</p><p>Click to continue with your turn.</p>";
			players[0].loseBomb();
		} else {
			msg += "<p>You didn't have any bombs, so nothing was discarded.</p><p>Click to continue with your turn.</p>";	
		}
		$("#turnChoices").hide();
		$("#pickNumber").show();
	}
	
	$("#turnDisplay").html(msg);
}

let rule2Choice = -1;
// handle the user's choice for when something needs to be selected
$("body").on("click", ".highlight", function() {
	let msg;
	if (ruleForClicking == 2) {
		rule2Choice = this.id;
		// ask the user what they want to do on this space, or invite them to choose a different space
		msg = "<p>You have chosen tile number " + this.id + ". Select which coin you'd like on this tile instead, or select a different one. Or click continue to not select anything.</p>";
		$("#turnDisplay").html(msg);
		displayTurnChoicesRule2();
		// after the user selects a button, it goes to the function handleRule2()
	}
	else if (ruleForClicking == 18) {
		msg = "<p>You have chosen tile number " + this.id + ". Click below to remove this token, or select a different one.</p><button id='removeToken' onclick='removeToken(" + this.id + ")'>Remove Token</button>";
		$("#turnDisplay").html(msg);
	}
});

function removeToken(tileNum) {
	console.log("destroying token on tile " + tileNum);
	players[0].destroyToken(tileNum, 0);
	
	$("#removeToken").hide();
	$("#continue").show();
	$("#turnDisplay").append("<p>Your token has been removed. Click below to continue.</p>");
}