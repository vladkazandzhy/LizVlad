var boardSetUp = false;
var placementError = false;

$(document).ready(function() {
	
});

$("#setBoard").click(function() {
	clearBoard();
	boardSetUp = false;
	placementError = false;
	while (boardSetUp == false) {
		setUpBoard();
	}
});

$("#startGame").click(function() {
	$("#setBoard").hide();
	$("#startGame").hide();
	$("#pickNumber").show();
	
	fillNumberBag();
	fillTokens(2);
	displayTokens();
});

var numberBag = [];
function fillNumberBag() {
	for (var i = 0; i < 100; i++) {
		numberBag.push(i);
	}
	console.log(numberBag);
}

function Player(type, name, playerNumber, gold, silver, bronze, defender, bomb) {
  this.type = type;
  this.name = name;
  this.playerNumber = playerNumber;
  this.gold = gold;
  this.silver = silver;
  this.bronze = bronze;
  this.defender = defender;
  this.bomb = bomb;
  
  this.stats = function() {
    var string = "<b><u>" + this.name + "</u></b><br>";
	string += "Gold x " + this.gold + "<br>";
	string += "Silver x " + this.silver + "<br>";
	string += "Bronze x " + this.bronze + "<br>";
	string += "Defender x " + this.defender + "<br>";
	string += "Bomb x " + this.bomb + "<br><br>";
	
	return string;
  }
  
  this.getPlayerNum = function() {
	  return this.playerNumber;
  }
}

var players = [];
function fillTokens(numPlayers) {
	if (numPlayers == 2) {
		var player1 = new Player("human", "Liz", 1, 2, 5, 8, 5, 5);
		var player2 = new Player("comp", "Robot", 2, 2, 5, 8, 5, 5);
		players.push(player1);
		players.push(player2);
	}
	console.log(players);
}

function displayTokens() {
	for (var i = 0; i < players.length; i++) {
		$("#tokenDisplay" + (i + 1)).html(players[i].stats());
	}
}

var previousNumber = -1;
$("#pickNumber").click(function() {
	// take the highlight away from the previous number
	if ($("#" + previousNumber).hasClass("current")) {
		$("#" + previousNumber).removeClass("current");
	}
	
	// choose a random number from what's left in the number bag
	var randInd = Math.floor(Math.random() * numberBag.length);
	var rand = numberBag[randInd];
	
	// discard that random tile
	var usedTile = numberBag.indexOf(rand);
	if (usedTile !== -1) numberBag.splice(usedTile, 1);
	
	console.log(rand);
	console.log("There are " + numberBag.length + " numbers remaining.");
	
	// keep track of previous number to remove the highlight later
	previousNumber = rand;
	
	$("#playerNum").text(1);
	takeTurn(rand);
});

function takeTurn(rand) {
	var tile = $("#" + rand);
	tile.addClass("current");
	
	$("#turnDisplay").text("You picked " + rand + ". What would you like to do?");
	$("#turnChoices").show();
	
	// to-do: place this elsewhere because it doesn't fit here
	if (numberBag.length == 0) {
		alert("Game over!")
	}
}

$("#doNothing").click(function() {
	console.log("turn");
});
$("#playGold").click(function() {
	console.log("turn");
});
$("#playSilver").click(function() {
	console.log("turn");
});
$("#playBronze").click(function() {
	console.log("turn");
});
$("#playDefender").click(function() {
	console.log("turn");
});
$("#playBomb").click(function() {
	console.log("turn");
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

// this function places the 20 question tiles in free places
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