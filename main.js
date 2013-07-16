(function( window ) {

	var
		_proto = "prototype",

		extend = function( obj, target ) {
			var key;

			for ( key in target ) {
				if ( target.hasOwnProperty( key ) ) {
					obj[ key ] = target[ key ];
				}
			}

			return obj;
		};

	window.minesweeper = window.minesweeper || (function() {

		var
			txt = {
				classOpened: "openned",
				classFlagged: "flagged",
				attrRow: "data-row",
				attrCol: "data-col",
				attrId: "data-id"
			};

		function minesweeper( elementId, opts ) {
			var that = this;

			// Merge new options with defaults
			extend( that.opts, opts );

			that.workplace = window.document.getElementById( elementId );

			that.start();
		}

		// Default options
		minesweeper[ _proto ].opts = {
			count: 6,
			oneCellSize: 30,
			longClickTime: 200
		};

		minesweeper[ _proto ].start = function() {
			var that = this;

			that.load.place    .call( that );
			that.load.handlers .call( that );
		};

		minesweeper[ _proto ].load = {
			place: function() {
				var that = this;

				var count = that.opts.count;
				var html = "";
				var k = 0;

				for ( var row = 1; row <= count; row++ ) {
					for ( var col = 1; col <= count; col++ ) {
						html += "<div " + txt.attrRow + "='" + row + "' " + txt.attrCol + "='" + col + "' " + txt.attrId + "='" + k++ + "'></div>\n";
					}
	 			}

	 			that.workplace.innerHTML = html;
	 			that.workplace.style.width = that.opts.oneCellSize * count + "px";
			},
			handlers: function() {
				var that = this;
				var workplace = that.workplace;

				var timerWait;
				var isWaited = false;

				var waited = function() {
					isWaited = true;
					clearTimeout( timerWait );

					that.actions.flag.call( that, this );
				};

				var mouseup = function( e ) {
					e.preventDefault();
					e.stopPropagation();

					clearTimeout( timerWait );

					if ( isWaited === false ) {
						that.actions.open.call( that, e.target );
					}
					isWaited = false;
				};
				var mousedown = function( e ) {
					e.preventDefault();
					e.stopPropagation();

					timerWait = setTimeout( waited.bind( e.target ), that.opts.longClickTime );

					return false;
				};
				var contextmenu = function( e ) {
					e.preventDefault();
					e.stopPropagation();

					waited.call( e.target );
				};

				workplace.addEventListener( "mouseup", mouseup, false );
				workplace.addEventListener( "mousedown", mousedown, false );
				workplace.addEventListener( "contextmenu", contextmenu, false );

				// @TODO: Add touch events
			},
			mines: function() {}
		};

		minesweeper[ _proto ].actions = {
			open: function( elem ) {
				// @TODO
				debug("actions.open")
			},
			flag: function( elem ) {
				// @TODO
				debug("actions.flag")
			}
		};

		function debug ( txt ) {
			console.log( "minesweeper." + txt );
		}

		return minesweeper;

	})();

})( window );
