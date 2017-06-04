// ========================================================================
// Server init
// ========================================================================

// Filesystem reading functions
const fs = require('fs-extra');

// Load settings
try {
	stats = fs.lstatSync('settings.json');
} catch (e) {
	// If settings do not yet exist
	if (e.code == "ENOENT") {
		try {
			fs.copySync(
				'settings.example.json',
				'settings.json'
			);
			console.log("Created new settings file.");
		} catch(e) {
			console.log(e);
			throw "Could not create new settings file.";
		}
	// Else, there was a misc error (permissions?)
	} else {
		console.log(e);
		throw "Could not read 'settings.json'.";
	}
}

// Load settings into memory
const settings = require("./settings.json");

// Load ban list
var bans, banList;
fs.writeFile("./bans.json", "{}", { flag: 'wx' }, function (err) {
	if (!err) console.log("Created empty bans list.");
    try {
		bans = require("./bans.json");
		banList = Object.keys(bans);
    } catch(e) {
		throw "Could not load bans.json. Check syntax and permissions.";
    }
});

// Setup basic express server
var express = require('express');
var app = express();
if (settings.express.serveStatic)
	app.use(express.static("../build/www"));
var server = require('http').createServer(app);

// Init socket.io
var io = require('socket.io')(server);
var port = process.env.PORT || settings.port;

// Init sanitize-html
var sanitize = require('sanitize-html');

// Init winston loggers (hi there)
var winston = require('winston');
var path = require('path');

var log = {};
var logKeys = Object.keys(settings.log);
for (var i = 0; i < logKeys.length; i++) {
	var key = logKeys[i];
	var obj = settings.log[key];
	var dir = path.dirname(obj.filename);

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	var transports = [
		new (winston.transports.File)(obj)
	];
	if (settings.consoleOutput)
		transports.push(new (winston.transports.Console)())
	log[key] =  new (winston.Logger)({
		transports: transports
	});
}

// Start actually listening
server.listen(port, function () {
	console.log(
		" Welcome to BonziWORLD!\n",
		"Time to meme!\n",
		"----------------------\n",
		"Server listening at port " + port
	);
});
app.use(express.static(__dirname + '/public'));

// ========================================================================
// Banning functions
// ========================================================================

function saveBans() {
	fs.writeFile(
		"./bans.json",
		JSON.stringify(bans),
		{ flag: 'w' },
		function (error) {
			log.info.log('info', 'banSave', {
				error: error
			});
		}
	);
}

// Ban length is in minutes
function addBan(ip, length, reason) {
	length = parseFloat(length) || settings.banLength;
	reason = reason || "N/A";
	bans[ip] = {
		reason: reason,
		end: new Date().getTime() + (length * 60000)
	};
	banList = Object.keys(bans);

	var sockets = io.sockets.sockets;
	var socketList = Object.keys(sockets);

	for (var i = 0; i < socketList.length; i++) {
		var socket = sockets[socketList[i]];
		if (socket.request.connection.remoteAddress == ip)
			handleBan(socket);
	}
	saveBans();
}

function removeBan(ip) {
	delete bans[ip];
	banList = Object.keys(bans);
	saveBans();
}

function handleBan(socket) {
	var ip = socket.request.connection.remoteAddress;
	if (bans[ip].end <= new Date().getTime()) {
		removeBan(ip);
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
}

// ========================================================================
// Helper functions
// ========================================================================

// GUID generator (okay not actually GUID compliant but whatever)
// http://stackoverflow.com/a/105074
function guidGen() {
	var s4 = function() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};
	var id = '';
	for (var i = 0; i < 4; i++)
		id += s4();
	return id;
}


// http://stackoverflow.com/a/1527820
function randomRangeInt(min, max) {
	return Math.floor(((max - min + 1) * Math.random()) + min);
};

// ========================================================================
// The Beef(TM)
// ========================================================================

var rooms = {};
var roomsPublic = [];
var usersPrivate = {};

