/**
 * Example component showing how to use API-based translation
 */
import { useState } from 'react';
import { useSmartTranslation } from '@/hooks/useSmartTranslation';
import { useTranslation } from 'react-i18next';
import { AutoTranslate } from '@/components/shared/AutoTranslate';
import { Button } from '@/components/ui/button';

export const TranslationExample = () => {
  const { t } = useTranslation();
  const { smartTranslate, translate } = useSmartTranslation();
  const [dynamicText, setDynamicText] = useState('');
  const [translatedDynamic, setTranslatedDynamic] = useState('');

  // Example 1: Regular translation (hardcoded only - fast)
  const hardcodedTitle = translate('myDay.title');

  // Example 2: Smart translation (hardcoded + API fallback)
  const handleTranslateDynamic = async () => {
    if (!dynamicText) return;
    
    const translated = await smartTranslate('dynamic.content', {
      defaultValue: dynamicText, // This will be translated via API
    });
    setTranslatedDynamic(translated);
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white">Translation Examples</h2>

      {/* Example 1: Hardcoded translation */}
      <div className="bg-white/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Example 1: Hardcoded Translation (Fast)
        </h3>
        <p className="text-white/70">
          Uses translation files only: <strong>{hardcodedTitle}</strong>
        </p>
      </div>

      {/* Example 2: API translation for dynamic content */}
      <div className="bg-white/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Example 2: API Translation for Dynamic Content
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            value={dynamicText}
            onChange={(e) => setDynamicText(e.target.value)}
            placeholder="Enter text to translate"
            className="w-full p-2 rounded bg-black/30 text-white border border-white/20"
          />
          <Button onClick={handleTranslateDynamic} disabled={!dynamicText}>
            Translate via API
          </Button>
          {translatedDynamic && (
            <p className="text-white/70">
              Translated: <strong>{translatedDynamic}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Example 3: AutoTranslate component */}
      <div className="bg-white/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Example 3: AutoTranslate Component
        </h3>
        <p className="text-white/70 mb-2">
          Automatically translates any text:
        </p>
        <AutoTranslate fallback="This text will be automatically translated">
          This text will be automatically translated
        </AutoTranslate>
      </div>

      {/* Example 4: Missing translation key */}
      <div className="bg-white/10 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Example 4: Missing Translation Key (API Fallback)
        </h3>
        <p className="text-white/70">
          This key doesn't exist in translation files, so API will translate it:
        </p>
        <button
          onClick={async () => {
            const result = await smartTranslate('this.key.does.not.exist', {
              defaultValue: 'This will be translated via API',
            });
            alert(result);
          }}
          className="mt-2 px-4 py-2 bg-[#E02478] text-white rounded hover:bg-[#E02478]/80"
        >
          Try API Translation
        </button>
      </div>
    </div>
  );
};

