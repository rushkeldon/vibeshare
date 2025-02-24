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
 * - using generic types for signal arguments to allow for type safety if desired
 **/

/**
 * Signals can be dispatched and/or subscribed to from anywhere in the app
 * subscribe / unsubscribe usage patterns by case :
 * case :
 *  - In a react component
 *  ```
 *  const { signalName } = getSignalTower();
 *  const [ state, setState ] = useState( signalName.latestArgs[0] ); // start with the latest argument(s)
 *
 *  useEffect( () => {
 *    signalName.add( setState );                   // subscribe to signal - immediately get latest arguments, calling the setState causes a re-render
 *    // this pattern assumes that the state from useState is the same type as the argument(s) (a.k.a. payload) passed to the signal
 *    return () => signalName.remove( setState );   // unsubscribe from the signal when unmounting
 *  }, [ signalName ] );
 *  ```
 */

import signals from 'signals';
import * as logger from '@/utils/logger';

type ExtendedSignal<T = any> = signals.Signal & {
  logLevel?: number;
  latestArgs?: T[];
};

type SignalTowerMethods = {
  setLogLevel : ( logLevel : number ) => void;
  addSignal: <T = any>(name: string, logLevel?: number) => ExtendedSignal<T>;
};

export type SignalTower = {
  [ key : string ] : ExtendedSignal;
} & SignalTowerMethods;

const originalLogLevels : Record<string, number> = {};

const reservedNames = [
  'addSignal',
  'setLogLevel'
];

const createSignal = <T = any>(name: string, logLevel: number): ExtendedSignal<T> => {
  const signal: ExtendedSignal<T> = new signals.Signal() as ExtendedSignal<T>;
  const originalDispatch = signal.dispatch.bind(signal);

  signal.logLevel = logLevel;
  originalLogLevels[name] = logLevel;
  // memorize set to true is key to this implementation
  signal.memorize = true;
  signal.latestArgs = [];

  signal.dispatch = (...args: T[]) => {
    signal.latestArgs = args;
    originalDispatch(...args);
    switch (signal.logLevel) {
      case 1:
        return logger.log(`signal dispatched: ${name}`);
      case 2:
        return logger.log(`signal dispatched: ${name}\n\twith args`, { ...args });
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
    addSignal: <T = any>(name: string, logLevel: number = 0): ExtendedSignal<T> => {
      try {
        if (!name) throw new Error('Signal name is required');
        if (reservedNames.includes(name)) throw new Error(`Signal name ${name} is reserved`);

        return signalTower[name] ?
          signalTower[name] as ExtendedSignal<T> :
          signalTower[name] = createSignal<T>(name, logLevel);
      } catch (e) {
        logger.error('signalTower.addSignal error', e);
        throw new Error(`Failed to add signal with name: ${name}`);
      }
    }
  }
;

global.signalTower = signalTower as SignalTower;
export const getSignalTower = () : SignalTower => signalTower as SignalTower;

/*region adding signals here */
// they can be added from anywhere, but nice to have a one-stop shop

signalTower.addSignal<any>( 'appDataReceived', 2 );
signalTower.addSignal<string>( 'terminalMsgReceived', 2 );
signalTower.addSignal( 'windowFocusChanged', 2 );

/*endregion */


// TODO : may introduce another file signalTowerUtils.ts for utility functions such as snapshots and hydration
