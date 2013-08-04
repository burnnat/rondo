/**
 * 
 */
Ext.define('Test.mock.Staff', {
	
	config: {
		block: null,
		startX: 0
	},
	
	constructor: function(config) {
		this.initConfig(config);
	},
	
	getX: function() {
		return 0;
	},
	
	getY: function() {
		return 0;
	},
	
	getWidth: function() {
		return this.getBlock().getBlockWidth();
	},
	
	getTotalHeight: function() {
		return this.getBlock().getBlockHeight();
	}
	
});