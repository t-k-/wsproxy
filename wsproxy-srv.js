var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');

var g_socket_id = 0;
var pipe_listener = net.createServer().listen(8986);
var pipes = {};

function print_pipes() {
	Object.keys(pipes).forEach(function(id) {
		console.log('pipe' + id + ' assoc:' + JSON.stringify(pipes[id].assoc));
	});
}

pipe_listener.on('connection', function(socket) {
	console.log('one pipe accepted.');
	common.setupSocket(socket);
	socket.id = (++g_socket_id);

	socket.on('error', function(err){
		console.log('pipe ERR: ' + err.message);
	});

	pipes[socket.id] = {'assoc': {}, 'socket': socket};
	print_pipes();
});

//var short_server = http.createServer().listen(8999);

//short_server.on('upgrade', function(req, socket, head) {
//	socket.on('error', function(err){
//		console.log('short ERR: ' + err.message);
//	});
//
//	common.setupSocket(socket);
//
//	common.printIO('> ',
//		req['method'] + ' ' + req['url'] + '\n' +
//		common.headerLines(req),
//		socket.remoteAddress, socket.remotePort
//	);
//
//    if (head && head.length) socket.unshift(head);
//	
//	var tmpMsg =
//		req.method + ' ' + req.url + '\r\n' +
//		common.headerLines(req) + '\r\n';
//
//
//	if (long_socket) {
//		common.printIO('>>', tmpMsg,
//			long_socket.remoteAddress, long_socket.remotePort
//		);
//
//		long_socket.write(tmpMsg);
//		///////////// long_socket.end();
//
//		socket.pipe(long_socket)
//		long_socket.pipe(socket);
//	}
//});

var pub_listener = http.createServer().listen(8999);
pub_listener.on('upgrade', function(req, socket, head) {
	peer_key = {
		'IP': socket.remoteAddress,
		'port': socket.remotePort,
		'UsrAgent': req.headers['user-agent'],
	};
	common.setupSocket(socket);
	console.log(peer_key);
//	common.printIO('> ',
//		req['method'] + ' ' + req['url'] + '\n' +
//		common.headerLines(req),
//		socket.remoteAddress, socket.remotePort
//	);
});

//short_server.on('upgrade', function(req, socket, head) {
//	socket.on('error', function(err){
//		console.log('short ERR: ' + err.message);
//	});
//
//	common.setupSocket(socket);
//
//	common.printIO('> ',
//		req['method'] + ' ' + req['url'] + '\n' +
//		common.headerLines(req),
//		socket.remoteAddress, socket.remotePort
//	);
//
//    if (head && head.length) socket.unshift(head);
