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

  placeShip(length, startCoordinate, orientation = "horizontal") {
    const ship = new Ship(length);
    const coordinates = this.getCoordinatesForPlacement(
      startCoordinate,
      ship.length,
      orientation,
    );

    if (!this.canPlaceCoordinates(coordinates)) {
      throw new Error("Invalid ship placement");
    }

    const shipData = {
      ship,
      coordinates,
    };

    this.ships.push(shipData);
    coordinates.forEach((coordinate) => {
      const key = Gameboard.coordinateKey(coordinate);
      this.occupiedCoordinates.set(key, shipData);
    });

    return ship;
  }

  moveShip(originCoordinate, targetCoordinate, orientationOverride = null) {
    const shipData = this.getShipDataAt(originCoordinate);
    if (!shipData) {
      return {
        moved: false,
        reason: "No ship at selected origin coordinate",
      };
    }

    const { ship, coordinates: oldCoordinates } = shipData;
    const currentOrientation = this.getCoordinatesOrientation(oldCoordinates);
    const orientation = orientationOverride ?? currentOrientation;

    if (!["horizontal", "vertical"].includes(orientation)) {
      return {
        moved: false,
        reason: "Ship orientation must be horizontal or vertical",
      };
    }

    oldCoordinates.forEach((coordinate) => {
      this.occupiedCoordinates.delete(Gameboard.coordinateKey(coordinate));
    });

    const newCoordinates = this.getCoordinatesForPlacement(
      targetCoordinate,
      ship.length,
      orientation,
    );

    if (!this.canPlaceCoordinates(newCoordinates)) {
      oldCoordinates.forEach((coordinate) => {
        this.occupiedCoordinates.set(Gameboard.coordinateKey(coordinate), shipData);
      });

      return {
        moved: false,
        reason: "Ship cannot be moved to that coordinate",
      };
    }

    shipData.coordinates = newCoordinates;
    newCoordinates.forEach((coordinate) => {
      this.occupiedCoordinates.set(Gameboard.coordinateKey(coordinate), shipData);
    });

    return {
      moved: true,
      ship,
      coordinates: newCoordinates,
      orientation,
    };
  }

  placeFleetFromCoordinates(placements) {
    placements.forEach(({ length, start, orientation }) => {
      this.placeShip(length, start, orientation);
    });
  }

  placeFleetRandomly(shipLengths) {
    this.resetBoard();

    shipLengths.forEach((length) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 200) {
        attempts += 1;
        const orientation = Math.random() > 0.5 ? "horizontal" : "vertical";
        const x = Math.floor(Math.random() * this.size);
        const y = Math.floor(Math.random() * this.size);

        try {
          this.placeShip(length, [x, y], orientation);
          placed = true;
        } catch {
          // Placement failed due to overlap/out-of-bounds. Try another coordinate.
        }
      }

      if (!placed) {
        throw new Error("Could not place fleet randomly");
      }
    });
  }

  receiveAttack(coordinate) {
    if (!this.isWithinBounds(coordinate)) {
      throw new Error("Attack coordinate is out of bounds");
    }

    const key = Gameboard.coordinateKey(coordinate);
    if (this.attackedCoordinates.has(key)) {
      return {
        valid: false,
        coordinate,
        repeated: true,
        hit: false,
      };
    }

    this.attackedCoordinates.add(key);
    const shipData = this.occupiedCoordinates.get(key);
    if (shipData) {
      shipData.ship.hit();
      this.successfulAttacks.push(coordinate);

      return {
        valid: true,
        coordinate,
        repeated: false,
        hit: true,
        sunk: shipData.ship.isSunk(),
        ship: shipData.ship,
      };
    }

    this.missedAttacks.push(coordinate);
    return {
      valid: true,
      coordinate,
      repeated: false,
      hit: false,
    };
  }

}
