// global variables
var r = 300; // radius
// if there is no station near spot within r and vice versa

var pso2_inipar = 1;
var nStaArray = [];

var nsta;

var node = 0;
var deleteN = 0;
var deleteP = [];
var geocoder;
var markers = [];
var map;
var infowindow = new google.maps.InfoWindow();

var a = 6378137.0;
var b = 6356752.314245;
var long0 = 121 * Math.PI / 180;
var k0 = 0.9999;
var dx = 250000;
var objectArray = [];
var database;

var stationCircle;
var circleArray = [];
var result;

/*
 **  initialize google map
 */

function initialize() {
    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(22.997864, 120.223732),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    geocoder = new google.maps.Geocoder();

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
        placeMarker1(e.latLng, map);
        document.getElementById("num").innerHTML = "num: " + (node - deleteN);
        document.getElementById("location").innerHTML = "lat: " + markers[node].getPosition().lat() +
            "<br>" + "lng: " + markers[node].getPosition().lng();
        insertMarkerInfo1(markers[node].getPosition().lat(), markers[node].getPosition().lng());
        printData(1); // 1&2 the same (revise)
    });

    google.maps.event.addListener(map, 'rightclick', function(e) {
        placeMarker2(e.latLng, map);
        document.getElementById("num").innerHTML = "num: " + (node - deleteN);
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
 ** place marker to google map
 ** We have two type of markers - aed position and patient position
 */

function placeMarker1(position, map) {
    var marker = new google.maps.Marker({
        map: map,
        position: position,
        draggable: true,
        icon: 'red_marker_s.png'
    });
    node++;
    var ans = Cal_lonlat_To_twd97(position.lat(), position.lng());

    markers[node] = marker;
    markers[node].type = 1;
    markers[node].lat = ans.Lat.toFixed(2);
    markers[node].lng = ans.Lng.toFixed(2);


    map.panTo(position);

    google.maps.event.addListener(marker, 'click', function() {
        document.getElementById("title").style.color = "blue"; //test
    });

    google.maps.event.addListener(marker, 'rightclick', function() {
        marker.setIcon('pink_marker_s.png');
        document.getElementById("title").style.color = "red"; //test
    });

    google.maps.event.addListener(marker, 'visible_changed', function() {
        marker.setIcon('red_marker_s.png');
        document.getElementById("title").style.color = "red"; //test
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
        showInfo(map, marker);
        toggleBounce(map, marker);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        if (infowindow) { infowindow.close(); }
        for (var index = 1; index < markers.length; index++) {
            markers[index].setAnimation(null);
        }
    });

    google.maps.event.addListener(marker, 'drag', function() {
        if (infowindow) { infowindow.close(); }
    });

    /*drag marker*/
    google.maps.event.addListener(marker, 'dragend', function() {
        printData();
        showInfo(map, marker);
        toggleBounce(map, marker);
        objectArray.adjustByMarker(marker);
        document.getElementById("title").style.color = "red"; //test
    });

    /*delete marker*/
    google.maps.event.addListener(marker, 'dblclick', function(e) {
        document.getElementById("title").style.color = "pink"; //test
        deleteMarker(e.latLng, map);
        printData();
        document.getElementById("num").innerHTML = "num: " + (node - deleteN);
    });
}

function placeMarker2(position, map) {
    var marker = new google.maps.Marker({
        map: map,
        position: position,
        draggable: true,
        icon: 'yellow_marker_s.png'
    });

    setServiceCircle(position, map, r);
    var ans = Cal_lonlat_To_twd97(position.lat(), position.lng());

    node++;
    markers[node] = marker;
    markers[node].type = 2;
    markers[node].lat = ans.Lat.toFixed(2);
    markers[node].lng = ans.Lng.toFixed(2);
    map.panTo(position);

    google.maps.event.addListener(marker, 'click', function() {
        document.getElementById("title").style.color = "blue"; //test
    });

    google.maps.event.addListener(marker, 'rightclick', function() {
        marker.setIcon('lightyellow_marker_s.png');
        document.getElementById("title").style.color = "red"; //test
    });

    google.maps.event.addListener(marker, 'visible_changed', function() {
        marker.setIcon('yellow_marker_s.png');
        document.getElementById("title").style.color = "red"; //test
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
        showInfo(map, marker);
        toggleBounce(map, marker);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        if (infowindow) { infowindow.close(); }
        for (var index = 1; index < markers.length; index++) {
            markers[index].setAnimation(null);
        }
    });

    google.maps.event.addListener(marker, 'drag', function() {
        if (infowindow) { infowindow.close(); }
    });

    /*drag marker*/
    google.maps.event.addListener(marker, 'dragend', function() {
        printData();
        showInfo(map, marker);
        toggleBounce(map, marker);
        objectArray.adjustByMarker(marker);
        document.getElementById("title").style.color = "red"; //test
    });


    /*delete marker*/
    google.maps.event.addListener(marker, 'dblclick', function(e) {
        document.getElementById("title").style.color = "pink"; //test
        deleteMarker(e.latLng, map);
        printData();
        document.getElementById("num").innerHTML = "num: " + (node - deleteN);
    });
}

function toggleBounce(Map, Marker) {

    for (var index = 1; index < markers.length; index++) {
        if (markers[index] == Marker) {; } else if (Marker.getAnimation() != null) {
            markers[index].setAnimation(null);
        }
    }
    Marker.setAnimation(google.maps.Animation.BOUNCE);
}

function showInfo(Map, Marker) {

    if (infowindow) { infowindow.close(); }
    infowindow.setContent(InfoContent(Marker));

    infowindow.open(Map, Marker);

}

function InfoContent(Marker) {
    //nth marker
    for (var index in markers) {
        if (Marker.getPosition().equals(markers[index].getPosition()))
            break;
    }
    content = "";
    content += "lat: " + Marker.getPosition().lat() + "<br>";
    content += "lng: " + Marker.getPosition().lng() + "<br>";
    content += "name: " + markers[index].name + "<br>";
    content += "aedType: " + markers[index].aedType + "<br>";
    content += "weekdaysOpenTime: " + markers[index].weekdaysOpenTime + "<br>";
    content += "weekdaysCloseTime: " + markers[index].weekdaysCloseTime + "<br>";
    content += "satOpenTime: " + markers[index].satOpenTime + "<br>";
    content += "satCloseTime: " + markers[index].satCloseTime + "<br>";
    content += "sunOpenTime: " + markers[index].sunOpenTime + "<br>";
    content += "sunCloseTime: " + markers[index].sunCloseTime + "<br>";

    return content;
}

function deleteMarker(position, map) {

    //delete index th marker
    for (var index in markers) {
        if (position.equals(markers[index].getPosition()))
            break;
    }
    markers[index].setMap(null);

    objectArray.removeByName(markers[index].name)

    deleteN++;
    deleteP[deleteN] = index;

}

function insertMarkerInfo1(lat, lng) {
    x = prompt('please input name and weight \nex. tainan train station, 1');
    if (x == null) {
        markers[node].name = "no";
        markers[node].weight = 1;
        markers[node].setMap(null);
        deleteN++;
        deleteP[deleteN] = node;
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
        deleteP[deleteN] = node;
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


function printData(type) {
    x = document.getElementById("printArea");
    x.innerHTML = "";
    for (var index in markers) {
        var skip = 0;
        for (var d in deleteP) {
            if (index == deleteP[d]) {
                skip = 1;
                break;
            }
        }
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

function setServiceCircle(position, map, radius) {
    stationCircle = new google.maps.Circle({
        strokeColor: '#ff0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ff0000',
        fillOpacity: 0.35,
        center: position,
        map: map,
        radius: radius
    });

    circleArray.push(stationCircle);
    google.maps.event.addDomListener(
        document.getElementById('service_button'), 'click',
        function() {
            for (var index in circleArray) {
                circleArray[index].setRadius(parseInt(document.getElementById('service_radius').value));
            }
        });
}

function setRadius() {
    r = parseInt(document.getElementById("service_radius").value);
    amountOfOutsidePoints();
}

function countdis(spot, station) { //distance
    var d = Math.sqrt(Math.pow(spot.Lat - station.Lat, 2) + Math.pow(spot.Lng - station.Lng, 2));
    return (d);
}

function amountOfOutsidePoints() {

    var amount = 0;
    var spotAmount = 0;
    for (var index in objectArray) {
        if (objectArray[index].Type == 1) {
            spotAmount++;
            for (var temp in objectArray) {
                var signal = 1;
                if (objectArray[temp].Type == 2) {
                    var spot = Cal_lonlat_To_twd97(objectArray[index].Lat, objectArray[index].Lng);
                    var station = Cal_lonlat_To_twd97(objectArray[temp].Lat, objectArray[temp].Lng);

                    if (countdis(spot, station) < r) {
                        signal = 0;
                        break;
                    }
                }
            }
            if (signal == 0) amount++;
        }
    }
    document.getElementById('outsidePoints').innerHTML = "景點數量: " + spotAmount + "</br> 服務範圍外景點數量: " + (spotAmount - amount) + "</br> 服務範圍外景點整體比例: " + ((spotAmount - amount) / spotAmount * 100).toFixed(2) + "%";
}

function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {}
    });
}

function codeLatLng() {
    var input = document.getElementById('latlng').value;
    var latlngStr = input.split(',', 2);
    var lat = parseFloat(latlngStr[0]);
    var lng = parseFloat(latlngStr[1]);
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ 'latLng': latlng }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                map.setCenter(latlng);
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}

function latlngToAddress(index, callback) {

    //var address;
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(markers[index].getPosition().lat(), markers[index].getPosition().lng());
    setTimeout(function() {

        geocoder.geocode({ 'latLng': latlng }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {

                    lo = results[0].formatted_address;
                    document.getElementById("title").style.color = "green"; //test
                    document.getElementById("adr").innerHTML = "address: " + results[0].formatted_address;
                    markers[index].address = lo;
                    markers[index].address = results[0].formatted_address;

                    callback(results[0].formatted_address);

                } else {
                    alert('No results found');
                }
            } else {}
        });

    }, 200);



}

