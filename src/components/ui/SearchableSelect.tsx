import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, X } from "lucide-react";

export interface SearchableSelectProps {
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
  searchPlaceholder?: string;
  disabled: boolean;
}

export const SearchableSelect = React.forwardRef<
  HTMLDivElement,
  SearchableSelectProps
>(
  (
    {
      className,
      error,
      options,
      placeholder = "Select option...",
      value,
      onChange,
      name,
      searchPlaceholder = "Search options...",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState<{
      value: string;
      label: string;
    } | null>(
      value ? options.find((opt) => opt.value === value) || null : null
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle clicks outside the dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    const handleOptionSelect = (option: { value: string; label: string }) => {
      setSelectedOption(option);
      setIsOpen(false);
      setSearchTerm("");
      onChange?.(option.value);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedOption(null);
      setSearchTerm("");
      onChange?.("");
    };

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    };

    return (
      <div className="space-y-1" ref={ref}>
        <div className="relative" ref={dropdownRef}>
          {/* Main Select Button */}
          <button
            type="button"
            className={cn(
              "relative w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            onClick={toggleDropdown}
            {...props}
          >
            <span
              className={cn(
                "block truncate",
                !selectedOption && "text-gray-500"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
              {selectedOption && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-300 max-h-60 overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                        selectedOption?.value === option.value &&
                          "bg-blue-50 text-blue-600",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() =>
                        !option.disabled && handleOptionSelect(option)
                      }
                      disabled={option.disabled}
                    >
                      {option.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={selectedOption?.value || ""} />
      </div>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";
