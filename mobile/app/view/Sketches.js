/**
 * 
 */
Ext.define('Rondo.view.Sketches', {
	extend: 'Ext.Container',
	xtype: 'sketches',
	
	requires: [
		'Ext.dataview.List'
	],
	
	config: {
		title: 'Sketches',
		
		layout: 'fit',
		
		items: [
			{
				xtype: 'list',
				itemTpl: ['{title}'],
				store: 'sketches'
			},
			{
				xtype: 'toolbar',
				docked: 'bottom',
				items: [
					{
						iconCls: 'trash',
						iconMask: true
					},
					{
						iconCls: 'refresh',
						iconMask: true
					},
					{
						xtype: 'spacer'
					},
					{
						iconCls: 'add',
						iconMask: true
					}
				]
			}
		]
	}
});
