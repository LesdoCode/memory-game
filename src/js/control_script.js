const grid = document.querySelector(".grid");
const overlay = document.querySelector(".overlay");
const gameOver = document.querySelector(".game-over");
const btnRestart = document.querySelector(".start");
const imageUrl = "https://picsum.photos/200/300/?random&";

let gameTime = 0;
let gameTimerInSeconds;
const timeElement = document.querySelector(".time");
const gameTimeContainer = document.querySelector(".game-time");
const gameTimer = document.querySelector(".game-timer");

let numberOfCardsToMatch = 2;
let gridItemSize = "5.5em",
	gridWidth = 4,
	gridHeight = 3,
	gridSize = gridWidth * gridHeight;

const none = "none",
	hidden = "hidden",
	matched = "matched",
	disabled = "disabled",
	gridItem = "grid-item";

let cardsToMatch = [];
let matchedCards = [];

const formatTime = (seconds) => {
	if (typeof seconds !== "number" || seconds < 0) return "00:00:00";

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secondsLeft = seconds % 60;

	const hoursString = hours < 10 ? `0${hours}` : hours;
	const minutesString = minutes < 10 ? `0${minutes}` : minutes;
	const secondsString = secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft;

	return `${hoursString}:${minutesString}:${secondsString}`;
};

const startTimer = () => {
	window.alert("Click Ok when you are ready to start the game.");
	gameTimerInSeconds = window.setInterval(() => {
		gameTime++;
		gameTimer.innerHTML = formatTime(gameTime);
	}, 1000);
};

const stopTimer = () => {
	const time = `${formatTime(gameTime)} seconds.`;
	timeElement.innerHTML = time;
	window.clearInterval(gameTimerInSeconds);
	gameTime = 0;
	gameTimer.innerHTML = formatTime(0);
};

const getGridItems = () => document.querySelectorAll(`.${gridItem}`);
const hideElement = (element) => element.classList.add(hidden);
const showElement = (element) => element.classList.remove(hidden);
const getValidRandomIndex = (array) => Math.floor(Math.random() * array.length);

const calculateGridItemSize = (_gridWidth) => {
	switch (_gridWidth) {
		case 10:
			return "4em";
		case 9:
			return "4.5em";
		case 8:
			return "5em";
		case 7:
			return "5.5em";
		case 6:
			return "6em";
		case 5:
			return "6.5em";
		default:
			return "10em";
	}
};
const setGridDimensions = (width = 4, height = 3) => {
	const maxGridWidth = 10;
	const maxGridHeight = 10;
	const minGridWidth = 2;
	const minGridHeight = 2;

	if (width < minGridWidth || width > maxGridWidth)
		throw new Error(
			`Grid width must be between ${minGridWidth} and ${maxGridWidth}`
		);
	if (height < minGridHeight || height > maxGridHeight)
		throw new Error(
			`Grid height must be between ${minGridHeight} and ${maxGridHeight}`
		);

	gridItemSize = calculateGridItemSize(width);

	gridWidth = width;
	gridHeight = height;

	gridSize = gridWidth * gridHeight;

	if (gridSize % numberOfCardsToMatch !== 0)
		throw new Error(`Grid size must be divisible by ${numberOfCardsToMatch}`);
};
const populateGrid = () => {
	grid.innerHTML = `<div class="grid-item"></div>`.repeat(gridSize);
	grid.style.gridTemplateColumns = `repeat(${gridWidth}, ${gridItemSize}`;
	grid.style.gridTemplateRows = `repeat(${gridHeight}, ${gridItemSize})`;
};
const delay = (time) => {
	return new Promise((resolve) => {
		setTimeout(resolve, time);
	});
};
const preAssignImages = () => {
	getGridItems().forEach((gridItem) => {
		return (gridItem.style.backgroundImage = `url(${imageUrl}${gridItem.id})`);
	});
};
const removeAllImages = (arr) => {
	arr.forEach((gridItem) => {
		return (gridItem.style.backgroundImage = none);
	});
};
const newGame = () => {
	const txtGridWidth = document.querySelector("#grid-width");
	const txtGridHeight = document.querySelector("#grid-height");

	const warning = document.querySelector(".warning");

	try {
		setGridDimensions(
			parseInt(txtGridWidth.value),
			parseInt(txtGridHeight.value)
		);
	} catch (err) {
		warning.innerHTML = err.message;
		showElement(warning);
		return;
	}

	hideElement(warning);
	hideElement(gameOver);
	hideElement(overlay);

	cardsToMatch = [];
	matchedCards = [];

	populateGrid();
	assignImageIds();
	preAssignImages();

	delay(1200).then(() => {
		removeAllImages(getGridItems());
	});

	startTimer();
};
const generatePictureIndexArray = () => {
	const pictureIndexSet = new Set();
	const output = [];

	while (pictureIndexSet.size < gridSize / numberOfCardsToMatch)
		pictureIndexSet.add(Math.floor(Math.random() * gridSize));

	for (let i = 0; i < numberOfCardsToMatch; i++)
		output.push(...pictureIndexSet);

	return output;
};
const assignImageIds = () => {
	const pictureIndexArray = generatePictureIndexArray();
	gridItems = getGridItems();

	gridItems.forEach((gridItem) => {
		const index = getValidRandomIndex(pictureIndexArray);
		const pictureIndex = pictureIndexArray.splice(index, 1).pop();
		gridItem.id = pictureIndex;
	});
};
const openCardsAreMatch = () => {
	return cardsToMatch.every((card) => card.id === cardsToMatch[0].id);
};
const isUntouchedCard = (card) => {
	return (
		!card.classList.contains(gridItem) ||
		card.classList.contains(disabled) ||
		card.classList.contains(matched) ||
		cardsToMatch.length >= numberOfCardsToMatch
	);
};
const finishGame = () => {
	stopTimer();
	showElement(gameOver);
	showElement(overlay);
};
const sendOpenCardsToMatch = () => {
	cardsToMatch.forEach((card) => {
		card.classList.add(matched);
		matchedCards.push(card);
	});
};
const gridClickHandler = async (event) => {
	const card = event.target;

	if (isUntouchedCard(card)) return;
	card.style.backgroundImage = `url(https://picsum.photos/200/300/?random&${event.target.id})`;

	if (cardsToMatch.length < numberOfCardsToMatch) {
		cardsToMatch.push(card);
		card.classList.add(disabled);

		if (cardsToMatch.length >= numberOfCardsToMatch) {
			if (openCardsAreMatch()) sendOpenCardsToMatch();
			else {
				await delay(900);
				removeAllImages(cardsToMatch);
			}
			if (matchedCards.length === gridSize) finishGame();

			cardsToMatch = [];
			getGridItems().forEach((gridItem) => {
				gridItem.classList.remove(disabled);
			});
		}
	}
};
const btnRestartClickHandler = () => {
	newGame();
	gameTimeContainer.classList.remove(hidden);
};

grid.addEventListener("click", gridClickHandler);
btnRestart.addEventListener("click", btnRestartClickHandler);
document.addEventListener("DOMContentLoaded", finishGame);

module.exports = {
	delay,
	newGame,
	imageUrl,
	showElement,
	hideElement,
	assignImageIds,
	formatTime,
	startTimer,
	stopTimer,
	calculateGridItemSize,
	setGridDimensions,
	gameTime,
	numberOfCardsToMatch,
	gridSize,
	imageUrl,
};
