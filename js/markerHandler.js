/*
 ** place marker to google map
 ** We have two type of markers - aed position (1) and patient position (2)
 */

function placeMarkerOhca(positions, map) {

    var tempMarkers = positions.map(function(position, index) {

        var ans = Cal_lonlat_To_twd97(positions[index].lat(), positions[index].lng());

        var marker = new google.maps.Marker({
            position: position,
            draggable: false,
            icon: 'image/red_marker_s.png',
            type: 1,
            lat: ans.Lat.toFixed(2),
            lng: ans.Lng.toFixed(2),
            address: objectArray[index + markers.length].placeAddress,
            placeType: objectArray[index + markers.length].placeType,
            useAed: objectArray[index + markers.length].useAed,
            sex: objectArray[index + markers.length].sex,
            age: objectArray[index + markers.length].age,
            aedResponse: objectArray[index + markers.length].aedResponse,
            arriveTime: objectArray[index + markers.length].arriveTime,
            leaveTime: objectArray[index + markers.length].leaveTime
        });

        google.maps.event.addListener(marker, 'click', function() {
            document.getElementById("title").style.color = "blue"; //test
        });

        google.maps.event.addListener(marker, 'rightclick', function() {
            marker.setIcon('image/pink_marker_s.png');
            document.getElementById("title").style.color = "red"; //test
        });

        google.maps.event.addListener(marker, 'visible_changed', function() {
            marker.setIcon('image/red_marker_s.png');
            document.getElementById("title").style.color = "red"; //test
        });

        google.maps.event.addListener(marker, 'mouseover', function() {
            showInfoOhca(map, marker);
            toggleBounce(map, marker);
        });

        google.maps.event.addListener(marker, 'mouseout', function() {
            if (infowindow) { infowindow.close(); }
            for (var index = 1; index < markers.length; index++) {
                markers[index].setAnimation(null);
            }
        });

        /*delete marker*/
        google.maps.event.addListener(marker, 'dblclick', function(e) {
            document.getElementById("title").style.color = "pink"; //test
            deleteMarker(e.latLng, map);
            printData();
            document.getElementById("num").innerHTML = "num: " + (node - deleteN);
        });

        return marker;
    });

    markers.push(...tempMarkers);
    clearAndAddMarkerToCluster(markers);
    // map.panTo(position);
}

function placeMarkerPad(positions, map) {
    var tempMarkers = positions.map(function(position, index) {
        var ans = Cal_lonlat_To_twd97(positions[index].lat(), positions[index].lng());
        stationCircle = new google.maps.Circle({
            strokeColor: '#ff0000',
            strokeOpacity: 0.8,
            strokeWeight: 0,
            fillColor: '#ff0000',
            fillOpacity: 0.35,
            center: position,
            map: map,
            radius: r,
            visible: true
        });
        var marker = new google.maps.Marker({
            position: position,
            draggable: false,
            icon: 'image/yellow_marker_s.png',
            type: 2,
            lat: ans.Lat.toFixed(2),
            lng: ans.Lng.toFixed(2),
            name: objectArray[index + markers.length].placeName,
            address: objectArray[index + markers.length].placeAddress,
            placeType: objectArray[index + markers.length].placeType,
            weekdaysOpenTime: objectArray[index + markers.length].weekdaysOpenTime,
            weekdaysCloseTime: objectArray[index + markers.length].weekdaysCloseTime,
            satOpenTime: objectArray[index + markers.length].satOpenTime,
            satCloseTime: objectArray[index + markers.length].satCloseTime,
            sunOpenTime: objectArray[index + markers.length].sunOpenTime,
            sunCloseTime: objectArray[index + markers.length].sunCloseTime,
            stationCircle: stationCircle
        });

        google.maps.event.addListener(marker, 'click', function() {
            document.getElementById("title").style.color = "blue"; //test
        });

        google.maps.event.addListener(marker, 'rightclick', function() {
            marker.setIcon('image/lightyellow_marker_s.png');
            document.getElementById("title").style.color = "red"; //test
        });

        google.maps.event.addListener(marker, 'visible_changed', function() {
            marker.setIcon('image/yellow_marker_s.png');
            document.getElementById("title").style.color = "red"; //test
        });

        google.maps.event.addListener(marker, 'mouseover', function() {
            showInfoPad(map, marker);
            toggleBounce(map, marker);
        });

        google.maps.event.addListener(marker, 'mouseout', function() {
            if (infowindow) { infowindow.close(); }
            for (var index = 1; index < markers.length; index++) {
                markers[index].setAnimation(null);
            }
        });

        /*delete marker*/
        google.maps.event.addListener(marker, 'dblclick', function(e) {
            document.getElementById("title").style.color = "pink"; //test
            deleteMarker(e.latLng, map);
            printData();
            document.getElementById("num").innerHTML = "num: " + (node - deleteN);
        });

        return marker;
    });

    markers.push(...tempMarkers);

    clearAndAddMarkerToCluster(markers);
}

