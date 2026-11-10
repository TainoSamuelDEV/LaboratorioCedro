'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: 'bottom' | 'left' | 'right';
}

const DrawerContext = createContext<DrawerContextValue>({
  open: false,
  onOpenChange: () => {},
  direction: 'bottom',
});

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function Drawer({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  direction = 'bottom',
  children,
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <DrawerContext.Provider value={{ open, onOpenChange: handleOpenChange, direction }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({
  children,
  asChild = false,
  className = '',
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  const { onOpenChange } = useContext(DrawerContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        onOpenChange(true);
      },
    });
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)} className={className}>
      {children}
    </button>
  );
}

export function DrawerClose({
  children,
  asChild = false,
  className = '',
}: {
  children?: React.ReactNode;
  asChild?: boolean;
  className?: string;
}) {
  const { onOpenChange } = useContext(DrawerContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        onOpenChange(false);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={
        className ||
        'inline-flex items-center justify-center rounded-lg border border-[#E3E3E3] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#323232] hover:bg-[#F3F3F3] transition-colors cursor-pointer'
      }
    >
      {children ?? 'Fechar'}
    </button>
  );
}

export function DrawerContent({
  children,
  className = '',
  showCloseButton = true,
}: {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}) {
  const { open, onOpenChange, direction } = useContext(DrawerContext);
  const startYRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  if (!open) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (direction !== 'bottom') return;
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (direction !== 'bottom' || startYRef.current === null) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0) {
      setDragOffset(delta);
    }
  };

  const handlePointerUp = () => {
    if (direction !== 'bottom') return;
    if (dragOffset > 90) {
      onOpenChange(false);
    }
    setDragOffset(0);
    startYRef.current = null;
  };

  const directionPositionClasses = {
    bottom:
      'inset-x-0 bottom-0 mt-16 max-h-[92dvh] w-full sm:max-w-xl sm:mx-auto rounded-t-[16px] border-t border-x border-[#E3E3E3]',
    left: 'inset-y-0 left-0 h-full w-[86vw] max-w-[300px] rounded-r-[16px] border-r border-[#E3E3E3]',
    right:
      'inset-y-0 right-0 h-full w-full max-w-md rounded-l-[16px] border-l border-[#E3E3E3]',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay estilo shadcn/ui drawer */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        role="dialog"
        aria-modal="true"
        style={
          direction === 'bottom' && dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)`, transition: 'none' }
            : undefined
        }
        className={`fixed z-50 flex flex-col bg-white shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-out ${directionPositionClasses[direction]} ${className}`}
      >
        {/* Handle bar superior (padrão shadcn/ui base drawer) */}
        {direction === 'bottom' && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full pt-3.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none select-none flex justify-center"
          >
            <div className="h-1.5 w-[56px] shrink-0 rounded-full bg-[#D4D4D4]" />
          </div>
        )}

        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar gaveta"
            className="absolute right-4 top-4 p-1.5 rounded-lg text-[#999999] hover:text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function DrawerHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 px-6 pt-3 pb-4 border-b border-[#E3E3E3]/80 text-left ${className}`}>
      {children}
    </div>
  );
}

export function DrawerTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-black text-[#075618] tracking-tight pr-6 ${className}`}>
      {children}
    </h3>
  );
}

export function DrawerDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-xs text-[#5E5E5E] leading-relaxed ${className}`}>{children}</p>;
}

export function DrawerBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DrawerFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-auto flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 border-t border-[#E3E3E3]/80 bg-[#F3F3F3]/40 ${className}`}>
      {children}
    </div>
  );
}
