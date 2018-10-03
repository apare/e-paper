import Display from "./epd2in7b";

async function main() {
  var display = new Display();
  await display.init();

  const canvas = display.getCanvas();

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.moveTo(10, 10);
    ctx.lineTo(50, 50);
  }

  display.draw(canvas);
}

main().catch(e => {
  console.error(e);
});
