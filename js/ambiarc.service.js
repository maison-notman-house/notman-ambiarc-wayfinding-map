/**
 * Copyright reelyActive 2018
 * We believe in an open Internet of Things
 */


const DEFAULT_MAP_LABEL_FILE = 'map/geodata.json';
const DEFAULT_EXTERIOR_NAME = { floorName: "Exterior" };
const EXTERIOR_KEY_ID = 'EXT';


angular.module('reelyactive.ambiarc', [])

  .factory('ambiarcService', function ambiarcServiceFactory($window) {

    var ambiarc;
    var ambiarcLoadComplete = false;
    var mapLoadComplete = false;
    var waitUntilAmbiarcLoadedCallbacks = [];
    var waitUntilMapLoadedCallbacks = [];
    var mapOptions = {};

    $window.iframeLoaded = function() {
      $("#ambiarcIframe")[0].contentWindow.document.addEventListener(
                                         'AmbiarcAppInitialized', function() {
        ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;

        var url = location.protocol + '//' + location.hostname +
                  (location.port ? ':'+location.port: '') +
                  window.location.pathname.substring(0,
                                   window.location.pathname.lastIndexOf("/"));

        ambiarc.setMapAssetBundleURL(url);
        ambiarc.loadMap(config.mapName);
        ambiarc.registerForEvent(ambiarc.eventLabel.FinishedLoadingMap,
                                 handleMapLoaded);

        ambiarcLoadComplete = true;
        for(var cCallback = 0;
            cCallback < waitUntilAmbiarcLoadedCallbacks.length; cCallback++) {
          waitUntilAmbiarcLoadedCallbacks[cCallback](ambiarc);
        }
      });
    };

    function setAmbiarcLoadCallback(callback) {
      if(ambiarcLoadComplete) {
        return callback(ambiarc);
      }
      waitUntilAmbiarcLoadedCallbacks.push(callback);
    }

    function setMapLoadCallback(options, callback) {
      if(mapLoadComplete) {
        return callback();
      }
      mapOptions = options | {};
      waitUntilMapLoadedCallbacks.push(callback);
    }

    function handleMapLoaded() {
      // TODO: use mapOptions to set colours/theme
      ambiarc.setSkyColor("#d6ebf2","#f2ddd6");
      ambiarc.setLightColor("#a0a0a0","#a0a0a0","#a0a0a0");
      ambiarc.setMapTheme(ambiarc.mapTheme.light);

      mapLoadComplete = true;
      for(var cCallback = 0; cCallback < waitUntilMapLoadedCallbacks.length;
          cCallback++) {
        waitUntilMapLoadedCallbacks[cCallback]();
      }
      ambiarc.hideLoadingScreen();
    }

    function buildHierarchy(callback) {
      if(!mapLoadComplete) {
        return callback([]);
      }
      ambiarc.getAllBuildings(function(buildings) {
        var hierarchy = [];
        for(var cBuilding = 0; cBuilding < buildings.length; cBuilding++) {
          var buildingId = buildings[cBuilding];
          var exteriorKey = buildingId + '::' + EXTERIOR_KEY_ID;
          var exteriorName = config.floorsNameHolders[exteriorKey] ||
                             DEFAULT_EXTERIOR_NAME;
          var building = { id: buildingId,
                           floors: [ { floorName: exteriorName, id: null } ] };

          ambiarc.getAllFloors(buildingId, function(floors) {
            for(var cFloor = 0; cFloor < floors.length; cFloor++) {
              var floorId = floors[cFloor].id;
              var floorKey = buildingId + '::' + floorId;
              var floorName = config.floorsNameHolders[floorKey] ||
                              floors[cFloor].positionName;
              floors[cFloor].floorName = floorName;
              building.floors.push(floors[cFloor]);
            }
          });  
          hierarchy.push(building);        
        }
        return callback(hierarchy);
      });
    }

    function buildPOIs(callback) {
      if(!mapLoadComplete) {
        return callback([]);
      }
      ambiarc.poiList = {};
      ambiarc.loadRemoteMapLabels(DEFAULT_MAP_LABEL_FILE)
        .then(function(mapLabels) {
          var pois = [];
          for(var cLabel = 0; cLabel < mapLabels.length; cLabel++) {
            var mapLabel = mapLabels[cLabel];
            var mapLabelId = mapLabel.properties.mapLabelId;
            ambiarc.poiList[mapLabelId] = mapLabel.properties;
            var poi = {
              id: mapLabelId,
              buildingId: mapLabel.properties.buildingId,
              floorId: mapLabel.properties.floorId,
              label: mapLabel.properties.label,
              user_properties: mapLabel.user_properties
            };
            pois.push(poi);
          }
          return callback(pois);
        });
    }

    return {
      load: setAmbiarcLoadCallback,
      onMapLoaded: setMapLoadCallback,
      buildHierarchy: buildHierarchy,
      buildPOIs: buildPOIs
    };

  });
