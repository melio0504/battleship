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
}
