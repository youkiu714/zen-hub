// src/api/floor.ts
import request from '@/utils/request';
import type { 
  FloorItem, 
  CreateFloorRequest, 
  UpdateFloorRequest,
  ApiResponse 
} from '@/types/floor';

export interface GetFloorsParams {
  gender?: number;
  pageNo: number;
  pageSize: number;
  floorNo?: string;
  status?: number;
}

/**
 * 获取楼层列表
 */
export const getFloors = (params: GetFloorsParams): Promise<ApiResponse<{
  records: FloorItem[];
  total: number;
  current: number;
  size: number;
  pages: number;
}>> => {
  return request({
    url: '/floors',
    method: 'GET',
    params,
  });
};

/**
 * 新增楼层
 */
export const createFloor = (
  data: CreateFloorRequest
): Promise<ApiResponse<number>> => {
  return request({
    url: '/floors',
    method: 'POST',
    data,
  });
};

/**
 * 更新楼层
 */
export const updateFloor = (
  id: number,
  data: UpdateFloorRequest
): Promise<ApiResponse<number>> => {
  return request({
    url: `/floors/${id}`,
    method: 'PUT',
    data,
  });
};

/**
 * 删除楼层
 */
export const deleteFloor = (id: number): Promise<ApiResponse<void>> => {
  return request({
    url: `/floors/${id}`,
    method: 'DELETE',
  });
};

/**
 * 启用/禁用楼层
 */
export const toggleFloorStatus = (
  id: number,
  status: number
): Promise<ApiResponse<void>> => {
  return request({
    url: `/floors/${id}/status`,
    method: 'PUT',
    data: { status },
  });
};

/**
 * 获取楼层详情
 */
export const getFloorById = (id: number): Promise<ApiResponse<FloorItem>> => {
  return request({
    url: `/floors/${id}`,
    method: 'GET',
  });
};