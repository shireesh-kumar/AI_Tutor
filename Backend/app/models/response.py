from typing import Any

class Response:
    def __init__(self, data: Any = None, status_code: int = 200, message: str = "Success", result: bool=True):
        self.data = data
        self.status_code = status_code
        self.message = message
        self.result = result
    
    @classmethod
    def success(cls, data: Any = None, message: str = "Operation successful"):
        return cls(data=data, status_code=200, message=message, result=True)
    
    @classmethod
    def failure(cls, message: str, status_code: int = 400, data: Any = None):
        return cls(data=data, status_code=status_code, message=message, result=False)
    
    def to_dict(self) -> dict:
        return {
            "data": self.data,
            "status_code": self.status_code,
            "message": self.message,
            "result": self.result
        }
    