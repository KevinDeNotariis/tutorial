const express = require("express");
const routes = require("./routes");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

mongoose.connect("mongodb://localhost/trainingDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
    "/styles/css",
    express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
    "/styles/css",
    express.static(
        path.join(__dirname, "node_modules/bootstrap-select/dist/css")
    )
);
app.use(
    "/js",
    express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
    "/js",
    express.static(path.join(__dirname, "node_modules/jquery/dist"))
);
app.use(
    "/js",
    express.static(
        path.join(__dirname, "node_modules/bootstrap-select/dist/js")
    )
);

app.locals.siteName = "* Web Site Name *";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// caching disabled for every route
app.use(function (req, res, next) {
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
});

app.use("/", routes());

app.listen(3000, () => {
    console.log(`Server listening to port 3000`);
});
