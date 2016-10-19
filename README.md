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
lightningLayout(canvas_ctx, widget, parent_x1, parent_y1, parent_x2, parent_y2)
```

* `canvas_ctx`  - the 2D context object from the canvas
* `widget` - the top of your hierarchy of "widgets" (plain javascript objects with optional style properties & an optional `children` property)
* `parent_x1`, `parent_y1` - the top-left coordinates of the canvas, typically `0, 0`
* `parent_x2`, `parent_y2` - the bottom-right coordinates of the canvas, typically the width and height of the canvas

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

![simple layout example](http://prust.github.io/lightning-layout/example-1.png)

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

![complex layout example](http://prust.github.io/lightning-layout/example-2.png)
