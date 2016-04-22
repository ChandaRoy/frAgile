var fragileApp = angular.module('fragileApp');

fragileApp.controller('menuController', function($scope, $http, Socket, activityService, $rootScope) {

  var socket = Socket();

  //For members list
  $rootScope.projMemberList = [];
  activityService.getMembers($rootScope.projectID).success(function(response) {
    response.memberList.forEach(function(data) {
        data.fullName = data.firstName + " " + data.lastName;
      })
    $rootScope.projMemberList = response.memberList;
  });

  $scope.allMembers = [];
  $scope.userIds = [];
  $scope.addMember = function() {
    activityService.getUserId($scope.members).success(function(response) {
      if (response.length > 0) {
        $scope.allMembers.push(response[0].firstName + " " + response[0].lastName);
        $scope.addedMembers = $scope.allMembers.join(", ");
        $scope.userIds.push(response[0]._id);
      } else {
        alert('Error: User Not Found!');
      }
    })
  }

  // Autocomplete Search
  $scope.users = [];
  $scope.currentUserEmail = activityService.getCurrentUserEmail();
  $scope.updateSearch = function(typed) {
      $scope.users = [];
      console.log('User Email: ', $scope.currentUserEmail);
      $scope.newUsers = activityService.getUsers(typed).success(function(data) {
        data.forEach(function(user) {
          if(user.email != $scope.currentUserEmail)
            $scope.users.push(user.email);
        })
      });
    }
    // $scope.roomName = 'activity:' + $rootScope.projects[$rootScope.projectKey]._id,
  $scope.saveMember = function() {
    socket.emit('activity:addMember', {
      'room': 'activity:' + $rootScope.projectID,
      'projectId': $rootScope.projectID,
      'memberList': $scope.userIds
    });
    $scope.members = "";

    $scope.userIds.forEach(function(userId, index) {
      var data = {
        room: 'activity:' + $rootScope.projectID,
        action: "added",
        projectID: $rootScope.projectID,
        user: {
          '_id': $scope.userID,
          'fullName': $scope.fullName
        },
        object: {
          name: $scope.allMembers[index],
          type: "User",
          _id: userId
        },
        target: {
          name: $scope.projectName,
          type: "Project",
          _id: $rootScope.projectID
        }
      }
      socket.emit('addActivity', data);
    })

  }

  socket.on('activity:memberAdded', function(data) {
    data.fullName = data.firstName + " " + data.lastName;
    $rootScope.projMemberList.push(data);
    $scope.allMembers = [];
    $scope.userIds = [];
    $scope.members = "";
    $scope.addedMembers = "Success: Members Added To Project!";
  });

  socket.on('activity:memberRemoved', function(userData) {
    var fullName = userData.firstName + " " + userData.lastName;
    $rootScope.projMemberList.forEach(function(data,index){
      if(userData._id == data._id)
        $rootScope.projMemberList.splice(index,1);

    });


  })

  $scope.removeMember = function(memberId) {

    socket.emit('activity:removeMember', {
      'room': 'activity:' + $rootScope.projectID,
      'projectId': $rootScope.projectID,
      'memberId': memberId
    });

  }


});
