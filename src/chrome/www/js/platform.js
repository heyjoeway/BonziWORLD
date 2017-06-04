var isChromeApp = true;
var isMobileApp = false;
var isApp = true;
var isDesktop = true;

var urlGPlay = "https://play.google.com/store/apps/details?id=com.jojudge.bonziworld";

$(function() {

	$("#minimize").click(function() {
		chrome.app.window.current().minimize();
	});

	$("#maximize").click(function() {
		var w = chrome.app.window.current();
		var max = w.isMaximized();
		w[max ? "restore" : "maximize"]();
	});

	var w = chrome.app.window.current();

	w.onMaximized.addListener(function() {
		$("#maximize").addClass("restore");
	});

	w.onRestored.addListener(function() {
		$("#maximize").removeClass("restore");
	});

	$("#close").click(function() {
		chrome.app.window.current().close();
	});

	$("a").attr("target", "_blank");

	$("#readme").attr("target", "");

	$("#readme").click(function() {
		chrome.app.window.create('./www/readme.html', {
			'outerBounds': {
				'width': 775,
				'height': 600,
				'minWidth': 350,
				'minHeight': 600
			},
			'frame': {
				'type': 'none'
			}
		});
	});

	$(".app_showcase").append(
		'<a class="app_android" href="' + urlGPlay + '">' +
			'<img src="./img/app/google-play-badge.png" alt="Get it on Google Play." />' +
		'</a>'
	);
});