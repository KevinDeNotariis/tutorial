const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SetSchema = new Schema({
    _id: false,
    weight: {
        type: Number,
        required: true,
    },
    reps: {
        type: Number,
        required: true,
    },
});

const ExerciseSchema = new Schema({
    _id: false,
    name: {
        type: String,
        required: true,
    },
    sets: {
        type: [SetSchema],
        required: true,
    },
});

const UserExerciseSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },

    date: {
        type: Date,
        required: true,
    },

    exercises: {
        type: [ExerciseSchema],
    },
});

module.exports = UserExerciseSchema;
