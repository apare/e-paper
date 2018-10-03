import Display from "./epd2in7b";

var display = new Display();

async function main() {
  await display.init();
}

main()
  .then(e => display.exit())
  .catch(e => {
    console.error(e);
  });
