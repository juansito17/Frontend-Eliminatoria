'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

interface ConfirmContextType {
  showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const showConfirm = (msg: string, opts: ConfirmOptions = {}): Promise<boolean> => {
    setMessage(msg);
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    if (resolver) {
      resolver(result);
      setResolver(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {options.title || 'Confirmar acción'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {options.description || message}
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  {options.confirmText || 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.showConfirm;
}
