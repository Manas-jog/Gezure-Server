var mongoose = require('mongoose');
Schema = mongoose.Schema;

BucketSchema = new Schema(
	{
		bucketId: {
			type: String,
			required: true
		},

		title: {
			type: String,
			required: true
		},

		videos: [String]
	}
);

Bucket = mongoose.model('Bucket', BucketSchema);