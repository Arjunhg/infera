'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES, type LanguageConfig } from '@/lib/languageConfig';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: LanguageConfig) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center space-x-2 text-black"
      >
        <Languages className="w-4 h-4" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                  language.code === selectedLanguage ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-2xl">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{language.name}</div>
                  <div className="text-sm text-gray-500">{language.nativeName}</div>
                </div>
                {language.code === selectedLanguage && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
