// audexp.js  -- a set of javascript routines used in remote behavioral experiments involving
//    audio, video, image stimuli.

'use strict';

var debug = 1;  // 1 means print debugging messages in console, 0 means don't print messages


// global variables set load() to control some aspects of the experiment
var isi;  // interstimulus interval  for 'audio2' stim_type
var iti;  // intertrial interval
var fast_response;   // what is a too fast response? Any thing less than this in ms
var slow_response;  // what is a too slow response? Any thing longer than this in ms

// global variables set in list.js files to define the trials of an experiment
var file1 = new Array();  // audio or movies to play, images to show, text to present
var file2 = new Array();   //  If a second audio file for 'audio2' stim_type
var options = new Array();  // response labels
var correct = new Array(); // correct answers for feedback

// global variables for keeping track of trial presentation
var index;  // global variable to track trial number
var order = new Array();  // the order in which the trials will be played
var ready_for_answer ;  // toggle this when it is appropriate to make a response
var mystatus;
var stim_type;  // the kind of stimulus that will be presented
var resp_type;  // the kind of response to expect

// global variables for recording reaction time
var start_time = null;  // variables for calculating reaction time
var end_time = null;
var rt;  // reaction time

// globals used in presenting two audio files 'audio2' stim_type
var wait_time;    // 2 interval isi time (file1 onset to file2 onset)
var mediaduration;  // duration of the audio or video presented

// globals used in dealing with media
var timerid;   // a global timer object
var media_load_time;   // global to keep load-time stats
var movie;  

// global variables for using recorder.js - audio recording responses
var rec;
var gumStream;
var input;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext;
var recording_duration = 2;  // 2 second default recording duration

// stim_type:
//     'audio1' --  one interval audio stimulus
//     'audio2' --  two interval audio stimuli
//     'image' -- image stimulus
//     'video' -- video stimulus
//     'text' -- file1[] are strings to present

// resp_type:
//     '2AFC' -- two alternative forced choice - must be 'z' or 'm' keys - labels hard coded in PHP file
//     '2AFC_labels'  -- 2AFC 'z' and 'm' response keys, labels in options[0] and [1], 2  arrays.
//     'rating' -- response must be a number between 1 and 7 
//     'text' -- response is given in a form called 'dataform', input item 'response'
//     'recording' -- response is spoken and we record it
//     'buttons' -- respond by clicking on labelled buttons

// load() -----------------
// rflag: is true|false
//     true means randomize the order
//     false means present in the order found in the file list files
// new_isi: is the pause, in milliseconds, between file1 and file2 in audio2 stim_type
// new_iti: is the pause, (after a response is entered) between trials

function load(rflag,new_iti=2000,new_fast_response=200,new_slow_response=4000,new_isi=500) {  
    console.log("debug = ",debug);
    document.getElementById("total").innerHTML = file1.length;
    index = 0;
    isi = new_isi;
    iti = new_iti;
    fast_response = new_fast_response;
    slow_response = new_slow_response;
    shuffle_order(rflag);  // sequential order
    if (debug) {console.log("rflag = ",rflag, " iti = ",iti, " fast_response = ",fast_response)};
}

function play_first_trial(stype,rtype,x) {  //  this is called from a "start" button
    var message;
    
    stim_type=stype;  // set the global stim and response types
    resp_type=rtype;

    if (debug) {console.log("play_first_trial: ",stim_type," ",resp_type);}
    if (message = $('#starting_message')) {
	message.html('');   // remove the starting message if there is one
    }
    x.style.display = 'none';  // hide the button
    ready_for_answer = false;
    if ((resp_type != 'recording') && (resp_type != 'buttons')) {   // no key press response for spoken or button responses 
	key_listener();
    }
    play_trial();
}

