<?php
$size_limit = 6000000;  // in bytes.  1 sec at 44100 Hz = 88200.  6 million ~ 1 minute.

$subj = $_POST['subj'];
$index = $_POST['index'];
$word = $_POST['word'];
$n = $_POST['n'];
$size = $_FILES['audio_data']['size']; //the size in bytes
$input = $_FILES['audio_data']['tmp_name']; //temporary name that PHP gave to the uploaded file

$incfile = $n . '_params.inc';
$success = include($incfile);  // get $recordings_directory
if (!$success) {
   throw new Exception("didn't find the include file.");
}

$outname = $recordings_directory . $subj . "_" . $word . "_" . $index . ".wav";

//move the file from temp name to local folder using $output name
if ($size < $size_limit) {
   move_uploaded_file($input, $outname);
}

print_r("audio saved");
?>
