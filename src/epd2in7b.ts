import EPD from "./epd";

export default class Epd2in7b extends EPD {
  constructor() {
    super(176, 264, ["000000", "ff0000"]);

    this.reset();

    this.sendCommand(Command.POWER_ON);
    this.waitUntilIdle();

    this.sendCommand(Command.PANEL_SETTING);
    this.sendData(0xaf); //KW-BF   KWR-AF    BWROTP 0f

    this.sendCommand(Command.PLL_CONTROL);
    this.sendData(0x3a); //3A 100HZ   29 150Hz 39 200HZ    31 171HZ

    this.sendCommand(Command.POWER_SETTING);
    this.sendData(0x03); // VDS_EN, VDG_EN
    this.sendData(0x00); // VCOM_HV, VGHL_LV[1], VGHL_LV[0]
    this.sendData(0x2b); // VDH
    this.sendData(0x2b); // VDL
    this.sendData(0x09); // VDHR

    this.sendCommand(Command.BOOSTER_SOFT_START);
    this.sendData(0x07);
    this.sendData(0x07);
    this.sendData(0x17);

    // Power optimization
    this.sendCommand(0xf8);
    this.sendData(0x60);
    this.sendData(0xa5);

    // Power optimization
    this.sendCommand(0xf8);
    this.sendData(0x89);
    this.sendData(0xa5);

    // Power optimization
    this.sendCommand(0xf8);
    this.sendData(0x90);
    this.sendData(0x00);

    // Power optimization
    this.sendCommand(0xf8);
    this.sendData(0x93);
    this.sendData(0x2a);

    // Power optimization
    this.sendCommand(0xf8);
    this.sendData(0x73);
    this.sendData(0x41);

    this.sendCommand(Command.VCM_DC_SETTING_REGISTER);
    this.sendData(0x12);
    this.sendCommand(Command.VCOM_AND_DATA_INTERVAL_SETTING);
    this.sendData(0x87); // define by OTP

    this.setLut();

    this.sendCommand(Command.PARTIAL_DISPLAY_REFRESH);
    this.sendData(0x00);
  }

  private setLut() {
    this.sendCommand(Command.LUT_FOR_VCOM); // vcom
    this.sendDataArray(lut_vcom_dc);

    this.sendCommand(Command.LUT_WHITE_TO_WHITE); // ww --
    this.sendDataArray(lut_ww);

    this.sendCommand(Command.LUT_BLACK_TO_WHITE); // bw r
    this.sendDataArray(lut_bw);

    this.sendCommand(Command.LUT_WHITE_TO_BLACK); // wb w
    this.sendDataArray(lut_bb);

    this.sendCommand(Command.LUT_BLACK_TO_BLACK); // bb b
    this.sendDataArray(lut_wb);
  }

  protected drawChannels(
    channels: number[][],
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const [black, red] = channels;
    if (x == 0 && y == 0 && width == this.width && height == this.height) {
      this.displayFrame(black, red);
    } else {
      throw "Partial Update is not enabled";
    }
  }

  private displayFrame(black: Array<number>, red: Array<number>) {
    this.sendCommand(Command.TCON_RESOLUTION);
    this.sendData(this.width >> 8);
    this.sendData(this.width & 0xff); //176
    this.sendData(this.height >> 8);
    this.sendData(this.height & 0xff); //264

    if (black != null) {
      this.sendCommand(Command.DATA_START_TRANSMISSION_1);
      this.sleep(2);
      this.sendDataArray(black);
      this.sleep(2);
    }
    if (red != null) {
      this.sendCommand(Command.DATA_START_TRANSMISSION_2);
      this.sleep(2);
      this.sendDataArray(red);
      this.sleep(2);
    }
    this.sendCommand(Command.DISPLAY_REFRESH);
    this.waitUntilIdle();
  }
}

