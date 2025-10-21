# This file is implicitly used by RQ worker to find the task function.
# The 'long_running_task' function from flask_app/app.py is imported here
# to make it discoverable by the RQ worker. In a real application,
# you might have a dedicated 'tasks.py' file.
from tasks import (
    generate_response
    )
