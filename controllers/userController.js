const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const crypto = require("crypto");

const UserSchema = require("../models/userModel");
const RefreshTokenSchema = require("../models/refreshTokenModel");

const User = mongoose.model("User", UserSchema);
const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

const validateAndSanitize = [
    check("email").trim().isEmail().normalizeEmail().escape(),
    check("password").trim().isLength({ min: 8 }).escape(),
];

const getEncryptedToken = (refreshToken, callback) => {
    crypto.scrypt(
        process.env.REFRESH_TOKEN_CYPHER,
        process.env.REFRESH_TOKEN_SALT,
        24,
        (err, key) => {
            crypto.randomFill(new Uint8Array(16), (err, iv) => {
                const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
                callback(
                    iv +
                        " " +
                        cipher.update(refreshToken, "utf8", "hex") +
                        cipher.final("hex")
                );
            });
        }
    );
};

const getDecryptedToken = (encryptedRefreshToken, callback) => {
    crypto.scrypt(
        process.env.REFRESH_TOKEN_CYPHER,
        process.env.REFRESH_TOKEN_SALT,
        24,
        (err, key) => {
            let iv = new Uint8Array(
                encryptedRefreshToken.split(" ")[0].split(",")
            );
            const actualToken = encryptedRefreshToken.split(" ")[1];
            const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
            callback(
                decipher.update(actualToken, "hex", "utf8") +
                    decipher.final("utf8")
            );
        }
    );
};

const logout = (req, res) => {
    let accessToken = req.cookies.jwt;

    console.log("- Logging out... verifying access token");
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err)
            return res.status(401).json({ message: "User not Authenticated" });

        console.log("- Access token verified, removing refresh token from DB");
        RefreshToken.deleteOne({ user_id: decode._id }, (err) => {
            if (err) return res.status(400).json({ message: err });

            console.log("- Refresh Token removed successfully");
            console.log("- Removing associated cookie");
            res.cookie("jwt", { maxAge: 0 });
            return res.redirect("/");
        });
    });
};

