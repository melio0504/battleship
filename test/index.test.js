import { Ship } from "../src/classes/Ship.js";
import { Gameboard } from "../src/classes/Gameboard.js";
import { Player } from "../src/classes/Player.js";

describe("Ship", () => {
	test("initializes with length and zero hits", () => {
		const ship = new Ship(4);
		expect(ship.length).toBe(4);
		expect(ship.hits).toBe(0);
		expect(ship.isSunk()).toBe(false);
	});

	test("hit increments hits and isSunk reports true once hits reach length", () => {
		const ship = new Ship(2);
		ship.hit();
		expect(ship.hits).toBe(1);
		expect(ship.isSunk()).toBe(false);

		ship.hit();
		expect(ship.hits).toBe(2);
		expect(ship.isSunk()).toBe(true);
	});
});

describe("Gameboard", () => {
	test("placeShip places a ship at specific coordinates", () => {
		const board = new Gameboard();
		board.placeShip(3, [1, 1], "horizontal");

		expect(board.hasShipAt([1, 1])).toBe(true);
		expect(board.hasShipAt([2, 1])).toBe(true);
		expect(board.hasShipAt([3, 1])).toBe(true);
		expect(board.hasShipAt([4, 1])).toBe(false);
	});

	test("receiveAttack records misses and applies hits to the right ship", () => {
		const board = new Gameboard();
		board.placeShip(2, [0, 0], "vertical");

		const missResult = board.receiveAttack([9, 9]);
		expect(missResult.hit).toBe(false);
		expect(board.missedAttacks).toContainEqual([9, 9]);

		const hitResult = board.receiveAttack([0, 0]);
		expect(hitResult.hit).toBe(true);
		expect(hitResult.ship.hits).toBe(1);
	});

	test("receiveAttack marks repeated shots as invalid", () => {
		const board = new Gameboard();
		board.receiveAttack([5, 5]);
		const repeated = board.receiveAttack([5, 5]);

		expect(repeated.valid).toBe(false);
		expect(repeated.repeated).toBe(true);
	});

	test("allShipsSunk returns true only after all ships are sunk", () => {
		const board = new Gameboard();
		board.placeShip(1, [0, 0], "horizontal");
		board.placeShip(2, [2, 2], "horizontal");

		expect(board.allShipsSunk()).toBe(false);
		board.receiveAttack([0, 0]);
		board.receiveAttack([2, 2]);
		expect(board.allShipsSunk()).toBe(false);
		board.receiveAttack([3, 2]);
		expect(board.allShipsSunk()).toBe(true);
	});
});

describe("Player", () => {
	test("contains its own gameboard", () => {
		const player = new Player("Test Captain");
		expect(player.gameboard).toBeInstanceOf(Gameboard);
	});

	test("human player attacks given coordinates", () => {
		const attacker = new Player("Human");
		const defenderBoard = new Gameboard();
		defenderBoard.placeShip(1, [4, 4], "horizontal");

		const result = attacker.takeTurn(defenderBoard, [4, 4]);
		expect(result.hit).toBe(true);
	});

	test("computer player only chooses legal attacks", () => {
		const cpu = new Player("CPU", true);
		const defenderBoard = new Gameboard();
		defenderBoard.receiveAttack([0, 0]);

		const result = cpu.takeTurn(defenderBoard);
		const [x, y] = result.coordinate;
		expect([x, y]).not.toEqual([0, 0]);
	});
});