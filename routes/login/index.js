const express = require("express");

const { login, isLogged } = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
    router.get("/", isLogged, (req, res) => {
        res.render("layout", {
            pageTitle: "Login",
            template: "login",
        });
    });

    router.post("/", login);

    return router;
};
