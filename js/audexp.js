var index;  // global variable to track trial number
var isi;  // interstimulus interval
var iti;  // intertrial interval
var fast_response = 500;   // what is a too fast response? Any thing less than this in ms
var slow_response;  // what is a too slow response? Any thing longer than this in ms
var order = new Array();  // the order in which the trials will be played
var file1 = new Array();  // read files to play in a separate js file
var file2 = new Array();  
var option1 = new Array();  // response labels for 'z' response in 'cat' experiment
var option2 = new Array(); // response lables for 'm' response
var correct = new Array(); // correct answers for feedback
var ready_for_answer ;  // toggle this when it is appropriate to make a response
var audioduration;  // get duration of file 1, for 2 interval isi calculation
var wait_time;    // 2 interval isi time (file1 onset to file2 onset)
var start_time = null;  // variables for calculating reaction time
var end_time = null;
var mystatus;
var timerid;   // a global timer object
var audio_load_time;   // global to keep load-time stats

// type: can be 'id', 'ax', 'cat', 'r', or 'cr'
//     'id' - a single file is played, and response must be 'z' or 'm'
//     'cat' - a single file is played, response 'z' or 'm', button labels are read from stimulus js file
//     'r'  - a single file is played, and response is 1-7
//     'ax' - two files are played, and response must be 'z' or 'm'
//     'cr' - two files are played, and response is 1-7 
// rflag: is true|false
//     true means randomize the order
//     false means present in the order found in the file list files
// new_isi: is the pause, in milliseconds, between file1 and file2 in an ax or cr type
// new_iti: is the pause, (after a response is entered) between trials 

function load(rflag,new_iti=2000,new_isi=500, new_fast_response=200, new_slow_response=4000) {  
    document.getElementById("total").innerHTML = file1.length;
    index = 0;
    isi = new_isi;
    iti = new_iti;
    console.log(rflag, "fast_response=",fast_response, "new_fast_response=",new_fast_response);
    fast_response = new_fast_response;
    console.log("fast_response=",fast_response, "new_fast_response=",new_fast_response);
    slow_response = new_slow_response;
    shuffle_order(rflag);  // sequential order
}

function play_first_trial(type,x) {  //  this is called from a "start" button
    x.style.display = 'none';  // hide the button
    ready_for_answer = false;
    key_listener(type);
    play_trial(type);
}

function key_listener(type) {  // define how to handle response
//    console.log("adding key_listener", type);
    document.addEventListener("keypress", function(e) {
	if (e.key !== undefined) {   // browsers disagree on what name to use
	    code = e.key;
	} else if (e.keyIdentifier !== undefined) {
	    code = e.keyIdentifier;
	} else if (e.keyCode !== undefined) {
	    code = e.keyCode;	    
	}

//	console.log("key pressed", e.charCode, code, 'type = ', type); 
	if (!ready_for_answer) {
	    mystatus = "early_response";
	    document.getElementById("wr").style.backgroundColor = "red";
	    document.getElementById("wr").style.color="white";
	    if (type=="ax" || type=="cr") {
		document.getElementById("wr").innerHTML = " Please wait for the second one ";
	    } else {
		document.getElementById("wr").innerHTML = " Please wait for the sound to play ";
	    }
	} else if ( ((e.charCode > 48 && e.charCode <  56) && (type=='r' || type=='cr')) ||  // numbers 1-7
		    ((e.charCode== 122 || e.charCode==109) && (type=='id' || type=='ax' || type=='cat')) ) { // 'z' or 'm'	
	    end_time = new Date();
	    ready_for_answer = false;
	    rt = end_time - start_time;  // this is in milliseconds
	    dur = audioduration * 1000;  // convert to milliseconds

	    if (type=="cat") {  // save the button labels in 'cat' experiments
		if (e.charCode==122) {	code = option1[order[index]];}
		if (e.charCode==109) {  code = option2[order[index]];}
	    }

	    if (rt < fast_response) {  // check for overly fast responses
		mystatus = "fast_response";
		document.getElementById("wr").style.backgroundColor = "red";
		document.getElementById("wr").style.color="white";
		document.getElementById("wr").innerHTML = " That resposne was too fast ";
		ready_for_answer= false;  // no more responses
	    }

	    if (rt-dur > slow_response) {  // check for overly slow responses
		mystatus = "slow_response";
		document.getElementById("wr").style.backgroundColor = "red";
		document.getElementById("wr").style.color="white";
		document.getElementById("wr").innerHTML = " That response was too slow ";
	    }

	    if (typeof correct != "undefined" && correct.length == file1.length) {
		if (correct[order[index]].includes(code) != true) {
		    mystatus = "incorrect_response";
		    document.getElementById("wr").style.backgroundColor = "red";
		    document.getElementById("wr").style.color="white";
		    document.getElementById("wr").innerHTML = " That response was incorrect";
		}
	    }
    	    
	    document.getElementById("key").innerHTML = code; // show the response
	    document.getElementById("key").style.backgroundColor = "pink";

	    // ------- fill the data form ------------------
	    document.getElementById("dataform").response.value = code; 
	    document.getElementById("dataform").mystatus.value = mystatus;
	    document.getElementById("dataform").rt.value = rt;
	    document.getElementById("dataform").trial.value = index;
	    document.getElementById("dataform").list.value = block;  // defined in js file
	    document.getElementById("dataform").filedur.value = dur.toFixed(0);
	    document.getElementById("dataform").loadtime.value = audio_load_time.toFixed(0);
	    document.getElementById("dataform").file1.value = file1[order[index]];

	    if (type=="ax" || type=="cr") {  // for trials with two intervals
		document.getElementById("f2").style.backgroundColor = "";
		document.getElementById("dataform").file2.value = file2[order[index]];
	    } else {
		document.getElementById("f1").style.backgroundColor = "";
	    }
		
	    $("#dataform").trigger("submit");  // submit the form - write data
	    setTimeout(function () {finish(type)},iti);  // see if we have finished - go to next
	} else {  // warn about using the wrong keys
	    mystatus = "unallowed_response";
	    if (type=='id' || type=='ax' || type=='cat') {
		warning = " Press either 'z' or 'm' ";
	    } else {
		warning = " Press a number between 1 and 7 ";
	    }
	    document.getElementById("wr").style.backgroundColor = "red";
	    document.getElementById("wr").style.color="white";
	    document.getElementById("wr").innerHTML = warning;
	}
    })
}

