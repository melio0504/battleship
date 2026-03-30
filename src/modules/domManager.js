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

