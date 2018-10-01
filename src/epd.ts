import * as GPIO from "./gpio";
import SPIWrapper from "./spi-wrapper";
import { PINS, EPD_MODES } from "./constants";

export default class EPD {
  private _ready = false;
  private _closed = false;
  private _terminated = false;
  private _spi = new SPIWrapper();

  constructor() {
    const terminate = async () => {
      if (this._terminated) {
        return;
      }
      this._terminated = true;
      await this.exit();
      process.exit(0);
    };

    process.on("SIGINT", terminate);
    process.on("SIGTERM", terminate);
  }

  static get MODES() {
    return EPD_MODES;
  }

  get spi() {
    return this._spi;
  }

  get isReady() {
    return this._ready;
  }

  get isClosed() {
    return this._closed;
  }

  get isTerminated() {
    return this._terminated;
  }

  async init() {
    try {
      this._ready = true;
      GPIO.setModeBCM();

      await GPIO.setDirOut(PINS.RST);
      await GPIO.setDirOut(PINS.DC);
      await GPIO.setDirOut(PINS.CS);
      await GPIO.setDirIn(PINS.BUSY);

      await this.spi.open();
      this._ready = true;
    } catch (err) {
      await this.exit();
      throw err;
    }
  }

  sleep(ms: number) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
  }

  async reset() {
    await GPIO.output(PINS.RST, GPIO.LOW); // module reset
    await this.sleep(200);
    await GPIO.output(PINS.RST, GPIO.HIGH);
    await this.sleep(200);
  }

  async exit() {
    if (this.isClosed || !this.isReady) {
      return;
    }

    this._closed = true;
    this._ready = false;
    await this.spi.close();
    await GPIO.destroy();
  }

  async whileBusy(timeout: number = 5000) {
    for (let i = 0; i < timeout / 10; i++) {
      let busy = await GPIO.input(PINS.BUSY);
      if (busy === false) {
        return true;
      }
      await this.sleep(10);
    }
    return false;
  }

  async writeCommand(command: number) {
    await GPIO.output(PINS.DC, GPIO.LOW);
    await this.spi.write([command]);
  }

  async writeData(data: number) {
    await GPIO.output(PINS.DC, GPIO.HIGH);
    this.spi.write([data]);
  }
}
