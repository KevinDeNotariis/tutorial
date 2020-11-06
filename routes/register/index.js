const express = require("express");

const {
    validateAndSanitize,
    register,
} = require("../../controllers/userController");

const router = express.Router();

module.exports = () => {
    router.post("/", validateAndSanitize, register);

    return router;
};
