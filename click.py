from Quartz.CoreGraphics import * 

import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

send_button_x = int(os.environ["SEND_BUTTON_X"])
send_button_y = int(os.environ["SEND_BUTTON_Y"])

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