import { Player } from "../classes/Player.js";
import boomSoundFile from "../../public/sounds/boom.mp3";
import userLoseSoundFile from "../../public/sounds/user-lose.mp3";
import userWinSoundFile from "../../public/sounds/user-win.mp3";

const DEFAULT_SHIP_LENGTHS = [5, 4, 3, 3, 2];

const DEFAULT_PLAYER_PLACEMENTS = [
  { length: 5, start: [0, 0], orientation: "horizontal" },
  { length: 4, start: [2, 2], orientation: "vertical" },
  { length: 3, start: [6, 1], orientation: "vertical" },
  { length: 3, start: [5, 6], orientation: "horizontal" },
  { length: 2, start: [8, 8], orientation: "horizontal" },
];

const DEFAULT_COMPUTER_PLACEMENTS = [
  { length: 5, start: [0, 4], orientation: "horizontal" },
  { length: 4, start: [5, 0], orientation: "vertical" },
  { length: 3, start: [7, 3], orientation: "vertical" },
  { length: 3, start: [2, 7], orientation: "horizontal" },
  { length: 2, start: [9, 8], orientation: "vertical" },
];

const soundEffects = {
  attack: new Audio(boomSoundFile),
  userWin: new Audio(userWinSoundFile),
  userLose: new Audio(userLoseSoundFile),
};

const playSound = (audio) => {
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore autoplay or playback errors so the game flow is never blocked.
  });
};

