var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');

var long_server = net.createServer().listen(8986);
var long_socket = null;

long_server.on('connection', function(socket) {
	console.log('long connection accepted.');
	common.setupSocket(socket);
	long_socket = socket;

	socket.on('error', function(err){
		console.log('long ERR: ' + err.message);
	});
});

var short_server = http.createServer().listen(8999);

short_server.on('upgrade', function(req, socket, head) {
	socket.on('error', function(err){
		console.log('short ERR: ' + err.message);
	});

	common.setupSocket(socket);

	common.printIO('> ',
		req['method'] + ' ' + req['url'] + '\n' +
		common.headerLines(req),
		socket.remoteAddress, socket.remotePort
	);

    if (head && head.length) socket.unshift(head);
	
	var tmpMsg =
		req.method + ' ' + req.url + '\r\n' +
		common.headerLines(req) + '\r\n';


	if (long_socket) {
		common.printIO('>>', tmpMsg,
			long_socket.remoteAddress, long_socket.remotePort
		);

		long_socket.write(tmpMsg);
		///////////// long_socket.end();

		socket.pipe(long_socket)
		long_socket.pipe(socket);
	}
});
