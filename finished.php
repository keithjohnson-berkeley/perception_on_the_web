<?php

$datafile = "subjects.csv";  // push POST data to this file

if ($_SERVER["REQUEST_METHOD"] == "POST") {
   $subj = $_POST["subj"];
   $data = "#";
   foreach($_POST as $key=>$value) {      // we don't have to know the keys
       $data = $data . "," . $value;     // just save whatever is sent
   }
   $data = $data . "\n";

   $ret = file_put_contents($datafile,$data,FILE_APPEND| LOCK_EX);

   if (!$ret) {
      echo "there was a problem writing the data";
   }
} else {
  http_response_code(403);
  echo "invalid submission";
}

?>

<!DOCTYPE html>
<html>
<head>

</head>
<body>

<h1>Finished!</h1>

<p>Thanks for your participation.</p>

<p>Your unique identifier, to enter in mturk for payment, is: 
<br><br>
<b> <?php echo $subj; ?> </b></p>


