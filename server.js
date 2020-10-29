const express = require("express");
const routes = require("./routes");
const path = require("path");

const app = express();

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

app.use("/", routes());

app.listen(3000, () => {
    console.log(`Server listening to port 3000`);
});
