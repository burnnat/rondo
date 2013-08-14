var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Sketch = new Schema({
	title: {
		type: String,
		required: true
	}
});

var Model = mongoose.model('Sketch', Sketch);

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
			var record = new Model({
				title: req.body.title
			});
			
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
	
	success: function(res, data) {
		data = data || {};
		data.success = true;
		return res.send(data);
	},
	
	failure: function(res, err) {
		console.error(err);
		return res.send({ success: false });
	}
};