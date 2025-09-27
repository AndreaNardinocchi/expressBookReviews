const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  /* Extract the ISBN from the route parameter (e.g., /auth/review/:isbn) */
  const isbn = req.params.isbn;

  /* Get the review from the query string (e.g., ?review=Awesome) */
  let review = req.query.review;

  /* Retrieve the username from the session's authorization object.
   This confirms that the user is logged in. */
  const username = req.session.authorization?.username;

  /* If no username is found in the session, return a 401 Unauthorized error.
   This prevents unauthenticated users from submitting reviews. */
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  /* If the review is not provided in the query, return a 400 Bad Request.
   This ensures that users include a review when submitting the request. */
  if (!review) {
    return res
      .status(400)
      .json({ message: "Review is required as a query parameter" });
  }

  /* Try to find the book using the provided ISBN.
   The `books` object holds all available books by their ISBN as keys. */
  const matchingBooks = books[isbn];

  /* If the book doesn't exist (invalid ISBN), return a 404 Not Found error. */
  if (!matchingBooks) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found` });
  }

  /* If the book exists but does not yet have a `reviews` property,
   initialize it as an empty object to hold reviews keyed by username. */
  if (!matchingBooks.reviews) {
    matchingBooks.reviews = {};
  }

  /* Add or update the review in the book’s `reviews` object using the username as the key.
   - If this user already submitted a review, it will be overwritten.
   - If it’s a new user, the review will be added. */
  matchingBooks.reviews[username] = review;

  /* Return a success response including a confirmation message
   and the full set of reviews for the book (after update). */
  return res.status(200).json({
    message: "Review successfully added or updated",
    reviews: matchingBooks.reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  /* Extract the ISBN from the route parameter (e.g., /auth/review/1234567890) */
  const isbn = req.params.isbn;

  /* Retrieve the username from the session's authorization object.
     This confirms that the user is logged in. */
  const username = req.session.authorization?.username;

  /* If no username is found in the session, return a 401 Unauthorized error.
     This prevents unauthenticated users from deleting reviews. */
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  /* Try to find the book using the provided ISBN.
     The `books` object holds all available books by their ISBN as keys. */
  const matchingBooks = books[isbn];

  /* If the book doesn't exist (invalid ISBN), return a 404 Not Found error. */
  if (!matchingBooks) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found` });
  }

  /* If there are no reviews, or no review from this user, return a 404 Not Found. */
  if (!matchingBooks.reviews || !matchingBooks.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  /* Delete the review for this user from the book’s `reviews` object. */
  delete matchingBooks.reviews[username];

  /* Return a success response including a confirmation message
     and the remaining set of reviews for the book. */
  return res.status(200).json({
    message: "Review successfully deleted!",
    reviews: matchingBooks.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
