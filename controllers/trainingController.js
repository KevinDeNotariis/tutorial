const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const ExerciseSchema = require("../models/exerciseModel");

const Exercise = mongoose.model("Exercise", ExerciseSchema);

const validateAndSanitize = [
    check("exercise").trim().isLength({ min: 3 }).escape(),
    check("weight").trim().exists().isNumeric().escape(),
    check("reps").trim().exists().isNumeric().escape(),
    check("date").trim().isDate().escape(),
];

const validateDate = [check("date").trim().isDate().escape()];

function fetchDays(accessToken, callback) {
    const daysPlusExercises = [];
    const decode = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);

    Exercise.find({ user_id: decode._id })
        .sort("date")
        .exec((err, docs) => {
            if (err) console.log(err);
            docs.map((elem) => {
                daysPlusExercises.push({
                    day: new Date(elem.date).toISOString().split("T")[0],
                    exercises: elem.exercises,
                });
            });
            console.log("Fetch completed");
            callback(daysPlusExercises);
        });
}

const addDay = (req, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
        res.json({ message: errors.array() });
    } else {
        let accessToken = req.cookies.jwt;

        console.log("- Decoding access token");
        const decode = jwt.decode(accessToken, process.env.ACCESS_TOKEN_SECRET);

        console.log("- Access token verified, adding day into DB");

        const newExercise = new Exercise({
            user_id: decode._id,
            date: req.body.date,
        });
        newExercise.save((err, doc) => {
            if (err) {
                return res.status(400).json({ message: err });
            } else {
                return res.send(doc);
            }
        });
    }
};

const addSet = (req, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
        res.json({ message: errors.array() });
    } else {
        console.log("- Searching in DB for the Day required");

        const decode = jwt.decode(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET
        );
        Exercise.findOne(
            { user_id: decode._id, date: new Date(req.body.date) },
            (err, exerciseDay) => {
                if (err) return res.status(400).json({ message: err });

                if (!exerciseDay) {
                    console.log("Exercise Day not found in DB");
                    return res
                        .status(400)
                        .json({ message: "Exercise day not found" });
                } else {
                    console.log("- Day found in DB");
                    console.log("- Searching for the specified exercise");

                    Exercise.findOne(
                        {
                            date: new Date(req.body.date),
                            "exercises.name": req.body.exercise,
                        },
                        (err, exercise) => {
                            if (err)
                                return res.status(400).json({ message: err });
                            if (!exercise) {
                                console.log(
                                    "- Exercise not found, creating new one in the Document"
                                );
                                const exercise = {
                                    name: req.body.exercise,
                                    sets: [
                                        {
                                            weight: req.body.weight,
                                            reps: req.body.reps,
                                        },
                                    ],
                                };
                                Exercise.updateOne(
                                    { date: new Date(req.body.date) },
                                    { $push: { exercises: exercise } },
                                    (err) => {
                                        if (err)
                                            return res
                                                .status(400)
                                                .json({ message: err });

                                        console.log(
                                            "Exercise created in the requested day"
                                        );

                                        return res.send(req.body);
                                    }
                                );
                            } else {
                                console.log(
                                    "- Exercise found, adding the required set"
                                );
                                const set = {
                                    weight: req.body.weight,
                                    reps: req.body.reps,
                                };
                                Exercise.updateOne(
                                    {
                                        date: new Date(req.body.date),
                                        "exercises.name": req.body.exercise,
                                    },
                                    {
                                        $push: {
                                            "exercises.$.sets": set,
                                        },
                                    },
                                    (err) => {
                                        if (err)
                                            return res
                                                .status(400)
                                                .json({ message: err });

                                        console.log(
                                            "Set added to the exercise's sets already present"
                                        );
                                        return res.send(req.body);
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    }
};

module.exports = {
    validateDate,
    validateAndSanitize,
    addSet,
    addDay,
    fetchDays,
};
