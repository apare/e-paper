declare module "rpi-gpio" {
  export const MODE_RPI: number;
  export const MODE_BCM: number;

  export function setMode(mode: number): void;

  export const DIR_IN: number;
  export const DIR_OUT: number;
  export const DIR_LOW: number;
  export const DIR_HIGH: number;

  export function setup(
    pin: number,
    direction: number,
    callback: (err: any) => void
  ): void;

  export function input(
    pin: number,
    callback: (err: any, value: boolean) => void
  ): void;

  export function output(
    pin: number,
    value: boolean,
    callback: (err: any) => void
  ): void;

  export function destroy(callback: (err: any) => void): void;
}
