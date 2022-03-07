<?php
$block = $_POST["block"];  // determines which word list to use -- a number
$subj = $_POST["subject"];
$n = $_POST["inc"];

$incfile = 'ep_' . $n . '.inc';
$success = include($incfile);
if (!$success) {
  http_response_code(403);
  echo "Could not load include file.";
  exit();
}

$stimulus_list = str_replace("##",$block,$template2);
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

<body onload="load(true,2000,500,300,2000);">
<center>
<h1>Speech Perception</h1>
<hr>

<button onclick="play_first_trial(type='<?php echo $type; ?>',this)">Click here to start.</button>

<p>Which word is this?</p>
<p>Type either "z" or "m"</p>

<table>
<tr><td>z</td> <td></td> <td>m</td></tr>
<tr><td><span id="response1"></span></td><td></td><td><span id="response2"></span></td></tr>
</table>

<hr>
<span id="f1"></span>
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

