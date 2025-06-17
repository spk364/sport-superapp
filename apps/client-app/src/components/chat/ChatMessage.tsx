import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../../store';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Clean up markdown formatting for better display
  const cleanMarkdown = (text: string) => {
    return text
      // Ensure proper line breaks before bullet points
      .replace(/([.!?])\s*•/g, '$1\n\n•')
      // Clean up multiple asterisks (bold formatting)
      .replace(/\*\*(.*?)\*\*/g, '**$1**')
      // Ensure bullet points start on new lines
      .replace(/([^.\n])\s*•/g, '$1\n\n•')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };
  
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (timestamp.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return timestamp.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Custom markdown components for better styling
  const markdownComponents = {
    // Style paragraphs
    p: ({ children }: any) => (
      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    ),
    // Style strong/bold text
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    // Style emphasis/italic text
    em: ({ children }: any) => (
      <em className="italic text-gray-800">{children}</em>
    ),
    // Style unordered lists
    ul: ({ children }: any) => (
      <ul className="ml-2 mb-3 space-y-2">{children}</ul>
    ),
    // Style list items with custom bullets
    li: ({ children }: any) => (
      <li className="flex items-start">
        <span className="text-blue-500 mr-3 mt-1.5 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></span>
        <span className="flex-1 leading-relaxed">{children}</span>
      </li>
    ),
    // Style ordered lists
    ol: ({ children }: any) => (
      <ol className="ml-4 mb-3 space-y-2 list-decimal list-inside">{children}</ol>
    ),
    // Style headings with better hierarchy
    h1: ({ children }: any) => (
      <h1 className="text-base font-bold mb-3 text-gray-900 border-b border-gray-200 pb-1">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-sm font-bold mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-sm font-semibold mb-1 text-gray-800">{children}</h3>
    ),
    // Style code blocks
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    ),
    // Style blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-3 border-blue-300 pl-3 ml-2 italic text-gray-700 mb-3">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-900 shadow-sm border border-gray-200'
          }`}
        >
          {isUser ? (
            // User messages: simple text display
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
          ) : (
            // AI messages: markdown rendering
            <div className="text-sm max-w-none [&>*:last-child]:mb-0">
              <ReactMarkdown components={markdownComponents}>
                {cleanMarkdown(message.text)}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
          <span title={message.timestamp.toLocaleString('ru-RU')}>
            {formatDate(message.timestamp)} в {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
      
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 order-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}
    </div>
  );
}; 