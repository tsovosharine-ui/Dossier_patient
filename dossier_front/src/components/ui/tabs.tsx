'use client';
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext<any>(null);

export function Tabs({ value, onValueChange, children, className }: any) {
  const [activeTab, setActiveTab] = useState(value || '');
  const context = { value: activeTab, onValueChange: (v: string) => { setActiveTab(v); onValueChange?.(v); } };
  return (
    <TabsContext.Provider value={context}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: any) {
  return <div className={`flex border-b ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children }: any) {
  const { value: selected, onValueChange } = useContext(TabsContext);
  return (
    <button
      className={`px-4 py-2 font-medium text-sm ${selected === value ? 'border-b-2 border-[#05668D] text-[#05668D]' : 'text-gray-500 hover:text-gray-700'}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: any) {
  const { value: selected } = useContext(TabsContext);
  return selected === value ? <div className="mt-4">{children}</div> : null;
}
