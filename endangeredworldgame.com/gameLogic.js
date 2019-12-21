// the Player object will keep track of tokens and points
function Player(num, name, gold, silver, bronze, defender, bomb) {
  this.num = num;
  this.name = name;
  this.gold = gold;
  this.silver = silver;
  this.bronze = bronze;
  this.defender = defender;
  this.bomb = bomb;
  
  this.playGold = function() {
	  this.gold--;
	  this.addTokenClass("gold");
	  this.display();
  }
  
  this.playSilver = function() {
	  this.silver--;
	  this.addTokenClass("silver");
	  this.display();
  }
  
  this.playBronze = function() {
	  this.bronze--;
	  this.addTokenClass("bronze");
	  this.display();
  }
  
  this.playDefender = function() {
	  this.defender--;
	  this.addTokenClass("defender");
	  this.display();
  }
  
  this.playBomb = function() {
	  this.bomb--;
	  this.addTokenClass("bomb");
	  this.display();
  }
  
  // display current statistics
  this.display = function() {
    var string = "<b><u>" + this.name + "</u></b><br>";
	string += "Gold x " + this.gold + "<br>";
	string += "Silver x " + this.silver + "<br>";
	string += "Bronze x " + this.bronze + "<br>";
	string += "Defender x " + this.defender + "<br>";
	string += "Bomb x " + this.bomb + "<br><br>";
		
	$("#tokenDisplay" + (this.num)).html(string);
  }
  
  this.addTokenClass = function(type) {
	// note what token it is and what player played it
	var tile = $("#" + bag.getCurrent());
	tile.addClass(type);
	tile.addClass("player" + num);
	
	// add the relevant picture to the board
	tile.text("");
	tile.append("<img src='images/tokens/" + type + playerNum + ".png' alt='token' style='width:20px;height:20px;'>");
  }

}

// the NumberBag object will keep track of the numbers that are drawn
function NumberBag() {
	var numberBag = [];
	var previousNumber = -1;
	var currentNumber = -1;
	
	// fill up the number bag array
	this.fillBag = function() {
		for (var i = 0; i < 5; i++) {
			numberBag.push(i);
		}
	}
	
	this.randomize = function() {
		// take the highlight away from the previous number
		if ($("#" + previousNumber).hasClass("current")) {
			$("#" + previousNumber).removeClass("current");
		}
		
		// choose a random number from what's left in the number bag
		var randInd = Math.floor(Math.random() * numberBag.length);
		currentNumber = numberBag[randInd];
		
		// discard that random tile
		var usedTile = numberBag.indexOf(currentNumber);
		if (usedTile !== -1) numberBag.splice(usedTile, 1);
		
		// keep track of previous number to remove the highlight later
		previousNumber = currentNumber;
		
		// highlight the current tile in red
		var tile = $("#" + currentNumber);
		tile.addClass("current");
		
		return currentNumber;
	}
	
	this.checkIfEnd = function() {
		console.log(numberBag.length);
		if (numberBag.length == 0) {
			return true;
		} else {
			return false;
		}
	}
	
	this.getCurrent = function() {
		return currentNumber;
	}
}

/******************************************* USER TURN *******************************************/
var playerNum = 1;

// start the user's turn when "Draw a Number" is clicked
$("#pickNumber").click(function() {
	$("#pickNumber").hide();
	
	// draw a random number
	var tileNum = drawNumber();
	console.log(bag.getCurrent());
	
	// take a turn with that number
	takeTurn(tileNum);
});

