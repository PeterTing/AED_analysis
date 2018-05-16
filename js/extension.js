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

    return this
}