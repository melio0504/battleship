import { Gameboard } from "./Gameboard.js";

export class Player {
  constructor(name, isComputer = false) {
    this.name = name;
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
  }

  placeFleetRandomly(shipLengths) {
    this.gameboard.placeFleetRandomly(shipLengths);
  }

  makeAttack(enemyBoard, coordinate) {
    return enemyBoard.receiveAttack(coordinate);
  }

}
