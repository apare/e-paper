import * as rpio from "rpio";
import Display from "./display";

export const PINS = {
  RST: 17,
  DC: 25,
  CS: 8,
  BUSY: 24
};

export default class EPD extends Display {
  constructor(width: number, height: number, channels: string[]) {
    super(width, height, channels);

    const terminate = () => {
      this.end();
      process.exit(0);
    };

    process.on("SIGINT", terminate);
    process.on("SIGTERM", terminate);

    try {
      (rpio as any).on("warn", (e: any) => {
        console.warn(e);
      });
      rpio.init({ mapping: "gpio", gpiomem: false });

      rpio.open(PINS.RST, rpio.OUTPUT);
      rpio.open(PINS.DC, rpio.OUTPUT);
      rpio.open(PINS.CS, rpio.OUTPUT);
      rpio.open(PINS.BUSY, rpio.INPUT);

      rpio.spiBegin();
      rpio.spiChipSelect(0);
      rpio.spiSetCSPolarity(0, rpio.HIGH);
      rpio.spiSetClockDivider(128);
    } catch (err) {
      console.log(err);
      this.end();
      throw err;
    }
  }

  public end() {
    rpio.spiEnd();
  }

  protected reset() {
    this.digitalWrite(PINS.RST, false);
    this.sleep(200);
    this.digitalWrite(PINS.RST, true);
    this.sleep(200);
  }

  public waitUntilIdle() {
    while (
      this.digitalRead(PINS.BUSY) === 0 // 0: busy, 1: idle
    ) {
      rpio.msleep(100);
    }
  }

  public sleep(n: number) {
    rpio.msleep(n);
  }

  public digitalRead(pin: number) {
    return rpio.read(pin);
  }

  public digitalWrite(pin: number, value: boolean) {
    console.log(`epd_digital_write ${pin} ${value ? rpio.HIGH : rpio.LOW}`);
    rpio.write(pin, value ? rpio.HIGH : rpio.LOW);
  }

  private spiTransfer(data: number) {
    const buffer = new Buffer([data]);
    rpio.spiWrite(buffer, buffer.length);
  }

  protected sendCommand(command: number) {
    this.digitalWrite(PINS.DC, false);
    this.spiTransfer(command);
  }

  protected sendData(data: number) {
    this.digitalWrite(PINS.DC, true);
    this.spiTransfer(data);
  }

  protected sendDataArray(data: number[]) {
    data.forEach(value => {
      this.sendData(value);
    });
  }
}
