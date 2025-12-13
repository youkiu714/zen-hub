// src/api/checklist.ts
import request from '@/utils/request'
import type { ChecklistItem, ChecklistQuery, ChecklistForm } from '@/types/checklist'

// 模拟数据
let mockData: ChecklistItem[] = [
  { id: 1, name: '张明远', idCard: '33010619800101001X', gender: '男', reason: '历史挂单期间违反寺规' },
  { id: 2, name: '李静怡', idCard: '42010219900505002X', gender: '女', reason: '提供虚假信息' },
  { id: 3, name: '王智明', idCard: '11010119850303003X', gender: '男', reason: '多次无故取消预约' },
];

/**
 * 获取校验名单列表
 */
export const getChecklist = async (params: ChecklistQuery) => {
  // TODO: 替换为真实接口
  // return request.get('/api/checklist', { params });
  
  return new Promise<{ records: ChecklistItem[]; total: number }>((resolve) => {
    setTimeout(() => {
      let list = mockData;
      if (params.keyword) {
        list = list.filter(item => 
          item.name.includes(params.keyword!) || item.idCard.includes(params.keyword!)
        );
      }
      const total = list.length;
      // 简单的分页模拟
      const start = (params.pageNo - 1) * params.pageSize;
      const end = start + params.pageSize;
      resolve({
        records: list.slice(start, end),
        total
      });
    }, 500);
  });
};

/**
 * 新增/更新校验人员
 */
export const saveChecklistItem = async (data: ChecklistForm) => {
  // TODO: 替换为真实接口
  // return data.id ? request.put('/api/checklist', data) : request.post('/api/checklist', data);

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (data.id) {
        const index = mockData.findIndex(item => item.id === data.id);
        if (index > -1) mockData[index] = { ...data, id: data.id } as ChecklistItem;
      } else {
        mockData.unshift({ ...data, id: Date.now() } as ChecklistItem);
      }
      resolve();
    }, 500);
  });
};

/**
 * 删除校验人员
 */
export const deleteChecklistItem = async (id: number) => {
  // TODO: 替换为真实接口
  // return request.delete(`/api/checklist/${id}`);

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      mockData = mockData.filter(item => item.id !== id);
      resolve();
    }, 500);
  });
};