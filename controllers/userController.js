const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const UserSchema = require("../models/userModel");
const RefreshTokenSchema = require("../models/refreshTokenSchema");

const User = mongoose.model("User", UserSchema);
const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

const validateAndSanitize = [
  check("email").trim().isEmail().normalizeEmail().escape(),
  check("password").trim().isLength({ min: 8 }).escape(),
];

const isLogged = (req, res, next) => {
  let accessToken = req.cookies.jwt;
  console.log("checking if user is already logged in");

  if (!accessToken) {
    console.log("user is not logged in");
    next();
  }
  jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decode) => {
      if (err) {
        console.log(err);
        console.log("user should login again");
        next();
      } else {
        console.log("user is already logged in");
        res.redirect("/home");
      }
    }
  );
};

const loginRequired = (req, res, next) => {
  let accessToken = req.cookies.jwt;

  if (!accessToken) {
    return res.status(401).json({ message: "Not Authorized" });
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (!err) {
      console.log("everything fine, user is logged in");
      next();
    } else {
      console.log("- something wrong in auth");
      if (err.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "Not Authorized" });
      } else {
        console.log("- access token is expired");
        let decodedPayload = jwt.decode(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        RefreshToken.findOne(
          {
            user_id: decodedPayload._id,
          },
          (err, refreshToken) => {
            if (err) {
              return res.status(400).json({ message: err });
            } else {
              console.log(`- verifying if refresh token is active`);
              jwt.verify(
                refreshToken.token,
                process.env.REFRESH_TOKEN_SECRET,
                (err, refreshDecode) => {
                  if (err) {
                    res.redirect("/login");
                  } else {
                    console.log(
                      `- refresh token is active and creating new access token`
                    );
                    User.findOne(
                      {
                        _id: refreshToken.user_id,
                      },
                      (err, user) => {
                        if (err) {
                          return res.status(400).json({ message: err });
                        }
                        let newPayloadAccess = {
                          email: user.email,
                          _id: user.id,
                          exp:
                            Math.floor(Date.now() / 1000) +
                            Number(process.env.ACCESS_TOKEN_LIFE),
                        };
                        let newAccessToken = jwt.sign(
                          newPayloadAccess,
                          process.env.ACCESS_TOKEN_SECRET,
                          {
                            algorithm: "HS256",
                          }
                        );
                        res.cookie("jwt", newAccessToken, {
                          //secure: true,
                          httpOnly: true,
                        });
                        next();
                      }
                    );
                  }
                }
              );
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
          return res.status(401).json({ message: "Authentication failed" });
        } else {
          if (!user.comparePassword(req.body.password, user.hashPassword)) {
            return res.status(401).json({ message: "Authentication failed" });
          } else {
            let payloadAccess = {
              email: user.email,
              _id: user.id,
              exp:
                Math.floor(Date.now() / 1000) +
                Number(process.env.ACCESS_TOKEN_LIFE),
            };

            let accessToken = jwt.sign(
              payloadAccess,
              process.env.ACCESS_TOKEN_SECRET,
              {
                algorithm: "HS256",
              }
            );

            let payloadRefresh = {
              email: user.email,
              _id: user.id,
              exp:
                Math.floor(Date.now() / 1000) +
                Number(process.env.REFRESH_TOKEN_LIFE),
            };
            let refreshToken = jwt.sign(
              payloadRefresh,
              process.env.REFRESH_TOKEN_SECRET,
              {
                algorithm: "HS256",
              }
            );

            RefreshToken.findOne({ user_id: user.id }, (err, tokenUser) => {
              if (err) {
                return res.status(400).json({ message: err });
              } else {
                if (!tokenUser) {
                  let newToken = new RefreshToken({
                    user_id: user.id,
                    token: refreshToken,
                  });
                  newToken.save((err, token) => {
                    if (err) {
                      return res.status(400).json({ message: err });
                    } else {
                      console.log("Refresh token saved successfully");
                    }
                  });
                } else {
                  RefreshToken.updateOne(
                    { user_id: user.id },
                    { $set: { token: refreshToken } },
                    (err, token) => {
                      if (err) {
                        return res.status(400).json({ message: err });
                      } else {
                        console.log("Refresh token updated successfully");
                      }
                    }
                  );
                }
              }
            });

            res.cookie("jwt", accessToken, {
              //secure: true,
              httpOnly: true,
            });
            res.redirect("/home");
          }
        }
      }
    );
  }
};

module.exports = {
  validateAndSanitize,
  isLogged,
  loginRequired,
  login,
  register,
};
