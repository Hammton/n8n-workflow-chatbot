# n8n Workflow Assistant

An AI-powered web application that helps users discover and find relevant n8n workflows through intelligent search and recommendations.

## 🌟 Features

- **AI-Powered Search**: Uses Azure OpenAI embeddings to find relevant workflows
- **Interactive Chat Interface**: Real-time streaming responses with workflow recommendations
- **GitHub-Style Star Counter**: Track user engagement with persistent star counting
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - High-performance Python web framework
- **Supabase** - PostgreSQL database with vector search
- **Azure OpenAI** - Embeddings and chat completions
- **LangChain** - AI application framework

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- Supabase account
- Azure OpenAI account

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd n8n-workflow-assistant
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Backend Setup
```bash
cd api
pip install -r requirements.txt
```

### 4. Environment Configuration

Create `.env` file in the `api` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
AZURE_OPENAI_CHAT_API_KEY=your_azure_openai_key
AZURE_OPENAI_CHAT_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_EMBEDDING_API_KEY=your_embedding_key
AZURE_OPENAI_EMBEDDING_ENDPOINT=your_embedding_endpoint
```

### 5. Database Setup

Run the SQL setup files in your Supabase SQL Editor:
1. `supabase_setup.sql` - Main database functions
2. `star_counter_setup.sql` - Star counter tables and functions

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd api
python main.py
```

2. **Start the frontend development server:**
```bash
cd frontend
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── chat.tsx    # Chat interface
│   │   │   ├── landing-page.tsx
│   │   │   ├── star-counter.tsx
│   │   │   └── ...
│   │   └── app/            # Next.js app router
│   ├── package.json
│   └── tailwind.config.ts
├── api/                     # FastAPI backend
│   ├── main.py             # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── supabase_setup.sql      # Database setup
├── star_counter_setup.sql  # Star counter setup
└── README.md
```

## 🎯 Key Components

### Star Counter
- GitHub-style star counter in top-right corner
- Persistent storage with Supabase integration
- Offline mode with localStorage fallback
- Prevents duplicate stars per session

### Chat Interface
- Real-time streaming responses
- Source document display
- Markdown rendering with bold text support
- Mobile-responsive design

### Landing Page
- Interactive bento grid layout
- Animated workflow demonstrations
- Profile header with contact information
- Responsive footer with social links

## 🔧 API Endpoints

- `POST /query/stream` - Stream workflow recommendations
- `POST /query` - Get workflow recommendations (fallback)
- `GET /stars/count` - Get current star count
- `POST /stars/add` - Add a star
- `GET /stars/check/{session_id}` - Check if user has starred

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hammton Ndeke**
- LinkedIn: [hammton-ndeke](https://www.linkedin.com/in/hammton-ndeke/)
- WhatsApp: [+254708235245](https://wa.me/+254708235245)

## 🙏 Acknowledgments

- n8n community for workflow templates
- Azure OpenAI for AI capabilities
- Supabase for database and hosting
- shadcn/ui for beautiful components