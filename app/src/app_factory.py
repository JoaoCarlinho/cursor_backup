from flask import Flask
from flask_migrate import Migrate
from flasgger import Swagger
from dotenv import load_dotenv
from .database.config import db_init
from config import db, ma, init_env_vars
# from .routes.tasks_routes import tasks_blueprint


def create_app():
    load_dotenv()
    env_vars = init_env_vars("DOCKER")
    app = Flask(__name__)
    swagger = Swagger(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = env_vars.get("database_uri_full")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # app.register_blueprint(tasks_blueprint)
    db_init(env_vars)
    db.init_app(app)
    ma.init_app(app)
    migrate = Migrate(app, db)

    @app.before_request
    def create_tables():
        db.create_all()

    return app
