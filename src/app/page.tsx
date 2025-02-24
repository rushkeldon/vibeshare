'use client';

import styles from "./page.module.css";
import { getSignalTower } from '@/data/getSignalTower';
import { useEffect, useState } from 'react';
import Terminal from '@/components/Terminal/Terminal';

async function fetchDataAndRender() {
  const dataURL = '/app_data.json';

  try {
    const response = await fetch( dataURL );
    const data = await response.json();

    //
    const { appDataReceived } = getSignalTower();

    appDataReceived.dispatch( data );
  } catch( error ) {
    console.error( 'Error fetching index.json:', error );
  }
}

export default function Home() {
  const { appDataReceived, terminalMsgReceived } = getSignalTower();
  const [ appData, setAppData ] = useState<any>( null );
  const [ shouldTerminalDisplay, setShouldTerminalDisplay ] = useState<boolean>( true );
  const [ inputValue, setInputValue ] = useState<string>( '' );

  useEffect( () => {
    appDataReceived.add( setAppData );
    fetchDataAndRender();
    return () => {
      appDataReceived.remove( setAppData );
    };
  }, [ appDataReceived ] );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>VibeShare</h1>
        <p>A showcase for <code>useSignalTower</code><br/>
        The Terminal component is a child to this Home component in src/app/page.tsx<br/>
          It is conditionally rendered based on the state of <code>shouldTerminalDisplay</code> which is toggled by the button below.<br/>
            The Home component is re-rendered when any of these three states are updated (useSate) <code>appData</code>, <code>shouldTerminalDisplay</code>, <code>inputValue</code> (onChange).<br/>
              The terminal is passed an initial prop <code>appData?.terminalMsg ?? 'no message'</code>.<br/>
                However the Terminal subscribes to the signal <code>terminalMsgReceived</code> and re-renders whenever a new message is dispatched.<br/>
                  You can change the message by clicking the 'dispatch' button as many times as you like.<br/>
                    It doesn't matter when the Terminal is rendered - it always displays the latest message.</p>
                      <a href="https://github.com/rushkeldon/vibeshare/blob/main/src/data/getSignalTower.ts">check out the code</a>
                    <div>
                  <input
                    id="terminalMsg"
                    className={styles.input}
                    type="text"
                    placeholder="msg for the terminal"
                    value={inputValue} onChange={( e ) => setInputValue( e.target.value )}/>&nbsp;
                  <button className={styles.btn} onClick={() => terminalMsgReceived.dispatch( inputValue )}>
                    dispatch
                  </button>
                </div>
                <button className={styles.btn} onClick={() => setShouldTerminalDisplay( !shouldTerminalDisplay )}>toggle shouldTerminalDisplay</button>
                {Boolean( appData && shouldTerminalDisplay ) ? <Terminal msg={appData?.terminalMsg ?? 'no message'}/> : null}
      </main>
    </div>
  );
}
