from config import db, ma
from marshmallow import Schema, fields, validates, ValidationError


class File (db.Model):
    __tablename__ = "files"
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String, nullable=False)
    storage_location = db.Column(db.String, nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    upload_date = db.Column(db.DateTime, server_default=db.func.now())
    file_extension = db.Column(db.String, nullable=False)
    doc_type = db.Column(db.String)


class Index(db.Model):
    __tablename__ = "indexes"
    id = db.Column(db.Integer, primary_key=True)
    index_name = db.Column(db.String, nullable=False)
    dimensions = db.Column(db.Integer, nullable=False)


class IndexTask(db.Model):
    __tablename__ = "index_tasks"
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String)
    status = db.Column(db.String, default='queued')
    result = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    requested_at = db.Column(db.DateTime)
    finished_at = db.Column(db.DateTime)
    chunk_start = db.Column(db.DateTime)
    chunk_end = db.Column(db.DateTime)
    document_count = db.Column(db.Integer)
    index_name = db.Column(db.String)


class EmbeddingTask(db.Model):
    __tablename__ = "embed_tasks"
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String)
    embedding_model = db.Column(db.String)
    embedding_tokens = db.Column(db.Integer)
    job_id = db.Column(db.String)
    status = db.Column(db.String, default='queued')
    result = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    requested_at = db.Column(db.DateTime)
    finished_at = db.Column(db.DateTime)


class PromptTask(db.Model):
    __tablename__ = "prompt_tasks"
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String)  # the job ID from the task queue
    prompt_text = db.Column(
        db.Text,
        nullable=False
        )  # the text for a prompt
    instructions = db.Column(
        db.Text,
        nullable=False
        )  # the instructions for a prompt
    index_name = db.Column(
        db.String
        )  # index for embeddings
    response_text = db.Column(db.Text)  # model's response
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    model_name = db.Column(db.String, nullable=False)  # model to embed prompt
    requested_at = db.Column(db.DateTime)
    finished_at = db.Column(db.DateTime)
    tokens = db.Column(db.Integer)
    # sources for embeddings ("elasticsearch", "other_vector_db", etc.)
    # index_sources = db.Column(db.String, nullable=False)


class TaskSchema(ma.Schema):
    class Meta:
        fields = ("id", "name", "status", "created_at", "updated_at")


class FileSchema(Schema):  # Marshmallow Schema - validation/serialization
    id = fields.Int(dump_only=True)
    filename = fields.Str(required=True)
    storage_location = fields.Str(required=True)
    file_size = fields.Integer(required=True)
    upload_date = fields.DateTime(required=True)
    doc_type = fields.Str(required=True)


task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)
