import { useState, useCallback } from 'react';

interface DialogState {
  [key: string]: boolean;
}

interface DialogConfig {
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

interface UseDialogManagerReturn {
  // State
  dialogs: DialogState;
  
  // Actions
  openDialog: (key: string, config?: DialogConfig) => void;
  closeDialog: (key: string) => void;
  toggleDialog: (key: string, config?: DialogConfig) => void;
  closeAllDialogs: () => void;
  
  // Queries
  isDialogOpen: (key: string) => boolean;
  getOpenDialogs: () => string[];
  hasOpenDialogs: () => boolean;
  
  // Event handlers
  handleEscapeKey: () => void;
  
  // Helper for creating dialog props
  getDialogProps: (key: string) => {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
}

export const useDialogManager = (initialState: DialogState = {}): UseDialogManagerReturn => {
  const [dialogs, setDialogs] = useState<DialogState>(initialState);
  const [dialogConfigs, setDialogConfigs] = useState<Record<string, DialogConfig>>({});

  const openDialog = useCallback((key: string, config?: DialogConfig) => {
    if (config) {
      setDialogConfigs(prev => ({ ...prev, [key]: config }));
    }
    
    setDialogs(prev => ({ ...prev, [key]: true }));
    
    // Call onOpen callback if provided
    config?.onOpen?.();
  }, []);

  const closeDialog = useCallback((key: string) => {
    setDialogs(prev => ({ ...prev, [key]: false }));
    
    // Call onClose callback if provided
    const config = dialogConfigs[key];
    config?.onClose?.();
  }, [dialogConfigs]);

  const toggleDialog = useCallback((key: string, config?: DialogConfig) => {
    const isOpen = dialogs[key];
    if (isOpen) {
      closeDialog(key);
    } else {
      openDialog(key, config);
    }
  }, [dialogs, openDialog, closeDialog]);

  const closeAllDialogs = useCallback(() => {
    const openDialogKeys = Object.keys(dialogs).filter(key => dialogs[key]);
    
    openDialogKeys.forEach(key => {
      const config = dialogConfigs[key];
      config?.onClose?.();
    });
    
    setDialogs(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  }, [dialogs, dialogConfigs]);

  const isDialogOpen = useCallback((key: string) => {
    return Boolean(dialogs[key]);
  }, [dialogs]);

  const getOpenDialogs = useCallback(() => {
    return Object.keys(dialogs).filter(key => dialogs[key]);
  }, [dialogs]);

  const hasOpenDialogs = useCallback(() => {
    return Object.values(dialogs).some(Boolean);
  }, [dialogs]);

  // Handle escape key to close topmost dialog
  const handleEscapeKey = useCallback(() => {
    const openDialogKeys = getOpenDialogs();
    if (openDialogKeys.length) {
      const topMostDialog = openDialogKeys[openDialogKeys.length - 1];
      const config = dialogConfigs[topMostDialog];
      
      if (config?.closeOnEscape !== false) {
        closeDialog(topMostDialog);
      }
    }
  }, [getOpenDialogs, closeDialog, dialogConfigs]);

  return {
    // State
    dialogs,
    
    // Actions
    openDialog,
    closeDialog,
    toggleDialog,
    closeAllDialogs,
    
    // Queries
    isDialogOpen,
    getOpenDialogs,
    hasOpenDialogs,
    
    // Event handlers
    handleEscapeKey,
    
    // Helper for creating dialog props
    getDialogProps: (key: string) => ({
      open: isDialogOpen(key),
      onOpenChange: (open: boolean) => {
        if (open) {
          openDialog(key);
        } else {
          closeDialog(key);
        }
      }
    })
  };
};