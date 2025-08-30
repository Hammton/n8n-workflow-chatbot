from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs
from supabase import create_client, Client

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse URL to get session_id
            parsed_url = urlparse(self.path)
            path_parts = parsed_url.path.strip('/').split('/')
            
            # Extract session_id from path (format: /api/star_check?session_id=xxx or /api/star_check/xxx)
            session_id = None
            if len(path_parts) > 1:
                session_id = path_parts[-1]  # Last part of path
            else:
                # Try query parameters
                query_params = parse_qs(parsed_url.query)
                if 'session_id' in query_params:
                    session_id = query_params['session_id'][0]
            
            if not session_id:
                raise ValueError("session_id is required")
            
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
            
            # Check if user has starred using database function
            result = supabase.rpc('has_user_starred', {
                'user_ip': client_ip,
                'user_session': session_id
            }).execute()
            
            # Return response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {"has_starred": result.data}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Error checking star status: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"error": str(e), "has_starred": False}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()