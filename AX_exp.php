<?php
$block = $_GET["list"];  // determines which word list to use -- a number
$subj = uniqid($block);  // get a unique ID for this person

$n = 'diffs';   // this is part of the name of the include file
     		 // we will pass it on to process.php

$incfile = 'ep_' . $n . '.inc';
$success = include($incfile);
if (!$success) {
  http_response_code(403);
  echo "Could not load include file.";
  exit();
}

$stimulus_list = str_replace("##",$block,$template);
?>

<!DOCTYPE html>
<html>
<head>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="js/audexp.js"></script>
<script src=<?php echo $stimulus_list; ?>></script>
<style>
     td {text-align: center; width: 90px;}
</style>
</head>

<body onload="load('<?php echo $type; ?>',true);">
<center>
<h1>Detect Audio Difference</h1>
<hr>
<p>Listen to a pair of syllables<br>
The differences are very small, listen carefully.<br>
Can you detect any difference between these two syllables?</p>
<p>Type either "z" or "m"</p>

<table>
<tr><td>z</td> <td></td> <td>m</td></tr>
<tr><td>different</td> <td></td> <td>same</td></tr>
</table>

<hr>
<span id="f1">first</span> &nbsp &nbsp
<span id="f2">second</span> &nbsp &nbsp
<span id="key">#</span>
</p>
<p style="font-size:12px">now on: <span id="count">1</span>/<span id="total"></span></p>
<hr>
<p><span id="wr"></span></p>

<p>Your work can be rejected for being too fast, too slow, or for
not being accurate enough on the easy ones.</p>

</center>

<!-- the order of these items determines the column order in the output file -->
<form method="POST" id="dataform" action="process.php?n=<?php echo $n; ?>">
      <input type="hidden" name="subject" value=<?php echo $subj;?> />
      <input type="hidden" name="trial" />
      <input type="hidden" name="list" />
      <input type="hidden" name="file1" />
      <input type="hidden" name="file2" />
      <input type="hidden" name="filedur" />
      <input type="hidden" name="loadtime" />  
      <input type="hidden" name="mystatus" />  
      <input type="hidden" name="response" />
      <input type="hidden" name="rt" />
</form>

<form method="POST" id="continue_form" action="questionnaire.php">
     <input type="hidden" name="subject" value=<?php echo $subj; ?> />
     <input type="hidden" name="block" value=<?php echo $block; ?> />
     <input type="hidden" name="inc" value=<?php echo $n; ?> />
</form>

</body>
</html>

