# Introduction

In this course we will be building a simple website called _Handle your Training Sessions_ in which most of the features involving the creation of a website will be explored, both _back-end_ and _front-end_, using **Node.js**, **Express.js** and **MongoDB**.

## Requirements

I'm going to assume that the reader is (somewhat) familiar with:

-   Javascript (ES6) ;
-   HTML ;
-   JQuery ;
-   npm .

## Tools

I'm going to use VSCode as the editor for the course, both because of its wholesome number of functionalities and its built-in terminals.

# First Steps

## Initialize Node

In order to start our project, first open the terminal integrated in VSCode and run the following command:

```bash
npm init
```

There will be asked some questions and we can answer them as we see fit, I will leave almost all of them blank, I'll just write `server.js` when asked about the `entry point` (the default would be `index.js`, but we will use `server.js` instead. note: this is completely arbitrary). I'll also write my name in the `author` entry.

This will create a `package.json` file in the root folder of the following form:

```json
{
    "name": "test_1",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "kevin de notariis",
    "license": "ISC"
}
```

## Add main dependencies

We now need to install `express` by typing in the terminal:

```bash
npm i express
```

This will create a `node_module` folder and a `package-lock.json`. The `node_module` folder will store all the installed modules, while the `package-lock.json` will be used by `npm` to check the correct versions and compatibilities of all the modules used.

## Create and start the server

-   In order to start a server, create a `server.js` file in the root directory.

-   Open it and type:

    ```javascript
    const express = require("express");
    ```

    this will simply import the express module and "store" it into a variable called `express`.

-   Define the actual `app`, below the line just written, type:

    ```javascript
    const app = express();
    ```

-   Finally, to start the server, the `app` just needs to listen to a given port, and this can be done by employing the method `.listen(PORT, callback)` of `app`, taking the PORT number as first argument and a callaback function. E.g. :ù

    ```javascript
    app.listen(3000, () => {
        console.log("Server listening to port 3000");
    });
    ```

-   We can save the file and run the server by typing in the terminal:

    ```bash
    node server
    ```

    and we will see the following output in the terminal:

    ```
    Server listening to port 3000
    ```

> **Note:** We can stop the server by hitting `Ctrl-C`.

At this point our root directory will have the following structure:

```
.
├── _node_modules
│   └── ...
├── package-lock.json
├── package.json
└── server.js
```

# Adding Routes

## `app.use()`

Now that we have a server which will listen to the port `3000`, we can start to add some routes. The syntax is pretty straightforward, in `server.js`, before `app.listen` type:

```javascript
app.use("/", (req, res) => {
    res.send("Hello World");
});
```

Now, if we start the server by typing `node server` and we open the browser and navigate to `http://localhost:3000/`, we will see a "Hello World" response onto the we page sent by our route.

> **_Note:_**
>
> We can make use of the `scripts` entry in the `package.json` to run our server. Open `package.json` and substitute the following entry:
>
> ```json
> "scripts": {
>             "test": "echo \"Error: no test specified\" && exit 1"
>         },
> ```
>
> with the following:
>
> ```json
> "scripts": {
>             "start": "node server"
>         },
> ```
>
> Now, in the terminal, in order to start the server we will just type:
>
> ```bash
> npm start
> ```
>
> <br>

## `app.get()`

The middleware `.use` will match every path containing '`/`', namely every possible route (in fact, one can navigate to, for example, `http://localhost:3000/hello` and we will still get the "Hello world" response)

If we would like to match only the wanted route, we should use the HTTP verb `get` as follows:

```javascript
app.get("/", (req, res) => {
    res.send("Hello World");
});
```

If we now try to go to `http://localhost:3000/hello` we will get a

```
Cannot GET /hello
```

response.

We can now add an arbitrary number of routes, namely we can add the following:

```javascript
app.get("/user", (req, res) => {
    res.send("Hello user page");
});

app.get("/user/:id", (req, res) => {
    res.send(`Hello user with id: ${req.params.id}`);
});
```

If we restart the server, now we can navigate to `http://localhost:3000/user` and we will get the response:

```
Hello user page
```

we can also navigate to whatever route we want from user, examples would be

