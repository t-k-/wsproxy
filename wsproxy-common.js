var util = require('util');

module.exports = {
	setupSocket: function (socket) {
		socket.setTimeout(0);
		socket.setNoDelay(true);
		socket.setKeepAlive(true, 5000);
		return socket;
	},

	headerLines: function (req) {
		var ret_str = '';
		Object.keys(req.headers).forEach(function(key) {
			var val = req.headers[key];
			ret_str += key + ": " + val + "\r\n";
		});
		return ret_str;
	},

	printIO: function (prefix, req_str, ip, port) {
		timelog("From/to: " + ip + ':' + port);
		var req_arr = req_str.trim().split("\n");
		for(var key in req_arr) {
			timelog(prefix + ' ' + req_arr[key]);
		}
		timelog("\n");
	},

	timelog: function (string) {
		var tz_offset = (new Date()).getTimezoneOffset() * 60000;
		var local_time = (new Date(Date.now() - tz_offset)).toISOString().slice(0,-1);
		var prefix = local_time.replace(/T/, ' ').replace(/\..+/, '');
		console.log('[' + prefix + '] ' + string);
	},
	
	extend: util._extend
};
