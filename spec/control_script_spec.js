const document = require("./jsdom/document");
const {
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
} = require("../src/js/control_script");

beforeEach(() => {
	jasmine.clock().install();
});

afterEach(() => {
	jasmine.clock().uninstall();
});

describe("game variable ranges and constraints", () => {
	it("'gameTime' should default to 0 seconds", () => {
		expect(gameTime).toBe(0);
	});
	it("'numberOfCardsToMatch' should be greater than 2", () => {
		expect(numberOfCardsToMatch).toBeGreaterThanOrEqual(2);
	});
	it("'numberOfCardsToMatch' should be less or equal to half of the gridSize", () => {
		expect(numberOfCardsToMatch).toBeLessThanOrEqual(gridSize / 2);
	});
	it("'numberOfCardsToMatch' should be perfectly divisible by the grid size", () => {
		expect(Number.isInteger(gridSize / numberOfCardsToMatch)).toEqual(true);
	});

	it("'imageUrl' should be defined", () => {
		expect(imageUrl).toBeDefined();
	});
});

describe("setGridDimensions function", () => {
	it("should throw an error when the gridWidth is outside min max ranges", () => {
		expect(() => {
			setGridDimensions(0, 10);
		}).toThrowError("Grid width must be between 2 and 10");

		expect(() => {
			setGridDimensions(100, 10);
		}).toThrowError("Grid width must be between 2 and 10");
	});

	it("should throw an error when the gridHeight is outside min max ranges", () => {
		expect(() => {
			setGridDimensions(10, 0);
		}).toThrowError("Grid height must be between 2 and 10");

		expect(() => {
			setGridDimensions(10, 200);
		}).toThrowError("Grid height must be between 2 and 10");
	});

	it("should throw an error when the total grid size is not divisible by the number of cards to match variable", () => {
		expect(() => {
			setGridDimensions(3, 3);
		}).toThrowError("Grid size must be divisible by 2");
	});
});

describe("calculateGridItemSize function", () => {
	it("should return the correct grid item size", () => {
		const defaultGridItemSize = "10em";
		expect(calculateGridItemSize(10)).toBe("4em");
		expect(calculateGridItemSize(9)).toBe("4.5em");
		expect(calculateGridItemSize(8)).toBe("5em");
		expect(calculateGridItemSize(7)).toBe("5.5em");
		expect(calculateGridItemSize(6)).toBe("6em");
		expect(calculateGridItemSize(5)).toBe("6.5em");
		expect(calculateGridItemSize(4)).toBe(defaultGridItemSize);
		expect(calculateGridItemSize(3)).toBe(defaultGridItemSize);
		expect(calculateGridItemSize(2)).toBe(defaultGridItemSize);
		expect(calculateGridItemSize(1)).toBe(defaultGridItemSize);
	});
});

describe("startTimer function", () => {
	beforeEach(() => {
		spyOn(window, "clearInterval").and.callFake(() => {});
	});
	afterEach(() => {
		stopTimer();
	});

	it("should call an alert once", () => {
		spyOn(window, "alert");

		startTimer();
		expect(window.alert).toHaveBeenCalledTimes(1);
	});

	it("should call setInterval once", () => {
		spyOn(window, "setInterval");
		expect(window.setInterval).not.toHaveBeenCalled();
		startTimer();
		expect(window.setInterval).toHaveBeenCalledTimes(1);
	});

	it("should update gameTimer div to the current elapsed time", () => {
		const gameTimer = document.querySelector(".game-timer");

		expect(gameTimer.innerHTML).toEqual(formatTime(0));
		startTimer();
		jasmine.clock().tick(2000);

		expect(gameTimer.innerHTML).toEqual(formatTime(2));
	});
});

describe("stopTimer function", () => {
	it("should call the clearInterval method from window", () => {
		spyOn(window, "clearInterval");
		stopTimer();

		expect(window.clearInterval).toHaveBeenCalledTimes(1);
	});

	it("should update the game-time div to the current elapsed time followed by ' seconds.'", () => {
		const timeDiv = document.querySelector(".time");
		expect(timeDiv.innerHTML).toEqual(formatTime(0) + " seconds.");

		startTimer();
		jasmine.clock().tick(2000);
		stopTimer();
		expect(timeDiv.innerHTML).toEqual(formatTime(2) + " seconds.");
	});
});

