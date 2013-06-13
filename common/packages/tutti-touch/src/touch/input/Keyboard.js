/**
 * 
 */
Ext.define('Tutti.touch.input.Keyboard', {
	extend: 'Tutti.touch.Block',
	xtype: 'keyboard',
	
	uses: [
		'Ext.util.MixedCollection',
		'Tutti.touch.input.Key'
	],
	
	config: {
		blockHeight: 180,
		blockWidth: null,
		octaves: 1,
		
		// these are auto-updated based on block height
		whiteWidth: null,
		blackWidth: null,
		blackHeight: null,
		
		/**
		 * @private
		 */
		activeKey: null
	},
	
	initItems: function(items) {
		var i, key;
		
		var octaves = this.getOctaves();
		var pitch = 60 - 12 * Math.floor(octaves / 2);
		var count = octaves * 7;
		
		var whiteWidth = this.getWhiteWidth();
		var whiteHeight = this.getBlockHeight();
		var blackWidth = this.getBlackWidth();
		var blackHeight = this.getBlackHeight();
		
		for (i = 0; i < count; i++) {
			key = i % 7;
			
			if (i > 0 && key != 0 && key != 3) {
				items.add(
					new Tutti.touch.input.Key({
						type: 'black',
						pitch: pitch++,
						x: i * whiteWidth - 0.5 * (blackWidth - 1),
						width: blackWidth,
						height: blackHeight
					})
				);
			}
			
			items.add(
				new Tutti.touch.input.Key({
					type: 'white',
					pitch: pitch++,
					x: i * whiteWidth,
					width: whiteWidth + ((i < count - 1) ? 1 : 0),
					height: whiteHeight
				})
			);
		}
	},
	
	repaint: function(initial) {
		if (initial) {
			var parent = this.getParent();
			var scrollable = parent.getScrollable();
			
			if (scrollable) {
				var parentWidth = parent.element.getSize().width;
				var width = this.getBlockWidth();
				
				if (width > parentWidth) {
					scrollable.getScroller().setInitialOffset({
						x: (width - parentWidth) / 2,
						y: 0
					});
				}
			}
		}
		
		this.callParent(arguments);
	},
	
	repaintKey: function(key) {
		var context = this.getContext();
		
		key.draw(context);
		
		if (key.getType() === 'white') {
			var pitch = key.getPitch();
			var mod = pitch % 12;
			
			if (mod != 0 && mod != 5) {
				this.findKey(pitch - 1).draw(context);
			}
			
			if (mod != 4 && mod != 11) {
				this.findKey(pitch + 1).draw(context);
			}
		}
	},
	
	findKey: function(pitch) {
		return this.items.findBy(
			function(key) {
				return key.getPitch() === pitch;
			}
		);
	},
	
	updateBlockHeight: function(height) {
		this.setBlackHeight(height * 0.65);
		this.setWhiteWidth(height * 0.225);
		this.setBlackWidth(height * 0.125);
		
		this.callParent(arguments);
	},
	
	applyWhiteWidth: function(width) {
		return Math.floor(width);
	},
	
	applyBlackHeight: function(height) {
		return Math.floor(height);
	},
	
	applyBlackWidth: function(width) {
		width = Math.floor(width);
		return width % 2 == 0 ? width + 1 : width;
	},
	
	updateOctaves: function(octaves) {
		if (!this.getBlockWidth()) {
			this.setBlockWidth(octaves * 7 * this.getWhiteWidth());
		}
	},
	
	updateActiveKey: function(current, old) {
		if (old) {
			old.setActive(false);
			this.repaintKey(old);
		}
		
		if (current) {
			current.setActive(true);
			this.repaintKey(current);
		}
	},
	
	onTouchStart: function(key) {
		this.setActiveKey(key);
	},
	
	onTouchMove: function(key) {
		this.setActiveKey(null);
	},
	
	onTap: function(key) {
		this.setActiveKey(null);
		
		if (key) {
			this.fireEvent('keytap', key);
		}
	}
});