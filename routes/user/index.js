const express = require("express");
const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.send("Hello user");
    });

    router.get("/:id", (req, res) => {
        res.send(`Hello user with id: ${req.params.id}`);
    });

    return router;
};
