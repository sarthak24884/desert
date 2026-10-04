import http.server
import socketserver
import os
import webbrowser
import time

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving BHUMI Desertification Portal at http://127.0.0.1:{PORT}")
        cache_buster_url = f"http://127.0.0.1:{PORT}/index.html?t={int(time.time())}"
        webbrowser.open(cache_buster_url)
        httpd.serve_forever()
