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

    function buildHierarchy(callback) {
      if(!loadComplete) {
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
      if(!loadComplete) {
        return callback([]);
      }
      ambiarc.poiList = {};
      ambiarc.loadRemoteMapLabels(DEFAULT_MAP_LABEL_FILE)
        .then(function(mapLabels) {
          var pois = [];
          for(var cLabel = 0; cLabel < mapLabels.length; cLabel++) {
            var mapLabel = mapLabels[cLabel];
            var mapLabelId = mapLabel.properties.id;
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
      load: setLoadCallback,
      buildHierarchy: buildHierarchy,
      buildPOIs: buildPOIs
    };

  });
