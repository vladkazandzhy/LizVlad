$( function() {
    $("#results").tooltip({
		content: function () {
			return $( this ).prop( 'title' );
		}
	});
	$("#shortcutIcon").tooltip({
		content: function () {
			return $( this ).prop( 'title' );
		},
		tooltipClass: "custom-tooltip-styling"
	});
 } );

$('body').on('click', ".help-icon", function(e) {
	e.preventDefault();
});

$('body').on('click', "#shortcutIcon", function(e) {
	e.preventDefault();
});

let startTime, endTime, userEmail;
let trialVersion = true;
let robotName = "Robot";
$( document ).ready(function() {
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	if (isIE) {
		$("#intro").html("<h1>Welcome to Endangered World!</h1><p>Unfortunately, Endangered World is not available to play using Internet Explorer. For best results, please use <b>Chrome, Safari, or Firefox</b>.</p><p>For more information about the Endangered World board game, please visit our <a href='#'>Kickstarter campaign</a>. Thank you!</p>")
	}

	randomizeRobotName();

	function randomizeRobotName() {
		let items = ["Proto", "Rusty", "Max", "Spark", "Prime", "Alpha", "Beta", "Bolt", "Cybel", "Delta"]
		robotName = items[Math.floor(Math.random() * items.length)];
		$("#robotNameIntro").text(robotName);
		$("#tokenExists").text("There is already a token here, so you can't play anything. Click to continue with " + robotName +"'s turn.");
		$("#robotName").text(robotName);
	}

	$("#readRules").on("click", function() {
		$("#rules").show();
		$("#readRules").hide();
	});


	$("#loadFullGame").on("click", function(e) {
	  e.preventDefault();
		
		if ($("#email").val() == "") {
			alert("Please enter an email address.")
		} else {
			$.post("php/checkUser.php", $("#email").serialize(), function(data) {
			  if (data == "Invalid email address.") {
				  alert(data);
			  }
			  else {
				  userEmail = data;
				  trialVersion = false;
				  startGame();
			  }
			});
		}
	  
	});

	$("#loadTrialGame").on("click", function() {
		userEmail = "trial";
		startGame();
	});
	
	function startGame() {
		$.post("php/trackGames.php", {userEmail:userEmail,duration:0,playerScore:0,compScore:0,tieScore:0});
		startTime = new Date();
		$("#intro").hide();
		$("#main").show();
		$("#main2").css("display", "grid");
	}
	
	$("#returnToTop").on("click", function() {
		$("html, body").animate({ scrollTop: 0 }, "slow");
	});
	
});

