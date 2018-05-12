var ambiarc;
var currentBuildingId, currentFloorId;
var previousFloor = null;

// global state indicating if the map is is Floor Selector mode
var isFloorSelectorEnabled = false;

function fillBuildingsListHardcoded() {
    var bldgListItem = document.createElement('option');
        bldgListItem.clasName = 'bldg-list-item';
        bldgListItem.value = 'Exterior';
        bldgListItem.textContent = 'Exterior';
    $('#poi-bulding-id').append(bldgListItem);
    $('#bldg-floor-select').append(bldgListItem);

    ambiarc.getAllBuildings(function (buildings) {
        mainBldgID = buildings[0];
        currentBuildingId = buildings[0];
        currentFloorId = null;

        buildings.forEach(function(bldgValue, id){
            var floorList = document.createElement('select');
                floorList.className = 'poi-floor-id poi-details-input form-control';
                floorList.setAttribute('data-bldgId', bldgValue);

            for(var key in config.floorsNameHolders){
                var value = config.floorsNameHolders[key];
                var listItem = document.createElement('option');
                    listItem.clasName = 'bldg-floor-item';
                    listItem.value = key;
                    listItem.textContent = value;
                $('#bldg-floor-select').append(listItem);
            };
        });
    });
}

/**
 * Registers our initilization method once the iframe containing mabiarc has loaded.
 */
var iframeLoaded = function () {
    $("#ambiarcIframe")[0].contentWindow.document.addEventListener('AmbiarcAppInitialized', function () {
        onAmbiarcLoaded();
    });
};

/**
 * Starts the periodic updater method and enables the UI.
 */
var onAmbiarcLoaded = function () {
    ambiarc = $("#ambiarcIframe")[0].contentWindow.Ambiarc;
    ambiarc.poiList = {};
    ambiarc.registerForEvent(ambiarc.eventLabel.CameraMotionCompleted, cameraCompletedHandler);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelected, onFloorSelected);
    ambiarc.registerForEvent(ambiarc.eventLabel.FloorSelectorEnabled, onEnteredFloorSelector);

    $('#bootstrap').removeAttr('hidden');
    $('#controls-section').fadeIn();
    fillBuildingsListHardcoded();

    // loading imported labels
    ambiarc.loadRemoteMapLabels('map/geodata.json')
        .then(function(mapLabels){
            mapLabels.forEach(function(element, i){
                var mapLabelInfo = element.properties;
                ambiarc.poiList[mapLabelInfo.id] = mapLabelInfo;
            });
        });
    setTimeout(function () {
    }, 500);
};

var cameraCompletedHandler = function (event) {
    if (currentFloorId == null) {
        $('#bldg-floor-select').val('Exterior');
    }
    else {
        $('#bldg-floor-select').val(currentBuildingId + '::' + currentFloorId);
    }

    // 1000 is id for exterior
    if (event.detail == 1000) {
        console.log("REGISTERED 1000, CALLING EXTERIOR!!!")
        ambiarc.focusOnFloor(mainBldgID, null);
        currentFloorId = null;
        $('#bldg-floor-select').val('Exterior');
        isFloorSelectorEnabled = false;
    }
};

// closes the floor menu when a floor was selected
var onFloorSelected = function (event) {
    var floorInfo = event.detail;
    currentFloorId = floorInfo.floorId;
    previousFloor = floorInfo.floorId;

    if (currentFloorId == null) {
        $('#select2-bldg-floor-select-container').html('Exterior');
    }
    else {
        $('#select2-bldg-floor-select-container').html(config.floorsNameHolders[currentBuildingId + '::' + currentFloorId]);
        $('#bldg-floor-select').select2('close')
    }

    if (currentFloorId !== null) {
        $('#bldg-floor-select').val(currentBuildingId + '::' + currentFloorId);
    }
    else $('#bldg-floor-select').val('Exterior');
    if (isFloorSelectorEnabled) {
        $("#levels-dropdown").removeClass('open');
        $("#levels-dropdown-button").attr('aria-expanded', false);
        isFloorSelectorEnabled = false;
    }
    console.log("Ambiarc received a FloorSelected event with a buildingId of " + floorInfo.buildingId + " and a floorId of " + floorInfo.floorId);
};

var onEnteredFloorSelector = function(){
    isFloorSelectorEnabled = true;
};

$('document').ready(function () {

    //initializing selec2 selector
    $('#bldg-floor-select').select2();

    $('body').on('change', '#bldg-floor-select', function () {
        $('#select2-bldg-floor-select-container').html($(this).val());
        if ($(this).val() == 'Exterior') {
            ambiarc.focusOnFloor(mainBldgID, null);
            currentBuildingId = mainBldgID;
            currentFloorId = null;
            return;
        }
        var parsedValue = $(this).val().split('::');
        currentBuildingId = parsedValue[0];
        currentFloorId = parsedValue[1];
        ambiarc.focusOnFloor(currentBuildingId, currentFloorId);
    });

    $('.floor_select_btn').find('.select2').on('click', function () {
        if ($('.select2-container--open').is(':visible') == false) {
            // return to previous floor
            if (currentBuildingId != undefined) {
                // focus to exterior
                if (currentFloorId == null) { ambiarc.focusOnFloor(currentBuildingId, null); }
                // focus to normal floor
                else { ambiarc.focusOnFloor(currentBuildingId, previousFloor); }
            }
            else {ambiarc.focusOnFloor(mainBldgID, null);}
            isFloorSelectorEnabled = false;
        }
        else {
            // call selector mode
            if (isFloorSelectorEnabled) return;
            else {
                ambiarc.viewFloorSelector(mainBldgID);
                isFloorSelectorEnabled = true;
            }
        }
    });
});
