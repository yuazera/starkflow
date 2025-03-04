import * as ExcelJS from 'exceljs';
import { BaseNode, Edge, FlowVersion, ExcelTemplate } from '@/types/flow';
import { generateUniqueId } from '@/utils/helpers';

class FlowService {
  async exportToExcel(flow: FlowVersion, template: ExcelTemplate) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Flow');
    
    // Set headers
    worksheet.columns = template.headers.map(header => ({
      header,
      key: template.mapping[header],
      width: 15
    }));
    
    // Add data
    flow.nodes.forEach(node => {
      const row = {};
      Object.entries(template.mapping).forEach(([header, prop]) => {
        row[header] = this.getNodeProperty(node, prop);
      });
      worksheet.addRow(row);
    });
    
    return workbook;
  }
  
  async importFromExcel(file: File, template: ExcelTemplate) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    
    const worksheet = workbook.getWorksheet(1);
    const nodes: BaseNode[] = [];
    const edges: Edge[] = [];
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const node: BaseNode = {
        id: generateUniqueId(),
        type: 'process',
        position: { x: 0, y: 0 },
        data: {
          label: '',
          attributes: {}
        }
      };
      
      Object.entries(template.mapping).forEach(([header, prop]) => {
        const value = row.getCell(template.headers.indexOf(header) + 1).value;
        this.setNodeProperty(node, prop, value?.toString() || '');
      });
      
      nodes.push(node);
    });
    
    return { nodes, edges };
  }
  
  private getNodeProperty(node: BaseNode, prop: string) {
    const parts = prop.split('.');
    let value: any = node;
    for (const part of parts) {
      value = value[part];
    }
    return value;
  }
  
  private setNodeProperty(node: BaseNode, prop: string, value: string) {
    const parts = prop.split('.');
    let target: any = node;
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;
  }
  
  autoLayout(nodes: BaseNode[]) {
    // Simple grid layout
    const GRID_SIZE = 200;
    const ROWS = Math.ceil(Math.sqrt(nodes.length));
    
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % ROWS) * GRID_SIZE,
        y: Math.floor(index / ROWS) * GRID_SIZE
      }
    }));
  }
}

export const flowService = new FlowService(); 