StartTest(function(t) {
	t.requireOk(
		[
			'Tutti.touch.input.Keyboard'
		],
		function() {
			Ext.Viewport.setLayout('auto');
			
			t.describe("Keyboards", function(t) {
				var keyboard = Ext.Viewport.add(
					new Tutti.touch.input.Keyboard({
						octaves: 2
					})
				);
				
				var canvas = keyboard.canvasEl;
				
				var shift = function(base) {
					var offset = keyboard.canvasEl.getXY();
					
					return [
						base[0] + offset[0],
						base[1] + offset[1]
					];
				};
				
				var midWhite = (canvas.getHeight() + keyboard.getBlackHeight()) / 2;
				var midBlack = keyboard.getBlackHeight() / 2;
				
				t.it("should handle middle C", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 60;
						}
					);
					
					t.tap(
						shift([
							(canvas.getWidth() + keyboard.getWhiteWidth()) / 2,
							midWhite
						]),
						t.done
					);
				});
				
				t.it("should handle lowest note", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 48;
						}
					);
					
					t.tap(
						shift([
							keyboard.getWhiteWidth() / 2,
							midWhite
						]),
						t.done
					);
				});
				
				t.it("should handle highest note", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 71;
						}
					);
					
					t.tap(
						shift([
							canvas.getWidth() - keyboard.getWhiteWidth() / 2,
							midWhite
						]),
						t.done
					);
				});
				
				t.it("should handle low black note", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 49;
						}
					);
					
					t.tap(
						shift([
							keyboard.getWhiteWidth(),
							midBlack
						]),
						t.done
					);
				});
				
				t.it("should handle mid-low black note", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 58;
						}
					);
					
					t.tap(
						shift([
							keyboard.getWhiteWidth() * 6,
							midBlack
						]),
						t.done
					);
				});
				
				t.it("should handle mid-high black note", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 63;
						}
					);
					
					t.tap(
						shift([
							keyboard.getWhiteWidth() * 9,
							midBlack
						]),
						t.done
					);
				});
				
				t.it("should handle high black note", function(t) {
					keyboard.clearListeners();
					
					t.firesOnce(keyboard, 'keytap');
					t.isFiredWithSignature(
						keyboard,
						'keytap',
						function(key) {
							return key.getPitch() == 70;
						}
					);
					
					t.tap(
						shift([
							keyboard.getWhiteWidth() * 13,
							midBlack
						]),
						t.done
					);
				});
			});
		}
	);
});