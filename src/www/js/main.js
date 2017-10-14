// http://stackoverflow.com/a/26118970
var undefined;
var hostname = isApp ? "bonziworld.com" : window.location.hostname;
var socket = io("http://" + hostname + ":3000");

var usersPublic = {};
var bonzis = {};

var debug = true;

function loadTest() {
	$("#login_card").hide();
	$("#login_error").hide();
	$("#login_load").show();

	window.loadTestInterval = rInterval(function() {
		try {
			if (!loadDone.equals(loadNeeded)) throw "Not done loading.";
			login();
			loadTestInterval.clear();
		} catch(e) {}
	}, 100);
}

function login() {
	socket.emit("login", {
		name: $("#login_name").val(),
		room: $("#login_room").val()
	});

	setup();
}

$(function() {
	$("#login_go").click(loadTest);

	$("#login_room").val(window.location.hash.slice(1));

	$("#login_name, #login_room").keypress(function(e) {
		if(e.which == 13) login();
	});

	socket.on("ban", function(data) {
		$("#page_ban").show();
		$("#ban_reason").html(data.reason);
		$("#ban_end").html(new Date(data.end).toString());
	});

	socket.on("kick", function(data) {
		$("#page_kick").show();
		$("#kick_reason").html(data.reason);
	});

	socket.on("loginFail", function(data) {
		var errorText = {
			"nameLength": "Name too long.",
			"full": "Room is full.",
			"nameMal": "Nice try. Why would anyone join a room named that anyway?",
		};
		$("#login_card").show();
		$("#login_load").hide();
		$("#login_error")
			.show()
			.text(
				"Error: " +
				errorText[data.reason] +
				" (" + data.reason + ")"
			);
	});

	socket.on("disconnect", function(data) {
		errorFatal();
	});
});

function errorFatal() {
	if (($("#page_ban").css("display") == "none") || ($("#page_kick").css("display") == "none")) {
		$("#page_error").show();
	}
}

function setup() {
	$("#chat_send").click(sendInput);

	$("#chat_message").keypress(function(e) {
		if(e.which == 13) sendInput();
	});

	socket.on("room", function(data) {
		$("#room_owner")[data.isOwner ? "show" : "hide"]();
		$("#room_public")[data.isPublic ? "show" : "hide"]();
		$("#room_private")[!data.isPublic ? "show" : "hide"]();
		$(".room_id").text(data.room);
	});

	socket.on("updateAll", function(data) {
		$("#page_login").hide();
		usersPublic = data.usersPublic;
		usersUpdate();
		BonziHandler.bonzisCheck();
	});

	socket.on("update", function(data) {
		window.usersPublic[data.guid] = data.userPublic;
		usersUpdate();
		BonziHandler.bonzisCheck();
	});

	socket.on("talk", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.runSingleEvent([{
			type: "text",
			text: data.text
		}]);
	});

	socket.on("joke", function(data) {
		var b = bonzis[data.guid];
		b.rng = new Math.seedrandom(data.rng);
		b.cancel();
		b.joke();
	});

	socket.on("youtube", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.youtube(data.vid);
	});

	socket.on("fact", function(data) {
		var b = bonzis[data.guid];
		b.rng = new Math.seedrandom(data.rng);
		b.cancel();
		b.fact();
	});

	socket.on("backflip", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.backflip(data.swag);
	});

	socket.on("asshole", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.asshole(data.target);
	});

	socket.on("owo", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.owo(data.target);
	});

	socket.on("triggered", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.runSingleEvent(b.data.event_list_triggered);
	});

	socket.on("linux", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.runSingleEvent(b.data.event_list_linux);
	});

	socket.on("pawn", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.runSingleEvent(b.data.event_list_pawn);
	});

	socket.on("bees", function(data) {
		var b = bonzis[data.guid];
		b.cancel();
		b.runSingleEvent(b.data.event_list_bees);
	});

	socket.on("vaporwave", function(data) {
		$("body").addClass("vaporwave");
	});

	socket.on("unvaporwave", function(data) {
		$("body").removeClass("vaporwave");
	});

	socket.on("leave", function(data) {
		var b = bonzis[data.guid];
		if (typeof b != "undefined") {
			b.exit((function(data) {
				this.deconstruct();
				delete bonzis[data.guid];
				delete usersPublic[data.guid];
				usersUpdate();
			}).bind(b, data));
		}
	});
}

var usersAmt = 0;
var usersKeys = [];

function usersUpdate() {
	usersKeys = Object.keys(usersPublic);
	usersAmt = usersKeys.length;
}

function sendInput() {
	var text = $("#chat_message").val();
	$("#chat_message").val("");
	if (text.length > 0) {
		var youtube = youtubeParser(text);
		if (youtube) {
			socket.emit("command", {
				list: ["youtube", youtube]
			});
			return;
		}

		if (text.substring(1,0) == "/") {
			var list = text.substring(1).split(" ");
			socket.emit("command", {
				list: list
			});
		} else {
			socket.emit("talk", {
				text: text
			});
		}
	}
}