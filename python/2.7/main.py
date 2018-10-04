import epd2in7b
import Image
import ImageDraw
import ImageFont
COLORED = 1
UNCOLORED = 0


def main():
    epd = epd2in7b.EPD()
    epd.init()

    # clear the frame buffer
    frame_black = [0] * (epd.width * epd.height / 8)
    frame_red = [0] * (epd.width * epd.height / 8)

    epd.display_frame(frame_black, frame_red)

if __name__ == '__main__':
    main()