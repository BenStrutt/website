const DEFAULT_IMAGE_URL = "./images/setters.jpg";

let columns = 3;
let rows = 3;
let gap = 8;
let emptyTile;

const borderDiv = document.querySelector(".image-puzzle-border");
const puzzleContainer = document.querySelector(".image-puzzle-container");
const namesContainer = document.querySelector(".names");
const paragraphContainer = document.querySelector(".paragraph");

async function onImagePuzzleClick(event) {
	if (event.target.id === "" || event.target.id === emptyTile.id) { return; }

	const tile = event.target;
	const tileArr = Array.from(puzzleContainer.children);
	const tileIdx = tileArr.indexOf(tile);
	const emptyIdx = tileArr.indexOf(emptyTile);

	const [ tileRow, tileCol ] = getGridCoordsFromIndex(tileIdx);
	const [ emptyRow, emptyCol ] = getGridCoordsFromIndex(emptyIdx);
	if (
		!(tileRow === emptyRow && Math.abs(tileCol - emptyCol) === 1) &&
		!(tileCol === emptyCol && Math.abs(tileRow - emptyRow) === 1)
	) { return; }

	const tileRect = tile.getBoundingClientRect();
	const emptyRect = emptyTile.getBoundingClientRect();

	const deltaX = emptyRect.left - tileRect.left;
	const deltaY = emptyRect.top - tileRect.top;

	// Set initial positions
	tile.style.transition = "none";
	emptyTile.style.transition = "none";
	tile.style.transform = "none";
	emptyTile.style.transform = "none";

	// Trigger reflow
	// tile.offsetHeight;
	// emptyTile.offsetHeight;

	// why do i need an empty tile if it's invisible?
	tile.style.transition = "transform 0.2s ease-in-out";
	emptyTile.style.transition = "transform 0.2s ease-in-out";
	tile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
	emptyTile.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;

	// After animation, swap DOM positions
	await new Promise((resolve) => {
		setTimeout(() => {
			tile.style.transition = "none";
			emptyTile.style.transition = "none";
			tile.style.transform = "none";
			emptyTile.style.transform = "none";

			const temp = tile.nextSibling;
			emptyTile.parentNode.insertBefore(tile, emptyTile.nextSibling);
			tile.parentNode.insertBefore(emptyTile, temp);

			let win = true;
			const tiles = puzzleContainer.children;
			for (let i = 1; i < tiles.length; i++) {
				const currentID = Number(tiles[i].id);
				const previousID = Number(tiles[i - 1].id);
				if (currentID === previousID + 1) { continue; }

				win = false;
				break;
			}

			if (win) { alert("win!"); }

			resolve();
		}, 200);
	});
}

puzzleContainer.addEventListener("click", onImagePuzzleClick);
// namesContainer.addEventListener("mouseover", (ev) => {
// 	if (ev.target.id === "") { return; }

// 	const text = paragraphContainer.children.item(0);
// 	text.style.transition = "text-align 0.3s ease-in-out";
// 	paragraphContainer.style.transition = "justify-content 0.3s ease-in-out";
// 	if (ev.target.id === "polina") {
// 		text.style.textAlign = "left";
// 		paragraphContainer.style.justifyContent = "start";
// 	} else {
// 		text.style.textAlign = "right";
// 		paragraphContainer.style.justifyContent = "end";
// 	}
// });

// namesContainer.addEventListener("mouseout", (ev) => {
// 	if (ev.target.id === "") { return; }

// 	const text = paragraphContainer.children.item(0);
// 	text.style.textAlign = "center";
// 	paragraphContainer.style.justifyContent = "center";
// });

const image = new Image();
image.src = DEFAULT_IMAGE_URL;
image.onload = () => {
	const { clientWidth, clientHeight } = borderDiv;
	const imgWidth = image.width;
	const imgHeight = image.height;
	const imgMax = Math.max(imgWidth, imgHeight);
	const widthScale = imgWidth / imgMax;
	const heightScale = imgHeight / imgMax;
	borderDiv.style.width = clientWidth * widthScale + "px";
	borderDiv.style.height = clientHeight * heightScale  + "px";

	const largerDimension = clientWidth > clientHeight ? clientWidth : clientHeight;
	const borderMax = largerDimension;
	const imageSize = borderMax * .90 - (gap * ((clientWidth > clientHeight ? columns : rows) - 1));
	const scaledImgWidth = imageSize * widthScale;
	const scaledImgHeight = imageSize * heightScale;
	const containerWidth = scaledImgWidth + (gap * (columns - 1));
	const containerHeight = scaledImgHeight + (gap * (rows - 1));
	puzzleContainer.style.width = containerWidth + "px";
	puzzleContainer.style.height = containerHeight + "px";
	puzzleContainer.style.gap = gap + "px";

	const tileWidth = scaledImgWidth / columns;
	const tileHeight = scaledImgHeight / rows;
	const tileArr = [];
	for (let i = 0; i < columns * rows; i++) {
		const [ row, col ] = getGridCoordsFromIndex(i);
		const gridTile = document.createElement("div");

		gridTile.id = i;
		gridTile.style.width = tileWidth + 'px';
		gridTile.style.height = tileHeight + 'px';

		if (i < columns * rows - 1) {
			gridTile.style.backgroundImage = "url(" + DEFAULT_IMAGE_URL + ")";
			gridTile.style.backgroundSize = scaledImgWidth + "px, " + scaledImgHeight + "px";
			gridTile.style.backgroundPositionX = "-" + (tileWidth * col) + "px";
			gridTile.style.backgroundPositionY = "-" + (tileHeight * row) + "px";
			tileArr.push(gridTile);
		} else {
			emptyTile = gridTile;
		}
	}

	let currentIndex = tileArr.length;
	let randomIndex;
	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[tileArr[currentIndex], tileArr[randomIndex]] = [
			tileArr[randomIndex],
			tileArr[currentIndex],
		];
	}

	tileArr.forEach(tile => puzzleContainer.appendChild(tile));
	puzzleContainer.appendChild(emptyTile);
}

function getGridCoordsFromIndex(idx) {
	return [
		Math.floor(idx / columns),
		idx % columns,
	];
}