describe("format time function", () => {
	it("should return a string of the form '00:00:00'", () => {
		expect(formatTime(0)).toBe("00:00:00");
	});
	it("should return string '00:00:59' for input 59", () => {
		expect(formatTime(59)).toBe("00:00:59");
	});
	it("should return string '00:01:10' for input 70", () => {
		expect(formatTime(70)).toBe("00:01:10");
	});
	it("should return string '00:01:59' for input 119", () => {
		expect(formatTime(119)).toBe("00:01:59");
	});
	it("should return string '01:30:00' for input 5400", () => {
		expect(formatTime(5400)).toBe("01:30:00");
	});
	it("should return string '00:00' for input -1 ", () => {
		expect(formatTime(-1)).toBe("00:00:00");
	});
});

describe("document body", () => {
	it('contain a div with class "grid"', () => {
		expect(document.querySelector(".grid")).toBeDefined();
	});
});

describe("newGame function", () => {
	it("should keep the .grid-item count to 12 when called multiple times", () => {
		newGame();
		newGame();

		const gridItems = document.querySelectorAll(".grid-item");
		expect(gridItems.length).toEqual(12);
	});

	it("should use DOM methods to hide gameOver and overlay divs.", () => {
		const gameOver = document.querySelector(".game-over");
		const overlay = document.querySelector(".overlay");

		spyOn(gameOver.classList, "add");
		spyOn(overlay.classList, "add");

		newGame();

		expect(gameOver.classList.add).toHaveBeenCalledWith("hidden");
		expect(overlay.classList.add).toHaveBeenCalledWith("hidden");
	});

	it("should reset all gridItems to untouched state using DOM methods.", () => {
		newGame();

		const gridItems = document.querySelectorAll(".grid-item");
		gridItems.forEach((gridItem) => {
			expect(gridItem.classList.contains("matched")).toBeFalsy();
			expect(gridItem.classList.contains("disabled")).toBeFalsy();
			expect(gridItem.classList.contains("hidden")).toBeFalsy();
		});
	});

	it("should give each grid item a new id", () => {
		newGame();

		const gridItems = document.querySelectorAll(".grid-item");
		gridItems.forEach((gridItem) => {
			expect(gridItem.id).toBeGreaterThanOrEqual(0);
		});
	});

	it("should pre-assign images to each grid item", () => {
		newGame();

		const gridItems = document.querySelectorAll(".grid-item");
		gridItems.forEach((gridItem) => {
			expect(gridItem.style.backgroundImage).toBeDefined();
			expect(gridItem.style.backgroundImage).not.toBe("none");
			expect(gridItem.style.backgroundImage).toEqual(
				`url(${imageUrl}${gridItem.id})`
			);
		});

		delay(1200).then(() => {
			gridItems.forEach((gridItem) => {
				expect(gridItem.style.backgroundImage).toBe("none");
			});
		});
	});
});

describe("hideElement function", () => {
	it("should add a class 'hidden' to the element", async () => {
		hideElement(document.body);
		expect(document.body.classList.contains("hidden")).toBeTruthy();
	});
});

describe("showElement function", () => {
	it("should remove the class 'hidden' to the element", async () => {
		showElement(document.body);
		expect(document.body.classList.contains("hidden")).toBeFalse();
	});
});

describe("assignImageIds function", () => {
	it("should assign an id to each grid-item in the .grid div", () => {
		assignImageIds();
		const gridItems = document.querySelectorAll(".grid-item");
		gridItems.forEach((gridItem) => {
			expect(gridItem.id).toBeTruthy();
			expect(gridItem.id).toBeGreaterThanOrEqual(0);
		});
	});

	it("should assign 2 of each id to any 2 grid-items", () => {
		newGame();
		const gridItems = document.querySelectorAll(".grid-item");
		const ids = [];
		gridItems.forEach((gridItem) => {
			if (!ids.includes(gridItem.id)) {
				ids.push(gridItem.id);
			}
		});
		expect(gridItems.length).toEqual(12);
		expect(ids.length).toEqual(gridItems.length / 2);
	});
});