`http://localhost:3000/user/222`

`http://localhost:3000/user/333`

and as response we will get, respectively:

```
Hello user with id: 222
Hello user with id: 333
```

What we are employing here is a <u>dynamic route</u>. The parameter `id` in the route, can be accessed in `req.params` which stores the parameters in the request.

> **_Note:_**
>
> Every time we change the server, we have to stop it and then re-run:
>
> ```bash
> npm start
> ```
>
> However, we can install a package which will allow us to make changes in the server files and upon saving the file, the server will restart automatically. This module is called `nodemon`, and we can type in the terminal:
>
> ```bash
> npm i nodemon -D
> ```
>
> where the `-D` means that we are saving this module under the development dependencies, which will not be carried over in the build. We also modify the `scripts` element in the `package.json` as follows:
>
> ```json
> "scripts": {
>                "start": "nodemon server"
>            },
> ```
>
> <br>

If we now make some changes in the server file, i.e. we add a route `/hello` and we save the file, we will see the following prompt from `nodemon`:

```
[nodemon] restarting due to changes...
[nodemon] starting `node server.js`
Server listening to port 3000
```

and we will readly be able to navigate to the newly created route.

At this point, the file `server.js` should look like this:

```javascript
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/user", (req, res) => {
    res.send("Hello user page");
});

app.get("/user/:id", (req, res) => {
    res.send(`Hello user with id: ${req.params.id}`);
});

app.listen(3000, () => {
    console.log(`Server listening to port 3000`);
});
```

while the `package.json` as follows:

```json
{
    "name": "test_1",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "start": "nodemon server"
    },
    "author": "kevin de notariis",
    "license": "ISC",
    "dependencies": {
        "express": "^4.17.1"
    },
    "devDependencies": {
        "nodemon": "^2.0.6"
    }
}
```

# More Structure to the Project

It is good practice to not clutter the `server.js` file with all the routes of the application by moving them into their own folder and then use the built-in `Router` class to indeed create modular and mountable route handlers.

Let's then create a `routes` folder in the main directory and a `index.js` which will be the entry point. The folder structure will then look like this:

```
.
├── _node_modules
│   └── ...
├── _routes
│   └── index.js
├── package-lock.json
├── package.json
└── server.js
```

Let's now open the `index.js` and write the following:

```js
const express = require("express");
const router = express.Router();

module.exports = () => {
    router.get("/", (req, res) => {
        res.send("Hello World");
    });

    app.get("/user", (req, res) => {
        res.send("Hello user page");
    });

    app.get("/user/:id", (req, res) => {
        res.send(`Hello user with id: ${req.params.id}`);
    });

    return router;
};
```

We can now delete the routes in `server.js` and instead add the following:

```js
...
const routes = require('./routes');
...
app.use('/', routes());
...

```

The server will run exactly as before, but we managed to decouple the routes with the actual server and we will be able to add more routes in a more structured way.

## Moving user route into it's own folder

Now that we have a route folder, we can create another folder inside it called `user` and then create an `index.js` file inside it. The root folder structure should be as follows:

```
.
├── _node_modules
│   └── ...
├── _routes
│   ├── _user
│   │  └── index.js
│   └── index.js
├── package-lock.json
├── package.json
└── server.js
```

In `/routes/user/index.js` write:

```js
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
```

while in the `/routes/index.js` just remove the routes for `/user` and `user/:id` and add:

```js
...
const userRoute = require("./user");

module.exports = () => {
    ...
    router.use("/user", userRoute());

    return router;
}
```

Now everything should work as before, we can navigate to `http://localhost:3000/user` as before and to any other route in `/user`.

# Render an HTML Page

Now that we have set-up some routes, we should consider rendering some actual HTML page. Since we want a dynamic website, namely dynamic webpages, we need to employ a **view engine.**

In this regard, we are going to use `ejs`, to see the documentation check the website https://ejs.co.

But how do we tell express to employ this view engine?

First, we need to install the `ejs` module:

```bash
npm i ejs
```

Once completed, we can open up the `server.js` file and add the following code:

```js
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
```

