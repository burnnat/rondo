StartTest(function(t) {
	t.requireOk(
		[
			'Ext.data.Store',
			
			'Test.model.Measure',
			'Test.mock.Barline',
			'Test.mock.Connector',
			
			'Tutti.touch.score.Measure'
		],
		function() {
			Ext.Viewport.setLayout('auto');
			
			var addScore = function(scale) {
				var total = 2;
				var measures = [];
				
				var height = 50;
				
				for (var i = 0; i < total; i++) {
					measures.push(
						new Tutti.touch.score.Measure({
							data: new Test.model.Measure(),
							parts: new Ext.data.Store(),
							
							blockWidth: 200,
							blockHeight: height,
							
							height: height * scale,
							
							systemStart: i == 0,
							systemEnd: i == total - 1
						})
					);
				}
				
				Ext.Array.forEach(
					measures,
					function(measure) {
						measure.items.add(new Test.mock.Connector());
						
						if (measure.getSystemEnd()) {
							measure.items.add(new Test.mock.Barline());
						}
					}
				);
				
				Ext.Viewport.add(
					new Ext.Container({
						layout: 'hbox',
						items: measures
					})
				);
				
				Ext.Array.forEach(
					measures,
					function(measure) {
						measure.refresh({ repaint: true });
					}
				);
				
				return measures;
			};
			
			var pointFor = function(measure, scale, end) {
				var xy = measure.canvasEl.getXY();
				
				if (end) {
					xy[0] += measure.getBlockWidth() * scale - 5;
				}
				else {
					xy[0] += 5;
				}
				
				xy[1] += (measure.getBlockHeight() / 2) * scale;
				
				return xy;
			};
			
			var checkResize = function(t, options) {
				var target = options.target;
				var source = options.source || target;
				var active = options.active || source;
				var end = options.endBarline;
				var scale = options.scale || 1;
				var expected = !options.noEffect;
				
				var activeItem = active.items.findBy(
					function(item) {
						return (end && active === source) ? item.isBarline : item.isConnector;
					}
				);
				var width = target.getBlockWidth();
				var delta = width / 2;
				
				var chain = [
					function(next) {
						t.moveMouseTo(pointFor(source, scale, end), next);
					},
					function(next) {
						t.mouseDown();
						
						if (expected) {
							t.is(activeItem.getActive(), false, 'Barline is inactive before move');
						}
						
						t.moveMouseBy([-1 * delta * scale, 0], next);
					},
					function(next) {
						if (expected) {
							t.is(activeItem.getActive(), true, 'Barline is active after move');
						}
						
						t.mouseUp();
						next();
					}
				];
				
				if (expected) {
					Ext.Array.insert(
						chain,
						chain.length,
						[
							function(next) {
								t.is(target.getBlockWidth(), width - delta, 'Measure shrank correct amount');
								t.mouseDown();
								
								t.is(activeItem.getActive(), false, 'Barline is inactive before move');
								t.moveMouseBy([delta * scale, 0], next);
							},
							function(next) {
								t.is(activeItem.getActive(), true, 'Barline is active after move');
								t.mouseUp();
								
								t.is(target.getBlockWidth(), width, 'Measure grew correct amount');
							}
						]
					);
				}
				else {
					chain.push(
						function() {
							t.is(target.getBlockWidth(), width, 'Measure width did not change');
							t.is(activeItem.getActive(), false, 'Barline is inactive after mouseup');
						}
					);
				}
				
				t.chain.apply(t, chain);
			}
			
			var checkUndersize = function(t, options) {
				var target = options.target;
				var scale = options.scale || 1;
				
				t.chain(
					function(next) {
						t.dragBy(
							pointFor(target, scale, true),
							[-2 * target.getBlockWidth() * scale, 0],
							next
						);
					},
					function() {
						t.is(target.getBlockWidth(), 0, 'Measure width has a minimum of zero');
					}
				);
			}
			
			t.describe("Measures", function(t) {
				t.describe("at natural size", function(t) {
					var measures = addScore(1);
					
					t.it("should ignore starting barline", function(t) {
						checkResize(t, {
							target: measures[0],
							noEffect: true
						});
					});
					
					t.it("should resize self", function(t) {
						checkResize(t, {
							target: measures[0],
							active: measures[1],
							endBarline: true
						});
					});
					
					t.it("should resize previous", function(t) {
						checkResize(t, {
							source: measures[1],
							target: measures[0]
						});
					});
					
					t.it("should resize ending barline", function(t) {
						checkResize(t, {
							target: measures[1],
							endBarline: true
						});
					});
					
					t.it("should not shrink beyond zero", function(t) {
						checkUndersize(t, {
							target: measures[0]
						});
					});
				});
				
				t.describe("at half size", function(t) {
					var scale = 0.5;
					var measures = addScore(scale);
					
					t.it("should ignore starting barline", function(t) {
						checkResize(t, {
							target: measures[0],
							scale: scale,
							noEffect: true
						});
					});
					
					t.it("should resize self", function(t) {
						checkResize(t, {
							target: measures[0],
							active: measures[1],
							scale: scale,
							endBarline: true
						});
					});
					
					t.it("should resize previous", function(t) {
						checkResize(t, {
							source: measures[1],
							target: measures[0],
							scale: scale
						});
					});
					
					t.it("should resize ending barline", function(t) {
						checkResize(t, {
							target: measures[1],
							scale: scale,
							endBarline: true
						});
					});
					
					t.it("should not shrink beyond zero", function(t) {
						checkUndersize(t, {
							target: measures[0],
							scale: scale
						});
					});
				});
				
				t.describe("at double size", function(t) {
					var scale = 2;
					var measures = addScore(scale);
					
					t.it("should ignore starting barline", function(t) {
						checkResize(t, {
							target: measures[0],
							scale: scale,
							noEffect: true
						});
					});
					
					t.it("should resize self", function(t) {
						checkResize(t, {
							target: measures[0],
							active: measures[1],
							scale: scale,
							endBarline: true
						});
					});
					
					t.it("should resize previous", function(t) {
						checkResize(t, {
							source: measures[1],
							target: measures[0],
							scale: scale
						});
					});
					
					t.it("should resize ending barline", function(t) {
						checkResize(t, {
							target: measures[1],
							scale: scale,
							endBarline: true
						});
					});
					
					t.it("should not shrink beyond zero", function(t) {
						checkUndersize(t, {
							target: measures[0],
							scale: scale
						});
					});
				});
			});
		}
	);
});