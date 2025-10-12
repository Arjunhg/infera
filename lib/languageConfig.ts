export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  murfCode: string; // Murf API language code
  voiceId: string; // Default voice for this language
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    murfCode: 'en-US',
    voiceId: 'en-US-terrell',
    flag: '🇺🇸'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    murfCode: 'hi-IN',
    voiceId: 'hi-IN-karan', // Common Hindi voice in Murf
    flag: '🇮🇳'
  }
];

export const getLanguageByCode = (code: string): LanguageConfig | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getDefaultLanguage = (): LanguageConfig => {
  return SUPPORTED_LANGUAGES[0]; // English as default
};
