const express = require("express");
const router = express.Router();

const userRoute = require("./user");

module.exports = () => {
    router.get("/", (req, res) => {
        res.render("layout", {
            pageTitle: "Home Page",
            template: "index",
        });
    });

    router.use("/user", userRoute());

    return router;
};
