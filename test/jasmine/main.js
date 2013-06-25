(function() {
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;
	
	var htmlReporter = new jasmine.HtmlReporter();
	
	jasmineEnv.addReporter(htmlReporter);
	jasmineEnv.addReporter(new jasmine.JSReporter());
	
	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};
	
	Ext.onReady(function() {
		prepareAll();
		jasmineEnv.execute();
	});
})();