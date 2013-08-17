/**
 * 
 */
Ext.define('Rondo.user.Proxy', {
	extend: 'Ext.data.proxy.Ajax',
	alias: 'proxy.user',
	
	config: {
		url: '/auth/user',
		
		reader: {
			type: 'json',
			rootProperty: 'user'
		}
	},
	
	doRequest: function(operation, callback, scope) {
		// Ext.data.Model#load() stores the requested ID in the operation params.
		// Here, we extract the parameter and store the options directly on the operation.
		Ext.apply(
			operation,
			operation.getParams()[
				operation.getModel().getIdProperty()
			]
		);
		
		operation.setParams({});
		
		if (operation.login) {
			var request = this.getWriter().write(this.buildRequest(operation));
			
			var frame = Ext.DomHelper.append(
				Ext.getBody(),
				{
					tag: 'iframe',
					src: '/auth/' + operation.login + '?immediate=true'
				}
			);
			
			frame.addEventListener(
				'load',
				Ext.bind(
					this.onFrameLoad,
					this,
					[
						frame,
						this.createRequestCallback(request, operation, callback, scope)
					]
				),
				false
			);
		}
		else {
			this.callParent(arguments);
		}
	},
	
	buildRequest: function(operation) {
		var request = this.callParent(arguments);
		
		if (operation.logout) {
			request.setUrl('/auth/logout');
		}
		
		return request;
	},
	
	onFrameLoad: function(frame, callback) {
		var success = false;
		var response = {
			responseText: ''
		};
		
		try {
			success = true;
			response.responseText = frame.contentDocument.body.textContent;
		}
		catch (e) {
			success = false;
			response.responseText = '{success:false,message:"' + Ext.String.trim(e.message || e.description) + '"}';
		}
		
		callback(null, success, response);
		
		Ext.removeNode(frame);
	}
});