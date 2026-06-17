import fitz  # PyMuPDF
import re
import docx
import io

def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from PDF, DOCX, or TXT bytes based on the filename extension.
    Returns [ERROR] or [EMPTY_FILE] if it fails or finds no text.
    """
    filename_lower = filename.lower()
    text = ""
    
    try:
        if filename_lower.endswith('.pdf'):
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text("text") + "\n"
                
        elif filename_lower.endswith('.docx'):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
                
        elif filename_lower.endswith('.txt'):
            text = file_bytes.decode('utf-8', errors='ignore')
            
        else:
            return f"[ERROR] Unsupported file format: {filename}"
            
        # Clean up text by removing excessive whitespace
        text = re.sub(r'\n+', '\n', text)
        text = text.strip()
        
        if not text:
            return "[EMPTY_FILE] No text found. The file might be an image/scan or completely empty."
            
        return text
    except Exception as e:
        return f"[ERROR] Failed to parse {filename}: {str(e)}"

if __name__ == "__main__":
    print("Parser module is ready with PDF, DOCX, and TXT support.")
