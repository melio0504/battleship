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

  getRandomLegalAttack(enemyBoard) {
    const legalAttacks = enemyBoard.getLegalAttacks();
    if (legalAttacks.length === 0) {
      throw new Error("No legal attacks remaining");
    }

    const randomIndex = Math.floor(Math.random() * legalAttacks.length);
    return legalAttacks[randomIndex];
  }

}
