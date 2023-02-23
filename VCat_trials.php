<?php
	$list = $_GET["list"];  // determines which word list to use
	$prID = $_GET["prID"];  // determines which word list to use

	$subj = uniqid($list);  // get a unique ID for this person

	$n = 'VCat';  // this is part of the name of the include file
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
<title>video categorization</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="js/audexp.js"></script>
<script src=<?php echo $stimulus_list; ?>></script>
<style> td {text-align:center; width: 90px;} </style>
</head>

<body onload="load(true,1500,200,4000);">

<center>
<h2>Is the spoken utterance a word of English?</h2>
<hr>

<p><button onclick="play_first_trial(stim_type='<?php echo $stim_type; ?>', 
resp_type='<?php echo $resp_type; ?>', this)">Click here to start.</button></p>

<p>Type either 'z' or 'm'</p>

<table>
<tr><td>z</td> <td></td> <td>m</td></tr>
<tr><td><span id="response0">word</span></td><td></td><td><span id="response1">nonword</span></td></tr>
</table>
<hr>
<canvas id="canvas" width="768" height="512" /></canvas>

<p><span id="key">#</span></p>

<p><span id="warn"></span></p>
<p style="font-size:12px">now on: <span id="count">1</span>/<span id="total"></span></p>
</center>

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
      <input type="hidden" name="response"/>
      <input type="hidden" name="rt" />
</form>

<form method="POST" id="continue_form" action="questionnaire.php">
     <input type="hidden" name="subject" value=<?php echo $subj; ?> />
     <input type="hidden" name="prID" value=<?php echo $prID; ?> />
     <input type="hidden" name="list" value=<?php echo $list; ?> />
     <input type="hidden" name="n" value=<?php echo $n; ?> />
</form>

</body>
</html>
