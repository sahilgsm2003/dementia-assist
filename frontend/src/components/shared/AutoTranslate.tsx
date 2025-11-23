/**
 * Component that automatically translates its children using API
 * Useful for dynamic content that isn't in translation files
 */
import { useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '@/services/translationService';

interface AutoTranslateProps {
  children: ReactNode;
  fallback?: string;
  className?: string;
}

export const AutoTranslate: React.FC<AutoTranslateProps> = ({
  children,
  fallback,
  className,
}) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      const text = typeof children === 'string' ? children : fallback || '';
      
      if (!text) {
        setTranslatedText('');
        return;
      }

      const currentLang = i18n.language;
      const fallbackLang = i18n.options.fallbackLng as string || 'en';

      // If same language, no translation needed
      if (currentLang === fallbackLang) {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translationService.translate(
          text,
          currentLang,
          fallbackLang
        );
        setTranslatedText(translated);
      } catch (error) {
        console.error('Auto-translation error:', error);
        setTranslatedText(text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [children, fallback, i18n.language]);

  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  return (
    <span className={className}>
      {isTranslating ? (
        <span className="opacity-50">{translatedText || children}</span>
      ) : (
        translatedText || children
      )}
    </span>
  );
};

