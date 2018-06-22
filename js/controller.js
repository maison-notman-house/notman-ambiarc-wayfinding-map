/**
 * controller Module
 */
angular.module('controller', [ 'reelyactive.ambiarc' ])

  // Navigation controller
  .controller('NavCtrl', function($scope, ambiarcService) {
    $scope.mapLoaded = false;

    ambiarcService.load(function(ambiarc) {
      $scope.mapLoaded = true;

      ambiarc.registerForEvent(ambiarc.eventLabel.FinishedLoadingMap,
                               function() {
        ambiarcService.buildHierarchy(function(hierarchy) {
          $scope.hierarchy = hierarchy;
          if($scope.hierarchy.length > 1) {
            $scope.showBuildingSelector = true;
          }
          $scope.building = hierarchy[0];
          $scope.buildingId = hierarchy[0].id;
          $scope.floorId = hierarchy[0].floors[0].id;
          $scope.$apply();
        });

        ambiarcService.buildPOIs(function(pois) {
          $scope.pois = pois;
          if($scope.pois.length > 1) {
            $scope.showPOISelector = true;
            $scope.poiId = pois[0].id;
          }
          $scope.$apply();
        });

        ambiarc.setSkyColor("#d6ebf2","#f2ddd6");
        ambiarc.setLightColor("#a0a0a0","#a0a0a0","#a0a0a0");
        ambiarc.setMapTheme(ambiarc.mapTheme.light);
        ambiarc.hideLoadingScreen();
      });

      ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected,
                               function(event) {
        updateBuilding(event.detail.buildingId);
        $scope.buildingId = event.detail.buildingId;
        $scope.floorId = event.detail.floorId;
      });

      $scope.selectBuilding = function(buildingId) {
        updateBuilding(buildingId);
      };

      $scope.selectFloor = function(floorId) {
        ambiarc.focusOnFloor($scope.buildingId, floorId);
      };

      $scope.selectPOI = function(poiId) {
        ambiarc.focusOnMapLabel(poiId);
      };

      function updateBuilding(buildingId) {
        for(var cBuilding = 0; cBuilding < $scope.hierarchy.length;
            cBuilding++) {
          if($scope.hierarchy[cBuilding].id === buildingId) {
            $scope.building = $scope.hierarchy[cBuilding];
            return;
          }
        }
      }
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
