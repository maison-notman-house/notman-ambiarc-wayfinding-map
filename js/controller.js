/**
 * controller Module
 */
angular.module('controller', [ 'reelyactive.ambiarc' ])

  // Navigation controller
  .controller('NavCtrl', function($scope, ambiarcService) {
    $scope.mapLoaded = false;
    $scope.buildingIndex = 0;
    $scope.floorIndex = 0;

    ambiarcService.load(function(ambiarc) {
      $scope.mapLoaded = true;

      ambiarcService.buildHierarchy(function(hierarchy) {
        $scope.hierarchy = hierarchy;
        if($scope.hierarchy.length > 1) {
          $scope.showBuildingSelector = true;
        }
        $scope.$apply();
      });

      ambiarcService.buildPOIs(function(pois) { });

      $scope.selectBuilding = function(buildingIndex) { };

      $scope.selectFloor = function(floorIndex) {
        var buildingId = $scope.hierarchy[$scope.buildingIndex].id;
        var floorId = $scope.hierarchy[$scope.buildingIndex]
                        .floors[floorIndex].id;
        ambiarc.focusOnFloor(buildingId, floorId);
      };
    });

  })


  // Controls controller
  .controller('ControlsCtrl', function($scope, ambiarcService) {

    ambiarcService.load(function(ambiarc) {
      $('#controls-section').fadeIn();

      $scope.zoomIn = function() {
        ambiarc.zoomCamera(0.2, 0.5);
      };
      $scope.zoomOut = function() {
        ambiarc.zoomCamera(-0.2, 0.5);
      };
      $scope.rotateLeft = function() {
        ambiarc.rotateCamera(30, 0.5);
      };
      $scope.rotateRight = function() {
        ambiarc.rotateCamera(-30, 0.5);
      };
    });

  });
