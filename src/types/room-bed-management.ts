// 统计概览数据类型
export interface DashboardOverviewVO {
  availableRooms?: number;
  femaleBeds?: number;
  maleBeds?: number;
  occupancyRate?: number;
  occupiedBeds?: number;
  pendingAssignments?: number;
  totalBeds?: number;
  totalRooms?: number;
  unavailableRooms?: number;
}

// 房间状态数据类型
export interface RoomStatusDashboardVO {
  male?: GenderGroupVO;
  female?: GenderGroupVO;
}

export interface GenderGroupVO {
  floors?: FloorGroupVO[];
  gender?: number;
  totalFloors?: number;
  totalRooms?: number;
}

export interface FloorGroupVO {
  floor?: number;
  rooms?: RoomWithBedsVO[];
}

export interface RoomWithBedsVO {
  beds?: BedStatusVO[];
  capacity?: number;
  gender?: number;
  genderName?: string;
  occupiedCount?: number;
  roomId?: number;
  roomNo?: string;
  roomType?: string;
  roomTypeName?: string;
}

export interface BedStatusVO {
  bedId?: number;
  bedNo?: string;
  bedType?: number;
  bedTypeName?: string;
  occupied?: boolean;
}