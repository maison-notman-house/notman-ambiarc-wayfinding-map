/**
 * controller Module
 */
angular.module('controller', [ 'reelyactive.ambiarc' ])

  // Navigation controller
  .controller('NavCtrl', function($scope, ambiarcService) {
    $scope.mapLoaded = false;

    ambiarcService.load(function(ambiarc) {
      $scope.mapLoaded = true;
      $scope.$apply();
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
