// src/api/statistics.ts
import type { StatisticsResponse } from '@/types/statistics'
// import request from '@/utils/request'

export const getStatistics = (dateRange: [string, string]): Promise<StatisticsResponse> => {
  // TODO: 真实接口调用
  // return request.get('/api/statistics', { params: { startDate: dateRange[0], endDate: dateRange[1] } })

  console.log('Fetching stats for:', dateRange);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        overview: {
          total: { title: '总申请人数', value: 1248, trend: 12.5, trendText: '较上周', icon: 'User', type: 'total' },
          pending: { title: '待审核', value: 56, trend: -5.2, trendText: '较上周', icon: 'Timer', type: 'pending' },
          approved: { title: '已通过', value: 892, trend: 8.4, trendText: '较上周', icon: 'Check', type: 'approved' },
          rejected: { title: '已驳回', value: 300, trend: 2.1, trendText: '较上周', icon: 'Close', type: 'rejected' },
        },
        charts: {
          applicationTrend: {
            dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            values: [120, 132, 101, 134, 90, 230, 210]
          },
          genderDistribution: [
            { name: '男众', value: 748 },
            { name: '女众', value: 500 }
          ],
          ageDistribution: [
            { name: '18-25', value: 150 },
            { name: '26-35', value: 400 },
            { name: '36-45', value: 350 },
            { name: '46-60', value: 200 },
            { name: '60+', value: 148 }
          ],
          sourceDistribution: [
            { name: '微信公众号', value: 600 },
            { name: '官网预约', value: 300 },
            { name: '线下登记', value: 148 },
            { name: '其他', value: 200 }
          ]
        }
      });
    }, 800); // 模拟网络延迟
  });
};