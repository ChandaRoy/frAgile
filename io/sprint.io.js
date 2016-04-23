var Activity = require('../models/activity.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var Sprint = require('../models/sprint.js');
var Story = require('../models/story.js');
var BackLogsBugList = require('../models/backlogBuglist.js');

module.exports = function(socket, io, user) {

  socket.on('sprint:moveStory', function(data) {

    //Adding story in new list, then deleting from old list

    Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
      if (addStoryData.nModified == 1) { //If add is succesful

        //Adding below line for moving card across release
        var sprintId = data.sprintId;

        if (data.isReleaseMove != undefined) {
          sprintId = data.oldSprintId;
        }

        Sprint.deleteStory(sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
          if (delStoryData.nModified == 1) { //If delete is succesful
            Story.findById(data.storyId, function(err, storyData) {
              data.story = storyData;
              io.to(data.room).emit('sprint:storyMoved', data);
              socket.emit('sprint:storyActivity', data)
            });
          } else { //reverting changes
            console.log("Couldn't delete story", socket.id);
            Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
              if (err) console.log("Duplicate story created ", data.storyId);
              else {
                console.log("Deleted previously added story", socket.id);
              }

            });
          }
        })
      }
    });


  });

  socket.on('sprint:moveToBackbugStory', function(data) {
    //Adding story in new list, then deleting from old list
    if (data.newListId == "backlogs") {

      BackLogsBugList.addStoryBacklog(data.projectID, data.storyId, function(err, addStoryData) {
        if (addStoryData.nModified == 1) { //If add is succesful
          Sprint.deleteStory(data.sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
            if (delStoryData.nModified == 1) { //If delete is succesful
              Story.findById(data.storyId, function(err, storyData) {
                data.story = storyData;
                io.to(data.room).emit('sprint:backbugStoryMovedTo', data);
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              console.log("Couldn't delete story", socket.id);
              BackLogsBugList.deleteStoryBacklog(data.projectID, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

              });
            }
          })
        }
      });


    } else if (data.newListId == "buglists") {

      BackLogsBugList.addStoryBuglist(data.projectID, data.storyId, function(err, addStoryData) {
        if (addStoryData.nModified == 1) { //If add is succesful
          Sprint.deleteStory(data.sprintId, data.oldListId, data.storyId, function(err, delStoryData) {
            if (delStoryData.nModified == 1) { //If delete is succesful
              Story.findById(data.storyId, function(err, storyData) {
                data.story = storyData;
                io.to(data.room).emit('sprint:backbugStoryMovedTo', data);
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              console.log("Couldn't delete story", socket.id);
              BackLogsBugList.deleteStoryBuglist(data.projectID, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

              });
            }
          })
        }
      });

    }
  });

  socket.on('sprint:moveFromBackbugStory', function(data) {
    if (data.oldListId == "backlogs") {

      Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
        if (addStoryData.nModified == 1) { //If add is succesful
          BackLogsBugList.deleteStoryBacklog(data.projectID, data.storyId, function(err, delStoryData) {
            if (delStoryData.nModified == 1) { //If delete is succesful
              Story.findById(data.storyId, function(err, storyData) {
                data.story = storyData;
                io.to(data.room).emit('sprint:backbugStoryMovedFrom', data);
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              console.log("Couldn't delete story", socket.id);
              Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

              });
            }
          })
        }
      });
    } else if (data.oldListId == "buglists") {
      Sprint.addStory(data.sprintId, data.newListId, data.storyId, function(err, addStoryData) {
        if (addStoryData.nModified == 1) { //If add is succesful
          BackLogsBugList.deleteStoryBuglist(data.projectID, data.storyId, function(err, delStoryData) {
            if (delStoryData.nModified == 1) { //If delete is succesful
              Story.findById(data.storyId, function(err, storyData) {
                data.story = storyData;
                io.to(data.room).emit('sprint:backbugStoryMovedFrom', data);
                socket.emit('sprint:storyActivity', data)

              });
            } else { //reverting changes
              console.log("Couldn't delete story", socket.id);
              Sprint.deleteStory(data.sprintId, data.newListId, data.storyId, function(err, delStoryData) {
                if (err) console.log("Duplicate story created ", data.storyId);
                else {
                  console.log("Deleted previously added story", socket.id);
                }

              });
            }
          })
        }
      });
    }
  })

  socket.on('sprint:deleteStory', function(data) {
    Story.deleteStory(data.storyId, function(err, delData) {
      if (!err) {
        var error = false;
        if (data.deleteFrom == 'Backlog') {
          BackLogsBugList.deleteStoryBacklog(data.projectId, data.storyId, function(err, delDataFrom) {
            error = err;
          });
        } else if (data.deleteFrom == 'Buglist') {
          BackLogsBugList.deleteStoryBuglist(data.projectId, data.storyId, function(err, delDataFrom) {
            error = err;
          });
        } else {
          Sprint.deleteStory(data.sprintId, data.Listid, data.storyId, function(err, delDataFrom) {
            error = err;
          });
        }

        if (!error) {
          var storyData = {
            'deleteFrom': data.deleteFrom,
            'storyId': data.storyId,
            'projectId': data.projectId,
            'Listid': data.Listid,
            'sprintId': data.sprintId
          };
          io.to(data.room).emit('sprint:storyDeleted', storyData);

          var actData = {
            room: "activity:" + data.projectId,
            action: "removed",
            projectID: data.projectId,
            user: user,
            object: {
              name: data.storyName,
              type: "Story",
              _id: data.storyId
            },
            target: {
              name: data.deleteFrom,
              type: "List",
              _id: data.storyId
            }
          }
          Activity.addEvent(actData, function(data) {
            io.to(actData.room).emit('activityAdded', data);
          });
        }
      }
    });

  });

  socket.on('sprint:addStory', function(data) {
    var story = {
      heading: data.heading,
      addTo: data.addTo,
      storyStatus: data.storyStatus,
      heading: data.heading,
      description: data.description,
      listId: data.listId
    }
    Story.addStory(story, function(err, storyData) {
      if (!err) {
        var actData = {
          room: data.activityRoom,
          action: "added",
          projectID: data.projectId,
          user: user,
          object: {
            name: data.heading,
            type: "Story",
            _id: ""
          },
          target: {
            name: data.listName,
            type: "List",
            _id: data.id
          }
        }

        if (data.addTo == "Backlogs") {
          BackLogsBugList.addStoryBacklog(data.projectId, storyData._id, function(err, subDoc) {
            if (!err) {
              io.to(data.room).emit('sprint:storyAdded', storyData);
              actData.object._id = storyData._id;
              Activity.addEvent(actData, function(data) {
                io.to(data.activityRoom).emit('activityAdded', data);
              });

            } else
              console.log(err);
          })
        } else if (data.addTo == "BugLists") {
          BackLogsBugList.addStoryBuglist(data.projectId, storyData._id, function(err, subDoc) {
            if (!err) {
              io.to(data.room).emit('sprint:storyAdded', storyData);
              actData.object._id = storyData._id
              Activity.addEvent(actData, function(data) {
                io.to(data.activityRoom).emit('activityAdded', data);
              });

            } else
              console.log(err);
          })
        } else {
          Sprint.addStory(data.sprintId, data.id, storyData._id, function(err, subDoc) {
            if (!err) {

              actData.object._id = storyData._id

              //FIXME: Not able to add new property to storyData :(
              //storyData.listIdAdded = data.id;
              //console.log(storyData);
              storyData.listId = data.id

              io.to(data.room).emit('sprint:storyAdded', storyData);

              Activity.addEvent(actData, function(data) {
                io.to(actData.room).emit('activityAdded', data);
              });

            } else
              console.log(err);
          })
        }


      } else
        console.log(err);
    });

  });


}
