Ext.require(['Tutti.Util']);

describe("Tutti.Util", function() {
	
	describe("when finding insertion points", function() {
		var custom;
		
		beforeEach(function() {
			this.addMatchers({
				toBeOneOf: function() {
					var actual = this.actual;
					var match = false;
					var string = "";
					
					for (var i = 0; i < arguments.length; i++) {
						var item = arguments[i];
						
						if (actual === item) {
							match = true;
						}
						
						if (string) {
							string = string + ", " + item;
						}
						else {
							string = item;
						}
					}
					
					this.message = function() {
						return "Expected " + actual + (this.isNot ? " not" : "") + " to be one of: " + string;
					}
					
					return match;
				}
		
			});
			
			custom = jasmine
				.createSpy('custom')
				.andCallFake(function(item) {
					return item + 2;
				});
		});
		
		describe("for empty arrays" , function() {
			var array = [];
			
			it("should accept standard usage", function() {
				expect(Tutti.Util.findInsertionPoint(array, -1)).toBe(0);
				expect(Tutti.Util.findInsertionPoint(array, 0)).toBe(0);
				expect(Tutti.Util.findInsertionPoint(array, 2)).toBe(0);
			});
			
			it("should accept custom functions", function() {
				expect(Tutti.Util.findInsertionPoint(array, 5, custom)).toBe(0);
				expect(custom).not.toHaveBeenCalled();
			});
		});
		
		describe("for single-item arrays" , function() {
			var array = [0];
			
			it("should accept standard usage", function() {
				expect(Tutti.Util.findInsertionPoint(array, -1)).toBe(0);
				expect(Tutti.Util.findInsertionPoint(array, 0)).toBeOneOf(0, 1);
				expect(Tutti.Util.findInsertionPoint(array, 2)).toBe(1);
			});
			
			describe("with custom functions", function() {
				it("should find lower bounds", function() {
					expect(Tutti.Util.findInsertionPoint(array, 0, custom)).toBe(0);
					expect(custom).toHaveBeenCalledWith(0);
				});
				
				it("should find equal members", function() {
					expect(Tutti.Util.findInsertionPoint(array, 2, custom)).toBeOneOf(0, 1);
					expect(custom).toHaveBeenCalledWith(0);
				});
				
				it("should find upper bounds", function() {
					expect(Tutti.Util.findInsertionPoint(array, 4, custom)).toBe(1);
					expect(custom).toHaveBeenCalledWith(0);
				});
			});
		});
		
		describe("for multi-item arrays" , function() {
			var array = [2, 3, 3, 6];
			
			it("should accept standard usage", function() {
				expect(Tutti.Util.findInsertionPoint(array, 1)).toBe(0);
				
				expect(Tutti.Util.findInsertionPoint(array, 2)).toBeOneOf(0, 1);
				expect(Tutti.Util.findInsertionPoint(array, 3)).toBeOneOf(1, 2, 3);
				
				expect(Tutti.Util.findInsertionPoint(array, 4)).toBe(3);
				expect(Tutti.Util.findInsertionPoint(array, 5)).toBe(3);
				
				expect(Tutti.Util.findInsertionPoint(array, 6)).toBeOneOf(3, 4);
				
				expect(Tutti.Util.findInsertionPoint(array, 7)).toBe(4);
			});
			
			describe("with custom functions", function() {
				it("should find lower bounds", function() {
					expect(Tutti.Util.findInsertionPoint(array, 2, custom)).toBe(0);
					expect(custom).toHaveBeenCalled();
				});
				
				it("should find equal members", function() {
					expect(Tutti.Util.findInsertionPoint(array, 5, custom)).toBeOneOf(1, 2, 3);
					expect(Tutti.Util.findInsertionPoint(array, 8, custom)).toBeOneOf(3, 4);
					expect(custom).toHaveBeenCalled();
				});
				
				it("should find upper bounds", function() {
					expect(Tutti.Util.findInsertionPoint(array, 10, custom)).toBe(4);
					expect(custom).toHaveBeenCalled();
				});
			});
		});
	});
	
	describe("when moving array items", function() {
		describe("with empty arrays", function() {
			var array;
			
			beforeEach(function() {
				array = [];
			});
			
			it("should skip null operations", function() {
				expect(function() { Tutti.Util.move(array, 0, 0) }).not.toThrow();
				expect(function() { Tutti.Util.move(array, 5, 5) }).not.toThrow();
			});
			
			it("should not accept invalid indices", function() {
				expect(function() { Tutti.Util.move(array, 0, 1) }).toThrow();
				expect(function() { Tutti.Util.move(array, 10, 2) }).toThrow();
			});
		});
		
		describe("with two-item arrays", function() {
			var array;
			
			beforeEach(function() {
				array = ['a', 'b'];
			});
			
			it("should skip null operations", function() {
				expect(function() { Tutti.Util.move(array, 0, 0) }).not.toThrow();
				expect(function() { Tutti.Util.move(array, 5, 5) }).not.toThrow();
			});
			
			it("should handle forward moves", function() {
				Tutti.Util.move(array, 0, 1);
				expect(array).toEqual(['b', 'a']);
			});
			
			it("should handle backward moves", function() {
				Tutti.Util.move(array, 1, 0);
				expect(array).toEqual(['b', 'a']);
			});
			
			it("should not accept invalid indices", function() {
				expect(function() { Tutti.Util.move(array, 0, 3) }).toThrow();
				expect(function() { Tutti.Util.move(array, 10, 2) }).toThrow();
			});
		});
		
		describe("with multi-item arrays", function() {
			var array;
			
			beforeEach(function() {
				array = ['z', 'x', 'y', 'w'];
			});
			
			it("should skip null operations", function() {
				expect(function() { Tutti.Util.move(array, 0, 0) }).not.toThrow();
				expect(function() { Tutti.Util.move(array, 5, 5) }).not.toThrow();
			});
			
			it("should handle forward moves", function() {
				Tutti.Util.move(array, 1, 3);
				expect(array).toEqual(['z', 'y', 'w', 'x']);
			});
			
			it("should handle backward moves", function() {
				Tutti.Util.move(array, 2, 0);
				expect(array).toEqual(['y', 'z', 'x', 'w']);
			});
			
			it("should not accept invalid indices", function() {
				expect(function() { Tutti.Util.move(array, 0, 5) }).toThrow();
				expect(function() { Tutti.Util.move(array, 10, 2) }).toThrow();
			});
		});
	})
});