'use client';

import styles from "./terminal.module.css";
import { useEffect, useState } from 'react';
import { getSignalTower } from '@/data/getSignalTower';

export default function Terminal() {
  const { terminalMsgReceived } = getSignalTower();
  const [ terminalMsg, setTerminalMsg ] = useState( terminalMsgReceived.getLatest() );


  useEffect( () => {
    terminalMsgReceived.add( setTerminalMsg );
    return () => {
      terminalMsgReceived.remove( setTerminalMsg );
    };
  }, [ terminalMsgReceived ] );

  return <pre className={styles.terminal}>{terminalMsg}</pre>
}
