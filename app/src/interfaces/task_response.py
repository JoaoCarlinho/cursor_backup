class TaskResponse:
    def __init__(self, success, message, payload):
        self.success = success
        self.message = message
        self.payload = payload


    def to_json(self):
        return {
            "success": self.success,
            "message": self.message,
            "payload": self.payload
        }

    def to_list(self):
        return {
            "success": self.success,
            "message": self.message,
            "payload": self.payload,
            "count": len(self.payload)
        }