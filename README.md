#DraggableScroll (jQuery)
Easy styled jQuery plugin for use DragNDrop for scrolling container with some content.
For more information look at [live demo](https://franknewii.github.io/jqueryDraggableScroll/).

## Install

``npm i jquery-draggable-scroll``

## Usage
### By data-attributes (Html default options)
```
<div data-draggable-scroll>
    <div data-draggable-scroll-control="left:30vw"></div>
    <div data-draggable-scroll-control="right:30vw"></div>
    <div data-draggable-scroll-control="top:30vh"></div>
    <div data-draggable-scroll-control="bottom:30vh"></div>
    <div data-draggable-scroll-content>
        <table class="very-big-table></table>
    </div>
</div>
```

### By JS

````
    <div #id='scrolled-content'>
        <div data-draggable-scroll-control="left:30vw"></div>
        <div data-draggable-scroll-control="right:30vw"></div>
        <div data-draggable-scroll-control="top:30vh"></div>
        <div data-draggable-scroll-control="bottom:30vh"></div>
        <div data-draggable-scroll-content>
            <table class="very-big-table></table>
        </div>
    </div>
````

``
    $('#scrolled-content').draggableScroll(options);
``


## Options (defaultConfig)
```
options = {
    scrollX: true, // is need to scroll by X direction
    scrollY: true, // is need to scroll by Y direction
    dropOnMouseLeave: false, // drop scrolled content by mouseleae
    animateScrollByControls: true, // Work only when some controls is exist (if you want to disable default animate scrolling by click on controls)
    animateScrollTime: 200, // Work only when controls is exist. Time to animate scroll by controls
    hideScrollbars: true, // Hide default scrollbars
    inertiaByDragging: true, // Inertial move on drop scrolled content
    detectDirectionDrag: true, // Add class to scrolled content with directions names
    removeDirectionDragOnMouseUp: true // Leave classnames with last direction on drop scrolled content
};
```
