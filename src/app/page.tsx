'use client';

import styles from "./page.module.css";
import { useSignalTower } from '@/hooks/useSignalTower';
import { useEffect, useState } from 'react';
import Terminal from '@/components/Terminal/Terminal';

async function fetchDataAndRender() {
  const dataURL = '/app_data.json';

  try {
    const response = await fetch( dataURL );
    const data = await response.json();

    const { appDataReceived } = useSignalTower();

    appDataReceived.dispatch( data );
  } catch( error ) {
    console.error( 'Error fetching index.json:', error );
  }
}

export default function Home() {
  const { appDataReceived, terminalMsgReceived } = useSignalTower();
  const [ appData, setAppData ] = useState<any>( appDataReceived?.latestArgs?.[0] );
  const [ shouldTerminalDisplay, setShouldTerminalDisplay ] = useState<boolean>( true );
  const [inputValue, setInputValue] = useState<string>('');

  useEffect( () => {
    appDataReceived.add( setAppData );
    fetchDataAndRender();
    return () => {
      appDataReceived.remove( setAppData );
    };
  }, [] );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>VibeShare</h1>
        <p>A showcase for <code>useSignalTower</code></p>
        <div>
          <input
            id="terminalMsg"
            className={styles.input}
            type="text"
            placeholder="msg for the terminal"
            value={inputValue}
            onChange={( e ) => setInputValue( e.target.value )}
          />&nbsp;
          <button
            className={styles.btn}
            onClick={ () => terminalMsgReceived.dispatch( inputValue ) }
          >
            dispatch
          </button>
        </div>
        <button onClick={() => setShouldTerminalDisplay( !shouldTerminalDisplay )}>toggle terminal conditional rendering</button>
        {Boolean( appData && shouldTerminalDisplay ) ? <Terminal msg={appData?.terminalMsg ?? 'no message'}/> : null}
      </main>
    </div>
  );
}