function feedback(ans = "not_ready") {  // show warnings for various types of problems - set the global "mystatus"
    var W;
    
    if (ans == "not_ready") {
	mystatus = "early_response";
	if (W = $('#warn')) { 
	    W.css({"backgroundColor": "red", "color":"white"});;
	    W.html( messages.wait);
	}
    } else if (ans == "wrong_key") {  // warn about using the wrong keys
	mystatus = "unallowed_response";
	if (W = $("#warn")) {
	    W.css({"backgroundColor":"red", "color":"white"});
	    if (resp_type.includes('2AFC')) {
		W.html(messages.unallowed_zm);
	    } else {
		W.html(messages.unallowed_17);
	    }
	}
    } else {
	if (rt < fast_response) {  // check for overly fast responses
	    mystatus = "fast_response";
	    if (W = $('#warn')) { 
		W.css({"backgroundColor": "red", "color":"white"});;
		W.html(messages.fast);
	    }
	    ready_for_answer= false;  // no more responses
	}
	
	if (rt-mediaduration > slow_response) {  // check for overly slow responses
	    mystatus = "slow_response";
            if (W = $('#warn')) {
		W.css({"backgroundColor": "red", "color":"white"});;
		W.html( messages.slow);
            }
	}
	if (typeof correct != "undefined" && correct.length == file1.length) {
	    if (correct[order[index]].includes(ans) != true) {
		mystatus = "incorrect_response";
		if (W = $('#warn')) {
                    W.css({"backgroundColor": "red", "color":"white"});;
                    W.html(messages.incorrect);
		}
	    }
	}
	$('#key').html(ans); // show the response
	$('#key').css({"backgroundColor":"pink"});
    }
}
   
function key_listener() { // define how to handle keyboard responses
    document.addEventListener("keydown", function(e) {

	var key = e.key.toLowerCase();
	if (debug) {console.log("e.key= ",e.key, ", e.code= ",e.code, " key = ",key); }
	var ans;
	
	if (!ready_for_answer) {
	    feedback("not_ready");
	} else if (resp_type.includes('2AFC') || resp_type=='rating') {   // single key response types
	    if ((resp_type=='rating' && (key >= 1 && key <= 7)) ||  // numbers 1-7
		(resp_type.includes('2AFC') && (key=='z' || key=='m'))) { // 'z' or 'm'	
		end_time = new Date();
		ready_for_answer = false;
		rt = end_time - start_time;  // this is in milliseconds

		ans = key;  // ans will be compared to correct answer for feedback
		if (resp_type=="2AFC_labels") {  // save the button labels
		    if (key=='z') {  ans = options[0][order[index]];}
		    if (key=='m') {  ans = options[1][order[index]];}
		}

		feedback(ans);  // give feedback on correctness and rt

		// ------- fill the data form ------------------
		document.getElementById("dataform").response.value = ans; 
		document.getElementById("dataform").mystatus.value = mystatus;
		document.getElementById("dataform").rt.value = rt;
		document.getElementById("dataform").trial.value = index;
		document.getElementById("dataform").filedur.value = mediaduration.toFixed(0);
		document.getElementById("dataform").loadtime.value = media_load_time.toFixed(0);
		document.getElementById("dataform").file1.value = file1[order[index]];

		if (stim_type=="audio2") {  // for trials with two intervals
		    $("#f2").css({"backgroundColor":""});
		    document.getElementById("dataform").file2.value = file2[order[index]];
		}

		if (stim_type== "video" || stim_type=="image") { clear_canvas(); }
				
		$("#dataform").trigger("submit");  // submit the form - write data
		setTimeout(function () {finish()},iti);  // if not finished - go to next
	    } else {  // warn about using the wrong keys
		feedback("wrong_key");
	    }
	} else if (resp_type=="text"){
	    if (rt==0) {  // first time a key is pressed take the reaction time
		end_time = new Date();
		rt = end_time - start_time;
	    }
	    if (e.key == "Enter") {  // when 'enter' is pressed
		// ------- fill the data form ------------------
                document.getElementById('dataform').mystatus.value = mystatus;
                document.getElementById("dataform").rt.value = rt;
                document.getElementById("dataform").trial.value = index;
		if (stim_type != 'image') {
		    document.getElementById("dataform").filedur.value = mediaduration.toFixed(0);
		    document.getElementById("dataform").loadtime.value = media_load_time.toFixed(0);
		}
		if (stim_type== "video" || stim_type=="image") { clear_canvas(); }
				
                document.getElementById("dataform").file1.value = file1[order[index]];
		setTimeout(function () {finish()},iti); // if not finished - go to next
	    }
	} 
    })
}

