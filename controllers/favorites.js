var express = require("express");
var router = express.Router();
var db = require('../models');
// current directory : localhost:3000/favorites
// router.use(express.static(__dirname + '/static'));

/// localhost:3000/favorites/
router.get("/", function(req, res) {
	db.favorite.findAll().then(function(fav) {
		res.render('favorites.ejs', {fav:fav})
	})
	//this is where I will list the database entries
});

router.post("/", function(req, res) {
	var title = req.body.favtitle;
	var year = req.body.favyear;
	var imdb = req.body.favimdb;

	db.favorite.findOrCreate({
	  where: {
		imdbId: imdb,
		title: title,
		year: year
	  }
	}).spread(function(favorite, created) {
		res.redirect("/favorites");
  });
});

router.get("/tags", function(req, res) {
	db.tag.findAll({
		include: [db.favorite]
    }).then(function(alltags) {
		res.render('allTags.ejs', {alltags:alltags})
	});
});

router.get("/tags/:id", function(req, res) {
	db.tag.find({
		where: {
			id: req.params.id
		},
		include: [db.favorite]
		}).then(function(movietags) {
			movietags.getFavorites().then(function(favorites) {
			res.render('movieTags.ejs', {movietags: movietags, favorites: favorites})
	});
  })
});

router.get("/:id/comments", function(req, res) {
	var id = req.params.id;
	db.favorite.findOne({where: {id: id}}).then(function(fav) {
		fav.getComments().then(function(comments){
		res.render('comments.ejs', {fav:fav, comments: comments})
		}
	)})
});

router.post("/:id/comments", function(req, res) {
	var id = req.params.id;
	var currentComment = req.body.comment;
	var currentAuthor  = req.body.author;
	db.comment.create({
			text: currentComment,
			author: currentAuthor,
			favoriteId: id
		}).then(function() {
			res.redirect('/favorites/' + req.params.id + '/comments');
		})
});

router.get("/:id/tags", function(req, res) {
	var id = req.params.id;
	db.favorite.findOne({
		where: {
			id: id
		},
		include: [db.tag]
	}).then(function(fav) {
		fav.getTags().then(function(tags) {
		res.render('newTag.ejs', {fav:fav, tags:tags});
	})
  })
})

router.post("/:id/tags", function(req, res) {
	var id = req.params.id;
	var currentTag = req.body.tag;
	db.favorite.findById(id).then(function(post) {
		db.tag.findOrCreate({
		where: {
			tag: currentTag
		}}).spread(function(tag, created) {
			post.addTag(tag).then(function() {
			res.redirect('/favorites/');
		});
	});
  });
});
	
module.exports = router;