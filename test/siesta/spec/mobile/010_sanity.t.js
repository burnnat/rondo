StartTest(function(t) {
	t.ok(Ext, 'Sencha Touch is here');
	
	t.chain(
		function(next) {
			t.requireOk('Tutti.Theory', next);
		},
		function(next) {
			t.ok(Tutti, 'Tutti is here');
			t.requireOk('Rondo.view.Sketches', next);
		},
		function() {
			t.ok(Rondo, 'Rondo is here');
			t.done();
		}
	);
});