// global variables

var r = 40; // radius
// if there is no station near spot within r and vice versa

var pso2_inipar = 1;
var nStaArray = [];

var node = 0;
var deleteN = 0;
var geocoder;
var markers = [];
var addedMarkers = [];
var map;
var infowindow = new google.maps.InfoWindow();
var markersCluster;
var cluster;

var a = 6378137.0;
var b = 6356752.314245;
var long0 = 121 * Math.PI / 180;
var k0 = 0.9999;
var dx = 250000;
var objectArray = [];
var database;

var circleArray = [];
var result;

var data = [];

/*
 **  initialize google map
 */

function initialize() {
    var mapOptions = {
        draggable: true,
        zoom: 13,
        center: new google.maps.LatLng(25.0487345, 121.5142306),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    geocoder = new google.maps.Geocoder();

    var options = {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        gridSize: 30,
        zoomOnClick: true,
    };

    markersCluster = new MarkerClusterer(map, markers, options);
    cluster = new Cluster(markersCluster);

    var config = {
        apiKey: "AIzaSyDClNeJXDP_QD-AXtn4BuWWUI-TtOdNBpM",
        authDomain: "nckuiim-sharing-pso.firebaseapp.com",
        databaseURL: "https://nckuiim-sharing-pso.firebaseio.com",
        projectId: "nckuiim-sharing-pso",
        storageBucket: "nckuiim-sharing-pso.appspot.com",
        messagingSenderId: "964890674778"
    };

    firebase.initializeApp(config);
    database = firebase.database();
    // when user click on map ....
    google.maps.event.addListener(map, 'click', function(e) {
        placeMarkerOhca(e.latLng, map);
        document.getElementById("location").innerHTML = "lat: " + markers[node].getPosition().lat() +
            "<br>" + "lng: " + markers[node].getPosition().lng();
        insertMarkerInfo1(markers[node].getPosition().lat(), markers[node].getPosition().lng());
        printData(1); // 1&2 the same (revise)
    });

    google.maps.event.addListener(map, 'rightclick', function(e) {
        placeMarkerPad(e.latLng, map);
        document.getElementById("location").innerHTML = "lat:  " + markers[node].getPosition().lat() +
            "<br>" + "lng:  " + markers[node].getPosition().lng();
        insertMarkerInfo2(markers[node].getPosition().lat(), markers[node].getPosition().lng());
        printData(2);
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (infowindow) { infowindow.close(); }
    });

    document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

/*
 **  show the category of selected box
 */

function boxclick(box, category) {
    if (box.checked) {
        showCheckedCategory(category);
    } else {
        hideUncheckedCategory(category);
    }
    // printData();
}

function showCheckedCategory(category) {
    for (var index in markers) {
        var skip = 0;

        if (skip === 0) {
            if (markers[index].type === category) {
                markers[index].setVisible(true);
            }
        }
    }
}

function hideUncheckedCategory(category) {
    for (var index in markers) {
        var skip = 0;

        if (skip === 0) {
            if (markers[index].type === category) {
                markers[index].setVisible(false);
            }
        }
    }
}

/**
 *  create place check box
 *  show the chosen place type markers
 */

function createPlaceTypeCheckBox(dataName, type) {
    var placeType = new Set();
    var element = document.getElementById('placeType');

    type.forEach(function(value, index, array) {
        element.insertAdjacentHTML('beforeend', getTypeCategory(dataName, value));
    });
}

function getTypeCategory(dataName, type) {
    var insertHtml = "";
    var typeCategery = new Set();

    for (var i = 0; i < objectArray.length; i++) {
        if (objectArray[i].data === dataName) {
            typeCategery.add(objectArray[i][type]);
        }
    }

    if (type === "age") {
        insertHtml += "請輸入年齡範圍 (ohca)： <br>" +
            "<input type='text' name='startAge' id='startAge'> <br>" +
            "<input type='text' name='endAge' id='endAge'> <br>" +
            "<input type='button' name='submit' value='確定' id='searchAgeButton' onclick='searchAge()'> <br>"
    } else {
        insertHtml += "<form> 請選擇欲顯示之" + type + "類型" + "(" + dataName + ")" + "： <br>";
        typeCategery.forEach(function(item) {
            insertHtml += "<input type='checkbox' value=" + item +
                " name='" + type + "'" +
                " onclick=placeTypeBoxAction(this,'" + item + "','" + type + "')" +
                " checked>" +
                item +
                "<br> ";
        })
    }
    // insertHtml += "<input type='checkbox' name='vanishAllSpots' onclick='setAllMarkerInvisible()' checked>ohca"
    insertHtml += "----------------------------------------</form>";

    return insertHtml;
}

function searchAge() {
    var startAge = parseInt(document.getElementById('startAge').value);
    var endAge = parseInt(document.getElementById('endAge').value);

    for (var index = 1; index < markers.length; index++) {
        if ((markers[index].age >= startAge) && (markers[index].age <= endAge)) {
            markers[index].setVisible(true);
        } else {
            markers[index].setVisible(false);
        }
    }
}

function placeTypeBoxAction(box, category, type) {
    if (box.checked) {
        showCheckedType(category, type);
    } else {
        hideUncheckedType(category, type);
    }
}

function showCheckedType(category, type) {
    var tempArr = [];

    for (var index = 0; index < markers.length; index++) {
        if (markers[index][type] === category) {
            markers[index].setVisible(true);
        }
        if (markers[index].getVisible()) {
            tempArr.push(markers[index]);
        }
    }
    clearAndAddMarkerToCluster(tempArr);
}

function hideUncheckedType(category, type) {
    var tempArr = [];

    for (var index = 0; index < markers.length; index++) {
        if (markers[index][type] === category) {
            markers[index].setVisible(false);
        }
        if (markers[index].getVisible()) {
            tempArr.push(markers[index]);
        }
    }
    clearAndAddMarkerToCluster(tempArr);
}

function uncheckAllBox() {

}

/**
 * get value from position type box
 */

function getBoxValue() {
    var objchk = document.getElementsByName("aed");
    var aedTypeArr = [];
    for (i = 0; i < objchk.length; i++) {
        if (objchk[i].checked == true) {
            aedTypeArr.push(objchk[i].value);
        }
    }
    deleteAllMarker(aedTypeArr);
}

google.maps.event.addDomListener(window, 'load', initialize);