let destroyArr = [];
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

  this.playGold = function(tile) {
    this.gold--;
    this.addTokenClass("gold", tile);
    this.display();
	console.log("Player " + num + " played gold on tile " + tile + ".");
  };

  this.playSilver = function(tile) {
    this.silver--;
    this.addTokenClass("silver", tile);
    this.display();
	console.log("Player " + num + " played silver on tile " + tile + ".");
  };

  this.playBronze = function(tile) {
    this.bronze--;
    this.addTokenClass("bronze", tile);
    this.display();
	console.log("Player " + num + " played bronze on tile " + tile + ".");
  };

  this.playPlain = function(tile) {
    this.plain--;
    this.addTokenClass("plain", tile);
    this.display();
	console.log("Player " + num + " played plain on tile " + tile + ".");
  };

  this.playDefender = function(tile) {
    this.defender--;
    this.addTokenClass("defender", tile);

    // note that the surrounding tiles are now defended
    let surSpaces = getSurroundingSpaces(tile);
    for (i = 0; i < surSpaces.length; i++) {
      $("#" + surSpaces[i]).addClass("defendedbyplayer" + this.num.toString());
    }

    this.display();
		console.log("Player " + num + " played defender on tile " + tile + ".");
  };

  this.playBomb = function(tile) {
		console.log("Player " + num + " played bomb on tile " + tile + ".");

		if ($("#playingIcon").is(":visible")) {
			$("#playBombSound").trigger('play');
		}
	
    this.bomb--;

    let opponent = Math.abs(num - 1).toString();

    // destroy the surrounding vulnerable tiles (they no longer count as points, image removed, classes removed)
		let surSpaces = getSurroundingSpaces(tile);
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
		
		this.getNumCoins = function() {
			return this.gold + this.silver + this.bronze;
		}
		
  };
  
  // making this a separate function because it will be used by question tiles
  this.destroyToken = function(tile, player) {
		console.log("Destroying token of player " + player + " on tile #" + tile + ".");

		let type = "plain token";
		// remove the bronze/silver/gold class
		if ($("#" + tile).hasClass("gold")) {
			type = "gold coin";
		} else if ($("#" + tile).hasClass("silver")) {
			type = "silver coin";
		} else if ($("#" + tile).hasClass("bronze")) {
			type = "bronze coin";
		}

		if (player == 0) {
			this.createDestroyMsg(type, tile);
		}
		
		
		// give it a second to work
		setTimeout(destroyEverything, 750);
		
		function destroyEverything() {
			// remove the player class and image
			$("#" + tile).removeClass("player" + player);
			$("#" + tile).removeClass("occupied");
			$("#" + tile + " img:last-child").remove();

			// remove the bronze/silver/gold class
			if (type == "gold coin") {
				$("#" + tile).removeClass("gold");
			} else if (type == "silver coin") {
				$("#" + tile).removeClass("silver");
			} else if (type == "bronze coin") {
				$("#" + tile).removeClass("bronze");
			}

			// put the number back in the space if unoccupied
			if (!$("#" + tile).hasClass("filled")) {
				$("#" + tile).text(tile);
			}
		}
	}

	this.createDestroyMsg = function(type, tile) {
		let msg = "your " + type + " on tile " + tile;
		destroyArr.push(msg);
	}

  // display current statistics
  this.display = function() {
	  if (num == 0) {
		  $("#userGold").text(this.gold);
		  $("#userSilver").text(this.silver);
		  $("#userBronze").text(this.bronze);
		  $("#userPlain").text(this.plain);
		  $("#userDefender").text(this.defender);
		  $("#userBomb").text(this.bomb);
	  } else {
		  $("#compGold").text(this.gold);
		  $("#compSilver").text(this.silver);
		  $("#compBronze").text(this.bronze);
		  $("#compPlain").text(this.plain);
		  $("#compDefender").text(this.defender);
		  $("#compBomb").text(this.bomb);
	  }

  };

  this.addTokenClass = function(type, space) {
    // note what token it is and what player played it
    // let tile = $("#" + bag.getCurrent()); (DELETING THIS BECAUSE IT'S NOT ALWAYS CURRENT TILE)
	let tile = $("#" + space);
	tile.addClass("occupied");

    // defenders don't have a separate "player0" or "player1" because that will be used to record points
    if (type == "defender") {
      tile.addClass("player" + this.num + "defender");
    } else {
      tile.addClass(type);
      tile.addClass("player" + this.num);
    }

    // add the relevant picture to the board
    tile.text("");
    tile.append(
      "<img src='images/tokens/" +
        type +
        this.num.toString() +
        ".png' alt='token' style='width:70%;height:auto;'>"
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

let numbersLeft = 100;
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
		removeQuestionInfo(previousNumber);
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
	
		numbersLeft = numberBag.length;
	// add note of how many cards are left
	if (numberBag.length == 50) {
		$("#cardsLeft").text("There are 50 cards left.");
		if (trialVersion) {
			$("#mainRight").html('<div id="trialMessage"><p>Thank you for playing the trial version of Endangered World! Please visit our <a href="#">Kickstarter campaign</a> to purchase the full version or pre-order the board game.</p><p>If you\'d like to play the trial version again, click <a href="index.php">here</a>.</div>');
		}
	} else if (numberBag.length == 25) {
		$("#cardsLeft").text("There are 25 cards left.");
	} else if (numberBag.length == 15) {
		$("#cardsLeft").text("There are 15 cards left.");
	} else if (numberBag.length == 5) {
		$("#cardsLeft").text("There are 5 cards left.");
	} else if (numberBag.length == 1) {
		$("#cardsLeft").text("There is 1 card left.");
	} else if (numberBag.length == 0) {
		$("#cardsLeft").text("This is the final card!");
	} else {
		$("#cardsLeft").text("");
	}

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

function removeQuestionInfo(previousNumber) {
	let questionId = getQuestionId(previousNumber);
	let tile = $("#" + previousNumber);
	tile.removeAttr("style");
	tile.removeClass("filled");
	tile.removeClass("question");
	tile.removeClass("q" + questionId);
	
	// in some questions, players can place a coin in the question space,
	// in which case you don't need to replace the text
	if (!tile.find('img').length) {
		$("#" + previousNumber).text(previousNumber.toString());
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
$('body').on('click', "#pickNumber", function() {
	handlePickNumber();
});

function handlePickNumber() {
	
	
	$("#turnChoicesComp").hide();
	$(".robotTurnHighlight").removeClass("robotTurnHighlight");
	
	// start showing the card after the first draw
	if ($("#cardFront").css("display") == "none") {
		$("#cardFront").css("display", "block"); 
	}
	
	// only count the click if it's highlighted (able to be drawn);
	if ($("#pickNumber").hasClass("cardHighlight")) {
		if ($("#playingIcon").is(":visible")) {
			$("#playCardSound").trigger('play');
		}
		
		$("#pickNumber").removeClass("cardHighlight");
  
		  // hide the extra defender button if needed
		  if (!$("#playDefenderRule3").css("display", "none")) {
			  $("#playDefenderRule3").hide();
		  }
  
	  // draw a random number
	  tileNum = drawNumber();
	  takeTurn(tileNum);
	  
	}
}

// this function will be the same for both the user and computer
function drawNumber() {	

	$("#questionCard").hide();

	// IMPORTANT: keeps the players alernating (IF NOT DOUBLE TURN)
	playerNum = (playerNum + 1) % 2;
	

  // return a random number
  let rand = bag.randomize();
  
  
  
  console.log("Player " + playerNum + " just drew tile " + rand +".");

  return rand;
}

let compDoNothing = false;
function takeTurn(rand) {
	// when there are cards left
	if (typeof rand != 'undefined') {
		$("#cardFront").attr("src", "images/cards/" + rand + ".jpg");
	
		let questionId = getQuestionId(rand);
		
		// if it's a question, handle specially
		if (questionId > 0) {
			handleQuestion(rand, questionId);
		}
		// if it's anything else, resume gameplay as normal
		else {
			// determine if it's the user or computer playing
		  if (playerNum == 0) {
			$("#turnDisplay").html("<p>What would you like to play on tile <b>" + rand + "</b>?");
			displayTurnChoices();
		  } else {
			$("#turnChoices").hide();
			calculateRobotChoice(rand);	

			console.log("comp do nothing? " + compDoNothing);
			if (!compDoNothing) {
				let msg = "<p>" + robotName + " played the following on tile <b>" + rand + "</b>.";
	

				if (destroyArr.length > 0) {
					msg += " This destroyed " + destroyArr[0];
					if (destroyArr.length == 1) {
						msg += ".";
					} else if (destroyArr.length == 2) {
						msg += (" and " + destroyArr[1] + ".");
					} else {
						for (let i = 1; i < destroyArr.length; i++) {
							msg += ", ";
							if (i == destroyArr.length - 2) {
								msg += "and ";
							}
							msg += destroyArr[i];
						}
						msg += ".";
					}
					destroyArr = [];
				}
	
				if (!extraTurnComp) {
					msg += " Click the deck to continue.</p>";
				} else {
					msg += "</p>";
				}
	
				$("#turnDisplay").html(msg);
			} else {
				compDoNothing = false;
			}
			
			endCompTurn();
		  }
		}
	}
	// when there are no cards left (backup if checkIfEnd doesn't work)
	else {
		endGameAfterUser();
	}
  
}

// display the appropriate choices based on token inventory
function displayTurnChoices() {
  
  // only show choices when space is free
  let tile = $("#" + tileNum);
  if (!tile.hasClass("occupied")){
	   $("#turnChoices").show();
	   
	   // show all individual buttons because sometimes they're hidden
	  $("#turnText").show();
	  $("#doNothing").show();
	  $("#playGold").show();
	  $("#playSilver").show();
	  $("#playBronze").show();
	  $("#playPlain").show();
	  $("#playBomb").show();
	  $("#playDefender").show();

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
  // when space has a token on it already
  else {
	  $("#tokenExists").show();
	  $("#continue").html('Continue');
	  $("#continue").show();
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
  if (players[0].gold == 0) {
    $("#playGold").hide();
  }
  if (players[0].silver == 0) {
    $("#playSilver").hide();
  }
  if (players[0].bronze == 0) {
    $("#playBronze").hide();
  }
  
  // only display the relevant higher coin
  if ($("#" + questionTileChoice).hasClass("silver")) {
	$("#playSilver").hide();
	$("#playBronze").hide();
  } else if ($("#" + questionTileChoice).hasClass("bronze")) {
	$("#playBronze").hide();
  }
  
}

$("#doNothing").click(function() {
	handleDoNothing();
});

function handleDoNothing() {
	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
	clearQuestion();
}

$("#playGold").click(function() {
	handlePlayGold();
});

function handlePlayGold() {
	if ($("#playingIcon").is(":visible")) {
		//$("#playCoinSound").trigger('play');
		$("#playTokenSound").trigger('play');
	}
	
	// take into account questions
	if (currentQuestion == 0) {
		players[0].playGold(tileNum);
	} else if (currentQuestion == 2) {
		handleRule2("gold", 0);
	} else if (currentQuestion == 9) {
		if ($("#" + questionTileChoice).hasClass("occupied")) {
			handleRule9(1);
		}
		players[0].playGold(questionTileChoice);
	} else {
		// this applies to 6, 7, 10, 11, 14 ...
		players[0].playGold(questionTileChoice);
	}
	clearQuestion();
	
	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
}

$("#playSilver").click(function() {
	handlePlaySilver();
});

function handlePlaySilver() {
	if ($("#playingIcon").is(":visible")) {
		//$("#playCoinSound").trigger('play');
		$("#playTokenSound").trigger('play');
	}
	
	// take into account questions
	if (currentQuestion == 0) {
		players[0].playSilver(tileNum);
	} else if (currentQuestion == 2) {
		handleRule2("silver", 0);
	} else if (currentQuestion == 9) {
		if ($("#" + questionTileChoice).hasClass("occupied")) {
			handleRule9(1);
		}
		players[0].playSilver(questionTileChoice);
	} else {
		// this applies to 6, 7, 10, 11, 14 ...
		players[0].playSilver(questionTileChoice);
	}
	clearQuestion();
  
	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}	
}

$("#playBronze").click(function() {
	handlePlayBronze();
});

function handlePlayBronze() {
	if ($("#playingIcon").is(":visible")) {
		//$("#playCoinSound").trigger('play');
		$("#playTokenSound").trigger('play');
	}
	
	// take into account questions
	if (currentQuestion == 0) {
		players[0].playBronze(tileNum);
	} else if (currentQuestion == 2) {
		handleRule2("bronze", 0);
	} else if (currentQuestion == 9) {
		if ($("#" + questionTileChoice).hasClass("occupied")) {
			handleRule9(1);
		}
		players[0].playBronze(questionTileChoice);
	} else {
		// this applies to 6, 7, 10, 11, 14 ...
		players[0].playBronze(questionTileChoice);
	}
	clearQuestion();
	
	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
}

$("#playPlain").click(function() {
	handlePlayPlain();
});

function handlePlayPlain() {
	if ($("#playingIcon").is(":visible")) {
		//$("#playCoinSound").trigger('play');
		$("#playTokenSound").trigger('play');
	}
	
	// take into account questions
	if (currentQuestion == 0) {
		players[0].playPlain(tileNum);
	} else if (currentQuestion == 9) {
		if ($("#" + questionTileChoice).hasClass("occupied")) {
			handleRule9(1);
		}
		players[0].playPlain(questionTileChoice);
	} else {
		// this applies to 6, 7, 10, 11, 14 ...
		players[0].playPlain(questionTileChoice);
	}
	clearQuestion();

	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
}

$("#playDefender").click(function() {
	handlePlayDefender();
});

function handlePlayDefender() {
	if ($("#playingIcon").is(":visible")) {
		//$("#playDefenderSound").trigger('play');
		$("#playTokenSound").trigger('play');
	}
	
	// take into account questions
	if (currentQuestion == 0) {
		players[0].playDefender(tileNum); 
	} else {
		// this applies to 6, 7, 9, 10, 11, 14 ...
		players[0].playDefender(questionTileChoice); 
	}
	clearQuestion();
  
	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
}

$("#playBomb").click(function() {
	handlePlayBomb();
});

function handlePlayBomb() {
	
	if (currentQuestion == 0) {
		players[playerNum].playBomb(tileNum);
	} else {
		// this applies to 7, 9, 10, 11, 14 ...
		players[playerNum].playBomb(questionTileChoice);
	}
	
	clearQuestion();
	
	if (!extraTurnUser) {
		endHumanTurn();
	} else {
		takeExtraTurn();
	}
}

function clearQuestion() {
	if (currentQuestion > 0) {
		// reset global variables
		currentQuestion = 0;
		questionTileChoice = -1;
		$("#continue").hide();
		//$("#pickNumber").removeClass("cardHighlight"); // don't know why this was here... maybe important?
	}
}

// special case for question 9
function handleRule9(opponentNum) {
	let tile = $("#" + questionTileChoice);
	
	// remove the opponent's classes and token picture
	if (tile.hasClass("gold")) {
		tile.removeClass("gold");
	} else if (tile.hasClass("silver")) {
		tile.removeClass("silver");
	} else if (tile.hasClass("bronze")) {
		tile.removeClass("bronze");
	} else if (tile.hasClass("plain")) {
		tile.removeClass("plain");
	}
	
	if (opponentNum == 1) {
		tile.removeClass("player1");
	} else {
		tile.removeClass("player0");
	}
	
	tile.empty();
}

// special case for question 2
function handleRule2(type, playerNum) {
	let tile = $("#" + questionTileChoice);
	
	// find what token was originally on the space and return it to the user's possession (need to add addBronze)
	if ($("#" + questionTileChoice).hasClass("silver")) {
		players[playerNum].addSilver();
		tile.removeClass("silver");
	} else if ($("#" + questionTileChoice).hasClass("bronze")) {
		players[playerNum].addBronze();
		tile.removeClass("bronze");
	} else if ($("#" + questionTileChoice).hasClass("plain")) {
		tile.removeClass("plain");
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
    tile.empty();
    tile.addClass(type);

    // add the relevant picture to the board
    tile.append(
      "<img src='images/tokens/" +
        type + playerNum +
        ".png' alt='token' style='width:70%;height:auto;'>"
    );
	
	players[playerNum].display();

	$("#continue").hide();
}

// special case for question 3
$("#playDefenderRule3").click(function() {
  removeQuestionInfo(tileNum);
  players[0].playDefender(tileNum);
  $("#playDefenderRule3").hide();
  $("#turnDisplay").text("You played a defender. Click the deck to continue with your next turn.");
});

// this function prompts the user to draw another number,
// ensures the player is still the user, and then starts
// the user's second turn
function takeExtraTurn() {
    $('#turnDisplay').html("<p>Click the deck to take your second turn.</p>");
	$("#turnChoices").hide();
    playerNum++;
	extraTurnUser = false;
	endCompTurn();
}

// this is shown during certain questions
$("#continue").click(function() {
	handleContinue();
});

function handleContinue() {
	clearQuestion();
	$("#continue").hide();
	$("#continue").html('Do Nothing');
	$("#tokenExists").hide();
	endHumanTurn();
}

// when the user clicks this, the tokens are destroyed and the user can continue playing
$("#seeChanges").click(function() {
	destroy();
	$("#seeChanges").hide();
	if (playerNum == 0) {
		$("#turnDisplay").html("<p>Click below to continue with " + robotName + "'s turn.</p>");
		$("#continue").html("Continue");
		$("#continue").show();
	} else {
		$("#turnDisplay").html("<p>Click the deck to continue with your turn.</p>");
		$("#pickNumber").addClass("cardHighlight");
	}
});
	 
// do the destroying where needed
function destroy() {
	if ($("#playingIcon").is(":visible")) {
		$("#playBombSound").trigger('play');
	}
	
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
	showCompChoices();
	
	// if there's already a token, do nothing
	let tile = $("#" + tileNum);
	if (tile.hasClass("occupied")) {
		compDoNothing = true;
		if (!extraTurnComp) {
			$("#turnDisplay").html("<p>This space was already occupied, so " + robotName + " did nothing. Click the deck to continue with your turn.</p>");
		} else {
			$("#turnDisplay").html("<p>This space was already occupied, so " + robotName + " did nothing.</p>");
		}
		$("#turnChoicesComp").hide();
		return;
	}
	
	let tokenPlayed = findBestToken(tileNum, true, true);
}

function showCompChoices() {
	$("#turnChoicesComp").show();

	  if (players[playerNum].gold == 0) {
		$("#playGoldComp").hide();
	  }
	  if (players[playerNum].silver == 0) {
		$("#playSilverComp").hide();
	  }
	  if (players[playerNum].bronze == 0) {
		$("#playBronzeComp").hide();
	  }
	  if (players[playerNum].plain == 0) {
		$("#playPlainComp").hide();
	  }
	  if (players[playerNum].defender == 0) {
		$("#playDefenderComp").hide();
	  }
	  if (players[playerNum].bomb == 0) {
		$("#playBombComp").hide();
	  }
}

// if there are at least 5 opponent points around, then play a bomb if you have one
function shouldPlayBomb(surSpaces, tile) {
	let animalId = getAnimalId(tile);
	if (getNumUnoccupiedOnAnimal(animalId) == 1) {
		return false;
	}
	if (players[1].bomb <= 0) {
		return false;
	}
	
	// find out how many animal figures and player points are around
	let playerPoints = 0;

	let undefendedSpaces = [];
  for (var i = 0; i < surSpaces.length; i++) {
    // only count player's points if they are undefended
    if (
      $("#" + surSpaces[i]).hasClass("player0") &&
      !$("#" + surSpaces[i]).hasClass("defendedbyplayer0")
    ) {
			undefendedSpaces.push(surSpaces[i]);
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
	
	if (playerPoints > 0) {
		for (var i = 0; i < undefendedSpaces.length; i++) {
			let animalId = getAnimalId(undefendedSpaces[i]);
			let numUnoccupiedOnAnimal = getNumUnoccupiedOnAnimal(animalId);

			if ((numUnoccupiedOnAnimal == 0) || numbersLeft <= 25) {
				let playerPoints = checkAnimalPoints(animalId, 0);
				let compPoints = checkAnimalPoints(animalId, 1);
				let tilePoints = 0;

				if ($("#" + undefendedSpaces[i]).hasClass("gold")) {
					tilePoints = 6;
				} else if ($("#" + undefendedSpaces[i]).hasClass("silver")) {
					tilePoints = 4;
				} else if ($("#" + undefendedSpaces[i]).hasClass("bronze")) {
					tilePoints = 2;
				} else {
					tilePoints = 1;
				}

				// if tied or player winning
				if (playerPoints >= compPoints) {
					// if bomb would change who saves the animal
					if (compPoints >= (playerPoints - tilePoints)) {
						return true;
					}
				}
			}

		}
	}
  
  if (playerPoints >= 4) {
	  return true;
  } else {
	  return false;
  }
}

// find out how many undefended comp points are around
function getNumUndefendedCompPointsAround(surSpaces) {
	let compPoints = 0;

	let undefendedSpaces = [];
  for (var i = 0; i < surSpaces.length; i++) {
    // only count player's points if they are undefended
    if (
      $("#" + surSpaces[i]).hasClass("player1") &&
      !$("#" + surSpaces[i]).hasClass("defendedbyplayer1")
    ) {
			undefendedSpaces.push(surSpaces[i]);
      if ($("#" + surSpaces[i]).hasClass("gold")) {
        compPoints += 6;
      } else if ($("#" + surSpaces[i]).hasClass("silver")) {
        compPoints += 4;
      } else if ($("#" + surSpaces[i]).hasClass("bronze")) {
        compPoints += 2;
      } else {
        compPoints++;
      }
    }
	}

	return compPoints;
}

// if there are a significant number of animal tiles around that aren't the opponent's,
// then place a defender if you have one
function shouldPlayDefender(surSpaces, tile) {
	let animalId = getAnimalId(tile);
	if (players[1].defender <= 0) {
		return false;
	}
	if ((getNumUnoccupiedOnAnimal(animalId) == 1) || animalHasDefenderAlready(animalId)) {
		return false;
	}
	if (surSpaces.length < 8) {
		return false;
	}

  // find out how many animal figure points are around
	let animalTiles = countPotentialNearbyAnimals(surSpaces);
	let numNearbyAnimals = countPotentialNearbyAnimalsNum(surSpaces);

	let compPoints = getNumUndefendedCompPointsAround(surSpaces);
  
  if (animalTiles >= 14 || (numNearbyAnimals >= 3 && animalTiles >= 9) || compPoints >= 4) {
	  return true;
  } else {
	  return false;
  }
}

// turning this into a separate function so questions can use it
function findBestToken(tile, defenderAllowed, bombAllowed) {
	let surSpaces = getSurroundingSpaces(tile);
	
	// consider defenders and bombs first
	if (defenderAllowed) {
		let shouldPlayDefenderVar = shouldPlayDefender(surSpaces, tile);
		if (shouldPlayDefenderVar) {
			players[1].playDefender(tile);
			$("#playDefenderComp").addClass("robotTurnHighlight");
			return "defender";
		}
	}
	
	if (bombAllowed) {
		let shouldPlayBombVar = shouldPlayBomb(surSpaces, tile);
		if (shouldPlayBombVar) {
			players[1].playBomb(tile);
			$("#playBombComp").addClass("robotTurnHighlight");
			return "bomb";
		}
	}
	
	if (!$("#" + tile).hasClass("animal")) {
		compDoNothing = true;
		$("#turnDisplay").html("<p>" + robotName + " chose to do nothing on tile <b>" + tile + "</b>. Click the deck to continue with your turn.</p>");
		$("#turnChoicesComp").hide();
		return "nothing";
	}
	
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
	let playerPoints = checkAnimalPoints(animalId, 0);
	let compPoints = checkAnimalPoints(animalId, 1);
	let numUnoccupiedOnAnimal = getNumUnoccupiedOnAnimal(animalId);
	
	// determine if the computer is winning
	let compWinning;
	if (compPoints >= playerPoints) {
		compWinning = true;
	} else {
		compWinning = false;
	}
	
	// determine if the score is close on that particular animal
	let closeScore;
	let landslide;
	if (Math.abs(compPoints - playerPoints) <= 3) {
		closeScore = true;
	} else {
		closeScore = false;
	}
	
	if (Math.abs(compPoints - playerPoints) >= 7) {
		landslide = true;
	} else {
		landslide = false;
	}

	// if it's the last place and the comp is winning and there are undefended spots around, play a defender if comp has it
	if (players[1].defender > 0 && numUnoccupiedOnAnimal == 1 && compPoints > playerPoints && getNumUndefendedCompPointsAround(surSpaces) > 0) {
			players[1].playDefender(tile);
			$("#playDefenderComp").addClass("robotTurnHighlight");
			return "defender";
	}
	
	let defended = false;
	if ($("#" + tile).hasClass("defendedbyplayer1")) {
		defended = true;
	}
	// logic for maximum token to play
	let choice;
	if (landslide) {
		choice = playMax("plain");
	} else {
		switch(animalSize) {
			case "xs":
				if ((numUnoccupiedOnAnimal == 1) || numbersLeft <= 25) {
					choice = handleLastAnimalSpace(compPoints, playerPoints, animalSize);
				} else {
					choice = playMax("plain");
				}
				break;
			case "sm":
				if ((numUnoccupiedOnAnimal == 1) || numbersLeft <= 25) {
					choice = handleLastAnimalSpace(compPoints, playerPoints, animalSize);
				} else if (defended) {
					choice = playMax("bronze");
				} else {
					choice = playMax("plain");
				}
				break;
			case "m":
				if ((numUnoccupiedOnAnimal == 1) || numbersLeft <= 25) {
					choice = handleLastAnimalSpace(compPoints, playerPoints, animalSize);
				} else if (defended) {
					choice = playMax("silver");
				} else {
					choice = playMax("bronze");
				}
				break;
			case "l":
			case "xl":
				if ((numUnoccupiedOnAnimal == 1) || numbersLeft <= 25) {
					choice = handleLastAnimalSpace(compPoints, playerPoints, animalSize);
				} else if (defended) {
					choice = playMax("gold");
				} else {
					if (closeScore && !compWinning) {
						choice = playMax("silver");
					} else if (closeScore && compWinning) {
						choice = playMax("bronze");
					} else if (!landslide) {
						choice = playMax("bronze");
					} else {
						choice = playMax("plain");
					}
				}
				break;
		}
	}
	
	switch(choice) {
		case "gold coin":
			players[1].playGold(tile);
			$("#playGoldComp").addClass("robotTurnHighlight");
			break;
		case "silver coin":
			players[1].playSilver(tile);
			$("#playSilverComp").addClass("robotTurnHighlight");
			break;
		case "bronze coin":
			players[1].playBronze(tile);
			$("#playBronzeComp").addClass("robotTurnHighlight");
			break;
		case "plain token":
			players[1].playPlain(tile);
			$("#playPlainComp").addClass("robotTurnHighlight");
			break;
	}
	
	return choice;
}

function handleLastAnimalSpace(compPoints, playerPoints, animalSize) {
	if (compPoints >= playerPoints) {
		return playMax("plain");
	}

	let diff = Math.abs(compPoints - playerPoints);
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

	let largeAnimal;
	if (animalSize == "l" || animalSize == "xl") {
		largeAnimal = true;
	} else {
		largeAnimal = false;
	}
	
	switch (diff) {
		case 6:
		case 5:
			if (hasGold) {
				return playMax("gold");
			} else {
				return playMax("plain");
			}
		case 4:
			if (hasGold && largeAnimal) {
				return playMax("gold");
			} else if (hasSilver) {
				return playMax("silver");
			} else {
				return playMax("plain");
			}
		case 3:
			if (hasSilver) {
				return playMax("silver");
			} else if (hasGold && largeAnimal) {
				return playMax("gold");
			} else {
				return playMax("plain");
			}
		case 2:
			if (hasSilver) {
				return playMax("silver");
			} else if (hasGold && largeAnimal) {
				return playMax("gold");
			} else if (hasBronze) {
				return playMax("bronze");
			} else {
				return playMax("plain");
			}
		case 1:
			if (hasBronze) {
				return playMax("bronze");
			} else if (hasSilver) {
				return playMax("silver");
			} else if (hasGold && largeAnimal) {
				return playMax("gold");
			} else {
				return playMax("plain");
			}
		default:
			return playMax("plain");
	}
}

function getNumUnoccupiedOnAnimal(animalId) {
	if (animalId > 15) {
		return -1;
	}

	let animalSquares = [];
	// find all the spaces where the player has tokens on that specific animal
  for (var i = 0; i < 100; i++) {
    if ($("#" + i).hasClass("a" + animalId)) {
      animalSquares.push(i);
    }
	}
	
	let unoccupied = 0;
	for (var i = 0; i < animalSquares.length; i++) {
		if (!$("#" + animalSquares[i]).hasClass("occupied")) {
			unoccupied++;
		}
	}

	return unoccupied;
}

function countPotentialNearbyAnimals(surSpaces) {
	// find out how many animal player points are around
	let animalTiles = 0;

	let tile;
  for (i = 0; i < surSpaces.length; i++) {
	  tile = $("#" + surSpaces[i]);
    // only count animal figures if empty there and it isn't already defended
    if ( tile.hasClass("animal") && !tile.hasClass("occupied")
		&& !tile.hasClass("defendedbyplayer1")) {
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
        animalTiles += 4;
      }
    }
	}
  
  return animalTiles;
}

function countPotentialNearbyAnimalsNum(surSpaces) {
	// find out how many animal figures are around
	let animalIds = [];

	let tile;
  for (i = 0; i < surSpaces.length; i++) {
	  tile = $("#" + surSpaces[i]);
    // only count animal figures if empty there and it isn't already defended
    if ( tile.hasClass("animal") && !tile.hasClass("occupied")
		&& !tile.hasClass("defendedbyplayer1")) {
			animalIds.push(getAnimalId(surSpaces[i]));
    }
	}
	
	var unique = animalIds.filter(function(itm, i, a) {
    return i == animalIds.indexOf(itm);
	});
  
  return unique.length;
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
		return 20;
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

  return playerPoints;
}

function animalHasDefenderAlready(animalId) {
	let animalSquares = [];
	
  for (var i = 0; i < 100; i++) {
    if ($("#" + i).hasClass("a" + animalId)) {
      animalSquares.push(i);
    }
  }

  for (var i = 0; i < animalSquares.length; i++) {
    if ($("#" + animalSquares[i]).hasClass("player1defender")) {
      return true;
    }
	}
  
  return false;
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
	num = parseInt(num);

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
		tileNum = drawNumber();
		takeTurn(tileNum);
	} else {
		endGameAfterUser();
	}
	
}

function endCompTurn() {	
	// if there are still numbers, human takes turn
	if (!bag.checkIfEnd()) {
		$("#pickNumber").addClass("cardHighlight");
	} else {
		endGameAfterComp();
	}
}

function endGameAfterUser() {
	$("#main2").hide();
	$("#main3").show();
}

function endGameAfterComp() {
	$("#pickNumber").hide();
	$("#main3").show();
}

$("#showScore").click(function() {
	$("#playAgain").show();
	$("#main2").hide();
	$("#promptFinalScore").hide();
	countFinalScore();
});

// calculate the final score
function countFinalScore() {
	
	// calculate duration of game to save in database
	endTime = new Date();
	let timeDiff = endTime - startTime; //in ms
	// strip the ms
	timeDiff /= 60000;
	// get minutes 
	let minutes = timeDiff.toFixed(2);
	
	
	if ($("#playingIcon").is(":visible")) {
		$("#endGameSound").trigger('play');
	}
	let playerPoints = 0;
	let compPoints = 0;
	let animalsWonByPlayer = [];
	let animalsWonByComp = [];
	let lostAnimals = [];	
	
	// this loops through each animal and counts up who won each
	for (var i = 1; i <= 15; i++) {
		playerPoints = checkAnimalPoints(i, 0);
		compPoints = checkAnimalPoints(i, 1);
		
		if (playerPoints > compPoints) {
			animalsWonByPlayer.push(i);
		} else if (compPoints > playerPoints) {
			animalsWonByComp.push(i);
		} else {
			lostAnimals.push(i);
		}
		
		//reset the points because we're moving to the next animal
		playerPoints = 0;
		compPoints = 0;
	}
	
	$("#results").css("display", "grid");
	$("#userWon").html("<h2><u>Animals saved by you</u></h2>");
	$("#compWon").html("<h2><u>Animals saved by " + robotName + "</u></h2>");
	$("#nobodyWon").html("<h2><u>Animals lost</u></h2>");

	let playerFinalScore = 0;
	let compFinalScore = 0;
	let lostAnimalsScore = 0;
	// count the points for each animal won by player and comp
	if (animalsWonByPlayer.length > 0) {
		for (var i = 0; i < animalsWonByPlayer.length; i++) {
			let animalScore = calculateAnimalScore(animalsWonByPlayer[i]);
			playerFinalScore += animalScore;
			$("#userWon").append(generateAnimalLink(animalScore, animalsWonByPlayer[i]));
			//$("#userWon").append('<img class="animalResults" id="animal' + animalsWonByPlayer[i] + '" src="images/animals/' + animalsWonByPlayer[i] + '.jpg">');
			//$("#userWon").append('<p><b>' + animalScore + '</b> points</p>');
		}
	}
	
	if (animalsWonByComp.length > 0) {
		for (var i = 0; i < animalsWonByComp.length; i++) {
			let animalScore = calculateAnimalScore(animalsWonByComp[i]);
			compFinalScore += animalScore;
			$("#compWon").append(generateAnimalLink(animalScore, animalsWonByComp[i]));
		}
	}
	
	if (lostAnimals.length > 0) {
		for (var i = 0; i < lostAnimals.length; i++) {
			let animalScore = calculateAnimalScore(lostAnimals[i]);
			lostAnimalsScore += animalScore;
			$("#nobodyWon").append(generateAnimalLink(animalScore, lostAnimals[i]));
		}
	}
	
	// implement the rule that unused bombs count as 10 points each
	playerBombScore = (players[0].bomb * 10);
	compBombScore = (players[1].bomb * 10);
	
	$("#userWon").append('<p>+ <b>' + playerBombScore + '</b> points for unused bombs</p>');
	$("#compWon").append('<p>+ <b>' + compBombScore + '</b> points for unused bombs</p>');
	
	playerFinalScore += playerBombScore;
	compFinalScore += compBombScore;
		
	let msg;
	if (playerFinalScore > compFinalScore) {
		msg = "<h1>You won!</h1>";
	} else if (compFinalScore > playerFinalScore) {
		msg = "<h1>" + robotName + " won!</h1>";
	} else {
		msg = "<h1>You and " + robotName + " tied!</h1>";
	}
	
	$("#resultsSummary").html(msg + "<h2>Your final score: <b>" + playerFinalScore + "</b><br>" + robotName + "'s final score: <b>" + compFinalScore + "</b></h2><p><i>Click the <img class='help-icon' src='images/help-icon.png'> icons to learn more about the animals.</i></p>");
	
	$.post("php/trackGames.php", {userEmail:userEmail,duration:minutes,playerScore:playerFinalScore,compScore:compFinalScore,tieScore:lostAnimalsScore});
	
}

function generateAnimalLink(animalScore, animalId) {
	let description = getAnimalDescription(animalId);
	let code = '<img class="animalResults" id="animal' + animalId + '" src="images/animals/' + animalId + '.jpg">';
	code += '<p><b>' + animalScore + '</b> points <a href="#" title="' + description + '"><img class="help-icon" src="images/help-icon.png"></a></p>';
	
	return code;
}

function getAnimalDescription(animalId) {
	let description;
	switch (animalId) {
		case 1:
			description = "<b><u>Asian Elephant</u></b><br>Elephants are right- and left-tusked, and the dominant tusk is usually smaller due to greater use. Female Asian elephants have very small tusks that are hardly visible.";
			break;
		case 2:
			description = "<b><u>Plains Bison</u></b><br>The hump on a bison's back is made of muscle and supported by long back bones. This hump helps the bison be able to plow through snow with its head.";
			break;
		case 3:
			description = "<b><u>Black Rhino</u></b><br>Black rhinos have poor eyesight and sometimes charge at rocks, trees, and even trains, thinking they are threats. But their sense of smell and hearing are excellent!";
			break;
		case 4:
			description = "<b><u>Pygmy Hippopotamus</u></b><br>Pygmy hippos are able to sleep underwater. They have a special reflex that lets them rise to the surface, take a breath, and sink back down&mdash;all without waking up!";
			break;
		case 5:
			description = "<b><u>Hawaiian Monk Seal</u></b><br>After giving birth, a female Hawaiian monk seal will not eat for 5-6 weeks while she nurses her pup, causing her to lose hundreds of pounds.";
			break;
		case 6:
			description = "<b><u>Giant Panda</u></b><br>Giant pandas primarily eat bamboo&mdash;between 20 and 40 pounds a day! They eat for more than 12 hours a day, napping for 2-4 hours between meals.";
			break;
		case 7:
			description = "<b><u>African Wild Dog</u></b><br>When hunting, African wild dogs share the kill without fighting among themselves, giving priority to pups, the elderly, and the injured.";
			break;
		case 8:
			description = "<b><u>Bonobo</u></b><br>Bonobos share 98.7% of their DNA with humans. They are able to understand language, play musical instruments, and use various tools.";
			break;
		case 9:
			description = "<b><u>Amur Leopard</u></b><br>Amur leopards have thick, pale fur to help them stay warm and blend in with snow. They can run up to 37 mph and jump more than 10 feet high and 19 feet far.";
			break;
		case 10:
			description = "<b><u>Red Panda</u></b><br>Red pandas use their bushy tails to maintain balance when climbing trees. They also wrap their tails around them to stay warm in the winter.";
			break;
		case 11:
			description = "<b><u>Black-footed Ferret</u></b><br>Black-footed ferrets are nocturnal and primarily eat prairie dogs. One ferret can eat more than 100 prairie dogs in a single year!";
			break;
		case 12:
			description = "<b><u>Giant Tortoise</u></b><br>Giant tortoises can go up to a year without eating or drinking because of their slow metabolism.";
			break;
		case 13:
			description = "<b><u>Southern Sea Otter</u></b><br>Sea otters' nostrils and ears close when they swim, and they can hold their breath for up to 5 minutes.";
			break;
		case 14:
			description = "<b><u>Tasmanian Devil</u></b><br>The Tasmanian devil's bite is one of the strongest in the world. They can even bite through metal!";
			break;
		case 15:
			description = "<b><u>Iberian Lynx</u></b><br>Lynxes have very sharp vision. They can detect a mouse from up to 250 feet away!";
			break;
	}
	
	return description;
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

function robotSelectBestSpace(arr) {
	console.log(arr);
	let landslideLimit = 1;
	if (players[1].gold > 0) {
		landslideLimit = 6;
	} else if (players[1].silver > 0) {
		landslideLimit = 4;
	} else if (players[1].bronze > 0) {
		landslideLimit = 2;
	}

	// find a last animal space if there is one and it's close
	for (let i = 0; i < arr.length; i++) {
		let animalId = getAnimalId(arr[i]);
		if (getNumUnoccupiedOnAnimal(animalId) == 1) {
			// find how many points are on the animal figure
			let playerPoints = checkAnimalPoints(animalId, 0);
			let compPoints = checkAnimalPoints(animalId, 1);
			
			// determine if the score difference is too big on that particular animal
			let landslide;
			if (Math.abs(compPoints - playerPoints) > landslideLimit) {
				landslide = true;
			} else {
				landslide = false;
			}

			if (compPoints <= playerPoints && !landslide) {
				return arr[i];
			}
		}
	}

	// find the space of the biggest animal
	let min = 16;
	let minIndex = -1;
	for (let i = 0; i < arr.length; i++) {
		if (getAnimalId(arr[i]) < min) {
			min = getAnimalId(arr[i]);
			minIndex = i;
		}
	}
	let compChoiceNum;
	
	// if there are no animals, return a random space
	if (min < 16) {
		compChoiceNum = arr[minIndex];
	} else {
		compChoiceNum = arr[Math.floor(Math.random() * arr.length)];
	}
	
	return compChoiceNum;
}

/******************************************* BOARD SETUP *******************************************/

// set the board up initially
let boardSetUp = false;
let placementError = false;
$("#setBoard").click(function() {
  $("#setBoard").html("Set Board Differently");
  $("#startGame").show();
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
      tile.addClass("filled");
      tile.addClass("animal");
      tile.addClass(animalType);
	  
	  // we have to add a before the id so that ids don't overlap
      tile.addClass("a" + id.toString());

      let imageUrl = "images/" + id + "/" + (i + 1) + ".jpg";
      tile.css("background-image", "url(" + imageUrl + ")");
      tile.css("background-size", "100% 100%");

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
    if (!tile.hasClass("filled")) {
      tile.addClass("filled");
      tile.addClass("question");
      tile.addClass("q" + id);

      // remove number and add image
      tile.text("");
      tile.css("background-image", "url(images/questionTile.jpg)");
      tile.css("background-size", "100% 100%");

      // break the loop because we placed the question
      placed = true;

      bagOfQuestions.push(rand);
    }
  }
}

let bag;
// start the game by filling the numbers and tokens and displaying them
$("#startGame").click(function() {
	$("#mainRight").css("display", "grid");
  $("#setupBoard").hide();
  $("#cards").show();
  $("#turnDisplay").html('<p>Click the deck to begin the game!</p>');
  $("#pickNumber").addClass("cardHighlight");
  
  
	let isMobile = false; //initiate as false
	// device detection
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
		|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
		isMobile = true;
	}
	
	if (!isMobile) {
		$("#shortcutDiv").show();
	}

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
}

/******************************************* TWENTY QUESTIONS *******************************************/
/***** COMPLETED: ALL! 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ************/
/************** change line   tile.addClass("q"  to make all cards a single question (good for testing) *****************/

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

let questionId = 0;
function handleQuestion(tileNum, id) {
	$("#turnChoices").hide();
	$("#turnChoicesComp").hide();
	
	if (playerNum == 0) {
		$("#turnDisplay").html("<p>You drew a Twists & Turns card at tile <b>" + tileNum + "</b>.</p><p>Click below to read the card.</p>");
	} else {
		$("#turnDisplay").html("<p>" + robotName + " drew a Twists & Turns card at tile <b>" + tileNum + "</b>.</p><p>Click below to read the card.</p>");
	}
	
	$("#questionTile").attr("src", "images/questions/cropped/" + id + ".png");
	$("#questionTile").css("display", "block");
	questionId = id;
	console.log("Handling question " + questionId);
}

$("#questionTile").click(function() {
	// set hidden questionCard back to opacity like default
	$("#questionCard").animate({opacity: "0"}, 250);
	// animate questionTile opacity change
	$("#questionTile").animate({opacity: "0"}, 250);
	setTimeout(flipQuestion, 250);
});

function flipQuestion() {
	if ($("#playingIcon").is(":visible")) {
		$("#playQuestionSound").trigger('play');
	}
	
	$("#turnDisplay").html("");
	
	// hide the questionTile and set opacity back to normal
	$("#questionTile").css("display", "none");
	$("#questionTile").animate({opacity: "1"});

	// animate the opacity of the questionCard
	$("#questionCard").show();
	$("#questionCard").animate({opacity: "1"}, 250);
	
	switch (questionId) {
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

// important global variables for handling questions
let highlighted = [];
let ruleForClicking = 0;
let currentQuestion = 0;
let questionTileChoice = -1;

function q1(tileNum) {
	let qText = "An epidemic has struck! All tokens (both yours and others players') are destroyed in the two spaces to the left and the two spaces to the right of the question tile if not protected by defenders."; 
	$("#questionCard").text(qText);
	
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
	
	let msg = "";
	// show the user what is happening, prompt them to view the changes if there are any
	 if (playerNum == 0) {
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
			$("#continue").show();
		}
	 }
	 // if it's the robot turn, still explain what is happening, prompt user to view changes
	 else {
		$("#turnChoices").hide();
		
		
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click the deck to continue with your turn.</p>";
			$("#continue").hide();
			$("#pickNumber").addClass("cardHighlight");
		}
	 }
	 
	 $("#turnDisplay").html(msg);
}

function q2(tileNum) {
	let qText = "The animal population is growing! You may increase the value of any one of your tokens on the gameboard by replacing it with a higher-valued coin if you have one. If you already had a bronze or silver coin in that space, return it to your possession.";
	$("#questionCard").text(qText);
	currentQuestion = 2;
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {
		
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
			msg += "<p>You have no valued tokens that can be increased in value. Click below to continue with " + robotName + "'s turn.</p>"
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
		
		// if there are no valid tiles
		if (highlighted.length === 0) {
			msg += "<p>" + robotName + " has no valued tokens that can be increased in value. Click the deck to continue with your turn.</p>"
			$("#pickNumber").addClass("cardHighlight");
		}
		// if there is at least one valid tile option
		else {
			// select token on highest animal, take note of what token it is
			let chosenTile = robotSelectBestSpace(highlighted);
			
			let originalPoints;
			if ($("#" + chosenTile).hasClass("silver")) {
				originalPoints = 4;
			} else if ($("#" + chosenTile).hasClass("bronze")) {
				originalPoints = 2;
			} else if ($("#" + chosenTile).hasClass("plain")) {
				originalPoints = 1;
			}
			
			// determine what the ideal choice would be for this space
			// the player[1].add_____ is to replenish from when findBestToken plays that coin accidentally
			let newCoin = findBestToken(chosenTile, false, false);
			let newCoinPoints;
			let coinName;
			switch(newCoin) {
				case "gold coin":
					newCoinPoints = 6;
					coinName = "gold";
					players[1].addGold();
					break;
				case "silver coin":
					newCoinPoints = 4;
					coinName = "silver";
					players[1].addSilver();
					break;
				case "bronze coin":
					newCoinPoints = 2;
					coinName = "bronze";
					players[1].addBronze();
					break;
				case "plain token":
					newCoinPoints = 1;
					coinName = "plain";
					break;
			}
			
			// if it's worth changing, change it
			if (newCoinPoints > originalPoints) {
				questionTileChoice = chosenTile;
				handleRule2(coinName, 1);
			}
			
			// otherwise, move on without doing anything
			else {
				msg += "<p>" + robotName + " chose to do nothing. Click the deck to continue with your turn.</p>"
			}
			
			clearQuestion();
			$("#pickNumber").addClass("cardHighlight");
		}
	}
	
	$("#turnDisplay").html(msg);
}

function q3(tileNum) {
	let qText = "The government has funded another animal reserve for your opponent. The next player has won a defender token and may place it in the current space or keep it for later.";
	$("#questionCard").text(qText);
	
	let msg = "";
	// inform the user what's happening
	if (playerNum === 0) {
		players[1].addDefender();
		
		// decide if comp wants to use defender
		let surSpaces = getSurroundingSpaces(tileNum);
		let shouldPlayDefenderVar = shouldPlayDefender(surSpaces, tileNum);
		
		if (shouldPlayDefenderVar) {
			players[1].playDefender(tileNum);
			msg += "<p>It played a Defender token. Click below to continue with " + robotName + "'s turn.</p>";
		} else {
			msg += "<p>It decided not to play the Defender here. Click below to continue with " + robotName + "'s turn.</p>";
		}
		
		$("#continue").html('Continue');
		$("#continue").show();
	} else {
		msg = "<p>Click below to play the defender on tile " + tileNum + ". If you'd like to keep the defender for later, click the deck to continue with your turn.</p>";
		players[0].addDefender();
		$("#turnChoices").hide();
		
		// give the user the choice to play a defender or continue with their turn
		$("#playDefenderRule3").show();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q4(tileNum) {
	let qText = "Congratulations! You have won a gold coin from an anonymous donor. Now you can you can save more animals!";
	$("#questionCard").text(qText);
	
	let msg = "";
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>Click below to continue with " + robotName + "'s turn.</p>";
		players[0].addGold();
		$("#continue").html('Continue');
		$("#continue").show();
	} else {
		msg = "<p>Click the deck to continue with your turn.</p>";
		players[1].addGold();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q5(tileNum) {
	let qText = "A wealthy family has transferred money to your opponent's endangered animal fund. The next player has won a silver coin!";
	$("#questionCard").text(qText);
	
	let msg = "";
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>Click below to continue with " + robotName + "'s turn.</p>";
		players[1].addSilver();
		$("#continue").html('Continue');
		$("#continue").show();
	} else {
		msg = "<p>Click the deck to continue with your turn.</p>";
		players[0].addSilver();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q6(tileNum) {
	let qText = "Congratulations! You've won a free round-trip flight. Travel to any space on the gameboard that isn't occupied and place any token (except a bomb).";
	$("#questionCard").text(qText);
	currentQuestion = 6;
	
	let msg = "";
	// FOR USER
	if (playerNum === 0) {
		// loop through all spaces, create array of all unoccupied spaces and highlight them
		for (let i = 0; i < 100; i++) {
			let tile = $("#" + i);
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				highlighted.push(i);
				tile.addClass("highlight");
			}
		}
	
		// prompt the user to click on one of these highlighted spaces
		msg += "<p>Please select the space where you would like to place a token.</p>";
		ruleForClicking = 6;
			
		// this then jumps to the end of the code, search for: if (ruleForClicking == 6)
	}
	// FOR COMP
	else {
		let compChoiceNum;
		let toPlay;
		
		if (numbersLeft <= 25) {
			handleQ6Comp();
		}

		// first priority: play a defender if you have one
		// if the comp has a defender, play it in the place with the most animal spaces around
		else if (players[1].defender > 0) {
			// loop through the board (except for questions), for each space determine how many surrounding animal spaces there are
			let max = 0;
			let maxIndex = -1;
			for (let i = 0; i < 100; i++) {
				let surSpaces = getSurroundingSpaces(i);
				let nearbyAnimalPoints = countPotentialNearbyAnimals(surSpaces);
				if (nearbyAnimalPoints > max) {
					max = nearbyAnimalPoints;
					maxIndex = i;
				}
			}
			// wherever there are the greatest points, place the defender
			compChoiceNum = maxIndex;
			toPlay = "defender";
			players[1].playDefender(compChoiceNum);
		} 
		
		// loop through all spaces, create an array of all defended spots that have animals on them
		else {
			for (let i = 0; i < 100; i++) {
				let tile = $("#" + i);
				if (tile.hasClass("defendedbyplayer1") && tile.hasClass("animal") && !tile.hasClass("occupied")) {
					highlighted.push(i);
				}
			}
		
			// if there are defended spots
			if (highlighted.length > 0) {
				compChoiceNum = robotSelectBestSpace(highlighted);
				toPlay = findBestToken(compChoiceNum, false, false);
			}
			// if there aren't defended spots
			else {
				let arr = [];
				for (let i = 0; i < 100; i++) {
					let tile = $("#" + i);
					if (!tile.hasClass("occupied") && tile.hasClass("animal")) {
						arr.push(i);
					}
				}
				compChoiceNum = robotSelectBestSpace(arr);
				
				// determine what the ideal choice would be for this space
				toPlay = findBestToken(compChoiceNum, false, false);
				
			}
		}
		msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
		
		clearQuestion();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function handleQ6Comp() {
	let arr = [];
	for (let i = 0; i < 100; i++) {
		let tile = $("#" + i);
		if (!tile.hasClass("occupied") && tile.hasClass("animal")) {
				arr.push(i);
		}
	}
	let compChoiceNum = robotSelectBestSpace(arr);
	let toPlay = findBestToken(compChoiceNum, false, false);

	let msg = "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
	clearQuestion();
	$("#turnChoices").hide();
	$("#pickNumber").addClass("cardHighlight");
	$("#turnDisplay").html(msg);
}

function q7(tileNum) {
	let qText = "A government leader has issued your opponent a private jet and has asked you to assist them. Place one of the next player's single tokens (worth 1 point) on any animal figure on the board that isn't occupied.";
	$("#questionCard").text(qText);
	
	// create an array of unoccupied animal figures
	let tile;
	for (let i = 0; i < 100; i++) {
		tile = $("#" + i);
		if (!tile.hasClass("occupied") && tile.hasClass("animal")) {
			highlighted.push(i);
		}
	}
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {

		// highlight the array
		for (let i = 0; i < highlighted.length; i++) {
			$("#" + highlighted[i]).addClass("highlight");
		}
		
		// prompt the user to click on one of these highlighted spaces
		msg += "<p>Please select the space where you would like to place your opponent's token.</p>";
		ruleForClicking = 7;
			
		// this then jumps to the end of the code, search for: if (ruleForClicking == 7)
	}	
	// FOR COMP
	else {
		
		// for each animal in the array, determine the player's score, comp's score
		let animalId, compPoints, playerPoints, difference, compWinning, compChoiceNum;
		let max = 0;
		let maxIndex = -1;
		for (let i = 0; i < highlighted.length; i++) {
			animalId = getAnimalId(highlighted[i]);
			playerPoints = checkAnimalPoints(animalId, 0);
			compPoints = checkAnimalPoints(animalId, 1);
			difference = Math.abs(compPoints - playerPoints);
			
			// find the greatest difference
			if (difference > max) {
				maxIndex = i;
				
				if (compPoints >= playerPoints) {
					compWinning = true;
				} else {
					compWinning = false;
				}
			}
		}
		
		// if someones is already winning by a lot, place it there
		if (difference > 3) {
			compChoiceNum = highlighted[maxIndex];
		}
		// else choose randomly
		else {
			compChoiceNum = highlighted[Math.floor(Math.random() * highlighted.length)];
		}
		
		players[0].playPlain(compChoiceNum);
		msg += "<p>" + robotName + " has placed one of your plain tokens on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
		
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q8(tileNum) {
	let qText = "A one-month expedition of your organization was successful. You may place any valued token on any animal in this row if the space is not occupied.";
	$("#questionCard").text(qText);
	currentQuestion = 8;
	
	// create an array of unoccupied animal figures in the current row
	let firstTileInRow = Math.floor(tileNum / 10) * 10;
	
	let tile;
	for (let i = 0; i < 10; i++) {
		tile = $("#" + (firstTileInRow + i));
		if (!tile.hasClass("occupied") && tile.hasClass("animal")) {
			highlighted.push(firstTileInRow + i);
		}
	}
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {
	
		// if there is an array, highlight them and prompt the user to pick one or do nothing
		if (highlighted.length > 0) {
			for (let i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).addClass("highlight");
			}
			
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click Do Nothing to not place anything.</p>";
			ruleForClicking = 8;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 8)
		}
		// if not, inform the user and prompt them to continue with the robot's turn
		else {
			msg += "<p>There are no unnoccupied animal figures in the current row. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
		}
		$("#continue").show();
	}
	// FOR COMP		
	else {
		// if there is an array, find the best and call calculateRobotChoice
		if (highlighted.length > 0) {
			
			let compChoiceNum = robotSelectBestSpace(highlighted);
			let toPlay = findBestToken(compChoiceNum, false, false);
			
			msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
		}
		// if not, inform the user and prompt them to continue with their turn
		else {
			msg += "<p>There are no unnoccupied animal figures in the current row, so the " + robotName + " did nothing. Click the deck to continue with your turn.</p>";
		}
		
		clearQuestion();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q9(tileNum) {
	let qText = "This space can't be occupied because of hazardous waste. Move two spaces up or down. You may place any token (including a bomb) in one of these spaces if not a question tile. If another player's token is already there and not protected by a defender, you may replace it with your own token of any value.";
	$("#questionCard").text(qText);
	currentQuestion = 9;
	
	// (see questions 10 and 16 for similar logic)
	
	// create an array of the 2 spaces
	if (tileNum - 20 >= 0) {
		highlighted.push(tileNum - 20);
	}
	if (tileNum + 20 <= 99) {
		highlighted.push(tileNum + 20);
	}
	
	let msg = "";
	// FOR USER
	if (playerNum ==0) {
		
		// highlight the relevant spaces
		let tile;
		let validSpacesExist = false;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the user's tile, a question tile, or the comp's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				tile.addClass("highlight");
				validSpacesExist = true;
			} else if (tile.hasClass("player1") && !tile.hasClass("defendedbyplayer1")) {
				tile.addClass("highlight");
				validSpacesExist = true;
			}
		}
		
		if (validSpacesExist) {
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click Do Nothing to not place anything.</p>";
			ruleForClicking = 9;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 9)
		} else {
			msg += "<p>There are no valid places to play a token. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
		}
		
		$("#continue").show();
	}
	// FOR COMP
	else {
		
		// weed out the spaces that aren't valid
		let compChoices = [];
		let userToken = false;
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the comp's tile, a question tile, or the user's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				compChoices.push(highlighted[i]);
			} else if (tile.hasClass("player0") && !tile.hasClass("defendedbyplayer0")) {
				compChoices.push(highlighted[i]);
				userToken = true;
			}
		}
		
		if (compChoices.length > 0) {
			let compChoiceNum = robotSelectBestSpace(compChoices);
			
			let tileDestroyed = false;
			// destroy the user's tile if needed
			if ($("#" + compChoiceNum).hasClass("player0")) {
				handleRule9(0);
				tileDestroyed = true;
			}
			
			let toPlay = findBestToken(compChoiceNum, true, true);
			
			if (toPlay != "nothing") {
				msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum;
				if (tileDestroyed) {
					msg += ", destroying your tile in the process";
				}
				msg += ". Click the deck to continue with your turn.</p>";
			} else {
				msg += "<p>" + robotName + " chose not to play anything. Click the deck to continue with your turn.</p>";
			}
		} else {
			msg += "<p>" + robotName + " wasn't able to play anything. Click the deck to continue with your turn.</p>";
		}
		
		clearQuestion();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q10(tileNum) {
	let qText = "You're feeling adventurous! Move three spaces up or down. If not occupied, you may place any token (including a bomb) in one of these spaces if not a question tile. If occupied, you may place any token in the original space.";
	$("#questionCard").text(qText);
	currentQuestion = 10;
	
	// (see question 16 for similar logic)
	
	// create an array of the 2 additional spaces
	if (tileNum - 30 >= 0) {
		highlighted.push(tileNum - 30);
	}
	if (tileNum + 30 <= 99) {
		highlighted.push(tileNum + 30);
	}
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {
		
		// highlight the relevant spaces
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the user's tile, a question tile, or the comp's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				tile.addClass("highlight");
			}
		}
		// also highlight question space
		highlighted.push(tileNum);
		$("#" + tileNum).addClass("highlight");
		
		if (highlighted.length > 0) {
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click Do Nothing to not place anything.</p>";
			ruleForClicking = 10;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 10)
		} else {
			msg += "<p>There are no valid places to play a token. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
		}
		
		$("#continue").show();
	}
	// FOR COMP
	else {
		
		// weed out the spaces that aren't valid
		let compChoices = [];
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the comp's tile, a question tile, or the user's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				compChoices.push(highlighted[i]);
			}
		}
		// also consider question space
		compChoices.push(tileNum);
		
		if (compChoices.length > 0) {
			let compChoiceNum = robotSelectBestSpace(compChoices);
			let toPlay = findBestToken(compChoiceNum, true, true);
			
			if (toPlay != "nothing") {
				msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
			} else {
				msg += "<p>" + robotName + " chose not to play anything. Click the deck to continue with your turn.</p>";
			}
		} else {
			msg += "<p>" + robotName + " wasn't able to play anything. Click the deck to continue with your turn.</p>";
		}
		
		clearQuestion();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");	
	}
	
	$("#turnDisplay").html(msg);
}

function q11(tileNum) {
	let qText = "You have been granted unlimited authority in this area. You may place any token (except a bomb) on any space in the current column. If another person's token is occupying the space you'd like (and it isn't protected by a defender) you may discard that token and place your own instead.";
	$("#questionCard").text(qText);
	currentQuestion = 11;

	// create an array of unoccupied animal figures in the current column
	let col = tileNum % 10;
	for (let i = 0; i < 100; i++) {
		if (i % 10 == col) {
			highlighted.push(i);
		}
	}
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {
		
		// highlight the relevant spaces
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the user's tile, a question tile, or the comp's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				tile.addClass("highlight");
			} else if (tile.hasClass("player1") && !tile.hasClass("defendedbyplayer1")) {
				tile.addClass("highlight");
			}
		}
		
		if (highlighted.length > 0) {
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click Do Nothing to not place anything.</p>";
			ruleForClicking = 11;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 11)
		} else {
			msg += "<p>There are no valid places to play a token. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
		}
		
		$("#continue").show();
	}
	// FOR COMP
	else {
		
		// weed out the spaces that aren't valid
		let compChoices = [];
		let userToken = false;
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the comp's tile, a question tile, or the user's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				compChoices.push(highlighted[i]);
			} else if (tile.hasClass("player0") && !tile.hasClass("defendedbyplayer0")) {
				compChoices.push(highlighted[i]);
				userToken = true;
			}
		}
		
		if (compChoices.length > 0) {
			let compChoiceNum = robotSelectBestSpace(compChoices);			
			let toPlay = findBestToken(compChoiceNum, true, false);
			
			if (toPlay != "nothing") {
				msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum;
				if (toPlay == "bomb") {
					msg += ", destroying your tile in the process";
				}
				msg += ". Click the deck to continue with your turn.</p>";
			} else {
				msg += "<p>" + robotName + " chose not to play anything. Click the deck to continue with your turn.</p>";
			}
		} else {
			msg += "<p>" + robotName + " wasn't able to play anything. Click the deck to continue with your turn.</p>";
		}
		
		clearQuestion();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");	
	}
	
	$("#turnDisplay").html(msg);
}

let extraTurnUser = false;
let extraTurnComp = false;
function q12(tileNum) {
	let qText = "Congratulations! You have found a bronze coin. It has been added to your inventory.";
	$("#questionCard").text(qText);
	
	let msg = "";
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>Click below to continue with " + robotName + "'s turn.</p>";
		players[0].addBronze();
		$("#continue").html('Continue');
		$("#continue").show();
	} else {
		msg = "<p>Click the deck to continue with your turn.</p>";
		players[1].addBronze();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
	
	
	/*
	let qText = "All the members of your team have suddenly become ill, so you've lost your next turn.";
	$("#questionCard").text(qText);
	
	let msg = "";
	// inform the user what's happening
	if (playerNum === 0) {
		extraTurnComp = true;
		msg = "<div id='robotTurnMsg'><p>Click below to have " + robotName + " take its first turn.</p><button class='buttonHover' type='button' id='compFirstTurn'>Continue</button></div>";
	} else {
		extraTurnUser = true;
		$("#turnChoices").hide();
		msg = "<p>You will now have two turns in a row.</p>";
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
	
	// when the user clicks continue, the computer takes its turn, then the user is prompted to have the comp take its second turn
	$("body").on("click", "#compFirstTurn", function() {
		$("#robotTurnMsg").hide();
		endHumanTurn();
		$("#pickNumber").removeClass("cardHighlight");
		$("#turnChoices").hide();
		$("#robotTurnMsg2").show();
		$("#robotTurnMsg2").html("<p>Click below to have " + robotName + " take its second turn.</p><button class='buttonHover' type='button' id='compSecondTurn'>Continue</button></div>");
	});

	// when the user clicks to have comp take second turn, this makes sure the player
	// stays as comp and then comp takes its turn
	$("body").on("click", "#compSecondTurn", function() {
		extraTurnComp = false;
		$(".robotTurnHighlight").removeClass("robotTurnHighlight");
		$("#robotTurnMsg2").hide();
		playerNum++;
		endHumanTurn();
	});
	*/

}

function q13(tileNum) {
	let qText = "Poachers have attacked! All tokens (both yours and others players') are destroyed in the two spaces above and the two spaces below the question tile if not protected by defenders.";
	$("#questionCard").text(qText);

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
	
	let msg = "";
	// show the user what is happening, prompt them to view the changes if there are any
	 if (playerNum == 0) {
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
			$("#continue").show();
		}
	 }
	 // if it's the robot turn, still explain what is happening, prompt user to view changes
	 else {
		$("#turnChoices").hide();
		
		if (boardChanged) {
			msg += "<p>Click below to view the changes.</p>";
			$("#seeChanges").show();
		} else {
			msg += "<p>No tokens were destroyed. Click the deck to continue with your turn.</p>";
			$("#continue").hide();
			$("#pickNumber").addClass("cardHighlight");
		}
	 }
	 
	 $("#turnDisplay").html(msg);	 
}

