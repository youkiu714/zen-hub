// 通用请求参数
export interface BedQueryParams {
  keyword?: string;
  pageNo: number; // 注意：后端参数名是 pageNo
  pageSize: number;
  roomType: 'normal'; // 默认选中 '常规'，如果想默认全部则设为 ''
}

// 通用分页响应结构 (对应 IPageBedChange...VO)
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 1. 可申请换床对象 (对应 BedChangeEligibleVO)
export interface BedEligibleItem {
  applicationId?: number;
  personId?: number;
  name?: string;          // 申请人姓名
  // 注意：接口未提供身份证号和头像字段，前端暂时无法显示或需后端补充
  roomNo?: string;        // 房间号
  bedNo?: string;         // 床位号
  bedTypeName?: string;   // 床位类型名 (如：上铺)
  checkinDate?: string;   // 入住日期
  checkoutDate?: string;  // 预计离店
  statusDesc?: string;    // 状态描述 (如：已入住)
}

// 2. 已申请换床对象 (对应 BedChangeAppliedVO)
export interface BedAppliedItem {
  changeId?: number;
  applicationId?: number;
  personId?: number;
  name?: string;             // 申请人
  originalRoomNo?: string;   // 原房间
  originalBedNo?: string;    // 原床位
  newRoomNo?: string;        // 新房间
  newBedNo?: string;         // 新床位
  newBedTypeName?: string;   // 新床位类型
  applyTime?: string;        // 申请时间
  reasonName?: string;       // 换床原因
  status?: number;           // 状态码
  statusName?: string;       // 状态名称 (如：审批中)
}



// 文件路径: src/types/bed.ts

/**
 * 单个床位新增/修改请求对象
 * 对应后端: com.cecs.dto.BedUpsertRequest
 */
export interface BedUpsertRequest {
  /**
   * 主键ID
   * - 新增时: 不传
   * - 编辑时: 必传
   */
  id?: number;

  /**
   * 房间ID
   * - 新建时: 必须
   */
  roomId?: number;

  /**
   * 床位号
   * 例如: "1-上", "2-A"
   */
  bedNo?: string;

  /**
   * 床位类型
   * 1 - 上铺
   * 2 - 下铺
   */
  bedType?: number;

  /**
   * 床位状态
   * 0 - 空闲
   * 1 - 占用
   * 2 - 锁定
   * 3 - 待打扫
   */
  status?: number;

  /**
   * 任意其他扩展属性
   */
  [property: string]: any;
}

/**
 * 批量床位操作请求包装类
 * 对应后端: BedBatchUpsertRequest
 */
export interface BedBatchUpsertRequest {
    /**
     * 目标房间ID
     */
    roomId: number;

    /**
     * 床位列表
     */
    beds: BedUpsertRequest[];

    [property: string]: any;
}