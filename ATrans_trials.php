<?php
	$list = $_GET["list"];  // determines which word list to use
	$prID = $_GET["prID"];  // determines which word list to use

	$subj = uniqid($list);  // get a unique ID for this person

	$n = 'ATrans';  // this is part of the name of the include file
	$incfile = $n . '_params.inc';
	$success = include($incfile);
	if (!$success) {
	     http_response_code(403);
	     echo "Could not load include file.";
	     exit();
	}
	$stimulus_list = str_replace("##",$list,$template);
?>

<!DOCTYPE html>
<html>

<head>
<title>speech intelligibility</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="js/audexp.js"></script>
<script src=<?php echo $stimulus_list; ?>></script>
</head>

<body onload="load(true,1500,200,4000);">

<center>
<h2>Type the word or phrase you hear</h2>
<hr>

<p><button onclick="play_first_trial(stim_type='<?php echo $stim_type; ?>', 
resp_type='<?php echo $resp_type; ?>', this)">Click here to start.</button></p>


<p>
<!-- the order of these items determines the column order in the output file -->
<form method="POST" id="dataform" action="process.php?n=<?php echo $n; ?>">
      <input type="hidden" name="subject" value=<?php echo $subj;?> />
      <input type="hidden" name="prID" value=<?php echo $prID;?> />
      <input type="hidden" name="list" value=<?php echo $list;?> />
      <input type="hidden" name="trial" />
      <input type="hidden" name="file1" />
      <input type="hidden" name="filedur" />
      <input type="hidden" name="loadtime" />  
      <input type="hidden" name="mystatus" />  
      <input type="text" id="response" value="" name="response"/>
      <input type="hidden" name="rt" />
</form>
</p>

<p><span id="warn"></span></p>
<p style="font-size:12px">now on: <span id="count">1</span>/<span id="total"></span></p>
</center>

<form method="POST" id="continue_form" action="Questionnaire.php">
     <input type="hidden" name="subject" value=<?php echo $subj; ?> />
     <input type="hidden" name="prID" value=<?php echo $prID; ?> />
     <input type="hidden" name="list" value=<?php echo $list; ?> />
     <input type="hidden" name="n" value=<?php echo $n; ?> />
</form>

</body>
</html>
