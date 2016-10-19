(function() {

  function LightningLayout(canvas, defaults) {
    defaults = defaults || {};
    if (canvas) {
      this.canvas = canvas;
      this.dispatch = this.dispatch.bind(this);
      ['mousedown', 'mouseup', 'click', 'mousemove', 'touchstart', 'touchend', 'touchmove', 'touchcancel'].forEach(function(evt_name) {
        canvas.addEventListener(evt_name, this.dispatch);
      }.bind(this));
    }
    this.defaultFont = defaults.font || '12pt Helvetica';
  }
  LightningLayout.prototype.layout = function(ctx, element_obj, parent_x1, parent_y1, parent_x2, parent_y2) {
    if (!this.element_obj)
      this.element_obj = element_obj;

    this._layout(ctx, element_obj, parent_x1, parent_y1, parent_x2, parent_y2);
    if (element_obj.children) {
      var padding = element_obj.padding || 0;
      element_obj.children.forEach(function(child) {
        this.layout(ctx, child, element_obj._layout_x1 + padding, element_obj._layout_y1 + padding, element_obj._layout_x2 - padding, element_obj._layout_y2 - padding);
      }.bind(this));
    }
  };

  LightningLayout.prototype._layout = function(ctx, element_obj, parent_x1, parent_y1, parent_x2, parent_y2) {
    var x1 = parent_x1;
    var y1 = parent_y1;
    var x2 = parent_x2;
    var y2 = parent_y2;
    var parent_height = y2 - y1;
    var parent_width = x2 - x1;

    // calc the values that are supplied
    if (element_obj.top != null)
      y1 += this.val(element_obj.top, parent_height);
    if (element_obj.left != null)
      x1 += this.val(element_obj.left, parent_width);
    if (element_obj.bottom != null)
      y2 -= this.val(element_obj.bottom, parent_height);
    if (element_obj.right != null)
      x2 -= this.val(element_obj.right, parent_width);

    // calc textWidth / textHeight values
    var padding = element_obj.padding || 0;
    var width, height;
    if (element_obj.width == 'textWidth' || element_obj.height == 'textHeight') {
      if (element_obj.text) {
        ctx.font = element_obj.font || this.defaultFont;
        var metrics = ctx.measureText(element_obj.text);
        metrics.height = this.calcTextHeight(element_obj.font || this.defaultFont);
        height = metrics.height + padding * 2;
        width = metrics.width + padding * 2;
      }
      else {
        width = height = 0;
      }
    }
    else {
      if (element_obj.width)
        width = this.val(element_obj.width, parent_width);
      if (element_obj.height)
        height = this.val(element_obj.height, parent_height);
    }

    // calc unsupplied values based on supplied values
    if (element_obj.top == null && element_obj.bottom != null && height != null)
      y1 = y2 - height;
    if (element_obj.left == null && element_obj.right != null && width != null)
      x1 = x2 - width;
    if (element_obj.bottom == null && height != null)
      y2 = y1 + height;        
    if (element_obj.left == null && width != null)
      x2 = x1 + width;

    element_obj._layout_x1 = x1;
    element_obj._layout_x2 = x2;
    element_obj._layout_y1 = y1;
    element_obj._layout_y2 = y2;
  };

  LightningLayout.prototype.render = function(ctx, element_obj) {
    if (!this.element_obj)
      this.element_obj = element_obj;

    this._render(ctx, element_obj);
    if (element_obj.children) {
      element_obj.children.forEach(function(child) {
        this.render(ctx, child);
      }.bind(this));
    }
  };

  LightningLayout.prototype._render = function(ctx, element_obj) {
    var x1 = element_obj._layout_x1;
    var x2 = element_obj._layout_x2;
    var y1 = element_obj._layout_y1;
    var y2 = element_obj._layout_y2;
    var padding = element_obj.padding || 0;

    if (element_obj.backgroundColor) {
      ctx.fillStyle = element_obj.backgroundColor;
      ctx.fillRect(x1, y1, x2-x1, y2-y1);
    }

    if (element_obj.borderColor) {
      ctx.strokeStyle = element_obj.borderColor;
      ctx.lineWidth = element_obj.borderWidth;
      ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    }

    if (element_obj.text) {
      ctx.font = element_obj.font || this.defaultFont;
      ctx.fillStyle = element_obj.color;
      var text_height = this.calcTextHeight(element_obj.font || this.defaultFont);
      ctx.fillText(element_obj.text, x1 + padding, y1 + text_height + padding);
    }
  };

  LightningLayout.prototype.val = function(value, parent_value) {
    if (typeof value == 'string' && value[value.length - 1] == '%')
      return parseInt(value.slice(0, -1), 10) / 100 * parent_value;
    else
      return value;
  };

  LightningLayout.prototype.dispatch = function(evt) {
    // keep touch events from performing default gestures
    if (evt.target == this.canvas && evt.type.startsWith('touch'))
      evt.preventDefault && evt.preventDefault();

    if (!this.element_obj)
      return;

    this._dispatch(evt, this.element_obj);
  };

  LightningLayout.prototype._dispatch = function(evt, element_obj) {
    // walk object tree & dispatch event on appropriate objects
    // depth-first, so it bubbles up
    if (this.contains(element_obj, evt)) {
      if (element_obj.children) {
        element_obj.children.forEach(function(child) {
          this._dispatch(evt, child);
        }.bind(this));
      }

      if (element_obj.dispatchEvent) {
        // respect it when events have their propagation stopped
        if (evt.isPropagationStopped && evt.isPropagationStopped())
          return;

        element_obj.dispatchEvent(evt);
      }
    }
  };

  LightningLayout.prototype.addEventSupport = function(obj, should_cascade) {
    if (!obj.addEventListener) {
      obj.addEventListener = function(evt_name, fn) {
        if (!this._evt_handlers)
          this._evt_handlers = {};
        if (!this._evt_handlers[evt_name])
          this._evt_handlers[evt_name] = [];
        this._evt_handlers[evt_name].push(fn);
      };

      obj.dispatchEvent = function(evt) {
        if (!this._evt_handlers)
          return;

        var handlers = this._evt_handlers[evt.type];
        if (handlers) {
          handlers.forEach(function(fn) {
            // respect it when events have their immediate propagation stopped
            if (evt.isImmediatePropagationStopped && evt.isImmediatePropagationStopped())
              return;

            fn(evt);
          });
        }
      }
    }

    // cascade through children & add event support to them as well
    if (should_cascade && obj.children) {
      obj.children.forEach(function(child) {
        this.addEventSupport(child, should_cascade);
      }.bind(this));
    }
  };

  LightningLayout.prototype.contains = function(element_obj, evt) {
    return evt.clientX >= element_obj._layout_x1 &&
      evt.clientX <= element_obj._layout_x2 &&
      evt.clientY >= element_obj._layout_y1 &&
      evt.clientY <= element_obj._layout_y2;
  };

  // TODO: implement!
  LightningLayout.prototype.calcTextHeight = function(font) {
    return 12;
  };

  // expose LightningLayout(defaults) constructor to the global scope
  this.LightningLayout = LightningLayout;
})();
