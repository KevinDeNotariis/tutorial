const express = require("express");

const {
    fetchDays,
    addSet,
    addDay,
    validateAndSanitize,
    validateDate,
} = require("../../controllers/trainingController");

const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        fetchDays(req.cookies.jwt, (daysPlusExercises) => {
            res.render("layout", {
                pageTitle: "Training",
                template: "training",
                style: "training",
                script: "training",
                daysPlusExercises: daysPlusExercises,
            });
        });
    });

    router.post("/addSet", validateAndSanitize, addSet);
    router.post("/addDay", validateDate, addDay);

    return router;
};
