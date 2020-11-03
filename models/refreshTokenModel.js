const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    hashRefreshToken: {
        type: String,
        require: true,
    },
    created_date: {
        type: Date,
        default: Date.now(),
    },
});

RefreshTokenSchema.methods.compareRefreshToken = (
    refreshToken,
    hashRefreshToken
) => {
    return bcrypt.compareSync(refreshToken, hashRefreshToken);
};

module.exports = RefreshTokenSchema;
