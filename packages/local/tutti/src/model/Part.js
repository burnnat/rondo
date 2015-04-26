/**
 *
 */
Ext.define('Tutti.model.Part', {
	extend: 'Ext.data.Model',

	requires: [
		'Tutti.model.Sketch',
		'Tutti.proxy.RestSync'
	],

	config: {
		identifier: 'uuid',

		proxy: {
			type: 'restsync',
			id: 'parts'
		},

		fields: [
			{
				name: 'name',
				type: 'string'
			},
			{
				name: 'group',
				type: 'string'
			},
			{
				name: 'sketch_id',
				reference: 'Tutti.model.Sketch'
			}
		]
	}
});