function q14(tileNum) {
	let qText = "Your team has discovered valuable information about how to help the animals in this area. You may place any token (except a bomb) in any space surrounding the current question tile.";
	$("#questionCard").text(qText);
	currentQuestion = 14;
	
	// create array of surrounding spaces that are not occupied
	let surSpaces = getSurroundingSpaces(tileNum);
	
  for (i = 0; i < surSpaces.length; i++) {
		if (!$("#" + surSpaces[i]).hasClass("occupied") && !$("#" + surSpaces[i]).hasClass("question")) {
			highlighted.push(surSpaces[i]);
		}
  }
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {
		
		if (highlighted.length > 0) {
			// highlight the tiles
			let tile;
			for (let i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).addClass("highlight");
			}
			
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click Do Nothing to not place anything.</p>";
			ruleForClicking = 14;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 14)
		} else {
			msg += "<p>There are no valid places to play a token. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
		}
		
		$("#continue").show();
	}
	// FOR COMP
	else {
		
		let compChoices = highlighted;
		if (compChoices.length > 0) {
			let compChoiceNum = robotSelectBestSpace(compChoices);
			let toPlay = findBestToken(compChoiceNum, true, false);
			
			if (toPlay != "nothing") {
				msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
			} else {
				msg += "<p>" + robotName + " chose not to play anything. Click the deck to continue with your turn.</p>";
			}
		} else {
			msg += "<p>" + robotName + " wasn't able to play anything. Click the deck to continue with your turn.</p>";
		}
		
		clearQuestion();
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	 $("#turnDisplay").html(msg);	
}

