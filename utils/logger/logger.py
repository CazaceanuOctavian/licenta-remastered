import logging
import os
import datetime
import sys
from typing import Optional, Union, Literal, Dict, Any


class Logger:
    """
    A customizable logger class for Python applications.
    
    Features:
    - Log to console and/or file
    - Multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    - Customizable formatting
    - Rotation options for log files
    """
    
    LOG_LEVELS = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
        "CRITICAL": logging.CRITICAL
    }
    
    def __init__(
        self,
        name: str = "app",
        log_level: str = "INFO",
        log_to_console: bool = True,
        log_to_file: bool = False,
        log_file_path: Optional[str] = None,
        log_format: Optional[str] = None,
        date_format: str = "%Y-%m-%d %H:%M:%S",
        rotate_logs: bool = False,
        max_log_size_mb: int = 10,
        backup_count: int = 5
    ):
        """
        Initialize the logger with custom settings.
        
        Args:
            name: Name of the logger
            log_level: Minimum log level to record
            log_to_console: Whether to output logs to console
            log_to_file: Whether to save logs to a file
            log_file_path: Path to log file (default: ./logs/{name}.log)
            log_format: Custom log format (default: '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            date_format: Format for datetime in logs
            rotate_logs: Whether to rotate log files when they reach max_log_size_mb
            max_log_size_mb: Maximum size of log file before rotation (in MB)
            backup_count: Number of backup log files to keep
        """
        self.name = name
        self.logger = logging.getLogger(name)
        
        # Set log level
        if log_level not in self.LOG_LEVELS:
            raise ValueError(f"Invalid log level: {log_level}. Must be one of {list(self.LOG_LEVELS.keys())}")
        self.logger.setLevel(self.LOG_LEVELS[log_level])
        
        # Clear any existing handlers
        if self.logger.handlers:
            self.logger.handlers.clear()
            
        # Set log format
        if log_format is None:
            log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        formatter = logging.Formatter(log_format, datefmt=date_format)
        
        # Console handler
        if log_to_console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
        
        # File handler
        if log_to_file:
            if log_file_path is None:
                # Create logs directory if it doesn't exist
                os.makedirs("logs", exist_ok=True)
                log_file_path = f"logs/{name}.log"
                
            if rotate_logs:
                from logging.handlers import RotatingFileHandler
                file_handler = RotatingFileHandler(
                    log_file_path,
                    maxBytes=max_log_size_mb * 1024 * 1024,
                    backupCount=backup_count
                )
            else:
                file_handler = logging.FileHandler(log_file_path)
                
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)
    
    def debug(self, message: str, extra: Dict[str, Any] = None):
        """Log a debug message."""
        self.logger.debug(message, extra=extra)
    
    def info(self, message: str, extra: Dict[str, Any] = None):
        """Log an info message."""
        self.logger.info(message, extra=extra)
    
    def warning(self, message: str, extra: Dict[str, Any] = None):
        """Log a warning message."""
        self.logger.warning(message, extra=extra)
    
    def error(self, message: str, extra: Dict[str, Any] = None):
        """Log an error message."""
        self.logger.error(message, extra=extra)
    
    def critical(self, message: str, extra: Dict[str, Any] = None):
        """Log a critical message."""
        self.logger.critical(message, extra=extra)
    
    def exception(self, message: str, exc_info=True, extra: Dict[str, Any] = None):
        """Log an exception with traceback."""
        self.logger.exception(message, exc_info=exc_info, extra=extra)


# Create a convenience function to get a logger instance
def get_logger(
    name: str = "app",
    log_level: str = "INFO",
    **kwargs
) -> Logger:
    """
    Convenience function to create a Logger instance with custom settings.
    
    Args:
        name: Name of the logger
        log_level: Minimum log level to record
        **kwargs: Additional arguments to pass to Logger constructor
    
    Returns:
        Logger: Configured logger instance
    """
    return Logger(name=name, log_level=log_level, **kwargs)