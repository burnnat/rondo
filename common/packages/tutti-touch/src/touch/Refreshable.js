/**
 * 
 */
Ext.define('Tutti.touch.Refreshable', {
	extend: 'Ext.mixin.Mixin',
	
	mixinConfig: {
		id: 'refreshable',
		hooks: {
			onItemAdd: 'onItemAdd',
			onItemRemove: 'onItemRemove'
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {Number} index
	 * @param {Tutti.touch.BlockItem} item
	 */
	onItemAdd: function(index, item) {
		if (item.isObservable) {
			item.on('refresh', this.refresh, this);
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {Tutti.touch.BlockItem} item
	 */
	onItemRemove: function(item) {
		if (item.isObservable) {
			item.un('refresh', this.refresh, this);
		}
	},
	
	/**
	 * @param {Object} stages
	 */
	refresh: function(stages) {
		var pending = this.pendingRefresh || {};
		
		Ext.Object.each(
			stages,
			function(key, value) {
				var current = pending[key];
				
				if (key === 'values') {
					value = Ext.apply(current || {}, value);
				}
				else {
					value = current || value;
				}
				
				pending[key] = value;
			}
		);
		
		if (!this.pendingRefresh) {
			this.pendingRefresh = pending;
			requestAnimationFrame(Ext.Function.bind(this.startRefresh, this));
		}
	},
	
	/**
	 * @private
	 */
	startRefresh: function() {
		this.performRefresh(this.pendingRefresh);
		delete this.pendingRefresh;
	},
	
	/**
	 * @protected
	 * @template
	 * 
	 * @param {Object} stages
	 */
	performRefresh: Ext.emptyFn
});