function q15(tileNum) {
	let qText = "Your opponent's team has become stranded in the wilderness, so the next player loses their next turn.";
	$("#questionCard").text(qText);
	
	let msg = "";
	// inform the user what's happening
	if (playerNum === 0) {
		msg = "<p>Click the deck to take another turn.</p>";
		$("#pickNumber").addClass("cardHighlight");
	} else {
		$("#turnChoices").hide();
		$("#pickNumber").removeClass("cardHighlight");
		msg = "<p>Click below to have " + robotName + " take another turn.</p><button class='buttonHover' type='button' id='compTurnAgain'>Continue</button>";
	}
	
	$("#turnDisplay").html(msg);
	
	// this will alternate the player
	playerNum++;
	
	$("body").on("click", "#compTurnAgain", function() {
		endHumanTurn();
	});
	
}

function q16(tileNum) {
	let qText = "Volunteers have arrived to help you further your mission. Move three spaces to the right or to the left. If not occupied, you may place any token (including a bomb) in one of these spaces if not a question tile. If occupied, you may place any token in the original space.";
	$("#questionCard").text(qText);
	
	// (see question 10 for similar logic)

	// determine which tiles are relevant
	highlighted.push(tileNum);
	highlighted.push(tileNum + 3);
	highlighted.push(tileNum - 3);
	
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
		}
		
	}
	
	let msg = "";
	// FOR USER
	if (playerNum == 0) {
		currentQuestion = 16;
		
		// highlight the relevant spaces
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the user's tile, a question tile, or the comp's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				tile.addClass("highlight");
			}
		}
		// also highlight question space
		highlighted.push(tileNum);
		$("#" + tileNum).addClass("highlight");
		
		if (highlighted.length > 0) {
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click Do Nothing to not place anything.</p>";
			ruleForClicking = 10;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 16)
		} else {
			msg += "<p>There are no valid places to play a token. Click below to continue with " + robotName + "'s turn.</p>";
			$("#continue").html('Continue');
		}
		
		$("#continue").show();
	}
	// FOR COMP
	else {
		
		// weed out the spaces that aren't valid
		let compChoices = [];
		let tile;
		for (let i = 0; i < highlighted.length; i++) {
			// they shouldn't have the comp's tile, a question tile, or the user's defended tile or defender
			tile = $("#" + highlighted[i]);
			
			if (!(tile.hasClass("occupied") || tile.hasClass("question"))) {
				compChoices.push(highlighted[i]);
			}
		}
		// also consider question space
		compChoices.push(tileNum);
		
		if (compChoices.length > 0) {
			let compChoiceNum = robotSelectBestSpace(compChoices);
			let toPlay = findBestToken(compChoiceNum, true, true);
				
			if (toPlay != "nothing") {
				msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click the deck to continue with your turn.</p>";
			} else {
				msg += "<p>" + robotName + " chose not to play anything. Click the deck to continue with your turn.</p>";
			}
		} else {
			msg += "<p>" + robotName + " wasn't able to play anything. Click the deck to continue with your turn.</p>";
		}
		
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");	
	}
	
	$("#turnDisplay").html(msg);
		
}