> **_Notes:_**
>
> -   In the first line we are requiring the node path module used in the last line;
> -   The second line will tell express to consider `ejs` as the chosen view engine;
> -   The third line instructs express to look for the views in the `./views` folder (in other words, when we will call `res.render()` in our routes, the root folder will be `./views/`), which will be in the root directory and that we are going to create and populate soon.
>     <br> <br>

Our `server.js` will look like:

```js
const express = require("express");
const routes = require("./routes");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use("/", routes());

app.listen(3000, () => {
    console.log(`Server listening to port 3000`);
});
```

Let's now create the `views` folder in root directory and a `index.ejs` in it.

The root folder structure should now look like this:

```
.
├── _node_modules
│   └── ...
├── _routes
│   ├── _user
│   │   └── index.js
│   └── index.js
├── _views
│   └── index.ejs
├── package-lock.json
├── package.json
└── server.js
```

Let's open now the `views/index.ejs` file and simply write the base HTML code below:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Project Title</title>
    </head>

    <body>
        <header>
            <h1>Hello Home Page</h1>
        </header>
    </body>
</html>
```

Open up now the `routes/index.js` file and instead of the line

```js
res.send("Hello World");
```

we are going to put the following code:

```js
res.render("./");
```

And upon saving all the files and opening the browser at `http://localhost:3000`, we should see the rendered HTML page with "Hello Home Page".

## Further Step - Pass parameters from routes to views.

If we want to render some dynamic parameters in `views/index.ejs`, we can pass them in an object as a second argument to the `res.render()` call in `routes/index.js` file. Let's open it and modify the line:

```js
res.render("./");
```

to:

```js
res.render("./", {
    pageTitle: "Home Page",
    header: "Home Page Header",
});
```

These parameters can be accessed in `views/index.ejs` by employing the `ejs` syntax, namely as follows

<!-- prettier-ignore -->
```html
<%= pageTitle %>
<%= header %>
```

In particular, we can replace the hard-coded `title` and `h1` in `views/index.ejs` with the above lines, obtaining:

```html
<!DOCTYPE html>
<html>
    <head>
        <title><%= pageTitle %></title>
    </head>

    <body>
        <header>
            <h1><%= header %></h1>
        </header>
    </body>
</html>
```

Unpon saving and refreshing the browser we should be able to see the changes.

# Creating a Layout for our Webpages

In order to not repeat everytime the same HTML code, we can create a common layout and then define different "components" (in a subdirectory called `pages`) which will be "mounted" when needed.

In `views` let's create a `layout` folder and move in there the `index.ejs` file. The structure should look like this:

```
.
├── _node_modules
│   └── ...
├── _routes
│   ├── _user
│   │   └── index.js
│   └─ index.js
├── _views
│   └── _layout
│       └── index.ejs
├── package-lock.json
├── package.json
└── server.js
```

Also, change in the `routes/index.js` file the `.render()` method by taking into account the change of the `index.ejs`, but also the fact that we will dynamically pass to the layout index page the actual page that we would like to render, namely (we will also remove the "header" key):

```js
res.render("layout", {
    pageTitle: "Home Page",
    template: "index",
});
```

Now, open up `views/layout/index.ejs` and modify it as follows:

```html
<!DOCTYPE html>
<html>
    <head>
        <title><%= pageTitle %></title>
    </head>

    <body>
        <header>
            <h1>Welcome to the <%= pageTitle %></h1>
        </header>

        <%- include(`../pages/${template}`) %>
    </body>
</html>
```

> With the `<%- include('../pages/${template}') %>` we are telling `ejs` to take everything in the file `../pages/${template}` and put it in there unescaped.

Create now the `pages` in `views` with a `index.ejs` file in there.

The folder structure should look like:

```
.
├── _node_modules
│   └── ...
├── _routes
│   ├── _user
│   │   └── index.js
│   └─ index.js
├── _views
│   ├── _layout
│   │   └── index.ejs
│   └── _pages
│       └── index.ejs
├── package-lock.json
├── package.json
└── server.js
```

In `views/pages/index.ejs` let's write the following:

```html
<div>
    <h2>h2 in there!</h2>
</div>
```

After saving the files we should see the new `h2` in the Home Page.

## Home Page Creation

