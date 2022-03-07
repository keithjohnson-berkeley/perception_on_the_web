<?php
function safe_post_param($p, $maxlen) {
  if (isset($_POST[$p]) && preg_match("/[\w\s\+()\.-]{1,$maxlen}/", $_POST[$p])) {
    $val = $_POST[$p]; 
  } else { $val = '<invalid>';}
  return $val;
}

if (isset($_GET['n']) && preg_match("/^\w+$/", $_GET['n'])) {
  $n = $_GET['n'];
  $incfile = 'ep_' . $n . '.inc';
  $success = include_once($incfile);
  if (! $success) {
     throw new Exception("didn't open the include file.");
  }
} else {
  throw new Exception("didn't find GET parameter.");
  exit();
}

$form_params['subject'] = 20;
$form_params['trial'] = 5;
$form_params['list'] = 5;
$form_params['file1'] = 80;
if ($type=='ax' || $type =='cr') {$form_params['file2'] = 30; }
$form_params['filedur'] = 10;
$form_params['loadtime'] = 10;
$form_params['mystatus'] = 20;
$form_params['response'] = 40;
if ($type=='cat') {$form_params['option'] = 400; }
$form_params['rt'] = 10;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $formdata = [];
  foreach($form_params as $p=>$maxlen) {
      array_push($formdata, safe_post_param($p, $maxlen));
  }
  $data = join(",", $formdata) . "\n";
  $ret = file_put_contents($datafile,$data,FILE_APPEND| LOCK_EX);
  if (! $ret) {
     throw new Exception("error on file_put_contents()");
  }
} 

?>
