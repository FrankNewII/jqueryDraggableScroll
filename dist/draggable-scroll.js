(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        if (typeof jQuery === 'undefined') {
            throw new Error('DraggableScroll: Draggable scroll is depended on JQuery. \n\
            Please append JQuery to document before load DraggableScroll plugin.');
        }
        factory(jQuery);
    }
}(function ($) {
    $.fn.draggableScroll = function DraggableScroll(config) {
        if (!(this instanceof DraggableScroll)) {
            config = DraggableScroll.validateConfig(config);
            config.$element = this;
            return new DraggableScroll(config);
        }

        this._config = config;
        this._$scrolledElm = this._config.$element;
        this._pressed = false;
        this._findElm()
            ._appendStyles()
            ._initListeners();
    };

    var statics = $.fn.draggableScroll;
    var prototype = $.fn.draggableScroll.prototype;

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

    statics.defaultConfig = {
        scrollX: true,
        scrollY: true,
        dropOnMouseLeave: false
    };

    prototype.scrollTo = function (turn, pxs) {
        var method = 'scroll' + turn.charAt(0).toUpperCase() + turn.slice(1);
        var val = pxs?this._$scrolledElm[method](pxs):this._$scrolledElm[method]();

        if(pxs) {
            console.log(arguments);
        }
        return !pxs?val:this;
    };

    prototype._findElm = function () {
        this._$scrolledWrapper = this._config.$element;
        this._$scrolledElm = this._config.$element.find('[data-draggable-scrolled-content]');

        if (this._$scrolledElm.length === 0)
            throw new Error('DraggableScroll: Cannon find scrolled content element. \n\
            Use [data-draggable-scrolled-content] inside [data-draggable-scroll] container.');

        if (this._$scrolledElm.length > 1)
            throw new Error('DraggableScroll: Found more than one [data-draggable-scrolled-content] inside [data-draggable-scroll] container.');

        return this;
    };

    prototype._appendStyles = function () {
        this._$scrolledWrapper.css('user-select','none');
        this._$scrolledElm.css({
            'overflow': 'scroll',
            'height': '100%',
            'width': '100%',
        });
        return this;
    };

    prototype._initListeners = function () {
        var self = this;
        var startX;
        var startY;
        var startScrollX;
        var startScrollY;
        var pressed;

        this._$scrolledElm
            .on('mousedown', function (ev) {
                pressed = true;
                startX = ev.clientX;
                startY = ev.clientY;
                startScrollX = self.scrollTo('left');
                startScrollY = self.scrollTo('top');
                self._$scrolledWrapper.addClass('scrollDraggable-draging');
            })
            .on('mouseup', function () {
                pressed = false;
                self._$scrolledWrapper.removeClass('scrollDraggable-draging');
            })
            .on('mousemove', function (ev) {
                if(pressed) {
                    self._config.scrollX && self.scrollTo('left', startScrollX + (startX - ev.clientX) );
                    self._config.scrollY && self.scrollTo('top', startScrollY + (startY - ev.clientY) );
                }
            });

        this._$scrolledWrapper
            .find('[data-draggable-scroll-control]')
            .on('click', function (ev) {
                var $target = $(ev.target);
                var data = $target.data('draggableScrollControl').split(':');
                var direction = data[0];
                var step = parseInt(data[1]);
                var currentVal;

                switch (direction) {
                    case 'top':
                        step = 0 - step;
                        currentVal = self.scrollTo('top');
                        break;
                    case 'bottom':
                        currentVal = self.scrollTo('top');
                        direction = 'top';
                        break;
                    case 'left':
                        currentVal = self.scrollTo('left');
                        step = 0 - step;
                        break;
                    case 'right':
                        direction = 'left';
                        currentVal = self.scrollTo('left');
                        break;
                }

                self.scrollTo(direction, currentVal + step);
            });

        if (this._config.dropOnMouseLeave) {
            this._$scrolledElm.on('mouseleave', function () {
                pressed = false;
            });
        }

        return this;
    };

    var $containers = $('[data-draggable-scroll]');

    if($containers.length) {
        $containers.each(function (i, el) {
            $(el).draggableScroll();
        });
    }
}));