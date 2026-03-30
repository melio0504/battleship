import "./styles.css";
import { createGameController } from "./modules/gameController.js";
import { createDomManager } from "./modules/domManager.js";

const root = document.querySelector("#app");

if (!root) {
  throw new Error("App root #app was not found in index.html");
}

const domManager = createDomManager(root);
const gameController = createGameController(domManager);

gameController.startNewGame();
