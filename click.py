from Quartz.CoreGraphics import * 
def mouseEvent(type, posx, posy):
        theEvent = CGEventCreateMouseEvent(None, type, (posx,posy), kCGMouseButtonLeft)
        CGEventPost(kCGHIDEventTap, theEvent)
def mousemove(posx,posy):
        mouseEvent(kCGEventMouseMoved, posx,posy);
def mouseclick(posx,posy):
        mouseEvent(kCGEventLeftMouseDown, posx,posy);
        mouseEvent(kCGEventLeftMouseUp, posx,posy);
ourEvent = CGEventCreate(None); 
currentpos=CGEventGetLocation(ourEvent);    # Save current mouse position
mouseclick(20,231);
mousemove(int(currentpos.x),int(currentpos.y));  # Restore mouse position