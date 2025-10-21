import json
import ffmpeg
import os
import io
import pandas as pd
import numpy as np
from datetime import datetime
import requests
from requests.auth import HTTPBasicAuth
from flask_socketio import SocketIO
from app import app
from src.models.task_model import EmbeddingTask, Index
from src.models.task_model import IndexTask, PromptTask, db
from src.interfaces.query_prompt import QueryPrompt
from openai import OpenAI

from rq import Queue
from redis import Redis
from elasticsearch import Elasticsearch
from elasticsearch import helpers
from langchain_community.document_loaders import DirectoryLoader, TextLoader
import tiktoken
from roboflow import Roboflow
from minio import Minio

socketio = SocketIO(message_queue='redis://redis:6379/0')

redis_conn = Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=os.getenv("REDIS_PORT", 6379),
    )
task_queue = Queue('tasks', connection=redis_conn)
OPENAI_KEY = os.getenv("OPENAI_KEY")
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.environ.get("MINIO_BUCKET", "app-files")


minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)


def fetch_file_content(key):
    try:
        response = minio_client.get_object(MINIO_BUCKET, key)
        data = response.read()
        response.close()
        response.release_conn()
        return data.decode("utf-8", errors="ignore")
    except Exception as e:
        return f"<error reading {key}: {e}>"


def generate_response(
    prompt_text,
    prompt_model,
    instructions,
    additional_context="-",
    files=None
):
    """
    Generate a response using either the OpenAI API
    or Nomic API deployed on a local container.
    """
    try:
        response = ''
        # fetch contents
        file_texts = []
        for f in files:
            key = f.get("key")
            filename = f.get("filename")
            content = fetch_file_content(key)
            file_texts.append({
                "filename": filename,
                "key": key,
                "content": content
                })

        # Build context (simple concat; you can chunk/summarize large files)
        context_parts = []
        for ft in file_texts:
            context_parts.append(f"--- BEGIN FILE: {ft['filename']} ({ft['key']}) ---\n{ft['content']}\n--- END FILE ---\n")
        context_str = "\n".join(context_parts)

        match prompt_model:
            case 'o4-mini-2025-04-16':
                client = OpenAI(api_key=OPENAI_KEY)
                gen_resp = client.chat.completions.create(
                    model=prompt_model,
                    messages=[
                        {
                            "role": "system",
                            "content": instructions
                        },
                        {
                            "role": "user",
                            "content": f'Context: {additional_context + context_str}\n\nQuestion: {prompt_text}'
                        },
                    ],
                    # max_tokens=100,  # Limit the response length
                    # temperature=0.7, # Control creativity (0.0-1.0)
                )
                print(f'Response : {gen_resp.choices[0].message.content}')
                response = gen_resp.choices[0].message.content
            case 'llama3.2:1b' | 'llama3:latest':
                full_prompt = f"{instructions}\n{additional_context + context_str}\n{prompt_text}"
                # Run the prompt through the Ollama model using subprocess
                ollama_url = 'http://host.docker.internal:11434/api/generate'
                payload = {
                    "model": prompt_model,
                    "prompt": full_prompt,
                    "stream": False  # Set to True for streaming responses
                }
                gen_resp = requests.post(
                    ollama_url,
                    data=json.dumps(payload))
                gen_resp.raise_for_status()
                print(f'Model Response text : {gen_resp.json()["response"]}')
                response = gen_resp.json()['response']
            case _:  # Default case (wildcard)
                raise ValueError(
                    f"Unsupported prompt model: {prompt_model}. "
                    "Supported models are: o4-mini-2025-04-16, llama3.2:1b"
                )
        socketio.emit(
                'prompt_response',
                {
                    'status': 'generated',
                    'response': response,
                    'time_stamp': datetime.now().isoformat(),
                    'id': 1,
                }
            )
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
