fragileApp.controller('homeController',['$scope','$state','$rootScope','homeService','$filter',function($scope,$state,$rootScope,homeService,$filter){

  $scope.loadProjects = function() {

    homeService.getUserProjects().success(function(response) {
      $rootScope.projects = response.projects
      $rootScope.projects.forEach(function(project, projectKey) {
        project.release.forEach(function(release, releaseKey) {
          console.log("release._id =" + release._id);
          homeService.getSprints(release._id).success(function(response) {
            $rootScope.projects[projectKey].release[releaseKey].sprints = [];
            $rootScope.projects[projectKey].release[releaseKey].sprints = response[0].release[0].sprints;
          });
        });
      });
    });
    $rootScope.defaultDate =  $filter('date')(Date.now(), "yyyy-MM-dd");
  };

  homeService.getCurrentUser().success(function(response){
    $rootScope.currentUserID =  response;
  })

  $rootScope.list = [
  {
    "group": "inProgress",
    "listName": "Picked",
    "stories": []
  },
  {
    "group": "inProgress",
    "listName": "In progress",
    "stories": []
  },
  {
    "group": "inProgress",
    "listName": "For Review",
    "stories": []
  },
  {
    "group": "inProgress",
    "listName": "Approved",
    "stories": []
  },
  {
    "group": "Releasable",
    "listName": "Releasable",
    "stories": []
  }
];
  $scope.goToProject = function() {
    $state.go('project');
  }
  $state.go('project');
  //To check user logged in or not  business logic goes here....
}]);
