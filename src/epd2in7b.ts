import EPD from "./epd";

export default class Epd2in7b extends EPD {
  private width = 176;
  private height = 264;

  async init() {
    await super.init();

    await this.writeCommand(Command.POWER_ON);
    await this.whileBusy();

    await this.writeCommand(Command.PANEL_SETTING);
    await this.writeData(0xaf); //KW-BF   KWR-AF    BWROTP 0f

    await this.writeCommand(Command.PLL_CONTROL);
    await this.writeData(0x3a); //3A 100HZ   29 150Hz 39 200HZ    31 171HZ

    await this.writeCommand(Command.POWER_SETTING);
    await this.writeData(0x03); // VDS_EN, VDG_EN
    await this.writeData(0x00); // VCOM_HV, VGHL_LV[1], VGHL_LV[0]
    await this.writeData(0x2b); // VDH
    await this.writeData(0x2b); // VDL
    await this.writeData(0x09); // VDHR

    await this.writeCommand(Command.BOOSTER_SOFT_START);
    await this.writeData(0x07);
    await this.writeData(0x07);
    await this.writeData(0x17);

    // Power optimization
    await this.writeCommand(0xf8);
    await this.writeData(0x60);
    await this.writeData(0xa5);

    // Power optimization
    await this.writeCommand(0xf8);
    await this.writeData(0x89);
    await this.writeData(0xa5);

    // Power optimization
    await this.writeCommand(0xf8);
    await this.writeData(0x90);
    await this.writeData(0x00);

    // Power optimization
    await this.writeCommand(0xf8);
    await this.writeData(0x93);
    await this.writeData(0x2a);

    // Power optimization
    await this.writeCommand(0xf8);
    await this.writeData(0x73);
    await this.writeData(0x41);

    await this.writeCommand(Command.VCM_DC_SETTING_REGISTER);
    await this.writeData(0x12);
    await this.writeCommand(Command.VCOM_AND_DATA_INTERVAL_SETTING);
    await this.writeData(0x87); // define by OTP

    await this.setLut();

    await this.writeCommand(Command.PARTIAL_DISPLAY_REFRESH);
    await this.writeData(0x00);
  }

  async setLut(): Promise<void> {
    await this.writeCommand(Command.LUT_FOR_VCOM); // vcom
    await Promise.all(lut_vcom_dc.map(data => this.writeData(data)));

    await this.writeCommand(Command.LUT_WHITE_TO_WHITE); // ww --
    await Promise.all(lut_ww.map(data => this.writeData(data)));

    await this.writeCommand(Command.LUT_BLACK_TO_WHITE); // bw r
    await Promise.all(lut_bw.map(data => this.writeData(data)));

    await this.writeCommand(Command.LUT_WHITE_TO_BLACK); // wb w
    await Promise.all(lut_bb.map(data => this.writeData(data)));

    await this.writeCommand(Command.LUT_BLACK_TO_BLACK); // bb b
    await Promise.all(lut_wb.map(data => this.writeData(data)));
  }

  async displayFrame(black: Buffer, red: Buffer) {
    await this.writeCommand(Command.TCON_RESOLUTION);
    await this.writeData(this.width >> 8);
    await this.writeData(this.width & 0xff); //176
    await this.writeData(this.height >> 8);
    await this.writeData(this.height & 0xff); //264

    if (black != null) {
      await this.writeCommand(Command.DATA_START_TRANSMISSION_1);
      await this.sleep(2);
      for (var i = 0; i < black.length; i++) {
        await this.writeData(black[i]);
      }
      await this.sleep(2);
    }
    if (red != null) {
      await this.writeCommand(Command.DATA_START_TRANSMISSION_1);
      await this.sleep(2);
      for (var i = 0; i < black.length; i++) {
        await this.writeData(red[i]);
      }
      await this.sleep(2);
    }
    await this.writeCommand(Command.DISPLAY_REFRESH);
    await this.whileBusy();
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
