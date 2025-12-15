// src/types/statistics.ts

// 顶部卡片数据
export interface StatCardData {
  title: string;
  value: number;
  trend: number; // 同比增长率，正数为涨，负数为跌
  trendText: string; // 例如 "较上周"
  icon: string; //用于区分图标类型
  type: 'total' | 'pending' | 'approved' | 'rejected';
}

// 趋势图数据 (折线/柱状)
export interface TrendData {
  dates: string[];
  values: number[];
}

// 分布图数据 (饼图/柱状)
export interface DistributionData {
  name: string;
  value: number;
}

// 完整的 API 响应结构
export interface StatisticsResponse {
  overview: {
    total: StatCardData;
    pending: StatCardData;
    approved: StatCardData;
    rejected: StatCardData;
  };
  charts: {
    applicationTrend: TrendData;
    genderDistribution: DistributionData[];
    ageDistribution: DistributionData[]; // name为年龄段，value为人数
    sourceDistribution: DistributionData[];
  };
}