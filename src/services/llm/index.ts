import axios from 'axios';
import { ChatContext } from '@/types/chat';
import { TemplateQuestion } from '@/types/flow';

class LLMService {
  private baseUrl: string;
  private templateQuestions: TemplateQuestion[];

  constructor() {
    this.baseUrl = 'http://localhost:11434'; // Ollama default port
    this.templateQuestions = [];
  }

  async connect() {
    try {
      await axios.get(this.baseUrl);
      return true;
    } catch (error) {
      console.error('Failed to connect to Ollama:', error);
      return false;
    }
  }

  setTemplateQuestions(questions: TemplateQuestion[]) {
    this.templateQuestions = questions;
  }

  private getTemplateQuestions(nodeType?: string) {
    return this.templateQuestions.find(t => t.nodeType === nodeType)?.questions || [];
  }

  async chat(message: string, context: ChatContext) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: 'llama2',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant guiding users through a workflow process.'
          },
          ...context.history.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ]
      });

      const questions = this.getTemplateQuestions(context.currentNode?.type);
      
      return {
        content: response.data.message.content,
        quickReplies: questions.map((q, i) => ({
          id: `quick-${i}`,
          text: q,
          value: q
        })),
        relatedNodeId: context.currentNode?.id
      };
    } catch (error) {
      console.error('LLM chat error:', error);
      throw new Error('Failed to get response from LLM');
    }
  }
}

export const llmService = new LLMService(); 