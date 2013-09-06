var Schema = require("mongoose").Schema;

module.exports = {
	name: 'measures',
	model: 'Measure',
	
	fields: {
		key: String,
		time: String,
		sketch_id: {
			type: Schema.Types.ObjectId,
			required: true
		}
	}
};