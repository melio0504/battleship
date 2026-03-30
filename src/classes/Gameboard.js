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

  isWithinBounds([x, y]) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  isAttackLegal(coordinate) {
    const key = Gameboard.coordinateKey(coordinate);
    return !this.attackedCoordinates.has(key);
  }

  hasShipAt(coordinate) {
    const key = Gameboard.coordinateKey(coordinate);
    return this.occupiedCoordinates.has(key);
  }

  getShipDataAt(coordinate) {
    const key = Gameboard.coordinateKey(coordinate);
    return this.occupiedCoordinates.get(key) ?? null;
  }

}
