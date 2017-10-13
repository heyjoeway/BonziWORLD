var isMobileApp = true;
var isApp = true;
var isDesktop = false;

var setStatusBar;

$(function() {
	setStatusBar = setInterval(function() {
		try {
			StatusBar.backgroundColorByHexString("#280071");
			clearInterval(setStatusBar);
		} catch (e) {}
	}, 500);


	$("#readme").attr("target", "_self");

	$.ajax({
		url: "http://bonziworld.com",	// BonziWORLD, huh? Let's check it out.
		timeout: 7777, 					// GRAND GET!
		type: "GET",					// AJAX?!?!
		cache: false					// GRAND GET
	}).fail(function() { 				// GRAND GET?!?!
		$("#page_error").show();		// WHAT THE SHIT "GRAND GET"
	});									// OHHHH

	$(".app_showcase").append(
		'<a class="app_chrome">' +
			'<img src="./img/app/desktop.png" alt="Open on PC for the best experience." />' +
		'</a>'
	);
});