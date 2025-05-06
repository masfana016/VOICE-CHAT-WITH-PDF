from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START
from langgraph.graph import MessagesState
from langgraph.prebuilt import ToolNode
from langgraph.prebuilt import tools_condition
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph # type
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import  HumanMessage, SystemMessage
from dotenv import load_dotenv
from pydantic import BaseModel
# from psycopg_pool import ConnectionPool
# from langgraph.checkpoint.postgres import PostgresSaver
import imaplib
import email
import traceback
import os
from fastapi import FastAPI, HTTPException
import uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", 
    google_api_key=os.getenv("GOOGLE_API_KEY")
)


# # Supabase PostgreSQL connection details (get from Supabase dashboard)
# # Connection pool configuration
# connection_kwargs = {"autocommit": True, "prepare_threshold": 0}

# # Create connection pool
# pool = ConnectionPool(conninfo=os.getenv("DB_URI"), max_size=20, kwargs=connection_kwargs)
# # Initialize PostgresSaver checkpointer
# checkpointer = PostgresSaver(pool)
# checkpointer.setup()  # Creates required tables

search = TavilySearchResults(tavily_api_key=os.getenv("TAVILY_API_KEY"))

def send_email(to_email: str, subject: str, body: str):
    """
    Sends an email using Gmail's SMTP server.

    Parameters:
    to_email (str): Recipient email address.
    subject (str): Subject of the email.
    body (str): Body content of the email.

    Returns:
    None
    """
    
    email_address = os.getenv('email_addess')
    APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')
    
    try:
        with smtplib.SMTP_SSL(host="smtp.gmail.com", port=465) as server:
            server.login(email_address, APP_PASSWORD)
            
            msg = MIMEMultipart()
            msg['From'] = email_address
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            
            server.send_message(msg)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error: {str(e)}")
        
# ORG_EMAIL = "@gmail.com" 
FROM_EMAIL = os.getenv('email_addess')
FROM_PWD = os.getenv('APP_PASSWORD') # Ensure this is an App Password
SMTP_SERVER = "imap.gmail.com" 
SMTP_PORT = 993

import imaplib
import email
from email.header import decode_header
import os
import traceback

def read_recent_emails():
    """
    Fetches and displays the latest 5 emails from the Gmail inbox, including attachments.

    This function connects to a Gmail account using IMAP, retrieves the latest 5 emails, 
    and extracts the sender, subject, body, and attachments (images and files) of each email. 
    It supports both plain text and HTML emails and saves attachments to a specified directory.

    Steps:
    - Connects to the Gmail inbox using IMAP.
    - Retrieves the latest 5 email message IDs.
    - Fetches and extracts email details such as sender, subject, body, and attachments.
    - Handles both plain text and HTML emails.
    - Saves attachments (images and files) to a specified directory.
    - Displays the extracted information in a readable format.

    Raises:
        Exception: Catches and prints any errors that occur during the email retrieval process.

    Dependencies:
        - imaplib
        - email
        - os
        - traceback

    Example Usage:
        read_recent_emails()
    """
    try:
        # Gmail IMAP server and credentials
        FROM_EMAIL = os.getenv('email_addess')
        FROM_PWD = os.getenv('GMAIL_APP_PASSWORD')
        
        if not FROM_EMAIL or not FROM_PWD:
            return {"error": "Email credentials not found. Please check your .env file."}
            
        SMTP_SERVER = "imap.gmail.com" 
        ATTACHMENT_DIR = "attachments"  # Directory to save attachments

        # Create the attachment directory if it doesn't exist
        if not os.path.exists(ATTACHMENT_DIR):
            os.makedirs(ATTACHMENT_DIR)

        # Connect to Gmail
        mail = imaplib.IMAP4_SSL(SMTP_SERVER)
        mail.login(FROM_EMAIL, FROM_PWD)
        mail.select('inbox', readonly=True)

        # Search for all emails
        result, data = mail.search(None, 'ALL')
        mail_ids = data[0].split()

        if not mail_ids:
            print("No emails found.")
            return {"message": "No emails found."}

        latest_email_id = int(mail_ids[-1])  # Most recent email ID
        first_email_id = max(latest_email_id - 4, int(mail_ids[0]))  # Get 5 latest emails

        emails = []
        for i in range(latest_email_id, first_email_id - 1, -1):
            result, message_data = mail.fetch(str(i), '(RFC822)')
            for response_part in message_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])

                    # Decode email subject and sender
                    email_subject = decode_header(msg['subject'])[0][0]
                    if isinstance(email_subject, bytes):
                        email_subject = email_subject.decode()
                    email_from = decode_header(msg['from'])[0][0]
                    if isinstance(email_from, bytes):
                        email_from = email_from.decode()

                    # Extract email body and attachments
                    email_body = ""
                    attachments = []
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = str(part.get("Content-Disposition"))

                            # Handle email body (plain text or HTML)
                            if content_type == "text/plain" and "attachment" not in content_disposition:
                                email_body = part.get_payload(decode=True).decode(errors='ignore')
                            elif content_type == "text/html" and "attachment" not in content_disposition:
                                email_body = part.get_payload(decode=True).decode(errors='ignore')

                            # Handle attachments (images and files)
                            if "attachment" in content_disposition or "filename" in content_disposition:
                                filename = part.get_filename()
                                if filename:
                                    filename = decode_header(filename)[0][0]
                                    if isinstance(filename, bytes):
                                        filename = filename.decode()
                                    filepath = os.path.join(ATTACHMENT_DIR, filename)
                                    with open(filepath, "wb") as f:
                                        f.write(part.get_payload(decode=True))
                                    attachments.append({
                                        "filename": filename,
                                        "content_type": content_type,
                                        "filepath": filepath
                                    })
                    else:
                        # Handle non-multipart emails (plain text only)
                        email_body = msg.get_payload(decode=True).decode(errors='ignore')

                    emails.append({
                        "from": email_from,
                        "subject": email_subject,
                        "body": email_body,
                        "attachments": attachments
                    })
        
        return {"emails": emails}

    except Exception as e:
        traceback.print_exc()
        print(str(e))
        return {"error": str(e)}