function boxclick(box, category) {
    if (box.checked) {
        show(category);
    } else {
        hide(category);
    }
    printData();

}

function show(category) {
    for (var index in markers) {
        var skip = 0;
        for (var d in deleteP) {
            if (index == deleteP[d]) {
                skip = 1;
                break;
            }
        }
        if (skip == 0) {
            if (markers[index].type == category) {
                markers[index].setVisible(true);
            }
        }
    }
}

function hide(category) {
    for (var index in markers) {
        var skip = 0;
        for (var d in deleteP) {
            if (index == deleteP[d]) {
                skip = 1;
                break;
            }
        }
        if (skip == 0) {
            if (markers[index].type == category) {
                markers[index].setVisible(false);
            }
        }
    }
}

function createFile() {
    var userName = prompt("請輸入學號", "未輸入學號");
    var timestamp = Date.now()
    for (var i = 0; i < objectArray.length; i++) {
        writeUserData(userName, objectArray[i].Name, objectArray[i].Lat, objectArray[i].Lng, objectArray[i].Weight, objectArray[i].Type, timestamp)
    }
}

function readFile() {
    var name = prompt("Please enter your id")
    readUserData(name)
}

function putMarker(x) {

    for (var index = 0; index < x["工作表1"].length; index++) {

        // var id = x.substring(x.indexOf('id:', x.indexOf(line + '. ')) + 4, x.indexOf(' ', x.indexOf('id:', x.indexOf(line + '. ')) + 4));
        var lat = x["工作表1"][index]["地點LAT"];
        var lng = x["工作表1"][index]["地點LNG"];
        var placeName = x["工作表1"][index]["場所名稱"];
        var placeAddress = x["工作表1"][index]["場所地址"];
        var placeType = x["工作表1"][index]["場所分類"];
        var aedType = x["工作表1"][index]["AED型號"];
        var weekdaysOpenTime = x["工作表1"][index]["周一至周五起"];
        var weekdaysCloseTime = x["工作表1"][index]["周一至周五迄"];
        var satOpenTime = x["工作表1"][index]["周六起"];
        var satCloseTime = x["工作表1"][index]["周六迄"];
        var sunOpenTime = x["工作表1"][index]["周日起"];
        var sunCloseTime = x["工作表1"][index]["周日迄"];

        var latlng = new google.maps.LatLng(lat, lng);

        var obj = {
            lat: lat,
            lng: lng,
            placeName: placeName,
            placeAddress: placeAddress,
            placeType: placeType,
            aedType: aedType,
            weekdaysOpenTime: weekdaysOpenTime,
            weekdaysCloseTime: weekdaysCloseTime,
            satOpenTime: satOpenTime,
            satCloseTime: satCloseTime,
            sunOpenTime: sunOpenTime,
            sunCloseTime: sunCloseTime
        };
        objectArray.push(obj);

        placeMarker1(latlng, map);

        markers[node].name = placeName;
        markers[node].lat = lat;
        markers[node].lng = lng;
        markers[node].aedType = aedType;
        markers[node].weekdaysOpenTime = weekdaysOpenTime;
        markers[node].weekdaysCloseTime = weekdaysCloseTime;
        markers[node].satOpenTime = satOpenTime;
        markers[node].satCloseTime = satCloseTime;
        markers[node].sunOpenTime = sunOpenTime;
        markers[node].sunCloseTime = sunCloseTime;

        // printData();
        // node++;
    }
}

