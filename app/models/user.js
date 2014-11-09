var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
	userId: {
		type: String,
		required: true
	},

	devices: [String],

	currentDevice: String,

	buckets: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Bucket'
		}
	]
});

module.exports = mongoose.model('User', UserSchema);