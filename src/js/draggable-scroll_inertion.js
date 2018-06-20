function Inertia(aggregator, inertiaSpeed) {
    this._totalInertionEnergy = 0;
    this._totalInertionFrames = 1;

    this._inertiaX = 0;
    this._inertiaY = 0;
    this._inertiaSpeed = inertiaSpeed;
    this._lastInertionsPoints = [];
    this._pointsToCheckImpulse = 4;
    this._aggregator = aggregator;
}

var prototype = Inertia.prototype;


prototype.reset = function () {
    this._totalInertionEnergy = 0;
    this._totalInertionFrames = 1;
};

prototype.addMovePoints = function (x, y) {
    if (this._lastInertionsPoints.push({x: x, y: y}) > this._pointsToCheckImpulse) {
        this._lastInertionsPoints.shift();
    }

    return this;
};


prototype._clearMovePoints = function () {
    this._lastInertionsPoints.length = 0;

    return this;
};

prototype.inertionMove = function () {
    if (this._totalInertionEnergy > 1500) {
        var self = this;

        this._aggregator
            ._$scrolledWrapper
            .addClass('scrollDraggable-inertia-move');

        var stepX = this._inertiaX / this._totalInertionFrames;
        this._totalInertionEnergy -= Math.abs(stepX) * 12;
        this._aggregator
            .scrollTo('left', this._aggregator.scrollTo('left') + stepX);



        var stepY = this._inertiaY / this._totalInertionFrames;
        this._totalInertionEnergy -= Math.abs(stepY) * 12;
        this._aggregator
            .scrollTo('top', this._aggregator.scrollTo('top') + stepY);

        this._aggregator.emitEvent({
            type: 'draggableScroll:inertia',
            data: {
                leavePower: this._totalInertionEnergy,
                stepX: stepX,
                stepY: stepY,
            }
        });

        if (this._totalInertionEnergy > 0) {
            this._totalInertionFrames++;

            setTimeout(function () {

                self.inertionMove();

            }, Math.ceil(1000 / 60));

        } else {
            this._breakInertion = false;
            this._aggregator
                ._$scrolledWrapper
                .removeClass('scrollDraggable-inertia-move');
        }
    } else {
        this._aggregator
            ._$scrolledWrapper
            .removeClass('scrollDraggable-inertia-move');
    }
};


prototype.startInertionTo = function (x1, y1) {
    var lastX = 0;
    var lastY = 0;

    this._lastInertionsPoints
        .forEach(function (v) {
            lastX += v.x;
            lastY += v.y;
        });

    lastX = lastX / this._lastInertionsPoints.length;
    lastY = lastY / this._lastInertionsPoints.length;

    this._clearMovePoints()
        ._setInertion(lastX, lastY, x1, y1)
        .inertionMove();
};

prototype._setInertion = function (x1, y1, x2, y2) {
    this._inertiaX = (x1 - x2) * 60; //per sec
    this._inertiaY = (y1 - y2) * 60;

    this._totalInertionEnergy = Math.abs(this._inertiaX) + Math.abs(this._inertiaY);
    this._totalInertionFrames = this._inertiaSpeed;

    return this;
};


module.exports = Inertia;
