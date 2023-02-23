<?php
	$list = $_GET["list"];  // determines which word list to use
	$prID = $_GET["prID"];  // determines which word list to use

	$subj = uniqid($list);  // get a unique ID for this person

	$n = 'CID';  // this is part of the name of the include file
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
<title>consonant identification</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="js/audexp.js"></script>
<script src=<?php echo $stimulus_list; ?>></script>
<style> td {text-align:center; width: 90px;} </style>
<style>
     .response {
            color: black;
            text-align: center;
            font-size: 32px;
     }
</style>
</head>

<body onload="load(true,new_iti=1500,300,2000);">

<center>
<h2>Identify the word</h2>
<hr>

<p><button onclick="play_first_trial(stim_type='<?php echo $stim_type; ?>', 
resp_type='<?php echo $resp_type; ?>', this)">Click here to start.</button></p>

<button value="0" class="response"
	onclick="process_response_click(this)">
	<span id="response0"></span></button>
<button value="1" class="response"
	onclick="process_response_click(this)">
	<span id="response1"></span></button>
<button value="2" class="response"
	onclick="process_response_click(this)">
	<span id="response2"></span></button>
<button value="3" class="response"
	onclick="process_response_click(this)">
	<span id="response3"></span></button></br>

<hr>
<p><span id="key">#</span></p>

<p><span id="warn"></span></p>
<p style="font-size:12px">now on: <span id="count">1</span>/<span id="total"></span></p>
</center>

<!-- the order of these items determines the column order in the output file -->
<form method="POST" id="dataform" action="process.php?n=<?php echo $n; ?>">
      <input type="hidden" name="subject" value=<?php echo $subj;?> />
      <input type="hidden" name="prID" value=<?php echo $prID;?> />
      <input type="hidden" name="list" value=<?php echo $list;?> />
      <input type="hidden" name="practice" value="1" />
      <input type="hidden" name="trial" />
      <input type="hidden" name="file1" />
      <input type="hidden" name="filedur" />
      <input type="hidden" name="loadtime" />  
      <input type="hidden" name="mystatus" />  
      <input type="hidden" name="rt" />
      <input type="hidden" name="response" />
</form>

<form method="POST" id="continue_form" action="questionnaire.php">
     <input type="hidden" name="subject" value=<?php echo $subj; ?> />
     <input type="hidden" name="prID" value=<?php echo $prID; ?> />
     <input type="hidden" name="list" value=<?php echo $list; ?> />
     <input type="hidden" name="n" value=<?php echo $n; ?> />
</form>

</body>
</html>
