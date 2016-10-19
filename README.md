# Lightning Layout

*Fast, simple layout & rendering of a lightweight object model on canvas. Inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc).*

Lightning Layout is designed to enable app development on top of a thin, extensible runtime, like [nanocanvas](https://github.com/syoyo/nanocanvas) or Cocoon's [Canvas+ engine](http://docs.cocoon.io/article/canvas-engine/). These runtimes don't provide a DOM or a CSS layout engine, so Lightning Layout fills the gap with a minimal (but capable) solution.

Lightning Layout also provides event bubbling for mouse and touch events, see "Event Support" below.

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

<img src="http://prust.github.io/lightning-layout/example-2-2x.png" width="877" alt="complex layout example" srcset="http://prust.github.io/lightning-layout/example-2-1x.png 1x, http://prust.github.io/lightning-layout/example-2-2x.png 2x"/>

You can view and play with this example live at http://prust.github.io/lightning-layout.

## API

### LightningLayout([canvas, [defaults]])

* `canvas` - optional: the canvas element, used for calling `addEventHandler()` and listening for mouse and touch events. If not supplied, event support will be disabled. See `addEventSupport()` below.
* `defaults` - an object supplying default styles (currently the only supported default style is `font`, for example: `{font: '12pt Helvetica'}`)

### LightningLayout.layout(canvas_ctx, element_obj, parent_x1, parent_y1, parent_x2, parent_y2)

The `layout()` method walks the element object graph and calculates the layout, setting 4 properties on each element (`_layout_x1`, `_layout_x2`, `_layout_y1`, `_layout_y2`).

* `canvas_ctx`  - the 2D context object from the canvas. This is only necessary if your layout requires text measurements (if you're using the 'textHeight' or 'textWidth' values), otherwise you can pass `null`.
* `element_obj` - the top of your hierarchy of lightweight elements: plain javascript objects with optional style properties (see below) & an optional `children` array
* `parent_x1`, `parent_y1` - the top-left coordinates of the canvas, typically `0, 0`
* `parent_x2`, `parent_y2` - the bottom-right coordinates of the canvas, typically the width and height of the canvas

### LightningLayout.render(canvas_ctx, element_obj)

The `render()` method walks the element object graph and uses the 4 calculated layout properties to draw the elements to the canvas.

### LightningLayout.addEventSupport(obj[, should_cascade])

`addEventSupport()` adds basic event support to a javascript object by implementing two functions: `addEventListener(evt_name, fn)` and `dispatchEvent(evt)`. These functions dynamically add an object property, `._evt_handlers = {}`, the first time `addEventListener()` is called. If your objects share a common prototype, you can pass that for better performance: `ll.addEventSupport(MyObject.prototype)`. Or, if you want to decorate every object in the tree, supply `true` for `should_cascade`.

## Event Support

Lightning Layout provides event propagation (bubbling) of mouse events (`mousemove`, `mousedown`, `mouseup`, `click`) and touch events (`touchstart`, `touchend`, `touchmove`, `touchcancel`). Events propagate up the object tree, starting with the children and propagating up to the parents. If siblings overlap each-other (both are under the mouse cursor), the event will be dispatched in reverse order, starting with the last sibling.

To take advantage of the event support, you need to pass the canvas element (or whatever object your runtime provides to listen for events via `addEventListener()`) to the `LightningLayout()` constructor. If your element objects already support events (already have `dispatchEvent()` and `addEventListener()` methods) then this is all you need to do. However, if you are using plain javascript objects or a custom class that does not provide event support, you will need to call `ll.addEventSupport()` (see above). If you are using an event system that uses non-standard event methods (like Backbone.Events), you will need to write adapter methods that proxy the standard methods to the non-standard methods (for backbone, you would need to supply a `addEventListener(evt_name, fn)` method that calls Backbone's `on(evt_name, fn)` and a `dispatchEvent(evt)` method that calls Backbone's `trigger(evt_name, evt)`).

Lightning Layout's `dispatchEvent()` respects `evt.stopImmediatePropagation()`, but only if `evt.isImmediatePropagationStopped()` is supported by the browser/runtime. Likewise Lightning Layout's event propagation respects `evt.stopPropagation()`, but only if  `evt.isPropagationStopped()` is supported by the browser/runtime.

See the footer click handling in `index.html` (http://prust.github.io/lightning-layout/index.html) for an example of event support.

## Supported style properties

* `left`, `right`, `top`, `bottom` - these can be numbers or percentages and will position the edge of the element relative to its parent
* `width`, `height` - these will be used to calculate unsupplied edges (for instance if a `right` and `width` properties are given, the `left` will be calculated), can be a number or a percent or the strings "textWidth" / "textHeight" for shrink-wrapped width/height.
* `font` - [css font string](https://developer.mozilla.org/en-US/docs/Web/CSS/font) defining the font style, size and face
* `text` - text to display inside the element
* `padding` - single number used for padding on all four sides (see To-Do section below for note on `paddingLeft`)
* `backgroundColor` - [css color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for the border (transparent if not supplied)
* `borderColor` - [css color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color) for the border (no border is rendered if this is not supplied).
* `borderWidth` - number for the width of the border (the border is drawn inside the element, then padding is inside of that, see Box Model). See To-Do section below for note on `borderLeftWidth`.

## Box Model

There is no support for margins, since elements are positioned based on their parent, not sibling or "flow", and margins would overlap in meaning with the top/right/bottom/left properties. Borders and padding are both drawn *inside* the element (the border first, then padding is inside of that. For example: if there is a border of 1px and a padding of 2px, the inner width (the space reserved for text and child elements) would be 6px less than the outer width (`(1px + 2px) * 2`).

## Custom element rendering or layout

You can do custom layout or rendering of objects (or to let them handle their own layout/rendering) by wrapping `_render()` or `_layout()` with a function that does the custom rendering. This is useful for custom elements, like a canvas-based text-input control ([here](https://github.com/goldfire/CanvasInput), [here](https://github.com/claydotio/Canvas-Input/) or [here](https://github.com/barmalei/zebra)).

## Production Readiness

LightningLayout is not quite production-ready. The 4 most glaring omissions are listed at the top of the To-Do section below. Also, it could use more testing (the 2 examples are somewhat complex and they render correctly, but it needs to be tested in a wider variety of use cases).

## To-Do

These need to be implemented in the layout engine itself:

* add support for separately specifying padding, borderColor and borderWidth (`paddingLeft`, `borderLeftColor`, `borderLeftWidth`), as well as for shorthand formats that specify 2, 3 or 4 values (ex: `"2px 3px 0 0"`)
* implement text wrapping
* add support for rounded rectangles (all corners or individual corners)
* implement `overflow: auto/scroll/hidden` & `textOverflow: ellipsis`
* implement `position: "flow-x"` and `position: "flow-y"`. This would enable clients to easily display all the options in an option menu, for instance, without pulling into our laps all the complexities of `position: "static"` (the CSS default positioning), which has to place items in a row and then wrap them down to the next row, while dealing with variable height items, etc.
* allow a space-delimited className property that can apply a set of styles
* add support for background images
* make a more friendly method of custom rendering/layout (emitting an event or providing a hook)

## Non-Core To-Do

These should be done outside of the layout engine:

* implement the most popular Bootstrap CSS classes (for buttons, modals, drop-downs, etc)
* implement the most popular Bootstrap components (dropdowns, modals, etc)
* write a mustache/handlebars-like templating engine
* test the 3rd-party canvas-based text-input controls (see above), writeup their pros/cons & make sure it's super-easy to use the best one(s) with Lightning Layout
* test & document using glyphicons & fontawesome icons with Lightning Layout (perhaps provide CSS classes, if helpful)
