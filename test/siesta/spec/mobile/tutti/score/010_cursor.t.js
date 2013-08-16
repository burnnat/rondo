StartTest(function(t) {
	t.requireOk(
		[
			'Test.Block',
			'Test.BlockItem',
			'Test.mock.Voice',
			'Test.mock.Staff',
			
			'Tutti.touch.score.Cursor'
		],
		function() {
			Ext.Viewport.setLayout('auto');
			
			t.describe("Cursors", function(t) {
				
				var snapNear = function(t, cursor, position) {
					var expected;
					
					t.isFiredWithSignature(
						cursor,
						'refresh',
						function(data) {
							return !expected || (Ext.Object.getSize(data) == 1 && data[expected] === true);
						}
					);
					
					expected = 'format';
					cursor.snapNear(position);
					
					expected = 'repaint';
					cursor.updateLayout();
					
					expected = null;
				};
				
				t.describe("at large size", function(t) {
					
					var block = Ext.Viewport.add(
						new Test.Block({
							blockWidth: 400,
							blockHeight: 50
						})
					);
					
					var voice = new Test.mock.Voice({
						block: block,
						increment: 100,
						noteWidth: 20
					});
					
					var staff = new Test.mock.Staff({
						block: block,
						startX: 40
					});
					
					var makeCursor = function() {
						return block.items.add(
							new Tutti.touch.score.Cursor({
								active: true,
								voice: voice,
								staff: staff
							})
						);
					};
					
					t.it("should handle starting offsets", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 0);
						t.is(cursor.getPosition(), 70, 'Cursor is halfway between staff start and note head');
					});
					
					t.it("should align between notes", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 110);
						t.is(cursor.getPosition(), 155, 'Cursor is halfway between note end and note head');
						
						snapNear(t, cursor, 210);
						t.is(cursor.getPosition(), 255, 'Cursor is halfway between note end and note head');
					});
					
					t.it("should handle ending notes", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 310);
						t.is(cursor.getPosition(), 320, 'Cursor is one node head past note end');
					});
				});
				
				t.describe("at meduim size", function(t) {
					
					var block = Ext.Viewport.add(
						new Test.Block({
							blockWidth: 100,
							blockHeight: 50
						})
					);
					
					var voice = new Test.mock.Voice({
						block: block,
						increment: 25,
						noteWidth: 12
					});
					
					var staff = new Test.mock.Staff({
						block: block,
						startX: 10
					});
					
					var makeCursor = function() {
						return block.items.add(
							new Tutti.touch.score.Cursor({
								active: true,
								voice: voice,
								staff: staff
							})
						);
					}
					
					t.it("should handle starting offsets", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 0);
						t.isGreater(cursor.getPosition(), 14.5, 'Cursor is mixed between staff start and note start');
						t.isLess(cursor.getPosition(), 17.5, 'Cursor is mixed between staff start and note head');
					});
					
					t.it("should align between notes", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 27);
						t.isGreater(cursor.getPosition(), 37, 'Cursor is mixed between note end and note start');
						t.isLess(cursor.getPosition(), 40, 'Cursor is mixed between note end and note head');
						
						snapNear(t, cursor, 56);
						t.isGreater(cursor.getPosition(), 62, 'Cursor is mixed between note end and note start');
						t.isLess(cursor.getPosition(), 65, 'Cursor is mixed between note end and note head');
					});
					
					t.it("should handle ending notes", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 90);
						t.is(cursor.getPosition(), 87, 'Cursor is one node head past note end');
					});
				});
				
				t.describe("at small size", function(t) {
					
					var block = Ext.Viewport.add(
						new Test.Block({
							blockWidth: 40,
							blockHeight: 50
						})
					);
					
					var voice = new Test.mock.Voice({
						block: block,
						increment: 10,
						noteWidth: 8
					});
					
					var staff = new Test.mock.Staff({
						block: block,
						startX: 2
					});
					
					var makeCursor = function() {
						return block.items.add(
							new Tutti.touch.score.Cursor({
								active: true,
								voice: voice,
								staff: staff
							})
						);
					}
					
					t.it("should handle starting offsets", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 0);
						t.is(cursor.getPosition(), 4, 'Cursor is halfway between staff start and note start');
					});
					
					t.it("should align between notes", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 12);
						t.is(cursor.getPosition(), 15, 'Cursor is halfway between note end and note start');
						
						snapNear(t, cursor, 23);
						t.is(cursor.getPosition(), 25, 'Cursor is halfway between note end and note start');
					});
					
					t.it("should handle ending notes", function(t) {
						var cursor = makeCursor();
						snapNear(t, cursor, 36);
						t.is(cursor.getPosition(), 38, 'Cursor is one node head past note end');
					});
				});
			});
		}
	);
});