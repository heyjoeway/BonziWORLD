const log = require('./log.js').log;
const fs = require('fs-extra');

let bans;

exports.init = function() {
    fs.writeFile("./bans.json", "{}", { flag: 'wx' }, function(err) {
        if (!err) console.log("Created empty bans list.");
        try {
            bans = require("./bans.json");
        } catch(e) {
            throw "Could not load bans.json. Check syntax and permissions.";
        }
    });
};

exports.saveBans = function() {
	fs.writeFile(
		"./bans.json",
		JSON.stringify(bans),
		{ flag: 'w' },
		function(error) {
			log.info.log('info', 'banSave', {
				error: error
			});
		}
	);
};

// Ban length is in minutes
exports.addBan = function(ip, length, reason) {
	length = parseFloat(length) || settings.banLength;
	reason = reason || "N/A";
	bans[ip] = {
		reason: reason,
		end: new Date().getTime() + (length * 60000)
	};

	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);

	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip)
			exports.handleBan(socket);
	}
	exports.saveBans();
};

exports.removeBan = function(ip) {
	delete bans[ip];
	exports.saveBans();
};

exports.handleBan = function(socket) {
	var ip = socket.request.connection.remoteAddress;
	if (bans[ip].end <= new Date().getTime()) {
		exports.removeBan(ip);
	} else {		
		log.access.log('info', 'ban', {
			ip: ip,
			guid: socket.guid,
		});
		socket.emit('ban', {
			reason: bans[ip].reason,
			end: bans[ip].end
		});
		socket.disconnect();
	}
};

exports.kick = function(socket) {
    log.access.log('info', 'kick', {
        ip: ip,
        guid: socket.guid,
    });
    socket.emit('kick', {
        reason: bans[ip].reason
    });
    socket.disconnect();
};

exports.isBanned = function(ip) {
    return Object.keys(bans).indexOf(ip) != -1;
};