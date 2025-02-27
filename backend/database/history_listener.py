# history_listener.py
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from datetime import datetime, timezone
from backend.models.edit_history import EditHistory
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_edit_history(session: Session):
    # Loop through all updated objects in the session.
    for instance in session.dirty:
        # Skip if the object isn’t modified or is an EditHistory record itself.
        if not session.is_modified(instance, include_collections=False):
            continue
        if isinstance(instance, EditHistory):
            continue

        table_name = instance.__tablename__
        record_id = getattr(instance, "id", 0)  # Use 0 if id isn’t set yet.

        # Use SQLAlchemy’s inspection to check attribute changes.
        insp = inspect(instance)
        for attr in insp.attrs:
            hist = attr.history
            if hist.has_changes():
                old_value = hist.deleted[0] if hist.deleted else None
                new_value = hist.added[0] if hist.added else None

                # Log only if the value actually changed.
                if old_value != new_value:
                    logger.info(f"Change detected in {table_name}: {attr.key} from '{old_value}' to '{new_value}'")

                    
                    edit_history = EditHistory(
                        edited_by="system",  # Replace with current user if available.
                        field_changed=attr.key,
                        old_value=str(old_value) if old_value is not None else None,
                        new_value=str(new_value) if new_value is not None else None,
                        record_id=record_id,
                        table_name=table_name,
                    )
                    session.add(edit_history)

@event.listens_for(Session, "after_flush")
def after_flush(session, flush_context):
    logger.info("after_flush event triggered.")
    create_edit_history(session)
