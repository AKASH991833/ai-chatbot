---
title: ChatCraft
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: gradio
app_file: app.py
pinned: false
---

# ChatCraft

Conversational AI (DialoGPT) on CPU.

## Run locally
```bash
cd python-app
pip install -r requirements.txt
python app.py
```

## Deploy on Hugging Face Spaces
Create a new Space (SDK: gradio), upload the contents of this folder, and it runs as-is -
`requirements.txt` and `app_file: app.py` are already set. No card or paid plan needed
(free CPU tier).
