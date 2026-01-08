"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Language } from "@/types/auction-types";
import Image from "next/image";

interface LanguageOption {
  code: Language;
  name: string;
  flagCode: string;
  shortCode: string;
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", flagCode: "us", shortCode: "ENG" },
  { code: "fr", name: "Français", flagCode: "fr", shortCode: "FRA" },
  { code: "es", name: "Español", flagCode: "es", shortCode: "ESP" },
  { code: "de", name: "Deutsch", flagCode: "de", shortCode: "DEU" },
  { code: "hi", name: "हिन्दी", flagCode: "in", shortCode: "HIN" },
  { code: "zh", name: "中文", flagCode: "cn", shortCode: "CHN" },
  { code: "ja", name: "日本語", flagCode: "jp", shortCode: "JPN" },
  { code: "ar", name: "العربية", flagCode: "sa", shortCode: "ARA" },
];

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
}

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguage =
    languages.find((lang) => lang.code === value) || languages[0];

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

  const handleLanguageSelect = (languageCode: Language) => {
    onChange(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-center w-max px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors-smooth"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-3.5 shadow-sm overflow-hidden rounded-[2px]">
            <Image
              src={`https://flagcdn.com/w40/${selectedLanguage.flagCode}.png`}
              alt={selectedLanguage.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="text-xs font-semibold">
            {selectedLanguage.shortCode}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 animate-fade-in max-h-60 overflow-auto">
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`flex items-center w-full px-3 py-2 text-sm transition-colors-smooth ${
                language.code === value
                  ? "bg-corporate-50 dark:bg-corporate-900/30 text-corporate-600 dark:text-corporate-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleLanguageSelect(language.code)}
              role="option"
              aria-selected={language.code === value}
            >
              <div className="relative w-5 h-3.5 mr-3 shadow-sm overflow-hidden rounded-[2px]">
                <Image
                  src={`https://flagcdn.com/w40/${language.flagCode}.png`}
                  alt={language.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="flex-1 text-left">{language.name}</span>
              {language.code === value && <Check className="w-4 h-4 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
