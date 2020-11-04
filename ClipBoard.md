### Navigation Bar

The bootstrap documentation is very complete and well explained, and one can always (and should) examine it carefully.

In `views/layout/components` let's create a `navbar.ejs` with the following code:

```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
            <a class="nav-link active" href="#"
                >Home <span class="sr-only">(current)</span></a
            >
        </div>
    </div>
    <div class="navbar-nav">
        <a class="nav-link" href="#">Login</a>
    </div>
</nav>
```

and in `views/layout/index.ejs` add the following line of code:

```html
<%- include('./components/navbar') %>
```

immediately after the opening `<body>` tag. By saving the files and refreshing the webpage (with the server running), one should see the dark navigation bar appearing on top of the page, with two entries, a `Home` on left and a `Login` on the right. They still do not link to anything, and we will take care of this after.
