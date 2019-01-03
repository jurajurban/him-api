var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var item = new Schema({
  parent: Schema.Types.ObjectId,
  name: {type: String, required: true},
  description: String,
  imgUrl: String,
  type: String,
  fullPath:[Schema.Types.ObjectId],
  tags: [{ tag: String }]
});

module.exports = mongoose.model('Item', item);