function play_trial(type) {
    if (type=="ax" || type=="cr") {
	play_2_interval();  // play the first trial
    } else if (type=="id" || type=="r" || type=='cat') {
	play_1_interval(type);
    } 
}

function play_1_interval(type) {  // one audio file is played
    audioduration = 0;
    var count = 0;
    var loop = 5;  // interval in ms to check for file is loaded
    mystatus= "OK";
    if (type=='cat') {
	document.getElementById("response1").innerHTML = option1[order[index]];
	document.getElementById("response2").innerHTML = option2[order[index]];
    }
    document.getElementById("f1").style.backgroundColor = "yellow";
    document.getElementById("wr").innerHTML = "";
    play_audio(file1[order[index]]);
    timerid = setInterval( function () {
	if (audioduration>0) {  // wait for file to start playing
	    clearInterval(timerid);
	    audio_load_time = count*loop;
	    ready_for_answer=true;
	    start_time = new Date();  // start the clock on a reaction time
	}
	count += 1;
    }, loop);  // repeat this every x milliseconds
}

function play_2_interval() {  // two audio files are played
    audioduration = 0;
    wait_time = 0;
    var count = 0;
    var loop = 5;
    mystatus= "OK";
    document.getElementById("f1").style.backgroundColor = "yellow";
    document.getElementById("f2").style.backgroundColor = "";    
    document.getElementById("wr").innerHTML = "";
    play_audio(file1[order[index]]);
    timerid = setInterval( function() {  // wait for file 1 to load
	if (audioduration>0) {  // this is updated when the file is loaded
	    wait_time = (audioduration * 1000) + isi; // wait duration + isi
	    clearInterval(timerid);  // stop looping to get duration
	    window.setTimeout( function() {  // present the second file, after wait_time pause
		document.getElementById("f1").style.backgroundColor = "";
		document.getElementById("f2").style.backgroundColor = "yellow";
		audioduration = 0;  // reset this value
		play_audio(file2[order[index]]);
		timerid = setInterval( function() {  // wait for file 2 to load
		    if (audioduration>0) {
			clearInterval(timerid);  // stop looping
			ready_for_answer = true;  // ready now for responses
			audio_load_time = count*loop;  // report load time
			start_time = new Date();  // start the clock on a reaction time
		    }
		    count += 1;
		}, loop);
	    },wait_time);    // after a pause
	}
    }, loop);  // repeat this every x milliseconds
}

function finish(type) {
    if (index == (file1.length-1)) {  // see if we are done - go to questionnaire
	$('#continue_form').trigger("submit");  // submit the form - write data
    }  else {
	index = index+1;
	document.getElementById("count").innerHTML = index+1;
	document.getElementById("key").innerHTML = "#";
	document.getElementById("key").style.backgroundColor = "";
	play_trial(type);
    }
}

function shuffle_order(rand_flag) {   // shuffle the order of the questions
    for (var i=0;i<file1.length;i++) { order[i]=i; }
    if (rand_flag) {   // if true randomize the order
	for (i=file1.length-1; i>0; i--) { 
	    var r = Math.floor(Math.random()*i);
	    var temp = order[i];
	    order[i] = order[r];
	    order[r]= temp; 
	}
    }
}

function play_audio(filename) {
    var element = document.getElementById('theaudio');
    if (element) {
	document.body.removeChild(element);
    }
    var aud = document.createElement('audio');
    aud.setAttribute('id','theaudio');
    aud.setAttribute('preload','auto');
    if (aud != null && aud.canPlayType && aud.canPlayType("audio/wav")) {
	aud.setAttribute('src',filename+".wav");
	aud.load();
    } else if (aud!= null && aud.canPlayType && aud.canPlayType("audio/mpeg")) {
	aud.setAttribute('src',filename+".mp3");
	aud.load();
    } else {
	aud.setAttribute('src',filename+".wav");
	aud.load();
    }
    document.body.appendChild(aud);
    aud.addEventListener('loadedmetadata', function() {  //set dur when available
	audioduration = aud.duration;
    });
    document.getElementById('theaudio').play();
}

// this function sends the form 'dataform' to the php file for storage
$(document).ready(function() {
    var form = $('#dataform');
    $(form).submit( function(e) {
	e.preventDefault();
	$.ajax({
	    type: "POST",
	    url: $(form).attr('action'),
	    data: $(form).serialize()
	})
	.fail(function(data) {
	  console.log(data.status, data.statusText);
	});
    });
});
