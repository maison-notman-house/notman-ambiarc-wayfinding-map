/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


angular.module('reelyactive.ambiarc', [])

  .factory('ambiarcService', function ambiarcServiceFactory($window) {

    var ambiarc;
    var loadComplete = false;
    var waitUntilLoadedCallbacks = [];

    $window.iframeLoaded = function() {
      $("#ambiarcIframe")[0].contentWindow.document.addEventListener(
                                         'AmbiarcAppInitialized', function() {
        ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
        loadComplete = true;
        for(var cCallback = 0; cCallback < waitUntilLoadedCallbacks.length;
            cCallback++) {
          waitUntilLoadedCallbacks[cCallback](ambiarc);
        }
      });
    };

    function setLoadCallback(callback) {
      if(loadComplete) {
        return callback(ambiarc);
      }
      waitUntilLoadedCallbacks.push(callback);
    }

    return { load: setLoadCallback };
  });
