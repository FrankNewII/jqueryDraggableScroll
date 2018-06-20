(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var Inertia = require('./draggable-scroll_inertion');


$.fn.draggableScroll = function DraggableScroll(config) {

    /**
     *
     * Self construct function by jQuery calling
     *
     * */

    if (!(this instanceof DraggableScroll)) {
        config = DraggableScroll._validateConfig(config);
        config.$element = this;

        return new DraggableScroll(config);
    }

    this._config = config;
    this._$scrolledElm = this._config.$element;
    this._pressed = false;
    this._isAnimate = false;

    /**
     *
     * Scroll params:
     *
     * */

    this._startScrollX = undefined;
    this._startScrollY = undefined;
    this._startMousedownX = undefined;
    this._startMousedownY = undefined;

    /**
     *
     * Inertia by drag mouse
     *
     * */

    this._inertia = new Inertia(this, this._config.inertialResistance);

    /**
     *
     * Initialize
     *
     * */

    this._findElms()
        ._appendStyles()
        ._initListeners();
};


var statics = $.fn.draggableScroll;
var prototype = $.fn.draggableScroll.prototype;


/**
 *
 *
 * Statics methods:
 *
 *
 * */

statics.defaultConfig = {
    scrollX: true,
    scrollY: true,
    dropOnMouseLeave: false,
    animateScrollByControls: true,
    animateScrollTime: 200,
    hideScrollbars: true,
    inertiaByDragging: true,
    detectDirectionDrag: true,
    removeDirectionDragOnMouseUp: true,
    inertialResistance: 150
};


statics._validateConfig = function (conf) {
    switch (typeof (conf)) {
        case 'object':
            return $.extend(statics.defaultConfig, conf);
        case 'undefined':
            return $.extend(statics.defaultConfig, {});
        default:
            throw new Error('DraggableScroll: Undefined type of config argument.');
    }
};


statics._unitsConverters = {
    px: function (dig) {
        return dig;
    },
    vw: (function () {
        var $doc = $(document);

        return function (dig) {
            return $doc.width() / 100 * dig;
        }
    })(),
    vh: (function () {
        var $doc = $(document);

        return function (dig) {
            return $doc.height() / 100 * dig;
        }
    })()
};


statics.addUnitConverter = function (unit, converter) {
    if (statics._unitsConverters[unit])
        console.warn('Converter for ' + unit + ' was changed.');

    statics._unitsConverters[unit] = converter;
};


statics.converterUnitToPxs = function (dig, unit) {
    var converter = statics._unitsConverters[unit];

    if (!converter)
        throw new Error('Undefined css units named as: "' + unit + '" \n\.' +
            'Add converter ($.fn.draggableScroll.addUnitConverter(unit, convertFunction)) to PXs for that unit, or you have a typo.');

    return converter(dig);
};


/**
 *
 *
 * Prototype methods:
 *
 *
 * */

prototype.scrollTo = function (turn, units, anim) {
    var method = 'scroll' + turn.charAt(0).toUpperCase() + turn.slice(1), val;

    if (units !== undefined) {

        if (anim) {
            var animParam = {};

            animParam[method] = units;

            this._$scrolledElm
                .animate(animParam,
                    this._config.animateScrollTime,
                    function () {
                        this._isAnimate = false;
                    }.bind(this));

            this._isAnimate = true;


        } else {
            this._$scrolledElm[method](units);
        }

    } else {
        val = this._$scrolledElm[method]();
    }

    return val;
};



prototype.emitEvent = function (ev) {
    this._$scrolledElm.trigger(ev);
};

prototype._findElms = function () {
    this._$scrolledWrapper = this._config
        .$element;

    this._$scrolledElm = this._config
        .$element
        .find('[data-draggable-scroll-content]');

    if (this._$scrolledElm.length === 0)
        throw new Error('DraggableScroll: Cannon find scrolled content element. \n\
            Use [data-draggable-scrolled-content] inside [data-draggable-scroll] container.');

    if (this._$scrolledElm.length > 1)
        throw new Error('DraggableScroll: Found more than one [data-draggable-scrolled-content] inside [data-draggable-scroll] container.');

    return this;
};


prototype._appendStyles = function () {
    var hideScroll = this._config
        .hideScrollbars;

    this._$scrolledWrapper
        .css('user-select', 'none');

    if (hideScroll) {
        this._$scrolledWrapper
            .css('overflow', 'hidden');
    }

    this._$scrolledElm
        .css({
            'overflow': 'scroll',
            'height': hideScroll ? 'calc(100% + 17px)' : '100%',
            'width': hideScroll ? 'calc(100% + 17px)' : '100%',
        });

    return this;
};


prototype._removeDirectionsClasses = function () {
    if (this._config.detectDirectionDrag && this._config.removeDirectionDragOnMouseUp) {
        this._$scrolledWrapper
            .removeClass('scroll-draggable_move_left scroll-draggable_move_right scroll-draggable_move_top scroll-draggable_move_bottom');
    }

    return this;
};


prototype._toggleDirectionsClasses = function (prevX, prevY, currX, currY) {

    if ( prevX < currX ) {
        this._$scrolledWrapper
            .addClass('scroll-draggable_move_left')
            .removeClass('scroll-draggable_move_right');
    } else {
        if (prevX === currX) {
            this._$scrolledWrapper
                .removeClass('scroll-draggable_move_right scroll-draggable_move_left');
        } else {
            this._$scrolledWrapper
                .addClass('scroll-draggable_move_right')
                .removeClass('scroll-draggable_move_left');
        }
    }

    if ( prevY < currY ) {
        this._$scrolledWrapper
            .addClass('scroll-draggable_move_top')
            .removeClass('scroll-draggable_move_bottom');
    } else {
        if (prevY === currY) {
            this._$scrolledWrapper
                .removeClass('scroll-draggable_move_bottom scroll-draggable_move_top');
        } else {
            this._$scrolledWrapper
                .addClass('scroll-draggable_move_bottom')
                .removeClass('scroll-draggable_move_top');
        }
    }

    return this;
};


prototype._initListeners = function () {
    this._$scrolledElm
        .on('mousedown', this.__mousedownHandler.bind(this))
        .on('mouseup', this.__mouseupHandler.bind(this))
        .on('mousemove', this.__mousemoveHandler.bind(this));

    this._$scrolledWrapper
        .find('[data-draggable-scroll-control]')
        .on('click', this.__controlsClickHandler.bind(this));

    if (this._config.dropOnMouseLeave) {
        this._$scrolledElm
            .on('mouseleave', this.__mouseupHandler.bind(this));
    }

    return this;
};


/**
 *
 *
 * Unbind prototype methods(event-handlers):
 *
 *
 * */

prototype.__mouseupHandler = function (ev) {
    this._pressed = false;
    this._$scrolledWrapper
        .removeClass('scrollDraggable-draging');

    this._removeDirectionsClasses();

    this._inertia
        .startInertionTo(ev.clientX, ev.clientY);
};


prototype.__mousedownHandler = function (ev) {
    this._pressed = true;
    this._startMousedownX = ev.clientX;
    this._startMousedownY = ev.clientY;
    this._startScrollX = this.scrollTo('left');
    this._startScrollY = this.scrollTo('top');

    this._inertia
        .addMovePoints(ev.clientX, ev.clientY)
        .reset();

    this._$scrolledWrapper.addClass('scrollDraggable-draging');
};


prototype.__mousemoveHandler = function (ev) {

    var prevX = this.scrollTo('left'),
        prevY = this.scrollTo('top'),
        currentX = this._startScrollX + (this._startMousedownX - ev.clientX),
        currentY = this._startScrollY + (this._startMousedownY - ev.clientY);

    if (this._pressed) {

        this._inertia
            .addMovePoints(ev.clientX, ev.clientY);

        this._config.scrollX
        && this.scrollTo('left', currentX);

        this._config.scrollY
        && this.scrollTo('top', currentY);

        this._toggleDirectionsClasses(prevX, prevY, currentX, currentY);
    }
};


prototype.__controlsClickHandler = function (ev) {

    if (this._isAnimate)
        return;

    this._inertia.reset();

    var $target = $(ev.currentTarget),
        data = $target.data('draggableScrollControl').split(':'),
        direction = data[0],
        step = statics.converterUnitToPxs(parseInt(data[1]), data[1].match(/[^\d\.]+/i)[0]),
        currentVal;

    switch (direction) {
        case 'top':
            step = 0 - step;
            currentVal = this.scrollTo('top');
            break;

        case 'bottom':
            currentVal = this.scrollTo('top');
            direction = 'top';
            break;

        case 'left':
            currentVal = this.scrollTo('left');
            step = 0 - step;
            break;

        case 'right':
            direction = 'left';
            currentVal = this.scrollTo('left');
            break;
    }

    this.scrollTo(direction, currentVal + step, this._config.animateScrollByControls);
};


/**
 * Auto-search for elements by attribute
 * */

var $containers = $('[data-draggable-scroll]');

if ($containers.length) {
    $containers.each(function (i, el) {
        $(el).draggableScroll();
    });
}
},{"./draggable-scroll_inertion":1}]},{},[2])