/**
 * 
 */
Ext.define('Test.model.Measure', {
	requires: ['Ext.data.Store'],
	
	getResolvedTime: function() {
		return null;
	},
	
	voices: function() {
		return new Ext.data.Store();
	}
});