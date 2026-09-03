import { useState, useEffect } from 'react';
import { networkHandler, NetworkState } from '../utils/network';

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>(networkHandler.getState());

  useEffect(() => {
    const unsub = networkHandler.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, []);

  return state;
}
