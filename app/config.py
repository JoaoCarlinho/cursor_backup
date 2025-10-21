import os
from dotenv import load_dotenv
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
ma = Marshmallow()


def init_env_vars(state):
    load_dotenv()
    if state == "LOCAL":
        return {
            "database_uri_full": os.environ.get("DATABASE_URL_LOCAL_FULL"),
            "database_uri": os.environ.get("DATABASE_URL_LOCAL")
        }

    else:
        return {
            "database_uri_full": os.environ.get("DATABASE_URL_FULL"),
            "database_uri": os.environ.get("DATABASE_URL")
        }
