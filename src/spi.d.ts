declare module "spi" {
  export enum MODE {
    MODE_0,
    MODE_1,
    MODE_2,
    MODE_3
  }

  export enum CS {
    none,
    high,
    low
  }

  export enum ORDER {
    msb,
    lsb
  }

  export interface IOption {
    mode: MODE;
    chipSelect: CS;
    size: number;
    bitOrder: ORDER;
    maxSpeed: number;
    halfDuplex: boolean;
    loopback: boolean;
  }

  export class Spi {
    constructor(
      device: string,
      options: IOption,
      callback?: (spi: Spi) => void
    );

    open(): void;
    close(): void;
    write(buffer: Buffer, callback: (spi: Spi, buffer: Buffer) => void): void;
    read(buffer: Buffer, callback: (spi: Spi, buffer: Buffer) => void): void;
    transfer(
      txbuf: Buffer,
      rxbuf: Buffer,
      callback: (spi: Spi, rxbuf: Buffer) => void
    ): void;
    mode(mode: MODE): void;
    chipSelect(cs: CS): void;
    bitsPerWord(bpw: number): void;
    bitOrder(bo: ORDER): void;
    maxSpeed(maxSpeed: number): void;
    halfDuplex(duplex: boolean): void;
    loopback(loop: boolean): void;
  }
}
