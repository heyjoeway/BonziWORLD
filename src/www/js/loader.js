var loadQueue = new createjs.LoadQueue();
var loadDone = [];
var loadNeeded = [
	"bonziBlack",
	"bonziBlue",
	"bonziBrown",
	"bonziGreen",
	"bonziPurple",
	"bonziRed",
	"bonziPink",
	"topjej"
];

$(window).load(function() {
	$("#login_card").show();
	$("#login_load").hide();

	loadBonzis();
});

function loadBonzis(callback) {
	loadQueue.loadManifest([
		{id: "bonziBlack", src:"./img/bonzi/black.png"},
		{id: "bonziBlue", src:"./img/bonzi/blue.png"},
		{id: "bonziBrown", src:"./img/bonzi/brown.png"},
		{id: "bonziGreen", src:"./img/bonzi/green.png"},
		{id: "bonziPurple", src:"./img/bonzi/purple.png"},
		{id: "bonziRed", src:"./img/bonzi/red.png"},
		{id: "bonziPink", src:"./img/bonzi/pink.png"},
		{id: "topjej", src:"./img/misc/topjej.png"}
	]);
	loadQueue.on("fileload", function(e) {
		loadDone.push(e.item.id);
	}, this);
	if (callback)
		loadQueue.on("complete", callback, this);
}