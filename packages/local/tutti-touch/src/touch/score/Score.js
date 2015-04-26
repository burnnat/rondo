/**
 * 
 */
Ext.define('Tutti.touch.score.Score', {
	extend: 'Ext.Container',
	xtype: 'score',
	
	uses: [
		//<debug>
		'Ext.ux.plugin.Pinchemu',
		//</debug>
		'Tutti.touch.score.Measure'
	],
	
	config: {
		sketch: null,
		
		scrollable: {
			direction: 'auto',
			directionLock: true
		},
		
		layout: {
			type: 'hbox',
			align: 'center'
		},
		
		activeBlock: null
	},
	
	//<debug>
	constructor: function() {
		this.callParent(arguments);
		
		if (Ext.os.is.Desktop) {
			this.setPlugins([{ xclass: 'Ext.ux.plugin.Pinchemu' }]);
		}
	},
	//</debug>
	
	initialize: function() {
		this.element.on({
			tap: this.onTap,
			pinchstart: this.fetchChildHeight,
			pinch: this.onPinch,
			scope: this
		});
		
		var sketch = this.getSketch();
		var parts = sketch.parts();
		var blockHeight = 100;
		
		var measures = sketch.measures();
		
		if (measures.getCount() > 0) {
			measures.each(
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
		}
		else {
			this.getLayout().setPack('center');
			this.add({
				xtype: 'component',
				html: 'This sketch is empty.'
			});
		}
		
		this.on('painted', this.adjustHeight, this, { single: true });
	},
	
	adjustHeight: function() {
		var available = this.element.getHeight();
		
		this.fetchChildHeight();
		
		if (this.baseHeight > available) {
			this.setChildHeight(available);
		}
	},
	
	fetchChildHeight: function() {
		var first = this.getAt(0);
		
		if (first && first instanceof Tutti.touch.score.Measure) {
			this.blockHeight = first.getBlockHeight();
			this.baseHeight = first.getHeight() || this.blockHeight;
		}
	},
	
	setChildHeight: function(height) {
		height = Math.floor(
			Ext.Number.constrain(
				height,
				this.blockHeight / 2,
				this.blockHeight * 2
			)
		);
		
		this.getItems().each(
			function(component) {
				component.setHeight(height);
			}
		);
	},
	
	onTap: function() {
		this.fireEvent('tap');
	},
	
	onPinch: function(event) {
		this.setChildHeight(this.baseHeight * event.scale);
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