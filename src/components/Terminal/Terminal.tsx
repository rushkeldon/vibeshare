'use client';

import styles from "./terminal.module.css";
import { useEffect, useState } from 'react';
import { useSignalTower } from '@/hooks/useSignalTower';

type TerminalProps = {
  msg : string;
}

export default function Terminal( { msg } : TerminalProps) {
  const [ terminalMsg, setTerminalMsg ] = useState( msg );

  const { terminalMsgReceived } = useSignalTower();

  useEffect( () => {
    terminalMsgReceived.add( setTerminalMsg );
    return () => {
      terminalMsgReceived.remove( setTerminalMsg );
    };
  }, [] );

  return <pre className={styles.terminal}>{terminalMsg}</pre>
}
