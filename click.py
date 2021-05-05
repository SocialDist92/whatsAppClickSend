from Quartz.CoreGraphics import * 

send_button_x = 1237
send_button_y = 777

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


#Armando
mouseclick(send_button_x, send_button_y);

mousemove(int(currentpos.x),int(currentpos.y));  # Restore mouse position