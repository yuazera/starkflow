import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from '@/types/chat';
import { Button, Textarea } from '@nextui-org/react';
import React, { useState } from 'react';

const Chat: React.FC = () => {
  const { messages, addMessage } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      addMessage({
        content: inputMessage,
        role: 'user'
      });
      setInputMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col border-l border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: ChatMessage) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${message.role === 'assistant' ? 'bg-blue-50' : 'bg-green-50 ml-auto max-w-[80%]'}`}
          >
            <p className="text-sm text-gray-800">{message.content}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="输入消息..."
            minRows={1}
            maxRows={4}
            className="flex-1"
          />
          <Button type="submit" color="primary">
            发送
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
