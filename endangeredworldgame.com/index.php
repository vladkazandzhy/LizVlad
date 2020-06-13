<html>
  <head>
    <title>Endangered World Game</title>
	<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <link rel="stylesheet" href="styles.css" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
	<noscript>
		<div id="noscript">
			<img src="images/warning.png" alt="warning symbol" id="warning">
			<p>This website requires JavaScript to function properly.
			<a href="http://www.enable-javascript.com/" target="_blank">Click here</a> to
			learn how to enable JavaScript in your web browser.</p>
		</div>
	</noscript>
	<audio id="playAudio" loop>
		<source src="audio/jungleTheme.mp3" type="audio/mpeg">
		<source src="audio/jungleTheme.ogg" type="audio/ogg">
		<source src="audio/jungleTheme.wav" type="audio/wav">
	</audio>
	<audio id="playCardSound">
		<source src="audio/card.mp3" type="audio/mpeg">
		<source src="audio/card.ogg" type="audio/ogg">
		<source src="audio/card.wav" type="audio/wav">
	</audio>
	<audio id="playBombSound">
		<source src="audio/bomb.mp3" type="audio/mpeg">
		<source src="audio/bomb.ogg" type="audio/ogg">
		<source src="audio/bomb.wav" type="audio/wav">
	</audio>
	<audio id="playQuestionSound">
		<source src="audio/question.mp3" type="audio/mpeg">
		<source src="audio/question.ogg" type="audio/ogg">
		<source src="audio/question.wav" type="audio/wav">
	</audio>
	<audio id="playTokenSound">
		<source src="audio/token.mp3" type="audio/mpeg">
		<source src="audio/token.ogg" type="audio/ogg">
		<source src="audio/token.wav" type="audio/wav">
	</audio>
	<audio id="endGameSound">
		<source src="audio/finalScore.mp3" type="audio/mpeg">
		<source src="audio/finalScore.ogg" type="audio/ogg">
		<source src="audio/finalScore.wav" type="audio/wav">
	</audio>
	
	<div id="intro">
		<h1>Welcome to Endangered World!</h1>
		<p>Endangered World is a new and exciting board game! Today, you'll
		be playing against a robot named <span id="robotNameIntro">Robot</span>,
		but when you buy the physical board game, you can play with up to four people.</p>
		<p>If you've purchased full game access in our <a href="#">Kickstarter campaign</a>, please enter your email and click Load Full Game.</p>
		<input type="email" id="email" name="email" autocomplete="on">
		<button class="buttonHover" type="button" id="loadFullGame">Load Full Game</button>
		<p>Otherwise, click Load Trial Game below. You'll be able to play the first half of the game.</p>
		<button class="buttonHover" type="button" id="loadTrialGame">Load Trial Game</button>
		<p>First time playing? Click below to read the rules.</p>
		<div id="rules">
			<h1>What's the game about?</h1>
			<p>The animal population is dwindling, and it's up to you to
			save them! Embark on a mission to protect endangered
			species from all over the world&mdash;otters, pandas, rhinos,
			and more. But watch out! Other wildlife organizations may
			end up getting in your way, and you never know what
			twists and turns might ruin your well-considered plans.
			How will you use your resources, and how many animals
			can you save?</p>
			<h1>How do I play?</h1>
			<p>You and the robot will take turns drawing cards. Each card matches up with a tile
			on the game board. All you have to do is decide what to play! Here are your choices:</p>
			<ul>
				<li><b>Gold</b> coin - 6 points</li>
				<li><b>Silver</b> coin - 4 points</li>
				<li><b>Bronze</b> coin - 2 points</li>
				<li><b>Plain</b> token - 1 point</li>
				<li><b>Defender</b> - protects all your surrounding tokens from being destroyed</li>
				<li><b>Bomb</b> - destroys all your opponent's undefended tokens in the surrounding spaces</li>
			</ul>
			<p>There are also 20 "Twists & Turns" cards that will have different instructions to follow
			and can really throw the game for a loop!</p>
			<h1>How is the game scored?</h1>
			<p>Your objective is the score the most points by saving the most animals. At the end of the game,
			the score is calculated based on how many points each player has on each animal:</p>
			<ul>
				<li>If there are no tokens on it, or if there is an equal number of points
				on it, then nobody wins that animal.</li>
				<li>If you have more points on it, you win the animal.</li>
				<li>If the robot has more points on it, it wins the animal.</li>
			</ul>
			<hr>
			<p>The number of points gained from each animal depends on the animal's size:</p>
			<ul>
				<li>5 very small animals (2 x 1) - <b>20 points</b> each</li>
				<li>4 small animals (2 x 2) - <b>30 points</b> each</li>
				<li>3 medium animals (3 x 2) - <b>40 points</b> each</li>
				<li>2 large animals (4 x 2) - <b>50 points</b> each</li>
				<li>1 very large animal (4 x 3) - <b>60 points</b></li>
			</ul>
			<p>Lastly, each unused bomb earns a player <b>10 points</b>, so be careful how you use your bombs!</p>
			<h1>Anything else I should know?</h1>
			<p>If you're on a computer, these keyboard shortcuts might come in handy while you play:</p>
			<ul>
				<li><b>space</b> - draw card</li>
				<li><b>6</b> - play gold coin</li>
				<li><b>4</b> - play silver coin</li>
				<li><b>2</b> - play bronze coin</li>
				<li><b>1</b> - play plain token</li>
				<li><b>d</b> - play defender</li>
				<li><b>b</b> - play bomb</li>
				<li><b>n</b> - do nothing</li>
				<li><b>c</b> - continue</li>
				<li><b>r</b> - read question tile</li>
			</ul>
			<p>If you want to reference these during the game, just click the icon above the cards.</p>
			<p>That's all! Enjoy your game!</p>
			<button class="buttonHover" type="button" id="returnToTop">Return to Top</button>
		</div>
		<button class="buttonHover" type="button" id="readRules">How to Play</button>
	</div>
	<div id="container">
		
		<div id="main" class="element">
			<div id="topSection">
				<div id="audioSection">
					<img id="playingIcon" class="audioIcons" src="images/audioIcon.png">
					<img id="muteIcon" class="audioIcons" src="images/muteIcon.png">
				</div>
				<div id="inventory">
					<div id="userInventory">
						<table>
							<tr>
								<td id="userName">You</td>
								<td>
									<img class="token" src="images/tokens/gold.png">
									<span id="userGold">2</span>
								</td>
								<td>
									<img class="token" src="images/tokens/silver.png">
									<span id="userSilver">5</span>
								</td>
								<td>
									<img class="token" src="images/tokens/bronze.png">
									<span id="userBronze">8</span>
								</td>
								<td>
									<img class="token" src="images/tokens/plain0.png">
									<span id="userPlain">50</span>
								</td>
								<td>
									<img class="token" src="images/tokens/defender.png">
									<span id="userDefender">5</span>
								</td>
								<td>
									<img class="token" src="images/tokens/bomb.png">
									<span id="userBomb">5</span>
								</td>
							</tr>
						</table>
					</div>
					<div id="compInventory">
						<table>
							<tr>
								<td id="robotName">Robot</td>
								<td>
									<img class="token" src="images/tokens/gold.png">
									<span id="compGold">2</span>
								</td>
								<td>
									<img class="token" src="images/tokens/silver.png">
									<span id="compSilver">5</span>
								</td>
								<td>
									<img class="token" src="images/tokens/bronze.png">
									<span id="compBronze">8</span>
								</td>
								<td>
									<img class="token" src="images/tokens/plain1.png">
									<span id="compPlain">50</span>
								</td>
								<td>
									<img class="token" src="images/tokens/defender.png">
									<span id="compDefender">5</span>
								</td>
								<td>
									<img class="token" src="images/tokens/bomb.png">
									<span id="compBomb">5</span>
								</td>
							</tr>
						</table>
					</div>
				</div>
			</div>
			<table class="tg" id="board">
			  <tr>
				<th class="tg-nk3j"></th>
				<th class="tg-nk3j">0</th>
				<th class="tg-nk3j">1</th>
				<th class="tg-nk3j">2</th>
				<th class="tg-nk3j">3</th>
				<th class="tg-nk3j">4</th>
				<th class="tg-nk3j">5</th>
				<th class="tg-nk3j">6</th>
				<th class="tg-nk3j">7</th>
				<th class="tg-nk3j">8</th>
				<th class="tg-nk3j">9</th>
			  </tr>
			  <tr>
				<td class="tg-nk3j">0</td>
				<td id="0" class="tg-kbpn">0</td>
				<td id="1" class="tg-m0sm">1</td>
				<td id="2" class="tg-trb7">2</td>
				<td id="3" class="tg-g3ez">3</td>
				<td id="4" class="tg-ih6r">4</td>
				<td id="5" class="tg-s8c7">5</td>
				<td id="6" class="tg-966n">6</td>
				<td id="7" class="tg-qhoq">7</td>
				<td id="8" class="tg-0qvf">8</td>
				<td id="9" class="tg-vwxq">9</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">1</td>
				<td id="10" class="tg-m0sm">10</td>
				<td id="11" class="tg-m0sm">11</td>
				<td id="12" class="tg-trb7">12</td>
				<td id="13" class="tg-g3ez">13</td>
				<td id="14" class="tg-ih6r">14</td>
				<td id="15" class="tg-s8c7">15</td>
				<td id="16" class="tg-966n">16</td>
				<td id="17" class="tg-qhoq">17</td>
				<td id="18" class="tg-0qvf">18</td>
				<td id="19" class="tg-vwxq">19</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">2</td>
				<td id="20" class="tg-trb7">20</td>
				<td id="21" class="tg-trb7">21</td>
				<td id="22" class="tg-trb7">22</td>
				<td id="23" class="tg-g3ez">23</td>
				<td id="24" class="tg-ih6r">24</td>
				<td id="25" class="tg-s8c7">25</td>
				<td id="26" class="tg-966n">26</td>
				<td id="27" class="tg-qhoq">27</td>
				<td id="28" class="tg-0qvf">28</td>
				<td id="29" class="tg-vwxq">29</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">3</td>
				<td id="30" class="tg-g3ez">30</td>
				<td id="31" class="tg-g3ez">31</td>
				<td id="32" class="tg-g3ez">32</td>
				<td id="33" class="tg-g3ez">33</td>
				<td id="34" class="tg-ih6r">34</td>
				<td id="35" class="tg-s8c7">35</td>
				<td id="36" class="tg-966n">36</td>
				<td id="37" class="tg-qhoq">37</td>
				<td id="38" class="tg-0qvf">38</td>
				<td id="39" class="tg-vwxq">39</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">4</td>
				<td id="40" class="tg-ih6r">40</td>
				<td id="41" class="tg-ih6r">41</td>
				<td id="42" class="tg-ih6r">42</td>
				<td id="43" class="tg-ih6r">43</td>
				<td id="44" class="tg-ih6r">44</td>
				<td id="45" class="tg-s8c7">45</td>
				<td id="46" class="tg-966n">46</td>
				<td id="47" class="tg-qhoq">47</td>
				<td id="48" class="tg-0qvf">48</td>
				<td id="49" class="tg-vwxq">49</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">5</td>
				<td id="50" class="tg-s8c7">50</td>
				<td id="51" class="tg-s8c7">51</td>
				<td id="52" class="tg-s8c7">52</td>
				<td id="53" class="tg-s8c7">53</td>
				<td id="54" class="tg-s8c7">54</td>
				<td id="55" class="tg-s8c7">55</td>
				<td id="56" class="tg-966n">56</td>
				<td id="57" class="tg-qhoq">57</td>
				<td id="58" class="tg-0qvf">58</td>
				<td id="59" class="tg-vwxq">59</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">6</td>
				<td id="60" class="tg-966n">60</td>
				<td id="61" class="tg-966n">61</td>
				<td id="62" class="tg-966n">62</td>
				<td id="63" class="tg-966n">63</td>
				<td id="64" class="tg-966n">64</td>
				<td id="65" class="tg-966n">65</td>
				<td id="66" class="tg-966n">66</td>
				<td id="67" class="tg-qhoq">67</td>
				<td id="68" class="tg-0qvf">68</td>
				<td id="69" class="tg-vwxq">69</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">7</td>
				<td id="70" class="tg-qhoq">70</td>
				<td id="71" class="tg-qhoq">71</td>
				<td id="72" class="tg-qhoq">72</td>
				<td id="73" class="tg-qhoq">73</td>
				<td id="74" class="tg-qhoq">74</td>
				<td id="75" class="tg-qhoq">75</td>
				<td id="76" class="tg-qhoq">76</td>
				<td id="77" class="tg-qhoq">77</td>
				<td id="78" class="tg-0qvf">78</td>
				<td id="79" class="tg-vwxq">79</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">8</td>
				<td id="80" class="tg-0qvf">80</td>
				<td id="81" class="tg-0qvf">81</td>
				<td id="82" class="tg-0qvf">82</td>
				<td id="83" class="tg-0qvf">83</td>
				<td id="84" class="tg-0qvf">84</td>
				<td id="85" class="tg-0qvf">85</td>
				<td id="86" class="tg-0qvf">86</td>
				<td id="87" class="tg-0qvf">87</td>
				<td id="88" class="tg-0qvf">88</td>
				<td id="89" class="tg-vwxq">89</td>
			  </tr>
			  <tr>
				<td class="tg-nk3j">9</td>
				<td id="90" class="tg-vwxq">90</td>
				<td id="91" class="tg-vwxq">91</td>
				<td id="92" class="tg-vwxq">92</td>
				<td id="93" class="tg-vwxq">93</td>
				<td id="94" class="tg-vwxq">94</td>
				<td id="95" class="tg-vwxq">95</td>
				<td id="96" class="tg-vwxq">96</td>
				<td id="97" class="tg-vwxq">97</td>
				<td id="98" class="tg-vwxq">98</td>
				<td id="99" class="tg-vwxq">99</td>
			  </tr>
			</table>
			<div id="setupBoard">
				<button class="buttonHover" type="button" id="setBoard">Set Up the Board</button><br>
				<button class="buttonHover" type="button" id="startGame">Start the Game!</button>
			</div>
		</div>

		<div id="mainRight">
			<div id="main2">
				<div id="cards">
					<div id="shortcutDiv"><a href="#" title="<u>Shortcuts:</u><ul>
				<li><b>space</b> - draw card</li>
				<li><b>6</b> - play gold coin</li>
				<li><b>4</b> - play silver coin</li>
				<li><b>2</b> - play bronze coin</li>
				<li><b>1</b> - play plain token</li>
				<li><b>d</b> - play defender</li>
				<li><b>b</b> - play bomb</li>
				<li><b>n</b> - do nothing</li>
				<li><b>c</b> - continue</li>
				<li><b>r</b> - read question tile</li>
			</ul>"><img id="shortcutIcon" src="images/shortcut.png"></a></div>
					<div id="cardStack">
						<img id="pickNumber" class="cardHighlight" alt="back of card" src="images/cards/back.jpg">
						<img id="cardFront" alt="front of card" src="images/cards/0.jpg">
					</div>
					<div id="cardsLeft"></div>
				</div>
				
				<div id="turnDiv">
					<div id="questionCard"></div>
					<div id="turnDisplay"></div>
					<img class="buttonHover" id="questionTile" alt="question tile" src="images/questions/1.png">
					
					
					<p id="tokenExists"></p>
					<div id="turnChoices">
						<div class="tokenRow">
						  <img class="buttonHover playToken" id="playGold" alt="gold coin" src="images/tokens/gold.png">
						  <img class="buttonHover playToken" id="playSilver" alt="gold coin" src="images/tokens/silver.png">
						  <img class="buttonHover playToken" id="playBronze" alt="gold coin" src="images/tokens/bronze.png">
						  <img class="buttonHover playToken" id="playPlain" alt="gold coin" src="images/tokens/plain0.png">
						</div>
						<div class="tokenRow">
						  <img class="buttonHover playToken" id="playDefender" class="playToken" alt="gold coin" src="images/tokens/defender.png">
						  <img class="buttonHover playToken" id="playBomb" class="playToken" alt="gold coin" src="images/tokens/bomb.png">
						</div>
					  <button class="buttonHover" type="button" id="doNothing">Do Nothing</button>
					  <!--
					  <button type="button" id="playGold">Gold Coin</button>
					  <button type="button" id="playSilver">Silver Coin</button>
					  <button type="button" id="playBronze">Bronze Coin</button>
					  <button type="button" id="playPlain">Plain Token</button>
					  <button type="button" id="playDefender">Defender</button>
					  <button type="button" id="playBomb">Bomb</button>
					  <button type="button" id="doNothing">Do Nothing</button>
					  -->
					</div>
					
					<div id="turnChoicesComp">
						<div class="tokenRow">
						  <img id="playGoldComp" class="playToken" alt="gold coin" src="images/tokens/gold.png">
						  <img id="playSilverComp" class="playToken" alt="gold coin" src="images/tokens/silver.png">
						  <img id="playBronzeComp" class="playToken" alt="gold coin" src="images/tokens/bronze.png">
						  <img id="playPlainComp" class="playToken" alt="gold coin" src="images/tokens/plain1.png">
						</div>
						<div class="tokenRow">
						  <img id="playDefenderComp" class="playToken" alt="gold coin" src="images/tokens/defender.png">
						  <img id="playBombComp" class="playToken" alt="gold coin" src="images/tokens/bomb.png">
						</div>
					  <!--
					  <button type="button" id="playGold">Gold Coin</button>
					  <button type="button" id="playSilver">Silver Coin</button>
					  <button type="button" id="playBronze">Bronze Coin</button>
					  <button type="button" id="playPlain">Plain Token</button>
					  <button type="button" id="playDefender">Defender</button>
					  <button type="button" id="playBomb">Bomb</button>
					  <button type="button" id="doNothing">Do Nothing</button>
					  -->
					</div>
					<div id='robotTurnMsg2'></div>
					<button class="buttonHover" type="button" id="playDefenderRule3">Play Defender</button>
					<button class="buttonHover" type="button" id="seeChanges">See Changes</button>
					<button class="buttonHover" type="button" id="continue">Do Nothing</button>
				</div>
			</div>
			
			<div id="main3">
				<div id="promptFinalScore">
					<p>There are no more cards left! Click below to see who won!</p>
					<button class="buttonHover" type="button" id="showScore">See Final Score</button>
				</div>
				<div id="resultsSummary"></div>
				<button class="buttonHover" type="button" id="playAgain">Play Again!</button>
				<div id="results">
					<div id="userWon"></div>
					<div id="compWon"></div>
					<div id="nobodyWon"></div>
				</div>
			</div>
			
		</div>
		
		
		
		
	</div>

    <script
      src="https://code.jquery.com/jquery-3.4.1.min.js"
      integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
      crossorigin="anonymous"
    ></script>
	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="gameLogic.js"></script>
  </body>
</html>