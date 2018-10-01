import * as SPI from "spi";

import { SPIDEV_MAXPATH, SPIDEV_MAXSPEED } from "./constants";

export default class SPIWrapper {
  private spi: any;

  constructor(device = "/dev/spidev0.0", mode = SPI.MODE["MODE_0"]) {
    this.spi = new SPI.Spi(device, {
      mode: mode
    });
    this.spi.maxSpeed(SPIDEV_MAXSPEED);
  }

  open() {
    return new Promise((resolve, reject) => {
      try {
        this.spi.open();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      try {
        this.spi.close();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  read(buf: Buffer) {
    return new Promise((resolve, reject) => {
      try {
        this.spi.read(buf, (_device: any, buf: Buffer) => {
          resolve(buf);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  unsafeWrite(buf: Buffer) {
    return new Promise((resolve, reject) => {
      try {
        this.spi.write(buf, (_device: any, buf: Buffer) => {
          resolve(buf);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  write(data: Array<any> | Buffer) {
    return new Promise(async (resolve, reject) => {
      if (!Array.isArray(data) && !Buffer.isBuffer(data)) {
        return reject(new Error("data must be Array or Buffer type"));
      }
      if (!data.length) {
        return resolve();
      }
      try {
        data = [...data];
        while (data.length) {
          await this.unsafeWrite(Buffer.from(data.splice(0, SPIDEV_MAXPATH)));
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