enum Command {
  PANEL_SETTING = 0x00,
  POWER_SETTING = 0x01,
  POWER_OFF = 0x02,
  POWER_OFF_SEQUENCE_SETTING = 0x03,
  POWER_ON = 0x04,
  POWER_ON_MEASURE = 0x05,
  BOOSTER_SOFT_START = 0x06,
  DEEP_SLEEP = 0x07,
  DATA_START_TRANSMISSION_1 = 0x10,
  DATA_STOP = 0x11,
  DISPLAY_REFRESH = 0x12,
  DATA_START_TRANSMISSION_2 = 0x13,
  PARTIAL_DATA_START_TRANSMISSION_1 = 0x14,
  PARTIAL_DATA_START_TRANSMISSION_2 = 0x15,
  PARTIAL_DISPLAY_REFRESH = 0x16,
  LUT_FOR_VCOM = 0x20,
  LUT_WHITE_TO_WHITE = 0x21,
  LUT_BLACK_TO_WHITE = 0x22,
  LUT_WHITE_TO_BLACK = 0x23,
  LUT_BLACK_TO_BLACK = 0x24,
  PLL_CONTROL = 0x30,
  TEMPERATURE_SENSOR_COMMAND = 0x40,
  TEMPERATURE_SENSOR_CALIBRATION = 0x41,
  TEMPERATURE_SENSOR_WRITE = 0x42,
  TEMPERATURE_SENSOR_READ = 0x43,
  VCOM_AND_DATA_INTERVAL_SETTING = 0x50,
  LOW_POWER_DETECTION = 0x51,
  TCON_SETTING = 0x60,
  TCON_RESOLUTION = 0x61,
  SOURCE_AND_GATE_START_SETTING = 0x62,
  GET_STATUS = 0x71,
  AUTO_MEASURE_VCOM = 0x80,
  VCOM_VALUE = 0x81,
  VCM_DC_SETTING_REGISTER = 0x82,
  PROGRAM_MODE = 0xa0,
  ACTIVE_PROGRAM = 0xa1,
  READ_OTP_DATA = 0xa2
}

const lut_vcom_dc = [
  0x00,
  0x00,
  0x00,
  0x1a,
  0x1a,
  0x00,
  0x00,
  0x01,
  0x00,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x00,
  0x0e,
  0x01,
  0x0e,
  0x01,
  0x10,
  0x00,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x00,
  0x04,
  0x10,
  0x00,
  0x00,
  0x05,
  0x00,
  0x03,
  0x0e,
  0x00,
  0x00,
  0x0a,
  0x00,
  0x23,
  0x00,
  0x00,
  0x00,
  0x01
];

// R21H
const lut_ww = [
  0x90,
  0x1a,
  0x1a,
  0x00,
  0x00,
  0x01,
  0x40,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x84,
  0x0e,
  0x01,
  0x0e,
  0x01,
  0x10,
  0x80,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x00,
  0x04,
  0x10,
  0x00,
  0x00,
  0x05,
  0x00,
  0x03,
  0x0e,
  0x00,
  0x00,
  0x0a,
  0x00,
  0x23,
  0x00,
  0x00,
  0x00,
  0x01
];

// R22H    r
const lut_bw = [
  0xa0,
  0x1a,
  0x1a,
  0x00,
  0x00,
  0x01,
  0x00,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x84,
  0x0e,
  0x01,
  0x0e,
  0x01,
  0x10,
  0x90,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0xb0,
  0x04,
  0x10,
  0x00,
  0x00,
  0x05,
  0xb0,
  0x03,
  0x0e,
  0x00,
  0x00,
  0x0a,
  0xc0,
  0x23,
  0x00,
  0x00,
  0x00,
  0x01
];

// R23H    w
const lut_bb = [
  0x90,
  0x1a,
  0x1a,
  0x00,
  0x00,
  0x01,
  0x40,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x84,
  0x0e,
  0x01,
  0x0e,
  0x01,
  0x10,
  0x80,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x00,
  0x04,
  0x10,
  0x00,
  0x00,
  0x05,
  0x00,
  0x03,
  0x0e,
  0x00,
  0x00,
  0x0a,
  0x00,
  0x23,
  0x00,
  0x00,
  0x00,
  0x01
];

// R24H    b
const lut_wb = [
  0x90,
  0x1a,
  0x1a,
  0x00,
  0x00,
  0x01,
  0x20,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x84,
  0x0e,
  0x01,
  0x0e,
  0x01,
  0x10,
  0x10,
  0x0a,
  0x0a,
  0x00,
  0x00,
  0x08,
  0x00,
  0x04,
  0x10,
  0x00,
  0x00,
  0x05,
  0x00,
  0x03,
  0x0e,
  0x00,
  0x00,
  0x0a,
  0x00,
  0x23,
  0x00,
  0x00,
  0x00,
  0x01
];
