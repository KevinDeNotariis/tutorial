const express = require("express");

const { logout } = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Logout",
            template: "logout",
            style: "logout",
        });
    });

    router.post("/", logout);

    return router;
};
