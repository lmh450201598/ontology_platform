// 流式对话示例组件
import React, { useState, useRef } from 'react';
import { streamConversation, StreamMessage } from '@/src/api/streamClient';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function StreamChatExample() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsStreaming(true);
    setStreamingText('');

    try {
      let fullResponse = '';
      let finalOntology: any = null;

      // 使用流式API
      for await (const chunk of streamConversation(
        userMsg,
        sessionIdRef.current,
        !sessionIdRef.current // 第一次请求包含当前本体
      )) {
        if (chunk.error) {
          toast.error(chunk.error);
          break;
        }

        if (chunk.content) {
          fullResponse += chunk.content;
          setStreamingText(fullResponse);
        }

        if (chunk.done) {
          finalOntology = chunk.ontology;
          break;
        }
      }

      // 完成流式输出，添加到消息列表
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: fullResponse 
      }]);
      setStreamingText('');

      // 如果有本体数据，可以在这里处理
      if (finalOntology) {
        console.log('Generated ontology:', finalOntology);
      }

    } catch (err: any) {
      toast.error(err.message || '请求失败');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <pre className="whitespace-pre-wrap text-sm">{msg.text}</pre>
            </div>
          </div>
        ))}
        
        {/* 流式输出中 */}
        {isStreaming && streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-slate-100">
              <pre className="whitespace-pre-wrap text-sm">{streamingText}</pre>
              <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isStreaming}
        />
        <Button 
          onClick={handleSend} 
          disabled={isStreaming || !input.trim()}
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
