var adElement = "#ap_iframe";

$(function() {
	$(window).load(updateAds);
	$(window).resize(updateAds);
	$('body').on('DOMNodeInserted', adElement, updateAds);
	$('body').on('DOMNodeRemoved', adElement, updateAds);
});

function updateAds() {
	var height = $(window).height() -
		$(adElement).height();
	var hideAd = height <= 250;
	if (hideAd) height = $(window).height();
	$(adElement)[hideAd ? "hide" : "show"]();
	$("#content").height(height);
}