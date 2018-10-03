declare module "rpi-gpio" {
  export const DIR_IN: string;
  export const DIR_OUT: string;
  export const DIR_LOW: string;
  export const DIR_HIGH: string;

  export const MODE_RPI: string;
  export const MODE_BCM: string;

  export const EDGE_NONE: string;
  export const EDGE_RISING: string;
  export const EDGE_FALLING: string;
  export const EDGE_BOTH: string;

  /**
   * Set pin reference mode. Defaults to 'mode_rpi'.
   *
   * @param {string} mode Pin reference mode, 'mode_rpi' or 'mode_bcm'
   */
  export function setMode(mode: string): void;

  /**
   * Setup a channel for use as an input or output
   *
   * @param {number}   channel   Reference to the pin in the current mode's schema
   * @param {string}   direction The pin direction, either 'in' or 'out'
   * @param {function} onSetup   Optional callback
   */
  export function setup(channel: number, direction: string, onSetup: (err: any) => void): void;
  /**
   * Setup a channel for use as an input or output
   *
   * @param {number}   channel   Reference to the pin in the current mode's schema
   * @param {string}   direction The pin direction, either 'in' or 'out'
   * @param edge       edge Informs the GPIO chip if it needs to generate interrupts. Either 'none', 'rising', 'falling' or 'both'. Defaults to 'none'
   * @param {function} onSetup   Optional callback
   */
  export function setup(channel: number, direction: string, edge: string, onSetup: (err: any) => void): void;

  /**
   * Write a value to a channel
   *
   * @param {number}   channel The channel to write to
   * @param {boolean}  value   If true, turns the channel on, else turns off
   * @param {function} cb      Optional callback
   */
  export function write(channel: number, value: boolean, cb?: (err: any) => void): void;


  /**
   * Read a value from a channel
   *
   * @param {number}   channel The channel to read from
   * @param {function} cb      Callback which receives the channel's boolean value
   */
  export function read(channel: number, cb: (err: any, value: boolean) => void): void;

  /**
   * Unexport any pins setup by this module
   *
   * @param {function} cb Optional callback
   */
  export function destroy(cb?: () => void): void;

  /**
   * Reset the state of the module
   */
  export function reset(): void;

  export const promise: {
    setup(channel: number, direction: string, edge?: string): Promise<void>;
    write(channel: number, value: boolean): Promise<void>;
    read(channel: number): Promise<boolean>;
    destroy(): Promise<void>;
  }
}
