const express = require("express");
const router = express.Router();

const userRoute = require("./user");
const registerRoute = require("./register");
const loginRoute = require("./login");

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Home Page",
            template: "index",
        });
    });

    router.use("/user", userRoute());
    router.use("/register", registerRoute());
    router.use("/login", loginRoute());

    return router;
};
