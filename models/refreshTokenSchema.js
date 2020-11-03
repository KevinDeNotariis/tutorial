const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        require: true,
    },
    created_date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = RefreshTokenSchema;
