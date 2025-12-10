
import request from '@/utils/request'
import type { IPageRoomSummaryVO, ApiResponse } from '@/types/room'
import type { DashboardOverviewVO, RoomStatusDashboardVO } from '@/types/room-bed-management'

export const getRooms = (
 params: {
    gender?: number;
    pageNo: number;
    pageSize: number;
    roomNo?: string;
    roomType?: number;
    status?: number;
    [property: string]: any;
}
): Promise<IPageRoomSummaryVO> => {
  return request({
    url: '/rooms',
    method: 'GET',
    params,
  });
};

/**
 * 新建房间请求参数
 */
export interface CreateRoomRequest {
  id?: number;
  roomNo: string;      // 房间号
  gender: number;      // 性别：1-男众，2-女众
  roomType: number;    // 房间类型
  // bedCount:number; 
  floor: number;       // 楼层
  status: number;      // 状态
  description?: string; // 房间描述（可选）
}

/**
 * 新建房间
 */
export const createRoom = (
  data: CreateRoomRequest
): Promise<ApiResponse<number>> => {
  return request({
    url: '/rooms',
    method: 'POST',
    data,
  });
};

/**
 * 更新房间
 */
export const updateRoom = (
  data: CreateRoomRequest
): Promise<ApiResponse<number>> => {
  return request({
    url: `/rooms`,
    method: 'POST',
    data,
  });
};



export const getRoomOverview = (): Promise<ApiResponse<DashboardOverviewVO>> => {
  return request({
    url: '/dashboard/overview',
    method: 'GET',
  });
};


export const getRoomStatus = (
 params: {
    start?: string;
    end?: string;
    floor?: number;
    gender?: number;
}
): Promise<ApiResponse<RoomStatusDashboardVO>> => {
  return request({
    url: '/dashboard/room-status',
    method: 'GET',
    params,
  });
};
