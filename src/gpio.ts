import * as GPIO from "rpi-gpio";

export function setModeRPI() {
  GPIO.setMode(GPIO.MODE_RPI);
}

export function setModeBCM() {
  GPIO.setMode(GPIO.MODE_BCM);
}

export function setup(pin: number, direction: any) {
  return new Promise<void>((resolve, reject) => {
    GPIO.setup(pin, direction, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export const LOW = false;

export const HIGH = true;

// Setup pin for read mode
export function setDirIn(pin: number) {
  return setup(pin, GPIO.DIR_IN);
}

// Setup pin for write mode
export function setDirOut(pin: number) {
  return setup(pin, GPIO.DIR_OUT);
}

// Setup pin for write mode (start "off")
export function setDirLow(pin: number) {
  return setup(pin, GPIO.DIR_LOW);
}

// Setup pin for write mode (start "on")
export function setDirHigh(pin: number) {
  return setup(pin, GPIO.DIR_HIGH);
}

export function input(pin: number) {
  return new Promise<boolean>((resolve, reject) => {
    GPIO.input(pin, (err, value) => {
      if (err) {
        reject(err);
      }
      resolve(value);
    });
  });
}

export function output(pin: number, value: boolean) {
  return new Promise<void>((resolve, reject) => {
    GPIO.output(pin, value, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function destroy() {
  return new Promise<void>((resolve, reject) => {
    try {
      GPIO.destroy(err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}
