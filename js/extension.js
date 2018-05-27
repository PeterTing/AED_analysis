/**
 * extend funtion
 */

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

    return this;
}

MarkerClusterer.prototype.getAddedMarkers = function() {
    let addedMakers = [];
    let clusters = this.clusters_;
    console.log(clusters)
    clusters.forEach(cluster => {
        console.log(cluster)
        cluster.markers_.forEach(marker => addedMakers.push(marker));
    });

    return addedMakers;
}

MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
    var distance = 40000; // Some large number
    var clusterToAddTo = null;
    var pos = marker.getPosition();
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        var center = cluster.getCenter();
        if (center) {
            var d = this.distanceBetweenPoints_(center, marker.getPosition());
            if (d < distance) {
                distance = d;
                clusterToAddTo = cluster;
            }
        }
    }

    if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
        clusterToAddTo.addMarker(marker);
        // console.log(markers.find(element => element.lat === marker.lat && element.lng === marker.lng && element.type === 2))
        markers.forEach((element, index) => {
            if (element.lat === marker.lat && element.lng === marker.lng && element.type === 2) {
                element.stationCircle.setVisible(false);
            }
        });
    } else {
        var cluster = new Cluster(this);
        cluster.addMarker(marker);
        this.clusters_.push(cluster);
        // console.log(markers.find(element => element.lat === marker.lat && element.lng === marker.lng && element.type === 2))

        markers.forEach((element, index) => {
            if (element.lat === marker.lat && element.lng === marker.lng && element.type === 2) {
                element.stationCircle.setVisible(true);
            }
        });
    }
};

MarkerClusterer.prototype.createClusters_ = function() {
    if (!this.ready_) {
        return;
    }

    // Get our current map view bounds.
    // Create a new bounds object so we don't affect the map.
    var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
        this.map_.getBounds().getNorthEast());
    var bounds = this.getExtendedBounds(mapBounds);

    for (var i = 0, marker; marker = this.markers_[i]; i++) {
        if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
            this.addToClosestCluster_(marker);
        }
    }
};