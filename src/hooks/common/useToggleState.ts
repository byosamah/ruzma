import { useState, useCallback } from 'react';

export const useToggleState = (initialState = false): {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
} => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle
  };
};

export const useMultiToggleState = <T extends string>(keys: T[]) => {
  const [state, setState] = useState<Record<T, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
  );

  const toggle = useCallback((key: T) => {
    setState(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const open = useCallback((key: T) => {
    setState(prev => ({ ...prev, [key]: true }));
  }, []);

  const close = useCallback((key: T) => {
    setState(prev => ({ ...prev, [key]: false }));
  }, []);

  const closeAll = useCallback(() => {
    setState(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
    );
  }, []);

  return {
    state,
    toggle,
    open,
    close,
    closeAll
  };
};