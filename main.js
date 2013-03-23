/**
 * Minesweeper
 * @class
 */
var Minesweeper = (function( document ) {

	var

		/**
		 * Start game
		 * @param {Array}  coords    Width and height
		 * @param {Number} smallSize Size one box
		 */
		initialize = function( coords, smallSize ) {
			cols = this.cols = coords[0];
			this.rows = coords[1];
			this.max = this.cols * this.rows;
			// Count of opened or flagged boxes
			this.count = 0;
			this.smallSize = smallSize;
			this.firstClick = true;

			this.start();
		},

		/**
		 * @constructor
		 * @param {Array}  coords    Width and height
		 * @param {Number} smallSize Size one box
		 */
		ms = function( coords, smallSize ) {
			initialize.call(this, coords, smallSize);
		},

		/** @private */
		cols = 0,

		coordsRow = "row",
		typeKey = "type",
		typeMine = "mine",
		numberKey = "number",
		cssClass = {
			opened: "opened",
			flagged: "flagged"
		},

		workplace = document.getElementById("workplace"),

		/** Game actions */
		action = ms.prototype.action = {

			/** User lost */
			gameOver: function() {
				alert("Game Over!");
				fn.cleanWorkplaceNode();
			},

			/** User won */
			win: function() {
				alert("You win!");
				fn.cleanWorkplaceNode();
			},

			/** User start */
			start: function() {
				this.makePlace();
				this.addControlers();
			}
		},

		/** Additional private functions */
		fn = ms.prototype.fn = {

			/** Remove all workplace listeners */
			cleanWorkplaceNode: function() {
				workplace.parentNode.replaceChild(workplace.cloneNode(true), workplace);
				workplace = document.getElementById("workplace");
			},

			/**
			 * Include unique item to array
			 * @param  {Array} array
			 * @param          element
			 * @return {Array}
			 */
			includeUnique: function( array, element ) {
				if ( array.indexOf(element) === -1 ) {
					array.push(element);
				}

				return array;
			},

			/**
			 * Remove duplicate items of array
			 * @param  {Array} obj
			 * @return {Array}
			 */
			unique: function( obj ) {
				var arr = obj.concat();

				for ( var i = 0; i < arr.length; ++i ) {
						for ( var j = i + 1; j < arr.length; ++j ) {
								if ( arr[i] === arr[j] ) {
									arr.splice(j--, 1);
								}
						}
				}

				return arr;
			},

			/**
			 * Get neighbors elements
			 * @param  {Number} id
			 * @return {Array}
			 */
			getNeighbors: function( id ) {
				var childs = workplace.children,
					rowId = Math.ceil(id / cols),
					elems = [];

				// Because in our system start position is 1
				id = id - 1;

				var addElem = function( elem, k ) {
					if ( elem && elem.dataset[coordsRow] == (rowId + k) ) {
						elems.push(elem);
					}
				};

				for ( var k = -1; k <= 1; k++ ) {
					var l = id + (cols * k)

					// Top
					addElem(childs[l - 1], k);

					// Siblings
					if ( k !== 0 ) {
						addElem(childs[l], k);
					}

					// Bottom
					addElem(childs[l + 1], k);
				}

				return elems;
			}
		};

	/** Add boxes to #workplace */
	ms.prototype.makePlace = function() {
		var html = "";

		for ( var r = 0; r < this.rows; r++ ) {
			for ( var c = 0; c < this.cols; c++ ) {
				html += "<div data-" + coordsRow + "=\"" + (r + 1) + "\" data-" + numberKey + "=\"" + (r * this.cols + c + 1) + "\" data-" + typeKey + "=\"0\"></div>"
			}
		}

		workplace.style.width = this.smallSize * this.cols + "px";
		workplace.style.height = this.smallSize * this.rows + "px";
		workplace.innerHTML = html;
	};

	/**
	 * Lay mines
	 * @param  {Array} notMines Array of forbidden places
	 */
	ms.prototype.layMines = function( notMines ) {
		// 10% of all boxes are mines
		var countOfMines = Math.ceil(this.max * 0.1);
		var array = [];

		while ( array.length < countOfMines ) {
			var id = Math.floor(Math.random() * this.max) + 1;

			if ( notMines.indexOf(id) === -1 ) {
				fn.includeUnique(array, id);
			}
		}

		for ( var i = 0, l = array.length; i < l; i++ ) {
			workplace.children[array[i] - 1].dataset[typeKey] = typeMine;
		}
	};

	/**
	 * Number of surrounding mines
	 * @private
	 * @param  {Number} id
	 * @return {Number}
	 */
	var numberOfNeighboringMine = function( id ) {
		var neighbors = fn.getNeighbors(id);
		var count = 0;

		for ( var i = 0, l = neighbors.length; i < l; i++ ) {
			if ( neighbors[i].dataset[typeKey] === typeMine ) {
				count++;
			}
		}

		return count;
	};

	/**
	 * Open zero elements
	 * @param  {Number} id Identifier of start position to open zero
	 */
	ms.prototype.openZero = function( id ) {
		var zero = [];
		var around = [];

		var openAll = function( id ) {
			zero.push(id);

			var neighbors = fn.getNeighbors(id);
			for ( var i = 0, l = neighbors.length; i < l; i++ ) {
				var id = neighbors[i].dataset[numberKey];
				fn.includeUnique(around, id);

				if ( numberOfNeighboringMine(id) === 0 && zero.indexOf(id) == -1 ) {
					openAll(id);
				}
			}
		};

		openAll(id);

		// Need open all elems by ids
		var ids = fn.unique([].concat(zero, around));

		for ( var i = 0, l = ids.length; i < l; i++ ) {
			var elem = workplace.children[ids[i] - 1];
			var count = numberOfNeighboringMine(ids[i]);

			if ( count != 0 ) {
				elem.innerHTML = count;
			}

			elem.classList.add(cssClass.opened);
			elem.classList.remove(cssClass.flagged);
		}
	};

	/** User opened mines */
	ms.prototype.openMines = function( id ) {
		var nodes = workplace.querySelectorAll("[data-" + typeKey + "=mine" + "]");

		for ( var i = 0, l = nodes.length; i < l; i++ ) {
			nodes[i].classList.add(cssClass.opened);
		}

		this.lose();
	};

	/** Check count of opened or flagged boxes */
	ms.prototype.checkCount = function() {
		this.count = workplace.querySelectorAll("." + cssClass.opened + ", ." + cssClass.flagged).length;

		if ( this.count >= this.max - 1 ) {
			var mines = workplace.querySelectorAll("." + cssClass.flagged);
			var isWin = true;

			// Check correct flagged
			for ( var i = 0, l = mines.length; i < l; i++ ) {
				if ( mines[i].dataset[typeKey] !== typeMine ) {
					isWin = false;
					break;
				}
			}

			if ( isWin ) {
				this.win();
			}
		}
	};

	/** Add listeners to #workplace */
	ms.prototype.addControlers = function() {
		var that = this,
			openBox = function( e ) {
				var elem = e.target,
					id = parseInt(elem.dataset[numberKey]);

				// Avoid mines on first click
				if ( that.firstClick ) {
					that.layMines([].concat(fn.getNeighbors(id), id));
					that.firstClick = false;
				}

				if ( elem.classList.contains(cssClass.flagged) ) {
					return;
				}

				if ( elem.dataset[typeKey] === typeMine ) {
					that.openMines();

				} else {
					var count = numberOfNeighboringMine(id);

					if ( count == 0 ) {
						that.openZero(id);

					} else {
						elem.innerHTML = count;
					}

					elem.classList.add(cssClass.opened);
					that.checkCount();
				}
			},
			timerWait,
			isWait = false,
			waited = function() {
				isWait = true;
				clearTimeout(timerWait);
				this.classList.toggle(cssClass.flagged);
				that.checkCount();
			},
			mouseup = function( e ) {
				e.preventDefault();
				e.stopPropagation();

				clearTimeout(timerWait);
				if ( isWait === false ) {
					openBox(e);
				}
				isWait = false;
			},
			mousedown = function( e ) {
				e.preventDefault();
				e.stopPropagation();

				timerWait = setTimeout(waited.bind(e.target), 200);
				return false
			},
			contextmenu = function( e ) {
				e.preventDefault();
				e.stopPropagation();

				waited.call(e.target);
			};

		workplace.addEventListener("mouseup", mouseup, false);
		workplace.addEventListener("mousedown", mousedown, false);
		workplace.addEventListener("contextmenu", contextmenu, false);

		workplace.addEventListener("touchend", mouseup, false);
		workplace.addEventListener("touchstart", mousedown, false);
	};

	/**
	 * Refresh game
	 * @param  {Array}  coords
	 * @param  {Number} smallSize
	 */
	ms.prototype.refresh = function( coords, smallSize ) {
		fn.cleanWorkplaceNode();
		initialize.call(this, coords, smallSize);
	};

	ms.prototype.start = action.start;
	ms.prototype.lose = action.gameOver;
	ms.prototype.win = action.win;

	return ms;

}( document ));
