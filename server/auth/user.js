var mongoose = require("mongoose");

module.exports = mongoose.model(
	'User',
	new mongoose.Schema({
		name: String,
		providers: [
			new mongoose.Schema({
				_id: String,
				remoteID: String
			})
		]
	})
);