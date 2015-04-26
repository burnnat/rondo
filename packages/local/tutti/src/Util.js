/**
 * 
 */
Ext.define('Tutti.Util', {
	singleton: true,
	
	/**
	 * Finds the appropriate index to insert a value into a sorted array,
	 * using a binary search. It is assumed that the values are pre-sorted
	 * in ascending order, and that equal values may occur in any order.
	 * 
	 * @param {Array} array The array to search.
	 * @param {Number} value The value to be inserted.
	 * @param {Function} [fn] A function to transform array items for comparison to the given value.
	 * @param {Mixed} fn.item The item in the array to transform.
	 * 
	 * @return {Number} The index at which the given value would be inserted.
	 */
	findInsertionPoint: function(array, value, fn) {
		if (array.length === 0) {
			return 0;
		}
		
		var start = 0;
		var end = array.length - 1;
		
		var mid, current;
		
		do {
			mid = Math.floor((start + end) / 2);
			current = array[mid];
			
			if (fn) {
				current = fn(current);
			}
			
			if (value > current) {
				mid = start = mid + 1;
			}
			else if (value < current) {
				mid = end = mid - 1;
			}
			else {
				start = end = mid - 1;
			}
		}
		while (mid >= start && mid <= end);
		
		return mid < start
			? mid + 1
			: mid;
	},
	
	/**
	 * @param {Array} array
	 * @param {Number} oldIndex
	 * @param {Number} newIndex
	 */
	move: function(array, oldIndex, newIndex) {
		if (oldIndex === newIndex) {
			return;
		}
		
		if (oldIndex < 0 || oldIndex >= array.length) {
			Ext.Error.raise("Invalid index: " + oldIndex);
		}
		
		if (newIndex < 0 || newIndex >= array.length) {
			Ext.Error.raise("Invalid index: " + newIndex);
		}
		
		Ext.Array.insert(
			array,
			newIndex,
			Ext.Array.splice(array, oldIndex, 1)
		);
	},
	
	/**
	 * Returns the lesser of two fractions. If the two fractions
	 * are equal, the first fraction will be returned.
	 * 
	 * @param {Vex.Flow.Fraction} a
	 * @param {Vex.Flow.Fraction} b
	 * 
	 * @return {Vex.Flow.Fraction}
	 */
	min: function(a, b) {
		var quotientA = a.quotient();
		var quotientB = b.quotient();
		
		if (quotientA < quotientB) {
			return a;
		}
		else if (quotientB < quotientA) {
			return b;
		}
		else {
			return (b.fraction() * b.denominator < a.fraction() * a.denominator) ? b : a;
		}
	}
});