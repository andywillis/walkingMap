app = require('./server/config').app
app.ROOT = __dirname
app.control = require('./server/controller').control

var port = 80
		,	fs = require('fs')
		,	onRequest = function(req, res) {require('./server/router').route(req.url, req, res)}
		,	server = require('http').createServer(onRequest).listen(port)
		
console.log('Server started on: ' + port)