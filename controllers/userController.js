const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const UserSchema = require("../models/userModel");

const User = mongoose.model("User", UserSchema);

const validateAndSanitize = [
    check("email").trim().isEmail().normalizeEmail().escape(),
    check("password").trim().isLength({ min: 8 }).escape(),
];

const loginRequired = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({ message: "Not Authorized" });
    }
};

const register = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({ message: errors.array() });
    } else {
        const newUser = new User(req.body);
        newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
        newUser.save((err, user) => {
            if (err) {
                return res.status(400).json({ message: err });
            } else {
                user.hashPassword = undefined;
                return res.json(user);
            }
        });
    }
};

const login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({ message: errors.array() });
    } else {
        User.findOne(
            {
                email: req.body.email,
            },
            (err, user) => {
                if (err) throw err;
                if (!user) {
                    return res
                        .status(401)
                        .json({ message: "Authentication failed" });
                } else {
                    if (
                        !user.comparePassword(
                            req.body.password,
                            user.hashPassword
                        )
                    ) {
                        return res
                            .status(401)
                            .json({ message: "Authentication failed" });
                    } else {
                        user.hashPassword = undefined;
                        return res.json({
                            token: jwt.sign(
                                {
                                    email: user.email,
                                    _id: user.id,
                                },
                                "QuantumElectroDynamics4Real"
                            ),
                        });
                    }
                }
            }
        );
    }
};

module.exports = {
    validateAndSanitize,
    loginRequired,
    login,
    register,
};
