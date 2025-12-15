// src/types/checklist.ts

export interface ChecklistItem {
  id: number;
  name: string;
  idCard: string;
  gender: '男' | '女';
  reason: string;
  background?: string; // 背景简介 (选填)
}

export interface ChecklistQuery {
  pageNo: number;
  pageSize: number;
  keyword?: string;
}

export interface ChecklistResponse {
  list: ChecklistItem[];
  total: number;
}

// 用于新增/编辑的表单数据类型
export interface ChecklistForm extends Omit<ChecklistItem, 'id'> {
  id?: number;
}