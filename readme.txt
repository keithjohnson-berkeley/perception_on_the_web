unzip this in your public_html and you will have a demo experiment:

http://your.server.here/~user/example_experiment/unique.php?list=test

The components of the experiment:

unique.php --> starting page, introduces experiment, asks for consent
	   --> links to consent_form.pdf, and QuestionnaireScreenShot.png
rate_exp.php --> presents all of the experiment trials
	     --> reads a php include file ('ep_unique.inc') which defines three variables:
	     	   $type, of experiment
		   $template, of the name used to list experiment trials
		   $datafile, name of file where the response data will be stored
process.php --> used by rate_exp.php to process the data after each keypress response.
	    --> the subject never sees this file, it runs in the background
	    --> it reads the same include file that rate_exp.php reads.
questionnaire.php --> residential history, language background, social variables
		  --> saves data in subjects.csv
finished.php --> thanks the subject, gives them a unique identifier for MTurk payment
	     --> this identifier is the subject number, used also in data.csv and subjects.csv

/js  --> a directory of javascript resources.
     --> audexp.js: routines for playing files and collecting responses
     --> filelist.js: javascript arrays of sound file names
     --> make_wordlist.prl: a script to make filelist.js from csv list
/sounds --> a directory of wav and mp3 soundfiles
	--> use make_mp3s to, well, make mp3s from the wav files.
	--> some browsers want mp3 format sound files (?)


To customize this framework for your experiment you can copy and modify:
   unique.php  -- text of instructions
   ep_unique.inc -- output data file name, type of experiment, filelist name template
   rate_exp.php  -- response alternative descriptions
   questionnaire.php  -- experiment-specific questions
   - add new sounds and a new list of sounds in /js


This directory also has an .R file that is an example of a quick and dirty look at 
data, useful for verifying the quality of the work of a group of MTurk subjects.
