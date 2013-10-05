StartTest(function(t) {
	t.requireOk(
		[
			'Test.Block',
			'Test.BlockItem'
		],
		function() {
			Ext.Viewport.setLayout('auto');
			
			var makeBlock = function(t, scale) {
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
				
				return Ext.Viewport.add(
					new Test.Block({
						test: t,
						items: squares,
						
						blockWidth: 100,
						blockHeight: 100,
						
						width: 100 * scale,
						height: 100 * scale
					})
				);
			};
			
			t.describe("Unscaled blocks", function(t) {
				// Scale: 100%
				var scale = 1;
				var block = makeBlock(t, scale);
				
				t.it("should handle taps", function(t) {
					t.chain(
						function(next) {
							block.expect(0);
							t.tap(block.shift([25, 25]), next);
						},
						function(next) {
							block.expect(1);
							t.tap(block.shift([75, 25]), next);
						},
						function(next) {
							block.expect(2);
							t.tap(block.shift([25, 75]), next);
						},
						function(next) {
							block.expect(3);
							t.tap(block.shift([75, 75]), next);
						},
						function() {
							t.is(block.getTapCount(), 4, 'Correct number of events detected');
							t.done();
						}
					);
				});
				
				t.it("should report correct positions", function(t) {
					block.items.each(function(item) {
						if (!(item instanceof Test.BlockItem)) {
							return;
						}
						
						var root = block.renderElement.getPageBox();
						var box = item.getPageBox();
						
						t.is(box.left, root.left + item.getX() * scale, 'Correct X position');
						t.is(box.top, root.top + item.getY() * scale, 'Correct Y position');
						t.is(box.width, item.getWidth() * scale, 'Correct width');
						t.is(box.height, item.getHeight() * scale, 'Correct height');
						t.is(box.right, box.left + box.width, 'Correct right bound');
						t.is(box.bottom, box.top + box.height, 'Correct bottom bound');
					});
					
					t.done();
				});
			});
			
			t.describe("Scaled blocks", function(t) {
				t.describe("at half size", function(t) {
					// Scale: 50%
					var scale = 0.5;
					var block = makeBlock(t, scale);
					
					t.it("should handle taps", function(t) {
						t.chain(
							function(next) {
								block.expect(0);
								t.tap(block.shift([12, 12]), next);
							},
							function(next) {
								block.expect(1);
								t.tap(block.shift([37, 12]), next);
							},
							function(next) {
								block.expect(2);
								t.tap(block.shift([12, 37]), next);
							},
							function(next) {
								block.expect(3);
								t.tap(block.shift([37, 37]), next);
							},
							function() {
								t.is(block.getTapCount(), 4, 'Correct number of events detected');
								t.done();
							}
						);
					});
					
					t.it("should report correct positions", function(t) {
						block.items.each(function(item) {
							if (!(item instanceof Test.BlockItem)) {
								return;
							}
							
							var root = block.renderElement.getPageBox();
							var box = item.getPageBox();
							
							t.is(box.left, root.left + item.getX() * scale, 'Correct X position');
							t.is(box.top, root.top + item.getY() * scale, 'Correct Y position');
							t.is(box.width, item.getWidth() * scale, 'Correct width');
							t.is(box.height, item.getHeight() * scale, 'Correct height');
							t.is(box.right, box.left + box.width, 'Correct right bound');
							t.is(box.bottom, box.top + box.height, 'Correct bottom bound');
						});
						
						t.done();
					});
				});
				
				t.describe("at double size", function(t) {
					// Scale: 200%
					var scale = 2;
					var block = makeBlock(t, scale);
					
					t.it("should handle taps", function(t) {
						t.chain(
							function(next) {
								block.expect(0);
								t.tap(block.shift([50, 50]), next);
							},
							function(next) {
								block.expect(1);
								t.tap(block.shift([150, 50]), next);
							},
							function(next) {
								block.expect(2);
								t.tap(block.shift([50, 150]), next);
							},
							function(next) {
								block.expect(3);
								t.tap(block.shift([150, 150]), next);
							},
							function() {
								t.is(block.getTapCount(), 4, 'Correct number of events detected');
								t.done();
							}
						);
					});
					
					t.it("should report correct positions", function(t) {
						block.items.each(function(item) {
							if (!(item instanceof Test.BlockItem)) {
								return;
							}
							
							var root = block.renderElement.getPageBox();
							var box = item.getPageBox();
							
							t.is(box.left, root.left + item.getX() * scale, 'Correct X position');
							t.is(box.top, root.top + item.getY() * scale, 'Correct Y position');
							t.is(box.width, item.getWidth() * scale, 'Correct width');
							t.is(box.height, item.getHeight() * scale, 'Correct height');
							t.is(box.right, box.left + box.width, 'Correct right bound');
							t.is(box.bottom, box.top + box.height, 'Correct bottom bound');
						});
						
						t.done();
					});
				});
			});
		}
	);
});