function putMarker2(arr) {
    for (index in objectArray) {
        arr.forEach(function(value) {
            if (objectArray[index].aedType === value) {
                var latlng = new google.maps.LatLng(objectArray[index].lat, objectArray[index].lng);
                console.log(objectArray[index].aedType)

                placeMarker1(latlng, map);

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

function TWD67toTWD97(E67, N67) {
    var A = 0.00001549
    var B = 0.000006521

    var E97 = E67 + 807.8 + A * E67 + B * N67
    var N97 = N67 - 248.6 + A * N67 + B * E67
    return { Lat: N97, Lng: E97 }
}

function TWD97toTWD67(E97, N97) {
    var A = 0.00001549
    var B = 0.000006521

    var E67 = E97 - 807.8 - A * E97 - B * N97
    var N67 = N97 + 248.6 - A * N97 - B * E97

    return { Lat: N67, Lng: E67 }
}

function Cal_TWD97_To_lonlat(x, y) {
    dy = 0;
    e = Math.pow((1 - Math.pow(b, 2) / Math.pow(a, 2)), 0.5);

    x -= dx;
    y -= dy;

    // Calculate the Meridional Arc
    M = y / k0;

    // Calculate Footprint Latitude
    mu = M / (a * (1.0 - Math.pow(e, 2) / 4.0 - 3 * Math.pow(e, 4) / 64.0 - 5 * Math.pow(e, 6) / 256.0));
    e1 = (1.0 - Math.pow((1.0 - Math.pow(e, 2)), 0.5)) / (1.0 + Math.pow((1.0 - Math.pow(e, 2)), 0.5));

    J1 = (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32.0);
    J2 = (21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32.0);
    J3 = (151 * Math.pow(e1, 3) / 96.0);
    J4 = (1097 * Math.pow(e1, 4) / 512.0);

    fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);

    // Calculate Latitude and Longitude

    e2 = Math.pow((e * a / b), 2);
    C1 = Math.pow(e2 * Math.cos(fp), 2);
    T1 = Math.pow(Math.tan(fp), 2);
    R1 = a * (1 - Math.pow(e, 2)) / Math.pow((1 - Math.pow(e, 2) * Math.pow(Math.sin(fp), 2)), (3.0 / 2.0));
    N1 = a / Math.pow((1 - Math.pow(e, 2) * Math.pow(Math.sin(fp), 2)), 0.5);

    D = x / (N1 * k0);

    // 計算緯度
    Q1 = N1 * Math.tan(fp) / R1;
    Q2 = (Math.pow(D, 2) / 2.0);
    Q3 = (5 + 3 * T1 + 10 * C1 - 4 * Math.pow(C1, 2) - 9 * e2) * Math.pow(D, 4) / 24.0;
    Q4 = (61 + 90 * T1 + 298 * C1 + 45 * Math.pow(T1, 2) - 3 * Math.pow(C1, 2) - 252 * e2) * Math.pow(D, 6) / 720.0;
    lat = fp - Q1 * (Q2 - Q3 + Q4);

    // 計算經度
    Q5 = D;
    Q6 = (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6;
    Q7 = (5 - 2 * C1 + 28 * T1 - 3 * Math.pow(C1, 2) + 8 * e2 + 24 * Math.pow(T1, 2)) * Math.pow(D, 5) / 120.0;
    lon = long0 + (Q5 - Q6 + Q7) / Math.cos(fp);

    lat = (lat * 180) / Math.PI; //緯
    lon = (lon * 180) / Math.PI; //經


    return { Lat: lat, Lng: lon }
}

var a = 6378137.0;
var b = 6356752.314245;
var lon0 = 121 * Math.PI / 180;
var k0 = 0.9999;
var dx = 250000;

function Cal_lonlat_To_twd97(lat, lon) {
    TWD97 = "";

    lon = (lon / 180) * Math.PI;
    lat = (lat / 180) * Math.PI;

    //---------------------------------------------------------
    e = Math.pow((1 - Math.pow(b, 2) / Math.pow(a, 2)), 0.5);
    e2 = Math.pow(e, 2) / (1 - Math.pow(e, 2));
    n = (a - b) / (a + b);
    nu = a / Math.pow((1 - (Math.pow(e, 2)) * (Math.pow(Math.sin(lat), 2))), 0.5);
    p = lon - lon0;
    A = a * (1 - n + (5 / 4) * (Math.pow(n, 2) - Math.pow(n, 3)) + (81 / 64) * (Math.pow(n, 4) - Math.pow(n, 5)));
    B = (3 * a * n / 2.0) * (1 - n + (7 / 8.0) * (Math.pow(n, 2) - Math.pow(n, 3)) + (55 / 64.0) * (Math.pow(n, 4) - Math.pow(n, 5)));
    C = (15 * a * (Math.pow(n, 2)) / 16.0) * (1 - n + (3 / 4.0) * (Math.pow(n, 2) - Math.pow(n, 3)));
    D = (35 * a * (Math.pow(n, 3)) / 48.0) * (1 - n + (11 / 16.0) * (Math.pow(n, 2) - Math.pow(n, 3)));
    E = (315 * a * (Math.pow(n, 4)) / 51.0) * (1 - n);

    S = A * lat - B * Math.sin(2 * lat) + C * Math.sin(4 * lat) - D * Math.sin(6 * lat) + E * Math.sin(8 * lat);

    //計算Y值
    K1 = S * k0;
    K2 = k0 * nu * Math.sin(2 * lat) / 4.0;
    K3 = (k0 * nu * Math.sin(lat) * (Math.pow(Math.cos(lat), 3)) / 24.0) * (5 - Math.pow(Math.tan(lat), 2) + 9 * e2 * Math.pow((Math.cos(lat)), 2) + 4 * (Math.pow(e2, 2)) * (Math.pow(Math.cos(lat), 4)));
    y = K1 + K2 * (Math.pow(p, 2)) + K3 * (Math.pow(p, 4));

    //計算X值
    K4 = k0 * nu * Math.cos(lat);
    K5 = (k0 * nu * (Math.pow(Math.cos(lat), 3)) / 6.0) * (1 - Math.pow(Math.tan(lat), 2) + e2 * (Math.pow(Math.cos(lat), 2)));
    x = K4 * p + K5 * (Math.pow(p, 3)) + dx;

    return { Lat: y, Lng: x }
}

function countdis(spot, station) { //distance
    var d = Math.sqrt(Math.pow(spot.Lat - station.Lat, 2) + Math.pow(spot.Lng - station.Lng, 2));

    return (d);
}

function readspot() {
    var line = 1;
    var spotI = 0;
    //var stationI=0;
    var weightA = new Array();
    while (1) {
        if (line > objectArray.length) break;
        var skip = 0;

        if (skip == 0) {
            var temp = Cal_lonlat_To_twd97(objectArray[line - 1].Lat, objectArray[line - 1].Lng)
            var obj = {
                Lat: temp.Lat,
                Lng: temp.Lng,
                Weight: objectArray[line - 1].Weight
            };
            if (objectArray[line - 1].Type == 1) {
                tempspot[spotI] = obj;
                tempspot[spotI].num = line;
                spotI++;
            }
        }
        line++;
    }
    num_spot = spotI;
}

function readstation() {
    var line = 1;
    var stationI = 0;
    var weightA = new Array();
    while (1) {

        if (line > total) break;
        var skip = 0;
        if (skip == 0) {
            var temp = Cal_lonlat_To_twd97(objectArray[line - 1].Lat, objectArray[line - 1].Lng)
            var obj = {
                Lat: temp.Lat,
                Lng: temp.Lng
                    //Weight:weight
            };

            if (objectArray[line - 1].Type == 2) {
                tempstation[stationI] = obj;
                tempstation[stationI].num = line;
                stationI++;
            }
        }
        line++;
    }
    now_num_station = stationI;
}

// turn back to original color
function test() {
    for (var index in markers) {
        if (markers[index].type == 1) {
            google.maps.event.trigger(markers[index], 'visible_changed');
        } else if (markers[index].type == 2) {
            google.maps.event.trigger(markers[index], 'visible_changed');
        }
    }
}

function deleteAllMarker(aedTypeArr) {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    node = 0;
    markers = [];
    markers2 = [];
    console.log("hi")
    putMarker2(aedTypeArr);

    // deleteP = new Array();
    // particle = new Array(num_par);
    // tempspot = new Array(num_spot);
    // tempstation = new Array(num_station);
    // gbest = new Array(num_station);
    // document.getElementById("num").innerHTML = "num: " + (node - deleteN);
    // document.getElementById("location").innerHTML = "lat:  " + "<br>" + "lng:  ";
    // printData();
}

function deleteStationMarker() {
    for (var index in markers) {
        if (markers[index].type == 2) {
            markers[index].setMap(null);
            deleteN++;
            deleteP[deleteN] = index;
        }
    }
}

// to read file into web
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                console.log(i);
                // Render thumbnail.
                result = e.target.result;
                var arr = String.fromCharCode.apply(null, new Uint8Array(result));
                var wb = XLSX.read(btoa(arr), { type: 'base64' });
                output = to_json(wb);
                putMarker(output);
                alert("read ok!");
            };
        })(f);

        // Read in the image file as a data URL.
        var data = reader.readAsArrayBuffer(f);
    }
}

