var express = require('express');
var db = require('./models');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
var favorites = require("./controllers/favorites")
app.use("/favorites", favorites);  //It is not necessary to declare this path as a variable.

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/static'));

var ejsLayouts = require("express-ejs-layouts");
app.use(ejsLayouts);

var request = require("request");

function log(req,res,next){
  req.log = function(mes) {
    console.log(new Date(), req.url, mes);
  }
  next();
}

app.use(log);



// app.get("/", function(req, res) {
// 	res.send("Your server works!");
// })

//Render the index.ejs page where a user can search for movies
app.get("/", function(req, res) {
	res.render("index.ejs");
});

//Render the search results page
app.get('/movies', function(req, res) {
  req.log('loading a movie');
  var query = req.query.q
    request('http://www.omdbapi.com/?s=' + query, function (error, response, body) {
      var data = JSON.parse(body);
      if (!error && response.statusCode == 200) {
      res.render("movies.ejs", {movies: data.Search, q: query});
      } else {
        res.send("Error!")
      }
  });
});

//Render the individual movie results pages
app.get('/movies/:imdbID', function(req, res) {
  var searchQuery = req.query.q ? req.query.q : '';
  var imdbID = req.params.imdbID
    request('http://www.omdbapi.com/?i=' + imdbID, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.render("showMovie.ejs", {movie: JSON.parse(body), q: searchQuery});
    } else {
        res.send("Error!")
    } 
  });
});

app.listen(3000);
