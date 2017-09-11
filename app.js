#!/usr/bin/env node
'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const userHome = require('user-home');
const { exec } = require('child_process');

if (!fs.existsSync(process.argv[2])) {
	console.log("Provided file doesn't exist");
	process.exit();
}

var input_file = path.basename(process.argv[2]);
var loaded_bytes = "";
if (fs.existsSync(userHome + '/.aax-converter-config')) {
	loaded_bytes = fs.readFileSync(userHome + '/.aax-converter-config', { encoding: 'utf8' });
};

var general_questions = [
	{
		type: "input",
		name: "activation_bytes",
		message: "Activation Bytes",
		default: loaded_bytes
	},
	{
		type: "list",
		name: "format",
		message: "Output Format",
		choices: [
			"mp3"
		]
	}
];

var mp3questions = [
	{
		type: "input",
		name: "sample_rate",
		message: "Sample Rate",
		default: 44100
	},
	{
		type: "input",
		name: "bitrate",
		message: "Bitrate (kbps)",
		default: 320
	}
];

inquirer.prompt(general_questions).then((answers) => {
	fs.writeFileSync(userHome + '/.aax-converter-config', answers.activation_bytes, (err) => {
		if (err) throw err;
	});
	var command = "ffmpeg -y";
	command += " -activation_bytes " + answers.activation_bytes;
	command += " -i " + input_file;

	switch (answers.format) {
		case "mp3":
			inquirer.prompt(mp3questions).then((answers) => {
				command += " -ar " + answers.sample_rate;
				command += " -ac 2";
				command += " -b:a " + answers.bitrate + "k";
				command += " -vn";
				command += " " + input_file.split('.')[0] + ".mp3";
				console.log(command);
				runCommand(command, () => {
					console.log("Done!");
				});
			});
			break;
		default:
			break;
	}

});

function runCommand(cmd, cb) {
	exec(cmd, (err, stdout, stderr) => {
		if (err) { return; }

		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
		cb();
	});
}
