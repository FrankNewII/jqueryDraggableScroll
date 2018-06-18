function Inertia(aggregator, inertiaSpeed) {
    this._totalInertionEnergy = 0;
    this._totalInertionFrames = 1;

    this._inertiaX = 0;
    this._inertiaY = 0;
    this._inertiaSpeed = inertiaSpeed;
    this._aggregator = aggregator;
}

var prototype = Inertia.prototype;

prototype.reset = function () {
    this._totalInertionEnergy = 0;
    this._totalInertionFrames = 1;
};

prototype.inertionMove = function () {

    if (this._totalInertionEnergy !== 0) {
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

prototype.setInertion = function (x1, y1, x2, y2) {
    this._inertiaX = (x1 - x2) * 60; //per sec
    this._inertiaY = (y1 - y2) * 60;

    this._totalInertionEnergy = Math.abs(this._inertiaX) + Math.abs(this._inertiaY);
    this._totalInertionFrames = this._inertiaSpeed;

    return this;
};

module.exports = Inertia;
