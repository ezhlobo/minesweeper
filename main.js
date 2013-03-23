/**
 * Minesweeper
 * @class
 */
var Minesweeper = (function() {

  function ms( coords, smallSize ) {
    cols = this.cols = coords[0];
    this.rows = coords[1];
    this.max = this.cols * this.rows;
    this.count = 0;
    this.smallSize = smallSize;
    this.start();
  }

  var
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

    action = ms.prototype.action = {
      gameOver: function() {
        alert("Game Over!");
        workplace.parentNode.replaceChild(workplace.cloneNode(true), workplace);
      },
      win: function() {
        alert("You win!");
        workplace.parentNode.replaceChild(workplace.cloneNode(true), workplace);
      },
      start: function() {
        this.makePlace();
        this.layMines();
        this.addControlers();
      }
    },

    fn = ms.prototype.fn = {
      includeUnique: function( array, element ) {
        if ( array.indexOf(element) === -1 ) {
          array.push(element);
        }

        return array;
      },
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
      getNeighbors: function( id ) {
        var childs = workplace.children,
          rowId = Math.ceil(id / cols),
          elems = [];

        id = id - 1;

        var addElem = function( elem, row ) {
          if ( elem && elem.dataset[coordsRow] == (rowId + row) ) {
            elems.push(elem);
          }
        };

        for ( var k = -1; k <= 1; k++ ) {
          addElem(childs[id + (cols*k) -1], k);
          if ( k !== 0 ) {
            addElem(childs[id + (cols*k)], k);
          }
          addElem(childs[id + (cols*k) +1], k);
        }

        return elems;
      }
    };

  ms.prototype.makePlace = function() {
    var html = "";

    for ( var r = 0; r < this.rows; r++ ) {
      for ( var c = 0; c < this.cols; c++ ) {
        html += "<div data-"+coordsRow+"=\""+(r+1)+"\" data-"+numberKey+"=\""+(r * this.cols + c + 1)+"\" data-"+typeKey+"=\"0\"></div>"
      }
    }

    workplace.style.width = this.smallSize * this.cols + "px";
    workplace.style.height = this.smallSize * this.rows + "px";
    workplace.innerHTML = html;
  };

  ms.prototype.layMines = function() {
    var countOfMines = Math.ceil(this.max * 0.1);
    var array = [];

    while ( array.length < countOfMines ) {
      fn.includeUnique(array, Math.floor(Math.random() * this.max) + 1);
    }

    for ( var i = 0, l = array.length; i < l; i++ ) {
      workplace.children[array[i]-1].dataset[typeKey] = typeMine;
    }
  };

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

    ids = fn.unique([].concat(zero, around));

    for ( var i = 0, l = ids.length; i < l; i++ ) {
      var elem = workplace.children[ids[i]-1];
      var count = numberOfNeighboringMine(ids[i]);

      if ( count != 0 ) {
        elem.innerHTML = count;
      }

      elem.classList.add(cssClass.opened);
      elem.classList.remove(cssClass.flagged);
    }
  };

  ms.prototype.openMine = function( id ) {
    var nodes = workplace.querySelectorAll("[data-" + typeKey + "=mine" + "]");

    for ( var i = 0, l = nodes.length; i < l; i++ ) {
      nodes[i].classList.add(cssClass.opened);
    }

    this.lose();
  };

  ms.prototype.checkCount = function() {
    this.count = workplace.querySelectorAll("." + cssClass.opened + ", ." + cssClass.flagged).length;

    if ( this.count >= this.max - 1 ) {
      var mines = workplace.querySelectorAll("."+cssClass.flagged);
      var isWin = true;

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

  ms.prototype.addControlers = function() {
    var that = this,
      openBox = function( e ) {
        var elem = e.target,
          id = parseInt(elem.dataset[numberKey]);

        if ( elem.classList.contains(cssClass.flagged) ) {
          return;
        }

        if ( elem.dataset[typeKey] === typeMine ) {
          that.openMine(id);

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
        clearTimeout(timerWait);
        isWait = true;
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

  ms.prototype.start = action.start;
  ms.prototype.lose = action.gameOver;
  ms.prototype.win = action.win;

  return ms;
}());


var
  width = 10,
  height = 10,
  boxSizePx = 30,

  // Let's go
  minesweeper = new Minesweeper([width, height], boxSizePx);
