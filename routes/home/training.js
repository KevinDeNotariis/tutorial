const express = require("express");

const {
  fetchExercises,
  fetchDays,
  addSet,
  addDay,
  deleteSet,
  deleteDay,
  validateAndSanitize,
  validateDate,
} = require("../../controllers/trainingController");

const router = express.Router();

module.exports = () => {
  router.get("/", (req, res) => {
    const exercises = fetchExercises();
    fetchDays(req.cookies.jwt, (daysPlusExercises) => {
      res.render("layout", {
        pageTitle: "Training",
        template: "training",
        style: "training",
        script: "training",
        daysPlusExercises: daysPlusExercises,
        exercises: exercises,
      });
    });
  });

  router.post("/addSet", validateAndSanitize, addSet);
  router.post("/addDay", validateDate, addDay);

  router.delete("/deleteSet", deleteSet);
  router.delete("/deleteDay", deleteDay);

  return router;
};