function q17(tileNum) {
	let qText = "A pack of wolves has attacked some of the bison. You must remove a valued token from the bison figure if you have one placed there that isn't protected by a defender.";
	$("#questionCard").text(qText);
	
	destroyTokenOnAnimal("a2", "bison", "Q", tileNum, qText);
}

function q18(tileNum) {
	let qText = "Hunters seeking ivory have entered the elephants' territory. You must remove a valued token from the elephant figure if you have one placed there that isn't protected by a defender.";
	$("#questionCard").text(qText);
	
	destroyTokenOnAnimal("a1", "elephant", "R", tileNum, qText);
}

// this applies to questions 17 and 18
function destroyTokenOnAnimal(animalId, animalName, questionLetter, tileNum, qText) {
	let undefendedPlayer = [];
	let undefendedComp = [];
	
	// create two arrays of all elephant/bison tokens that aren't defended
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
	
	let msg = "";
	// FOR USER
	if (playerNum === 0) {		
		
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
			msg += "<p>You have no undefended tokens on the " + animalName + ". Click below to continue.</p>";
			$("#continue").html('Continue');
			
			$("#continue").show();
		}
	}
	// FOR COMP
	else {
		
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
		
			msg += "<p>" + robotName + " has removed a token from tile " + choice + ". Click the deck to continue with your turn.</p>";
			players[1].destroyToken(choice, 1);
			
		}
		else {
			// if there aren't, inform user and prompt them to move on
			msg += "<p>" + robotName + " has no undefended tokens on the " + animalName + ". Click the deck to continue with your turn.</p>";
		}
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

