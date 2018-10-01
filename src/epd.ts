import * as GPIO from "./gpio";
import SPI from "./spi";
import Display from "./display";
import { sleep } from "./utils";

export const PINS = {
  RST: 11,
  DC: 22,
  BUSY: 18,
  CS: 24
};

export default class EPD extends Display {
  private spi: SPI;

  constructor(width: number, height: number) {
    super(width, height);
    const terminate = async () => {
      await this.exit();
      process.exit(0);
    };
    process.on("SIGINT", terminate);
    process.on("SIGTERM", terminate);
    this.init();
  }

  protected async init() {
    try {
      GPIO.setModeBCM();
      await GPIO.setDirOut(PINS.RST);
      await GPIO.setDirOut(PINS.DC);
      await GPIO.setDirOut(PINS.CS);
      await GPIO.setDirIn(PINS.BUSY);

      this.spi = new SPI();
      await this.spi.open();
    } catch (err) {
      await this.exit();
      throw err;
    }
  }

  private async exit() {
    await this.spi.close();
    await GPIO.destroy();
  }

  public async whileBusy(timeout: number = 5000) {
    for (let i = 0; i < timeout / 10; i++) {
      let busy = await GPIO.input(PINS.BUSY);
      if (busy === false) {
        return true;
      }
      await sleep(10);
    }
    return false;
  }

  protected async writeCommand(command: number) {
    await GPIO.output(PINS.DC, GPIO.LOW);
    await this.spi.write([command]);
  }

  protected async writeData(data: number) {
    await GPIO.output(PINS.DC, GPIO.HIGH);
    this.spi.write([data]);
  }
}

interface Device {
  width: number;
  height: number;
  drawChannels(
    channels: number[][],
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void>;
}
