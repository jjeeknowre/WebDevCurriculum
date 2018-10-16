const express = require('express'),
	path = require('path'),
	app = express()
	EventEmitter = require('events')
	fs = require('fs');
const emitter = new EventEmitter();

app.use(express.static('client'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	console.log('test');
	res.sendFile(path.join(__dirname, 'index.html'));
});


// from Quest 11
app.get('/foo', (req, res) => {
	let message = 'Hello World';
	if (req.query.bar) {
		message = `Hello, ${req.query.bar}`;
	}
	console.log(message);
	res.send(message);
});
app.get('/foo/:bar', (req, res) => { 
	let message = `Hello, ${req.params.bar}`;
	console.log(message);
	res.send(message);
});
app.post('/foo', (res) => {
	let message = 'Hello World';
	if (req.query.bar) {
		message = `Hello, ${req.query.bar}`;
	}
	console.log(message);
	res.send(message);
});


// Notepad API
let filedir = './client/filedir'; // code doesn't work when directory is named 'files' (same as API)
app.get('/files', (req, res) => {
	fs.readdir(filedir, 'utf8', (err, files) => {
		res.send(JSON.stringify(files));
	});
});
app.get('/files/:filename', (req, res) => {
	let filepath = filedir + '/' + req.params.filename;
	fs.stat(filepath, (err) => {
		if (!err) {
			fs.readFile(filepath, 'utf8', (err, text) => {
				res.status(200).send(JSON.stringify({ text: text }));
			});
		} else {
			res.status(400).send(JSON.stringify({ message: 'no such file exists' }));
		}
	});
});
app.post('/files', (req, res) => {
	let filepath = filedir + '/' + req.body.name;
	console.log(req.body);
	fs.stat(filepath, (err) => {
		if (!err) {
			res.status(400).send(JSON.stringify({ message: `the file ${req.body.name} already exists` }));
		} else {
			fs.writeFile(filepath, req.body.text, 'utf8', (err) => {
				res.status(200).send(JSON.stringify({ message: `the file ${req.body.name} was created` }));
			});
		}
	});
});
app.put('/files/:filename', (req, res) => {
	let filepath = filedir + '/' + req.params.filename;
	fs.stat(filepath, (err) => {
		if (!err) {
			fs.writeFile(filepath, req.body.text, 'utf8', (err) => {
				res.status(200).send(JSON.stringify({ message: `the file ${req.params.filename} was saved` }));
			});
		} else {
			res.status(400).send(JSON.stringify({ message: `the file ${req.body.name} does not exist` }));
		}
	});
});
app.delete('/files/:filename', (req, res) => {
	let filepath = filedir + '/' + req.params.filename;
	fs.stat(filepath, (err) => {
		if (!err) {
			fs.unlink(filepath, (err) => {
				res.status(200).send(JSON.stringify({ message: `the file ${req.params.filename} was deleted` }));
			});
		} else {
			res.status(400).send(JSON.stringify({ message: `the file ${req.body.name} does not exist` }));
		}
	});
});


const server = app.listen(8080, () => {
	console.log('Server started!');
});

