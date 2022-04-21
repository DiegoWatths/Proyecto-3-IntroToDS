const {Schema, model} = require('mongoose')

const PostSchema = new Schema(
    {
        publisher: {type: Schema.Types.ObjectId, ref: 'User',  required: true,},
        content: {type: String, required: true},
        isComment: {type: Boolean, required: true},
        comments: [{
            type: Schema.Types.ObjectId, ref: 'Post',
            unique: false,
        }]
    }
)

module.exports = model('Post', PostSchema);