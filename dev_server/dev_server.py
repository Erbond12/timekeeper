from livereload import Server, shell
from pathlib import Path

# Get the directory ABOVE this file
project_root = '../docs/'
print(project_root)

server = Server()
server.watch(project_root, delay=1)
server.serve(root=project_root, 
            host='localhost',
            port=8000,
            liveport=None)