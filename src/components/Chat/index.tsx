import React, { useRef, useEffect } from 'react';
import { Input, Button, Spin, List, Tag } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useChatStore } from '@/store/chatStore';
import { llmService } from '@/services/llm';
import { QuickReply } from '@/types/chat';

const ChatPanel: React.FC = () => {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, currentContext } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickReply = async (reply: QuickReply) => {
    setLoading(true);
    try {
      addMessage({
        role: 'user',
        content: reply.text,
        intent: reply.type === 'attribute' ? {
          type: 'attribute_update',
          nodeId: reply.metadata?.nodeId,
          attributeKey: reply.metadata?.attributeKey,
          value: reply.value
        } : undefined
      });

      const response = await llmService.chat(reply.text, {
        flowId: currentContext.flowId,
        currentNode: currentContext.nodeId ? {
          id: currentContext.nodeId,
          type: 'process' // 这里应该从flowStore获取实际类型
        } : undefined,
        history: messages
      });

      addMessage({
        role: 'assistant',
        content: response.content,
        quickReplies: response.quickReplies,
        context: response.context
      });
    } catch (error) {
      console.error('Quick reply error:', error);
      addMessage({
        role: 'assistant',
        content: '抱歉，处理消息时出现错误。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setLoading(true);

    try {
      addMessage({
        role: 'user',
        content: userMessage
      });

      const response = await llmService.chat(userMessage, {
        flowId: currentContext.flowId,
        currentNode: currentContext.nodeId ? {
          id: currentContext.nodeId,
          type: 'process' // 这里应该从flowStore获取实际类型
        } : undefined,
        history: messages
      });

      addMessage({
        role: 'assistant',
        content: response.content,
        quickReplies: response.quickReplies,
        context: response.context
      });
    } catch (error) {
      console.error('Send message error:', error);
      addMessage({
        role: 'assistant',
        content: '抱歉，处理消息时出现错误。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3 mb-2`}>
                <div>{msg.content}</div>
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.quickReplies.map((reply) => (
                      <Tag
                        key={reply.id}
                        className="cursor-pointer mr-2 mb-2"
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply.text}
                      </Tag>
                    ))}
                  </div>
                )}
                {msg.context?.suggestedActions && (
                  <div className="mt-2 text-xs text-gray-500">
                    建议操作:
                    {msg.context.suggestedActions.map((action, i) => (
                      <div key={i} className="ml-2">• {action}</div>
                    ))}
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="输入消息..."
            disabled={loading}
          />
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
