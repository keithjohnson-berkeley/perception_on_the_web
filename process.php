<?php

// read the include file to get the name of the $datafile
if (isset($_GET['n']) && preg_match("/^\w+$/", $_GET['n'])) {
  $n = $_GET['n'];
  $incfile = $n . '_params.inc';
  $success = include($incfile);
  if (!$success) {
     throw new Exception("didn't open the include file.");
  }
} else {
  throw new Exception("didn't find GET parameter.");
  exit();
}

// establish expectations about what keys are possible and the maximum lengths of the items
$params['n'] = 20;
$params['subject'] = 20;
$params['prID'] = 20;
$params['trial'] = 5;
$params['practice'] = 10;
$params['list'] = 30;
$params['file1'] = 80;
$params['file2'] = 80; 
$params['filedur'] = 10;
$params['loadtime'] = 10;
$params['mystatus'] = 20;
$params['response'] = 500;
$params['option'] = 400; 
$params['rt'] = 15;

// process the post data
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $formdata = [];

  foreach($_POST as $key=>$value) {
    if (array_key_exists($key,$params)) {  // is key on the list of params?
       $maxlen = $params[$key];
       if (preg_match("/[\w\s\+()\.-]{1,$maxlen}/u",$value)) {  // is value well formed?
       	  array_push($formdata,$value);
	} else {
	  array_push($formdata,'bad_value');
	}
    } else {
      array_push($formdata,'illegal_key');
    }
  }	 

  $data = join(",", $formdata) . "\n";
  $ret = file_put_contents($datafile,$data,FILE_APPEND| LOCK_EX);
  if (! $ret) {
     throw new Exception("error on file_put_contents()");
  }
} 

?>
