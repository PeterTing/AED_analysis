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

// count the distance of two spot

function countdis(spot, station) { //distance
    var d = Math.sqrt(Math.pow(spot.Lat - station.Lat, 2) + Math.pow(spot.Lng - station.Lng, 2));
    return (d);
}

/**
 * 1. transform TWD97 and latlng to each other
 * 2. transform TWD97 and TWD67 to each other
 */

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