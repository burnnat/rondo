Ext.require(['Tutti.KeyManager']);

describe("Tutti.KeyManager", function() {
	
	describe("for neutral key signature", function() {
		var manager;
		
		prep(function() {
			manager = new Tutti.KeyManager({
				key: 'C'
			});
		});
		
		it("should not give accidentals for scale tones", function() {
			expect(manager.selectAccidental('c/4')).toBe(null);
			expect(manager.selectAccidental('d/4')).toBe(null);
			expect(manager.selectAccidental('e/4')).toBe(null);
			expect(manager.selectAccidental('f/4')).toBe(null);
			expect(manager.selectAccidental('g/4')).toBe(null);
			expect(manager.selectAccidental('a/4')).toBe(null);
			expect(manager.selectAccidental('b/4')).toBe(null);
		});
		
		it("should give accidentals for non-scale tones", function() {
			expect(manager.selectAccidental('c#/4')).toBe('#');
			expect(manager.selectAccidental('db/4')).toBe('b');
			expect(manager.selectAccidental('gbb/4')).toBe('bb');
			expect(manager.selectAccidental('a##/4')).toBe('##');
		});
		
		it("should not give accidentals for repeated pitches", function() {
			expect(manager.selectAccidental('c#/4')).toBe(null);
			expect(manager.selectAccidental('db/4')).toBe(null);
			expect(manager.selectAccidental('gbb/4')).toBe(null);
			expect(manager.selectAccidental('a##/4')).toBe(null);
		});
		
		it("should repeat accidentals in additional octaves", function() {
			expect(manager.selectAccidental('c#/0')).toBe('#');
			expect(manager.selectAccidental('db/6')).toBe('b');
			expect(manager.selectAccidental('gbb/5')).toBe('bb');
			expect(manager.selectAccidental('a##/2')).toBe('##');
		});
		
		it("should confirm naturals in additional octaves", function() {
			expect(manager.selectAccidental('c/1')).toBe('n');
			expect(manager.selectAccidental('d/5')).toBe('n');
			expect(manager.selectAccidental('g/3')).toBe('n');
			expect(manager.selectAccidental('a/6')).toBe('n');
		});
		
		it("should cancel accidentals when needed", function() {
			expect(manager.selectAccidental('c/4')).toBe('n');
			expect(manager.selectAccidental('d##/4')).toBe('##');
			expect(manager.selectAccidental('gb/4')).toBe('b');
			expect(manager.selectAccidental('abb/4')).toBe('bb');
		});
	});
});