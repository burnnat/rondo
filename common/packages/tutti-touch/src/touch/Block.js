/**
 * 
 */
Ext.define('Tutti.touch.Block', {
	extend: 'Ext.Component',
	xtype: 'block',
	
	requires: [
		//<debug>
		'Tutti.touch.BlockItem',
		//</debug>
		
		'Ext.data.SortTypes',
		'Ext.util.MixedCollection'
	],
	
	template: [
		{
			tag: 'canvas',
			reference: 'canvasEl'
		}
	],
	
	config: {
		autoPaint: true,
		blockHeight: null,
		blockWidth: null
	},
	
	statics: {
		getItemKey: function(item) {
			if (!Ext.isDefined(item.blockId)) {
				item.blockId = Ext.id() + '-' + Math.floor(Math.random() * 10000);
			}
			
			return item.blockId;
		}
	},
	
	constructor: function() {
		this.mapEl = Ext.get(document.createElement('canvas'));
		
		//<debug>
		this.mapEl.on(
			'tap',
			function() {
				this.hideMap();
			},
			this
		);
		//</debug>
		
		this.callParent(arguments);
	},
	
	initialize: function() {
		if (this.getAutoPaint()) {
			this.on({
				scope: this,
				painted: 'initialPaint',
				single: true
			});
		}
		
		this.canvasEl.on(this.initListeners());
		
		var items = this.items = new Ext.util.MixedCollection(false, this.hash);
		
		items.on({
			add: this.onItemAdd,
			remove: this.onItemRemove,
			scope: this
		});
		
		this.initItems(items);
		this.sortItems();
		
		items.on({
			add: this.sortItems,
			remove: this.sortItems,
			scope: this
		});
		
		//<debug>
		this.mapToggle = new Tutti.touch.BlockItem();
		
		Ext.apply(this.mapToggle, {
			selectable: true,
			precedence: 5000,
			
			getBlockHeight: function() {
				return this.parent.getBlockHeight();
			},
			
			draw: function(context) {
				this.saveContext(context, ['font', 'fillStyle']);
				
				var height = this.getBlockHeight();
				
				context.beginPath()
				context.arc(14.5, height - 14, 10, 0, 2 * Math.PI, false);
				context.fillStyle = 'blue';
				context.fill();
				
				context.font = '18px Pictos';
				context.fillStyle = '#CDF';
				context.fillText('i', 5.5, height - 9);
				
				this.restoreContext(context);
			},
			
			getBoundingBox: function() {
				return {
					x: 4,
					y: this.getBlockHeight() - 24,
					w: 21,
					h: 21
				};
			}
		});
		
		items.add(this.mapToggle);
		//</debug>
	},
	
	onItemAdd: function(index, item) {
		item.parent = this;
	},
	
	onItemRemove: function(item) {
		item.parent = null;
	},
	
	initListeners: function() {
		var me = this;
		var fn = me.parseEvent;
		var listeners = {
			touchstart: me.onTouchStart,
			touchmove: me.onTouchMove,
			touchend: me.onTouchEnd,
			tap: me.onTap
		};
		
		Ext.Object.each(
			listeners,
			function(name, callback) {
				listeners[name] = Ext.bind(fn, me, [callback], 0);
			}
		);
		
		return listeners;
	},
	
	initItems: Ext.emptyFn,
	
	sortItems: function() {
		this.items.sort({
			property: 'precedence',
			direction: 'ASC',
			transform: Ext.data.SortTypes.asInt
		});
	},
	
	hash: function(item) {
		var data = Tutti.touch.Block.getItemKey(item);
		
		var isString = Ext.isString(data);
		var length = isString
			? data.length
			: 4; // assume 32-bit numbers
		
		var hash = 0x811C9DC5;
		var i, c;
		
		for (i = 0; i < length; i++) {
			hash += (hash << 1)
				+ (hash << 4)
				+ (hash << 7)
				+ (hash << 8)
				+ (hash << 24);
			hash ^= isString
				? data.charCodeAt(i)
				: (data >>> (i * 8)) & 0xFF;
		}
		
		hash = (hash >>> 24) ^ (hash & 0xFFFFFF);
		
		return hash;
	},
	
	initialPaint: function() {
		this.repaint(true);
	},
	
	/**
	 * 
	 */
	repaint: function() {
		var context = this.getContext();
		var mapper = this.getMapperContext();
		
		this.items.each(
			function(item) {
				if (item.setContext) {
					item.setContext(context);
				}
				
				try {
					item.draw(context);
					
					if (item.selectable) {
						this.mapItem(item, mapper);
					}
				}
				catch (e) {
					Ext.Logger.error(e.stack);
				}
			},
			this
		);
	},
	
	/**
	 * @protected
	 */
	mapItem: function(item, mapper) {
		mapper = mapper || this.getMapperContext();
		var box = item.getBoundingBox();
		
		mapper.fillStyle = this.toRGB(
			this.hash(item)
		);
		mapper.fillRect(Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h));
	},
	
	clear: function() {
		var args = [0, 0, this.getBlockWidth(), this.getBlockHeight()];
		
		Ext.Array.forEach(
			[this.getContext(), this.getMapperContext()],
			function(context) {
				context.clearRect.apply(context, args);
			}
		);
	},
	
	//<debug>
	showMap: function() {
		if (this.mapEl.parent() == null) {
			var parent = this.canvasEl.parent();
			
			parent.setStyle('position', 'relative');
			parent.appendChild(this.mapEl);
			
			this.mapEl.setStyle({ position: 'absolute' });
		}
		
		this.mapEl.setVisible(true);
		this.mapEl.setXY(this.canvasEl.getXY());
	},
	
	hideMap: function() {
		this.mapEl.setVisible(false);
	},
	//</debug>
	
	toRGB: function(key) {
		return 'rgb('
			+ ((key & (255 << 16)) >> 16) + ','
			+ ((key & (255 << 8)) >> 8) + ','
			+ (key & 255)
		+ ')';
	},
	
	getContext: function() {
		return this.getContextFor(this.canvasEl);
	},
	
	/**
	 * @private
	 * 
	 * @return {CanvasRenderingContext2D}
	 */
	getMapperContext: function() {
		return this.getContextFor(this.mapEl);
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.dom.Element} el
	 * 
	 * @return {CanvasRenderingContext2D}
	 */
	getContextFor: function(el) {
		return el.dom.getContext('2d');
	},
	
	updateBlockHeight: function(height) {
		var attr = { height: height };
		this.canvasEl.set(attr);
		this.mapEl.set(attr);
	},
	
	updateBlockWidth: function(width) {
		var attr = { width: width }
		this.canvasEl.set(attr);
		this.mapEl.set(attr);
	},
	
	doSetHeight: function(height) {
		this.canvasEl.setHeight(height);
		//<debug>
		this.mapEl.setHeight(height);
		//</debug>
		this.callParent(arguments);
	},
	
	doSetWidth: function(width) {
		this.canvasEl.setWidth(width);
		//<debug>
		this.mapEl.setWidth(width);
		//</debug>
		this.callParent(arguments);
	},
	
	/**
	 * @param {Number} pageX
	 * @param {Number} pageY
	 * 
	 * @return {Object}
	 * @return {Number} return.x
	 * @return {Number} return.y
	 */
	convertPoint: function(pageX, pageY) {
		var canvas = this.canvasEl;
		var scale = this.getScale();
		
		return {
			x: (pageX - canvas.getX()) / scale,
			y: (pageY - canvas.getY()) / scale
		};
	},
	
	/**
	 * @return {Number}
	 */
	getScale: function() {
		return this.canvasEl.getHeight() / this.getBlockHeight();
	},
	
	parseEvent: function(callback, event) {
		var point = this.convertPoint(event.pageX, event.pageY);
		var data = this.getMapperContext().getImageData(point.x, point.y, 1, 1).data;
		
		var item = this.items.getByKey(
			(data[0] << 16)
			+ (data[1] << 8)
			+ data[2]
		);
		
		//<debug>
		if (item === this.mapToggle) {
			if (event.type === 'mouseup') {
				this.showMap();
			}
			
			return;
		}
		//</debug>
		
		callback.call(this, item, event);
	},
	
	onTouchStart: Ext.emptyFn,
	onTouchMove: Ext.emptyFn,
	onTouchEnd: Ext.emptyFn,
	onTap: Ext.emptyFn
});