function q19(tileNum) {
	let qText = "Your opponent keeps getting one step ahead of you! The next player may place any token (except a bomb) in any space surrounding the current question tile.";
	$("#questionCard").text(qText);
	currentQuestion = 19;
	
	// like question 14
	
	// create array of surrounding spaces that are not occupied
	let surSpaces = getSurroundingSpaces(tileNum);
	
    for (i = 0; i < surSpaces.length; i++) {
		if (!($("#" + surSpaces[i]).hasClass("occupied") || $("#" + surSpaces[i]).hasClass("question"))) {
			highlighted.push(surSpaces[i]);
		}
    }
	
	let msg = "";
	// FOR COMP
	if (playerNum == 1) {
		
		if (highlighted.length > 0) {
			// highlight the tiles
			let tile;
			for (let i = 0; i < highlighted.length; i++) {
				$("#" + highlighted[i]).addClass("highlight");
			}
			
			// prompt the user to click on one of these highlighted spaces
			msg += "<p>Please select the space where you would like to place a token, or click the deck to not place anything and continue to your turn.</p>";
			ruleForClicking = 19;
				
			// this then jumps to the end of the code, search for: if (ruleForClicking == 19)
		} else {
			msg += "<p>There are no valid places to play a token. Click the deck to continue with your turn.</p>";
		}
		
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	// FOR USER
	else {
		
		let compChoices = highlighted;
		if (compChoices.length > 0) {
			let compChoiceNum = robotSelectBestSpace(compChoices);
			let toPlay = findBestToken(compChoiceNum, true, false);

			if (toPlay != "nothing") {
				msg += "<p>" + robotName + " played a " + toPlay + " on tile " + compChoiceNum + ". Click below to move on to " + robotName + "'s turn.</p>";
			} else {
				msg += "<p>" + robotName + " chose not to play anything. Click below to move on to " + robotName + "'s turn.</p>";
			}
		} else {
			msg += "<p>" + robotName + " wasn't able to play anything. Click below to move on to " + robotName + "'s turn.</p>";
		}
		
		$(".robotTurnHighlight").removeClass("robotTurnHighlight");
		clearQuestion();
		$("#continue").html('Continue');
		$("#continue").show();
	}
	
	 $("#turnDisplay").html(msg);	
}

function q20(tileNum) {
	let qText = "Your opponent has made the decision to cooperate more with other wildlife organizations. The next player discards one of their bombs if they have one. ";
	$("#questionCard").text(qText);
	
	let msg = "";
	// FOR USER
	if (playerNum === 0) {
		// if comp has a bomb, discard it
		if (players[1].bomb > 0) {
			msg += "<p>" + robotName + " has discarded a bomb.</p><p>Click below to continue.</p>";
			players[1].loseBomb();
		} else {
			msg += "<p>" + robotName + " didn't have any bombs, so nothing was discarded.</p><p>Click below to continue.</p>";	
		}
		$("#continue").html('Continue');
		$("#continue").show();
	}
	// FOR COMP
	else {
		if (players[0].bomb > 0) {
			msg += "<p>One of your bombs has been discarded.</p><p>Click the deck to continue with your turn.</p>";
			players[0].loseBomb();
		} else {
			msg += "<p>You didn't have any bombs, so nothing was discarded.</p><p>Click the deck to continue with your turn.</p>";	
		}
		$("#turnChoices").hide();
		$("#pickNumber").addClass("cardHighlight");
	}
	
	$("#turnDisplay").html(msg);
}

// handle the user's choice for when something needs to be selected
$("body").on("click", ".highlight", function() {
	$('html, body').animate({
			scrollTop: $("#turnDiv").offset().top
	}, 1000);
	questionTileChoice = this.id;
	let msg = "";
	if (ruleForClicking == 2) {
		// ask the user what they want to do on this space, or invite them to choose a different space
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select which coin to play on this tile instead, or select a different tile. Or click Do Nothing to not select anything.</p>";
		
		displayTurnChoicesRule2(); // after the user selects a button, it goes to the function handleRule2()
		
	} else if (ruleForClicking == 6) {
		// ask the user what they want to do on this space, or invite them to choose a different space
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select what to place on this tile, or select a different one.</p>";
		displayTurnChoices();
		hideButtons(true, false);
	} else if (ruleForClicking == 7) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Click below to place a single token from " + robotName + " and continue to its turn, or select a different one.</p><button class='buttonHover' id='playRobotToken' onclick='playRobotToken()'>Place " + robotName + "'s token</button>";
	} else if (ruleForClicking == 8) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select what to place on this tile, or select a different tile. Or click Do Nothing to not select anything.</p>";
		displayTurnChoices();
		hideButtons(true, true);
	} else if (ruleForClicking == 9) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select what to place on this tile, or select a different tile. Or click Do Nothing to not select anything.</p>";
		displayTurnChoices();
		hideButtons(false, false);
		
		if ($("#" + questionTileChoice).hasClass("occupied")) {
			$("#playBomb").hide();
			$("#playDefender").hide();
		} else {
			$("#playBomb").show();
			$("#playDefender").show();
		}
	} else if (ruleForClicking == 10 || ruleForClicking == 16) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select what to place on this tile, or select a different tile. Or click Do Nothing to not select anything.</p>";
		displayTurnChoices();
		hideButtons(false, false);
	} else if (ruleForClicking == 11 || ruleForClicking == 14) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select what to place on this tile, or select a different tile. Or click Do Nothing to not select anything.</p>";
		displayTurnChoices();
		hideButtons(true, false);
	} else if (ruleForClicking == 18) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Click below to remove this token, or select a different one.</p><button class='buttonHover' id='removeToken' onclick='removeToken(" + this.id + ")'>Remove Token</button>";
	} else if (ruleForClicking == 19) {
		msg = "<p>You have chosen tile <b>" + this.id + "</b>. Select what to place on this tile, or select a different tile. Or click the deck to not select anything.</p>";
		msg += "<p>As soon as you make a choice, the game will continue to your turn.</p>";
		
		displayTurnChoices();
		hideButtons(true, false);
	} 
	
	$("#turnDisplay").html(msg);
});

