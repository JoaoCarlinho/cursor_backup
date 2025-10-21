# from flask import Blueprint, request
# import asyncio
# from app.src.controllers.task_controllers import *

# tasks_blueprint = Blueprint("tasks", __name__, url_prefix="/api/v1/tasks")


# @tasks_blueprint.route("/", methods=["GET", "POST"])
# def base_route():
#     if request.method == "GET":
#         return asyncio.run(get_tasks())
#     else:
#         return asyncio.run(create_task())


# @tasks_blueprint.route("/<uuid:task_id>", methods=["GET", "PUT", "DELETE"])
# def params_route(task_id):
#     if request.method == "GET":
#         return asyncio.run(get_task(task_id))

#     if request.method == "PUT":
#         return asyncio.run(update_task(task_id))

#     if request.method == "DELETE":
#         return asyncio.run(remove_task(task_id))