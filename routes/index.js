var express = require('express');
var path = require('path');
var router = express.Router();


router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', '/public/html/index.html'));
});

router.get('/about', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/about.html'));
});

router.get('/rush', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/rush.html'));
});

router.get('/executives', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/execs.html'));
});

router.get('/blog', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/blog.html'));
});

router.get('/schedule', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/schedule.html'));
});

router.get('/trees', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/trees.html'));
});

router.get('/login', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/login.html'));
});

router.get('/newuser', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/newuser.html'));
});

router.get('/profdev', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/profdev.html'));
});

router.get('/index2.html', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'public/html/index2.html'));
});

module.exports = router;
