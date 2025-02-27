# create_db.py
from backend.database.database import engine, Base
import backend.models  # This will import all model definitions from the models folder

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")
