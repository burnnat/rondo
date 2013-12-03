/**
 * 
 */
Ext.define('Rondo.view.sketch.OptionsBar', {
	extend: 'Ext.SegmentedButton',
	
	config: {
		layout: 'vbox'
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.addCls('segmentedbutton-vertical', Ext.baseCSSPrefix);
		
		this.add([
			{
				itemId: 'hide',
				cls: 'x-button-fullsize',
				iconCls: 'chevron-down',
				
				listeners: {
					tap: this.onHideTap,
					scope: this
				},
				flex: 1
			},
			{
				text: '1',
				flex: 1
			},
			{
				text: '2',
				flex: 1
			},
			{
				text: '3',
				flex: 1
			}
		]);
		
		this.on('painted', this.calculateWidth, this, { single: true });
	},
	
	calculateWidth: function() {
		this.setWidth(this.element.getHeight() / this.getItems().getCount());
	},
	
	onButtonRelease: function(button) {
		if (button.getItemId() === 'hide') {
			return;
		}
		
		this.callParent(arguments);
	},
	
	onHideTap: function() {
		this.fireEvent('starthide');
	}
});