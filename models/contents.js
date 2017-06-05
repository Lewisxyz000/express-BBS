var mongoose  =require("mongoose");

var boardSchema = mongoose.Schema({
    title: String,
    contents: String,
    date: {type: Date, default: Date.now},
    deleted: {type: Boolean, default: false},
    writer: {type: String, default: "Anonymous"}
});
var contents =  mongoose.model('BoardContents', boardSchema);

module.exports = contents;