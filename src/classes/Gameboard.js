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

  getShipPlacements() {
    return this.ships.map(({ ship, coordinates }) => {
      const [firstX, firstY] = coordinates[0];
      const orientation = this.getCoordinatesOrientation(coordinates);

      return {
        ship,
        length: ship.length,
        start: [firstX, firstY],
        orientation,
        coordinates: [...coordinates],
      };
    });
  }

  getCoordinatesOrientation(coordinates) {
    const [firstX] = coordinates[0];
    const [secondX] = coordinates[1] ?? coordinates[0];
    return firstX === secondX ? "vertical" : "horizontal";
  }

  getCoordinatesForPlacement(startCoordinate, length, orientation = "horizontal") {
    const [startX, startY] = startCoordinate;

    if (!["horizontal", "vertical"].includes(orientation)) {
      throw new Error("Ship orientation must be horizontal or vertical");
    }

    const coordinates = [];
    for (let i = 0; i < length; i += 1) {
      const x = orientation === "horizontal" ? startX + i : startX;
      const y = orientation === "vertical" ? startY + i : startY;
      coordinates.push([x, y]);
    }

    return coordinates;
  }

  canPlaceCoordinates(coordinates) {
    return coordinates.every((coordinate) => {
      if (!this.isWithinBounds(coordinate)) {
        return false;
      }

      return !this.occupiedCoordinates.has(Gameboard.coordinateKey(coordinate));
    });
  }

}
