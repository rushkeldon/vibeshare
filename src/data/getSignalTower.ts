/**
 * getSignalTower provides a client-side data store with signals for communication
 * between any components of a web app (React or otherwise).
 * Signals are like events, but faster, and better.
 * See https://millermedeiros.github.io/js-signals/ for more info.
 * global.signalTower is added for easy access globally.
 * The goal of this library is to be a Redux replacement - a full data store.
 * It has these features :
 * - unidirectional data flow
 * - signals for communication between components (React or otherwise)
 * - logging levels for each signal
 * - setting log level for all signals : setLogLevel( 2 );
 * - resetting all signals logging level to their original levels : setLogLevel();
 **/

/**
 * Signals can be dispatched and/or subscribed to from anywhere in the app
 * subscribe / unsubscribe usage patterns by case :
 * case :
 *  - In a react component
 *  ```
 *  const { signalName } = getSignalTower();
 *  const [ state, setState ] = useState( signalName.getLatest() ); // start with the latest argument(s)
 *
 *  useEffect( () => {
 *    signalName.add( setState );                   // subscribe to signal - immediately get latest arguments, calling the setState causes a re-render
 *    return () => signalName.remove( setState );   // unsubscribe from the signal when unmounting
 *  }, [ signalName ] );
 *  ```
 */

import signals from 'signals';
import * as logger from '@/utils/logger';

type ExtendedSignal = signals.Signal & {
  logLevel? : number;
  getLatest : () => any[];
};

type SignalTowerMethods = {
  setLogLevel : ( logLevel : number ) => void;
  addSignal : ( name : string, logLevel : number ) => ExtendedSignal;
};

export type SignalTower = {
  [ key : string ] : ExtendedSignal;
} & SignalTowerMethods;

const originalLogLevels : Record<string, number> = {};

const reservedNames = [
  'addSignal',
  'setLogLevel'
];

const createSignal = ( name : string, logLevel ) : ExtendedSignal => {
  const signal : ExtendedSignal = new signals.Signal() as ExtendedSignal;
  const originalDispatch = signal.dispatch.bind( signal );

  signal.logLevel = logLevel;
  originalLogLevels[ name ] = logLevel;
  /*  memorize is super key : this allows the signal to be dispatched immediately to new listeners only with the last argument(s) */
  signal.memorize = true;

  // retrieves the latest dispatched value thanks to memorize
  signal.getLatest = () => {
    let latestValue: any[] = [];
    signal.addOnce((...args) => latestValue = args );
    return latestValue;
  };

  signal.dispatch = ( ...args : any[] ) => {
    originalDispatch( ...args );
    switch( signal.logLevel ) {
      case 1:
        return logger.log( `signal dispatched : ${name}` );
      case 2:
        return logger.log( `signal dispatched : ${name}\n\twith args`, { ...args } );
    }
  };
  return signal;
};

const signalTower = {
    // sets or resets (-1) the logging level of all signals in the signalTower
    setLogLevel : ( logLevel : number = -1 ) => {
      Object.keys( signalTower ).forEach( ( key ) => {
        const signal = signalTower[ key ] as ExtendedSignal;
        if( signal.hasOwnProperty( 'logLevel' ) ) {
          signal.logLevel = logLevel !== -1 ? logLevel : originalLogLevels[ key ] ?? 0;
        }
      } );
    },
    // adds a signal to the signalTower (if doesn't exist) and returns it (or the pre-existing signal)
    addSignal : ( name : string, logLevel : number = 0 ) : ExtendedSignal => {
      try {
        if( !name ) throw new Error( 'Signal name is required' );
        if( reservedNames.includes( name ) ) throw new Error( `Signal name ${name} is reserved` );

        return signalTower[ name ] ?
          signalTower[ name ] :
          signalTower[ name ] = createSignal( name, logLevel );
      } catch( e ) {
        logger.error( 'signalTower.addSignal error', e );
        throw new Error( `Failed to add signal with name : ${name}` );
      }
    }
  }
;

global.signalTower = signalTower as SignalTower;
export const getSignalTower = () : SignalTower => signalTower as SignalTower;

/*region adding signals here */
// they can be added from anywhere, but nice to have a one-stop shop

signalTower.addSignal( 'appDataReceived', 2 );
signalTower.addSignal( 'terminalMsgReceived', 2 );
signalTower.addSignal( 'windowFocusChanged', 2 );

/*endregion */


// TODO : may introduce another file signalTowerUtils.ts for utility functions such as snapshots and hydration
