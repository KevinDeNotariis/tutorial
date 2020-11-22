const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const ExerciseSchema = require("../models/exerciseModel");

const Exercise = mongoose.model("Exercise", ExerciseSchema);

const validateAndSanitize = [
  check("exercise").trim().isLength({ min: 3 }).escape(),
  check("weight").trim().exists().isNumeric().escape(),
  check("reps").trim().exists().isNumeric().escape(),
  check("date").trim().isDate().escape(),
];

const validateDate = [check("date").trim().isDate().escape()];

function fetchExercises() {
  return JSON.parse(fs.readFileSync("exercisesList.json"));
}

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

    console.log(
      "- Access token verified, checking if this day already exists in DB"
    );

    Exercise.findOne(
      { user_id: decode._id, date: req.body.date },
      (err, doc) => {
        if (err) return res.status(400).json({ message: err });
        if (doc) {
          console.log("Day already exists");
          return res.json({ message: "Already exists" });
        } else {
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

    const decode = jwt.decode(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
    Exercise.findOne(
      { user_id: decode._id, date: new Date(req.body.date) },
      (err, exerciseDay) => {
        if (err) return res.status(400).json({ message: err });

        if (!exerciseDay) {
          console.log("Exercise Day not found in DB");
          return res.status(400).json({ message: "Exercise day not found" });
        } else {
          console.log("- Day found in DB");
          console.log("- Searching for the specified exercise");

          Exercise.findOne(
            {
              user_id: decode._id,
              date: new Date(req.body.date),
              "exercises.name": req.body.exercise,
            },
            (err, exercise) => {
              if (err) return res.status(400).json({ message: err });
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
                  { user_id: decode._id, date: new Date(req.body.date) },
                  { $push: { exercises: exercise } },
                  (err) => {
                    if (err) return res.status(400).json({ message: err });

                    console.log("Exercise created in the requested day");

                    return res.send(req.body);
                  }
                );
              } else {
                console.log("- Exercise found, adding the required set");
                const set = {
                  weight: req.body.weight,
                  reps: req.body.reps,
                };
                Exercise.updateOne(
                  {
                    user_id: decode._id,
                    date: new Date(req.body.date),
                    "exercises.name": req.body.exercise,
                  },
                  {
                    $push: {
                      "exercises.$.sets": set,
                    },
                  },
                  (err) => {
                    if (err) return res.status(400).json({ message: err });

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

const deleteSet = (req, res) => {
  console.log(
    "- Decoding payload of JWT of user to match the id in the exercise collection"
  );
  const payload = jwt.decode(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
  console.log(`- User id : ${payload._id}`);
  console.log("- Searching ad removing the following set from the DB:");
  console.log(req.body);

  /*
      Since mongoDB do not allow to $pull only one element
      in an array with multiple coincident elements, we first
      store the sets array corresponding to the required one.
      Then we will pull out the required element and then we 
      will update the array in the DB by putting the newly 
      created one in place of the old sets array.
  */

  Exercise.findOne(
    {
      user_id: payload._id,
      date: new Date(req.body.date),
      "exercises.name": req.body.exercise,
    },
    (err, doc) => {
      let newSets = computeNewSetsArrayWithoutGivenSet(
        doc,
        req.body.exercise,
        req.body.weight,
        req.body.reps
      );

      Exercise.updateOne(
        {
          user_id: payload._id,
          date: new Date(req.body.date),
          "exercises.name": req.body.exercise,
        },
        {
          $set: {
            "exercises.$.sets": newSets,
          },
        },
        (err) => {
          if (err) return res.status(400).json({ message: err });
          console.log("Set removed correctly");
          return res.send("ok");
        }
      );
    }
  );
};

const computeNewSetsArrayWithoutGivenSet = (
  doc,
  reqBodyExercise,
  reqBodyWeight,
  reqBodyReps
) => {
  let sets = [];
  for (exercise in doc.exercises) {
    console.log("elem in doc.exercises: " + doc.exercises[exercise]);
    if (doc.exercises[exercise].name === reqBodyExercise) {
      console.log("exercise needed: " + doc.exercises[exercise].sets);
      sets = doc.exercises[exercise].sets;
      break;
    }
  }

  let index = 0;
  for (let set = 0; set < sets.length; set++) {
    if (
      sets[set].weight ===
        (reqBodyWeight === "" ? null : Number(reqBodyWeight)) &&
      sets[set].reps === (reqBodyReps === "" ? null : Number(reqBodyReps))
    ) {
      index = set;
      break;
    }
  }
  sets.splice(index, 1);

  return sets;
};

const deleteDay = (req, res) => {
  console.log("- Decoding user token to extract user_id");
  const payload = jwt.decode(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);

  console.log("- Retrieving the day from DB and deleting it");
  Exercise.deleteOne(
    {
      user_id: payload._id,
      date: new Date(req.body.date),
    },
    (err) => {
      if (err) return res.send({ message: err });
      console.log("Element deleted correctly");
      return res.send("ok");
    }
  );
};

module.exports = {
  validateDate,
  validateAndSanitize,
  deleteDay,
  deleteSet,
  addSet,
  addDay,
  fetchDays,
  fetchExercises,
};