// this function will be the same for both the user and computer
function drawNumber() {
	
	// IMPORTANT: keeps the players alernating
	playerNum = (playerNum + 1) % 2;
	
	// return a random number
	var rand = bag.randomize();
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
$("#playDefender").click(function() {
	players[playerNum].playDefender();
	endTurn();
});
$("#playBomb").click(function() {
	players[playerNum].playBomb();
	endTurn();
});

// start the robot's turn
function endTurn() {
	if (!bag.checkIfEnd()) {
		var tileNum = drawNumber();
		takeTurn(tileNum);
	} else {
		alert("Game over!")
	}
	
	if (bag.checkIfEnd()) {
		alert("Game over!")
	} else {
		$("#pickNumber").show();
	}
}

/******************************************* BOARD SETUP *******************************************/

// set the board up initially
var boardSetUp = false;
var placementError = false;
$("#setBoard").click(function() {
	clearBoard();
	boardSetUp = false;
	placementError = false;
	while (boardSetUp == false) {
		setUpBoard();
	}
});

// place all the animal figures and question tiles on the board
function setUpBoard() {
	
	// place 1 very large animal
	placeAnimal(4, 3, 1);
	// place 2 large animals	
	for (var i = 2; i < 4; i++) {
		placeAnimal(4, 2, i);
	}
	// place 3 medium animals
	for (var i = 4; i < 7; i++) {
		placeAnimal(3, 2, i);
	}
	// place 4 small animals
	for (var i = 7; i < 11; i++) {
		placeAnimal(2, 2, i);
	}
	// place 4 very small animals
	for (var i = 11; i < 15; i++) {
		placeAnimal(2, 1, i);
	}
	// place 1 very small animals (lynx)
	placeAnimal(1, 2, 15);
	
	
	if (placementError) {
		clearBoard();
	} else {
		// place 25 question tiles
		for (var i = 1; i <= 20; i++) {
			placeQuestions(i);
		}
		
		// we can move on now that the board is properly set up
		boardSetUp = true;
	}
}

// properly clear the board to randomize again if user wants to
function clearBoard() {
	for (var i = 0; i < 100; i++) {
		var tile = $("#" + i);
		if (tile.hasClass("filled")) {
			tile.removeClass("filled");
			tile.addClass("free");
			tile.css('background-image', 'none');
			
			// remove individual ids if there are any
			for (var j = 1; j < 16; j++) {
				if (tile.hasClass(j.toString())) {
					tile.removeClass(j.toString());
				}
			}
		}
		if (tile.hasClass("question")) {
			for (var j = 1; j < 21; j++) {
				if (tile.hasClass("q" + j.toString())) {
					tile.removeClass("q" + j.toString());
				}
			}
		}
		tile.text(i);
	}
}

// place an animal on the board based on its width and height (the third parameter is the animal's id)
function placeAnimal(w, h, id) {
	
	var tries = 0;
	var placed = false;
	while (!placed || tries > 10000) {
		// determine an initial candidate for the top left corner of the animal
		var rand = Math.floor(Math.random() * 100);
		
		// check if there's enough space to the right
		var col = rand % 10;
		if (10 - col >= w) {
			// because it fits, we just move on to check other conditions
		} else {
			// because it doesn't fit, we start over with another random number
			continue;
		}
		
		// check if there's enough space below
		var row = Math.floor(rand / 10);
		
		if (10 - row >= h) {
			// because it fits, we just move on to check other conditions
		} else {
			// because it doesn't fit, we start over with another random number
			continue;
		}
		
		// check if all needed spaces are free
		// create an array of needed spaces
		var animalTiles = [];
		var leftCorner = rand;
		var c = col;
		var r = row;
		var rightCol = c + w;
		var bottomRow = r + h;
		
		// make one exception for the vertical lynx
		if (id == 15) {
			animalTiles.push(leftCorner);
			animalTiles.push(leftCorner + 10);
		} else {
			for ( ; c < rightCol; c++) {
				var temp = leftCorner;
				for ( ; r < bottomRow; r++) {
					animalTiles.push(temp);
					temp = temp + 10;
				}
				leftCorner++;
				r = row;
			}
		}
		animalTiles.sort(function(a,b){return a - b})
		
		var spaceIsFilled = false;
		// check each space to see if it is free
		for (var i = 0; i < animalTiles.length; i++) {
			var tile = $("#" + animalTiles[i]);
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
		for (var i = 0; i < animalTiles.length; i++) {
			var tile = $("#" + animalTiles[i]);
			tile.removeClass("free");
			tile.addClass("filled");
			tile.addClass(id.toString());
			
			
			var imageUrl = "images/" + id + "/" + (i + 1) + ".jpg";
			tile.css('background-image', 'url(' + imageUrl + ')');
			tile.css('background-size', '32px 32px');
			
			
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

// place the 20 question tiles in free places
function placeQuestions(id) {
	
	var placed = false;
	while (!placed) {
		// determine an initial candidate for the question
		var rand = Math.floor(Math.random() * 100);
		var tile = $("#" + rand);
		
		// if it's free, we make it filled and designate that it's a question
		if (tile.hasClass("free")) {
			tile.removeClass("free");
			tile.addClass("filled");
			tile.addClass("question");
			tile.addClass("q" + id);
			
			// remove number and add image
			tile.text("");
			tile.css('background-image', 'url(images/questionTile.jpg)');
			tile.css('background-size', '32px 32px');
			
			// break the loop because we placed the question
			placed = true;
		}
	}
	
}

var bag;
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
var players = [];
function fillTokens() {
	var player = new Player(0, "Liz", 2, 5, 8, 5, 5);
	var comp = new Player(1, "Robot", 2, 5, 8, 5, 5);
	players.push(player);
	players.push(comp);
	
	console.log(players);
}