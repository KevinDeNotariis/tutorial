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

const addDay = (req, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
        res.json({ message: errors.array() });
    } else {
        let accessToken = req.cookies.jwt;

        console.log("- Verifying access token");
        jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decode) => {
                if (err)
                    return res
                        .status(401)
                        .json({ message: "User not Authenticated" });

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
        );
    }
};

const addSet = (req, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
        res.json({ message: errors.array() });
    } else {
        console.log("- Searching in DB for the Day required");

        Exercise.findOne(
            { date: new Date(req.body.date) },
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
};
