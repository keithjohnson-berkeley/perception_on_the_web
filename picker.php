<?php

$conditions = array('blue.php', 'red.php', 'green.php');
$lists = array("1", "2");

if (isset($_GET["prID"])) {    # collect the prolific ID if present
   $prID = $_GET["prID"];
} else { $prID = 0;}   

# read condition and list from .txt file
if ($fh = fopen('next_condition.txt','r+')) {
   flock($fh, LOCK_EX);   # acquire an exclusive lock
   $line = fgets($fh);    # read the existing line
   list($condition, $list) = explode(" ",$line); # parse line into condition and list
#   echo("Just read from file:  $condition $list<br>");

   $l = array_search(intval($list), $lists);  # treating list number as intval
   $l = $l + 1;
   if ($l >= count($lists)) {  # are we on the last $list for this $condition?
      $l = 0;  		       # start over
      $c = array_search($condition, $conditions);  # increment condition as well
      $c = $c + 1;
      if ($c >= count($conditions)) $c = 0; # start over on the conditions list, if needed 
      $condition = $conditions[$c];
   }
   $list = $lists[$l];
} else {    # if it doesn't exist create it  --- web server must allow this
  $fh = fopen('next_condition.txt', 'w');
  flock($fh, LOCK_EX);
  $condition = $conditions[0];  # start at the beginning
  $list = $lists[0];
}

$line = "$condition $list";
#echo("Replace with: $line<br>");

rewind($fh);            # put pointer at the start of the file
ftruncate($fh, 0);      # delete everything after the pointer (empty the file)
fwrite($fh, $line);     # put our new line in
fflush($fh);            # flush output before releasing the lock
flock($fh, LOCK_UN);    # release the lock
fclose($fh);            # close the file


$my_url= "https://linguistics.berkeley.edu/~kjohnson/ER_exp/audiocheck.php?next=$condition&list=$list&prID=$prID";
echo("<meta http-equiv='refresh' content='0;url= $my_url'>");
?>