const express = require('express'),
	path = require('path'),
	app = express()
	fs = require('fs')
	cookieParser = require('cookie-parser')
	session = require('express-session')
	Sequelize = require('sequelize')
	bcrypt = require('bcrypt');

app.use(express.static('./client_webpack'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'secretstring13',
	resave: true,  
	saveUninitialized: true,
	cookie: { }
}));


const saltRounds = 10;

// Sequlize objects
const connection = new Sequelize('joshtest', 'root', 'rhatpakflrk', {
	dialect: 'mysql',
	host: 'locian.knowreinc.com',
	port: 41736
});

let File = connection.define('File', {
	name: {
		primaryKey: true,
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			len: [4, 100]
		}
	},
	text: {
		type: Sequelize.TEXT,
		defaultValue: ''
	}
});
let Tab = connection.define('Tab', {
	filename: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			len: [4, 100]
		}
	},
	user: {
		type: Sequelize.STRING,
		allowNull: false
	},
	cursor: {
		type: Sequelize.INTEGER,
		allowNull: false
	}
});
let User = connection.define('User', {
	username: {
		primaryKey: true,
		type: Sequelize.STRING,
		unique: true,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	salt: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [20, 30]
		}
	},
	opentab: {
		type: Sequelize.INTEGER
	}
});

User.hasMany(Tab, {foreignKey: 'user', targetKey: 'username'});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, './client/index.html'));
});

// login
app.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	User.findOne({ where : { username: username } }).then(user => {
		if (user) {
			bcrypt.compare(password, user.dataValues.password).then(match => {
				if (match) {
					session.user = username;
					return res.status(200).send(JSON.stringify({ message: "successful login"}));
				} else {
					return res.status(400).send(JSON.stringify({ message: "unsuccessful login" }));
				}
			});
		} else {
			return res.status(400).send(JSON.stringify({ message: "unsuccessful login" }));
		}
	});
});
app.get('/login', (req, res) => {
	if (!session.user) {
		return res.status(401).send(JSON.stringify({ message: "please login" }));
	} else {
		return res.status(200).send(JSON.stringify({ user: session.user }));
	}
});
app.get('/logout', (req, res) => {
	session.user = null;
	req.session.destroy();
	return res.status(200).send(JSON.stringify({ message: "successful logout"}));
});

// Notepad API
app.get('/users/:username', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	let username = req.params.username;
	User.findOne({
		where: { username: username },
		include: [ Tab ]
	}).then(user => {
		if (user) {
			return res.status(200).send(JSON.stringify(user.toJSON()));
		} else {
			return res.status(400);
		}
	});
});
app.put('/users/:username', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	let username = req.params.username;
	let data = req.body;

	Tab.destroy({ where: { user: username } });
	let tabs = [];
	if (data.tabs) {
		tabs = data.tabs;
		delete data.tabs;
	}
	for (let tab of tabs) {
		Tab.create(tab);
	}
	User.update(data, {
		where: {
			username: username
		}
	});
	res.status(200).send(JSON.stringify({ message: `the user ${username} was updated`}));	
});

app.get('/files', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	File.findAll().then(data => {
		files = [];
		data.forEach(file => { files.push(file.toJSON()) })
		return res.status(200).send(JSON.stringify(files));
	});
});
app.get('/files/:filename', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	File.findOne({
		where: { name: req.params.filename },
	}).then(file => {
		if (file) {
			return res.status(200).send(JSON.stringify(file.toJSON()));
		} else {
			return res.status(400);
		}
	});
});
app.post('/files', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	File.create(req.body).then(() => {
		res.status(200).send(JSON.stringify({ message: `the file ${req.body.name} was created` }));
	}).catch(() => {
		res.status(400).send(JSON.stringify({ message: `the file ${req.body.name} already exists` }));
	});
});
app.put('/files/:filename', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	File.update(req.body, { where: { name: req.params.filename } }).then(() => {
		res.status(200).send(JSON.stringify({ message: `the file ${req.params.filename} was saved` }));
	}).catch(() => {
		res.status(400).send(JSON.stringify({ message: `the file ${req.body.name} does not exist` }));
	});
});
app.delete('/files/:filename', (req, res) => {
	if (!session.user) { return res.status(401).send(JSON.stringify({ message: 'please login' })); }
	File.destroy({ where: { name: req.params.filename } }).then(() => {
		res.status(200).send(JSON.stringify({ message: `the file ${req.params.filename} was deleted` }));
	}).catch(() => {
		res.status(400).send(JSON.stringify({ message: `the file ${req.body.name} does not exist` }));
	});
});

const server = app.listen(8080, () => {
	console.log('Server started!');
});