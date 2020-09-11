<?php
	require_once 'connect.php';

	$email = $_POST['userEmail'];
	$gameLevel = $_POST['gameLevel'];
	$duration = $_POST['duration'];
	$gameDate = $_POST['gameDate'];
	$playerScore = $_POST['playerScore'];
	$compScore = $_POST['compScore'];
	$tieScore = $_POST['tieScore'];
	
	$query = "INSERT INTO `gameData`(`email`, `gameLevel`, `duration`, `game_date`, `player_score`, `comp_score`, `tie_score`) VALUES ('$email',$gameLevel,$duration,'$gameDate',$playerScore,$compScore,$tieScore)";
	$res = mysqli_query($link, $query);
	
	//echo $res;

?>