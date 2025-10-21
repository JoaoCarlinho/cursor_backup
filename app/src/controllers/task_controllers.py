# from flask import request
# from uuid import uuid4
# from app.config import db
# from app.src.models.task_model import Task, task_schema, tasks_schema
# from app.src.interfaces.task_response import TaskResponse

# invalid_request = TaskResponse(False, "Invalid request", None).to_json()


# async def get_tasks():
#     try:
#         tasks = Task.query.order_by(Task.updated_at.desc()).all()
#         json_tasks = tasks_schema.dump(tasks)
#         return TaskResponse(True, "Get all tasks", json_tasks).to_list()
#     except Exception as ex:
#         return invalid_request


# async def get_task(task_id):
#     try:
#         task = Task.query.get(task_id)

#         if task is None:
#             return invalid_request

#         json_task = task_schema.dump(task)
#         return TaskResponse(True, "Get task", json_task).to_json()
#     except Exception as ex:
#         return invalid_request


# async def create_task():
#     try:
#         body = request.json

#         if body is None:
#             return invalid_request

#         name = body.get("name")
#         status = body.get("status")

#         if name is None or status is None:
#             return invalid_request

#         task_id = uuid4()
#         new_task = Task(id=task_id, name=name, status=status)
#         json_task = task_schema.dump(new_task)
#         db.session.add(new_task)
#         db.session.commit()
#         return TaskResponse(True, "Created a task", json_task).to_json()
#     except Exception as ex:
#         print(ex)
#         return invalid_request


# async def update_task(task_id):
#     try:
#         task = Task.query.get(task_id)

#         if task is None:
#             return invalid_request

#         name = request.json.get("name")
#         status = request.json.get("status")

#         if name is None or status is None:
#             return invalid_request

#         task.name = name
#         task.status = status
#         json_task = task_schema.dump(task)
#         db.session.add(task)
#         db.session.commit()
#         return TaskResponse(True, "Updated a task", json_task).to_json()
#     except Exception as ex:
#         return invalid_request


# async def remove_task(task_id):
#     try:
#         task = Task.query.get(task_id)

#         if task is None:
#             return invalid_request

#         removed_task = task_schema.dump(task)
#         db.session.delete(task)
#         db.session.commit()
#         return TaskResponse(True, "Removed a task", removed_task).to_json()
#     except Exception as ex:
#         return invalid_request
