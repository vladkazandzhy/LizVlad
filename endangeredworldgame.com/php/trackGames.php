<?php
	require_once 'connect.php';

	$email = $_POST['userEmail'];
	$duration = $_POST['duration'];
	$playerScore = $_POST['playerScore'];
	$compScore = $_POST['compScore'];
	$tieScore = $_POST['tieScore'];
	
	$query = "INSERT INTO `gameData`(`email`, `duration`, `player_score`, `comp_score`, `tie_score`) VALUES ('$email',$duration,$playerScore,$compScore,$tieScore)";
	$res = mysqli_query($link, $query);
	
	//echo $res;

?>