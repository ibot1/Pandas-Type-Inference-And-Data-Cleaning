import os
import uuid


class NamedTemporaryFile:
    
    def __init__(self, suffix = ".txt"):
        # TODO: ensure there are no mischievious suffix in here
        self.name = f"./tmp/{uuid.uuid4().hex}{suffix}"
        open(file = self.name, mode = "w").close()
     
    def __del__(self):
        os.remove(self.name)
    
    def file(self):
        return open(file = self.name, mode = "r", encoding = 'utf-8')