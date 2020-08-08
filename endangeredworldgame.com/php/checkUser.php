<?php
 require_once 'connect.php';

  $email = trim($_POST['email']);
  $email = strip_tags($email);
  $email = htmlspecialchars($email);
  
  $res = mysqli_query($link, "SELECT user_id, email FROM users WHERE email='$email'");
  $row = mysqli_fetch_array($res, MYSQLI_ASSOC);
  $count = mysqli_num_rows($res);

  if ($count == 1) {
    echo $email;
  } else {
    echo "Invalid email address.";
  }

?>