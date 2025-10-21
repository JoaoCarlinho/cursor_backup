from flask import jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from marshmallow import ValidationError

from werkzeug.exceptions import HTTPException
from src.app_factory import create_app
from src.interfaces.task_response import TaskResponse
from src.models.task_model import File, PromptTask, db
from minio import Minio
from minio.error import S3Error
from rq import Queue
from redis import Redis
from datetime import datetime
import os
import io
import json
from dotenv import load_dotenv

import urllib3  # Suppress only the single InsecureRequestWarning from urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

app = create_app()
app.app_context().push()
redis_conn = Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=os.getenv("REDIS_PORT", 6379))
task_queue = Queue('tasks', connection=redis_conn)

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")  # Adjust for your MinIO instance
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME")

CORS(app)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    message_queue='redis://redis:6379/0')


def create_minio_bucket_if_not_exists(bucket_name):
    """
    Connects to a MinIO and creates a bucket if it does not already exist.

    Args:
        endpoint (str): The MinIO server endpoint (e.g., "play.min.io").
        access_key (str): The access key for your MinIO account.
        secret_key (str): The secret key for your MinIO account.
        bucket_name (str): The name of the bucket to create.
        secure (bool): Wuse a secure (HTTPS) connection? Defaults to True.
    consumes:
      - application/json
    parameters:
      - in: json
        endpoint: string
        access_key: string
        secret_key: string
        bucket_name: string
        secure: boolean
    responses:
      200:
        description: Bucket created or already exists
      400:
        description: Invalid input
      500:
        description: MinIO or PostgreSQL error
    """
    try:
        # Initialize MinIO client
        minio_client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False  # Set to True if using HTTPS
        )
        # Check if the bucket exists
        if not minio_client.bucket_exists(bucket_name):
            # If the bucket does not exist, create it
            minio_client.make_bucket(bucket_name)
            print(f"Bucket '{bucket_name}' created successfully.")
        else:
            print(f"Bucket '{bucket_name}' already exists.")

    except S3Error as e:
        print(f"Error interacting with MinIO: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


@app.route("/upload", methods=["POST"])
def upload_file():
    """
    Uploads a file to MinIO and tracks it in PostgreSQL.
    Expects a multipart/form-data request with a file field named 'file'.
    consumes:
      - multipart/form-data
      parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: The file to upload.
        responses:
        200:
            description: File uploaded and tracked successfully
        400:
            description: No file part in the request or no selected file
        500:
            description: MinIO or PostgreSQL error
    """
    if "file" not in request.files:
        return jsonify({"message": "No file part in the request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if file:
        f_n = file.filename
        file_extension = os.path.splitext(f_n)[1]

        # Upload to MinIO
        try:
            file_data = file.read()
            file_size = len(file_data)
            object_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{f_n}"

            create_minio_bucket_if_not_exists(MINIO_BUCKET_NAME)
            minio_client = Minio(
                MINIO_ENDPOINT,
                access_key=MINIO_ACCESS_KEY,
                secret_key=MINIO_SECRET_KEY,
                secure=False  # Set to True if using HTTPS
            )

            minio_client.put_object(
                MINIO_BUCKET_NAME,
                object_name,
                data=io.BytesIO(file_data),
                length=file_size,
                content_type=file.content_type
            )
            storage_location = f"minio://{MINIO_BUCKET_NAME}/{object_name}"
        except Exception as e:
            return jsonify({"message": f"MinIO upload failed: {str(e)}"}), 500

        # Store in PostgreSQL
        try:
            new_file = File(
                filename=f_n,
                storage_location=storage_location,
                file_size=file_size,
                upload_date=datetime.now(),
                file_extension=file_extension
            )
            db.session.add(new_file)
            db.session.commit()
        except Exception as e:
            return jsonify(
                {
                    "message": f"PostgreSQL insertion failed: {str(e)}"
                }), 500

        return jsonify(
            {
                "message": "File uploaded and tracked successfully",
                "filename": f_n,
                "strorage_location": storage_location

            }), 200


@app.route('/files', methods=['GET'])
def get_all_files():
    """
    Returns a list of all files stored in the PostgreSQL database.
    
    responses:
      200:
        description: A list of files
      500:
        description: Database error
    """
    # Define a list to store the schema instance
    schema_list = []
    # Get all existing file instances using SQLAlchemy's query method
    files = File.query.all()

    # Initialize the schema list
    # schema = FileSchema()
    for file in files:
        # # Add each file instance to the schema list(validation)
        # schema_list.append(schema.load(file))
        schema_list.append({
            "id": file.id,
            "filename": file.filename,
            "storage_location": file.storage_location,
            "file_size": file.file_size,
            "upload_date": file.upload_date,
            "file_extension": file.file_extension,
            "doc_type": file.doc_type,
            # add other fields as needed
        })
    return jsonify(schema_list), 200

    # # Create a JSON response with the list of schemas
    # return jsonify(schema_list)


@app.route('/get-context-aided-support', methods=['POST'])
def get_context_aided_support():
    """
    Add endpoint to prompt ollama model and instruct it to generate
    cover letters, and other documentation to support responses to
    job opennings.
    consumes:
        - application/json
    parameters:
        - in: json
            prompt: string
            prompt_model: string
            additional_context: string
            instructions: string
            files: array ([{filename: string, storage_location: string}])
    responses:
        200:
            description: Job support task queued
        400:
            description: query and instructions required for feedback
    """
    data = request.get_json()
    prompt_text = data.get('prompt')
    prompt_model = data.get('prompt_model')
    additional_context = data.get('additional_context')
    instructions = data.get('instructions')
    files = data.get('files', [])
    if not prompt_text or not instructions:
        socketio.emit(
            'prompt_response',
            {
                'status': 'rejected',
                'time_stamp': datetime.now().isoformat(),
            }
        )
        return jsonify({
            "success": False,
            "message": "query and instructions required for feedback"
        }), 400
    try:
        job = task_queue.enqueue(
            'tasks.generate_response',
            prompt_text,
            prompt_model,
            instructions,
            additional_context,
            files
            )

        socketio.emit(
            'prompt_response',
            {
                'status': 'queued',
                'time_stamp': datetime.now().isoformat()
            }
        )
        return jsonify({
            "job_id": job.id,
            "status": "job support task queued",
        }), 200
    except Exception as e:
        socketio.emit(
            'prompt_response',
            {
                'status': 'failed',
                'time_stamp': datetime.now().isoformat(),
                'error': str({e})
            }
        )
        print(f"Error fetching ticker info: {e}", flush=True)
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/get-prompt-response', methods=['GET'])
def get_prompt_response():
    """
    Returns the response for a specific prompt from the database.
    Query params:
      - prompt_id: the id of the prompt task (required)
    """
    prompt_task_id = request.args.get('prompt_task_id')
    print("Request for response for task:", prompt_task_id, flush=True)
    if not prompt_task_id:
        return jsonify({"success": False, "message": "need prompt_id"}), 400
    try:
        p_task = PromptTask.query.filter_by(id=int(prompt_task_id)).first()
        if not p_task:
            return jsonify({
                "success": False,
                "message": f"No prompt with id {prompt_task_id} exists"}), 404

        return jsonify({
            "prompt_id": p_task.id,
            "prompt_text": p_task.prompt_text,
            "index_name": p_task.index_name,
            "response_text": p_task.response_text,
            "created_at": p_task.created_at,
            "updated_at": p_task.updated_at
        }), 200
    except Exception as e:
        print(f"Error fetching prompt response: {e}", flush=True)
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/list-prompts', methods=['GET'])
def list_prompts():
    """
        loads historic prompt interactions stored in the postgres database
    """
    try:
        prompts = PromptTask.query.all()
        result = []
        for prompt in prompts:
            result.append({
                "id": prompt.id,
                "instructions": prompt.instructions,
                "prompt_text": prompt.prompt_text,
                "response_text": prompt.response_text,
                "model_name": prompt.model_name,
                "index_name": prompt.index_name,
                "requested_at": prompt.requested_at,
                "finished_at": prompt.finished_at,
                "job_id": prompt.job_id,
                # add other fields as needed
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.errorhandler(404)
def handle_not_found_error(error):
    return TaskResponse(
        False,
        "Request not found thrown in app.py",
        None
        ).to_json()


@app.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return TaskResponse(False, response, None).to_json()


@app.errorhandler(ValidationError)
def handle_validation_error(error):
    return TaskResponse(False, jsonify(error.messages), None).to_json()


if __name__ == "__main__":
    socketio.run(debug=True, port=5005, host='0.0.0.0')
