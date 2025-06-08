// 車輛年齡數據
export const prepareVehicleAgeData = () => [
  { name: '< 1年', value: 32.5, color: '#8884d8' },
  { name: '1-2年', value: 51.7, color: '#82ca9d' },
  { name: '> 2年', value: 15.8, color: '#ffc658' }
];

// 車輛損壞數據
export const prepareVehicleDamageData = () => [
  { name: '有損壞', value: 45.2, color: '#ff8042' },
  { name: '無損壞', value: 54.8, color: '#0088fe' }
];

// 性別分布數據
export const prepareGenderDistributionData = () => [
  { name: '男性', value: 54.7, color: '#0088fe' },
  { name: '女性', value: 45.3, color: '#ff8042' }
];

// 年齡分布數據
export const prepareAgeDistributionData = () => [
  { name: '18-25', value: 15, color: '#8884d8' },
  { name: '26-35', value: 28, color: '#82ca9d' },
  { name: '36-45', value: 22, color: '#ffc658' },
  { name: '46-55', value: 18, color: '#ff8042' },
  { name: '56+', value: 17, color: '#8dd1e1' }
];

// 預測分布數據
export const preparePredictionDistributionData = () => [
  { name: '極低', value: 38, color: '#0088fe' },
  { name: '低', value: 32, color: '#00c49f' },
  { name: '中', value: 18, color: '#ffbb28' },
  { name: '高', value: 12, color: '#ff8042' }
];

// 月度預測數據
export const prepareMonthlyPredictionData = () => [
  { name: '1月', positive: 55, negative: 170 },
  { name: '2月', positive: 72, negative: 155 },
  { name: '3月', positive: 85, negative: 190 },
  { name: '4月', positive: 110, negative: 210 },
  { name: '5月', positive: 92, negative: 175 },
  { name: '6月', positive: 105, negative: 162 }
];

// 特徵重要性數據
export const prepareFeatureImportanceData = () => [
  { name: '年齡', value: 0.23 },
  { name: '年保費', value: 0.19 },
  { name: '車齡', value: 0.15 },
  { name: '區域碼', value: 0.12 },
  { name: '銷售渠道', value: 0.10 },
  { name: '之前投保', value: 0.08 },
  { name: '車輛損壞', value: 0.07 },
  { name: '性別', value: 0.04 },
  { name: '駕照', value: 0.02 }
]; 