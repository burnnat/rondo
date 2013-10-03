/**
 * 
 */
Ext.define('Tutti.proxy.Rest', {
	extend: 'Ext.data.proxy.Rest',
	
	buildUrl: function(request) {
		var appendId = this.getAppendId();
		
		if (request.getOperation().getAction() == 'create') {
			this.setAppendId(false);
		}
		
		var url = this.callParent(arguments);
		
		this.setAppendId(appendId);
		
		return url;
	}
});