io.on('connection', function(socket) {
	var guid = guidGen();
	socket.guid = guid;
	var ip = socket.request.connection.remoteAddress;

	log.access.log('info', 'connect', {
		guid: guid,
		ip: ip,
		port: port
	});

	// Information that does not need to be sent or is volatile
	var userPrivate = usersPrivate[guid] = {
		login: false,
		sanitize: true,
		runlevel: 0,
		mute: false
	};

	// Information required for client (set at login)
	socket.on('login', function(data) {
		log.info.log('info', 'login', {
			guid: guid,
		});

		// --- Test if room is full
		function roomFull(room) {
			var full = false;
			try {
				full = Object.keys(rooms[room].usersPublic).length >=
					rooms[room].prefs.room_max;
			} catch(e) {}
			return full;
		}

		// --- Create room
		function newRoom(room, prefs) {
			rooms[room] = {
				prefs: prefs,
				usersPublic: {}
			};
			log.info.log('debug', 'newRoom', {
				room: room
			});
		}

		// --- Room init
		var room = data.room;

		if (sanitize(room) != room) {
			socket.emit("loginFail", {
				reason: "nameMal"
			});
			return;
		}

		// Check if room was explicitly specified
		var roomSpecified = true;

		// If not, set room to public
		if ((typeof room == "undefined") || (room === "")) {
			room = roomsPublic[Math.max(roomsPublic.length - 1, 0)];
			roomSpecified = false;
		}
		log.info.log('debug', 'roomSpecified', {
			guid: guid,
			roomSpecified: roomSpecified
		});

		// If private room
		if (roomSpecified) {
			// If room does not yet exist
			if (typeof rooms[room] == "undefined") {
				// Clone default settings
				var tmpPrefs = JSON.parse(JSON.stringify(settings.prefs.private));
				// Set owner
				tmpPrefs.owner = guid;
				// Create room
				newRoom(room, tmpPrefs);
			}
			// If room is full, fail login
			if (roomFull(room)) {
				log.info.log('warn', 'loginFail', {
					guid: guid,
					reason: "full"
				});
				socket.emit("loginFail", {
					reason: "full"
				});
				return;
			}
		// If public room
		} else {
			// If room does not exist or is full, create new room
			if ((typeof rooms[room] == "undefined") || roomFull(room)) {
				room = guidGen();
				roomsPublic.push(room);
				// Create room
				newRoom(room, settings.prefs.public);
			}
		}

		// --- Set color
		var color = settings.bonziColors[Math.floor(
			Math.random() * settings.bonziColors.length
		)];
		log.info.log('debug', 'color', {
			guid: guid,
			color: color
		});

		// Create aliases
		var prefs = rooms[room].prefs;
		var usersPublic = rooms[room].usersPublic;

		// Check name
		var name = sanitize(data.name) || prefs.defaultName;

		if (name.length > prefs.name_limit) {
			socket.emit("loginFail", {
				reason: "nameLength"
			});
			return;
		}

		// Join the room on the socket 
		socket.join(room);

		// For times when room is out of context
		socket.room = room;

		var speed;
		if (prefs.speed.default == "random")
			speed = randomRangeInt(
				prefs.speed.min,
				prefs.speed.max
			);
		else speed = prefs.speed.default;

		var pitch;
		if (prefs.pitch.default == "random")
			var pitch = randomRangeInt(
				prefs.pitch.min,
				prefs.pitch.max
			);
		else pitch = prefs.pitch.default;

		// Init public user info
		var userPublic = usersPublic[guid] = {
			name: name,
			color: color,
			speed: speed,
			pitch: pitch
		};

		// Set as logged in
		userPrivate.login = true;
		
		// Send all user info
		socket.emit('updateAll', {
			usersPublic: usersPublic
		});

		// Send room info
		socket.emit('room', {
			room: room,
			isOwner: prefs.owner == guid,
			isPublic: roomsPublic.indexOf(room) != -1
		});

		// Send own user info to all
		io.to(room).emit('update', {
			guid: guid,
			userPublic: userPublic
		});

		// -- Talk
		socket.on('talk', function(data) {
			log.info.log('debug', 'talk', {
				guid: guid,
				text: data.text
			});
			if (!userPrivate.mute && (typeof data.text != "undefined")) {
				var text = userPrivate.sanitize ? sanitize(data.text) : data.text;
				if ((text.length <= prefs.char_limit) && (text.length > 0)) {
					io.to(room).emit('talk', {
						guid: guid,
						text: text
					});
				}
			}
		});

		socket.on('command', function(data) {
			var list = data.list;
			var command = list[0].toLowerCase();
			var args = list.slice(1);
			var argsString = args.join(" ");

			var commands = {
				"godmode": function(args) {
					var success = args[0] == prefs.godword;
					if (success)
						userPrivate.runlevel = 3;
					log.info.log('debug', 'godmode', {
						guid: guid,
						success: success
					});
				},
				"sanitize": function(args) {
					userPrivate.sanitize = argsString.toLowerCase() != "false";
				},
				"joke": function() {
					io.to(room).emit("joke", {
						guid: guid,
						rng: Math.random()
					});
				},
				"fact": function() {
					io.to(room).emit("fact", {
						guid: guid,
						rng: Math.random()
					});
				},
				"youtube": function(args) {
					var vid = userPrivate.sanitize ? sanitize(args[0]) : args[0];
					io.to(room).emit("youtube", {
						guid: guid,
						vid: vid
					});
				},
				"backflip": function() {
					io.to(room).emit("backflip", {
						guid: guid,
						swag: args[0] == "swag"
					});
				},
				"linux": function() {
					io.to(room).emit("linux", {
						guid: guid
					});
				},
				"pawn": function() {
					io.to(room).emit("pawn", {
						guid: guid
					});
				},
				"bees": function() {
					io.to(room).emit("bees", {
						guid: guid
					});
				},
				"color": function() {
					if (args.length != 0) {
						if (settings.bonziColors.indexOf(args[0]) != -1) {
							userPublic.color = args[0];
							io.to(room).emit('update', {
								guid: guid,
								userPublic: userPublic
							});
						}
					} else {
						var bc = settings.bonziColors;
						userPublic.color = bc[
							Math.floor(Math.random()*bc.length)
						];
						io.to(room).emit('update', {
							guid: guid,
							userPublic: userPublic
						});
					}
				},
				"pope": function() {
					userPublic.color = "pope";
					io.to(room).emit('update', {
						guid: guid,
						userPublic: userPublic
					});
				},
				"asshole": function(args) {
					var target = userPrivate.sanitize ? sanitize(argsString) : argsString;
					io.to(room).emit("asshole", {
						guid: guid,
						target: target
					});
				},
				"triggered": function() {
					io.to(room).emit("triggered", {
						guid: guid
					});
				},
				"vaporwave": function() {
					socket.emit("vaporwave");
					io.to(room).emit("youtube", {
						guid: guid,
						vid: "cU8HrO7XuiE"
					});
				},
				"unvaporwave": function() {
					socket.emit("unvaporwave");
				},
				"name": function() {
					if (argsString.length <= prefs.name_limit) {
						var name = argsString || prefs.defaultName;
						userPublic.name = userPrivate.sanitize ? sanitize(name) : name;
						io.to(room).emit('update', {
							guid: guid,
							userPublic: userPublic
						});
					}
				},
				"pitch": function() {
					var pitch = parseInt(args[0]);
					if (!isNaN(pitch)) {
						userPublic.pitch = Math.max(
							Math.min(parseInt(pitch), prefs.pitch.max),
							prefs.pitch.min
						);
						io.to(room).emit('update', {
							guid: guid,
							userPublic: userPublic
						});
					}
				},
				"speed": function() {
					var speed = parseInt(args[0]);
					if (!isNaN(speed)) {
						userPublic.speed = Math.max(
							Math.min(parseInt(speed), prefs.speed.max),
							prefs.speed.min
						);
						io.to(room).emit('update', {
							guid: guid,
							userPublic: userPublic
						});
					}
				},
			};

			log.info.log('debug', command, {
				guid: guid,
				args: args
			});
			try {
				if (userPrivate.runlevel >= (prefs.runlevel[command] || 0))
					commands[command](args);
				else
					socket.emit('commandFail', {
						reason: "runlevel"
					});
			} catch(error) {
				log.info.log('debug', 'commandFail', {
					guid: guid,
					command: command,
					args: args,
					reason: "unknown",
					error: error
				});
				socket.emit('commandFail', {
					reason: "unknown"
				});
			}
		});
	});

	socket.on('disconnect', function() {
		// Just in case anything is out of context
		var room = socket.room;

		var ip = "N/A";
		var port = "N/A";

		try {
			var ip = socket.handshake.address.address;
			var port = socket.handshake.address.port;
		} catch(e) { 
			log.info.log('warn', "exception", {
				guid: guid,
				exception: e
			});
		}

		log.access.log('info', 'disconnect', {
			guid: guid,
			ip: ip,
			port: port
		});
		
		try {
			// Delete user
			delete usersPrivate[guid];
			socket.broadcast.emit('leave', {
				guid: guid
			});

			// Remove user from public list
			delete rooms[room].usersPublic[guid];
			// If room is empty
			if (Object.keys(rooms[room].usersPublic).length === 0) {
				log.info.log('debug', 'removeRoom', {
					room: room
				});
				// Delete room
				delete rooms[room];

				var publicIndex = roomsPublic.indexOf(room);
				if (publicIndex != -1) {
					roomsPublic.splice(publicIndex, 1);
				}

			}
		} catch(e) { 
			log.info.log('warn', "exception", {
				guid: guid,
				exception: e
			});
		}
	});

	// Handle ban
	if (banList.indexOf(ip) != -1) {
		handleBan(socket);
	}
});

// Console commands

var stdin = process.openStdin();

stdin.addListener("data", function(input) {
	var list = input.toString().trim().split(" ");
	var command = list[0].toLowerCase();
	var args = list.slice(1);
	var argsString = args.join(" ");

	var help = {
		"ban": "ban: ip[ length reason]",
		"unban": "unban: ip"
	};

	var commands = {
		"ban": function(args) {
			if (args.length === 0) {
				console.log(help["ban"]);
				return;
			} else {
				var ip = args[0];
				var length = args[1];
				var reason = args.slice(2).join(" ");

				addBan(ip, length, reason);
				console.log(
					"ban: " +
					ip + "," +
					length + "," +
					reason
				);
			}
		},
		"unban": function(args) {
			if (args.length === 0) {
				console.log(help["unban"]);
				return;
			} else {
				var ip = args[0];
				removeBan(ip);
				console.log("unban: " + ip);
			}
		},
		"help": function() {
			var keys = Object.keys(help);
			for (var i = 0; i < keys.length; i++)
				console.log(help[keys[i]]);
		}
	};

	try {
		commands[command](args);
	} catch(error) {
		console.log("Invalid command.");
		console.log(error);
	}
});