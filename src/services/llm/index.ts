import axios from 'axios';
import { ChatContext, ScenarioTemplate, QuickReply } from '@/types/chat';
import { DialogueGuide, FlowValidation, NodeTemplate, NodeType } from '@/types/flow';

class LLMService {
  private baseUrl: string;
  private scenarios: ScenarioTemplate[];
  private dialogueGuides: DialogueGuide[];
  private flowValidation: FlowValidation;
  private nodeTemplates: NodeTemplate[];

  constructor() {
    this.baseUrl = 'http://https://etuycc-lckbpa-8434.app.cloudstudio.work'; // Ollama default port
    this.scenarios = [];
    this.dialogueGuides = [];
    this.flowValidation = {
      requiredNodes: ['start', 'end'],
      connectionRules: {
        start: { allowed: ['process', 'decision'], max: 1 },
        end: { allowed: [], max: 0 },
        process: { allowed: ['process', 'decision', 'end'] },
        decision: { allowed: ['process', 'decision', 'end'] }
      }
    };
    this.nodeTemplates = [];
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

  setScenarios(scenarios: ScenarioTemplate[]) {
    this.scenarios = scenarios;
  }

  setDialogueGuides(guides: DialogueGuide[]) {
    this.dialogueGuides = guides;
  }

  setNodeTemplates(templates: NodeTemplate[]) {
    this.nodeTemplates = templates;
  }

  private getDialogueGuide(nodeType?: string): DialogueGuide | undefined {
    return this.dialogueGuides.find(g => g.nodeType === nodeType);
  }

  private validateFlow(context: ChatContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const nodes = context.history
      .filter(msg => msg.intent?.type === 'node_add')
      .map(msg => msg.intent!.nodeId!);

    // 检查必需节点
    this.flowValidation.requiredNodes.forEach(type => {
      if (!nodes.some(id => id.startsWith(type))) {
        errors.push(`缺少必需的${type}节点`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateQuickReplies(
    nodeType: string,
    context: ChatContext
  ): QuickReply[] {
    const guide = this.getDialogueGuide(nodeType);
    if (!guide) return [];

    const replies: QuickReply[] = [];
    
    // 添加属性提示
    Object.entries(guide.attributePrompts).forEach(([key, prompts]) => {
      if (!context.currentNode) return;
      
      replies.push({
        id: `attr-${key}`,
        text: prompts[0],
        value: prompts[0],
        type: 'attribute',
        metadata: {
          nodeId: context.currentNode.id,
          attributeKey: key
        }
      });
    });

    // 添加场景相关问题
    if (context.scenario) {
      const scenario = this.scenarios.find(s => s.id === context.scenario?.id);
      if (scenario) {
        scenario.questions.forEach((q, i) => {
          replies.push({
            id: `scenario-${i}`,
            text: q,
            value: q,
            type: 'confirmation'
          });
        });
      }
    }

    return replies;
  }

  async chat(message: string, context: ChatContext) {
    try {
      // 检查消息是否与流程相关
      const flowValidation = this.validateFlow(context);
      const currentNodeType = context.currentNode?.type as NodeType;
      const guide = this.getDialogueGuide(currentNodeType);

      if (!guide && !message.toLowerCase().includes('流程')) {
        return {
          content: '抱歉，我只能回答与当前流程相关的问题。请问您想了解流程的哪些方面？',
          quickReplies: [],
          relatedNodeId: context.currentNode?.id,
          context: {
            flowValidation,
            suggestedActions: [
              '如何添加新的节点？',
              '当前节点需要配置哪些属性？',
              '如何完善流程？'
            ]
          }
        };
      }

      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        model: 'llama2',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant guiding users through a workflow process.
Current node type: ${currentNodeType || 'none'}
Flow validation status: ${flowValidation.isValid ? 'valid' : 'invalid'}
Validation errors: ${flowValidation.errors.join(', ')}`
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

      const quickReplies = this.generateQuickReplies(currentNodeType, context);
      
      return {
        content: response.data.message.content,
        quickReplies,
        relatedNodeId: context.currentNode?.id,
        context: {
          flowValidation,
          suggestedActions: guide?.contextQuestions || []
        }
      };
    } catch (error) {
      console.error('LLM chat error:', error);
      throw new Error('Failed to get response from LLM');
    }
  }
}

export const llmService = new LLMService();
