/**
 *
 */
Ext.define('Tutti.model.Voice', {
	extend: 'Ext.data.Model',

	requires: [
		'Tutti.model.Measure',
		'Tutti.model.Staff',
		'Tutti.model.Note',
		'Tutti.proxy.RestSync'
	],

	uses: [
		'Tutti.model.Note'
	],

	config: {
		identifier: 'uuid',

		proxy: {
			type: 'restsync',
			id: 'voices'
		},

		fields: [
			{
				name: 'measure_id',
				reference: 'Tutti.model.Measure'
			},
			{
				name: 'staff_id',
				reference: 'Tutti.model.Staff'
			}
		],

		hasMany: 'Tutti.model.Note'
	}
});
