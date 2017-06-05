const merge = require('merge');
const Settings = require("./settings.json");
const Winston = require("winston");

class User {
    constructor(socket, roomList) {
        this.guid = guidGen(); // TODO
        this.socket = socket;
        this.roomList = roomList;
        // socket.guid = guid;

        this.private = {
            login: false,
            sanitize: true,
            runlevel: 0,
            mute: false
        };

        socket.on('login', (data) => { this.login(data) });
    }

    login(data) {
        function fail(error) {
            Winston.debug("Failed to log in.", {
                "user": this,
                "data": data,
                "error": error
            });
            this.socket.emit("loginFail", error);
        }

        Winston.debug("User logging in.", {
            "user": this,
            "data": data
        });

        let room = this.roomList.newRoom(data.room);
    }

    getGuid() {
        return this.guid;
    }

    getIp() {
        return this.socket.request.connection.remoteAddress;
    }
}

class Room {
    prefsDefault(priv) {
        let prefs;
        if (priv) prefs = Settings.prefs.private;
        else prefs = Settings.prefs.public;
        return JSON.parse(JSON.stringify(prefs));
    }

    constructor(id, user, priv) {
        this.prefs = this.prefsDefault(priv);
        if (priv) this.prefs.owner = user.getGuid();

        this.users = {};

        Winston.debug("Created new room.", {
            "prefs": this.prefs
        });
    }

    getFull() {
        return Object.keys(this.users).length >=
            this.prefs.room_max;
    }

    join() {

    }
}

module.exports.Room = Room;

class RoomList {
    constructor() {
        this.rooms = {};
        this.roomsPublic = [];
    }

    getPublicRoomId() {
        let id;
        let index = this.roomsPublic.length - 1;
        if (index == -1)
            id = this.newRoomId();
        else
            id = this.roomsPublic[index];
        return id;
    }

    newRoomId() {
        return guidGen(); // TODO
    }

    /**
     * Request either a new or preexisting room.
     * @param {string} id 
     * @param {User} user
     * @returns {object|string} Resulting room ID, or an object if an error occurs.
     */
    requestRoom(id, user) {
		// Check if room was explicitly specified
		let roomSpecified = (typeof id != "undefined") && (id != "");

		// If not, set room to public
		if (!roomSpecified) id = getPublicRoomId();
    }

    /**
     * Ensures a room exists. Creates it if it does not.
     * @param {string} id 
     * @param {User} user
     * @param {bool} priv
     * @returns {bool} Returns true if success, or false if failure.
     */
    ensureRoom(id, user, priv) {
        let room = this.rooms[id];
        let roomFull = false;
        let roomExists = typeof room != "undefined";
        
        if (!roomExists) {
            this.rooms[id] = new Room(id, user, priv);
            return true;
        }
    }
}

// Connect -> login -> request room -> check if exists -> check if full -> ???