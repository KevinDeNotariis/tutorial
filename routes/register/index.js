const express = require("express");

const {
    validateAndSanitize,
    register,
} = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Register",
            template: "register",
        });
    });

    router.post("/", validateAndSanitize, register);

    return router;
};
