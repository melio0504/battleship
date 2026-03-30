import { Ship } from "./Ship.js";

export class Gameboard {
  constructor(size = 10) {
    this.size = size;
    this.missedAttacks = [];
    this.successfulAttacks = [];
    this.ships = [];
    this.attackedCoordinates = new Set();
    this.occupiedCoordinates = new Map();
  }

  static coordinateKey([x, y]) {
    return `${x},${y}`;
  }

}
