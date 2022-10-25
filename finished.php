<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
   $subj = $_POST["subj"];
   $prID = $_POST["prID"];
   $n = $_POST["n"];
   $incfile = $n.'_params.inc';  // get the filename for subject data from the include file 
   $success = include($incfile);
   if (!$success) {
      http_response_code(403);
      echo "Could not load include file.";
      exit();
   }

   $data = $datafile;  // start with the name of the datafile where you will find this person's data;
   foreach($_POST as $key=>$value) {      // we don't have to know the keys
   	$value = str_replace(',', '', $value);  // remove commas 
	$data = $data . "," . $value;     // just save whatever is sent
   }
   $data = $data . "\n";

   $ret = file_put_contents($subjects,$data,FILE_APPEND| LOCK_EX);

   if (!$ret) {
      echo "there was a problem writing the data -".$subjects;
   }
} else {
  http_response_code(403);
  echo "invalid submission";
}

?>

<!DOCTYPE html>
<html>
<head>
<title>That's all</title>
</head>
<body>

<h1>Finished!</h1>

<p>Thanks for your participation.</p>

<?php
//echo $prID;
if ($prID === '0') {
echo <<< MTURK
     <p>Your unique identifier, to enter for payment, is: 
     <br><br>
     <b> $subj </b></p>
MTURK;
} else {
echo <<< PROLIFIC
     <p><a href="https://app.prolific.co/submissions/complete?cc=$subj">
     Click here to return to Prolific to complete the task.</a>
PROLIFIC;
}
?>

</body>
</html>

