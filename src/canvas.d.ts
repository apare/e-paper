declare module "canvas" {
  interface CanvasConstructor {
    new (
      width: number,
      height: number,
      type?: "svg" | "pdf"
    ): HTMLCanvasElement;
  }
  const Canvas: CanvasConstructor;
  export = Canvas;
}
