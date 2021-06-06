import PIL.ImageGrab
import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

send_button_x = int(os.environ["SEND_BUTTON_X"])
send_button_y = int(os.environ["SEND_BUTTON_Y"])
 
def get_pixel_colour(i_x, i_y):	
	return PIL.ImageGrab.grab().load()[i_x, i_y]
 
print (get_pixel_colour(send_button_x, send_button_y))
