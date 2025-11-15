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
// export function getPendingAssignments(params: AssignmentRequest) {
//   return request.get<AssignmentResponse>('http://49.232.241.94:8080/lodging/assignments/pending', {
//     params,
//   });
// }

export const getPendingAssignments = (params: AssignmentRequest): Promise<AssignmentResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/assignments/pending',
    method: 'GET',
    params,
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: {
        records: [
          { applicationId: 1, personId: 1, name: "张三", idCardMasked: "202305**********12", gender: 1, age: 45, groupName: "第一组", stayDays: 15, applyDate: "2023-11-01", typeName: "新住" },
          { applicationId: 2, personId: 2, name: "李四", idCardMasked: "202305**********12", gender: 2, age: 38, groupName: "第二组", stayDays: 10, applyDate: "2023-11-02", typeName: "新住" },
          { applicationId: 3, personId: 3, name: "王五", idCardMasked: "202305**********12", gender: 1, age: 28, groupName: "第一组", stayDays: 7, applyDate: "2023-11-03", typeName: "换床" },
        ],
        total: 3,
        current: 1,
        size: 10,
        pages: 1
      },
      timestamp: Date.now()
    });
  });
};

/**
 * 获取已分配人员列表
 */
export const getAssignedList = (params: AssignedRequest): Promise<AssignedResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/assignments/assigned',
    method: 'GET',
    params,
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: {
        records: [
          {
            applicationId: 19,
            name: "zhongyi wan22dd",
            roomAndBed: "104 / 上铺",
            group: "-",
            expectedCheckinDate: "2025-11-27",
            expectedCheckoutDate: "2025-11-29",
            assignedDate: "2025-11-13"
          },
          {
            applicationId: 18,
            name: "李四01",
            roomAndBed: "104 / 上铺",
            group: "-",
            expectedCheckinDate: "2025-11-12",
            expectedCheckoutDate: "2025-11-20",
            assignedDate: "2025-11-13"
          },
          {
            applicationId: 11,
            name: "zhongyi wan22dd",
            roomAndBed: "104 / 上铺",
            group: "-",
            expectedCheckinDate: "2025-11-11",
            expectedCheckoutDate: "2025-11-12",
            assignedDate: "2025-11-11"
          },
          {
            applicationId: 12,
            name: "zhongyi wan22dd",
            roomAndBed: "104 / 下铺",
            group: "-",
            expectedCheckinDate: "2025-11-11",
            expectedCheckoutDate: "2025-11-12",
            assignedDate: "2025-11-11"
          }
        ],
        total: 4,
        current: 1,
        size: 10,
        pages: 1
      },
      timestamp: Date.now()
    });
  });
};

/**
 * 获取楼层列表
 */
export const getFloors = (params: FloorRequest): Promise<FloorResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/rooms/floors',
    method: 'GET',
    params,
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: [1, 3, 4, 6],
      timestamp: Date.now()
    });
  });
};

/**
 * 根据楼层获取房间列表
 */
export const getRoomsByFloor = (params: RoomRequest): Promise<RoomResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/rooms/by-floor',
    method: 'GET',
    params,
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: [
        { roomId: 1, roomNo: "104", capacity: 4, occupiedCount: 0, full: false },
        { roomId: 4, roomNo: "105", capacity: 4, occupiedCount: 1, full: false },
        { roomId: 2, roomNo: "1401", capacity: 2, occupiedCount: 2, full: true }
      ],
      timestamp: Date.now()
    });
  });
};

/**
 * 根据房间获取床位列表
 */
export const getBedsByRoom = (params: BedRequest): Promise<BedResponse> => {
  return request({
    url: `http://49.232.241.94:8080/lodging/api/beds/by-room/${params.roomId}`,
    method: 'GET',
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: [
        { id: 1, roomId: 1, bedNo: "1-上", bedType: 1, status: 0 },
        { id: 4, roomId: 1, bedNo: "1-下", bedType: 2, status: 1 },
        { id: 2, roomId: 1, bedNo: "2-上", bedType: 1, status: 0 },
        { id: 3, roomId: 1, bedNo: "2-下", bedType: 2, status: 0 }
      ],
      timestamp: Date.now()
    });
  });
};

/**
 * 分配床位
 */
export const allocateBed = (data: AllocateBedRequest): Promise<AllocateBedResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/assignments/allocate',
    method: 'POST',
    data,
  })
};

/**
 * 获取已入住人员列表
 */
export const getCheckedInList = (params: CheckedInRequest): Promise<CheckedInResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/assignments/checked-in',
    method: 'GET',
    params,
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: {
        records: [
          {
            applicationId: 1,
            name: "张小明",
            age: 45,
            gender: 1,
            group: "第一组",
            roomAndBed: "104 / 上铺",
            checkinDate: "2025-11-01",
            expectedCheckoutDate: "2025-11-15"
          },
          {
            applicationId: 2,
            name: "李小红",
            age: 38,
            gender: 2,
            group: "第二组",
            roomAndBed: "105 / 下铺",
            checkinDate: "2025-11-02",
            expectedCheckoutDate: "2025-11-20"
          },
          {
            applicationId: 3,
            name: "王小华",
            age: 28,
            gender: 1,
            group: "第一组",
            roomAndBed: "1401 / 上铺",
            checkinDate: "2025-11-03",
            expectedCheckoutDate: "2025-11-25"
          }
        ],
        total: 3,
        current: 1,
        size: 10,
        pages: 1
      },
      timestamp: Date.now()
    });
  });
};

/**
 * 获取已退住人员列表
 */
export const getCheckedOutList = (params: CheckedOutRequest): Promise<CheckedOutResponse> => {
  return request({
    url: 'http://49.232.241.94:8080/lodging/api/assignments/checked-out',
    method: 'GET',
    params,
  }).catch(() => {
    // 如果API不可用，返回模拟数据
    return Promise.resolve({
      success: true,
      code: 0,
      message: "模拟数据",
      data: {
        records: [
          {
            applicationId: 1,
            name: "张三",
            roomNo: "104",
            checkoutDate: "2025-11-01",
            lostItemsRemark: "无",
            status: 0
          },
          {
            applicationId: 2,
            name: "李四",
            roomNo: "105",
            checkoutDate: "2025-11-02",
            lostItemsRemark: "充电器、水杯",
            status: 1
          },
          {
            applicationId: 3,
            name: "王五",
            roomNo: "1401",
            checkoutDate: "2025-11-03",
            lostItemsRemark: "",
            status: 0
          }
        ],
        total: 3,
        current: 1,
        size: 10,
        pages: 1
      },
      timestamp: Date.now()
    });
  });
};