Now that we have a base structure for the project, let's add some HTML code to render a nice looking front home page. We are going to use `Bootstrap`, so let's install it.

### Bootstrap in Express

```bash
npm i bootstrap
```

Bootstrap also uses `jquery` so we need to install it too:

```bash
npm i jquery
```

This will furnish us with lots of cool css and components to ease the front-end building process.

In for us to use the bootstrap `CSS` and components, we need to tell express where to find the static files. In this regard, let's create a `public` folder, and inside it a `styles` and a `js` folder. Inside `public/styles` create a `css` folder. The directory structure should look like:

```
.
├── _node_modules
│   └── ...
├── _public
│   ├── _styles
│   │   └── css
│   └─ js
├── _routes
│   ├── _user
│   │   └── index.js
│   └─ index.js
├── _views
│   ├── _layout
│   │   └── index.ejs
│   └── _pages
│       └── index.ejs
├── package-lock.json
├── package.json
└── server.js
```

In `server.js` let's add:

```js
app.use(express.static(path.join(__dirname, "public")));
```

Since the `CSS` we will be using from bootstrap is in `node_modules/bootstrap/dist/css` and the `javascript` is in `node_modules/bootstrap/dist/js`, we need to tell express to consider these as if it were in the newly created `public` folder. We also need to tell express where to find `jquery`, so in `server.js` write:

```js
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
```

### Serve Bootstrap's CSS and JS to HTML

Let's create `components` folder inside `layout` in which we will be storing the components commonly used by evey page, then create a `scripts.ejs` file inside it. The folder structure should now look like:

```
.
├── _node_modules
│   └── ...
├── _public
│   ├── _styles
│   │   └── css
│   └─ js
├── _routes
│   ├── _user
│   │   └── index.js
│   └─ index.js
├── _views
│   ├── _layout
│   │   ├── _components
│   │   │   └── scripts.ejs
│   │   └── index.js
│   └── _pages
│       └── index.ejs
├── package-lock.json
├── package.json
└── server.js
```

In `scripts.ejs` add the following script tags:

```js
<script language="javascript" src="/js/jquery.slim.min.js"></script>
<script language="javascript" src="/js/bootstrap.bundle.min.js"></script>
```

and then in `views/layout/index.ejs` we should serve this `scripts` file and add the `CSS` link. This `index.ejs` should then look like this:

<!-- prettier-ignore -->
```html
<!DOCTYPE html>
<html>
    <head>
        <!-- Meta tags -->
        <meta charset="utf-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="/styles/css/bootstrap.min.css" />

        <title><%= pageTitle %></title>
    </head>

    <body>
        <header>
            <h1>Welcome to the <%= pageTitle %></h1>
        </header>

        <%- include(`../pages/${template}`) %> 
        
        <%-include('./components/scripts') %>
    </body>
</html>
```

> **_Note:_**
>
> We have added also some meta tags which are recommended by `bootstrap`. For more information visit https://getbootstrap.com/.

Everything should now be set correctly, and we should be able to proceed with the actual implementation of some HTML code using `bootstrap`.

### Footer

Let's add a `footer.ejs` component in `views/layout/components`. Open it up and add the following code:

```html
<footer class="container fixed-bottom">
    <div class="text-center py-3">
        <p class="footer-text">
            <strong>© 2020 Copyright: Kevin De Notariis</strong>
        </p>
    </div>
</footer>
```

where the class `.footer-text` will be defined in a `.css` file in a moment and the other classes are from bootstrap's `CSS`.

Create `style.css` in `public/styles/css` and put there the following code:

```css
.footer-text {
    color: white;
}
```

At this point, the project structure should look like the following:

```
.
├── _node_modules
│   └── ...
├── _public
│   ├── _styles
│   │   └── _css
│   │       └── style.css
│   └─ js
├── _routes
│   ├── _user
│   │   └── index.js
│   └─ index.js
├── _views
│   ├── _layout
│   │   ├── _components
│   │   │   ├── footer.ejs
│   │   │   └── scripts.ejs
│   │   └── index.js
│   └── _pages
│       └── index.ejs
├── package-lock.json
├── package.json
└── server.js
```

