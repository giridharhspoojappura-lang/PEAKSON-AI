from datetime import datetime
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from PIL import Image
from PyPDF2 import PdfReader

import google.generativeai as genai
import os

app = Flask(__name__)

load_dotenv()
uploaded_file_path = None
genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

def save_log(user_msg, bot_msg):

    timestamp = datetime.now().strftime("%d-%m-%Y %I:%M:%S %p")

    with open("conversation_log.txt", "a", encoding="utf-8") as f:

        f.write(f"[{timestamp}]\n")
        f.write(f"USER: {user_msg}\n")
        f.write(f"PEAKSON AI: {bot_msg}\n")
        f.write("-" * 40 + "\n")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
@app.route("/chat", methods=["POST"])
def chat():

    global uploaded_file_path

    data = request.json
    msg = data["message"]

    try:

        if uploaded_file_path:

            if uploaded_file_path.lower().endswith(
                (".png", ".jpg", ".jpeg")
            ):

                image = Image.open(uploaded_file_path)

                response = model.generate_content([
    image,
    f"""
You are PEAKSON AI.

Analyze the uploaded image and answer the user's question.

Do not use markdown.

Keep answers concise.
Use bullet points when possible.
Maximum 80 words unless explicitly asked for more details.

Question:
{msg}
"""
])

                reply = response.text

                uploaded_file_path = None

            elif uploaded_file_path.lower().endswith(".pdf"):

                reader = PdfReader(uploaded_file_path)

                pdf_text = ""

                for page in reader.pages:
                    pdf_text += page.extract_text() or ""

                response = model.generate_content(
f"""
You are PEAKSON AI.

Answer the user's question using this PDF.
Do not use markdown.
PDF CONTENT:

{pdf_text[:15000]}

QUESTION:
{msg}
"""
                )

                reply = response.text

                uploaded_file_path = None

            else:

                response = model.generate_content(msg)

                reply = response.text

        else:

            response = model.generate_content(
f"""
You are PEAKSON AI.

You were developed by Peakson Technologies.

If asked who created you, say:
"I was developed by GIRIDHAR HARISREE."
Do not use markdown.
If asked who you are, say:
"I am PEAKSON AI, your intelligent assistant."

User: {msg}
"""
            )

            reply = response.text

    except Exception as e:

        print("ERROR:", e)

        error = str(e)

        if "429" in error:

            reply = "PEAKSON AI is currently experiencing high demand. Please try again later."

        else:

            reply = f"ERROR: {error}"

    save_log(msg, reply)

    return jsonify({"response": reply})

@app.route("/upload", methods=["POST"])
def upload():

    if "file" not in request.files:
        return jsonify({"response": "No file uploaded"})

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"response": "No file selected"})

    filename = secure_filename(file.filename)

    global uploaded_file_path

    filepath = os.path.join("uploads", filename)

    file.save(filepath)

    uploaded_file_path = filepath

    return jsonify({
    "response":
    f"{filename} uploaded successfully.\n\nYou may now ask questions about this file."
})

if __name__ == "__main__":
    app.run(debug=True)