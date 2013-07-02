StartTest(function(t) {
	t.requireOk(
		[
			'Tutti.touch.Block',
			'Tutti.touch.BlockItem'
		],
		function() {
			Ext.define('Test.BlockItem', {
				extend: 'Tutti.touch.BlockItem',
				
				selectable: true,
				
				config: {
					color: null,
					x: 0,
					y: 0,
					width: 0,
					height: 0
				},
				
				draw: function(context) {
					context.fillStyle = this.getColor();
					context.fillRect(
						this.getX(),
						this.getY(),
						this.getWidth(),
						this.getHeight()
					);
				},
				
				getBoundingBox: function() {
					return {
						x: this.getX(),
						y: this.getY(),
						w: this.getWidth(),
						h: this.getHeight()
					};
				}
			});
		
			var squares = [
				new Test.BlockItem({
					x: 0, y: 0,
					width: 50, height: 50,
					color: 'red'
				}),
				new Test.BlockItem({
					x: 50, y: 0,
					width: 50, height: 50,
					color: 'blue'
				}),
				new Test.BlockItem({
					x: 0, y: 50,
					width: 50, height: 50,
					color: 'yellow'
				}),
				new Test.BlockItem({
					x: 50, y: 50,
					width: 50, height: 50,
					color: 'green'
				})
			];
			
			var expected;
			var count = 0;
			
			Ext.define('Test.Block', {
				extend: 'Tutti.touch.Block',
				
				initItems: function(items) {
					items.addAll(squares);
				},
				
				onTap: function(item) {
					count++;
					t.isStrict(item, expected, 'Correct child detected');
				}
			});
			
			var block = Ext.Viewport.add(
				new Test.Block({
					blockWidth: 100,
					blockHeight: 100,
					
					width: 100,
					height: 100
				})
			);
			
			t.chain(
				// Scale: 100%
				function(next) {
					expected = squares[0];
					t.tap([25, 25], next);
				},
				function(next) {
					expected = squares[1];
					t.tap([75, 25], next);
				},
				function(next) {
					expected = squares[2];
					t.tap([25, 75], next);
				},
				function(next) {
					expected = squares[3];
					t.tap([75, 75], next);
				},
				
				function(next) {
					block.setHeight(200);
					block.setWidth(200);
					next();
				},
				
				// Scale: 200%
				function(next) {
					expected = squares[0];
					t.tap([50, 50], next);
				},
				function(next) {
					expected = squares[1];
					t.tap([150, 50], next);
				},
				function(next) {
					expected = squares[2];
					t.tap([50, 150], next);
				},
				function(next) {
					expected = squares[3];
					t.tap([150, 150], next);
				},
				
				function() {
					t.is(count, 8, 'Correct number of events detected');
					t.done();
				}
			);
		}
	);
});