import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()
os.environ["OPEN_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class EmailRequest(BaseModel):
    email_content: str
    language: str = "english"

def sanitize_text(text: str) -> str:
    """
    Sanitize email content by removing control characters and normalizing newlines.
    """
    if not text:
        return ""

    sanitized = (
        text.replace("\r\n", "\n")  # Normalize Windows newlines
        .replace("\r", "\n")        # Remove carriage returns
        .replace("\t", " ")         # Convert tabs to spaces
        .replace("\x00-\x1F\x7F", "")        # Remove null characters
    )
    return "".join(char if ord(char) >= 32 or char in ["\n", " "] else " " for char in sanitized)

async def summarize_email(email_content: str, lang: str) -> str:
    """
    Summarizes an email and optionally translates it into the specified language.
    """
    try:
        email_content = sanitize_text(email_content)
        print(f"Email content: {email_content}")
        llm = ChatOpenAI(model="gpt-4o-mini")
        # Define prompt
        prompt = ChatPromptTemplate.from_messages(
            [("system", "Write a concise summary of the following email in {language}"), ("user","{mail}")]
        )

        # Instantiate chain
        chain = prompt | llm | StrOutputParser()

        # Invoke chain
        summarization = chain.invoke({"mail": email_content.strip(), "language": lang})

        return summarization

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PECai faced problems: {e}")

@app.post("/summarize")
async def summarize(request: EmailRequest):
    """
    API endpoint to summarize emails.
    """
    if not request.email_content.strip():
        raise HTTPException(status_code=400, detail="Email content is required")
    
    summary = await summarize_email(request.email_content, request.language)
    return {"summary": summary}

# Run with: uvicorn script_name:app --host 0.0.0.0 --port 8000 --reload
