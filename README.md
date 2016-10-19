# Lightning Layout

*Fast, simple layout & rendering of a lightweight object model on canvas. Inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc).*

Lightning Layout is designed to enable app development on top of a thin, extensible runtime, like [nanocanvas](https://github.com/syoyo/nanocanvas) or Cocoon's [Canvas+ engine](http://docs.cocoon.io/article/canvas-engine/). These runtimes don't provide a DOM or a CSS layout engine, so Lightning Layout fills the gap with a minimal (but capable) solution.

Lightning Layout's design goals are (in order): **simplicity** and **speed**. It is inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc) and shares many similarities with Gibbon:

* JSON is used for declarative layout (instead of HTML)
* All positioning is "absolute" (based on the parent element, not siblings or "flow")
* All styles are set on elements themselves, there is no cascading (but you can supply a default `font` style for all elements)

## Use

Include lightning-layout.js in your page and it will define a global `LightningLayout()` constructor:

```html
<script src="lightning-layout.js"></script>
```

## Example 1

```javascript
var element_obj = {
  backgroundColor: "#2C425C",
  width: 200,
  height: 200,
  color: "#FFFFFF",
  children: [{
    width: "textWidth",
    height: "textHeight",
    backgroundColor: "#6BFEF2",
    color: "#32363B",
    padding: 10,
    text: "Hello World"
  }]
};

var canvas = document.getElementById('canvas'),
var ctx = canvas.getContext('2d');
var ll = new LightningLayout();
ll.layout(ctx, element_obj, 0, 0, canvas.width, canvas.height);
ll.render(ctx, element_obj);
```

This is basically the Gibbon example from [Jafar Husain's presentation](https://www.youtube.com/watch?v=eNC0mRYGWgc). Here's how lightningLayout renders it:

<img src="http://prust.github.io/lightning-layout/example-1-2x.png" width="236" alt="simple layout example" srcset="http://prust.github.io/lightning-layout/example-1-1x.png 1x, http://prust.github.io/lightning-layout/example-1-2x.png 2x"/>

## Example 2

```javascript
var element_obj = {
  children: [{
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
      backgroundColor: '#dddddd'
    }, {
      text: 'Right sidebar',
      color: 'black',
      padding: 10,
      right: 0,
      width: '20%',
      backgroundColor: '#dddddd'
    }]
  }, {
    text: 'Footer',
    color: 'white',
    padding: 10,
    bottom: 0,
    height: 100,
    backgroundColor: '#cccccc',
    borderColor: '#999999'
  }]
};

var canvas = document.getElementById('canvas'),
var ctx = canvas.getContext('2d');
var ll = new LightningLayout();
ll.layout(ctx, element_obj, 0, 0, canvas.width, canvas.height);
ll.render(ctx, element_obj);
```

This renders as:

<img src="http://prust.github.io/lightning-layout/example-2-2x.png" width="878" alt="complex layout example" srcset="http://prust.github.io/lightning-layout/example-2-1x.png 1x, http://prust.github.io/lightning-layout/example-2-2x.png 2x"/>

You can view and play with this example live at http://prust.github.io/lightning-layout.

## API

```javascript
var ll = new LightningLayout([canvas, [defaults]])
```

* `canvas` - optional: the canvas element, used for calling `addEventHandler()` and listening for mouse and touch events. If not supplied, event support will be disabled. See `addEventSupport()` below.
* `defaults` - an object supplying default styles (currently the only supported default style is `font`, for example: `{font: '12pt Helvetica'}`)

```javascript
ll.layout(canvas_ctx, element_obj, parent_x1, parent_y1, parent_x2, parent_y2)
```

The `layout()` method walks the element object graph and calculates the layout, setting 4 properties on each element (`_layout_x1`, `_layout_x2`, `_layout_y1`, `_layout_y2`).

* `canvas_ctx`  - the 2D context object from the canvas. This is only necessary if your layout requires text measurements (if you're using the 'textHeight' or 'textWidth' values), otherwise you can pass `null`.
* `element_obj` - the top of your hierarchy of lightweight elements: plain javascript objects with optional style properties (see below) & an optional `children` array
* `parent_x1`, `parent_y1` - the top-left coordinates of the canvas, typically `0, 0`
* `parent_x2`, `parent_y2` - the bottom-right coordinates of the canvas, typically the width and height of the canvas

```javascript
ll.render(canvas_ctx, element_obj)
```

The `render()` method walks the element object graph and uses the 4 calculated layout properties to draw the elements to the canvas.

```javascript
ll.addEventSupport(obj[, should_cascade])
```

`addEventSupport()` adds basic event support to a javascript object by implementing two functions: `addEventListener(evt_name, fn)` and `dispatchEvent(evt)`. These functions dynamically add an object property, `._evt_handlers = {}`, the first time `addEventListener()` is called. If your objects share a common prototype, you can pass that for better performance: `ll.addEventSupport(MyObject.prototype)`. Or, if you want to decorate every object in the tree, supply `true` for `should_cascade`.

If the canvas element was passed to `new LightningLayout()` and the objects have event support (a `dispatchEvent()` method), then all mouse and touch events will propagate up the object tree, starting with the children and propagating up to the parents. If siblings overlap, the event will be dispatched in reverse order, starting with the last sibling.

The `dispatchEvent()` method added in `addEventSupport()` respects `evt.stopImmediatePropagation()`, but only if `evt.isImmediatePropagationStopped()` is supported by the browser/runtime. Likewise the event propagation respects `evt.stopPropagation()`, but only if  `evt.isPropagationStopped()` is supported by the browser/runtime.

See the footer click handling in `index.html` (http://prust.github.io/lightning-layout/index.html) for an example of event support.

## Supported style properties

* `left`, `right`, `top`, `bottom` - these can be numbers or percentages and will position the edge of the element relative to its parent
* `width`, `height` - these will be used to calculate unsupplied edges (for instance if a `right` and `width` properties are given, the `left` will be calculated), can be a number or a percent or the strings "textWidth" / "textHeight" for shrink-wrapped width/height.
* `font` - [css font string](https://developer.mozilla.org/en-US/docs/Web/CSS/font) defining the font style, size and face
* `text` - text to display inside the element
* `padding` - single number used for padding on all four sides (TODO: support separate padding values for each side)
* `backgroundColor` - [css color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for the border (transparent if not supplied)
* `borderColor` - [css color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for the border (no border is rendered if this is not supplied)
* `borderWidth` - number for the width of the border (TODO: render the borders inside the element instead of half inside and half outside)

## Custom element rendering or layout

You can do custom layout or rendering of objects (or to let them handle their own layout/rendering) by wrapping `_render()` or `_layout()` with a function that does the custom rendering. This is useful for custom elements, like a canvas-based text-input control ([here](https://github.com/goldfire/CanvasInput), [here](https://github.com/claydotio/Canvas-Input/) or [here](https://github.com/barmalei/zebra)).

## Production Readiness

LightningLayout is not quite production-ready. The 3 most glaring omissions are text wrapping support (currently only a single line of text is supported), support for rounded rectanges and support for `overflow` behaviors (currently everything is `overflow: visible`). Also, it could use more testing (the 2 examples are somewhat complex and they render correctly, but it could always use more testing).

## To-Do

In addition to the `TODO`'s mentioned above:

* implement text wrapping
* add support for rounded rectangles (all corners or individual corners)
* implement `overflow: auto/scroll/hidden` & `textOverflow: ellipsis`
* add support for background images
* allow a space-delimited className property that can apply a set of styles
* define an example set of styles that mimic Bootstrap buttons, alerts, drop-downs, modals, etc
