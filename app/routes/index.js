var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req,res) {
  //check if user with this user_id already exists.
  userId = req.query.user_id;
  deviceId = req.query.device_id;

  User.findOne({userId: userId}, 'userId devices', function(err, user) {
      if (err)
        console.log(err);
      else {
        //if user exists
        if (user) {
          //check if this device exists.
          devices = user.devices;
          index = devices.indexOf(deviceId);

          //if not found, add it else ignore
          if (index == -1) {
            user.devices.push(deviceId);
            user.save(function() {console.log('Updated!');});
          }
          else
            console.log('Already exists');
        }
        else {
          //if user doesn't exist, add new user with new device id
          var newUser = new User({
            userId: userId, 
            devices: [deviceId], 
            currentDevice: 0,
            buckets: []
          });
          newUser.save(function() {console.log('done!');});
        }
      }

     return res.json({empty: true});  
  });

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
