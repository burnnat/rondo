var _ = require("lodash");
var mongoose = require("mongoose");

var fields = {
	title: {
		type: String,
		required: true
	}
};

var Model = mongoose.model('Sketch', new mongoose.Schema(fields));

module.exports = {
	init: function(app) {
		var me = this;
		
		app.get('/api/sketches', function(req, res) {
			return Model.find(function(err, records) {
				return err
					? me.failure(res, err)
					: me.success(res, {
						records: records
					});
			});
		});
		
		app.post('/api/sketches', function(req, res) {
			var record = new Model(me.getData(req.body));
			
			return record.save(function(err) {
				return err
					? me.failure(res, err)
					: me.success(res, {
						records: record
					});
			});
		});
		
		app.get('/api/sketches/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				return err
					? me.failure(res, err)
					: me.success(res, {
						records: record
					});
			});
		});
		
		app.put('/api/sketches/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				record.title = req.body.title;
				
				return record.save(function(err) {
					return err
						? me.failure(res, err)
						: me.success(res, {
							records: record
						});
				});
			});
		});
		
		app['delete']('/api/sketches/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				record.title = req.body.title;
				
				return record.remove(function(err) {
					return err
						? me.failure(res, err)
						: me.success(res);
				});
			});
		});
	},
	
	getData: function(record) {
		if (_.isArray(record)) {
			return record.map(this.getData, this);
		}
		
		var data = _.pick(record, _.keys(fields));
		
		if (record._id) {
			data.id = record._id;
		}
		
		return data;
	},
	
	success: function(res, data) {
		data = data || {};
		data.success = true;
		
		if (data.records) {
			data.records = this.getData(data.records);
		}
		
		return res.send(data);
	},
	
	failure: function(res, err) {
		console.error(err);
		return res.send({ success: false });
	},
	
	reset: function(callback) {
		Model.remove({}, callback);
	}
};