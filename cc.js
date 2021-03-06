'use strict';

// Analyze the code by inserting counting functions between each line.
const code = `
function fib2(n) {
  var fiber = { arg: n, returnAddr: null, a: 0 /* b is tail call */ };
  rec: while (true) {
    if (fiber.arg <= 2) {
      var sum = 1;
      while (fiber.returnAddr) {
        fiber = fiber.returnAddr;
        if (fiber.a === 0) {
          fiber.a = sum;
          fiber = { arg: fiber.arg - 2, returnAddr: fiber, a: 0 };
          continue rec;
        }
        sum += fiber.a;
      }
      return sum;
    } else {
      fiber = { arg: fiber.arg - 1, returnAddr: fiber, a: 0 };
    }
  }
}

// Run the code.
fib2( 5 );
`;

// Unique id, incremented by `createCounterFn`.
let lineId = 0;

// Counter function as a string, with unique id.
function createCounterFn() {
	return `\n___cnt( ${ lineId++ } );\n`;
}

// The one and only amazing leftpad.
function leftpad( text, count ) {
	text = '' + text;
	count = +count;

	let padding = (count - text.length) || 1;

	return new Array( padding + 1 ).join(' ') + text;
}

// Each line of code has unique id, which is used as the key here.
let COUNTERS = {};

// Counting function injected into evaluated code. The `id` is generated by `createCounterFn()`.
function ___cnt( id ) {
	COUNTERS[ id ] = !COUNTERS[ id ] ? 1 : COUNTERS[ id ]+1;
}

// Prepare code by injecting counting function.
let countedCode = code.
	split( '\n' ).
	filter( line => line ).
	map( line => {
		return createCounterFn() + line;
	} )
	.join( '' );

// Run code with interwined counters.
eval( countedCode );

// Find biggest counter.
const topCount = Math.max.apply( Math, Object.values( COUNTERS ) );
// For padding the bars.
const graphPadding = 10;
// For padding counter number of each line. Take biggest number's length as a text.
const counterPadding = ( '' + topCount ).length + 1;

let i = 0;

// Prepare output "chart".
// Remove injected functions, prepend counters and hashes.
const chart = countedCode.
	split( '\n' ).
	filter( line => line && !line.startsWith( '___cnt(' ) ).
	map( line => {
		// Not every counter will be incremented. Prepare for that.
		const count = COUNTERS[ i++ ] || 0;
		// Top counter is 100%, scale the bar to reflect that.
		const bar = new Array( Math.round( count / topCount * graphPadding ) ).join( '#' )  ;

		// Line of code with padded counter and bar.
		return leftpad( count, counterPadding ) + ' ' + leftpad( bar, graphPadding ) + ' ' + line;
	} ).
	join('\n');

// Show the results.
console.log( chart );