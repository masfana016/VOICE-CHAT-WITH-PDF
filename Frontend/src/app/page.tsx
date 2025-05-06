'use client'

import { useState, useRef, useEffect } from 'react';

// Base64-encoded placeholder images
const botAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Q0E1ODQiLz4KPHBhdGggZD0iTTE1IDE1QzE1LjU1MjMgMTUgMTYgMTQuNTUyMyAxNiAxNEgxN0MxNy40NDc3IDE0IDE3Ljg5NTQgMTQuNDQ3NyAxNy44OTU0IDE1VjE2SDE1VjE1WiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNMjUgMTVDMjQuNDQ3NyAxNSAyNCAxNC41NTIzIDI0IDE0SDIzQzIyLjU1MjMgMTQgMjIuMTA0NiAxNC40NDc3IDIyLjEwNDYgMTVWMThIMjVWMVoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTE2IDIyQzE2LjU1MjMgMjIgMTcgMjIuNDQ3NyAxNyAyM0gyM0MyMy40NDc3IDIzIDIzLjg5NTQgMjIuNDQ3NyAyMy44OTU0IDIySDE2WiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=';
const userAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM5Y2E4YTIiLz4KPHBhdGggZD0iTTE1IDE2QzE1LjU1MjMgMTYgMTYgMTUuNTUyMyAxNiAxNUgxN0MxNy40NDc3IDE1IDE3Ljg5NTQgMTUuNDQ3NyAxNy44OTU0IDE2VjE3SDE1VjE2WiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNMjUgMTZDMjQuNDQ3NyAxNiAyNCAxNS41NTIzIDI0IDE1SDIzQzIyLjU1MjMgMTUgMjIuMTA0NiAxNS40NDc3IDIyLjEwNDYgMTZWMThIMjVWMVoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTE2IDIzQzE2LjU1MjMgMjMgMTcgMjMuNDQ3NyAxNyAyNEgyM0MyMy40NDc3IDI0IDIzLjg5NTQgMjMuNDQ3NyAyMy44OTU0IDIzSDE2WiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=';
const logo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM1Y2I1OTMiLz4KPHBhdGggZD0iTTI0IDE1QzI0LjU1MjMgMTUgMjUgMTQuNTUyMyAyNSAxNEgyN0MyNy40NDc3IDE0IDI3Ljg5NTQgMTQuNDQ3NyAyNy44OTU0IDE1VjE4SDE1VjE1QzE1LjU1MjMgMTUgMTYgMTQuNTUyMyAxNiAxNEgxOFYxNVoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTE1IDI3QzE1LjU1MjMgMjcgMTYgMjcuNDQ3NyAxNiAyOEgyM0MyMy40NDc3IDI4IDIzLjg5NTQgMjcuNDQ3NyAyMy44OTU0IDI3SDE1WiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=';

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  file?: File;
  fileType?: string;
  filePreview?: string | null;
  timestamp: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'bot', text: 'Welcome! How may I assist you today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or image (PNG/JPEG).');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    if (loading) return;

    // Stop speech recognition if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages: Message[] = [];
    if (input.trim()) {
      newMessages.push({ id: messages.length + 1, type: 'user', text: input, timestamp });
    }
    if (selectedFile) {
      newMessages.push({
        id: messages.length + newMessages.length + 1,
        type: 'user',
        text: `Uploaded: ${selectedFile.name}`,
        file: selectedFile,
        filePreview: filePreview,
        fileType: selectedFile.type,
        timestamp,
      });
    }

    setMessages([...messages, ...newMessages]);
    setInput('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (input.trim()) {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8001/generateanswer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input_text: input }),
        });

        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: 'bot',
            text: data.response || 'No response generated.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } catch (err) {
        console.error('Error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: 'bot',
            text: 'Error: Unable to fetch response.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      setLoading(false);
    } else if (selectedFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: 'bot',
          text: `Received file: ${selectedFile.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleNewChat = () => {
    setMessages([{ id: 1, type: 'bot', text: 'Welcome! How may I assist you today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex h-screen bg-emerald-50 font-sans">
      {/* Sidebar */}
      <div className="w-56 bg-white bg-opacity-80 backdrop-blur-md hidden md:block rounded-r-2xl">
        <div className="p-4 border-b border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-800">Conversations</h2>
        </div>
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-4 bg-emerald-100 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-200 hover:shadow-glow transition-all duration-200"
          >
            + New Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-emerald-700 bg-opacity-80 backdrop-blur-md text-white p-4 rounded-b-2xl max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="w-8 h-8 mr-2 rounded-full" />
              <h1 className="text-xl font-bold">Chatbot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="hover:scale-110 transition-transform duration-200">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="hover:scale-110 transition-transform duration-200">
                <img src={userAvatar} alt="User" className="w-8 h-8 rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-emerald-50 bg-opacity-50 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%222%22 fill=%22%23d1fae5%22/%3E%3C/svg%3E')]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 items-start animate-slide-in ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
              data-type={message.type}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <img src={botAvatar} alt="Bot" className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <div
                  className={`max-w-xs md:max-w-md p-4 rounded-xl shadow-md bg-opacity-80 ${
                    message.type === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                  {message.file && (
                    <div className="mt-3">
                      {message.fileType?.startsWith('image/') && message.filePreview ? (
                        <img
                          src={message.filePreview}
                          alt={message.file.name}
                          className="max-w-full h-auto rounded-lg"
                        />
                      ) : message.fileType === 'application/pdf' ? (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>{message.file.name}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                  <div className="text-xs text-emerald-400 mt-1">{message.timestamp}</div>
                </div>
                {message.type === 'user' && (
                  <img src={userAvatar} alt="User" className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-200"></span>
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-400"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 border-t border-emerald-100 shadow-lg">
          <form onSubmit={handleSend} className="flex items-center">
            <div className="flex-1 flex items-center border border-emerald-200 rounded-xl bg-white bg-opacity-90 shadow-sm">
              <svg className="w-7 h-7 text-emerald-600 ml-4 hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type or speak your message..."
                className="flex-1 p-4 pl-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-xl"
                disabled={loading}
              />
              <div className="relative p-4">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`relative z-10 ${isListening ? 'text-emerald-600' : 'text-gray-600'} hover:text-emerald-700 hover:scale-110 transition-all duration-200`}
                  disabled={loading}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-40 animate-wave"></span>
                    <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-40 animate-wave delay-200"></span>
                    <span className="absolute inset-0 rounded-full bg-emerald-300 opacity-40 animate-wave delay-400"></span>
                  </>
                )}
              </div>
              <label className="p-4 cursor-pointer">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,application/pdf"
                  className="hidden"
                  disabled={loading}
                />
                <svg className="w-7 h-7 text-emerald-600 hover:text-emerald-700 hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 008.485 8.485l6.586-6.586" />
                </svg>
              </label>
            </div>
            <button
              type="submit"
              className={`ml-4 bg-emerald-600 text-white p-4 rounded-xl hover:bg-emerald-700 hover:shadow-glow transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              <svg className="w-7 h-7 stroke-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          {selectedFile && (
            <div className="mt-3 text-sm text-emerald-600">
              Selected: {selectedFile.name}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes wave {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-wave {
          animation: wave 1.2s infinite ease-out;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-slide-in[data-type="user"] {
          animation-direction: reverse;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce {
          animation: bounce 0.6s infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        html, body {
          font-family: 'Inter', sans-serif;
        }
        .shadow-glow {
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}