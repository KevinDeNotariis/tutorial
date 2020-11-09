const express = require("express");

const trainingRoute = require("./training");

const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Home",
            template: "home",
            style: "home",
        });
    });

    router.use("/training", trainingRoute());

    return router;
};
