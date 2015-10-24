var mongoose = require('mongoose');

var attendant = new mongoose.Schema(
	{ 
		name: String,
		member_id: String
	}
);

module.exports = mongoose.model('event', {
	date : String,
	name : String,
	status: String,
	user: String,
	days: String,
 	attendants: [attendant]
});