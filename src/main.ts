import Display from "./epd2in7b";

var display = new Display();

async function main() {
  await display.init();

  const canvas = display.getCanvas();

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.moveTo(10, 10);
    ctx.lineTo(50, 50);

    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  await display.draw(canvas);
}

main()
  .then(e => display.exit())
  .catch(e => {
    console.error(e);
  });
