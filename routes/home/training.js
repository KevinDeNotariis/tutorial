const express = require("express");

const {
    fetchExercises,
    fetchDays,
    addSet,
    addDay,
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

    return router;
};