function process_response_click(btn) {
    var ans = btn.value;
    
    if (debug) {console.log("click = ", ans);}
    if (!ready_for_answer) {
	feedback("not_ready");
    } else {
	end_time = new Date();
	ready_for_answer = false;
	rt = end_time - start_time;  // this is in milliseconds

	if (typeof options[ans][order[index]] != undefined) {
	    ans = options[ans][order[index]];
	}

	if (debug) {console.log("value = ",btn.value," ans = ", ans);}
	feedback(ans);  // give feedback on correctness and rt

	// ------- fill the data form ------------------
	document.getElementById("dataform").response.value = ans; 
	document.getElementById("dataform").mystatus.value = mystatus;
	document.getElementById("dataform").rt.value = rt;
	document.getElementById("dataform").trial.value = index;
	document.getElementById("dataform").filedur.value = mediaduration.toFixed(0);
	document.getElementById("dataform").loadtime.value = media_load_time.toFixed(0);
	document.getElementById("dataform").file1.value = file1[order[index]];

	if (stim_type== "video" || stim_type=="image") { clear_canvas(); }

	$("#dataform").trigger("submit");  // submit the form - write data
	setTimeout(function () {finish()},iti);  // if not finished - go to next
    }
}

function clear_canvas() {
    if (movie) {
	movie.pause();
    }
    const canvas = document.getElementById("canvas");
    if (canvas) {  // clear the screen if there is a canvas object
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function play_trial() {
    var W;
    var R;

    if (debug) {console.log("index=",index,"  filename=",file1[order[index]]);}

    mystatus= "OK";
    rt = 0;
    if (resp_type=='text') {
	response = $('#response');
	if (response) { response.focus();}
    }
    // clear the feedback html element
    if (W = $("#warn")) { W.html(""); }

    // fill response labels here
    if ((typeof options[0][order[index]] != "undefined") && (R=$("#response0"))) {
	R.html(options[0][order[index]]);
    }
    if ((typeof options[1][order[index]] != "undefined") && (R=$("#response1"))) {
	R.html(options[1][order[index]]);
    }
    if ((typeof options[2][order[index]] != "undefined") && (R=$("#response2"))) {
	R.html(options[2][order[index]]);
    }
    if ((typeof options[3][order[index]] != "undefined") && (R=$("#response3"))) {
	R.html(options[3][order[index]]);
    }

    if (stim_type=='audio2') {	     play_2_interval(); }
    else if (stim_type=='audio1') {  play_1_interval(); }
    else if (stim_type=='image') {   image_trial(); }
    else if (stim_type=='video') {   movie_trial(); }
    else if (stim_type=='text') {    text_trial(); }
    if (resp_type=='recording') { startRecording(); }
}

function play_1_interval() {  // one audio file is played
    mediaduration = 0;
    var count = 0;
    var loop = 5;  // interval in ms to check for file is loaded
    play_audio(file1[order[index]]);
    timerid = setInterval( function () {
	if (mediaduration>0) {  // wait for file to start playing
	    clearInterval(timerid);
	    media_load_time = count*loop;
	}
	count += 1;
    }, loop);  // repeat this every x milliseconds
}

function movie_trial() {  // one video file is played
    mediaduration = 0;
    var count = 0;
    var loop = 5;  // interval in ms to check for file is loaded
    play_movie(file1[order[index]]);
    timerid = setInterval( function () {   // measure the load time
	if (mediaduration>0) {  // wait for file to start playing
	    clearInterval(timerid);
	    media_load_time = count*loop;
	}
	count += 1;
    }, loop);  // repeat this every x milliseconds
}

function image_trial() {  // one image is shown in page object <canvas id="canvas">
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var oldimage = document.getElementById('theimage');
    if (oldimage) { document.body.removeChild(oldimage); }
    
    var image = new Image();
    image.id = 'theimage';
    image.onload = function () {
	var scale = Math.min(canvas.width/image.width, canvas.height/image.height);
	var top = (canvas.height/2) - (image.height/2)*scale;
	var left = (canvas.width/2) - (image.width/2)*scale;
	var height = image.height*scale;
	var width = image.width*scale;
	
	start_time = new Date();
	ready_for_answer = true;
	ctx.drawImage(image,left,top,width,height);
      };
    image.src = file1[order[index]];;
}

function text_trial() {  // text is displayed in object <span id="thetext">
    if (debug) {console.log("word: ",file1[order[index]], "  Index: ",index);}
    
    var text = $("#thetext");
    text.html("");
    text.html(file1[order[index]]);  
}

function play_2_interval() {  // two audio files are played
    mediaduration = 0;
    wait_time = 0;
    var count = 0;
    var loop = 5;

    $("#f1").css({"backgroundColor":"yellow"});
    $("#f2").css({"backgroundColor":""});    
    play_audio(file1[order[index]]);
    ready_for_answer = false;
    timerid = setInterval( function() {  // wait for file 1 to load
	if (mediaduration>0) {  // this is updated when the file is loaded
	    wait_time = mediaduration + isi; // wait duration + isi
	    clearInterval(timerid);  // stop looping to get duration
	    window.setTimeout( function() {  // present the second file, after wait_time pause
		$("#f1").css({"backgroundColor":""});
		$("#f2").css({"backgroundColor":"yellow"});
		mediaduration = 0;  // reset this value
		play_audio(file2[order[index]]);
		timerid = setInterval( function() {  // wait for file 2 to load
		    if (mediaduration>0) {
			clearInterval(timerid);  // stop looping
			media_load_time = count*loop;  // report load time
		    }
		    count += 1;
		}, loop);
	    },wait_time);    // after a pause
	}
    }, loop);  // repeat this every x milliseconds
}

function finish() {
    if (index == (file1.length-1)) {  // see if we are done - go to questionnaire
	$('#continue_form').trigger("submit");  // submit the form - write data
    }  else {
	index = index+1;
	document.getElementById("count").innerHTML = index+1;
	var key = document.getElementById("key");
	if (key = $("#key")) {
	    key.html("#");
	    key.css({"backgroundColor":""});
	}
	var response = document.getElementById("response");
	if (response) {response.value="";}  // clear the response
	play_trial(stim_type,resp_type);
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
    const element = document.getElementById('theaudio');
    if (element) { document.body.removeChild(element); }

    const aud = document.createElement('audio');
    aud.id = 'theaudio';
    aud.preload = 'auto';
    if (aud != null && aud.canPlayType && aud.canPlayType("audio/wav")) {
	aud.src= filename+".wav";
	aud.load();
    } else if (aud!= null && aud.canPlayType && aud.canPlayType("audio/mpeg")) {
	aud.src = filename+".mp3";
	aud.load();
    } else {
	aud.src = filename+".wav";
	aud.load();
    }
    aud.addEventListener('canplaythrough', function() {  //set dur when available
	ready_for_answer=true;
	start_time = new Date();  // start the clock on a reaction time
	mediaduration = aud.duration * 1000; // convert to milliseconds
	aud.play();
    });
    document.body.appendChild(aud);
}

function play_movie(filename) {
    const outputcanvas = document.getElementById("canvas");
    const canvasctx = outputcanvas.getContext("2d");
    var scale, cvsize = 500;
    
    movie = document.createElement('video');  // using global variable 'movie'
    movie.id = 'themovie';
    movie.preload = 'auto';
    movie.src = filename;
    movie.visibility = 'hidden';
    movie.autoPlay = false;
    
    movie.addEventListener("loadeddata", function() {
	if (debug) {console.log('ready to play movie');}
	scale = Math.min(cvsize/movie.videoWidth, cvsize/movie.videoHeight);
        outputcanvas.height = movie.videoHeight*scale;
        outputcanvas.width = movie.videoWidth*scale;
        ready_for_answer = true;
	mediaduration = movie.duration*1000;  // convert to milliseconds
        start_time = new Date();
	movie.play();
    });
    movie.addEventListener('play',() => {
	function step() {
	    canvasctx.drawImage(movie,0,0,outputcanvas.width,outputcanvas.height);
	    requestAnimationFrame(step);
	}
	requestAnimationFrame(step);
    });
    movie.addEventListener('ended', () => {
	if (debug) {console.log('movie ended');}
	movie.src="";  // this will blank the movie
    });
}

function startRecording() {
    var constraints = { audio: true, video:false }
    var config =  {}
    
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        if (debug) {console.log("getUserMedia() success, stream created, initializing Recorder.js ...");}

        audioContext = new AudioContext();
        var numsamp = audioContext.sampleRate * recording_duration;
        
        gumStream = stream;
        input = audioContext.createMediaStreamSource(stream);

        config['numChannels'] = 1;
        config['numsamp'] = numsamp;
        config['stopbutton'] = "stopButton";  // note - hard coded expectation
        rec = new Recorder(input,config);
        rec.record()
    }).catch(function(err) {
	if (warn = $('#warn')) {
	    warn.css({"backgroundColor":"red", "color":"white"});
	    warn.html("recording failed");
	}
    });
}

function stopRecording(subj,n) {
    if (debug) {console.log("stopButton clicked");}
    rec.stop();    
    gumStream.getAudioTracks()[0].stop();
    rec.getBuffer(voice_key);
    rec.exportWAV(download_audio.bind(this,subj,n));
    $('#thetext').html("  ");  // erase the word  
}

function voice_key(audio_buffers) {   // return time of speech onset
    var x = audio_buffers[0].map(Math.abs)  // if stereo just take left channel, apply abs
    var max = -Infinity;
    for(var i = 0; i < x.length; i++ ) { if (x[i] > max) max = x[i]; }
    var threshold = 0.2 * max;
    var index = x.findIndex(function(element) { return (element > threshold); });
    rt = (index/audioContext.sampleRate) * 1000;  // put rt in milliseconds

    if (debug) {
	console.log("sound file length is: ", x.length/audioContext.sampleRate, "  Response starts at: ", rt);
    }
}

function download_audio(subj,n,blob) {   
    if (debug) {console.log("download_audio(), subj: ", subj);}
    var xhr = new XMLHttpRequest();
    xhr.onload=function(e) {
	if (debug && this.readyState===4) {
	    console.log("Server returned: ",e.target.responseText);
	}
    };
    var fd=new FormData();
    fd.append("n",n);
    fd.append("subj",subj);
    fd.append("index",index);
    fd.append("word",file1[order[index]]);
    fd.append("audio_data",blob,"temp.wav");
    xhr.open("POST","upload.php",true);
    xhr.send(fd);

    // fill some info on the dataform and submit it
    document.getElementById("dataform").file1.value = file1[order[index]];
    document.getElementById("dataform").trial.value = index;
    document.getElementById("dataform").rt.value = rt;
    
    $("#dataform").trigger("submit");
    
    // wait for the next trial or stop running trials.
    setTimeout(function () {finish()},iti);
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
	    if (debug) {console.log(data.status, data.statusText);}
	});
    });
});
