// src/types/floor.ts
export interface FloorItem {
  floor: number;
  gender: number;
  totalRooms: number;
  availableRooms: number;
  totalBeds: number;
  status: number;
  description?: string;
}

export interface CreateFloorRequest {
  floor: number;
  gender: number;
  status: number;
  description?: string;
}

export interface UpdateFloorRequest extends CreateFloorRequest {
  id: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}