function process_wb(wb) {
    var output = "";
    switch (get_radio_value("format")) {
        case "json":
            output = JSON.stringify(to_json(wb), 2, 2);
            break;
        case "form":
            output = to_formulae(wb);
            break;
        default:
            output = to_csv(wb);
    }
    if (out.innerText === undefined) out.textContent = output;
    else out.innerText = output;
}

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function(sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
            result[sheetName] = roa;
        }
    });
    return result;
}

var to_fmla = function to_fmla(workbook) {
    var result = [];
    workbook.SheetNames.forEach(function(sheetName) {
        var formulae = X.utils.get_formulae(workbook.Sheets[sheetName]);
        if (formulae.length) {
            result.push("SHEET: " + sheetName);
            result.push("");
            result.push(formulae.join("\n"));
        }
    });
    return result.join("\n");
};

var to_html = function to_html(workbook) {
    HTMLOUT.innerHTML = "";
    workbook.SheetNames.forEach(function(sheetName) {
        var htmlstr = X.write(workbook, { sheet: sheetName, type: 'string', bookType: 'html' });
        HTMLOUT.innerHTML += htmlstr;
    });
    return "";
};

function writeUserData(userName, name, lat, lng, weight, type, timestamp) {
    database.ref('users/' + userName).child(name).set({
        lat: lat,
        lng: lng,
        weight: weight,
        type: type,
        timestamp: timestamp
    });
}

