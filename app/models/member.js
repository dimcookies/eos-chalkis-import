var mongoose = require('mongoose');

module.exports = mongoose.model('Member', {
	id: String,
    searchale: String,
    surname: String,
    code: String,
    firstname: String
});