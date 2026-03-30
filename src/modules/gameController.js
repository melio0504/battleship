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

