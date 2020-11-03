const express = require("express");

const { loginRequired } = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Home",
            template: "home",
        });
    });

    return router;
};
