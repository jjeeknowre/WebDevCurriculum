const express = require('express'),
	path = require('path'),
	app = express()
	fs = require('fs')
	cookieParser = require('cookie-parser')
	session = require('express-session');

app.use(express.static('client'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'secretstring13',
	resave: true,
	saveUninitialized: true,
	cookie: { }
}));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, './client/notepad.html'));
});


// login
app.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	let users = JSON.parse(fs.readFileSync('./client/users.json'));
	session.user = null;
	users.forEach((user) => {
		if (user.username === username && user.password === password) {
			session.user = username;
		}
	})
	
	if (session.user) {
		res.cookie('user', session.user);
		res.status(200).send(JSON.stringify({ message: "successful login"}));
	} else {
		res.status(400).send(JSON.stringify({ message: "unsuccessful login" }));
	}
});
app.get('/logout', (req, res) => {
	res.clearCookie('user');
	req.session.destroy();
	res.status(200).send(JSON.stringify({ message: "successful logout"}));
});

// Notepad API
app.get('/users/:username', (req, res) => {
	let username = req.params.username;
	let users = JSON.parse(fs.readFileSync('./client/users.json'));
	users.forEach((user) => {
		if (user.username === username) {
			return res.status(200).send(JSON.stringify(user));
		}
	});
});
app.put('/users/:username', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	let username = req.params.username;
	let data = req.body;
	let users = JSON.parse(fs.readFileSync('./client/users.json'));
	users.forEach((user) => {
		if (user.username === username) {
			user.password = data.password ? data.password : user.password;
			user.cursor = data.cursor !== null ? parseInt(data.cursor, 10) : user.cursor;
			user.tabs = data.tabs ? data.tabs : user.tabs;
			user.opentab = data.opentab !== null ? parseInt(data.opentab, 10) : user.opentab;
		}
	});
	fs.writeFile('./client/users.json', JSON.stringify(users), 'utf8', () => {
		res.status(200).send(JSON.stringify({ message: `the user ${username} was updated`}));
	});
});

let filedir = './client/filedir'; // code doesn't work when directory is named 'files' (same as API)
app.get('/files', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	fs.readdir(filedir, 'utf8', (err, files) => {
		res.send(JSON.stringify(files));
	});
});
app.get('/files/:filename', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
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
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	let filepath = filedir + '/' + req.body.name;
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
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
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
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
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