function hideButtons(hideBomb, hideDefender) {
	$("#turnText").hide();
	$("#doNothing").hide();
	
	if (hideBomb) {
		$("#playBomb").hide();
	}
	if (hideDefender) {
		$("#playDefender").hide();
	}
}

function removeToken(tileNum) {
	players[0].destroyToken(tileNum, 0);
	$("#removeToken").hide();
	
	clearQuestion();
	$("#continue").show();
	$("#continue").html("Continue");
	$("#turnDisplay").html("<p>Your token has been removed. Click below to continue with " + robotName + "'s turn.</p>");
}

function playRobotToken() {
	$("#playRobotToken").hide();
	$("#pickNumber").addClass("cardHighlight");
	
	players[1].playPlain(questionTileChoice);
	clearQuestion();
	endHumanTurn();
}

$("body").keydown(function(e) {
	var x = event.which || event.keyCode;
	switch(x) {
		case 54: // 6
			if ($("#playGold").is(":visible")) {
				handlePlayGold();
			}
			break;
		case 52: // 4
			if ($("#playSilver").is(":visible")) {
				handlePlaySilver();
			}
			break;
		case 50: // 2
			if ($("#playBronze").is(":visible")) {
				handlePlayBronze();
			}
			break;
		case 49: // 1
			if ($("#playPlain").is(":visible")) {
				handlePlayPlain();
			}
			break;
		case 68: // d
			if ($("#playDefender").is(":visible")) {
				handlePlayDefender();
			}
			break;
		case 66: // b
			if ($("#playBomb").is(":visible")) {
				handlePlayBomb();
			}
			break;
		case 78: // n
			if ($("#doNothing").is(":visible")) {
				handleDoNothing();
			} else if ($("#continue").is(":visible")) {
				handleContinue();
			}
			break;
		case 67: // c
			if ($("#continue").is(":visible")) {
				handleContinue();
			} else if ($("#compTurnAgain").is(":visible")) {
				handleContinue();
			}
			break;
		case 82: // r
			if ($("#questionTile").is(":visible")) {
				flipQuestion();
			}
			break;
		case 32: // space
			if ($("#pickNumber").is(":visible") &&
				$("#pickNumber").hasClass("cardHighlight")) {
				handlePickNumber();
			}
			break;
	}
});

$("#muteIcon").click(function() {
	$("#muteIcon").hide();
	$("#playingIcon").show();
	$("#playAudio").trigger('play');
	
	var playAudio = document.getElementById("playAudio");
	playAudio.volume = 0.2;
	
	var playCardSound = document.getElementById("playCardSound");
	playCardSound.volume = 0.1;
	
	var playBombSound = document.getElementById("playBombSound");
	playBombSound.volume = 0.1;
	
	var playQuestionSound  = document.getElementById("playQuestionSound");
	playQuestionSound.volume = 0.2;
	
	var playTokenSound = document.getElementById("playTokenSound");
	playTokenSound.volume = 0.1;

	var endGameSound = document.getElementById("endGameSound");
	endGameSound.volume = 0.4;
});

$("#playingIcon").click(function() {
	$("#playingIcon").hide();
	$("#muteIcon").show();
	$("#playAudio").trigger('pause');
});

$("#playAgain").click(function() {
	location.reload();
});
