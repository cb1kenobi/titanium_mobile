/**
 * @project Titanium Mobile Web
 * @module Ti/UI/2DMatrix
 * @requires module:Ti/_/declare, module:Ti/_/Evented, module:Ti/Platform
 * @author Chris Barber <cbarber@appcelerator.com>
 * @author Bryan Hughes <bhughes@appcelerator.com>
 * @copyright Copyright (c) 2010-2012 by Appcelerator, Inc. All Rights Reserved.
 * @license Apache Version 2 <http://www.apache.org/licenses/LICENSE-2.0>
 */

define(["Ti/_/declare", "Ti/_/Evented", "Ti/Platform"],
	function(declare, Evented, Platform) {

	var api,
		isFF = Platform.runtime === "gecko",
		px = function(x) {
			return isFF ? x + "px" : x;
		};

	/**
	 * Computes the minor determinant.
	 * @return {Number}
	 */
	function detMinor(y, x, m) {
		var x1 = x == 0 ? 1 : 0,
			x2 = x == 2 ? 1 : 2,
			y1 = y == 0 ? 1 : 0,
			y2 = y == 2 ? 1 : 2;
		return (m[y1][x1] * m[y2][x2]) - (m[y1][x2] * m[y2][x1]);
	}

	/**
	 * Multiplies a given matrix by specific matrix components.
	 * @param {Ti.UI.2DMatrix} matrix - The source matrix to multiply
	 * @param {Number} a - The first row, first column matrix value
	 * @param {Number} b - The first row, second column matrix value
	 * @param {Number} c - The second row, first column matrix value
	 * @param {Number} d - The second row, second column matrix value
	 * @param {Number} tx - The first row, third column matrix value
	 * @param {Number} ty - The second row, third column matrix value
	 * @param {Number} angle - The angle in degrees to rotate the matrix
	 * @return {Object}
	 */
	function mult(matrix, a, b, c, d, tx, ty, angle) {
		return {
			a: matrix.a * a + matrix.b * c,
			b: matrix.a * b + matrix.b * d,
			c: matrix.c * a + matrix.d * c,
			d: matrix.c * b + matrix.d * d,
			tx: matrix.a * tx + matrix.b * ty + matrix.tx,
			ty: matrix.c * tx + matrix.d * ty + matrix.ty,
			rotation: matrix.rotation + (r | 0)
		};
	}

	/**
	 * A 2D tranform matrix for animating UI elements.
	 * @class Ti.UI.2DMatrix
	 * @extends Ti._.Evented
	 */
	return api = declare("Ti.UI.2DMatrix", Evented, {
		properties: {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			tx: 0,
			ty: 0,
			rotation: 0
		},

		/**
		 * Creates an instances of a 2D matrix.
		 * @constructor
		 * @param {Ti.UI.2DMatrix} [matrix] - A 2D matrix to initialize the new 2D matrix with
		 */
		constructor: function(matrix) {
			matrix && require.mix(this, matrix);
		},

		/**
		 * Inverts the current matrix and returns it as a new 2D matrix instance.
		 * @return {Ti.UI.2DMatrix}
		 */
		invert: function() {
			var x = 0,
				y = 0,
				m = [[this.a, this.b, this.tx], [this.c, this.d, this.ty], [0, 0, 1]],
				n = m,
				det = this.a * detMinor(0, 0, m) - this.b * detMinor(0, 1, m) + this.tx * detMinor(0, 2, m);

			if (Math.abs(det) > 1e-10) {
				det = 1.0 / det;
				for (; y < 3; y++) {
					for (; x < 3; x++) {
						n[y][x] = detMinor(x, y, m) * det;
						(x + y) % 2 == 1 && (n[y][x] = -n[y][x]);
					}
				}
			}

			return new api(mult(this, n[0][0], n[0][1], n[1][0], n[1][1], n[0][2], n[1][2]));
		},

		/**
		 * Multiplies two matrices together and returns it as a new 2D matrix instance.
		 * @param {Ti.UI.2DMatrix} other - A 2D Matrix to multiplay with this matrix
		 * @return {Ti.UI.2DMatrix}
		 */
		multiply: function(other) {
			return new api(mult(this, other.a, other.b, other.c, other.d, other.tx, other.ty, other.rotation));
		},

		/**
		 * Rotates the current matrix and returns it as a new 2D matrix instance.
		 * @param {Number} angle - The angle in degrees to rotate this matrix
		 * @return {Ti.UI.2DMatrix}
		 */
		rotate: function(angle) {
			return new api({ a: this.a, b: this.b, c: this.c, d: this.d, tx: this.tx, ty: this.ty, rotation: this.rotation + angle });
		},

		/**
		 * Scales the current matrix and returns it as a new 2D matrix instance.
		 * @param {Number} x - The multiplier to scale this matrix in the x-axis
		 * @param {Number} y - The multiplier to scale this matrix in the y-axis
		 * @return {Ti.UI.2DMatrix}
		 */
		scale: function(x, y) {
			return new api(mult(this, x, 0, 0, y, 0, 0));
		},

		/**
		 * Translates the current matrix and returns it as a new 2D matrix instance.
		 * @param {Number} x - The number of units to translate this matrix in the x-axis
		 * @param {Number} y - The number of units to translate this matrix in the y-axis
		 * @return {Ti.UI.2DMatrix}
		 */
		translate: function(x, y) {
			return new api(mult(this, 0, 0, 0, 0, x, y));
		},

		/**
		 * Serializes the current matrix into a CSS matrix and rotate 2D transform.
		 * @return {String}
		 */
		toCSS: function() {
			var i = 0,
				v = [this.a, this.b, this.c, this.d, this.tx, this.ty];
	
			for (; i < 6; i++) {
				v[i] = v[i].toFixed(6);
				i > 4 && (v[i] = px(v[i]));
			}

			return "matrix(" + v.join(",") + ") rotate(" + this.rotation + "deg)";
		}

	});

});
