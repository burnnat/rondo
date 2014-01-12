var winston = require("winston");

module.exports = function(req, res, next) {
	var sock = req.socket;
	
	var meta = {
		url: req.originalUrl || req.url,
		method: req.method,
		startTime: new Date(),
		remoteAddress: sock.socket
			? sock.socket.remoteAddress
			: sock.remoteAddress,
		headers: req.headers,
		body: req.body
	};
	
	var write = function(){
		res.removeListener('finish', write);
		res.removeListener('close', write);
		
		meta.status = res.headerSent
			? res.statusCode
			: null;
		meta.endTime = new Date();
		meta.responseTime = meta.endTime.getTime() - meta.startTime.getTime();
		
		winston.access('Handled HTTP request', meta);
	};
	
	res.on('finish', write);
	res.on('close', write);
	
	next();
};