(function() {
  function layout(ctx, widget, parent_x1, parent_y1, parent_x2, parent_y2) {
    var x1 = parent_x1;
    var y1 = parent_y1;
    var x2 = parent_x2;
    var y2 = parent_y2;
    var parent_height = y2 - y1;
    var parent_width = x2 - x1;
    var padding = widget.padding || 0;

    // calc the values that are supplied
    if (widget.top != null)
      y1 += val(widget.top, parent_height);
    if (widget.left != null)
      x1 += val(widget.left, parent_width);
    if (widget.bottom != null)
      y2 -= val(widget.bottom, parent_height);
    if (widget.right != null)
      x2 -= val(widget.right, parent_width);

    // calc unsupplied values based on supplied values
    if (widget.top == null && widget.bottom != null && widget.height != null)
      y1 = y2 - val(widget.height, parent_width);
    if (widget.left == null && widget.right != null && widget.width != null)
      x1 = x2 - val(widget.width, parent_width);
    if (widget.bottom == null && widget.height != null)
      y2 = y1 + val(widget.height, parent_height);        
    if (widget.left == null && widget.width != null)
      x2 = x1 + val(widget.width, parent_width);

    if (widget.text) {
      ctx.font = widget.font || '12pt Helvetica';
      var metrics = ctx.measureText(widget.text);
      metrics.height = 12;

      // if we couldn't calc from unsupplied values, calc from text content
      if (widget.bottom == null && widget.height == null)
        y2 = y1 + metrics.height + padding * 2;
      if (widget.right == null && widget.width == null)
        x2 = x1 + metrics.width + padding * 2;
    }

    if (widget.backgroundColor) {
      ctx.fillStyle = widget.backgroundColor;
      ctx.fillRect(x1, y1, x2-x1, y2-y1);
    }

    if (widget.borderColor) {
      ctx.strokeStyle = widget.borderColor;
      ctx.lineWidth = widget.borderWidth;
      ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    }

    if (widget.text) {
      ctx.fillStyle = widget.color;
      ctx.fillText(widget.text, x1 + padding, y1 + metrics.height + padding);
    }

    if (widget.children) {
      widget.children.forEach(function(child) {
        layout(ctx, child, x1 + padding, y1 + padding, x2 - padding, y2 - padding);
      });
    }
  }

  function val(value, parent_value) {
    if (typeof value == 'string' && value[value.length - 1] == '%')
      return parseInt(value.slice(0, -1), 10) / 100 * parent_value;
    else
      return value;
  }

  // expose lightningLayout() as a global function
  this.lightningLayout = layout;
})();
