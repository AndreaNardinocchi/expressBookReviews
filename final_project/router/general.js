const express = require("express");
const axios = require("axios"); // import axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const userExists = users.some((user) => user.username === username);
    if (!userExists) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// // Get the book list available in the shop Express.js
// public_users.get("/", function (req, res) {
//   res.send(JSON.stringify(books, null, 4));
// });

// Task 10: Get the book list using Axios with async-await
public_users.get("/", async (req, res) => {
  try {
    // Make an HTTP GET request to fetch books from the below API
    const response = await axios.get("http://localhost:5000/api/books"); // example URL
    const books = response.data;
    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN
// public_users.get("/isbn/:isbn", function (req, res) {
//   //Write your code here
//   const isbn = req.params.isbn;
//   res.send(books[isbn]);
//   //  return res.status(300).json({ message: "Yet to be implemented" });
// });

public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    // Make an HTTP GET request to fetch books from the below API
    const response = await axios.get(
      `http://localhost:5000/api/books/isbn/${isbn}`
    ); // example URL
    const books = response.data;
    if (books) {
      res.json(books);
    } else {
      res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on author
// public_users.get("/author/:author", function (req, res) {
//   const author = req.params.author.toLowerCase();

//   const matchingBooks = Object.values(books).filter(
//     (book) => book.author.toLowerCase() === author
//   );

//   if (matchingBooks.length > 0) {
//     res.send(matchingBooks);
//   } else {
//     return res.status(404).json({ message: "No book found for " + author });
//   }
// });

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();

  try {
    // Make an HTTP GET request to fetch the author
    const response = await axios.get(
      `http://localhost:5000/api/books/author/${author}`
    ); // example URL
    const books = response.data;
    const matchingBooks = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author
    );

    if (matchingBooks) {
      res.json(matchingBooks);
    } else {
      res.status(404).json({ message: "No book found for " + author });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// // Get all books based on title
// public_users.get("/title/:title", function (req, res) {
//   const title = req.params.title;

//   let bookTitle = req.params.title.trim().toLowerCase();

//   const matchingBooks = Object.values(books).filter(
//     (book) => book.title.trim().toLowerCase() === bookTitle
//   );

//   if (matchingBooks.length > 0) {
//     res.send(matchingBooks);
//   } else {
//     return res.status(404).json({ message: "No book found for " + title });
//   }
// });

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();

  try {
    // Make an HTTP GET request to fetch the author
    const response = await axios.get(
      `http://localhost:5000/api/books/title/${title}`
    ); // example URL
    const books = response.data;
    const matchingBooks = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title
    );

    if (matchingBooks) {
      res.json(matchingBooks);
    } else {
      res.status(404).json({ message: "No book found for " + title });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const matchingBooks = books[isbn];
  if (matchingBooks) {
    res.send(matchingBooks.reviews);
  } else {
    return res.status(404).json({ message: "No book found for ISBN " + isbn });
  }
});

module.exports.general = public_users;
