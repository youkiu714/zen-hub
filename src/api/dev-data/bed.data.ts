import type { BedExchangeItem } from '@/types/bed.d'

// 模拟8条数据，其中前3条完全对应截图
export const LOCAL_BED_LIST: BedExchangeItem[] = [
  {
    id: 1,
    applicantName: '张明远',
    applicantIdCard: '3****************X',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', // 模拟头像
    roomNo: '302室',
    bedInfo: '上铺 A2床',
    checkInDate: '2023-07-01',
    expectedCheckOut: '2023-07-15',
    status: 'checked_in',
    statusText: '已入住'
  },
  {
    id: 2,
    applicantName: '李静怡',
    applicantIdCard: '4****************X',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    roomNo: '205室',
    bedInfo: '下铺 B1床',
    checkInDate: '2023-07-05',
    expectedCheckOut: '2023-07-20',
    status: 'checked_in',
    statusText: '已入住'
  },
  {
    id: 3,
    applicantName: '陈教授',
    applicantIdCard: '5****************X',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    roomNo: '101室',
    bedInfo: '单人间 A1床',
    checkInDate: '2023-07-05',
    expectedCheckOut: '2023-07-07',
    status: 'checked_in',
    statusText: '已入住'
  },
  // ...生成更多数据用于测试分页
  ...Array.from({ length: 5 }).map((_, i) => ({
    id: 10 + i,
    applicantName: `测试用户${i}`,
    applicantIdCard: '1****************1',
    avatar: '',
    roomNo: '102室',
    bedInfo: '下铺 C1床',
    checkInDate: '2023-08-01',
    expectedCheckOut: '2023-08-10',
    status: 'checked_in',
    statusText: '已入住'
  } as BedExchangeItem))
]