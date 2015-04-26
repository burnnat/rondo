/**
 * 
 */
Ext.define('Tutti.overrides.data.StoreManager', {
	override: 'Ext.data.StoreManager',
	
	constructor: function() {
		console.log('constructor');
		this.callParent(arguments);
	},
	
	register: function() {
		this.callParent(arguments);
		this.fireEvent('register', Ext.Array.clone(arguments));
	}
});

Ext.require(
	[
		'Ext.util.Observable',
		'Ext.data.StoreManager'
	],
	function() {
		Ext.data.StoreManager.self.mixin('observable', Ext.util.Observable);
	}
);