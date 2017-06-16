var net = require('net');
var http = require('http');
var common = require('./wsproxy-common.js');

var long_server = net.createServer().listen(8986);
var long_socket = null;

long_server.on('connection', function(socket) {
	console.log('long connection accepted.');
	common.setupSocket(socket);
	long_socket = socket;

	//socket.write('Echo server\r\n');

	socket.on('error', function(err){
		console.log('ERR: ' + err.message);
	});
});

var short_server = http.createServer().listen(8999);

short_server.on('upgrade', function(req, socket, head) {
	common.printIO('> ',
		req['method'] + ' ' + req['url'] + '\n' +
		common.headerLines(req),
		socket.remoteAddress, socket.remotePort
	);

    if (head && head.length) socket.unshift(head);

	var proxyReqOptions = {
		host: 'localhost:8989',
		hostname: 'localhost',
		port: 8989,
		path: req.url,
		method: req.method,
		headers: common.extend({}, req.headers)
	};

	var proxyReq = http.request(proxyReqOptions);
	proxyReq.end();

	common.printIO('>>',
		proxyReqOptions.method + ' ' + proxyReqOptions.path + '\n' +
		common.headerLines(proxyReqOptions),
		proxyReqOptions.hostname, proxyReqOptions.port
	);

	proxyReq.on('error', function (err) {
		console.log('ERR: ' + err.message);
	});

	proxyReq.on('upgrade', function(proxyRes, proxySocket, proxyHead) {
		common.setupSocket(proxySocket);

		var upgradeResponse =
			'HTTP/' + proxyRes.httpVersion + ' ' +
			proxyRes.statusCode + ' ' +
			proxyRes.statusMessage + '\r\n' +
			common.headerLines(proxyRes) + '\r\n';

		common.printIO('< ', upgradeResponse,
			proxySocket.remoteAddress, proxySocket.remotePort
		);

		proxySocket.on('end', function () {
			short_server.close();
		});
		proxySocket.on('error', function (err) {
			console.log('ERR: ' + err.message);
		});
		socket.on('error', function () {
			proxySocket.end();
		});

		if (proxyHead && proxyHead.length)
			proxySocket.unshift(proxyHead);

		common.printIO('<<', upgradeResponse,
			socket.remoteAddress, socket.remotePort
		);
		console.log(upgradeResponse);

		socket.write(upgradeResponse);
		proxySocket.pipe(socket).pipe(proxySocket);
		//long_socket.pipe(socket);
	});
});
