Ext.require(['Tutti.Theory']);

describe("Tutti.Theory", function() {
	
	it("should provide a seven-note scale", function() {
		expect(Tutti.Theory.NUM_SCALE).toEqual(7);
	});
	
	it("should provide the circle of fifths", function() {
		expect(Tutti.Theory.FIFTHS).toEqual([
			'fbb', 'cbb', 'gbb', 'dbb', 'abb', 'ebb', 'bbb',
			'fb',  'cb',  'gb',  'db',  'ab',  'eb',  'bb',
			'f',   'c',   'g',   'd',   'a',   'e',   'b',
			'f#',  'c#',  'g#',  'd#',  'a#',  'e#',  'b#',
			'f##', 'c##', 'g##', 'd##', 'a##', 'e##', 'b##'
		]);
	});
	
	it("should provide scale accidentals", function() {
		expect(Tutti.Theory.getScaleToneAccidentals('C')).toEqual({
			a: 'n', b: 'n', c: 'n', d: 'n', e: 'n', f: 'n', g: 'n'
		});
		expect(Tutti.Theory.getScaleToneAccidentals('am')).toEqual({
			a: 'n', b: 'n', c: 'n', d: 'n', e: 'n', f: 'n', g: 'n'
		});
		
		expect(Tutti.Theory.getScaleToneAccidentals('Db')).toEqual({
			a: 'b', b: 'b', c: 'n', d: 'b', e: 'b', f: 'n', g: 'b'
		});
		expect(Tutti.Theory.getScaleToneAccidentals('fm')).toEqual({
			a: 'b', b: 'b', c: 'n', d: 'b', e: 'b', f: 'n', g: 'n'
		});
		
		expect(Tutti.Theory.getScaleToneAccidentals('E')).toEqual({
			a: 'n', b: 'n', c: '#', d: '#', e: 'n', f: '#', g: '#'
		});
		expect(Tutti.Theory.getScaleToneAccidentals('f#m')).toEqual({
			a: 'n', b: 'n', c: '#', d: 'n', e: 'n', f: '#', g: '#'
		});
	});
	
	it("should provide middle line pitches", function() {
		expect(Tutti.Theory.getMiddleLine('treble')).toEqual('b/4');
		expect(Tutti.Theory.getMiddleLine('bass')).toEqual('d/3');
		expect(Tutti.Theory.getMiddleLine('alto')).toEqual('c/4');
		expect(Tutti.Theory.getMiddleLine('tenor')).toEqual('a/3');
	});
	
	describe("when normalizing major pitches", function() {
		it("should give a perfect unison" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(11, 'Cb')).toEqual('cb');
			expect(Tutti.Theory.getCanonicalNoteName(3, 'Eb')).toEqual('eb');
			expect(Tutti.Theory.getCanonicalNoteName(0, 'C')).toEqual('c');
			expect(Tutti.Theory.getCanonicalNoteName(9, 'A')).toEqual('a');
			expect(Tutti.Theory.getCanonicalNoteName(1, 'C#')).toEqual('c#');
		});
		
		it("should give an augmented second" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(0, 'Cb')).toEqual('c');
			expect(Tutti.Theory.getCanonicalNoteName(4, 'Eb')).toEqual('e');
			expect(Tutti.Theory.getCanonicalNoteName(1, 'C')).toEqual('c#');
			expect(Tutti.Theory.getCanonicalNoteName(10, 'A')).toEqual('a#');
			expect(Tutti.Theory.getCanonicalNoteName(2, 'C#')).toEqual('c##');
		});
		
		it("should give an augmented fourth" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(5, 'Cb')).toEqual('f');
			expect(Tutti.Theory.getCanonicalNoteName(9, 'Eb')).toEqual('a');
			expect(Tutti.Theory.getCanonicalNoteName(6, 'C')).toEqual('f#');
			expect(Tutti.Theory.getCanonicalNoteName(3, 'A')).toEqual('d#');
			expect(Tutti.Theory.getCanonicalNoteName(7, 'C#')).toEqual('f##');
		});
		
		it("should give a minor seventh" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(9, 'Cb')).toEqual('bbb');
			expect(Tutti.Theory.getCanonicalNoteName(1, 'Eb')).toEqual('db');
			expect(Tutti.Theory.getCanonicalNoteName(10, 'C')).toEqual('bb');
			expect(Tutti.Theory.getCanonicalNoteName(7, 'A')).toEqual('g');
			expect(Tutti.Theory.getCanonicalNoteName(11, 'C#')).toEqual('b');
		});
	});
	
	describe("when normalizing minor pitches", function() {
		it("should give a perfect unison" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(8, 'Abm')).toEqual('ab');
			expect(Tutti.Theory.getCanonicalNoteName(0, 'Cm')).toEqual('c');
			expect(Tutti.Theory.getCanonicalNoteName(9, 'Am')).toEqual('a');
			expect(Tutti.Theory.getCanonicalNoteName(6, 'F#m')).toEqual('f#');
			expect(Tutti.Theory.getCanonicalNoteName(10, 'A#m')).toEqual('a#');
		});
		
		it("should give a major third" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(0, 'Abm')).toEqual('c');
			expect(Tutti.Theory.getCanonicalNoteName(4, 'Cm')).toEqual('e');
			expect(Tutti.Theory.getCanonicalNoteName(1, 'Am')).toEqual('c#');
			expect(Tutti.Theory.getCanonicalNoteName(10, 'F#m')).toEqual('a#');
			expect(Tutti.Theory.getCanonicalNoteName(2, 'A#m')).toEqual('c##');
		});
		
		it("should give a major sixth" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(5, 'Abm')).toEqual('f');
			expect(Tutti.Theory.getCanonicalNoteName(9, 'Cm')).toEqual('a');
			expect(Tutti.Theory.getCanonicalNoteName(6, 'Am')).toEqual('f#');
			expect(Tutti.Theory.getCanonicalNoteName(3, 'F#m')).toEqual('d#');
			expect(Tutti.Theory.getCanonicalNoteName(7, 'A#m')).toEqual('f##');
		});
		
		it("should give a major seventh" , function() {
			expect(Tutti.Theory.getCanonicalNoteName(7, 'Abm')).toEqual('g');
			expect(Tutti.Theory.getCanonicalNoteName(11, 'Cm')).toEqual('b');
			expect(Tutti.Theory.getCanonicalNoteName(8, 'Am')).toEqual('g#');
			expect(Tutti.Theory.getCanonicalNoteName(5, 'F#m')).toEqual('e#');
			expect(Tutti.Theory.getCanonicalNoteName(9, 'A#m')).toEqual('g##');
		});
	});
	
	describe("when converting pitches to notes", function() {
		it("should give correct octaves" , function() {
			expect(Tutti.Theory.getNoteFromPitch(12, 'C')).toEqual('c/0');
			expect(Tutti.Theory.getNoteFromPitch(24, 'C')).toEqual('c/1');
			expect(Tutti.Theory.getNoteFromPitch(36, 'C')).toEqual('c/2');
			expect(Tutti.Theory.getNoteFromPitch(48, 'C')).toEqual('c/3');
			expect(Tutti.Theory.getNoteFromPitch(60, 'C')).toEqual('c/4');
			expect(Tutti.Theory.getNoteFromPitch(72, 'C')).toEqual('c/5');
			expect(Tutti.Theory.getNoteFromPitch(84, 'C')).toEqual('c/6');
			expect(Tutti.Theory.getNoteFromPitch(96, 'C')).toEqual('c/7');
			expect(Tutti.Theory.getNoteFromPitch(108, 'C')).toEqual('c/8');
		});
		
		it("should start octaves at 'C'" , function() {
			expect(Tutti.Theory.getNoteFromPitch(21, 'C')).toEqual('a/0');
			expect(Tutti.Theory.getNoteFromPitch(33, 'C')).toEqual('a/1');
			expect(Tutti.Theory.getNoteFromPitch(45, 'C')).toEqual('a/2');
			expect(Tutti.Theory.getNoteFromPitch(57, 'C')).toEqual('a/3');
			expect(Tutti.Theory.getNoteFromPitch(69, 'C')).toEqual('a/4');
			expect(Tutti.Theory.getNoteFromPitch(81, 'C')).toEqual('a/5');
			expect(Tutti.Theory.getNoteFromPitch(93, 'C')).toEqual('a/6');
		});
	});
	
	describe("when formatting notes", function() {
		var sharp = '\u266F';
		var flat = '\u266D';
		
		var format = function(note) {
			return Tutti.Theory.formatNote(note);
		};
		
		var formatRaw = function(note) {
			return Ext.String.htmlDecode(format(note));
		};
		
		it("should accept pre-parsed arguments", function() {
			expect(format('a##')).toEqual(format({ root: 'a', accidental: '##' }));
			expect(format('d#')).toEqual(format({ root: 'd', accidental: '#' }));
			expect(format('g')).toEqual(format({ root: 'g', accidental: '' }));
			expect(format('cb')).toEqual(format({ root: 'c', accidental: 'b' }));
			expect(format('fbb')).toEqual(format({ root: 'f', accidental: 'bb' }));
		});
		
		it("should return uppercase", function() {
			expect(formatRaw('b##')).toEqual('B' + sharp + sharp);
			expect(formatRaw('B##')).toEqual('B' + sharp + sharp);
			expect(formatRaw('e#')).toEqual('E' + sharp);
			expect(formatRaw('E#')).toEqual('E' + sharp);
			expect(formatRaw('a')).toEqual('A');
			expect(formatRaw('A')).toEqual('A');
			expect(formatRaw('db')).toEqual('D' + flat);
			expect(formatRaw('Db')).toEqual('D' + flat);
			expect(formatRaw('gbb')).toEqual('G' + flat + flat);
			expect(formatRaw('Gbb')).toEqual('G' + flat + flat);
		});
	});
	
	describe("when formatting keys", function() {
		var sharp = '\u266F';
		var flat = '\u266D';
		
		var format = function(key) {
			return Ext.String.htmlDecode(Tutti.Theory.formatKey(key));
		};
		
		it("should default to major", function() {
			expect(format('F#')).toEqual('F' + sharp + ' Major');
			expect(format('d')).toEqual('D Major');
			expect(format('G')).toEqual('G Major');
			expect(format('bb')).toEqual('B' + flat + ' Major');
		});
		
		it("should recognize major mode", function() {
			expect(format('g#M')).toEqual('G' + sharp + ' Major');
			expect(format('CM')).toEqual('C Major');
			expect(format('bbM')).toEqual('B' + flat + ' Major');
		});
		
		it("should recognize minor modes", function() {
			expect(format('F#mel')).toEqual('F' + sharp + ' Minor');
			expect(format('dharm')).toEqual('D Minor');
			expect(format('Bbm')).toEqual('B' + flat + ' Minor');
		});
	});
	
	describe("when converting ticks to durations", function() {
		var durations = function() {
			var total = 0;
			
			Ext.Array.each(
				arguments,
				function(duration) {
					total += Vex.Flow.durationToTicks(duration);
				}
			);
			
			return Tutti.Theory.ticksToDurations(
				new Vex.Flow.Fraction(total, 1)
			);
		};
		
		it("should handle single notes", function() {
			expect(durations('w')).toEqual(['w']);
			expect(durations('h')).toEqual(['h']);
			expect(durations('q')).toEqual(['q']);
			expect(durations('8')).toEqual(['8']);
			expect(durations('16')).toEqual(['16']);
		});
		
		it("should handle dotted notes", function() {
			expect(durations('w', 'h')).toEqual(['wd']);
			expect(durations('h', 'q')).toEqual(['hd']);
			expect(durations('q', '8')).toEqual(['qd']);
			expect(durations('8', '16')).toEqual(['8d']);
			expect(durations('16', '32')).toEqual(['16d']);
		});
		
		it("should handle tied notes", function() {
			expect(durations('w', 'q', '8')).toEqual(['w', 'qd']);
			expect(durations('w', '16')).toEqual(['w', '16']);
			expect(durations('h', 'q', '8', '16')).toEqual(['h', 'q', '8d']);
			expect(durations('h', 'q', '8')).toEqual(['h', 'qd']);
			expect(durations('h', 'q', '16')).toEqual(['h', 'q', '16']);
			expect(durations('h', '8')).toEqual(['h', '8']);
			expect(durations('h', '16')).toEqual(['h', '16']);
			expect(durations('q', '8', '16')).toEqual(['q', '8d']);
			expect(durations('q', '16')).toEqual(['q', '16']);
		});
	});
});