/**
 * 
 */
Ext.define('Tutti.touch.Block', {
	extend: 'Ext.Component',
	xtype: 'block',
	
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
	
	constructor: function() {
		this.mapEl = Ext.get(document.createElement('canvas'));
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
		
		var canvas = this.canvasEl;
		canvas.on(this.initListeners());
		
		var items = this.items = new Ext.util.MixedCollection(false, this.hash);
		
		items.on({
			add: function(index, item) {
				item.parent = canvas;
			},
			remove: function(item) {
				item.parent = null;
			}
		});
		
		this.initItems(items);
		
		items.sort('precedence', 'ASC');
	},
	
	initListeners: function() {
		var me = this;
		var fn = me.parseEvent;
		var listeners = {
			touchstart: me.onTouchStart,
			touchmove: me.onTouchMove,
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
	
	getItemKey: function(item) {
		if (!Ext.isDefined(item.id)) {
			item.id = Ext.id();
		}
		
		return item.id;
	},
	
	hash: function(item) {
		var data = item.getId();
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
				item.draw(context);
				this.mapItem(item, mapper);
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
		mapper.fillRect(box.x, box.y, box.w, box.h);
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
			Ext.getBody().appendChild(this.mapEl);
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
		this.callParent(arguments);
	},
	
	doSetWidth: function(width) {
		this.canvasEl.setWidth(width);
		this.callParent(arguments);
	},
	
	parseEvent: function(callback, event) {
		var x = event.pageX - this.canvasEl.getX();
		var y = event.pageY - this.canvasEl.getY();
		
		var data = this.getMapperContext().getImageData(x, y, 1, 1).data;
		
		var item = this.items.getByKey(
			(data[0] << 16)
			+ (data[1] << 8)
			+ data[2]
		);
		
		callback.call(this, item);
	},
	
	onTouchStart: Ext.emptyFn,
	onTouchMove: Ext.emptyFn,
	onTap: Ext.emptyFn
});