function writeNewData(userName, name, lat, lng, weight, type, timestamp) {
    var newData = {
        lat: lat,
        lng: lng,
        weight: weight,
        type: type,
        timestamp: timestamp
    };

    var updates = {}
    updates['users/' + userName + '/' + name] = newData;

    return firebase.database().ref().update(updates);
}

function readUserData(userName) {
    var dataRef = firebase.database().ref('users/' + userName);
    dataRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var obj = {
                Name: childKey,
                Lat: childData.lat,
                Lng: childData.lng,
                Type: childData.type,
                Weight: childData.weight
            }
            var latlng = new google.maps.LatLng(obj.Lat, obj.Lng);
            objectArray.push(obj)
            if (obj.Type == 1) { placeMarker1(latlng, map); } else if (obj.Type == 2) {
                placeMarker2(latlng, map);
                nStaArray.push(obj);
            }
            markers[node].name = obj.Name;
            markers[node].weight = obj.Weight;
            printData();
        })
    })
}

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

Array.prototype.removeByName = function() {
    var what, a = arguments,
        L = a.length,
        index = 0;
    what = a[--L];
    for (var i = 0; i < this.length; i++) {
        if (what == this[i].Name) {
            this.splice(i, 1);
        }
    }

    return this;
};

Array.prototype.adjustByMarker = function() {
    var what, a = arguments,
        L = a.length,
        index = 0;
    what = a[--L];
    for (var i = 0; i < this.length; i++) {
        if (what.name == this[i].Name) {
            this[i].Lat = what.getPosition().lat();
            this[i].Lng = what.getPosition().lng();
        }
    }

    return this
}

google.maps.event.addDomListener(window, 'load', initialize);