// src/bed.ts
import request from '@/utils/request';
import type { Bed, ApiResponse } from '@/types/assignment';

// 床位创建请求类型
export interface CreateBedRequest {
  roomId: number;      // 房间ID
  bedNo: string;       // 床位号，如 "1-上", "1-下"
  bedType: number;     // 床位类型：1-上铺，2-下铺
  status?: number;     // 床位状态：0-空闲，1-占用，2-锁定，3-待打扫，默认为0
}

// 床位更新请求类型
export interface UpdateBedRequest extends CreateBedRequest {
  id: number;          // 床位ID
}

// 床位列表响应类型
export interface BedListResponse {
  records: Bed[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

/**
 * 为房间新增床位
 */
export const createBed = (
  data: CreateBedRequest
): Promise<ApiResponse<number>> => {
  return request({
    url: '/beds',  // 按照床铺管理.md文档，使用/beds而不是/beds
    method: 'POST',
    data,
  });
};

/**
 * 更新床位信息
 */
export const updateBed = (
  id: number,
  data: UpdateBedRequest
): Promise<ApiResponse<number>> => {
  return request({
    url: `/beds/${id}`,
    method: 'PUT',
    data,
  });
};

/**
 * 删除床位
 */
export const deleteBed = (id: number): Promise<ApiResponse<void>> => {
  return request({
    url: `/beds/${id}`,
    method: 'DELETE',
  });
};

/**
 * 获取房间的床位列表
 */
export const getBedsByRoomId = (roomId: number): Promise<ApiResponse<BedListResponse>> => {
  return request({
    url: `/beds/by-room/${roomId}`,
    method: 'GET',
  });
};

/**
 * 根据ID获取床位详情
 */
export const getBedById = (id: number): Promise<ApiResponse<Bed>> => {
  return request({
    url: `/beds/${id}`,
    method: 'GET',
  });
};

/**
 * 批量创建床位
 */
export const batchCreateBeds = (
  roomId: number,
  bedNos: string[],  // 床位号数组，如 ["1-上", "1-下", "2-上", "2-下"]
  bedType: number    // 床位类型：1-上铺，2-下铺
): Promise<ApiResponse<number>> => {
  const data = bedNos.map(bedNo => ({
    roomId,
    bedNo,
    bedType,
    status: 0  // 默认空闲
  }));
  
  return request({
    url: '/beds/batch',
    method: 'POST',
    data,
  });
};

export const batchBeds = (
  params: any
): Promise<ApiResponse<number>> => {
  
  return request({
    url: '/assignments/allocate/batch',
    method: 'POST',
    data: params,
  });
};