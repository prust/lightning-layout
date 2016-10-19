# Lightning Layout

*Fast, simple layout & rendering of a lightweight object model on canvas. Inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc).*

Lightning Layout is designed to enable app development on top of a thin, extensible runtime, like [nanocanvas](https://github.com/syoyo/nanocanvas) or Cocoon's [Canvas+ engine](http://docs.cocoon.io/article/canvas-engine/). These runtimes don't provide a DOM or a CSS layout engine, so Lightning Layout fills the gap with a minimal (but capable) solution.

Lightning Layout's design goals are (in order): **simplicity** and **speed**. It is inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc) and shares many similarities with Gibbon:

* JSON is used for declarative layout (instead of HTML)
* All positioning is "absolute" (based on the parent element, not siblings or "flow")
* All styles are set on elements themselves, there is no cascading (TODO: allow a user-supplied default style)

## Use

Include lightning-layout.js in your page and it will define a global `lightningLayout()` function:

```html
<script src="lightning-layout.js"></script>
```

```javascript
lightningLayout(canvas_ctx, element_obj, parent_x1, parent_y1, parent_x2, parent_y2)
```

* `canvas_ctx`  - the 2D context object from the canvas
* `element_obj` - the top of your hierarchy of lightweight elements: plain javascript objects with optional style properties (see below) & an optional `children` array
* `parent_x1`, `parent_y1` - the top-left coordinates of the canvas, typically `0, 0`
* `parent_x2`, `parent_y2` - the bottom-right coordinates of the canvas, typically the width and height of the canvas

## Supported style properties

* `left`, `right`, `top`, `bottom` - these can be numbers or percentages and will position the edge of the element relative to its parent
* `width`, `height` - these will be used to calculate unsupplied edges (for instance if a `right` and `width` properties are given, the `left` will be calculated)
* `font` - [css font string](https://developer.mozilla.org/en-US/docs/Web/CSS/font) defining the font style, size and face
* `text` - text to display inside the element (if `width` and `right` are not supplied, the element is "shrink-wrapped" to the text; the same things happens vertically if `height` and `bottom` are not supplied). If no text is supplied, the element will default to 100% width and 100% height, respectively.
* `padding` - single number used for padding on all four sides (TODO: support separate padding values for each side)
* `backgroundColor` - [css color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for the border (transparent if not supplied)
* `borderColor` - [css color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for the border (no border is rendered if this is not supplied)
* `borderWidth` - number for the width of the border (TODO: render the borders inside the element instead of half inside and half outside)

## Example 1

```javascript
var layout = {
  backgroundColor: "#2C425C",
  width: 200,
  height: 200,
  color: "#FFFFFF",
  children: [{
    backgroundColor: "#6BFEF2",
    color: "#32363B",
    padding: 10,
    text: "Hello World"
  }]
};

var canvas = document.getElementById('canvas'),
var ctx = canvas.getContext('2d');
lightningLayout(ctx, layout, 0, 0, canvas.width, canvas.height);
```

This is basically the Gibbon example from [Jafar Husain's presentation](https://www.youtube.com/watch?v=eNC0mRYGWgc). Here's how lightningLayout renders it:

<img src="http://prust.github.io/lightning-layout/example-1-1x.png" alt="simple layout example" srcset="http://prust.github.io/lightning-layout/example-1-1x.png 1x, http://prust.github.io/lightning-layout/example-1-2x.png 2x"/>

## Example 2

```javascript
var layout = {
  children: [{
    width: "100%",
    borderColor: "#cccccc",
    borderWidth: 1,
    backgroundColor: "#eeeeee",
    height: 100,
    padding: 10,
    color: "#666666",
    text: "Header content here"
  }, {
    top: 100,
    bottom: 100,
    children: [{
      text: 'Left sidebar',
      padding: 10,
      color: 'black',
      width: '20%',
      height: '100%',
      backgroundColor: '#dddddd'
    }, {
      text: 'Right sidebar',
      color: 'black',
      padding: 10,
      right: 0,
      width: '20%',
      height: '100%',
      backgroundColor: '#dddddd'
    }]
  }, {
    text: 'Footer',
    color: 'white',
    padding: 10,
    bottom: 0,
    height: 100,
    width: '100%',
    backgroundColor: '#cccccc',
    borderColor: '#999999'
  }]
};

var canvas = document.getElementById('canvas'),
var ctx = canvas.getContext('2d');
lightningLayout(ctx, layout, 0, 0, canvas.width, canvas.height);
```

This renders as:

<img src="http://prust.github.io/lightning-layout/example-2-1x.png" alt="complex layout example" srcset="http://prust.github.io/lightning-layout/example-2-1x.png 1x, http://prust.github.io/lightning-layout/example-2-2x.png 2x"/>

You can view and play with this example live at http://prust.github.io/lightning-layout. 

## To-Do

In addition to the `TODO`'s mentioned above:

* implement text wrapping
* listen for mouse events on the canvas and "bubble" them to the appropriate lightweight elements
* implement `overflow: auto/scroll/hidden` & `textOverflow: ellipsis`
* allow objects to handle their own rendering, for instance a canvas-based text-input control ([here](https://github.com/goldfire/CanvasInput), [here](https://github.com/claydotio/Canvas-Input/) or [here](https://github.com/barmalei/zebra))
* add support for background (and foreground?) images
* add support for rounded rectangles (all corners or individual corners)
* allow a space-delimited className property that can apply a set of styles
* define an example set of styles that mimic Bootstrap buttons, alerts, drop-downs, modals, etc
