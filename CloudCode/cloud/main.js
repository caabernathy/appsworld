// ----------------------------------
// Updating the score for an entry

var Entry = Parse.Object.extend("Entry");

var _ = require("underscore");
// A function to update scores, bypassing ACL restrictions
Parse.Cloud.define("updateScores", function(request, response) {
  Parse.Cloud.useMasterKey();
  var entryIds = request.params.entryIds;
  var entries = [];
  _.each(entryIds, function(entryId) {
    var entry = new Entry();
    entry.id = entryId;
    entry.increment("score", 5);
    entries.push(entry);
  });
  Parse.Object.saveAll(entries, function(list, error) {
    if (list) {
      // All the objects were saved.
       response.success("Scores updated.");
    } else {
      // An error occurred.
      response.error("Could not update scores " + error.message);
    }
  });
});




// ----------------------------------
// Saving a thumbnail

var Image = require("parse-image");
 
Parse.Cloud.beforeSave("Entry", function(request, response) {
  var entry = request.object;
  if (!entry.get("image")) {
    response.error("Entry should contain an image.");
    return;
  }
 
  if (!entry.dirty("image")) {
    // The entry's image isn't being modified.
    response.success();
    return;
  }
 
  Parse.Cloud.httpRequest({
    url: entry.get("image").url()
 
  }).then(function(response) {
    var image = new Image();
    return image.setData(response.buffer);
 
  }).then(function(image) {
    // Crop the image to the smaller of width or height.
    var size = Math.min(image.width(), image.height());
    return image.crop({
      left: (image.width() - size) / 2,
      top: (image.height() - size) / 2,
      width: size,
      height: size
    });
 
  }).then(function(image) {
    // Resize the image to 64x64.
    return image.scale({
      width: 64,
      height: 64
    });
 
  }).then(function(image) {
    // Make sure it's a JPEG to save disk space and bandwidth.
    return image.setFormat("JPEG");
 
  }).then(function(image) {
    // Get the image data in a Buffer.
    return image.data();
 
  }).then(function(buffer) {
    // Save the image into a new file.
    var base64 = buffer.toString("base64");
    var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
    return cropped.save();
 
  }).then(function(cropped) {
    // Attach the image file to the original object.
    entry.set("thumbnail", cropped);

  }).then(function(result) {
    response.success();
  }, function(error) {
    response.error(error);
  });
});



// ----------------------------------
// Send out emails to inactive users

var SendGrid = require("sendgrid");
// A job to contact 7-day inactive users and invite them to a contest
Parse.Cloud.job("emailInactiveUsers", function(request, status) {
 
  // Set up SendGrid
  SendGrid.initialize("YOUR_SENDGRID_USERNAME", "YOUR_SENDGRID_PASSWORD");
 
  var query = new Parse.Query(Parse.User);
 
  // Set up 7 day criteria
  var d = new Date();
  var d1 = new Date(d - 1000 * 60 * 60 * 24 * 7); // gets 7 days ago
  var d2 = new Date(d - 1000 * 60 * 60 * 24 * 8); // gets 8 days ago
  query.lessThan("lastActive", d1);
  query.greaterThan("lastActive", d2);
 
  query.each(function(user, response) {
   
    SendGrid.sendEmail({
      to: user.getEmail(),
      from: "hello@appsworld.com",
      subject: "Hello from Apps World!",
      text: "We miss you! Please come back."
    }, {
    success: function(httpResponse) {
      console.log(httpResponse);
      status.success("Email successfully sent to "+ user.getUsername());
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      status.error("Uh oh, something went wrong");
    }
    });
 
  }).then(function() {
    // Set the job's success status
    status.success("Emailed all users successfully.");
  }, function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong.");
  });
 
});




// ----------------------------------
// Send out a push notification
// when a new contest is saved
Parse.Cloud.afterSave("Contest", function(request) {
  if (!request.object.get("title") || !request.object.get("active")) {
    return;
  }
  var message = "Join our new contest: ";
  var contestTitle = request.object.get("title");
  var trimLength = 224 - message.length;
  message = message + contestTitle.substring(0,trimLength);
  Parse.Push.send({
    channels: [ "" ],
    data: {
      alert: message
    }
  }, {
    success: function() {
      // Push was successful
      console.log("Push sent out successfully.");
    },
    error: function(error) {
      // Log error
      console.log("Could not send out push");
    }
  });
});

// ----------------------------------
// Get the high score for a contest

Parse.Cloud.define("highScore", function (request, response) {
  var contest = new Parse.Object("Contest");
  contest.id = request.params.contestId;
  var query = new Parse.Query("Entry");
  query.equalTo("contest", contest);
  query.descending("score");
  query.first().then(function(entry) {
    var score = 0;
    if (entry) {
      score = entry.get("score");
    }
    response.success(score);
  }, function(error) {
    response.error("Uh oh, something went wrong.");
  });
});

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
