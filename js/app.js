; (function (window, angular) {

	'use strict';

	class Node {
		constructor(x, y, g, h, parent = null) {
			this.x = x;       		// X pozíció
			this.y = y;       		// Y pozíció
			this.g = g;       		// G költség (kezdőponttól való távolság)
			this.h = h;       		// H költség (heurisztikus távolság az ételig)
			this.parent = parent;	// Parent node
			this.f = g + h;   		// F költség (G + H)
		}
	}

	// Application module
	let app = angular.module('app', [
		'ui.router'
	])

		.config([
			'$stateProvider',
			'$urlRouterProvider',
			function ($stateProvider, $urlRouterProvider) {
				$stateProvider
					.state('root', {
						abstract: true,
						views: {
							'@': {
								templateUrl: './html/root.html'
							}
						}
					})
					.state('game', {
						url: '/',
						parent: 'root',
						controller: 'gameController',
						templateUrl: './html/game.html'
					})
					.state('register', {
						url: '/register',
						parent: 'root',
						controller: 'registerController',
						templateUrl: './html/register.html',
						params: {
							score: null
						}
					}
					)
					.state('topList', {
						url: '/topList',
						parent: 'root',
						controller: 'topListController',
						templateUrl: './html/topList.html'
					})
				$urlRouterProvider.otherwise('/');
			}
		])

		// Game controller
		.controller('gameController', [
			'$scope',
			'$timeout',
			'$interval',
			'input',
			'$state',
			function ($scope, $timeout, $interval, input, $state) {


				// Options (input models)
				$scope.options = {
					size: { x: 15, y: 25 },
					stones: 0,
					delay: 100,
					apples : 1,
					autoPlay: false,
					players: [
						{ id: 'human', valid: true, name: 'Ember' },
						{ id: 'human_mp', valid: true, name: '2 játékos' },
						{ id: 'astar_e', valid: true, name: 'A* Euklidesz' }
					],
					playerID: null,
					isHuman: true,
					isMP: false
				}

				// Find first valid player
				// let index = $scope.options.players.findIndex(item => item.valid);
				// if (index !== -1) 
				// 	$scope.options.playerID = $scope.options.players[index].id;
				$scope.options.playerID = "human";

				$scope.baseOptions = structuredClone($scope.options);

				// Game properties
				$scope.game = {
					status: "stopped",
					score: 0,
					steps: 0,
					snakeLength: 2,
					time: "0.00",
					attempt: 0,
					peak: 0,
					countdown: null,
					audioName: "eated",
					maxStones: 18
				};

				// Helper
				let helper = {
					body: $('table.game-panel > tbody'),
					audioEated: document.getElementById("audioEated"),
					audioEnded: document.getElementById("audioEnded"),
					interval: null,
					countdownID: null,
					food: { x: null, y: null },
					snake: {
						head: { x: null, y: null },
						body: [],
						class: "snake",
						lastInput: null,
						direction: null,
						prevDirection: null
					},
					snake2: {
						head: { x: null, y: null },
						body: [],
						class: "snake2",
						lastInput: null,
						direction: null,
						prevDirection: null
					},
					time: { start: null, end: null },
					effectID: null,
					minScore: -100,
					direction: null,
					prevDirection: null,
					direction2: null
				}

				// Disable minScore if multiplayer
				if ($scope.options.isMP) {
					helper.minScore = -Infinity;
				}

				// Set scope methods
				$scope.methods = {

					// Start
					start: () => {

						// Clear interval when exist
						methods.clearInterval();

						// Clear inputs
						input.clearBuffer();

						// Check human
						methods.checkHuman();

						// When is not paused, then reset properties
						if ($scope.game.status !== "paused") {
							helper.time.start = new Date();
							$scope.game.score = 0;
							$scope.game.steps = 0;
							$scope.game.time = "0.00";
							$scope.game.attempt++;
						}

						// Start
						$scope.game.status = "started";
						methods.play();
						helper.interval = $interval(() => {
							methods.play();
						}, $scope.options.delay);
					},

					// Pause
					pause: () => {
						if ($scope.game.status !== "paused") {
							methods.clearInterval();
							$scope.game.status = "paused";
						} else methods.play();
					},

					// Stop
					stop: () => {
						methods.clearInterval();
						if ($scope.game.status === "ended" && $scope.options.isHuman && !$scope.options.isMP)
							$scope.game.peak = Math.max($scope.game.peak, $scope.game.score);
						$scope.game.status = "stopped";
						methods.reset();
					},

					// Refresh
					refresh: () => {
						methods.checkHuman();
						methods.reset();
					},

					// Reset peak (top score)
					resetPeak: () => {
						if (window.confirm("Biztos visszaállítod pontjaidat 0-ra?")) {
							$scope.game.peak = 0;
							$scope.game.attempt = 0;
							localStorage.removeItem("snake_game_attempt");
							localStorage.removeItem("snake_game_peak");
						}
					},

					// Reset options
					resetOptions: () => {
						if (window.confirm("Biztos visszaállítod?")) {
							$scope.options = structuredClone($scope.baseOptions);

						}
					},

					// Record peak (top score), and attempt
					registerPeak: () => {
						$state.go("register", { score: $scope.game.peak });
					},

					//View Top list
					viewTopList: () => {
						$state.go('topList');
					}
				};

				// Set methods
				let methods = {

					// Initialize
					init: () => {

						// Set audio volume
						helper.audioEated.volume = 0.1;
						helper.audioEnded.volume = 0.1;

						// Get peak (top score), and attempt
						$scope.game.peak = methods.getPeak();
						$scope.game.attempt = methods.getAttempt();

						// Set events
						methods.events();

						// Reset asynchronous
						$timeout(() => {

							// Reset
							methods.reset();

							// Show page
							$('#app-container').removeClass('d-none');
						});
					},

					// Events
					events: () => {

						// Optins size changed
						$scope.$watch('options.size', (newValue, oldValue) => {
							if (!angular.equals(newValue, oldValue)) {
								$scope.game.maxStones = Math.floor(newValue.x * newValue.y * 0.05);
								if ($scope.game.maxStones < $scope.options.stones)
									$scope.options.stones = $scope.game.maxStones;
								methods.reset();
							}
						}, true);

						// Options stones changed
						$scope.$watch('options.stones', (newValue, oldValue) => {
							if (!angular.equals(newValue, oldValue)) {
								methods.reset();
							}
						});
						
						// Options apples changed
						$scope.$watch('options.apples', (newValue, oldValue) => {
							if (!angular.equals(newValue, oldValue)) {
								methods.reset();
							}
						});

						// Watch peak (top score) changed
						$scope.$watch('game.peak', (newValue, oldValue) => {
							if (!angular.equals(newValue, oldValue)) {
								methods.setPeak(newValue);
							}
						});

						// Watch countdown changed
						$scope.$watch('game.countdown', (newValue, oldValue) => {
							if (!angular.equals(newValue, oldValue)) {
								if (newValue <= 0) {
									$interval.cancel(helper.countdownID);
									if (helper.isHuman && !helper.isMP) $scope.game.peak = Math.max($scope.game.peak, $scope.game.score);
									methods.reset();
									$scope.game.countdown = null;
									helper.countdownID = null;
									$scope.methods.start();
								}
							}
						});

						// Watch attempt changed
						$scope.$watch('game.attempt', (newValue, oldValue) => {
							if (!angular.equals(newValue, oldValue)) {
								methods.setAttempt(newValue);
							}
						});
					},

					// Reset
					reset: () => {
						if ($scope.options.isHuman) {
							$scope.options.size = {
								x: 15,
								y: 25
							};
							if (!$scope.options.isMP || $scope.playerID == "astar_e") {
								$scope.options.stones = 0;
								$scope.options.apples = 1;
							} 
						}

						$scope.game.startedMoving = false;

						// If multiplayer, set snake to mp position
						// If not, random orientation in base position
						if ($scope.options.isMP) {
							helper.snake.head = {
								x: 5,
								y: 22
							};
						} else {
							helper.snake.head = {
								x: Math.floor(($scope.options.size.x - 1) / 2),
								y: Math.floor(($scope.options.size.y - 1) / 2)
							};
						}

						$timeout(function () {
							// Remove entries from cells
							helper.body.find('td')
								.removeClass('snake snake2 head food stone start end top bottom');
							$scope.game.snakeLength = 2;
							$scope.game.countdown = null;
							helper.snake.body = [];

							// Random or set orientation based on if it's MP
							let head = methods.getCell(helper.snake.head),
								neighbors = methods.neighbors(helper.snake.head, ", .food"),
								neighbor =
									$scope.options.isMP
										? $(neighbors[2])
										: $(neighbors[Math.floor(Math.random() * neighbors.length)]),
								direction = methods.direction(helper.snake, neighbor, head);

							helper.snake.direction = direction;
							head.addClass(`snake head ${direction}`);
							neighbor.addClass('snake');
							helper.snake.body.push(methods.position(neighbor));

							// If multiplayer, set second snake, set first to viable position
							if ($scope.options.isMP) {
								helper.snake2.body = [];
								helper.snake2.head = {
									x: 5,
									y: 2
								};

								let head2 = methods.getCell(helper.snake2.head),
									neighbors2 = methods.neighbors(helper.snake2.head, ", .food"),
									neighbor2 = $(neighbors2[1]),
									direction2 = "end";
								helper.snake2.direction = direction2;
								head2.addClass(`snake2 head ${direction2}`);
								neighbor2.addClass('snake2');
								helper.snake2.body.push(methods.position(neighbor2));
							}

							methods.setStones();
							for (let i = 0; i < $scope.options.apples; i++) {
								methods.setFood();
							}

						});
					},

					// Play
					play: () => {

						// Upgrade score, steps, and time
						methods.upgrade();

						// Get/Check neighbors
						let neighbors = methods.neighbors(helper.snake.head);

						if (!neighbors.length ||
							methods.isInfinite()) {

							// Game ended
							methods.ended();
							return;
						}

						if ($scope.options.isMP) {
							let neighbors2 = methods.neighbors(helper.snake2.head);
							if (!neighbors2.length ||
								methods.isInfinite()) {

								// Game ended
								methods.ended();
								return;
							}
						}

						// Check that one of the neighbors is food, 
						// and define variable for later use
						let food = neighbors.filter(".food"),
							next = null;
						
						if ($scope.options.playerID === "human" || $scope.options.playerID === "human_mp") {
							next = methods[`${$scope.options.playerID}Next`](neighbors);
						}
						else if (!food.length) {
							if (neighbors.length > 1)

								// Call player algorithm
								next = methods[`${$scope.options.playerID}Next`](neighbors);
							else next = neighbors;
						} else if (food.length > 1) {
							next = $(food[0]);
						} else next = food;

						// Move
						if (Array.isArray(next)) {
							let func = (next, snake, snake2) => {
								if (next[0] != null && (next[0].hasClass("snake") || next[0].hasClass("snake2") || (next[0].hasClass("stone")))) {
									let head = methods.getCell(snake.head);

									head.addClass(snake.lastInput);
									methods.ended();
								}

								methods.move(next[0], snake);

								if (next[1] != null && (next[1].hasClass("snake") || next[1].hasClass("snake2") || next[1].hasClass("stone"))) {
									let head = methods.getCell(snake2.head);

									head.addClass(snake2.lastInput);

									methods.ended();
								}

								methods.move(next[1], snake2);
							}

							if (Math.random() > 0.5)
								func(next, helper.snake, helper.snake2);
							else
								func([next[1], next[0]], helper.snake2, helper.snake);

							return;
						}

						if (next != null && next.hasClass("snake")) {
							let head = methods.getCell(helper.snake.head);

							head.addClass(helper.snake.lastInput);

							methods.ended();
						}
						methods.move(next, helper.snake);
					},

					// Upgrade score, steps, and time
					upgrade: () => {
						$scope.game.score--;
						$scope.game.steps++;
						$scope.game.time = (((new Date()) - helper.time.start) / 1000).toFixed(2);
					},

					// Game ended
					ended: () => {

						// If going outside the map, keep head
						if (!helper.snake.head.x && $scope.options.isHuman) methods.squish(helper.snake);
						if (!helper.snake2.head.x && $scope.options.isMP) methods.squish(helper.snake2);

						// Clear interval, set satus, and stop the game
						methods.clearInterval();
						helper.audioEnded.play();
						$scope.game.status = "ended";
						$scope.game.startedMoving = false;

						// Check auto play/refresh
						if ($scope.options.isHuman && $scope.options.autoPlay) {
							$scope.methods.stop();
							$scope.methods.refresh();
						} else if ($scope.options.autoPlay) {
							$scope.game.countdown = 1;
							helper.countdownID = $interval(() => {
								$scope.game.countdown--;
							}, 1000);
						}
					},

					// Check is infinite
					isInfinite: () => {
						if ($scope.options.isHuman) {
							return false;
						}

						return $scope.game.score < helper.minScore;
					},

					// Move
					move: (next, snake) => {
						if ($scope.options.isHuman && !$scope.game.startedMoving) return;

						// Get head, and direction
						let head = methods.getCell(snake.head),
							direction = methods.direction(snake, head, next);

						// 
						head.removeClass('head start end top bottom');
						next.addClass(`${snake.class} head ${direction}`);
						snake.body.unshift(snake.head);
						snake.head = methods.position(next);

						//
						if (!next.hasClass("food")) {
							let tail = methods.getCell(snake.body[snake.body.length - 1]);
							tail.removeClass("snake snake2");
							snake.body.splice(-1, 1);
						} else {
							helper.audioEated.play();

							// Sebesség alapján pontok
							switch ($scope.options.delay) {
								case 200:
									$scope.game.score += 50;
									break
								case 100:
									$scope.game.score += 100;
									break;
								case 50:
									$scope.game.score += 150;
									break;
								case 25:
									$scope.game.score += 200;
									break;
								default:
									break;
							}

							$scope.game.snakeLength++;
							next.removeClass("food");
							methods.setFood();
							methods.shineEffect(snake);
						}
					},

					// Random player
					randomNext: (neighbors) => {
						return $(neighbors[Math.floor(Math.random() * neighbors.length)]);
					},

					// Greedy player
					greedyNext: (neighbors) => {
						let distances = [];
						for (let i = 0; i < neighbors.length; i++) {
							let pos = methods.position($(neighbors[i])),
								distance = Math.sqrt(((helper.food.x - pos.x) ** 2) +
									((helper.food.y - pos.y) ** 2)),
								nextNeighbors = methods.neighbors(pos);
							if (nextNeighbors.length)
								distances.push(distance);
							else distances.push(10000000);
						}
						let index = methods.indexOfMin(distances);
						return $(neighbors[index]);
					},

					// A* Euklidesz player
					astar_eNext: (neighbors) => {

						let result = null;
						let openSet = [];
						let closedSet = [];
						let startNode =
							new Node(helper.snake.head.x, helper.snake.head.y, 0,
								methods.heuristic(helper.snake.head.x, helper.snake.head.y,
									helper.food.x, helper.food.y));
						openSet.push(startNode);
						while (openSet.length > 0) {
							let current = openSet.reduce((a, b) => (a.f < b.f ? a : b));
							if (current.x === helper.food.x && current.y === helper.food.y) {
								let path = [];
								while (current) {
									path.push({ x: current.x, y: current.y });
									current = current.parent;
								}
								result = path.reverse();
								openSet = [];
								continue;
							}
							openSet.splice(openSet.indexOf(current), 1);
							closedSet.push(current);
							let neighbors = methods.neighbors({ x: current.x, y: current.y });
							for (const neighbor of neighbors) {
								let pos = methods.position($(neighbor));
								if (!closedSet.some(node => node.x === pos.x && node.y === pos.y)) {
									let gScore = current.g + 1;
									let hScore = methods.heuristic(pos.x, pos.y, helper.food.x, helper.food.y);
									let neighborNode = new Node(pos.x, pos.y, gScore, hScore, current);
									let existingNode = openSet.find(node => node.x === pos.x && node.y === pos.y);
									if (!existingNode || gScore < existingNode.g) {
										if (existingNode) {
											openSet.splice(openSet.indexOf(existingNode), 1);
										}
										openSet.push(neighborNode);
									}
								}
							}
						}
						if (result && result.length > 1)
							result = methods.getCell(result[1]);
						else result = methods.greedyNext(neighbors);
						return result;
					},

					humanGetNext: (inputs, snake, directionMap) => {
						let next;
						let direction;
						while (inputs.length !== 0) {
							direction = inputs.pop();
							let mappedDirection = directionMap[direction];

							if (mappedDirection === snake.direction) continue;

							if (mappedDirection == methods.oppositeDirection(snake.direction)) {
								continue;
							}
							next = methods.humanMove(mappedDirection, snake);
							if (!next) continue;
							if (!next.hasClass("snake")) break;
						}

						if (direction != null) snake.lastInput = directionMap[direction];
						dropInput(direction);

						if (!next) {
							return $(methods.humanMove(snake.direction, snake));
						}

						return $(next);
					},

					// Human player
					humanNext: () => {
						let inputs = input.get(["arrowup", "arrowdown", "arrowleft", "arrowright"]);
						input.clearBuffer();

						let directionMap = {
							"arrowup": "top",
							"arrowdown": "bottom",
							"arrowleft": "start",
							"arrowright": "end"
						};

						if (!$scope.game.startedMoving && inputs.length === 0) {
							$scope.game.score = 0;
							$scope.game.steps = 0;
							$scope.game.time = "0.00";

							return;
						}
						$scope.game.startedMoving = true;

						return methods.humanGetNext(inputs, helper.snake, directionMap);
					},

					human_mpNext: () => {
						let inputs = input.get(["arrowup", "arrowdown", "arrowleft", "arrowright"]);
						let inputs2 = input.get(["w", "a", "s", "d"]);
						input.clearBuffer();

						if (!$scope.game.startedMoving && (inputs.length === 0 || inputs2.length === 0)) return;
						$scope.game.startedMoving = true;

						let directionMap = {
							"arrowup": "top",
							"arrowdown": "bottom",
							"arrowleft": "start",
							"arrowright": "end",
						}

						let directionMap2 = {
							"w": "top",
							"s": "bottom",
							"a": "start",
							"d": "end"
						};

						let next = methods.humanGetNext(inputs, helper.snake, directionMap);
						let next2 = methods.humanGetNext(inputs2, helper.snake2, directionMap2);

						return [next, next2];
					},

					// Get next cell based on direction
					humanMove: (direction, snake) => {
						switch (direction) {
							case "top":
								return methods.getCell({ x: snake.head.x - 1, y: snake.head.y });
							case "bottom":
								return methods.getCell({ x: snake.head.x + 1, y: snake.head.y });
							case "start":
								return methods.getCell({ x: snake.head.x, y: snake.head.y - 1 });
							case "end":
								return methods.getCell({ x: snake.head.x, y: snake.head.y + 1 });
						}
					},

					// Get opposite of given direction
					oppositeDirection: (direction) => {
						switch (direction) {
							case "top":
								return "bottom";
							case "bottom":
								return "top";
							case "start":
								return "end";
							case "end":
								return "start";
						}
					},

					// Heurisztika: Manhattan távolság kiszámítása
					heuristic: (x1, y1, x2, y2) => {
						return Math.abs(x1 - x2) + Math.abs(y1 - y2);
					},

					// Check is human
					checkHuman: () => {
						$scope.options.isHuman = $scope.options.playerID === "human" || $scope.options.playerID === "human_mp";
						$scope.options.isMP = $scope.options.playerID === "human_mp";
					},

					// Get squished
					squish: (snake) => {
						if (methods.getCell(snake.head).length !== 0) return;

						let firstBody = methods.getCell(snake.body[0])[0];
						firstBody.classList.add("head");
						firstBody.classList.add(snake.prevDirection);
					},

					// Set food
					setFood: () => {
						let freeCels = helper.body.find("td").not(".snake, .snake2, .head, .food, .stone");
						let ind = Math.floor(Math.random() * freeCels.length),
							food = $(freeCels[ind]),
							pos = methods.position(food);
						food.addClass('food');
						helper.food = pos;
					},

					// Set stones
					setStones: () => {
						for (let i = 0; i < $scope.options.stones; i++) {
							let freeCels = helper.body.find("td").not(".snake, .snake2, .head, .food, .stone"),
								stone = $(freeCels[Math.floor(Math.random() * freeCels.length)]),
								neighbors = methods.neighbors(methods.position(stone));
							stone.addClass("stone");
							for (let i = 0; i < neighbors.length; i++) {
								if (Math.random() < 0.5) $(neighbors[i]).addClass("stone");
							}
						}
					},

					// Get free neighbors
					neighbors: (pos, className = "") => {
						let skeleton = `td[row="${pos.x - 1}"][col="${pos.y}"],
													 td[row="${pos.x + 1}"][col="${pos.y}"],
													 td[row="${pos.x}"][col="${pos.y - 1}"],
													 td[row="${pos.x}"][col="${pos.y + 1}"]`,
							neighbors;
						if ($scope.options.isHuman) {
							neighbors = helper.body.find(skeleton).not(".snake")
						} else {
							neighbors = helper.body.find(skeleton).not(`.snake, .head, .stone${className}`);
						}
						return neighbors;
					},

					// Get element position
					position: (element) => {
						return {
							x: parseInt(element.attr("row")),
							y: parseInt(element.attr("col"))
						};
					},

					// Get direction
					direction: (snake, from, to) => {
						let direction;
						if (parseInt(from.attr("row")) === parseInt(to.attr("row"))) {
							if (parseInt(from.attr("col")) < parseInt(to.attr("col"))) {
								direction = "end";
							} else {
								direction = "start";
							}
						} else if (parseInt(from.attr("row")) < parseInt(to.attr("row"))) {
							direction = "bottom";
						} else {
							direction = "top";
						}

						snake.prevDirection = snake.direction;
						snake.direction = direction;

						return direction;
					},

					// Clear interval
					clearInterval: () => {
						['interval', 'countdownID'].forEach(key => {
							if (helper[key]) {
								$interval.cancel(helper[key]);
								helper[key] = null;
							}
						});
					},

					// Get element from position
					getCell: (pos) => {
						let skeleton = `td[row="${pos.x}"][col="${pos.y}"]`,
							element = helper.body.find(skeleton);
						return element;
					},

					// Get index of lower value
					indexOfMin: (arr) =>
						arr.reduce((prev, curr, i, a) =>
							curr < a[prev] ? i : prev, 0),

					// Get peak (top score)
					getPeak: () => {
						let peak = localStorage.getItem("snake_game_peak");
						return peak === null ? 0 : parseInt(peak);
					},

					// Set peak (top score), and attempt
					setPeak: (peak) => {
						localStorage.setItem("snake_game_peak", peak);
					},

					// Get attempt
					getAttempt: () => {
						let attempt = localStorage.getItem("snake_game_attempt");
						return attempt === null ? 0 : parseInt(attempt);
					},

					// Set attempt
					setAttempt: (attempt) => {
						localStorage.setItem("snake_game_attempt", attempt);
					},

					// Shine effect
					shineEffect: (snake) => {
						let delay = 0,
							length = snake.body.length;
						for (let i = 0; i < length; i++) {
							if (snake.body.length !== length) {
								if (helper.effectID)
									$timeout.cancel(helper.effectID);
								break;
							}
							let pos = snake.body[i];
							helper.effectID = $timeout(() => {
								let cell = helper.body.find(`td[row="${pos.x}"][col="${pos.y}"]`);
								if (cell.length &&
									 (cell.hasClass('snake') || cell.hasClass('snake2')) &&
									 !cell.hasClass('shine')) {
									setTimeout(() => {
										cell.removeClass("shine");
									}, 200);
									cell.addClass("shine");
								}
							}, delay);
							delay += 20;
						}
					},

					// Is there any way to escape
					isEscapeRoute: (pos) => {
						return methods.neighbors(pos).length > 2;
					}
				};

				// Initialize
				methods.init();
			}
		])

		// Register controller
		.controller('registerController', [
			'$scope',
			'$stateParams',
			'$state',
			function ($scope, $stateParams, $state) {
				$scope.data = {
					name: null,
					score: null
				}
				$scope.data.score = $stateParams.score;



				$scope.register = function () {
					if ($scope.data.score == 0) {
						alert("Nem lehet 0 pontot regisztrálni!");
						$state.go("game");
					} else {
						fetch("./php/register.php",
							{
								body: JSON.stringify($scope.data),
								method: "POST"
							}
						)
							.then(res => res.json())
							.then(res => {
								if (!res.error) {
									alert("Sikeres adatfelvétel!");
									$state.go("topList");
								} else {
									alert("Hiba, kérlek próbáld újra!")
								}
							})
							.catch(e => alert("Hiba, kérlek próbáld újra!"));
						}
				}

				$scope.return = function () {
					$state.go('game');
				}


			}
		])

		.controller('topListController', [
			'$scope',
			'$state',
			function ($scope, $state) {
				$scope.topList;

				$scope.getTop = function () {
					fetch("./php/getLeaderboard.php")
						.then(res => res.json())
						.then(res => {
							$scope.topList = res.data;
							$scope.$applyAsync();
						})
						.catch(e => alert("Hiba, kérlek próbáld újra!"));
				}

				$scope.return = function () {
					$state.go('game');
				}

				$scope.getTop();
			}
		])

	addFactory(app);

})(window, angular);