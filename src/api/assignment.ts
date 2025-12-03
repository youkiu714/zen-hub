// api/assignment.ts
import request from '@/utils/request';
import type {
  AssignmentRequest,
  AssignmentResponse,
  AssignedRequest,
  AssignedResponse,
  CheckedInRequest,
  CheckedInResponse,
  CheckedOutRequest,
  CheckedOutResponse,
  FloorRequest,
  FloorResponse,
  RoomRequest,
  RoomResponse,
  BedRequest,
  BedResponse,
  AllocateBedRequest,
  AllocateBedResponse
} from '@/types/assignment';

/**
 * 获取待分配人员列表
 */
export const getPendingAssignments = (params: AssignmentRequest): Promise<AssignmentResponse> => {
  return request({
    url: '/assignments/pending',
    method: 'GET',
    params,
  })
};

/**
 * 获取已分配人员列表
 */
export const getAssignedList = (params: AssignedRequest): Promise<AssignedResponse> => {
  return request({
    url: '/assignments/assigned',
    method: 'GET',
    params,
  })
};

/**
 * 获取楼层列表
 */
export const getFloors = (params: FloorRequest): Promise<FloorResponse> => {
  return request({
    url: '/rooms/floors',
    method: 'GET',
    params,
  })
};

/**
 * 根据楼层获取房间列表
 */
export const getRoomsByFloor = (params: RoomRequest): Promise<RoomResponse> => {
  return request({
    url: '/rooms/by-floor',
    method: 'GET',
    params,
  })
};

/**
 * 根据房间获取床位列表
 */
export const getBedsByRoom = (params: BedRequest): Promise<BedResponse> => {
  return request({
    url: `/beds/by-room/${params.roomId}`,
    method: 'GET',
  })
};

/**
 * 分配床位
 */
export const allocateBed = (data: AllocateBedRequest): Promise<AllocateBedResponse> => {
  return request({
    url: '/assignments/allocate',
    method: 'POST',
    data,
  })
};

/**
 * 获取已入住人员列表
 */
export const getCheckedInList = (params: CheckedInRequest): Promise<CheckedInResponse> => {
  return request({
    url: '/assignments/checked-in',
    method: 'GET',
    params,
  })
};

/**
 * 获取已退住人员列表
 */
export const getCheckedOutList = (params: CheckedOutRequest): Promise<CheckedOutResponse> => {
  return request({
    url: '/assignments/checked-out',
    method: 'GET',
    params,
  })
};

/**
 * 办理退房
 * @param bedStayId 床位居住ID
 * @returns Promise<any>
 */
export const checkout = (bedStayId: number): Promise<any> => {
  return request({
    url: `/assignments/checkout/${bedStayId}`,
    method: 'POST',
  });
};

