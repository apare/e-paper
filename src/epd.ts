import * as GPIO from "rpi-gpio";
import Spi from "./lib/spi";
import Display from "./display";
import { sleep } from "./utils";

const LOW = false;
const HIGH = true;

export const PINS = {
  RST: 11,
  DC: 22,
  BUSY: 18,
  CS: 24
};

export default class EPD extends Display {
  private spi: Spi;

  constructor(width: number, height: number) {
    super(width, height);
    const terminate = async () => {
      await this.exit();
      process.exit(0);
    };
    process.on("SIGINT", terminate);
    process.on("SIGTERM", terminate);
  }

  public async init() {
    try {
      GPIO.setMode(GPIO.MODE_BCM);
      await GPIO.promise.setup(PINS.RST, GPIO.DIR_OUT);
      await GPIO.promise.setup(PINS.DC, GPIO.DIR_OUT);
      await GPIO.promise.setup(PINS.CS, GPIO.DIR_OUT);
      await GPIO.promise.setup(PINS.BUSY, GPIO.DIR_IN);

      this.spi = new Spi();
      await this.spi.open();
    } catch (err) {
      await this.exit();
      throw err;
    }
  }

  private async exit() {
    await this.spi.close();
    await GPIO.promise.destroy();
  }

  public async whileBusy(timeout: number = 5000) {
    for (let i = 0; i < timeout / 10; i++) {
      let busy = await GPIO.promise.read(PINS.BUSY);
      if (busy === false) {
        return true;
      }
      await sleep(10);
    }
    return false;
  }

  protected async writeCommand(command: number) {
    await GPIO.promise.write(PINS.DC, LOW);
    await this.spi.write([command]);
  }

  protected async writeData(data: number) {
    await GPIO.promise.write(PINS.DC, HIGH);
    this.spi.write([data]);
  }
}
