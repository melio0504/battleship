import pirateCatImage from "../../public/pirate-cat.jpg";

function createCellButton({
  coordinate,
  status,
  clickable,
  onClick,
  revealShips,
  selected,
}) {
  const [x, y] = coordinate;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `cell cell--${status}`;
  if (selected) {
    button.classList.add("cell--selected");
  }
  button.dataset.x = String(x);
  button.dataset.y = String(y);
  button.ariaLabel = `Coordinate ${x}, ${y}`;

  if (status === "hit") {
    button.textContent = "X";
  } else if (status === "miss") {
    button.textContent = "o";
  } else if (status === "ship" && revealShips) {
    button.textContent = "■";
  } else {
    button.textContent = "";
  }

  button.disabled = !clickable;
  if (clickable) {
    button.addEventListener("click", () => onClick([x, y]));
  }

  return button;
}

function createBoardElement({
  title,
  board,
  revealShips,
  isTargetBoard,
  currentTurn,
  gameOver,
  onAttack,
  setupPhase,
  onPlayerBoardCellClick,
  selectedShipOrigin,
  selectedShipCoordinates,
}) {
  const wrapper = document.createElement("section");
  wrapper.className = "board-panel";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const boardGrid = document.createElement("div");
  boardGrid.className = "board-grid";

  for (let y = 0; y < board.size; y += 1) {
    for (let x = 0; x < board.size; x += 1) {
      const coordinate = [x, y];
      const status = board.getCellStatus(coordinate, revealShips);
      const canAttack =
        isTargetBoard &&
        !gameOver &&
        currentTurn === "player" &&
        board.isAttackLegal(coordinate);
      const canMoveShip = !isTargetBoard && setupPhase && !gameOver;

      const onCellClick = isTargetBoard ? onAttack : onPlayerBoardCellClick;
      const selected =
        !isTargetBoard &&
        selectedShipCoordinates.some(
          ([selectedX, selectedY]) => selectedX === x && selectedY === y,
        );

      const cellButton = createCellButton({
        coordinate,
        status,
        clickable: canAttack || canMoveShip,
        onClick: onCellClick,
        revealShips,
        selected,
      });

      boardGrid.appendChild(cellButton);
    }
  }

  wrapper.appendChild(heading);
  wrapper.appendChild(boardGrid);
  return wrapper;
}

