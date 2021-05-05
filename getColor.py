import PIL.ImageGrab

#1405,782 (Richi)
send_button_x = 1237
send_button_y = 777

def get_pixel_colour(i_x, i_y):	
	return PIL.ImageGrab.grab().load()[i_x, i_y]
 
print (get_pixel_colour(send_button_x, send_button_y))
