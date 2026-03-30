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

export function createDomManager(rootNode) {
  function render({
    player,
    computer,
    currentTurn,
    gameOver,
    setupPhase,
    statusMessage,
    battleLogMessage,
    selectedShipOrigin,
    selectedShipCoordinates,
    onAttack,
    onNewGame,
    onRandomizePlayerFleet,
    onPlayerBoardCellClick,
    onTiltSelectedShip,
  }) {
    rootNode.innerHTML = "";

    const app = document.createElement("main");
    app.className = "app-shell";

    const topArea = document.createElement("section");
    topArea.className = "top-area";

    const header = document.createElement("header");
    header.className = "header";

    const title = document.createElement("h1");
    title.textContent = "Battleship Command";

    const subtitle = document.createElement("p");
    subtitle.className = "subtitle";
    subtitle.textContent =
      "Target the enemy fleet. Click the right board to launch each strike.";

    const controls = document.createElement("div");
    controls.className = "controls";

    const newGameButton = document.createElement("button");
    newGameButton.type = "button";
    newGameButton.className = "action-btn";
    newGameButton.textContent = "New Game";
    newGameButton.addEventListener("click", onNewGame);

    const randomizeButton = document.createElement("button");
    randomizeButton.type = "button";
    randomizeButton.className = "action-btn action-btn--secondary";
    randomizeButton.textContent = "Randomize My Fleet";
    randomizeButton.addEventListener("click", onRandomizePlayerFleet);

    const tiltButton = document.createElement("button");
    tiltButton.type = "button";
    tiltButton.className = "action-btn action-btn--secondary";
    tiltButton.textContent = "Tilt Selected Ship";
    tiltButton.addEventListener("click", onTiltSelectedShip);

    controls.appendChild(newGameButton);
    controls.appendChild(randomizeButton);
    controls.appendChild(tiltButton);

    const turnLabelText = gameOver
      ? "Game Over"
      : setupPhase
        ? "Setup: Move ships on your board"
        : currentTurn === "player"
        ? "Your turn"
        : "Computer turn";

      const battleLog = document.createElement("section");
      battleLog.className = "battle-log battle-log--header";

      const battleLogTitle = document.createElement("p");
      battleLogTitle.className = "battle-log__title";
      battleLogTitle.textContent = "Battle Log";

      const battleLogMeta = document.createElement("p");
      battleLogMeta.className = "battle-log__meta";
      battleLogMeta.textContent = turnLabelText;

      const battleLogStatus = document.createElement("p");
      battleLogStatus.className = "battle-log__status";
      battleLogStatus.textContent = statusMessage;

      battleLog.appendChild(battleLogTitle);
      battleLog.appendChild(battleLogMeta);
      battleLog.appendChild(battleLogStatus);

    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(controls);
      header.appendChild(battleLog);

    const topRightPanel = document.createElement("aside");
    topRightPanel.className = "top-right-panel";

    const heroImage = document.createElement("img");
    heroImage.className = "hero-image";
    heroImage.src = pirateCatImage;
    heroImage.alt = "Pirate cat captain portrait";

    topRightPanel.appendChild(heroImage);

    topArea.appendChild(header);
    topArea.appendChild(topRightPanel);

    const boardLayout = document.createElement("section");
    boardLayout.className = "boards";

    boardLayout.appendChild(
      createBoardElement({
        title: "Your Fleet",
        board: player.gameboard,
        revealShips: true,
        isTargetBoard: false,
        currentTurn,
        gameOver,
        onAttack,
        setupPhase,
        onPlayerBoardCellClick,
        selectedShipOrigin,
        selectedShipCoordinates,
      }),
    );

    boardLayout.appendChild(
      createBoardElement({
        title: "Enemy Waters",
        board: computer.gameboard,
        revealShips: false,
        isTargetBoard: true,
        currentTurn,
        gameOver,
        onAttack,
        setupPhase,
        onPlayerBoardCellClick,
        selectedShipOrigin,
        selectedShipCoordinates,
      }),
    );

    app.appendChild(topArea);
    app.appendChild(boardLayout);

    if (gameOver) {
      const gameOverModal = document.createElement("div");
      gameOverModal.className = "game-over-modal";

      const gameOverContent = document.createElement("div");
      gameOverContent.className = "game-over-modal__content";

      const gameOverTitle = document.createElement("h2");
      gameOverTitle.textContent = "Game Over";

      const gameOverText = document.createElement("p");
      gameOverText.textContent = statusMessage;

      const gameOverButton = document.createElement("button");
      gameOverButton.type = "button";
      gameOverButton.className = "action-btn";
      gameOverButton.textContent = "Start New Game";
      gameOverButton.addEventListener("click", onNewGame);

      gameOverContent.appendChild(gameOverTitle);
      gameOverContent.appendChild(gameOverText);
      gameOverContent.appendChild(gameOverButton);
      gameOverModal.appendChild(gameOverContent);
      app.appendChild(gameOverModal);
    }

    rootNode.appendChild(app);
  }

  return {
    render,
  };
}