/*
 **  get info from the input file and call placemarker to place markers on the map 
 */

function putMarkerPad(x, sheetName) {
    var latlngs = [];

    for (var index = 0; index < x[sheetName].length; index++) {

        var lat = x[sheetName][index]["地點LAT"];
        var lng = x[sheetName][index]["地點LNG"];
        var placeName = x[sheetName][index]["場所名稱"];
        var placeAddress = x[sheetName][index]["場所地址"];
        var placeType = x[sheetName][index]["場所分類"];
        var weekdaysOpenTime = x[sheetName][index]["周一至周五起"];
        var weekdaysCloseTime = x[sheetName][index]["周一至周五迄"];
        var satOpenTime = x[sheetName][index]["周六起"];
        var satCloseTime = x[sheetName][index]["周六迄"];
        var sunOpenTime = x[sheetName][index]["周日起"];
        var sunCloseTime = x[sheetName][index]["周日迄"];

        var latlng = new google.maps.LatLng(lat, lng);

        var obj = {
            data: 'pad',
            type: 2,
            lat: lat,
            lng: lng,
            placeName: placeName,
            placeAddress: placeAddress,
            placeType: placeType,
            weekdaysOpenTime: weekdaysOpenTime,
            weekdaysCloseTime: weekdaysCloseTime,
            satOpenTime: satOpenTime,
            satCloseTime: satCloseTime,
            sunOpenTime: sunOpenTime,
            sunCloseTime: sunCloseTime
        };

        latlngs.push(latlng);
        objectArray.push(obj);
    }
    placeMarkerPad(latlngs, map);
    createPlaceTypeCheckBox("pad", ["placeType"]);
}

function putMarkerOhca(x, sheetName) {
    var latlngs = [];

    for (var index = 0; index < x[sheetName].length; index++) {

        var lat = x[sheetName][index]["lat"];
        var lng = x[sheetName][index]["lng"];
        var placeAddress = x[sheetName][index]["address"];
        var placeType = x[sheetName][index]["事故地點型態"];
        var sex = x[sheetName][index]["性別"];
        var age = x[sheetName][index]["年齡"]
        var useAed = x[sheetName][index]["AED使用"];
        var aedResponse = x[sheetName][index]["AED資料回傳"];
        var arriveTime = x[sheetName][index]["到達現場日期時間"];
        var leaveTime = x[sheetName][index]["離開現場日期時間"];

        var latlng = new google.maps.LatLng(lat, lng);

        var obj = {
            data: 'ohca',
            type: 1,
            lat: lat,
            lng: lng,
            placeAddress: placeAddress,
            placeType: placeType,
            sex: sex,
            age: age,
            useAed: useAed,
            aedResponse: aedResponse,
            arriveTime: arriveTime,
            leaveTime: leaveTime
        };

        latlngs.push(latlng);
        objectArray.push(obj);
    }

    placeMarkerOhca(latlngs, map);
    createPlaceTypeCheckBox("ohca", ["placeType", "sex", "age"]);
}

