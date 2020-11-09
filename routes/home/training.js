const express = require("express");

const {
    addSet,
    addDay,
    validateAndSanitize,
    validateDate,
} = require("../../controllers/trainingController");

const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Training",
            template: "training",
            style: "training",
            script: "training",
        });
    });

    router.post("/addSet", validateAndSanitize, addSet);
    router.post("/addDay", validateDate, addDay);

    return router;
};