export function createGameController(domManager) {
  const state = {
    player: null,
    computer: null,
    currentTurn: "player",
    gameOver: false,
    setupPhase: true,
    statusMessage: "",
    battleLogMessage: "",
    selectedShipOrigin: null,
    selectedShipCoordinates: [],
    selectedShipOrientation: null,
  };

  const writeBattleLog = (message) => {
    state.battleLogMessage = message;
    render();
  };

  const render = () => {
    domManager.render({
      player: state.player,
      computer: state.computer,
      currentTurn: state.currentTurn,
      gameOver: state.gameOver,
      setupPhase: state.setupPhase,
      statusMessage: state.statusMessage,
      battleLogMessage: state.battleLogMessage,
      selectedShipOrigin: state.selectedShipOrigin,
      selectedShipCoordinates: state.selectedShipCoordinates,
      onAttack: handlePlayerAttack,
      onNewGame: startNewGame,
      onRandomizePlayerFleet: randomizePlayerFleet,
      onPlayerBoardCellClick: handlePlayerBoardCellClick,
      onTiltSelectedShip: tiltSelectedShip,
    });
  };

  const checkForWinner = () => {
    if (state.computer.gameboard.allShipsSunk()) {
      state.gameOver = true;
      state.statusMessage = "You win. Enemy fleet destroyed.";
      playSound(soundEffects.userWin);
      writeBattleLog("Victory: all enemy ships were sunk.");
      return true;
    }

    if (state.player.gameboard.allShipsSunk()) {
      state.gameOver = true;
      state.statusMessage = "Computer wins. Your fleet has been sunk.";
      playSound(soundEffects.userLose);
      writeBattleLog("Defeat: your fleet was sunk.");
      return true;
    }

    return false;
  };

  const executeComputerTurn = () => {
    if (state.gameOver) {
      return;
    }

    const result = state.computer.takeTurn(state.player.gameboard);
    const [x, y] = result.coordinate;

    if (result.valid) {
      playSound(soundEffects.attack);
    }

    if (result.hit) {
      writeBattleLog(`Computer hit your ship at (${x}, ${y}).`);
      state.statusMessage = `Computer scored a hit at (${x}, ${y}).`;
    } else {
      writeBattleLog(`Computer missed at (${x}, ${y}).`);
      state.statusMessage = `Computer missed at (${x}, ${y}). Your turn.`;
    }

    if (!checkForWinner()) {
      state.currentTurn = "player";
    }

    render();
  };

  function handlePlayerAttack(coordinate) {
    if (state.gameOver || state.currentTurn !== "player") {
      return;
    }

    if (state.setupPhase) {
      state.setupPhase = false;
      state.selectedShipOrigin = null;
      state.selectedShipCoordinates = [];
      state.selectedShipOrientation = null;
      writeBattleLog("Ship placement locked. Battle started.");
    }

    const result = state.player.takeTurn(state.computer.gameboard, coordinate);
    const [x, y] = coordinate;

    if (!result.valid && result.repeated) {
      state.statusMessage = `(${x}, ${y}) was already attacked. Pick another coordinate.`;
      writeBattleLog(`(${x}, ${y}) was already attacked.`);
      render();
      return;
    }

    if (result.valid) {
      playSound(soundEffects.attack);
    }

    if (result.hit) {
      writeBattleLog(`You hit an enemy ship at (${x}, ${y}).`);
      state.statusMessage = `Direct hit at (${x}, ${y}).`;
    } else {
      writeBattleLog(`You missed at (${x}, ${y}).`);
      state.statusMessage = `Missed at (${x}, ${y}). Computer is thinking...`;
    }

    if (checkForWinner()) {
      render();
      return;
    }

    state.currentTurn = "computer";
    render();

    window.setTimeout(executeComputerTurn, 500);
  }

  function randomizePlayerFleet() {
    if (state.gameOver || state.currentTurn !== "player" || !state.setupPhase) {
      writeBattleLog("You can randomize ships only before the first attack.");
      return;
    }

    state.player.placeFleetRandomly(DEFAULT_SHIP_LENGTHS);
    state.selectedShipOrigin = null;
    state.selectedShipCoordinates = [];
    state.selectedShipOrientation = null;
    state.statusMessage = "Your fleet was randomized. Attack when ready.";
    writeBattleLog("Player fleet randomized.");
    render();
  }

  function tiltSelectedShip() {
    if (state.gameOver || !state.setupPhase || !state.selectedShipOrigin) {
      writeBattleLog("Select a ship first, then tilt it.");
      return;
    }

    const board = state.player.gameboard;
    const targetOrientation =
      state.selectedShipOrientation === "horizontal" ? "vertical" : "horizontal";
    const tiltResult = board.moveShip(
      state.selectedShipOrigin,
      state.selectedShipOrigin,
      targetOrientation,
    );

    if (!tiltResult.moved) {
      writeBattleLog("Cannot tilt here. Not enough space for rotation.");
      return;
    }

    state.selectedShipCoordinates = tiltResult.coordinates;
    state.selectedShipOrientation = tiltResult.orientation;
    state.selectedShipOrigin = tiltResult.coordinates[0];
    state.statusMessage = "Ship tilted. You can move it or tilt again.";
    writeBattleLog("Selected ship tilted.");
  }

  function handlePlayerBoardCellClick(coordinate) {
    if (state.gameOver || !state.setupPhase) {
      return;
    }

    const board = state.player.gameboard;
    if (!state.selectedShipOrigin) {
      if (!board.hasShipAt(coordinate)) {
        writeBattleLog("Select a ship cell first, then choose a destination.");
        return;
      }

      const shipData = board.getShipDataAt(coordinate);
      const orientation = board.getCoordinatesOrientation(shipData.coordinates);

      state.selectedShipOrigin = coordinate;
      state.selectedShipCoordinates = [...shipData.coordinates];
      state.selectedShipOrientation = orientation;
      state.statusMessage =
        "Ship selected. Click destination or use Tilt Selected Ship.";
      writeBattleLog("Ship selected. Choose destination or tilt.");
      render();
      return;
    }

    const moveResult = board.moveShip(
      state.selectedShipOrigin,
      coordinate,
      state.selectedShipOrientation,
    );
    if (!moveResult.moved) {
      writeBattleLog("Invalid move. Keep ship in bounds and avoid overlap.");
    } else {
      writeBattleLog("Ship moved.");
      state.statusMessage = "Ship moved. Continue repositioning or attack to start.";
    }

    state.selectedShipOrigin = null;
    state.selectedShipCoordinates = [];
    state.selectedShipOrientation = null;
    render();
  }

}
