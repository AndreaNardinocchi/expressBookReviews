const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const books = require("./router/booksdb.js");

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  //Write the authenication mechanism here

  // Check if user is logged in and has valid access token
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];

    // Verify JWT token
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next(); // Proceed to the next middleware
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;
/* Routes in index.js are added because Axios needs to make HTTP requests 
and must call a real, reachable URL on the server.
*/

app.get("/api/books", (req, res) => {
  res.json(books);
});

app.get("/api/books/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

app.get("/api/books/author/:author", (req, res) => {
  const author = req.params.author;
  const matchingBooks = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author
  );

  if (matchingBooks) {
    res.json(matchingBooks);
  } else {
    res.status(404).json({ message: "No book found for " + author });
  }
});

app.get("/api/books/title/:title", (req, res) => {
  const title = req.params.title;
  const matchingBooks = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title
  );

  if (matchingBooks) {
    res.json(matchingBooks);
  } else {
    res.status(404).json({ message: "No book found for " + title });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
