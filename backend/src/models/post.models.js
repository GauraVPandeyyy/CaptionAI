const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    image : String,
    caption : String,
    
})

const Post = mongoose.model('PostData', postSchema);

module.exports = Post;