# Lightning Layout

*Fast, simple layout & rendering of a lightweight object model on canvas. Inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc).*

Lightning Layout is designed to enable app development on top of a thin, extensible runtime, like [nanocanvas](https://github.com/syoyo/nanocanvas) or Cocoon's [Canvas+ engine](http://docs.cocoon.io/article/canvas-engine/). These runtimes don't provide a DOM or a CSS layout engine, so Lightning Layout fills the gap with a minimal (but capable) solution.

Lightning Layout's design goals are (in order): **simplicity** and **speed**. It is inspired by Netflix's (closed-source) [Gibbon](https://www.youtube.com/watch?v=eNC0mRYGWgc) and shares many similarities with Gibbon:

* JSON is used for declarative layout (instead of HTML)
* All positioning is "absolute" (based on the parent element, not siblings or "flow")
* All styles are set on elements themselves, there is no cascading (TODO: allow a user-supplied default style)

