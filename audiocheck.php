<?php$list = $_GET["list"];$next = $_GET["next"];if (isset($_GET["prID"])) {   $prID = $_GET["prID"];} else { $prID = 0; }?><!doctype html><html><head>   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"><title>Audio check</title><script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script><script type="text/javascript" src="js/HeadphoneCheck.js"></script><link rel="stylesheet" type="text/css" href="css/HeadphoneCheckStyle.css"><script language="javascript">function validate(questform) {   if(document.getElementById("hc-check-result").value !== 'passed' ) {     alert('Audio check failed. Sorry, you cannot perform this task without properly working headphones/earbuds.');     return false;   }   return true;	}$(document).ready(function() {   // Bind callback to hcHeadphoneCheckEnd event     $(document).on('hcHeadphoneCheckEnd', function(event, data) {        var results = data.data;        var config = data.config;        var didPass = data.didPass;        if (didPass) {	  document.getElementById('hc-check-result').value="passed";          $('<div/>', {              html: 'Screening task passed.<br/>totalCorrect: ' + results.totalCorrect          }).appendTo($('body'));        }        else {	  document.getElementById('hc-check-result').value="failed";          $('<div/>', {              html: 'Screening task failed.<br/>totalCorrect: ' + results.totalCorrect          }).appendTo($('body'));        }     });     // customize the headphone check     var headphoneCheckConfig = {         totalTrials: 6,    	 trialsPerPage: 6,    	 correctThreshold: 5/6,    	 useSequential: true,    	 doShuffleTrials: true,    	 sampleWithReplacement: true,    	 doCalibration: true,    	 debug: false};     HeadphoneCheck.runHeadphoneCheck(headphoneCheckConfig);});</script></head><body style="max-width:800px"> <input type="hidden" id = 'hc-check-result' name="screening_task" value=""><h1>Audio check</h1><hr> <p> In order to proceed to the main experiment, you must first pass aquick audio check.</p><hr><div id="hc-container"></div><p><b>When you have completed the audio check, please first click'finished with audio check' to see your results. Then, if you passed,click 'Begin' to continue to the experiment:</b></p><form name="audiocheck" onSubmit="return validate(this)"      action="<?php echo $next,"?list=",$list,"&prID=",$prID ?>";      method=POST><input type="submit" value="Begin"></form></body></html>