function putMarker2(arr) {
    for (index in objectArray) {
        arr.forEach(function(value) {
            if (objectArray[index].aedType === value) {
                var latlng = new google.maps.LatLng(objectArray[index].lat, objectArray[index].lng);

                placeMarkerOhca(latlng, map);

                markers[node].name = objectArray[index].placeName;
                markers[node].lat = objectArray[index].lat;
                markers[node].lng = objectArray[index].lng;
                markers[node].aedType = objectArray[index].aedType;
                markers[node].weekdaysOpenTime = objectArray[index].weekdaysOpenTime;
                markers[node].weekdaysCloseTime = objectArray[index].weekdaysCloseTime;
                markers[node].satOpenTime = objectArray[index].satOpenTime;
                markers[node].satCloseTime = objectArray[index].satCloseTime;
                markers[node].sunOpenTime = objectArray[index].sunOpenTime;
                markers[node].sunCloseTime = objectArray[index].sunCloseTime;
            }
        })
    }
}

/*
 ** marker animation
 */
function toggleBounce(Map, Marker) {

    for (var index = 1; index < markers.length; index++) {
        if (markers[index] == Marker) {; } else if (Marker.getAnimation() != null) {
            markers[index].setAnimation(null);
        }
    }
    Marker.setAnimation(google.maps.Animation.BOUNCE);
}

/*
 ** show info on the web
 */

function printData(type) {
    x = document.getElementById("printArea");
    x.innerHTML = "";
    for (var index in markers) {
        var skip = 0;
        if (skip == 0) {
            if ((markers[index].type == 1 && choose.spot.checked) || (markers[index].type == 2 && choose.station.checked)) {

                overJs = "map.panTo(markers[" + index + "].getPosition()) + showInfo(map , markers[" + index + "]) + toggleBounce(map , markers[" + index + "] );";
                outJs = "if (infowindow){ infowindow.close(); }\
							for(index in markers) {\
								markers[index].setAnimation(null);\
							}";
                doubleJs = "deleteMarker(markers[" + index + "].getPosition(), map);" +
                    "printData();"
                "document.getElementById(\"num\").innerHTML=\"+num: \" + (node-deleteN);"; {
                    x.innerHTML += "<span style='cursor:pointer;' onmouseover=\"" + overJs + "\" onmouseout=\"" + outJs + "\" ondblclick=\"" + doubleJs + "\">" +
                        (index + ".\t" +
                            "lat:\t" + markers[index].lat +
                            "\tlng:\t" + markers[index].lng +
                            "\tname:\t" + markers[index].name +
                            "\tweight:\t" + markers[index].weight +
                            "\ttype:\t" + markers[index].type +
                            "</span>" + "<br>");
                }
            }
        }
    }

}

/*
 **  show info when mouse is on the marker
 */

function showInfoPad(Map, Marker) {
    if (infowindow) { infowindow.close(); }

    infowindow.setContent(InfoContentPad(Marker));
    infowindow.open(Map, Marker);
}

function showInfoOhca(Map, Marker) {
    if (infowindow) { infowindow.close(); }

    infowindow.setContent(InfoContentOhca(Marker));
    infowindow.open(Map, Marker);
}

function InfoContentPad(Marker) {
    content = "";
    content += "lat: " + Marker.getPosition().lat() + "<br>";
    content += "lng: " + Marker.getPosition().lng() + "<br>";
    content += "name: " + Marker.name + "<br>";
    content += "placeType: " + Marker.placeType + "<br>";
    content += "weekdaysOpenTime: " + Marker.weekdaysOpenTime + "<br>";
    content += "weekdaysCloseTime: " + Marker.weekdaysCloseTime + "<br>";
    content += "satOpenTime: " + Marker.satOpenTime + "<br>";
    content += "satCloseTime: " + Marker.satCloseTime + "<br>";
    content += "sunOpenTime: " + Marker.sunOpenTime + "<br>";
    content += "sunCloseTime: " + Marker.sunCloseTime + "<br>";

    return content;
}

