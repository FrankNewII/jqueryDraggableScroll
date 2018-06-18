var $ = require('jquery');
var Inertia = require('./draggable-scroll_inertion');


$.fn.draggableScroll = function DraggableScroll(config) {

    /**
     *
     * Self construct function by jQuery calling
     *
     * */

    if (!(this instanceof DraggableScroll)) {
        config = DraggableScroll.validateConfig(config);
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
    this._pointsToCheckImpulse = 4;
    this._lastInertionsPoints = [];

    this._inertia = new Inertia(this, this._config.inertialResistance);

    /**
     *
     * Initialize
     *
     * */

    this._findElm()
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
    inertialResistance: 100
};


statics.validateConfig = function (conf) {
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
    var method = 'scroll' + turn.charAt(0).toUpperCase() + turn.slice(1);
    var val;

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


prototype._findElm = function () {
    this._$scrolledWrapper = this._config
        .$element;

    this._$scrolledElm = this._config
        .$element
        .find('[data-draggable-scrolled-content]');

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


prototype._addMovePoints = function (x, y) {
    if (this._lastInertionsPoints.push({x: x, y: y}) > this._pointsToCheckImpulse) {
        this._lastInertionsPoints.shift();
    }

    return this;
};


prototype._clearMovePoints = function () {
    this._lastInertionsPoints.length = 0;

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

    var lastX = 0;
    var lastY = 0;

    this._lastInertionsPoints.forEach(function (v) {
        lastX += v.x;
        lastY += v.y;
    });

    lastX = lastX / this._lastInertionsPoints.length;
    lastY = lastY / this._lastInertionsPoints.length;

    this._clearMovePoints();

    var currentX = ev.clientX;
    var currentY = ev.clientY;

    this._inertia.setInertion(lastX, lastY, currentX, currentY);

    this._inertia.inertionMove();
};


prototype.__mousedownHandler = function (ev) {
    this._pressed = true;
    this._startMousedownX = ev.clientX;
    this._startMousedownY = ev.clientY;
    this._startScrollX = this.scrollTo('left');
    this._startScrollY = this.scrollTo('top');

    this._addMovePoints(ev.clientX, ev.clientY);
    this._inertia.reset();

    this._$scrolledWrapper.addClass('scrollDraggable-draging');
};


prototype.__mousemoveHandler = function (ev) {
    if (this._pressed) {

        this._addMovePoints(ev.clientX, ev.clientY);

        this._config.scrollX
        && this.scrollTo('left', this._startScrollX + (this._startMousedownX - ev.clientX));

        this._config.scrollY
        && this.scrollTo('top', this._startScrollY + (this._startMousedownY - ev.clientY));

    }
};


prototype.__controlsClickHandler = function (ev) {

    if (this._isAnimate)
        return;

    this._inertia.reset();

    var $target = $(ev.target);
    var data = $target.data('draggableScrollControl').split(':');
    var direction = data[0];
    var step = statics.converterUnitToPxs(parseInt(data[1]), data[1].match(/[^\d\.]+/i)[0]);
    var currentVal;

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