### Home Page Body

Let's now personalize the body of the front page.

> **_Note:_**
>
> This course is not about neither HTML nor CSS, for that reason I'm not going to deeply explain how does the pure HTML and CSS code that I'll put in work.

This is the structure that we will create:

-   A background image covering all the screen ;
-   a jumbotron header with a welcoming message ;
-   a button in center of the screen allowing user to login (or eventually sign in).

As the background image you might use a cool image taken from https://unsplash.com/s/photos/fitness. Download it and create a folder named `img` inside the `public` folder and put the image in there. I will call this image `front-image.jpg`.

Open up the `views/pages/index.ejs` and substitute it's content with the following:

```html
<div class="homePage">
    <!-- Background Image -->
    <img src="/img/front-image.jpg" class="bg" />

    <!-- Jumbotron header with welcoming message -->
    <div class="jumbotron">
        <div class="col-md-6 px-0">
            <h1 class="display-4 font-italic">
                Welcome to <strong> <%= siteName %></strong>
            </h1>
            <p class="lead">
                A Website built for athletes and people which are regularly
                exercising/going to the gym and would like to keep track of
                their progresses
            </p>
        </div>
    </div>

    <!-- Login Button -->
    <div class="d-flex justify-content-center up-front">
        <a href="/login" class="brk-btn" href="#">Login </a>
    </div>

    <!-- Text below Login Button with link to register page -->
    <div class="d-flex justify-content-center up-front">
        <p style="color: white">
            Login in order to access your profile or
            <a class="underlined-a" href="/register">register here</a>
        </p>
    </div>
</div>
```

I've also added some comments explaining the different parts coded. The `CSS` classes that we have used here can be added in the `public/styles/css/style.css` and are the following (there is no need to understand how this work, I just post it there for completeness):

```css
img.bg {
    min-height: 100%;
    min-width: 1024px;

    width: 100%;
    height: auto;

    position: fixed;
    top: 0;
    left: 0;
}

@media screen and (max-width: 1024px) {
    img.bg {
        left: 50%;
        margin-left: -512px;
    }
}

.up-front {
    position: relative;
    z-index: 2;
}

.underlined-a {
    text-decoration: none;
    color: white;
    padding-bottom: 0.15em;
    box-sizing: border-box;
    box-shadow: inset 0 -0.2em 0 white;
    transition: 0.2s;
}
.underlined-a:hover {
    color: #222;
    box-shadow: inset 0 -2em 0 white;
    transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
}

.brk-btn {
    position: relative;
    background: none;
    color: rgba(255, 255, 255, 0.356);
    text-transform: uppercase;
    text-decoration: none;
    border: 0.2em solid rgba(255, 255, 255, 0.356);
    padding: 0.8em 2em;
    font-size: 20px;
    transition: 0.3s;
}
.brk-btn:hover {
    color: white;
    border: 0.2em solid white;
    padding: 1em 2.4em;
    text-decoration: underline;
    font-size: 22px;
}

.brk-btn::before {
    content: "";
    display: block;
    position: absolute;
    width: 10%;
    background: #222;
    height: 0.3em;
    right: 20%;
    top: -0.21em;
    transform: skewX(-45deg);
    -webkit-transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
    transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
}
.brk-btn::after {
    content: "";
    display: block;
    position: absolute;
    width: 10%;
    background: #222;
    height: 0.3em;
    left: 20%;
    bottom: -0.25em;
    transform: skewX(45deg);
    -webkit-transition: all 0.45 cubic-bezier(0.86, 0, 0.07, 1);
    transition: all 0.45s cubic-bezier(0.86, 0, 0.07, 1);
}
.brk-btn:hover::before {
    right: 80%;
}
.brk-btn:hover::after {
    left: 80%;
}
```

Now, in `views/pages/index.ejs` we can see that we have added a line of the form:

```html
Welcome to <strong> <%= siteName %></strong>
```

and we have to define the variable `siteName`. Since this will be a global variable shared by every page, we can define it in the `locals` property of our server. In `server.js` just add the following line before the `app.use("/", routes());` and we will be good to procede further:

```js
app.locals.siteName = "* Web Site Name *";
```
