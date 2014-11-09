var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gcm = require('node-gcm');

var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req,res) {
  //check if user with this user_id already exists.
  userId = req.query.user_id;
  deviceId = req.query.device_id;

  if (userId.length == 0 || deviceId.length == 0)
    return res.json({error: 'Invalid parameters given!'});

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
            user.currentDevice = deviceId;
            user.save(function() {console.log('Updated!');});
          }
          else {
            console.log('Already exists');
            //update current device
            user.currentDevice = deviceId;
            user.save(function() {console.log('Switched user to new device!')});
          }
        }
        else {
          //if user doesn't exist, add new user with new device id
          var newUser = new User({
            userId: userId, 
            devices: [deviceId], 
            currentDevice: deviceId,
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
   console.log(req.params.gesture);
   console.log(req.params.user_id);

   var message = new gcm.Message();
   message.addData('test', req.params.gesture);
   message.delayWhileIdle = true;
   message.timeToLive = 3;
   message.dryRun = true;

   User.findOne({userId: userId}, 'userId devices', function(err, user) {
      if (user) {
        devices = user.devices;
        if (devices.length <= 1)
          return res.json({error: 'User has only registered 1 device!'});
        else {
          //switch user to new device - in any order
          currentDevice = user.currentDevice;
          for (var i = 0; i < devices.length; i++) {
            if (!devices[i].equals(currentDevice)) {
              user.currentDevice = devices[i]; //update current device set
              user.save( function() 
                {         
                  //now push gcm message
                  registrationIds = [user.currentDevice];
                  var sender = new gcm.Sender('AIzaSyAdPW9PttwGCNP-eCgXEDQh5Zr-Yg1siFw');
                  sender.send(message, registrationIds, 4, function(err, result) {
                    if (err)
                      return res.json({error: 'Error switching user to new device!'});
                    else
                      return res.json({message: 'User moved to new device'});
                  });
                }
              );
              break;
            }
          }
        }
      }
      else
        return res.json({error: 'User not registered with given id!!'});
});

router.get('/:user_id/videos/:bucket_id', function(req,res) {
  var user_id = req.params.user_id;
  var bucket_id = req.params.bucket_id;
});

module.exports = router;
