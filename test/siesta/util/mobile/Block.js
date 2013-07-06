/**
 * 
 */
Ext.define('Test.Block', {
	extend: 'Tutti.touch.Block',
	
	test: null,
	rawItems: null,
	
	expected: null,
	message: 'Correct child detected',
	
	count: 0,
	
	constructor: function(config) {
		this.test = config.test;
		this.rawItems = config.items;
		
		this.callParent(arguments);
	},
	
	initItems: function(items) {
		items.addAll(this.rawItems);
	},
	
	shift: function(base) {
		var offset = this.canvasEl.getXY();
		
		return [
			base[0] + offset[0],
			base[1] + offset[1]
		];
	},
	
	expect: function(item) {
		if (Ext.isNumber(item)) {
			item = this.rawItems[item];
		}
		
		this.expected = item;
	},
	
	resetCount: function() {
		this.count = 0;
	},
	
	getTapCount: function() {
		return this.count;
	},
	
	onTap: function(item) {
		this.count++;
		this.test[this.expected ? 'isStrict' : 'is'](item, this.expected, this.message);
	}
});