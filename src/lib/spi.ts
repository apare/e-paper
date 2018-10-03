import * as SPI from "spi";

export default class Spi {
  private spi: SPI.Spi;

  constructor(device = "/dev/spidev0.0", mode = SPI.MODE["MODE_0"]) {
    this.spi = new SPI.Spi(device, {
      mode,
      maxSpeed: 2000000
    });
  }

  open() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.spi.open();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  close() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.spi.close();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  read(buf: Buffer) {
    return new Promise<Buffer>((resolve, reject) => {
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
    return new Promise<Buffer>((resolve, reject) => {
      try {
        this.spi.write(buf, (_device: any, buf: Buffer) => {
          resolve(buf);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async write(data: Array<any> | Buffer) {
    if (!Array.isArray(data) && !Buffer.isBuffer(data)) {
      throw new Error("data must be Array or Buffer type");
    }
    data = [...data];
    while (data.length > 0) {
      await this.unsafeWrite(Buffer.from(data.splice(0, 4096)));
    }
  }
}
