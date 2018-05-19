/**
 * controller Module
 */
angular.module('controller', [ 'reelyactive.ambiarc' ])

  // Navigation controller
  .controller('NavCtrl', function($scope, ambiarcService) {
    $scope.mapLoaded = false;
    $scope.buildingIndex = 0;
    $scope.floorIndex = 0;
    $scope.poiIndex = 0;

    ambiarcService.load(function(ambiarc) {
      $scope.mapLoaded = true;

      ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected,
                               function(event) {
        for(var cBuilding = 0; cBuilding < $scope.hierarchy.length;
            cBuilding++) {
          var building = $scope.hierarchy[cBuilding];
          if(building.id === event.detail.buildingId) {
            for(var cFloor = 0; cFloor < building.floors.length; cFloor++) {
              if(building.floors[cFloor].id === event.detail.floorId) {
                $scope.buildingIndex = cBuilding;
                $scope.floorIndex = cFloor;
                return;
              }
            }
          }
        }
      });

      ambiarcService.buildHierarchy(function(hierarchy) {
        $scope.hierarchy = hierarchy;
        if($scope.hierarchy.length > 1) {
          $scope.showBuildingSelector = true;
        }
        $scope.$apply();
      });

      ambiarcService.buildPOIs(function(pois) {
        $scope.pois = pois;
        if($scope.pois.length > 1) {
          $scope.showPOISelector = true;
        }
        $scope.$apply();
      });

      $scope.selectBuilding = function(buildingIndex) { };

      $scope.selectFloor = function(floorIndex) {
        var buildingId = $scope.hierarchy[$scope.buildingIndex].id;
        var floorId = $scope.hierarchy[$scope.buildingIndex]
                        .floors[floorIndex].id;
        ambiarc.focusOnFloor(buildingId, floorId);
      };

      $scope.selectPOI = function(poiIndex) {
        var mapLabelId = $scope.pois[poiIndex].id;
        var floorId = $scope.pois[poiIndex].floorId;
        var buildingId = $scope.pois[poiIndex].buildingId;
        ambiarc.focusOnMapLabel(mapLabelId);
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
