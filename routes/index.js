const express = require("express");
const router = express.Router();

const userRoute = require("./user");
const registerRoute = require("./register");

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Home Page",
            template: "index",
        });
    });

    router.use("/user", userRoute());
    router.use("/register", registerRoute());

    return router;
};
