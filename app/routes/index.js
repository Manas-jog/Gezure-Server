var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req,res) {

});

router.get('/:user_id/get_bucket_list', function(req,res) {
    var user_id = req.params.user_id;
});

router.get('/gestures', function(req,res) {

});

router.get('/:user_id/videos/:bucket_id', function(req,res) {
  var user_id = req.params.user_id;
  var bucket_id = req.params.bucket_id;
});

module.exports = router;
