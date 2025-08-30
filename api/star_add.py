from http.server import BaseHTTPRequestHandler
import json
import os
from supabase import create_client, Client

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Initialize Supabase client
            SUPABASE_URL = os.environ.get("SUPABASE_URL")
            SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Get client IP (handle various proxy headers)
            client_ip = self.client_address[0]
            if 'x-forwarded-for' in self.headers:
                client_ip = self.headers['x-forwarded-for'].split(',')[0].strip()
            elif 'x-real-ip' in self.headers:
                client_ip = self.headers['x-real-ip']
            
            # Extract data from request
            session_id = request_data.get('session_id')
            user_agent = request_data.get('user_agent', '')
            
            if not session_id:
                raise ValueError("session_id is required")
            
            # Add star using database function
            result = supabase.rpc('add_star', {
                'user_ip': client_ip,
                'user_session': session_id,
                'user_agent_string': user_agent
            }).execute()
            
            # Return response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            self.wfile.write(json.dumps(result.data).encode())
            
        except Exception as e:
            print(f"Error adding star: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()