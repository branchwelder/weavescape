function computePinchData(ev0, ev1) {
  // computes distance between two pointer events
  const dx = Math.abs(ev0.clientX - ev1.clientX);
  const dy = Math.abs(ev0.clientY - ev1.clientY);

  return {
    target: {
      x: Math.round(Math.min(ev0.clientX, ev1.clientX) + dx / 2),
      y: Math.round(Math.min(ev0.clientY, ev1.clientY) + dy / 2),
    },
    dist: Math.round(Math.hypot(dx, dy)),
  };
}

function eventPos(e) {
  return {
    x: Math.round(e.clientX),
    y: Math.round(e.clientY),
  };
}

export function pointerInteraction(element, callbacks, windowTracking = true) {
  const eventCache = [];
  let lastPos = { x: -1, y: -1 };
  let prevDist = -1;
  let trackingElement = windowTracking ? window : element;
  let trackingPointerEvents = false;
  let onDrag;

  element.addEventListener("pointermove", hoverHandler);
  element.addEventListener("pointerdown", pointerdownHandler);
  element.addEventListener("wheel", wheelHandler);

  function hoverHandler(e) {
    if (eventCache.length == 0 && callbacks.hover) {
      callbacks.hover(eventPos(e));
    }
  }

  function removePointerEvent(e) {
    // Find the pointer event in the event cache and remove it
    const eventIndex = eventCache.findIndex(
      (cachedEvent) => cachedEvent.pointerId === e.pointerId
    );

    eventCache.splice(eventIndex, 1);
  }

  function initSinglePointer(e) {
    lastPos = eventPos(e);

    if (e.which == 2 && callbacks.wheelDrag) {
      // if it's a wheel drag
      onDrag = callbacks.wheelDrag(lastPos);
    } else if (e.shiftKey && callbacks.shiftDrag) {
      onDrag = callbacks.shiftDrag(lastPos);
    } else if (callbacks.drag) {
      onDrag = callbacks.drag(lastPos);
    }
  }

  function initDoublePointer() {
    const pinch = computePinchData(eventCache[0], eventCache[1]);
    lastPos = pinch.target;
    prevDist = pinch.dist;

    if (callbacks.pinchDrag) {
      onDrag = callbacks.pinchDrag(lastPos);
    }
  }

  function initPointerState() {
    onDrag = null;
    if (eventCache.length == 1) {
      initSinglePointer(eventCache[0]);
    } else if (eventCache.length == 2) {
      initDoublePointer();
    }
  }

  function pointerEnd(ev) {
    removePointerEvent(ev);

    initPointerState();

    if (eventCache.length < 1) {
      trackingPointerEvents = false;
      lastPos = { x: -1, y: -1 };

      trackingElement.removeEventListener("pointermove", pointermoveHandler);

      // Remove pointer end events
      trackingElement.removeEventListener("pointerup", pointerEnd);
      trackingElement.removeEventListener("pointercancel", pointerEnd);
      trackingElement.removeEventListener("pointerleave", pointerEnd);

      // Pointerout seems to run for all pointers? investigate this
      // trackingEl.removeEventListener("pointerout", pointerEnd);
    }
  }

  function pointerdownHandler(e) {
    eventCache.push(e);

    initPointerState();

    if (!trackingPointerEvents) {
      trackingPointerEvents = true;
      trackingElement.addEventListener("pointermove", pointermoveHandler);

      // Add pointer end events
      trackingElement.addEventListener("pointerup", pointerEnd);
      trackingElement.addEventListener("pointercancel", pointerEnd);
      trackingElement.addEventListener("pointerleave", pointerEnd);

      // Pointerout seems to run for all pointers? investigate this
      // trackingEl.addEventListener("pointerout", pointerEnd);
    }
  }

  function pointermoveHandler(ev) {
    const index = eventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === ev.pointerId
    );
    eventCache[index] = ev;

    if (eventCache.length === 1) {
      if (onDrag) {
        onDrag(eventPos(ev));
      }
    } else if (eventCache.length === 2) {
      pinch();
    }
  }

  function pinch() {
    // runs when a pointer moves and exactly two pointers are down
    const pinch = computePinchData(eventCache[0], eventCache[1]);

    let multiplier = prevDist > 0 ? pinch.dist / prevDist : 1;

    if (callbacks.pinch) {
      callbacks.pinch(pinch.target, multiplier);
    }

    if (onDrag) {
      onDrag(pinch.target);
    }

    // Cache the distance for the next move event
    prevDist = pinch.dist;
    lastPos = pinch.target;
  }

  function wheelHandler(e) {
    if (callbacks.wheel) {
      let multiplier = Math.pow(1.2, e.deltaY * -0.01);
      callbacks.wheel(eventPos(e), multiplier);
    }
  }

  return {
    eventCache: eventCache,
    checkInteracting: () => trackingPointerEvents,
  };
}
