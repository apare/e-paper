interface IImage {
  xSize: number;
  ySize: number;
  xySize: [number, number];
  view: Buffer[];
}

export function toUInt8(value: number) {
  return parseInt(value.toString(16), 16);
}

export function shrinkBuffer(buf: Buffer, reverse = false) {
  if (buf.length % 8 !== 0) {
    throw new Error("buffer length must be multiple of 8 to shrink");
  }
  const newBuf = Buffer.allocUnsafe(buf.length / 8);
  for (
    let i = reverse ? buf.length - 1 : 0, j = 0;
    reverse ? i > 0 : i < buf.length;
    j++
  ) {
    let byte = 0;
    for (let k = 128; k >= 1; k /= 2, i += reverse ? -1 : 1) {
      if (buf[i]) {
        byte |= k;
      }
    }
    newBuf.writeUInt8(toUInt8(byte), j);
  }
  return newBuf;
}

export function expandBuffer(buf: Buffer) {
  const newBuf = Buffer.allocUnsafe(buf.length * 8);
  for (let i = 0, j = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let k = 7; k > -1; k--, j++) {
      newBuf.writeUInt8(!!(byte & (1 << k)) ? 0xff : 0x00, j);
    }
  }
  return newBuf;
}

export function getImageRAM(image: IImage) {
  if (image.xSize % 8 !== 0) {
    throw new Error("image width must be multiple of 8");
  }
  const newBuf = Buffer.allocUnsafe((image.xSize / 8) * image.ySize);
  for (let y = 0; y < image.ySize; y++) {
    let row = new Uint8Array(shrinkBuffer(image.view[y], true));
    for (let x = 0; x < row.length; x++) {
      newBuf.writeUInt8(row[x], y * (image.xSize / 8) + x);
    }
  }
  return newBuf;
}

export function createImage(xSize: number, ySize: number, data = 0xff): IImage {
  const view = [];
  for (let y = 0; y < ySize; y++) {
    view.push(Buffer.alloc(xSize, data));
  }
  return {
    xSize: xSize,
    ySize: ySize,
    xySize: [xSize, ySize],
    view: view
  };
}

export function cropImage(
  image: IImage,
  y0 = true,
  y1 = true,
  x0 = true,
  x1 = true
) {
  const cropY = [-1, -1];
  const cropX = [-1, -1];
  let i = 0;
  for (let y = 0; y < image.ySize; y++) {
    for (let x = 0; x < image.xSize; x++) {
      i = image.view[y].readUInt8(x);
      if (i === 255) {
        continue;
      }
      if (y0 && (cropY[0] < 0 || y < cropY[0])) {
        cropY[0] = y;
      }
      if (y1 && y > cropY[1]) {
        cropY[1] = y;
      }
      if (x0 && (cropX[0] < 0 || x < cropX[0])) {
        cropX[0] = x;
      }
      if (x1 && x > cropX[1]) {
        cropX[1] = x;
      }
    }
  }
  // crop top side of image
  if (y0 && cropY[0] > 0) {
    image.view.splice(0, cropY[0]);
  }
  // crop bottom side of view
  if (y1 && (++cropY[1] > 0 && cropY[1] < image.ySize)) {
    image.view.splice(0 - (image.ySize - cropY[1]));
  }
  // update Y size of image
  image.ySize = image.view.length;

  // reset left crop if none
  if (cropX[0] < 1) {
    cropX[0] = 0;
  }
  // reset right crop if none
  if (!++cropX[1]) {
    cropX[1] = image.xSize;
  }
  // crop left and right sides of image
  if (cropX[0] > 0 || cropX[1] < image.xSize) {
    for (let y = 0; y < image.ySize; y++) {
      image.view[y] = Buffer.alloc(
        cropX[1] - cropX[0],
        image.view[y].slice(cropX[0], cropX[1])
      );
    }
  }
  // update X size of image
  image.xSize = image.view[0].length;
}

export function alignImage(image: IImage, xSize: number, align = "left") {
  let xPad = 8 - (image.xSize % 8);
  if (align === "center") {
    xPad = Math.round((xSize - image.xSize) / 2) % 8;
    if (xPad === 0) {
      return;
    }
    xPad *= 2;
  } else if (image.xSize % 8 === 0) {
    return;
  }
  for (let y = 0; y < image.ySize; y++) {
    const newBuf = Buffer.alloc(image.xSize + xPad, 0xff);
    let x = 0;
    if (align === "center") {
      x = Math.floor(xPad / 2);
    } else if (align === "right") {
      x = xPad;
    }
    for (let i = 0; i < image.xSize; i++, x++) {
      newBuf.writeUInt8(image.view[y][i], x);
    }
    image.view[y] = newBuf;
  }
  image.xSize = image.xSize + xPad;
}

export function invertImage(image: IImage) {
  for (let y = 0; y < image.ySize; y++) {
    for (let x = 0; x < image.xSize; x++) {
      image.view[y].writeUInt8(0xff - image.view[y].readUInt8(x), x);
    }
  }
}

export function blitImage(
  src: IImage,
  sX: number,
  sY: number,
  xSize: number,
  ySize: number,
  dest: IImage,
  dX: number,
  dY: number,
  px: number = null
) {
  if (xSize < 1 || ySize < 1) {
    return;
  }
  if (sX < 0 || sX + xSize > src.xSize) {
    throw new Error("X is out of source bounds");
  }
  if (sY < 0 || sY + ySize > src.ySize) {
    throw new Error("Y is out of source bounds");
  }
  if (dX < 0 || dX + xSize > dest.xSize) {
    throw new Error("X is out of destination bounds");
  }
  if (dY < 0 || dY + ySize > dest.ySize) {
    throw new Error("Y is out of destination bounds");
  }
  for (let y = dY; y < dY + ySize; y++) {
    for (let x = dX; x < dX + xSize; x++) {
      let byte = src.view[sY + (y - dY)][sX + (x - dX)];
      if (px === null || px === byte) {
        dest.view[y].writeUInt8(byte, x);
      }
    }
  }
}

export function logImage(image: IImage) {
  image.view.forEach(row => {
    console.log(
      row
        .toString("hex")
        .replace(/00/g, "■")
        .replace(/ff/g, "□")
    );
  });
  console.log(`image ${image.xSize}×${image.ySize} (${image.view[0].length})`);
}