const loginRequired = (req, res, next) => {
    let accessToken = req.cookies.jwt;

    if (!accessToken) {
        return res.status(401).json({ message: "Not Authorized User" });
    }
    console.log("- Checking Authorization");
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (!err) {
            console.log("user authorized");
            next();
        } else {
            console.log("- There is a problem in the Authentication");
            if (err.name !== "TokenExpiredError") {
                return res.status(401).json({ message: "Not Authorized User" });
            } else {
                console.log("- Access token has expired");

                let decodedPayload = jwt.decode(
                    accessToken,
                    process.env.ACCESS_TOKEN_SECRET
                );
                console.log(
                    "- Checking if Refresh token associated to the user is in database"
                );
                RefreshToken.findOne(
                    {
                        user_id: decodedPayload._id,
                    },
                    (err, refreshTokenDocument) => {
                        if (err) {
                            return res.status(400).json({ message: err });
                        } else if (!refreshTokenDocument) {
                            console.log("No refresh token found");
                            return res.redirect("/login");
                        } else {
                            console.log("- Refresh Token Found");
                            console.log(
                                "- Checking if it coincide with the one in the access token"
                            );
                            if (
                                refreshTokenDocument.encryptedRefreshToken !==
                                decodedPayload.refresh
                            ) {
                                console.log(
                                    "Refresh tokens do not coincide, login again"
                                );
                                return res.redirect("/login");
                            } else {
                                console.log(
                                    "- Refresh tokens coincide, checking validity of refresh token"
                                );
                                getDecryptedToken(
                                    refreshTokenDocument.encryptedRefreshToken,
                                    (decryptedRefreshToken) => {
                                        jwt.verify(
                                            decryptedRefreshToken,
                                            process.env.REFRESH_TOKEN_SECRET,
                                            (err, refreshPayloadDecoded) => {
                                                if (err) {
                                                    console.log(
                                                        "- Refresh token is not valid, maybe it is expired"
                                                    );
                                                    return res.redirect(
                                                        "/login"
                                                    );
                                                } else {
                                                    console.log(
                                                        "- Valid refresh token found, generating new Access Token"
                                                    );
                                                    let newPayloadAccess = {
                                                        _id: decodedPayload._id,
                                                        refresh:
                                                            refreshTokenDocument.encryptedRefreshToken,
                                                        exp:
                                                            Math.floor(
                                                                Date.now() /
                                                                    1000
                                                            ) +
                                                            Number(
                                                                process.env
                                                                    .ACCESS_TOKEN_LIFE
                                                            ),
                                                    };
                                                    let newAccessToken = jwt.sign(
                                                        newPayloadAccess,
                                                        process.env
                                                            .ACCESS_TOKEN_SECRET,
                                                        {
                                                            algorithm: "HS256",
                                                        }
                                                    );
                                                    res.cookie(
                                                        "jwt",
                                                        newAccessToken,
                                                        {
                                                            //secure: true,
                                                            httpOnly: true,
                                                        }
                                                    );
                                                    console.log(
                                                        "New Access Token generated and sent to the client"
                                                    );
                                                    next();
                                                }
                                            }
                                        );
                                    }
                                );
                            }
                        }
                    }
                );
            }
        }
    });
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
                        let payloadRefresh = {
                            _id: user.id,
                            exp:
                                Math.floor(Date.now() / 1000) +
                                Number(process.env.REFRESH_TOKEN_LIFE),
                        };

                        let refreshToken = jwt.sign(
                            payloadRefresh,
                            process.env.REFRESH_TOKEN_SECRET,
                            { algorithm: "HS256" }
                        );

                        getEncryptedToken(
                            refreshToken,
                            (encryptedRefreshToken) => {
                                let payloadAccess = {
                                    _id: user.id,
                                    refresh: encryptedRefreshToken,
                                    exp:
                                        Math.floor(Date.now() / 1000) +
                                        Number(process.env.ACCESS_TOKEN_LIFE),
                                };

                                let accessToken = jwt.sign(
                                    payloadAccess,
                                    process.env.ACCESS_TOKEN_SECRET,
                                    { algorithm: "HS256" }
                                );

                                RefreshToken.findOne(
                                    { user_id: user.id },
                                    (err, tokenUser) => {
                                        if (err) {
                                            return res
                                                .status(400)
                                                .json({ message: err });
                                        } else {
                                            if (!tokenUser) {
                                                let newToken = new RefreshToken(
                                                    {
                                                        user_id: user.id,
                                                    }
                                                );
                                                newToken.encryptedRefreshToken = encryptedRefreshToken;
                                                newToken.save((err, token) => {
                                                    if (err) {
                                                        return res
                                                            .status(400)
                                                            .json({
                                                                message: err,
                                                            });
                                                    } else {
                                                        console.log(
                                                            "Refresh token saved successfully"
                                                        );
                                                    }
                                                });
                                            } else {
                                                RefreshToken.updateOne(
                                                    { user_id: user.id },
                                                    {
                                                        $set: {
                                                            encryptedRefreshToken: encryptedRefreshToken,
                                                        },
                                                    },
                                                    (err) => {
                                                        if (err)
                                                            return res
                                                                .status(400)
                                                                .json({
                                                                    message: err,
                                                                });

                                                        console.log(
                                                            "Refresh token updated successfully"
                                                        );
                                                    }
                                                );
                                            }
                                        }
                                    }
                                );
                                res.cookie("jwt", accessToken, {
                                    //secure: true,
                                    httpOnly: true,
                                });
                                res.redirect("/home");
                            }
                        );
                    }
                }
            }
        );
    }
};

module.exports = {
    validateAndSanitize,
    logout,
    loginRequired,
    login,
    register,
};
