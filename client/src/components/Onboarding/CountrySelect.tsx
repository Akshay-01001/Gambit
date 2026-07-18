import React, { useState, useRef, useEffect } from 'react';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CN', name: 'China' },
];

export default function CountrySelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry = countries.find(c => c.code === selected);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedCountry ? "text-foreground" : "text-muted-foreground"}>
          {selectedCountry ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase w-5 text-left tracking-wider">
                {selectedCountry.code}
              </span>
              <span>{selectedCountry.name}</span>
            </div>
          ) : "Select a country"}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 z-50 w-full max-h-60 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md flex flex-col">
          <div className="overflow-y-auto p-1 max-h-[14rem] scrollbar-thin">
            {countries.map((country) => (
              <div
                key={country.code}
                onClick={() => {
                  setSelected(country.code);
                  setIsOpen(false);
                }}
                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-[#06b6d4] hover:text-white ${selected === country.code ? 'bg-[#06b6d4] text-white' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase w-5 text-left tracking-wider ${selected === country.code ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {country.code}
                  </span>
                  <span>{country.name}</span>
                </div>
                {selected === country.code && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
