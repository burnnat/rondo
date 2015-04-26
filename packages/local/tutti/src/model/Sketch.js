/**
 *
 */
Ext.define('Tutti.model.Sketch', {
	extend: 'Ext.data.Model',

	requires: [
		'Tutti.proxy.RestSync'
	],

	config: {
		identifier: 'uuid',

		proxy: {
			type: 'restsync',
			id: 'sketches'
		},

		fields: [
			{
				name: 'title',
				type: 'string'
			}
		]
	}
});
