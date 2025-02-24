'use client';

import styles from "./terminal.module.css";
import { useEffect, useState } from 'react';
import { getSignalTower } from '@/data/getSignalTower';

type TerminalProps = {
  msg : string;
}

export default function Terminal( { msg } : TerminalProps) {
  const [ terminalMsg, setTerminalMsg ] = useState<string>( msg );

  const { terminalMsgReceived } = getSignalTower();

  useEffect( () => {
    terminalMsgReceived.add( setTerminalMsg );
    return () => {
      terminalMsgReceived.remove( setTerminalMsg );
    };
  }, [ terminalMsgReceived ] );

  return <pre className={styles.terminal}>{terminalMsg}</pre>
}
