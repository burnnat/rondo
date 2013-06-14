/**
 * 
 */
Ext.define('Tutti.touch.score.Score', {
	extend: 'Ext.Container',
	xtype: 'score',
	
	uses: [
		'Ext.ux.plugin.Pinchemu',
		'Tutti.touch.score.Measure'
	],
	
	config: {
		sketch: null,
		
		scrollable: 'horizontal',
		
		plugins: [{ xclass: 'Ext.ux.plugin.Pinchemu' }],
		
		layout: {
			type: 'hbox',
			align: 'center'
		},
		
		activeBlock: null
	},
	
	initialize: function() {
		this.element.on({
			pinchstart: this.onPinchStart,
			pinch: this.onPinch,
			scope: this
		});
		
		var sketch = this.getSketch();
		var parts = sketch.parts();
		var blockHeight = 100;
		
		sketch.measures().each(
			function(measure, index, length) {
				var first = index === 0;
				
				var measure = new Tutti.touch.score.Measure({
					data: measure,
					parts: parts,
					blockHeight: blockHeight,
					blockWidth: 400 + (first ? 100 : 0),
					systemStart: first,
					systemEnd: index === length - 1
				});
				
				if (first) {
					blockHeight = measure.getSystemHeight();
					measure.setBlockHeight(blockHeight);
				}
				
				this.add(measure);
			},
			this
		);
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
	},
	
	applyActiveBlock: function(item) {
		if (!item || !item.setActive) {
			return null;
		}
		
		return item;
	},
	
	updateActiveBlock: function(active, old) {
		if (old) {
			old.setActive(false);
		}
		
		if (active) {
			active.setActive(true);
		}
	}
});