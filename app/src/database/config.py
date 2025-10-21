import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils.functions import database_exists
from sqlalchemy.sql import text


def db_init(env_vars):
    load_dotenv()

    SQLALCHEMY_DATABASE_URL_FULL = env_vars.get("database_uri_full")
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL_FULL
    )

    if not database_exists(engine.url):
        SQLALCHEMY_DATABASE_URL_INIT = env_vars.get("database_uri")
        eng = create_engine(
            SQLALCHEMY_DATABASE_URL_INIT
        )
        conn = sessionmaker(autocommit=False, autoflush=False, bind=eng)()
        try:
            conn.connection().connection.set_isolation_level(0)
            sql_create = text('CREATE DATABASE flasktodos;')
            conn.execute(sql_create)
            conn.connection().connection.set_isolation_level(1)

        except Exception as ex:
            print("Problem when initializing the database")
        finally:
            conn.close()