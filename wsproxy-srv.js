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

function pipe_list() {
	for (var i = 0; i < pipe_sockets.length; i++) {
		var assoc_id = pipe_sockets[i].assoc_id;
		if (assoc_id == 0)
			console.log('pipe[' + i + '] (free)');
		else
			console.log('pipe[' + i + '] => ' +
			            'public socket' + assoc_id);
	}
}

function pipe_free(assoc_id) {
	for (var i = 0; i < pipe_sockets.length; i++) {
		if (pipe_sockets[i].assoc_id == assoc_id) {
			console.log('pipe[' + i + '] public socket' +
			            assoc_id + ' ended.');
			/* send FIN to the other end. */
			pipe_sockets[i].end();
			/* remove it from array. */
			pipe_sockets.splice(i, 1);
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
	socket.on('end', function() {
		pipe_free(this.assoc_id);
		this.unpipe(); /* to notify its associated
		                  pub socket to close itself. */
		this.destroy();
		this.unref();

		/* print all current pipes */
		pipe_list();
	});

	socket.assoc_id = 0;
	pipe_sockets.push(socket);

	/* print all current pipes */
	pipe_list();
});

var pub_listener = http.createServer().listen(8999);
console.log('listening...');

pub_listener.on('upgrade', function(req, socket, head) {
	/* print client info */
	client_info = {
		'IP': socket.remoteAddress,
		'port': socket.remotePort,
		'UsrAgent': req.headers['user-agent'],
	};
	console.log(client_info);

	/* setup socket */
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
		console.log('a free pipe allocated.');
	}

	/* print all current pipes */
	pipe_list();

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

		/* print all current pipes */
		pipe_list();
	});

	socket.on('error', function(err){
		console.log('pub socket ERR: ' + err.message);
	});

	socket.on('unpipe', function() {
		console.log('pub socket unpiped.');
		this.destroy();
		this.unref();
	});
});
