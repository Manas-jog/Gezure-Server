var mongoose = require('mongoose');
Schema = mongoose.Schema;

BucketSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},

		videos: [String]
	}
);

module.exports = mongoose.model('Bucket', BucketSchema);