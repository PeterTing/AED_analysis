/**
 * change xlsx to another format
 */

/**
 * change xlsx to another format
 */

/*
 **  store and get info to and from firebase
 */

function createFileToFirebase() {
    var userName = prompt("請輸入學號", "未輸入學號");
    var timestamp = Date.now()
    for (var i = 0; i < objectArray.length; i++) {
        writeUserData(userName, objectArray[i].Name, objectArray[i].Lat, objectArray[i].Lng, objectArray[i].Weight, objectArray[i].Type, timestamp)
    }
}

function readFile() {
    var name = prompt("Please enter your id")
    readUserDataFromFirebase(name)
}

function writeUserData(userName, name, lat, lng, weight, type, timestamp) {
    database.ref('users/' + userName).child(name).set({
        lat: lat,
        lng: lng,
        weight: weight,
        type: type,
        timestamp: timestamp
    });
}

function writeNewDataToFirebase(userName, name, lat, lng, weight, type, timestamp) {
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

function readUserDataFromFirebase(userName) {
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
            if (obj.Type == 1) { placeMarkerOhca(latlng, map); } else if (obj.Type == 2) {
                placeMarkerPad(latlng, map);
                nStaArray.push(obj);
            }
            markers[node].name = obj.Name;
            markers[node].weight = obj.Weight;
            printData();
        })
    })
}

/*
 **  set map center and get latlng from google by address
 */

function codeAddress(address, index, callback) {
    var address = address;
    setTimeout(function() {
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                callback(index, address, results[0].geometry.location.lat(), results[0].geometry.location.lng(), status);
            } else {
                callback(index, address, null, null, status);
            }

        });
    }, index * 1000);
}

/**
 *  transform address to latlng functions
 */

function getLatLng(x, sheetName) {
    var data = [];

    data.push(["index", "address", "lat", "lng", "status"]);

    for (var index = 0; index < x[sheetName].length; index++) {
        var address = x[sheetName][index]["發生地址"];
        // console.log(address);
        codeAddress(address, index, function(index, address, lat, lng, status) {
            data.push([index, address, lat, lng, status]);
            console.log(index + " " + address + " " + lat + " " + lng + " " + status);

            if ((index + 1) === x["ohca"].length) {
                data.sort(function(first, second) {
                    return first[0] - second[0];
                });
                writeWorkbook(data, "ohca+latlng.xlsx", "page1");
            }
        });
    }
}

// request latlng from google by address again (only failed address)

function requestLatlngFromGoogleAgain(x, sheetName) {

    var data = [];
    var failedStatusIndex = [];

    data.push(["index", "address", "lat", "lng", "status"]);


    for (var index = 0; index < x[sheetName].length; index++) {

        var address = x[sheetName][index].address;
        var status = x[sheetName][index].status;
        var lat = x[sheetName][index].lat;
        var lng = x[sheetName][index].lng;
        var dataIndex = x[sheetName][index].index;

        if (status === "OVER_QUERY_LIMIT") {
            failedStatusIndex.push(dataIndex);
        } else {
            data.push([dataIndex, address, lat, lng, status]);
        }
    }

    for (let index = 0; index < failedStatusIndex.length; index++) {
        var address = x[sheetName][failedStatusIndex[index]].address;
        var status = x[sheetName][failedStatusIndex[index]].status;

        codeAddress(address, index, function(index, address, lat, lng, status) {
            data.push([failedStatusIndex[index], address, lat, lng, status]);
            console.log("data" + failedStatusIndex[index] + " " + address + " " + lat + " " + lng + " " + status);

            if (index === failedStatusIndex.length - 1) {
                data.sort(function(first, second) {
                    return first[0] - second[0];
                });
                writeWorkbook(data, "afterCorrection.xlsx", "page1");
            }
        });
    }
}

// output xlsx to local

function writeWorkbook(data, fileName, workSheetName) {
    var fileName = fileName;
    var ws_name = workSheetName;
    var wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, fileName);
}

/**
 *  file handler
 */

function fileHandlerSelector(type, output, sheetName) {
    return type === "pad" ? putMarkerPad(output, sheetName) : type === "ohca" ? putMarkerOhca(output, sheetName) :
        type === "address_to_latlng" ? getLatLng(output, sheetName) : requestLatlngFromGoogleAgain(output, sheetName);
}

// file handler
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                result = e.target.result;
                var arr = String.fromCharCode.apply(null, new Uint8Array(result));
                var wb = XLSX.read(btoa(arr), { type: 'base64' });
                var sheetName = wb.SheetNames[0];
                var radios = document.getElementsByName('dataType');
                var dataType;

                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].checked) dataType = radios[i].value;
                }

                output = to_json(wb);

                fileHandlerSelector(dataType, output, sheetName);
                alert("read ok!");
                document.getElementById('files').value = "";
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