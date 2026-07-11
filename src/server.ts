import app from "./app";
const port = process.env.PORT || 5000;
async function main() {
  try {
    app.listen(port, () => {
        console.log(`server is running ${port}` )
    });
  } catch (error) {}
}
main();
