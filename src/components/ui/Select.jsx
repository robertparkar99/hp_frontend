import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "../../components/utils/cn";
import { Button } from "./button";
import { Input } from "./input";

const Select = React.forwardRef(({
  className,
  options = [],
  value,
  placeholder = "Select an option",
  multiple = false,
  disabled = false,
  required = false,
  label,
  description,
  error,
  searchable = false,
  clearable = false,
  loading = false,
  id,
  name,
  onChange,
  onOpenChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // ✅ merge forwardRef with local ref
  const setTriggerRef = (node) => {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // ✅ close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onOpenChange]);

  // ✅ keyboard shortcuts (select all / clear all)
  useEffect(() => {
    if (!isOpen || !multiple) return;

    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        const allValues = options.map((opt) => opt.value).filter(Boolean);
        onChange?.(allValues);
      }
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        onChange?.([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, multiple, options, onChange]);

  // Filter options if searchable
  const filteredOptions =
    searchable && searchTerm
      ? options.filter(
          (option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (option.value &&
              option.value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : options;

  const getSelectedDisplay = () => {
    if (!value) return placeholder;
    if (multiple) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const opt = options.find((o) => o.value === value[0]);
        return opt ? opt.label : placeholder;
      }
      return `${value.length} items selected`;
    }
    const selectedOption = options.find((o) => o.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const handleOptionSelect = (option) => {
    if (multiple) {
      const newValue = value || [];
      const updatedValue = newValue.includes(option.value)
        ? newValue.filter((v) => v !== option.value)
        : [...newValue, option.value];
      onChange?.(updatedValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      onOpenChange?.(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : "");
  };

  const isSelected = (optionValue) => {
    if (multiple) return value?.includes(optionValue) || false;
    return value === optionValue;
  };

  const hasValue = multiple ? value?.length > 0 : value !== undefined && value !== "";

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none mb-2 block",
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger button */}
        <button
          ref={setTriggerRef}
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white text-black px-3 py-2 text-sm focus:outline-none",
            error && "border-destructive focus:ring-destructive",
            !hasValue && "text-muted-foreground"
          )}
          onClick={() => {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            onOpenChange?.(newIsOpen);
            if (!newIsOpen) setSearchTerm("");
          }}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          <span className="truncate">{getSelectedDisplay()}</span>
          <div className="flex items-center gap-1">
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {clearable && hasValue && !loading && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Hidden native select for form compatibility */}
        <select
          name={name}
          value={value || ""}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          multiple={multiple}
          required={required}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white text-black border border-border rounded-md shadow-md"
          >
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            <div className="py-1 max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {searchTerm ? "No options found" : "No options available"}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                      isSelected(option.value) &&
                        "bg-primary text-primary-foreground",
                      option.disabled && "pointer-events-none opacity-50"
                    )}
                    onClick={() => !option.disabled && handleOptionSelect(option)}
                  >
                    <span className="flex-1">{option.label}</span>
                    {multiple && isSelected(option.value) && (
                      <Check className="h-4 w-4" />
                    )}
                    {option.description && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.description}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {description && !error && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";
export default Select;
