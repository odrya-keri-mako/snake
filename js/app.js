;(function(window, angular) {

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
  let app = angular.module('app', [])

	// Application controller
	.controller('appController', [
		'$scope',
		'$timeout',
		'$interval',
		'input',
		($scope, $timeout, $interval, input) => {


			// Optons (input models)
			$scope.options = {
				size			: {x:15, y:25},
				stones 		: 0,
				delay			: 100,
				autoPlay	: false,
				players 	: [
					{id:'human',			valid:true,	  name:'Human'},
					{id:'astar_e',		valid:true,		name:'A* Euklidesz'}
				],
				playerID: null
			}

			// Find first valid player
			// let index = $scope.options.players.findIndex(item => item.valid);
			// if (index !== -1) 
			// 	$scope.options.playerID = $scope.options.players[index].id;
			$scope.options.playerID = "human";

			// Game properties
			$scope.game = {
				status			: "stopped",
				score 			: 0,
				steps       : 0,
				snakeLength	: 2,
				time 				: "0.00",
				attempt 		: 0,
				peak        : 0,
				countdown 	: null,
				audioName 	: "eated",
				maxStones		: 18
			};

			// Helper
			let helper = {
				body				: $('table.game-panel > tbody'),
				audioEated 	: document.getElementById("audioEated"),
				audioEnded 	: document.getElementById("audioEnded"),
				interval		: null,
				countdownID : null,
				food 				: {x:null, y:null},
				snake				: {
					head: {x:null, y:null}, 
					body: []
				},
				time			: {start: null, end: null},
				effectID  : null,
				minScore 	: -100,
				direction : null
			}

			// Set scope methods
			$scope.methods = {

				// Start
				start: () => {

					// Clear interval when exist
					methods.clearInterval();

					// When is not paused, then reset properties
					if ($scope.game.status !== "paused") {
						helper.time.start = new Date();
						$scope.game.score = 0;
						$scope.game.steps = 0;
						$scope.game.time  = "0.00";
						$scope.game.attempt++;
					}

					// Check player function exist
					if (typeof methods[`${$scope.options.playerID}Next`] !== 'function') {
						alert(`Player '${$scope.options.playerID}' is not implemented yet!`);
						return;
					}

					// Start
					$scope.game.status = "started";
					methods.play();
					helper.interval = $interval(() => {
							methods.play();
					}, 	$scope.options.delay);
				},

				// Pause
				pause: () => {
					if ($scope.game.status !== "paused") {
									methods.clearInterval();
									$scope.game.status = "paused";
					} else 	methods.play();
				},

				// Stop
				stop: () => {
					methods.clearInterval();
					if ($scope.game.status === "ended")
						$scope.game.peak = Math.max($scope.game.peak, $scope.game.score);
					$scope.game.status = "stopped";
					methods.reset();
				},

				// Refresh
				refresh: () => {
					methods.reset();
				},

				// Reset peak (top score)
				resetPeak: () => {
					if (window.confirm("Do you really want to reset top score?")) {
						$scope.game.peak 		= 0;
						$scope.game.attempt = 0;
						localStorage.removeItem("snake_game_attempt");
						localStorage.removeItem("snake_game_peak");
					}
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
					$scope.game.peak 		= methods.getPeak();
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
						if(!angular.equals(newValue, oldValue)) {
							$scope.game.maxStones = Math.floor(newValue.x * newValue.y * 0.05);
							if ($scope.game.maxStones < $scope.options.stones)
								$scope.options.stones = $scope.game.maxStones;
							methods.reset();
						}
					}, true);

					// Options stones changed
					$scope.$watch('options.stones', (newValue, oldValue) => {
						if(!angular.equals(newValue, oldValue)) {
							methods.reset();
						}
					});

					// Watch peak (top score) changed
					$scope.$watch('game.peak', (newValue, oldValue) => {
						if(!angular.equals(newValue, oldValue)) {
							methods.setPeak(newValue);
						}
					});

					// Watch countdown changed
					$scope.$watch('game.countdown', (newValue, oldValue) => {
						if(!angular.equals(newValue, oldValue)) {
							if (newValue === 0) {
								$interval.cancel(helper.countdownID);
								$scope.game.peak = Math.max($scope.game.peak, $scope.game.score);
								methods.reset();
								$scope.game.countdown = null;
								helper.countdownID		= null;
								$scope.methods.start();
							}
						}
					});

					// Watch attempt changed
					$scope.$watch('game.attempt', (newValue, oldValue) => {
						if(!angular.equals(newValue, oldValue)) {
							methods.setAttempt(newValue);
						}
					});
				},

				// Reset
				reset: () => {

					// Remove entries from cells
					helper.body.find('td')
										 .removeClass('snake head food stone start end top bottom');
					$scope.game.snakeLength = 2;
					$scope.game.countdown = null;
					helper.snake.body = [];
					helper.snake.head = {
						x: Math.floor(($scope.options.size.x - 1) / 2),
						y: Math.floor(($scope.options.size.y - 1) / 2)
					};
					let head 			= methods.getCell(helper.snake.head),
							neighbors = methods.neighbors(helper.snake.head, ", .food"),
							neighbor 	= $(neighbors[Math.floor(Math.random()*neighbors.length)]),
							direction = methods.direction(neighbor, head);
					helper.direction = direction;
					head.addClass(`snake head ${direction}`);
					neighbor.addClass('snake');
					helper.snake.body.push(methods.position(neighbor));
					methods.setStones();
					methods.setFood();
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

					// Check that one of the neighbors is an food, 
					// and define variable for later use
					let food = neighbors.filter(".food"),
							next = null;
					if (!food.length) {
						if (neighbors.length > 1)

									// Call player algorithm
									next = methods[`${$scope.options.playerID}Next`](neighbors);
						else 	next = neighbors;
					} else 	next = food;

					// Move
					methods.move(next);
				},

				// Upgrade score, steps, and time
				upgrade: () => {
					$scope.game.score--;
					$scope.game.steps++;
					$scope.game.time = (((new Date()) - helper.time.start) / 1000).toFixed(2);
				},

				// Game ended
				ended: () => {

					// Clear interval, set satus, and stop the game
					methods.clearInterval();
					helper.audioEnded.play();
					$scope.game.status = "ended";

					// Check autoplay
					if ($scope.options.autoPlay) {
						$scope.game.countdown = 10;
						helper.countdownID = $interval(() => {
							$scope.game.countdown--;
						}, 1000);
					}
				},

				// Check is infinite
				isInfinite: () => {
					return $scope.game.score < helper.minScore;
				},

				// Move
				move: (next) => {
					
					// Get head, and direction
					let head = methods.getCell(helper.snake.head),
							direction = methods.direction(head, next);

					// 
					head.removeClass('head start end top bottom');
					next.addClass(`snake head ${direction}`);
					helper.snake.body.unshift(helper.snake.head);
					helper.snake.head = methods.position(next);

					//
					if (!next.hasClass("food")) {
						let tail = methods.getCell(helper.snake.body[helper.snake.body.length-1]);
						tail.removeClass("snake");
						helper.snake.body.splice(-1, 1);
					} else {
						helper.audioEated.play();
						$scope.game.score += 100;
						$scope.game.snakeLength++;
						next.removeClass("food");
						methods.setFood();
						methods.shineEffect();
					}
				},

				// Random player
				randomNext: (neighbors) => {
					return $(neighbors[Math.floor(Math.random()*neighbors.length)]);
				},

				// Greedy player
				greedyNext: (neighbors) => {
					let distances = [];
					for(let i=0; i < neighbors.length; i++) {
						let pos = methods.position($(neighbors[i])),
								distance = Math.sqrt(((helper.food.x - pos.x) ** 2) + 
																		 ((helper.food.y - pos.y) ** 2)),
								nextNeighbors	= methods.neighbors(pos);
						if (nextNeighbors.length)
									distances.push(distance);
						else	distances.push(10000000); 
					}
					let index = methods.indexOfMin(distances);
					return $(neighbors[index]);
				},

				// A* Euklidesz player
				astar_eNext: (neighbors) => {

					let result		= null;
					let openSet 	= [];
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
    	            path.push({x: current.x, y: current.y});
    	            current = current.parent;
    	        }
    	        result = path.reverse();
							openSet = [];
							continue;
    	    	}
						openSet.splice(openSet.indexOf(current), 1);
    	    	closedSet.push(current);
						let neighbors = methods.neighbors({x: current.x, y: current.y});
						for (const neighbor of neighbors) {
							let pos = methods.position($(neighbor));
							if (!closedSet.some(node => node.x === pos.x && node.y === pos.y)) {
								let gScore = current.g + 1;
    	          let hScore = methods.heuristic(pos.x, pos.y, helper.food.x, helper.food.y);
    	          let neighborNode = new Node(pos.x, pos.y, gScore, hScore, current);
								let existingNode = openSet.find(node => node.x === pos.x && node.y === 	pos.y);
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
					else 	result = methods.greedyNext(neighbors);
					return result;
				},

				// Human player
				humanNext: (neighbors) => {
					let inputs = input.get(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
					input.clearBuffer();
					
					let lastInput = inputs.at(-1);
					let directionMap = {
							"ArrowUp": "top",
							"ArrowDown": "bottom",
							"ArrowLeft": "start",
							"ArrowRight": "end"
					};

					let mappedDirection = directionMap[lastInput];

					let next = methods.humanMove(mappedDirection, neighbors);
					console.log(helper.snake.head, helper.direction)
					console.log(next);
					console.log(methods.humanMove(helper.direction, neighbors));
					if (!next) {
						return methods.humanMove(helper.direction, neighbors);
					}
					return next;

				},

				humanMove: (direction, neighbors) => {
					switch (direction) {
						case "top":
							return neighbors.find(e => Number(e.attr.row) === helper.snake.head.x - 1);
						case "bottom":
							return neighbors.find(e => Number(e.attr.row) === helper.snake.head.x + 1);
						case "start":
							return neighbors.find(e => Number(e.attr.row) === helper.snake.head.y - 1);
						case "end":
							return neighbors.find(e => Number(e.attr.row) === helper.snake.head.y + 1);
					}
				},

				// Heurisztika: Manhattan távolság kiszámítása
				heuristic: (x1, y1, x2, y2) => {
					return Math.abs(x1 - x2) + Math.abs(y1 - y2);
				},

				// Set food
				setFood: () => {
					let freeCels = helper.body.find("td").not(".snake, .head, .food, .stone");
					while (freeCels.length) {
						let ind		= Math.floor(Math.random()*freeCels.length),
								food	= $(freeCels[ind]),
								pos  	= methods.position(food);
						if (methods.isEscapeRoute(pos)) {
							food.addClass('food');
							helper.food = pos;
							return;
						}
						freeCels.splice(ind, 1);
					}
					methods.ended();
				},

				// Set stones
				setStones: () => {
					for(let i=0; i < $scope.options.stones; i++) {
						let freeCels 	= helper.body.find("td").not(".snake, .head, .food, .stone"),
								stone    	= $(freeCels[Math.floor(Math.random()*freeCels.length)]),
								neighbors = methods.neighbors(methods.position(stone));
						stone.addClass("stone");
						for(let i=0; i<neighbors.length; i++) {
							if (Math.random() < 0.5) $(neighbors[i]).addClass("stone");
						}
					}
				},

				// Get free neighbors
				neighbors: (pos, className="") => {
					let skeleton 	= `td[row="${pos.x-1}"][col="${pos.y}"],
													 td[row="${pos.x+1}"][col="${pos.y}"],
													 td[row="${pos.x}"][col="${pos.y-1}"],
													 td[row="${pos.x}"][col="${pos.y+1}"]`,
							neighbors	= helper.body.find(skeleton).not(`.snake, .head, .stone${className}`);
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
				direction: (from, to) => {
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

					helper.direction = direction;

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
					let skeleton 	= `td[row="${pos.x}"][col="${pos.y}"]`,
							element		= helper.body.find(skeleton);
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
				shineEffect: () => {
					let delay 	= 0,
							length	= helper.snake.body.length;
					for (let i=0; i<length; i++) {
						if (helper.snake.body.length !== length) {
							if (helper.effectID)
								$timeout.cancel(helper.effectID);
							break;
						}
						let pos = helper.snake.body[i];
						helper.effectID = $timeout(() => {
							let cell = helper.body.find(`td[row="${pos.x}"][col="${pos.y}"]`);
							if (cell.length && cell.hasClass('snake') && !cell.hasClass('shine')) {
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

	addFactory(app);

})(window, angular);