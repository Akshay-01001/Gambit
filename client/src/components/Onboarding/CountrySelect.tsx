import React, { useEffect, useRef, useState } from "react";

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "CN", name: "China" },
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedCountry = countries.find(
    (country) => country.code === value
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {selectedCountry ? (
          <div className="flex items-center gap-3">
            <span className="w-5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {selectedCountry.code}
            </span>
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">
            Select a country
          </span>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-2 flex max-h-60 w-full flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="max-h-56 overflow-y-auto p-1">
            {countries.map((country) => (
              <button
                type="button"
                key={country.code}
                onClick={() => {
                  onChange(country.code);
                  setIsOpen(false);
                }}
                className={`relative flex w-full items-center rounded-sm py-2 pl-2 pr-8 text-left text-sm transition-colors hover:bg-cyan-500 hover:text-white ${value === country.code
                  ? "bg-cyan-500 text-white"
                  : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 text-left text-[10px] font-bold uppercase tracking-wider ${value === country.code
                      ? "text-white/70"
                      : "text-muted-foreground"
                      }`}
                  >
                    {country.code}
                  </span>

                  <span>{country.name}</span>
                </div>

                {value === country.code && (
                  <span className="absolute right-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;