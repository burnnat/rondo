/**
 * 
 */
Ext.define('Rondo.view.sketch.Viewer', {
	extend: 'Ext.Container',
	xtype: 'sketchviewer',
	
	requires: [
		'Tutti.touch.input.Keyboard',
		'Tutti.touch.score.Score',
		'Rondo.view.sketch.OptionsBar'
	],
	
	config: {
		layout: 'fit',
		sketch: null
	},
	
	initialize: function() {
		this.placeholder = this.add(
			{
				xtype: 'button',
				ui: 'action',
				iconCls: 'chevron-up',
				
				left: 10,
				bottom: 10,
				
				showAnimation: {
					type: 'slideIn',
					direction: 'up'
				},
				
				hideAnimation: {
					type: 'slideOut',
					direction: 'down',
					
					listeners: {
						animationend: this.finishShow,
						scope: this
					}
				},
				
				hidden: true,
				
				listeners: {
					tap: this.startShow,
					scope: this
				}
			}
		);
		
		this.add([
			{
				xtype: 'score',
				margin: 10,
				sketch: this.getSketch()
			},
			{
				xtype: 'toolbar',
				itemId: 'inputbar',
				docked: 'bottom',
				
				layout: {
					type: 'hbox',
					align: 'stretch'
				},
				
				padding: 10,
				
				showAnimation: {
					type: 'slideIn',
					direction: 'up'
				},
				
				hideAnimation: {
					type: 'slideOut',
					direction: 'down',
					
					listeners: {
						animationend: this.finishHide,
						scope: this
					}
				},
				
				items: [
					new Rondo.view.sketch.OptionsBar({
						margin: '0 10 0 0',
						listeners: {
							starthide: this.startHide,
							scope: this
						}
					}),
					{
						xtype: 'container',
						flex: 1,
						layout: 'vbox',
						items: [
							{
								xtype: 'container',
								height: 200,
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
							},
							{
								xtype: 'button',
								itemId: 'rest',
								ui: 'neutral',
								cls: 'x-button-fullsize',
								text: 'Rest'
							}
						]
					}
				]
			}
		]);
	},
	
	startHide: function() {
		this.getComponent('inputbar').hide();
	},
	
	finishHide: function() {
		this.placeholder.show();
	},
	
	startShow: function() {
		this.placeholder.hide();
	},
	
	finishShow: function() {
		this.getComponent('inputbar').show();
	}
});