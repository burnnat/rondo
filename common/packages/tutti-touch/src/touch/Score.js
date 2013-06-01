/**
 * 
 */
Ext.define('Tutti.touch.Score', {
	extend: 'Ext.Container',
	xtype: 'score',
	
	uses: [
		'Ext.ux.plugin.Pinchemu',
		'Vex.Flow.Document',
		'Tutti.score.Backend',
		'Tutti.score.Panorama'
	],
	
	config: {
		sketch: null,
		
		scrollable: 'horizontal',
		
		plugins: [{ xclass: 'Ext.ux.plugin.Pinchemu' }],
		
		layout: {
			type: 'hbox',
			align: 'center'
		}
	},
	
	initialize: function() {
		this.on({
			scope: this,
			painted: 'onInitialPaint',
			single: true
		});
		
		this.score = new Vex.Flow.Document(this.getSketch());
		this.formatter = new Tutti.score.Panorama(this.score);
		
		this.element.on({
			pinchstart: this.onPinchStart,
			pinch: this.onPinch,
			scope: this
		});
	},
	
	refreshBlock: function(index) {
		delete this.score.measures[index];
		this.getAt(index).clear();
		this.formatter.drawBlock(index);
	},
	
	onInitialPaint: function() {
		this.formatter.draw(this);
	},
	
	onPinchStart: function() {
		var first = this.getAt(0);
		this.blockHeight = first.getBlockHeight();
		this.baseHeight = first.getHeight() || first.getBlockHeight();
	},
	
	onPinch: function(event) {
		var height = Ext.Number.constrain(
			this.baseHeight * event.scale,
			this.blockHeight,
			this.element.getHeight()
		);
		
		var actualScale = height / this.baseHeight;
		
		this.getItems().each(
			function(component) {
				component.setHeight(height);
			}
		);
	}
});