function InfoContentOhca(Marker) {
    content = "";
    content += "lat: " + Marker.getPosition().lat() + "<br>";
    content += "lng: " + Marker.getPosition().lng() + "<br>";
    content += "address: " + Marker.address + "<br>";
    content += "placeType: " + Marker.placeType + "<br>";
    content += "useAed: " + Marker.useAed + "<br>";
    content += "aedResponse: " + Marker.aedResponse + "<br>";
    content += "arriveTime: " + Marker.arriveTime + "<br>";
    content += "leaveTime: " + Marker.leaveTime + "<br>";

    return content;
}

function clearAndAddMarkerToCluster(markers) {
    markersCluster.clearMarkers();
    markersCluster.addMarkers(markers, false);
    markersCluster.fitMapToMarkers();

    for (let i = 0; i < markers.length; i++) {
        // if (markers[i].isAdded) {
        //     console.log(markers[i].name);
        // }
        // console.log(markers[i].name);
        // console.log(markersCluster.markers_[i].isAdded);

    }

}

/*
 ** marker operating
 */

function deleteMarker(position, map) {

    //delete index th marker
    for (var index in markers) {
        if (position.equals(markers[index].getPosition()))
            break;
    }
    markers[index].setMap(null);

    objectArray.removeByName(markers[index].name)

    deleteN++;

}

function deleteAllMarker(aedTypeArr) {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    node = 0;
    markers = [];
    markers2 = [];
    putMarker2(aedTypeArr);
}

function insertMarkerInfo1(lat, lng) {
    x = prompt('please input name and weight \nex. tainan train station, 1');
    if (x == null) {
        markers[node].name = "no";
        markers[node].weight = 1;
        markers[node].setMap(null);
        deleteN++;
    } else
        saveMarkerInfo1(x, lat, lng);
}

function saveMarkerInfo1(x, lat, lng) {
    comma = x.indexOf(',');
    if (x == 'undefined') {
        markers[node].name = "no";
        markers[node].weight = 1;
    } else {
        markers[node].name = x.substring(0, comma);
        markers[node].weight = parseInt(x.substring(comma + 1, x.length));
    }
    var infoInPrint = new Object()
    infoInPrint.Name = markers[node].name;
    infoInPrint.Weight = markers[node].weight;
    infoInPrint.Type = 1;
    infoInPrint.Lat = lat;
    infoInPrint.Lng = lng;
    objectArray.push(infoInPrint);
}

function insertMarkerInfo2(lat, lng) {
    x = prompt('please input name\nex. tainan train station');
    if (x == null) {
        markers[node].name = "no";
        markers[node].weight = 0;
        markers[node].setMap(null);
        deleteN++;
    } else
        saveMarkerInfo2(x, lat, lng);
}

function saveMarkerInfo2(x, lat, lng) {

    if (x == 'undefined') {
        markers[node].name = "no";
        markers[node].weight = 0;
    } else {
        markers[node].name = x;
        markers[node].weight = 0;
    }

    var infoInPrint = new Object()

    infoInPrint.Name = markers[node].name;
    infoInPrint.Weight = markers[node].weight;
    infoInPrint.Lat = lat;
    infoInPrint.Lng = lng;
    infoInPrint.Type = 2;

    objectArray.push(infoInPrint);
}

/*
 ** 1. paint marker radius on map
 ** 2. count amount of outside points
 */

function setRadius() {
    r = parseInt(document.getElementById("service_radius").value);
    for (let i = 0; i < markers.length; i++) {
        if (markers[i].type === 2) {
            markers[i].stationCircle.setRadius(parseInt(r));
        }
    }
    amountOfOutsidePoints(r);
}

function setServiceCircle(position, map, radius) {
    google.maps.event.addDomListener(
        document.getElementById('service_button'), 'click',
        function() {
            for (let i = 0; i < markers.length; i++) {
                markers[index].setRadius(parseInt(document.getElementById('service_radius').value));
            }
        });
}