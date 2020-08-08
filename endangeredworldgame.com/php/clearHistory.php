<?php
	require_once 'connect.php';

	$email = $_POST['userEmail'];
	$res = mysqli_query($link, "DELETE FROM gameData WHERE email='$email'");

	if ($res) {
		echo "success";
	} else {
		echo "error";
	}	

?>