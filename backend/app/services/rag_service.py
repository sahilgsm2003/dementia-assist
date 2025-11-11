import re
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.vector_service import VectorService
from app.models.models import ChatMessage, Document
from app.services.document_service import process_pdf, store_document_chunks


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


    def preprocess_query(self, query: str) -> str:
        """
        Clean and preprocess the user query.
        """
        # Remove extra whitespace
        query = re.sub(r'\s+', ' ', query.strip())
        
        # Convert to lowercase for better matching
        query = query.lower()
        
        return query


    def retrieve_relevant_context(self, query: str, user_id: int, max_chunks: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieve relevant document chunks for the query.
        Optimized for speed: reduced default chunks from 3 to 2.
        """
        try:
            # Preprocess the query
            processed_query = self.preprocess_query(query)
            
            # Search for similar documents (reduced to 2 chunks for faster responses)
            results = self.vector_service.search_similar_documents(
                processed_query, 
                user_id, 
                k=max_chunks
            )
            
            return results
            
        except Exception as e:
            print(f"Error retrieving context: {e}")
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


    def create_dementia_friendly_prompt(self, query: str, context: str) -> str:
        """
        Create a prompt optimized for dementia care responses.
        Optimized for speed: shorter, more concise prompt.
        """
        prompt = f"""You are a caring memory assistant. Answer clearly and warmly using the information provided.

INFORMATION:
{context}

QUESTION: {query}

Provide a clear, warm response in simple language. Use natural paragraph breaks. Be reassuring."""
        
        return prompt


    def format_response_text(self, response: str) -> str:
        """
        Clean and format the response text for better readability.
        """
        # Remove any remaining markdown formatting
        response = response.replace('**', '')
        response = response.replace('*', '')
        
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


    def answer_question(self, question: str, user_id: int, db: Session) -> Dict[str, Any]:
        """
        Main function to answer a user's question using RAG.
        """
        try:
            # Retrieve relevant context
            context_results = self.retrieve_relevant_context(question, user_id)
            
            # Format context for the prompt
            formatted_context = self.format_context_for_prompt(context_results)
            
            # Create the prompt
            prompt = self.create_dementia_friendly_prompt(question, formatted_context)
            
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
