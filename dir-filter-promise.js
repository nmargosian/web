const fs = require('fs');
const path = require('path');

function dirFilterWithCallbacks(pattern, fromDir, toDir) {
// Create a regular expresion from the pattern on the command line.
const re = RegExp(pattern);
// Create the "to" directory.
fs.mkdir(toDir, err => {
	if (err) {
	if (err.code === 'EEXIST') {
		// Don't freak out if it already exists.
		console.warn(`Desination directory '${toDir}' already exists; continuing`);
	} else {
		throw(err);
	}
	}

	// Read the "from" directory.
	fs.readdir(fromDir, (err, fileNames) => {
	if (err) {
		throw(err);
	}
	// For each file in the "from" directory:
	for (let fileName of fileNames) {
		// Read the file
		fs.readFile(path.join(fromDir, fileName), { encoding: 'utf-8'}, (err, data) => {
		if (err) {
			throw(err);
		}
		console.log(`==== ${fileName} ====`);
		let outputLines = [];
		// Iterate over each line of the file
		for (let line of data.split(/\n/)) {
			// If the line matches the input pattern
			if (line.match(re)) {
			// Add it to the lines to be written to the "to" directory.
			console.log(`>>> ${line}`);
			outputLines.push(line);
			} else {
			console.log(`${line}`);
			}
		}
		// Write matchine lines to the corresponding file in the "to" directory.
		const toPath = path.join(toDir, fileName);
		fs.writeFile(toPath, outputLines.join('\n') + '\n', err => {
			if (err) {
			throw(err);
			} else {
			console.log(`Wrote ${outputLines.length} lines to ${toPath}`);
			}
		});
		});
	}
	});
});
}


function mkdirPromise(toDir) {
	return new Promise((resolve, reject) => {
		fs.mkdir(toDir, err => {
			if (err) {
			if (err.code === 'EEXIST') {
				// Don't freak out if it already exists.
				console.warn(`Desination directory '${toDir}' already exists; continuing`);
				resolve();
			} else {
				reject(err);
			}
			}
			resolve();
		});
	});
}

function readDirPromise(fromDir) {
	return new Promise((resolve, reject) => {
		// Read the "from" directory.
		fs.readdir(fromDir, (err, fileNames) => {
			if (err) {
				reject(err);
			}
			// For each file in the "from" directory:
			for (let fileName of fileNames) {
				readFilePromise(fromDir, fileName)
					.then(result => writeFilePromises(result[0], result[1])
						.then(output => {console.log(output);})
						.catch(err => console.log(err)))
					.catch(err => {console.log(`Error: ${err}`);});
			}
		});
	});
}

function readFilePromise(fromDir, fileName){
	return new Promise((resolve, reject) => {
		// Create a regular expresion from the pattern on the command line.
		const re = RegExp(pattern);
		// Read the file
		fs.readFile(path.join(fromDir, fileName), { encoding: 'utf-8'}, (err, data) => {
			if (err) {
				reject(err);
			}
			console.log(`==== ${fileName} ====`);
			let outputLines = [];
			// Iterate over each line of the file
			for (let line of data.split(/\n/)) {
				// If the line matches the input pattern
				if (line.match(re)) {
				// Add it to the lines to be written to the "to" directory.
				console.log(`>>> ${line}`);
				outputLines.push(line);
				} else {
				console.log(`${line}`);
				}
			}
			// Write matchine lines to the corresponding file in the "to" directory.
			const toPath = path.join(toDir, fileName);
			resolve([toPath, outputLines]);
		});
	});
}


function writeFilePromises(toPath, outputLines) {
	return new Promise((resolve, reject) => {
	 	fs.writeFile(toPath, outputLines.join('\n') + '\n', err => {
			if (err) {
			reject(err);
			} else {
			resolve(`Wrote ${outputLines.length} lines to ${toPath}`);
			}
		});
	});
}

function dirFilterWithPromises(pattern, fromDir, toDir) {
	//Create the "to" directory
	mkdirPromise(toDir)
		.then(() => {readDirPromise(fromDir).catch(err => {console.log(`Error: ${err}`);})})
		.catch(err => {console.log(`Error: ${err}`);});
}
// Get the name of the program for error reporting.
const prog = path.basename(process.argv[1]);

// Process command-line arguments.
if (process.argv.length != 5) {
console.error(`Usage: ${prog}: <pattern> <from dir> <to dir>`);
process.exit(1);
}

// Extract and echo relevant arguments from the command line.
let [ , , pattern, fromDir, toDir] = process.argv;
console.log(`Match '${pattern}' from files in '${fromDir}' to '${toDir}'`);

dirFilterWithPromises(pattern, fromDir, toDir);

//dirFilterWithCallbacks(pattern, fromDir, toDir);

// Implement this:
// dirFilterWithPromises(pattern, fromDir, toDir);