tools = [search, send_email, read_recent_emails]


llm_with_tools = llm.bind_tools(tools)

# System message
sys_msg = SystemMessage(content='''You are a highly capable customer support assistant designed to assist with email-related tasks. 

Your primary responsibilities include:

1. **Reading Emails**:
   - Retrieve the latest 5 emails from the user's Gmail inbox.
   - For each email, extract and display the following details in a structured and readable format:
     - **Sender**: The email address of the sender.
     - **Subject**: The subject line of the email.
     - **Body**: The main content of the email, whether it is in plain text with proper links or HTML format.
     - **Attachments**: A list of any attachments (e.g., images, files) included in the email, along with their filenames and content types.
   - Handle multipart emails by prioritizing the plain text body.
   - Save any attachments to a specified directory and provide the file paths for easy access.
   - Explain each and every part unless I told you to summarize them.
   - Ensure the output is clean, readable, and formatted for easy understanding.

2. **Composing and Sending Emails**:
   - Generate well-structured and contextually relevant email bodies based on user requests.
   - Send emails using Gmail's SMTP server, utilizing the provided recipient email address, subject, and body content.
   - If replying to an email, ensure the recipient's email address is correctly identified from the previously read emails.
   - Support attaching files to outgoing emails if requested by the user.

3. **General Assistance**:
   - Provide accurate and helpful responses to user inquiries related to email management.
   - Assist with organizing emails, marking them as read/unread, or moving them to specific folders (e.g., "Important," "Spam").
   - Maintain a seamless and intuitive user experience by anticipating user needs and offering proactive solutions.
   - Handle errors gracefully and provide clear instructions for troubleshooting (e.g., incorrect credentials, connection issues).

4. **Attachment Handling**:
   - When reading emails, identify and extract any attachments (e.g., images, PDFs, documents).
   - Save attachments to a designated directory (e.g., `attachments/`) and include their details in the email summary.
   - Provide the user with the ability to view, download, or delete attachments as needed.
   - Ensure attachments are handled securely and do not pose any risks (e.g., malware scanning).

5. **User Experience**:
   - Always prioritize clarity, accuracy, and user satisfaction in your interactions.
   - Use a friendly and professional tone in all communications.
   - Provide step-by-step guidance for complex tasks (e.g., setting up email filters, configuring SMTP settings).
   - Offer suggestions for improving email productivity (e.g., using labels, automating repetitive tasks).

Your goal is to deliver a seamless, efficient, and user-friendly experience while handling email-related tasks with precision and professionalism. Always prioritize clarity, accuracy, and user satisfaction in your interactions.''')

# Node
def assistant(state: MessagesState) -> MessagesState:
    return {"messages": [llm_with_tools.invoke([sys_msg] + state["messages"][-10:])]}

# Build graph
builder: StateGraph = StateGraph(MessagesState)

# Define nodes: these do the work
builder.add_node("assistant", assistant)
builder.add_node("tools", ToolNode(tools))

# Define edges: these determine how the control flow moves
builder.add_edge(START, "assistant")
builder.add_conditional_edges(
    "assistant",
    # If the latest message (result) from assistant is a tool call -> tools_condition routes to tools
    # If the latest message (result) from assistant is a not a tool call -> tools_condition routes to END
    tools_condition,
)
builder.add_edge("tools", "assistant")
memory: MemorySaver = MemorySaver()
react_graph_memory: CompiledStateGraph = builder.compile(checkpointer=memory)

class UserInput(BaseModel):
    input_text: str 

# API endpoint
@app.post("/generateanswer")
async def generate_answer(user_input: UserInput):
    try:
        messages = [HumanMessage(content=user_input.input_text)]
        response = react_graph_memory.invoke({"messages": messages}, config={"configurable": {"thread_id": "1"}})

        # Extract the response from the graph output
        if response and "messages" in response:
            # Extract the last message (assistant's response)
            assistant_response = response["messages"][-1].content
            return {"response": assistant_response}
        else:
            return {"response": "No response generated."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/system-status")
def check_sys_status():
    return {"response": "System is online"}
# Run the application
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)



# # Specify a thread
# config1 = {"configurable": {"thread_id": "1"}}


# messages = [HumanMessage(content="How much would I save by switching to solar panels if my monthly electricity cost is $200?")]
# messages = react_graph_memory.invoke({"messages": messages}, config1)
# for m in messages['messages']:
#     m.pretty_print()