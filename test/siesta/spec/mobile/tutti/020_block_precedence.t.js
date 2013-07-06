StartTest(function(t) {
	t.requireOk(
		[
			'Test.Block',
			'Test.BlockItem'
		],
		function() {
			Ext.Viewport.setLayout('auto');
			
			var makeBlock = function(t) {
				var squares = [
					new Test.BlockItem({
						x: 10, y: 20.4,
						precedence: -10,
						width: 60, height: 60.2,
						color: 'red'
					}),
					new Test.BlockItem({
						x: 20, y: 39.7,
						precedence: 10,
						width: 60, height: 19.9,
						color: 'blue'
					}),
					new Test.BlockItem({
						x: 30, y: 40.2,
						precedence: 0,
						width: 60, height: 40,
						color: 'yellow'
					})
				];
				
				return Ext.Viewport.add(
					new Test.Block({
						test: t,
						items: squares,
						
						blockWidth: 100,
						blockHeight: 100,
						
						width: 100,
						height: 100
					})
				);
			};
			
			t.describe("Block components", function(t) {
				t.it("should handle empty spaces", function(t) {
					var block = makeBlock(t);
					
					t.chain(
						function(next) {
							block.expect(null);
							t.tap(block.shift([50, 10]), next);
						},
						function(next) {
							block.expect(null);
							t.tap(block.shift([50, 90]), next);
						},
						function() {
							t.is(block.getTapCount(), 2, 'Correct number of events detected');
							t.done();
						}
					);
				});
				
				t.it("should handle item precedence", function(t) {
					var block = makeBlock(t);
					
					t.chain(
						function(next) {
							block.expect(0);
							t.tap(block.shift([50, 30]), next);
						},
						function(next) {
							block.expect(1);
							t.tap(block.shift([50, 50]), next);
						},
						function(next) {
							block.expect(2);
							t.tap(block.shift([50, 70]), next);
						},
						function() {
							t.is(block.getTapCount(), 3, 'Correct number of events detected');
							t.done();
						}
					);
				});
				
				t.it("should handle item boundaries", function(t) {
					var block = makeBlock(t);
					
					t.chain(
						function(next) {
							block.expect(null);
							t.tap(block.shift([50, 19]), next);
						},
						function(next) {
							block.expect(0);
							t.tap(block.shift([50, 20]), next);
						},
						function(next) {
							block.expect(0);
							t.tap(block.shift([50, 39]), next);
						},
						function(next) {
							block.expect(1);
							t.tap(block.shift([50, 40]), next);
						},
						function(next) {
							block.expect(1);
							t.tap(block.shift([50, 59]), next);
						},
						function(next) {
							block.expect(2);
							t.tap(block.shift([50, 60]), next);
						},
						function(next) {
							block.expect(2);
							t.tap(block.shift([50, 79]), next);
						},
						function(next) {
							block.expect(null);
							t.tap(block.shift([50, 80]), next);
						},
						function() {
							t.is(block.getTapCount(), 8, 'Correct number of events detected');
							t.done();
						}
					);
				});
			});
		}
	);
});