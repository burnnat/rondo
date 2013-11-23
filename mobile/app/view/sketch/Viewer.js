/**
 * 
 */
Ext.define('Rondo.view.sketch.Viewer', {
	extend: 'Ext.Container',
	xtype: 'sketchviewer',
	
	requires: [
		'Tutti.touch.input.Keyboard',
		'Tutti.touch.score.Score'
	],
	
	config: {
		layout: 'fit',
		margin: 10,
		sketch: null
	},
	
	initialize: function() {
		this.add([
			{
				xtype: 'score',
				sketch: this.getSketch()
			},
			{
				xtype: 'button',
				docked: 'bottom',
				text: 'Rest',
				width: '100%'
			},
			{
				xtype: 'container',
				height: 200,
				docked: 'bottom',
				scrollable: 'horizontal',
				
				layout: {
					type: 'vbox',
					pack: 'center',
					align: 'center'
				},
				
				items: [
					{
						xtype: 'keyboard',
						octaves: 4
					}
				]
			}
		]);
	}
});