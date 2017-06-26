var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');

var g_socket_id = 0;
var pipe_listener = net.createServer().listen(8986);
var pipe_sockets = [];

function pipe_alloc(assoc_id) {
	for (var i = 0; i < pipe_sockets.length; i++) {
		if (pipe_sockets[i].assoc_id == 0) {
			pipe_sockets[i].assoc_id = assoc_id;
			return pipe_sockets[i];
		}
	}

	return null;
}

function pipe_free(assoc_id) {
	for (var i = 0; i < pipe_sockets.length; i++) {
		if (pipe_sockets[i].assoc_id == assoc_id) {
			console.log('pipe socket' + assoc_id + ' ended.');
			pipe_sockets[i].end();
			return;
		}
	}

	console.log('nothing ended.');
}

pipe_listener.on('connection', function(socket) {
	console.log('new pipe accepted.');
	common.setupSocket(socket);

	socket.on('error', function(err){
		console.log('pipe ERR: ' + err.message);
	});

	socket.assoc_id = 0;
	pipe_sockets.push(socket);
});

var pub_listener = http.createServer().listen(8999);
pub_listener.on('upgrade', function(req, socket, head) {
//	peer_info = {
//		'IP': socket.remoteAddress,
//		'port': socket.remotePort,
//		'UsrAgent': req.headers['user-agent'],
//	};
//	console.log(peer_info);

	common.setupSocket(socket);

	/* allocate ID */
	socket.assoc_id = (++g_socket_id);
	console.log('new public socket' + socket.assoc_id);

	/* allocate a free pipe socket */
	var free_socket = pipe_alloc(socket.assoc_id);
	if (free_socket == null) {
		console.log('no free pipe');
		return;
	} else {
		console.log('pipe allocated.');
	}

	/* forward this upgrade message first */
	if (head && head.length) socket.unshift(head);
	var upgradeMsg =
		req.method + ' ' + req.url + '\r\n' +
		common.headerLines(req) + '\r\n';
	free_socket.write(upgradeMsg);

	/* associate sockets for incomming traffic */
	socket.pipe(free_socket);
	free_socket.pipe(socket);

	/* disassociate pipe on deletion */
	socket.on('end', function() {
		pipe_free(this.assoc_id);
		this.destroy();
		this.unref();
	});
});
