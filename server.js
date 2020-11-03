const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const routes = require("./routes");

mongoose.connect("mongodb://localhost/trainingDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//const app = require("https-localhost")();
const app = express();

app.set("trust proxy", 1);

/*
app.use(
    cookieSession({
        name: "session",
        keys: [
            "hgh4ht4309uwfdewrtevjnjnscnordds3",
            "klsjkl2i3i3ru8whcanguewr9w8rfshdn",
        ],
        maxAge: 24 * 60 * 60 * 1000,
    })
); */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
    "/styles/css",
    express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
    "/js",
    express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
    "/js",
    express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

app.locals.siteName = "* Web Site Name *";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

/*
app.use((req, res, next) => {
    console.log("checking auth");
    if (
        req.session.authorization &&
        req.session.authorization.split(" ")[0] === "JWT"
    ) {
        const token = jwt.verify(
            req.session.authorization.split(" ")[1],
            "QuantumElectroDynamics4Real",
            (err, decode) => {
                if (err) res.user = undefined;
                req.user = decode;
                console.log("user auth");
                next();
            }
        );
    } else {
        console.log("user not auth");
        req.user = undefined;
        next();
    }
});*/

app.use("/", routes());

app.listen(3000, () => {
    console.log(`Server listening to port 3000`);
});
