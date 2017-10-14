// var espeak = new Espeak('./js/lib/espeak/espeak.worker.js');
// var auCtx = new (window.AudioContext || window.webkitAudioContext)();

$(document).ready(function() {

window.BonziHandler = new (function() {
	this.framerate = 1.0/15.0;

	this.spriteSheets = {};
	this.prepSprites = function() {
		var spriteColors = [
			"black",
			"blue",
			"brown",
			"green",
			"purple",
			"red",
			"pink",
			"pope"
		];

		for (var i = 0; i < spriteColors.length; i++) {
			var color = spriteColors[i];
			var spriteData = {
				images: ["./img/bonzi/" + color + ".png"],
				frames: BonziData.sprite.frames,
				animations: BonziData.sprite.animations
			};
			this.spriteSheets[color] = new createjs.SpriteSheet(spriteData);
		}
	};
	this.prepSprites();

	this.$canvas = $("#bonzi_canvas");
	
	this.stage = new createjs.StageGL(this.$canvas[0], { "transparent": true });
	this.stage.tickOnUpdate = false;
	
	this.resizeCanvas = function() {
		var width = this.$canvas.width();
		var height = this.$canvas.height();
		this.$canvas.attr({
			"width": this.$canvas.width(),
			"height": this.$canvas.height()
		});
		this.stage.updateViewport(width, height);
		this.needsUpdate = true;
		for (var i = 0; i < usersAmt; i++) {
			var key = usersKeys[i];
			bonzis[key].move();
		}
	};
	
	this.resizeCanvas();

	this.resize = function() {
		setTimeout(this.resizeCanvas.bind(this), 1);
	};

	this.needsUpdate = true;

	this.intervalHelper = setInterval((function() {
		this.needsUpdate = true;
	}).bind(this), 1000);

	this.intervalTick = setInterval((function() {
		for (var i = 0; i < usersAmt; i++) {
			var key = usersKeys[i];
			bonzis[key].update();
		}
		this.stage.tick();
	}).bind(this), this.framerate * 1000);
	
	this.intervalMain = setInterval((function() {
		if (this.needsUpdate) {
			this.stage.update();
			this.needsUpdate = false;
		}
	}).bind(this), 1000.0 / 60.0);


	$(window).resize(this.resize.bind(this));

	this.bonzisCheck = function() {
		for (var i = 0; i < usersAmt; i++) {
			var key = usersKeys[i];
			if (!(key in bonzis)) {
				bonzis[key] = new Bonzi(key, usersPublic[key]);
			} else {
				var b = bonzis[key];
				b.userPublic = usersPublic[key];
				b.updateName();
				var newColor = usersPublic[key].color;
				if (b.color != newColor) {
					b.color = newColor;
					b.updateSprite();
				}
			}
		}
	};

	$("#btn_tile").click(function() {
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var minY = 0;
		var addY = 80;
		var x = 0, y = 0;
		for (var i = 0; i < usersAmt; i++) {
			var key = usersKeys[i];
			bonzis[key].move(x, y);
			
			x += 200;
			if (x + 100 > winWidth) {
				x = 0;
				y += 160;
				if (y + 160 > winHeight) {
					minY += addY;
					addY /= 2;
					y = minY;
				}
			}
		}
	});

	return this;
})();

});

