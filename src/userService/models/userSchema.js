const {Schema, model} = require('mongoose')
const bcrypt = require('bcrypt');

const UserSchema = new Schema(
    {
        username: {type: String,  required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, required: true},
        friends: [{
            type: Schema.Types.ObjectId, ref: 'User',
            unique: false,
        }]
    }
)

UserSchema.methods.encryptPassword = async function (password){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

module.exports = model('User', UserSchema);