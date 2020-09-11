<?php
	require_once 'connect.php';

	$email = $_POST['userEmail'];
	$res = mysqli_query($link, "SELECT game_date, player_score, comp_score, tie_score FROM gameData WHERE email='$email' ORDER BY (player_score - comp_score) DESC");

	$line = "";
	$count = 0;
	$fullCount = 0;
	$winCount = 0;
	while(($row = mysqli_fetch_array($res)))
    {
		$fullCount++;
		$date = date_create($row['game_date']);
		if ($row['player_score'] > $row['comp_score']) {
			$winCount++;
			if ($count < 5) {
				$line .= "<tr><td>" . $row['player_score'] . "</td><td>" . $row['comp_score'] . "</td><td>" . date_format($date, 'm/d/y') . "</td></tr>";
				$count++;
			}
		}
    }

	if ($fullCount > 0) {
		$fullCode = '<h3>Your Percent Wins: ' . ceil(($winCount / $fullCount) * 100) . '%</h3><h3>Your Top Five Wins:</h3><table id="resultsTable" class="greenTable"><thead><tr><th>You</th><th>Comp</th><th>Date</th><tr></thead>' . $line . '</table><p>Click <a href="#" id="clearHistory">here</a> to clear your playing history.</p>';
	} else {
		$fullCode = '<h3>Your Total Wins: 0</h3>';
	}
	echo $fullCode;

?>