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
						iconCls: 'trash'
					},
					{
						xtype: 'spacer'
					},
					{
						iconCls: 'add'
					}
				]
			}
		]
	}
});
