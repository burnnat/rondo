describe("Tutti.Theory", function() {
	
	it("should provide a seven-note scale", function() {
		expect(Tutti.Theory.NUM_SCALE).toEqual(7);
	}),
	
	it("should provide the circle of fifths", function() {
		expect(Tutti.Theory.FIFTHS).toEqual([
			'fbb', 'cbb', 'gbb', 'dbb', 'abb', 'ebb', 'bbb',
			'fb',  'cb',  'gb',  'db',  'ab',  'eb',  'bb',
			'f',   'c',   'g',   'd',   'a',   'e',   'b',
			'f#',  'c#',  'g#',  'd#',  'a#',  'e#',  'b#',
			'f##', 'c##', 'g##', 'd##', 'a##', 'e##', 'b##'
		]);
	});
	
});