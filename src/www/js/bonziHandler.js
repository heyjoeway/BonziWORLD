var espeak = new Espeak('./js/lib/espeak/espeak.worker.js');
var auCtx = new (window.AudioContext || window.webkitAudioContext)();

// http://stackoverflow.com/a/22953053/2605226
function webgl_support() { 
   try{
    var canvas = document.createElement('canvas'); 
    return !! window.WebGLRenderingContext && ( 
         canvas.getContext('webgl') || canvas.getContext('experimental-webgl') );
   }catch( e ) { return false; } 
 };

$(document).ready(function() {

window.BonziHandler = new (function() {
	this.framerate = 1.0/15.0;

	// MAKE SURE oneCanvas IS SET TO isMobileApp BEFORE CREATING DIST BUILD

	this.oneCanvas = isMobileApp;
	this.selCanvas = "#bonzi_canvas";

	this.spriteSheets = {};
	this.prepSprites = function() {
		var spriteColors = [
			"black",
			"blue",
			"brown",
			"green",
			"purple",
			"red",
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


	if (this.oneCanvas) {
		
		this.resizeCanvas = function() {
			$(this.selCanvas).attr({
				"width": $(this.selCanvas).width(),
				"height": $(this.selCanvas).height()
			});
			if (typeof this.stage != "undefined") {
				this.stage.removeAllChildren();
				delete this.stage;
			}
			this.stage = new createjs.SpriteStage($(this.selCanvas)[0]);
			this.stage.tickOnUpdate = false;
			this.needsUpdate = true;
			for (var i = 0; i < usersAmt; i++) {
				var key = usersKeys[i];
				bonzis[key].updateSprite();
				bonzis[key].move();
			}
		};
		this.resizeCanvas();
		this.resize = function() {
			setTimeout(this.resizeCanvas.bind(this), 1);
		};

		this.needsUpdate = true;

		this.intervalHelper = setInterval(function() {
			BonziHandler.needsUpdate = true;
		}, 1000);

		this.stageFramerate = 1.0/60.0;

		this.intervalTick = setInterval(function() {
			for (var i = 0; i < usersAmt; i++) {
				var key = usersKeys[i];
				bonzis[key].update();
			}
			BonziHandler.stage.tick();
		}, this.framerate * 1000);

		this.intervalMain = setInterval(function() {
			if (BonziHandler.needsUpdate) {
				BonziHandler.stage.update();
				BonziHandler.needsUpdate = false;
			}
		}, this.stageFramerate * 1000);
	} else {
		$(this.selCanvas).remove();

		this.resize = function() {
			setTimeout((function() {			
				for (var i = 0; i < usersAmt; i++) {
					var key = usersKeys[i];
					bonzis[key].move();
				}
			}).bind(this), 1);
		};

		this.intervalHelper = setInterval(function() {
			for (var i = 0; i < usersAmt; i++) {
				var key = usersKeys[i];
				bonzis[key].needsUpdate = true;
			}
		}, 1000);

		this.intervalMain = setInterval(function() {
			for (var i = 0; i < usersAmt; i++) {
				var key = usersKeys[i];
				bonzis[key].update();
			}
		}, this.framerate * 1000);
	}

	$(window).resize(function() {
		BonziHandler.resize();
	});

	if (isMobileApp)
		this.intervalFixAuCtx = setInterval((function() {
			BonziHandler.fixAuCtx();
		}), 1000);

	// ========================================================================
	// SPEECH
	// ========================================================================

	this.speakList = {};

	this.speak = function(say, speed, pitch, callback) {
		var obj = {
			samples_queue: []
		};

		espeak.setVoice.apply(espeak, ["default", "en"]);
		espeak.set_rate(speed || 175);
		espeak.set_pitch(pitch || 50);
		

		obj.pusher = new PushAudioNode(auCtx, function() {}, callback, callback);
		obj.pusher.connect(auCtx.destination);

		espeak.synth(say, function(samples, events) {
			if (!samples) {
				obj.pusher.close();
				return;
			}
			obj.pusher.push(new Float32Array(samples));
		});

		var id = s4()+s4();
		BonziHandler.speakList[id] = obj;
		return id;
	};

	this.stop = function(id) {
		if (typeof this.speakList[id] != "undefined") {
			var pusher = this.speakList[id].pusher;
			if (pusher) {
				pusher.disconnect();
				pusher = null;
			}
			rtimeOut((function(id) {
				delete this.speakList[id];
			}).bind(this, id), 1000);
		}
	};

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

	this.checkAuCtx = function() {
		var keys = Object.keys(this.speakList);
		var allInitialized = true;
		for (var i = 0; i < keys.length; i++) {
			allInitialized =
				allInitialized &&
				this.speakList[keys[i]].pusher.initialized;
			if (!allInitialized) return false;
		}
		return allInitialized; // true = good, false = glitched or none available
	};

	this.fixAuCtx = function() {
		if (!BonziHandler.checkAuCtx()) {
			setTimeout(this.refreshAuCtx, 1000);
		}
	};

	this.refreshAuCtx = function() {
		if (!BonziHandler.checkAuCtx()) {
			auCtx.close();
			auCtx = new (window.AudioContext || window.webkitAudioContext)();
			var bonzisKeys = Object.keys(bonzis);
			for (var i = 0; i < bonzisKeys.length; i++) {
				var key = bonzisKeys[i];
				var b = bonzis[key];
				if (b.event.cur().type != "idle")
					b.retry();
			}
		}
	};

	return this;
})();

});

