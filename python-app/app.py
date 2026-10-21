"""ChatCraft - conversational AI (Gradio).
Run: python app.py
Model: microsoft/DialoGPT-small (124M params, CPU). Multi-turn with history.
"""
import os
import torch
import gradio as gr
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL = "microsoft/DialoGPT-small"
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL)
model.eval()

def respond(message, history, temperature, max_len):
    if not message.strip():
        return "", history
    # build dialog from the last 4 exchanges
    ids = []
    for u, b in history[-4:]:
        ids += tok.encode(u + tok.eos_token)
        ids += tok.encode(b + tok.eos_token)
    ids += tok.encode(message + tok.eos_token)
    ids = ids[-800:]
    inp = torch.tensor([ids])
    with torch.no_grad():
        out = model.generate(
            inp, max_length=len(ids) + int(max_len),
            pad_token_id=tok.eos_token_id,
            do_sample=float(temperature) > 0.05,
            temperature=max(0.05, float(temperature)),
            top_p=0.92, top_k=50,
            num_beams=1 if float(temperature) > 0.05 else 4,
            no_repeat_ngram_size=3)
    reply = tok.decode(out[0][len(ids):], skip_special_tokens=True).strip()
    if not reply:
        reply = "Tell me more about that?"
    history = history + [[message, reply]]
    return "", history

with gr.Blocks(title="ChatCraft - AI Chatbot") as demo:
    gr.Markdown("# 💬 ChatCraft\nA real neural conversational model (DialoGPT, 124M parameters) "
                "running entirely on CPU. **Honest limits:** it is a small 2019-era model - "
                "great at casual chat, but it does not know facts, current events, or you; "
                "it can ramble or contradict itself on long threads.")
    chat = gr.Chatbot(label="Conversation")
    with gr.Row():
        msg = gr.Textbox(placeholder="Say something...", label="Message", scale=4)
        send = gr.Button("Send", variant="primary", scale=1)
    with gr.Accordion("Model controls", open=False):
        temp = gr.Slider(0.0, 1.5, 0.8, label="Creativity (temperature)")
        mlen = gr.Slider(20, 120, 60, step=10, label="Max reply length (tokens)")
    clear = gr.Button("Start over")
    msg.submit(respond, [msg, chat, temp, mlen], [msg, chat])
    send.click(respond, [msg, chat, temp, mlen], [msg, chat])
    clear.click(lambda: ([], ""), None, chat)
    gr.Examples(["Hey! How are you today?", "What's your favorite hobby?",
                 "Tell me a joke", "I'm learning Python, any advice?"], inputs=msg)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", 7860)))
