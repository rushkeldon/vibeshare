export const levels = {
  LOG : 1,
  DEBUG : 2,
  INFO : 3,
  WARN : 4,
  ERROR : 5,
  OFF : 100
};

let level : number = levels.LOG;

// @ts-ignore
const noop = ( msg : any, val : any = {} ) => null;

export let error = noop;
export let warn = noop;
export let info = noop;
export let debug = noop;
export let log = noop;

export const tracer = ( msg : string, clr : string = 'green' ) => {
  console.log( `%c[vibe] ${ msg }`, `color : ${ clr }; font-weight : bold;` );
}

function logFactory( levelKey: string ) {
  return level > levels[ levelKey ] ? noop : boundLogger( levelKey );
}

function boundLogger( logLevel: string ) {
  return global.console[ logLevel.toLowerCase() ].bind( global.console, '[hyperslides]' );
}

export function setLevel( newLevel: number ) {
  level = newLevel;
  init();
}

function init() : any {
  error = logFactory( 'ERROR' );
  warn = logFactory( 'WARN' );
  info = logFactory( 'INFO' );
  debug = logFactory( 'DEBUG' );
  log = logFactory( 'LOG' );
}

setLevel( levels.LOG );
