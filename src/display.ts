import Canvas = require("canvas");

export default class Display {
  constructor(
    public width: number,
    public height: number,
    public channels: string[] = ["000000"]
  ) {}

  public getCanvas() {
    return new Canvas(this.width, this.height);
  }

  public draw(canvas: HTMLCanvasElement, x: number = 0, y: number = 0) {
    if (x % 8 !== 0) {
      throw new Error("x must be multiple of 8 to shrink");
    }
    if (y % 8 !== 0) {
      throw new Error("y must be multiple of 8 to shrink");
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const channelsData: number[][] = this.channels.map(() => []);
    let currentChannelsData: number[] = this.channels.map(() => 0);

    const nbPixel = data.length / 4;

    for (var i = 0; i < nbPixel; i++) {
      const index = i * 4;
      var red = data[index];
      var green = data[index + 1];
      var blue = data[index + 2];

      var colorCode = red.toString(16) + green.toString(16) + blue.toString(16);
      this.channels.forEach((channel, channelNo) => {
        if (colorCode == channel) {
          currentChannelsData[channelNo] |= 1 << (7 - (i % 8));
        }
      });
      if (i % 8 == 7) {
        currentChannelsData.forEach((value, channelNo) => {
          channelsData[channelNo].push(value);
        });
        currentChannelsData = this.channels.map(() => 0);
      }
    }

    return this.drawChannels(channelsData, x, y, canvas.width, canvas.height);
  }

  protected drawChannels(
    channels: number[][],
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    channels.forEach((channel, channelNo) => {
      console.log(`Draw Channel ${channelNo}`);
      console.log(`Offset: ${x},${y}`);
      console.log(`Size: ${width},${height}`);
      let log = "";
      channel.forEach((data, i) => {
        log += data
          .toString(2)
          .replace(/1/g, "■")
          .replace(/0/g, "□");
        if ((i * 8) % width == width - 1) {
          console.log(log);
          log = "";
        }
      });
    });
  }
}
