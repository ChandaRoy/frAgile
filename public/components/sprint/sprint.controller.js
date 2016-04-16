fragileApp.controller('sprintController', ['$scope', '$rootScope', '$stateParams', 'sprintService', '$state', 'Socket','$uibModal', function($scope, $rootScope, $stateParams, sprintService, $state, Socket,$uibModal) {
  $scope.getSprints = function() {
    $scope.addToBacklog = false;
    $scope.addToBuglist = false;
    sprintService.getSprints($stateParams.sprintID).then(function(sprint) {
      $scope.sprint = sprint.data;
      $scope.sprintWidth = ($scope.sprint.list.length * 278 + 560) + "px";
      $scope.sprint = sprint.data;

    });
    sprintService.getBackBug($stateParams.prId).then(function(backBug) {
      $scope.backBug = backBug.data;
    });


    $rootScope.isMenu = false;
    $rootScope.SlideMenu = function() {
      $rootScope.isMenu = !$rootScope.isMenu;
    }

  };

  var socket = Socket($scope);

  $scope.roomName = "sprint:" + $stateParams.sprintID;
  var emitData = {
    'room': $scope.roomName
  }
  if (!$scope.activityRoom || $scope.activityRoom != ('activity:' + $scope.projectID)) { //Join an activity room if not already     joined || Change room if navigated from other project.
    $rootScope.activityRoom = 'activity:' + $scope.projectID
    emitData["activityRoom"] = 'activity:' + $scope.projectID
  }
  socket.emit('join:room', emitData);

  $rootScope.projectID = $stateParams.prId;

  $scope.backClick = function() {
    $state.go('release', {
      prId: $stateParams.prId,
      releaseID: $stateParams.releaseID
    });
  }


  socket.on('sprint:storyAdded', function(data) {
    var listName =""
    if (data.listId == "BugLists") {
      $scope.backBug.buglist.stories.push(data);
      listName ="Bug List"
    } else if (data.listId == "Backlogs") {
      $scope.backBug.backlogs.stories.push(data);
      listName ="Backlogs"
    } else {
      angular.forEach($scope.sprint.list, function(value, key) {
        if (value._id == data._id) {
          $scope.sprint.list[key].stories.push(data);
          listName = $scope.sprint.list[key].listName
        }
      });
    }
  });

  $scope.test = function(listId, clicked) {
    $scope.clicked = false;
  };
  $scope.show = function(listId, bool) {
    return listId + bool;
  };
  $scope.addStory = function(listId, storyDetails, id,listName) {
    // $scope.listIdAdded = id;
    if (storyDetails != undefined && storyDetails != "") {
      socket.emit('sprint:addStory', {
        'room': $scope.roomName,
        'activityRoom': 'activity:' + $stateParams.prId,
        'addTo': listId,
        'projectId': $stateParams.prId,
        'storyStatus': "",
        'sprintId': $stateParams.sprintID,
        'heading': storyDetails,
        'description': "",
        'listId': listId,
        'id': id,
        'listName' : listName,
        'userID':$scope.userID,
        'fullName': $scope.fullName
      });
      $scope.storyDetails = "";
      $scope.addToBacklog = false;
      $scope.addToBuglist = false;
    }
  }
  $scope.showBacklogAddDetails = function() {
    $scope.addToBacklog = true;
  };
  $scope.hideBacklogAddDetails = function() {
    $scope.addToBacklog = false;
  };
  $scope.showBuglistAddDetails = function() {
    $scope.addToBuglist = true;
  };
  $scope.hideBuglistAddDetails = function() {
    $scope.addToBuglist = false;
  };


  var divBeingDragged = "",
    elemBeingDragged = "";

  $scope.dropCallback = function(event, ui) {
    //Called when story is dropped in list
    angular.element(event.target).removeClass("being-dropped")

    if (divBeingDragged[0].id != angular.element(event.target)[0].id) { //Checking if card is dropped into a new list

      socket.emit('sprint:moveStory', {
        'room': $scope.roomName,
        'sprintId': $stateParams.sprintID,
        'oldListId': divBeingDragged[0].id,
        'newListId': angular.element(event.target)[0].id,
        'storyId': elemBeingDragged[0].id
      });
    }

  };
  $scope.startCallback = function(event, ui) {
    angular.element(event.target).addClass("being-dragged");
    elemBeingDragged = angular.element(event.target)
    divBeingDragged = elemBeingDragged.parent().parent();
  };
  $scope.stopCallback = function(event, ui) {
    angular.element(event.target).removeClass("being-dragged");
  };

  $scope.overCallback = function(event, ui) {
    //Checking if the list is new or old one.
    if (!$(divBeingDragged).is(event.target))
      angular.element(event.target).addClass("being-dropped")
  };

  $scope.outCallback = function(event, ui) {
    angular.element(event.target).removeClass("being-dropped")
  };

  socket.on('sprint:storyMoved', function(data) {

    if (data.success == false) {
      //swapping new List and old list
      var temp = data.newListId;
      data.newListId = data.oldListId;
      data.oldListId = temp;
    }

    //Going through all lists
    $scope.sprint.list.forEach(function(listItem) {

      //If the list is Old list , removing story
      if (listItem._id == data.oldListId) {
        // FIXME: Index of 1st card is being read as -1 for some reason. Temporarily fixed.
        listItem.stories.splice(listItem.stories.indexOf(data.storyId) ? -1 : 0, 1);
      }

      //If the list is new list, adding story
      if (listItem._id == data.newListId){
        listItem.stories.push(data.story)

      }

    });

  });

  socket.on('sprint:storyActivity',function(data){
    $scope.sprint.list.forEach(function(listItem) {

      if (listItem._id == data.newListId){
        var actData = {
          room: 'activity:' + $stateParams.prId,
          action: "moved",
          projectID: $stateParams.prId,
          user: {
            '_id': $scope.userID,
            'fullName': $scope.fullName
          },
          object: {
            name: data.story.heading,
            type: "Story",
            _id: data.story._id
          },
          target: {
            name: listItem.listName,
            type: "List",
            _id: listItem._id
          }
        }
       socket.emit('addActivity', actData);

      }

    });

  });



  /***
  author:Sharan
  Function Name: showModal
  Function Description: This method is called by stories in Sprint Lists.
  This will create\opens a uib modal instance for the story
  Parameters:storyId
  resolve:Sprint, Story,ProjectMembers
  TODO:Presently we are not hitting the server for updating the data and pushing to model directly. Need to update the logic
***/
  $scope.showModal = function(storyID,storyGrp)
    {
      console.log(storyID);
      sprintService.getStory(storyID).then(function(story) {
        console.log(story);
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: '/components/story/story.view.html',
          controller:'storyController',
          controllerAs:'storyContr',
          size:'lg',
          resolve: {
            param: function() {
              console.log("params in modal factory :::::  ");
              console.log("passing data to story controller");
              return {
                story:story,
                sprint:$scope.sprint,
                projMembers:$rootScope.memberList,
                storyGrp:storyGrp
              };
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
        ///This runs for close or save.... You can delete this
        });


      });
    }
}]);
