export enum EPD_MODES {
  FULL,
  PARTIAL
}

export const SPI_MAX_PATH = 4096;
export const SPI_MAX_SPEED = 2000000;

export const COMMANDS = {
  DUMMY_LINE: [0x3a, 0x1a],
  GATE_TIME: [0x3b, 0x08],
  RAM_DATA_ENTRY_MODE: [0x11, 0x01],
  SOFT_START: [0x0c, 0xd7, 0xd6, 0x9d],
  VCOM_VOL: [0x2c, 0xa8]
};
