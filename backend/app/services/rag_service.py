import re
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.vector_service import VectorService
from app.models.models import ChatMessage, Document
from app.services.document_service import process_pdf, store_document_chunks
from app.services.gemini_translation_service import gemini_translation_service


class RAGService:
    def __init__(self):
        self.vector_service = VectorService()
        
        # Configure Google Gemini
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Log which key is being used (first 10 chars for security)
            key_preview = settings.GEMINI_API_KEY[:10] + "..." if len(settings.GEMINI_API_KEY) > 10 else "***"
            print(f"Gemini API configured with key: {key_preview}")
        else:
            print("Warning: GEMINI_API_KEY not set in configuration")


    def _devanagari_to_latin(self, text: str) -> str:
        """
        Convert Devanagari script to Latin script (Hinglish) for processing.
        This allows the fallback translation to work with Devanagari input.
        """
        # Basic Devanagari to Latin transliteration mapping
        # Common Hindi words and their transliterations
        devanagari_to_latin = {
            # Common words
            'मेरी': 'meri',
            'मेरा': 'mera',
            'मेरे': 'mere',
            'कौन': 'kaun',
            'क्या': 'kya',
            'कहाँ': 'kahan',
            'कब': 'kab',
            'कैसे': 'kaise',
            'बेटी': 'beti',
            'बेटा': 'beta',
            'पत्नी': 'patni',
            'पति': 'pati',
            'दवाई': 'dawai',
            'घर': 'ghar',
            'आज': 'aaj',
            'नाम': 'naam',
            'है': 'hai',
            'हैं': 'hain',
            'हूँ': 'hoon',
            'हो': 'ho',
            'कर': 'kar',
            'करो': 'karo',
            'ले': 'le',
            'लेता': 'leta',
            'लेती': 'leti',
            'होता': 'hota',
            'होती': 'hoti',
            'बच्चे': 'bachche',
            'परिवार': 'parivar',
            'के': 'ke',
            'की': 'ki',
            'को': 'ko',
            'से': 'se',
            'में': 'mein',
            'पर': 'par',
            'तक': 'tak',
            'का': 'ka',
            'कि': 'ki',
            'यह': 'yah',
            'वह': 'vah',
            'ये': 'ye',
            'वे': 've',
            'यहाँ': 'yahan',
            'वहाँ': 'vahan',
            'अब': 'ab',
            'फिर': 'phir',
            'भी': 'bhi',
            'तो': 'to',
            'या': 'ya',
            'और': 'aur',
            'लेकिन': 'lekin',
            'क्योंकि': 'kyunki',
            # Common phrases (for better matching)
            'मेरी बेटी कौन है': 'meri beti kaun hai',
            'मेरा बेटा कौन है': 'mera beta kaun hai',
            'मेरी पत्नी कौन है': 'meri patni kaun hai',
            'मेरा पति कौन है': 'mera pati kaun hai',
            # Additional words
            'इंश्योरेंस': 'insurance',
            'बीमा': 'bima',
            'बताओ': 'batao',
            'बारे': 'bare',
            'जानकारी': 'jankari',
            'दो': 'do',
            'बेटे': 'bete',
            'डॉक्टर': 'doctor',
        }
        
        # First, try to match whole phrases
        clean_text = text.strip('।,?!.')
        if clean_text in devanagari_to_latin:
            return devanagari_to_latin[clean_text]
        
        # Try to match whole words
        words = text.split()
        transliterated_words = []
        
        for word in words:
            # Remove common Devanagari punctuation/diacritics for matching
            clean_word = word.strip('।,?!.')
            if clean_word in devanagari_to_latin:
                transliterated_words.append(devanagari_to_latin[clean_word])
            else:
                # If not found in dictionary, try to transliterate character by character
                # This is a simplified approach - for production, use a proper library
                transliterated = self._transliterate_characters(clean_word)
                if transliterated:
                    transliterated_words.append(transliterated)
                else:
                    # Keep original if we can't transliterate
                    transliterated_words.append(word)
        
        return ' '.join(transliterated_words)
    
    def _transliterate_characters(self, word: str) -> str:
        """
        Basic character-by-character transliteration for Devanagari to Latin.
        This is a simplified version - for production, consider using indic-transliteration library.
        """
        # Basic Devanagari character mappings (simplified)
        char_map = {
            'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
            'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
            'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
            'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
            'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
            'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
            'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
            'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
            'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
            'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gya',
        }
        
        result = []
        i = 0
        while i < len(word):
            # Check for 2-char combinations first (like क्ष, त्र, ज्ञ)
            if i + 1 < len(word):
                two_char = word[i:i+2]
                if two_char in char_map:
                    result.append(char_map[two_char])
                    i += 2
                    continue
            
            # Check single character
            if word[i] in char_map:
                result.append(char_map[word[i]])
            elif ord(word[i]) < 0x0900 or ord(word[i]) > 0x097F:
                # Not a Devanagari character, keep as is
                result.append(word[i])
            # Skip Devanagari diacritics/vowel signs
            i += 1
        
        return ''.join(result) if result else None

    def preprocess_query(self, query: str) -> str:
        """
        Clean and preprocess the user query.
        """
        # Remove extra whitespace
        query = re.sub(r'\s+', ' ', query.strip())
        
        # Convert to lowercase for better matching
        query = query.lower()
        
        return query

    def _fallback_hindi_translation(self, hindi_query: str) -> str:
        """
        Fallback keyword-based translation for common Hindi question patterns.
        Used when translation API fails.
        """
        query_lower = hindi_query.lower().strip()
        
        # Common Hindi question patterns and their English equivalents
        translations = {
            # Family questions
            "meri beti kon hai": "who is my daughter",
            "meri beti kaun hai": "who is my daughter",
            "mera beta kon hai": "who is my son",
            "mera beta kaun hai": "who is my son",
            "meri patni kon hai": "who is my wife",
            "mera pati kon hai": "who is my husband",
            "mere bachche": "my children",
            "mere bachche kon hain": "who are my children",
            "mera parivar": "my family",
            "mere parivar ke bare mein": "about my family",
            
            # Medicine questions
            "meri dawai": "my medicine",
            "main kaun si dawai leta hoon": "what medicine do I take",
            "meri dawai kya hai": "what is my medicine",
            "dawai": "medicine",
            "medication": "medication",
            
            # Location questions
            "main kahan rehta hoon": "where do I live",
            "mera ghar kahan hai": "where is my home",
            "mera address": "my address",
            
            # Time/schedule questions
            "aaj kya hai": "what is today",
            "aaj ka schedule": "today's schedule",
            "aaj kya karna hai": "what to do today",
            "aaj ki appointment": "today's appointment",
            
            # General questions
            "mera naam": "my name",
            "mera naam kya hai": "what is my name",
            "meri umar": "my age",
            "meri umar kya hai": "what is my age",
            
            # Insurance questions
            "mere insurance ke bare mein batao": "tell me about my insurance",
            "mere insurance ke baar me batao": "tell me about my insurance",
            "mere insurance ke baar me jankari do": "give me information about my insurance",
            "mera insurance": "my insurance",
            "mera bima": "my insurance",
            "mere bima ke bare mein": "about my insurance",
            
            # Doctor questions
            "mere doctor ki jankari do": "give me information about my doctor",
            "mera doctor": "my doctor",
            
            # Son questions
            "mere bete ka naam kya hai": "what is my son's name",
            "mera beta": "my son",
            "mere bete": "my son",
        }
        
        # Try exact match first
        if query_lower in translations:
            return translations[query_lower]
        
        # Try partial matches for common patterns
        for hindi_pattern, english_translation in translations.items():
            if hindi_pattern in query_lower:
                return english_translation
        
        # Common word replacements
        word_replacements = {
            "meri": "my",
            "mera": "my",
            "mere": "my",
            "kon": "who",
            "kaun": "who",
            "kya": "what",
            "kahan": "where",
            "kab": "when",
            "kaise": "how",
            "beti": "daughter",
            "beta": "son",
            "bete": "son",
            "patni": "wife",
            "pati": "husband",
            "dawai": "medicine",
            "ghar": "home",
            "aaj": "today",
            "naam": "name",
            "insurance": "insurance",
            "bima": "insurance",
            "batao": "tell me about",
            "bataao": "tell me about",
            "bare": "about",
            "baar": "about",
            "baare": "about",
            "jankari": "information",
            "jaankari": "information",
            "do": "give",
            "doctor": "doctor",
        }
        
        # Try to translate word by word
        words = query_lower.split()
        translated_words = []
        for word in words:
            if word in word_replacements:
                translated_words.append(word_replacements[word])
            else:
                # Keep original if we don't have translation
                translated_words.append(word)
        
        translated = " ".join(translated_words)
        
        # If we got some translation, return it, otherwise return original
        if translated != query_lower and any(word in word_replacements for word in words):
            return translated
        
        return hindi_query


    def _is_devanagari(self, text: str) -> bool:
        """
        Check if text contains Devanagari script characters.
        """
        for char in text:
            # Devanagari Unicode range: U+0900 to U+097F
            if '\u0900' <= char <= '\u097F':
                return True
        return False

    def retrieve_relevant_context(self, query: str, user_id: int, max_chunks: int = 2, language: str = "en") -> List[Dict[str, Any]]:
        """
        Retrieve relevant document chunks for the query.
        Optimized for speed: reduced default chunks from 3 to 2.
        If query is in Hindi, translate to English for better document matching.
        """
        try:
            # If query is in Hindi, translate to English for document search
            # (documents are typically in English, so we need English query for vector search)
            search_query = query
            original_query = query
            
            if language == "hi":
                print(f"[RAG] Hindi query detected: '{query}'")
                
                try:
                    # Use Gemini-based translation service for high-quality translation
                    # It handles both Devanagari and Hinglish (Roman Hindi)
                    search_query = gemini_translation_service.translate_hindi_to_english(query)
                    
                    if search_query and search_query != query and search_query.strip():
                        print(f"[RAG] Gemini translated: '{query}' -> '{search_query}'")
                    else:
                        # Gemini translation didn't work, try manual transliteration + fallback
                        print(f"[RAG] Gemini translation returned same text, trying fallback")
                        
                        # Check if query is in Devanagari script
                        if self._is_devanagari(query):
                            latin_query = self._devanagari_to_latin(query)
                            print(f"[RAG] Transliterated Devanagari to: '{latin_query}'")
                            search_query = self._fallback_hindi_translation(latin_query)
                        else:
                            search_query = self._fallback_hindi_translation(query)
                        
                        if search_query != query:
                            print(f"[RAG] Fallback translated: '{query}' -> '{search_query}'")
                        else:
                            print(f"[RAG] All translations failed, using original query")
                            
                except Exception as e:
                    print(f"[RAG] Translation error: {e}")
                    # Fallback to keyword-based translation
                    if self._is_devanagari(query):
                        latin_query = self._devanagari_to_latin(query)
                        search_query = self._fallback_hindi_translation(latin_query)
                    else:
                        search_query = self._fallback_hindi_translation(query)
                    
                    if search_query != query:
                        print(f"[RAG] Fallback translated after error: '{query}' -> '{search_query}'")
            
            # Preprocess the query
            processed_query = self.preprocess_query(search_query)
            print(f"[RAG] Searching documents with query: '{processed_query}' (user_id: {user_id})")
            
            # Search for similar documents (reduced to 2 chunks for faster responses)
            results = self.vector_service.search_similar_documents(
                processed_query, 
                user_id, 
                k=max_chunks
            )
            
            print(f"[RAG] Found {len(results)} document chunks")
            if results:
                for i, result in enumerate(results):
                    print(f"[RAG] Chunk {i+1}: similarity={result.get('similarity_score', 'N/A'):.3f}, preview={result.get('content', '')[:100]}...")
            else:
                print(f"[RAG] No document chunks found. User may not have documents uploaded or query doesn't match any content.")
            
            return results
            
        except Exception as e:
            print(f"[RAG] Error retrieving context: {e}")
            import traceback
            traceback.print_exc()
            return []


    def format_context_for_prompt(self, context_results: List[Dict[str, Any]]) -> str:
        """
        Format the retrieved context into a coherent string for the prompt.
        """
        if not context_results:
            return "No relevant information found in your documents."
        
        formatted_context = "PERSONAL INFORMATION FROM YOUR DOCUMENTS:\n\n"
        
        for i, result in enumerate(context_results, 1):
            content = result['content'].strip()
            # Clean up any existing markdown formatting
            content = content.replace('**', '').replace('*', '')
            formatted_context += f"[Document {i}]: {content}\n\n"
        
        return formatted_context


    def create_dementia_friendly_prompt(self, query: str, context: str, language: str = "en") -> str:
        """
        Create a prompt optimized for dementia care responses.
        Optimized for speed: shorter, more concise prompt.
        """
        language_instruction = ""
        if language == "hi":
            language_instruction = """CRITICAL INSTRUCTIONS FOR HINDI RESPONSE:
1. Respond ONLY in simple conversational Hindi using Devanagari script
2. DO NOT use any punctuation marks - no periods, commas, exclamation marks, question marks
3. DO NOT use any numbers - write them as words like एक दो तीन
4. DO NOT use any special symbols or English words
5. Use simple everyday Hindi words that are easy to pronounce
6. Keep sentences short and natural
7. Avoid complex conjunct consonants when simpler words exist
8. End sentences naturally without any punctuation

Example of GOOD response: आपकी बेटी का नाम सुनीता है वह दिल्ली में रहती है
Example of BAD response: आपकी बेटी का नाम सुनीता है। वह दिल्ली में रहती है!"""
        else:
            language_instruction = """IMPORTANT: Respond entirely in English.
Keep responses simple and clear. Avoid complex punctuation."""
        
        has_context = context and "No relevant information" not in context
        
        if has_context:
            prompt = f"""You are a caring memory assistant. Answer clearly and warmly using the information provided.

{language_instruction}

INFORMATION FROM DOCUMENTS:
{context}

QUESTION: {query}

Provide a clear, warm response using the information provided. Use simple language. Be reassuring and helpful."""
        else:
            # When no context is found, be more helpful
            if language == "hi":
                prompt = f"""आप एक देखभाल करने वाला मेमोरी असिस्टेंट हैं। उपयोगकर्ता का प्रश्न: {query}

{language_instruction}

नोट: दस्तावेज़ों में इस प्रश्न से संबंधित जानकारी नहीं मिली है।

कृपया उपयोगकर्ता को बताएं कि:
1. आपको उनके दस्तावेज़ों में इस जानकारी के बारे में कुछ नहीं मिला
2. अगर उनके पास इस जानकारी वाला कोई दस्तावेज़ है, तो वे उसे अपलोड कर सकते हैं
3. आप उनकी मदद करने के लिए हमेशा तैयार हैं

दयालु और सहायक भाषा में उत्तर दें। ध्यान दें: "है।" का उपयोग न करें, इसके बजाय "है" या "हैं" का उपयोग करें।"""
            else:
                prompt = f"""You are a caring memory assistant. The user asked: {query}

{language_instruction}

NOTE: No information related to this question was found in the documents.

Please tell the user:
1. You couldn't find this information in their documents
2. If they have a document with this information, they can upload it
3. You're always ready to help them

Respond in a kind and helpful manner."""
        
        return prompt


    def format_response_text(self, response: str) -> str:
        """
        Clean and format the response text for better readability.
        Also fixes problematic Hindi phrases for better TTS pronunciation.
        """
        # Remove any remaining markdown formatting
        response = response.replace('**', '')
        response = response.replace('*', '')
        
        # Fix problematic Hindi phrases for better TTS pronunciation
        # Replace "है।" (hai with period) which is often mispronounced
        # Use alternatives that sound more natural
        response = self._fix_hindi_tts_issues(response)
        
        # Clean up extra whitespace
        lines = [line.strip() for line in response.split('\n') if line.strip()]
        
        # Format into proper sections
        formatted_lines = []
        for line in lines:
            # Convert common section headers to proper format
            if any(header in line.lower() for header in ['basic:', 'family:', 'work:', 'health:', 'memories:', 'details:']):
                # Make it a proper heading
                formatted_lines.append(f"\n{line.replace(':', '')}")
            else:
                formatted_lines.append(line)
        
        return '\n'.join(formatted_lines).strip()

    def _fix_hindi_tts_issues(self, text: str) -> str:
        """
        Fix common Hindi TTS pronunciation issues by replacing problematic phrases.
        Specifically fixes "है।" which is often mispronounced by TTS engines.
        """
        # Replace "है।" (hai with period) with "है" (without period)
        # The period after "है" causes TTS pronunciation issues
        # We'll remove the period and let the sentence structure handle the pause
        
        # Use regex to replace all instances of "है।" with "है"
        # This handles various spacing scenarios
        # Pattern: "है" followed by "।" (Devanagari danda/period)
        # Match with optional whitespace around it
        text = re.sub(r'है\s*।', 'है', text)
        text = re.sub(r'हैं\s*।', 'हैं', text)
        
        # Also handle cases where there might be multiple spaces
        text = re.sub(r'है\s+।', 'है', text)
        text = re.sub(r'हैं\s+।', 'हैं', text)
        
        # Additional fix: Replace "है।" at end of lines (before newline)
        text = re.sub(r'है\s*।\s*\n', 'है\n', text)
        text = re.sub(r'हैं\s*।\s*\n', 'हैं\n', text)
        
        return text

    def _extract_response_text(self, response: Any) -> str:
        """
        Safely extract plain text from a Gemini response object.
        Handles cases where the fast accessor `.text` is unavailable
        (e.g. tool calls, safety blocks, or empty candidates).
        """
        if response is None:
            return ""

        texts: List[str] = []
        candidates = getattr(response, "candidates", None)
        if candidates is None and isinstance(response, dict):
            candidates = response.get("candidates")

        if not candidates:
            return ""

        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if content is None and isinstance(candidate, dict):
                content = candidate.get("content")
            if content is None:
                continue

            parts = getattr(content, "parts", None)
            if parts is None and isinstance(content, dict):
                parts = content.get("parts")
            if not parts:
                continue

            for part in parts:
                text = getattr(part, "text", None)
                if text is None and isinstance(part, dict):
                    text = part.get("text")
                if text:
                    texts.append(text.strip())

        return "\n".join([t for t in texts if t]).strip()

    def call_gemini_chat(self, prompt: str) -> str:
        """
        Make a request to Google Gemini for chat completion.
        """
        try:
            # Use Gemini Flash for fast responses
            model = genai.GenerativeModel('models/gemini-2.5-flash')
            
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Slightly higher for faster responses
                    max_output_tokens=1024,  # Reduced from 2048 for faster generation
                    top_p=0.8  # Slightly higher for faster responses
                )
            )
            
            # Format the response for better readability
            raw_text = self._extract_response_text(response)

            if not raw_text:
                # Check finish reasons to understand why we got no text
                finish_reasons = []
                for candidate in getattr(response, "candidates", []):
                    finish_reason = getattr(candidate, "finish_reason", None)
                    if finish_reason:
                        finish_reasons.append(finish_reason)
                
                # If MAX_TOKENS, try to get partial text anyway
                if finish_reasons and any("MAX_TOKENS" in str(fr) for fr in finish_reasons):
                    # Try to extract any partial text that might exist
                    for candidate in getattr(response, "candidates", []):
                        content = getattr(candidate, "content", None)
                        if content:
                            parts = getattr(content, "parts", [])
                            for part in parts:
                                text = getattr(part, "text", None)
                                if text and text.strip():
                                    # Return partial text with a note
                                    formatted = self.format_response_text(text.strip())
                                    return formatted + "\n\n(Response was cut off due to length limits)"
                
                print(
                    "Gemini returned no textual content. "
                    f"finish_reasons={finish_reasons}, prompt_feedback={getattr(response, 'prompt_feedback', None)}"
                )
                return (
                    "I'm sorry, I couldn't generate a helpful answer right now. "
                    "Please try asking again in a moment."
                )

            formatted_response = self.format_response_text(raw_text)
            return formatted_response
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error calling Gemini API: {e}")
            
            # Check if it's a quota error
            if "429" in error_msg or "quota" in error_msg.lower() or "Quota exceeded" in error_msg:
                print(f"⚠️  QUOTA ERROR: The current API key has exceeded its quota limits.")
                print(f"   Current key preview: {settings.GEMINI_API_KEY[:10] + '...' if settings.GEMINI_API_KEY else 'NOT SET'}")
                print(f"   Please check your Gemini API quota or use a different API key.")
                print(f"   Make sure to restart the backend server after updating the .env file.")
                return "I'm currently experiencing high demand. Please try again in a few moments, or contact support if this persists."
            
            return "I'm sorry, I'm having trouble accessing my knowledge right now. Please try again in a moment."


    def answer_question(self, question: str, user_id: int, db: Session, language: str = "en") -> Dict[str, Any]:
        """
        Main function to answer a user's question using RAG.
        """
        try:
            # Check if user has any documents
            document_count = db.query(Document).filter(Document.user_id == user_id).count()
            print(f"[RAG] User {user_id} has {document_count} document(s)")
            
            # Retrieve relevant context (translates Hindi queries to English for search)
            context_results = self.retrieve_relevant_context(question, user_id, language=language)
            
            # Format context for the prompt
            formatted_context = self.format_context_for_prompt(context_results)
            
            # If no documents exist, add a helpful note
            if document_count == 0:
                if language == "hi":
                    formatted_context = "नोट: उपयोगकर्ता के पास अभी तक कोई दस्तावेज़ अपलोड नहीं है।"
                else:
                    formatted_context = "NOTE: The user has not uploaded any documents yet."
            
            # Create the prompt with language preference (use original question, not translated)
            prompt = self.create_dementia_friendly_prompt(question, formatted_context, language)
            
            print(f"[RAG] Generated prompt (first 200 chars): {prompt[:200]}...")
            
            # Get response from Gemini
            response = self.call_gemini_chat(prompt)
            
            # Calculate confidence score based on context quality
            confidence_score = self._calculate_confidence_score(context_results)
            
            # Store the conversation in the database (non-blocking for faster response)
            try:
                chat_message = ChatMessage(
                    user_id=user_id,
                    question=question,
                    response=response,
                    confidence_score=confidence_score
                )
                db.add(chat_message)
                db.commit()
            except Exception as db_error:
                # Don't fail the request if DB write fails
                print(f"Warning: Failed to save chat message to database: {db_error}")
            
            return {
                "question": question,
                "response": response,
                "confidence_score": confidence_score,
                "sources_used": len(context_results),
                "context_results": context_results
            }
            
        except Exception as e:
            print(f"Error answering question: {e}")
            return {
                "question": question,
                "response": "I'm sorry, I encountered an error while processing your question. Please try again.",
                "confidence_score": 0.0,
                "sources_used": 0,
                "context_results": []
            }


    def _calculate_confidence_score(self, context_results: List[Dict[str, Any]]) -> float:
        """
        Calculate a confidence score based on the quality of retrieved context.
        """
        if not context_results:
            return 0.0
        
        # Average similarity score of top results
        avg_similarity = sum(result['similarity_score'] for result in context_results) / len(context_results)
        
        # Bonus for having multiple relevant sources
        source_bonus = min(0.1 * len(context_results), 0.3)
        
        confidence = min(avg_similarity + source_bonus, 1.0)
        return round(confidence, 2)


    def process_and_index_document(self, file_path: str, filename: str, user_id: int, db: Session) -> Dict[str, Any]:
        """
        Process a document and add it to the user's knowledge base.
        """
        try:
            # Process the PDF and extract chunks
            chunks = process_pdf(file_path, filename, user_id)
            
            # Store document in database
            document = store_document_chunks(chunks, user_id, filename, db)
            
            # Add chunks to vector index
            self.vector_service.add_documents_to_index(user_id, chunks)
            
            return {
                "success": True,
                "document_id": document.id,
                "filename": filename,
                "chunks_processed": len(chunks),
                "message": f"Successfully processed {filename} with {len(chunks)} chunks"
            }
            
        except Exception as e:
            print(f"Error processing document {filename}: {e}")
            return {
                "success": False,
                "filename": filename,
                "error": str(e),
                "message": f"Failed to process {filename}"
            }


    def get_chat_history(self, user_id: int, db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get chat history for a user.
        """
        try:
            messages = db.query(ChatMessage).filter(
                ChatMessage.user_id == user_id
            ).order_by(
                ChatMessage.created_at.desc()
            ).limit(limit).all()
            
            return [
                {
                    "id": msg.id,
                    "question": msg.question,
                    "response": msg.response,
                    "confidence_score": msg.confidence_score,
                    "created_at": msg.created_at.isoformat()
                }
                for msg in reversed(messages)  # Reverse to get chronological order
            ]
            
        except Exception as e:
            print(f"Error getting chat history: {e}")
            return []


    def generate_suggested_questions(self, user_id: int, db: Session, language: str = "en") -> List[str]:
        """
        Generate suggested questions based on user's documents.
        """
        try:
            # Get recent documents to generate questions from
            documents = db.query(Document).filter(
                Document.user_id == user_id
            ).order_by(Document.created_at.desc()).limit(3).all()
            
            if not documents:
                # Return default questions if no documents
                if language == "hi":
                    return [
                        "मैं दस्तावेज़ कैसे जोड़ूँ?",
                        "आप मेरी क्या मदद कर सकते हैं?",
                        "यह कैसे काम करता है?"
                    ]
                return [
                    "How do I add documents?",
                    "What can you help me with?",
                    "How does this work?"
                ]
            
            # Get document summaries/content to generate questions
            context_parts = []
            for doc in documents:
                # Get a few chunks from each document
                chunks = self.vector_service.search_similar_documents(
                    "", # Empty query to get any chunks
                    user_id,
                    k=2,
                    # We might need to filter by document_id if vector service supports it,
                    # but for now getting any chunks is fine for general context
                )
                for chunk in chunks:
                    context_parts.append(chunk.get('content', '')[:200])
            
            context = "\n".join(context_parts)
            
            prompt = f"""Based on the following document excerpts, generate 5 simple, personal questions that a user might ask about this information.
            
            DOCUMENTS:
            {context}
            
            Generate 5 short, simple questions in {language} language.
            Return ONLY the questions, one per line.
            """
            
            response = self.call_gemini_chat(prompt)
            questions = [q.strip('- ').strip() for q in response.split('\n') if q.strip()]
            
            # Filter and limit to 5
            questions = [q for q in questions if len(q) > 5][:5]
            
            return questions
            
        except Exception as e:
            print(f"Error generating suggested questions: {e}")
            # Return defaults on error
            if language == "hi":
                return ["मेरी दवाई क्या है?", "आज का क्या प्लान है?", "मेरा परिवार कहां है?"]
            return ["What medicine do I take?", "What's happening today?", "Tell me about my family"]

    def delete_user_knowledge_base(self, user_id: int, db: Session):
        """
        Delete all knowledge base data for a user.
        """
        try:
            # Delete from database
            db.query(Document).filter(Document.user_id == user_id).delete()
            db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
            db.commit()
            
            # Delete vector data
            self.vector_service.delete_user_data(user_id)
            
            print(f"Deleted knowledge base for user {user_id}")
            
        except Exception as e:
            db.rollback()
            print(f"Error deleting knowledge base for user {user_id}: {e}")
            raise
