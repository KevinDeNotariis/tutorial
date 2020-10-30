const express = require("express");

const {
    validateSanitize,
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

    router.post("/", validateSanitize, register);

    return router;
};
