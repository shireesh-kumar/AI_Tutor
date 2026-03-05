import logging

logging.basicConfig(level=logging.INFO)

def get_logger(name: str):
    """Get a logger instance for the given module name."""
    return logging.getLogger(name)

