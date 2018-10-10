const http = require('http');
const url = require('url');

http.createServer((req, res) => {
	console.log('request: ' + req.url);	
	
	let urlData = url.parse(req.url, true);
	if (req.method === 'GET') {
		if (urlData.pathname === '/foo' && urlData.query.bar) {
			res.write('Hello, ' + urlData.query.bar);
		} else {
			res.write('Hello World!');
		}
	} else if (req.method === 'POST') {
		if (urlData.pathname === '/foo' && urlData.query.bar) {
			res.write('Hello, ' + urlData.query.bar);
		} else {
			res.write('Hello World!');
		}
	} else {
		res.write('Hello World!');
	}
	res.end();
}).listen(8080);
