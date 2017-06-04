chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('./www/index.html', {
		'outerBounds': {
			'width': 775,
			'height': 600,
			'minWidth': 400,
			'minHeight': 400
		},
		'frame': {
			'type': 'none'
		}
	});
});