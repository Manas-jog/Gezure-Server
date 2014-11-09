var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var gcm = require('node-gcm');

var User = require('../models/user');
var Bucket = require('../models/bucket');

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
      if (err) {
        console.log(err);
        return res.json({error: err});
      }

      else {
        //if user exists
        if (user) {
          console.log('User exists');
          //check if this device exists.
          devices = user.devices;
          index = devices.indexOf(deviceId);

          //if not found, add it else ignore
          if (index == -1) {
            user.devices.push(deviceId);
            user.currentDevice = deviceId;
            user.save(function() 
              {
                console.log('Updated!');
                return res.json({message: 'Added new device for user'});
              }
            );
          }
          else {
            console.log('Already exists');
            //update current device
            user.currentDevice = deviceId;
            user.save(function() 
              {
                console.log('Switched user to new device!');
                return res.json({message: 'updated current device'});
              }
            );
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
          newUser.save(function() 
            {
              console.log('done!');
              return res.json({message: 'Added user to database'});
            }
          );
        }
      }
  });

});

router.get('/:user_id/get_bucket_list', function(req,res) {
    var user_id = req.params.user_id;
});

router.get('/gestures', function(req,res) {
   console.log(req.query.gesture);
   console.log(req.query.user_id);

   var message = new gcm.Message();
   message.addData('test', req.query.gesture);
   message.delayWhileIdle = true;
   message.timeToLive = 3;
   message.dryRun = true;

   User.findOne({userId: req.query.user_id}, 'userId devices currentDevice', function(err, user) {
      if (user) {
        devices = user.devices;
        if (devices.length <= 1)
          return res.json({error: 'User has only registered 1 device!'});
        else {
          //switch user to new device - in any order
          currentDevice = user.currentDevice;
          for (var i = 0; i < devices.length; i++) {
            if (!(devices[i] === currentDevice)) {
              user.currentDevice = devices[i]; //update current device set
              user.save( function() 
                {         
                  //now push gcm message
                  registrationIds = [user.currentDevice];
                  var sender = new gcm.Sender('AIzaSyAdPW9PttwGCNP-eCgXEDQh5Zr-Yg1siFw');
                  sender.send(message, registrationIds, 4, function(err, result) {
                    if (err)
                      return res.json({error: 'Error switching user to new device!'});
                    else {
                      console.log(result);
                      return res.json({message: 'User moved to new device'});
                    }
                  });
                }
              );
              break;
            }
          }
        } }
      else
        return res.json({error: 'User not registered with given id!!'});
    });
});

router.get('/:user_id/videos', function(req,res) {
  var userId = req.params.user_id;

  if ( (!(userId instanceof String) && !(typeof(userId) === 'string')) || (userId.length == 0))
    return res.json({error:'Invalid userid param!'});

  User.findOne({userId: userId}).populate('buckets').exec( function(err, user) {
    if (err) {
      console.log('error!');
      return res.json({error: 'Unexpected error.'});
    }

    if (user) {
      return res.json(user.buckets);
    }
    else
      return res.json({error: 'User doesnt exist!'});
  });

});


router.post('/bucket', function(req, res) {
  var params = req.body;
  console.log(params);
  if ( ('title' in params) && ('user_id' in params) && ('videos' in params) ) {
    title = params.title;
    userId = params.user_id;
    videos = params.videos;

    if (videos instanceof Array) {
      if (videos.length > 0) {
        //check if userId is correct
        User.findOne({userId: userId}, 'userId buckets', function(err, user) {
          if (err) {
            console.log('error!');
            return res.json({error: 'Unexpected error.'});
          }

          if (user) {
            var newBucket = new Bucket({
              title: title,
              videos: videos
            });
            newBucket.save(
              function(err, newBucket) {
                console.log('New bucket!');
                user.buckets.push(newBucket.id);
                user.save ( function() {return res.json({message: 'Bucket added!'})});
              }
            );
          }

          else
            return res.json({error: 'User with that ID doesnt exist!'});
        });
      }
      else
        return res.json({error: 'Must have at least 1 video per new bucket!'});
    }
    else {
      return res.json({error: 'Videos must be in form of list!'});
    }
  }
  else
    return res.json({error: 'Invalid JSON supplied!'});
});

module.exports = router;
