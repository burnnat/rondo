(function() {
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;
	
	var htmlReporter = new jasmine.HtmlReporter();
	
	jasmineEnv.addReporter(htmlReporter);
	jasmineEnv.addReporter(new jasmine.JSReporter());
	
	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};
	
	var launch = function() {
		prepareAll();
		jasmineEnv.execute();
	};
	
	if (dynamic) {
		Ext.onReady(launch);
	}
	else {
		var currentWindowOnload = window.onload;
		
		window.onload = function() {
			if (currentWindowOnload) {
				currentWindowOnload();
			}
			launch();
		};
	}
})();