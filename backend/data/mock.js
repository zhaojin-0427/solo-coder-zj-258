let customers = [
  { id: 1, name: '张老汉', phone: '13800138001', address: '李家村东头', orderCount: 5, isReturning: true },
  { id: 2, name: '王铁匠', phone: '13800138002', address: '王家大院', orderCount: 2, isReturning: false },
  { id: 3, name: '李猎户', phone: '13800138003', address: '南山脚下', orderCount: 8, isReturning: true },
  { id: 4, name: '赵厨师', phone: '13800138004', address: '镇西客栈', orderCount: 12, isReturning: true },
  { id: 5, name: '陈农夫', phone: '13800138005', address: '河东村', orderCount: 3, isReturning: false },
  { id: 6, name: '刘屠夫', phone: '13800138006', address: '集市南街', orderCount: 7, isReturning: true },
  { id: 7, name: '孙木匠', phone: '13800138007', address: '北巷工坊', orderCount: 1, isReturning: false },
  { id: 8, name: '周渔夫', phone: '13800138008', address: '河边码头', orderCount: 4, isReturning: true }
];

let orders = [
  { id: 1, customerId: 1, customerName: '张老汉', productType: '农具', productName: '锄头', purpose: '山地翻土', material: '熟铁', sharpness: 3, quantity: 2, status: '已完成', scheduledDate: '2026-05-20', createdAt: '2026-05-15', completedAt: '2026-05-22', forgeDays: 3 },
  { id: 2, customerId: 3, customerName: '李猎户', productType: '刀具', productName: '猎刀', purpose: '山林狩猎', material: '高碳钢', sharpness: 5, quantity: 1, status: '已完成', scheduledDate: '2026-05-25', createdAt: '2026-05-20', completedAt: '2026-05-28', forgeDays: 4 },
  { id: 3, customerId: 4, customerName: '赵厨师', productType: '刀具', productName: '菜刀', purpose: '后厨切配', material: '不锈钢', sharpness: 4, quantity: 3, status: '已完成', scheduledDate: '2026-05-28', createdAt: '2026-05-23', completedAt: '2026-05-30', forgeDays: 2 },
  { id: 4, customerId: 6, customerName: '刘屠夫', productType: '刀具', productName: '剔骨刀', purpose: '肉铺分割', material: '高碳钢', sharpness: 5, quantity: 2, status: '锻造中', scheduledDate: '2026-06-02', createdAt: '2026-05-28', forgeDays: 3 },
  { id: 5, customerId: 1, customerName: '张老汉', productType: '农具', productName: '镰刀', purpose: '麦收割麦', material: '熟铁', sharpness: 4, quantity: 4, status: '排期中', scheduledDate: '2026-06-08', createdAt: '2026-06-01' },
  { id: 6, customerId: 5, customerName: '陈农夫', productType: '农具', productName: '犁铧', purpose: '田地铁犁', material: '生铁', sharpness: 2, quantity: 1, status: '排期中', scheduledDate: '2026-06-10', createdAt: '2026-06-02' },
  { id: 7, customerId: 8, customerName: '周渔夫', productType: '刀具', productName: '鱼刀', purpose: '处理渔获', material: '不锈钢', sharpness: 4, quantity: 2, status: '待排期', createdAt: '2026-06-04' },
  { id: 8, customerId: 2, customerName: '王铁匠', productType: '农具', productName: '铁锤', purpose: '打铁辅助', material: '熟铁', sharpness: 1, quantity: 1, status: '待排期', createdAt: '2026-06-05' },
  { id: 9, customerId: 3, customerName: '李猎户', productType: '刀具', productName: '柴刀', purpose: '砍柴开路', material: '高碳钢', sharpness: 3, quantity: 2, status: '已完成', scheduledDate: '2026-04-10', createdAt: '2026-04-05', completedAt: '2026-04-14', forgeDays: 5 },
  { id: 10, customerId: 4, customerName: '赵厨师', productType: '刀具', productName: '砍刀', purpose: '斩骨剁肉', material: '高碳钢', sharpness: 3, quantity: 1, status: '已完成', scheduledDate: '2026-04-20', createdAt: '2026-04-15', completedAt: '2026-04-23', forgeDays: 3 }
];

let furnaceRecords = [
  { id: 1, orderId: 1, material: '熟铁', date: '2026-05-20', startTime: '08:00', temperatureData: generateTempCurve('熟铁'), hammerCount: 156, quenchTiming: 45, success: true, duration: 180 },
  { id: 2, orderId: 2, material: '高碳钢', date: '2026-05-25', startTime: '07:30', temperatureData: generateTempCurve('高碳钢'), hammerCount: 230, quenchTiming: 62, success: true, duration: 240 },
  { id: 3, orderId: 3, material: '不锈钢', date: '2026-05-28', startTime: '09:00', temperatureData: generateTempCurve('不锈钢'), hammerCount: 180, quenchTiming: 50, success: true, duration: 200 },
  { id: 4, orderId: 4, material: '高碳钢', date: '2026-06-03', startTime: '08:30', temperatureData: generateTempCurve('高碳钢'), hammerCount: 210, quenchTiming: 58, success: true, duration: 220 },
  { id: 5, orderId: 9, material: '高碳钢', date: '2026-04-10', startTime: '08:00', temperatureData: generateTempCurve('高碳钢'), hammerCount: 245, quenchTiming: 70, success: false, duration: 260 },
  { id: 6, orderId: 10, material: '高碳钢', date: '2026-04-20', startTime: '07:00', temperatureData: generateTempCurve('高碳钢'), hammerCount: 198, quenchTiming: 55, success: true, duration: 210 },
  { id: 7, orderId: 1, material: '熟铁', date: '2026-05-21', startTime: '08:30', temperatureData: generateTempCurve('熟铁'), hammerCount: 142, quenchTiming: 42, success: true, duration: 170 }
];

function generateTempCurve(material) {
  const curves = {
    '熟铁': { maxTemp: 900, heatTime: 40, holdTime: 20, coolTime: 30 },
    '高碳钢': { maxTemp: 1050, heatTime: 60, holdTime: 25, coolTime: 45 },
    '不锈钢': { maxTemp: 1000, heatTime: 50, holdTime: 30, coolTime: 40 },
    '生铁': { maxTemp: 1150, heatTime: 70, holdTime: 35, coolTime: 50 }
  };
  const config = curves[material] || curves['熟铁'];
  const data = [];
  let temp = 25;
  const totalTime = config.heatTime + config.holdTime + config.coolTime;
  
  for (let t = 0; t <= config.heatTime; t += 2) {
    temp = 25 + (config.maxTemp - 25) * (t / config.heatTime);
    data.push({ time: t, temp: Math.round(temp) });
  }
  for (let t = config.heatTime + 2; t <= config.heatTime + config.holdTime; t += 2) {
    data.push({ time: t, temp: config.maxTemp + Math.round(Math.random() * 20 - 10) });
  }
  temp = config.maxTemp;
  for (let t = config.heatTime + config.holdTime + 2; t <= totalTime; t += 2) {
    temp = temp - (config.maxTemp - 100) * (2 / config.coolTime);
    data.push({ time: t, temp: Math.max(Math.round(temp), 100) });
  }
  return data;
}

let materialRecords = [
  { id: 1, orderId: 1, material: '熟铁', weight: 3.2, unit: 'kg', cost: 48, usedDate: '2026-05-20', supplier: '城西铁铺' },
  { id: 2, orderId: 2, material: '高碳钢', weight: 0.8, unit: 'kg', cost: 32, usedDate: '2026-05-25', supplier: '城南钢厂' },
  { id: 3, orderId: 3, material: '不锈钢', weight: 1.5, unit: 'kg', cost: 75, usedDate: '2026-05-28', supplier: '城东金属行' },
  { id: 4, orderId: 4, material: '高碳钢', weight: 1.2, unit: 'kg', cost: 48, usedDate: '2026-06-03', supplier: '城南钢厂' },
  { id: 5, orderId: 1, material: '木炭', weight: 5.0, unit: 'kg', cost: 25, usedDate: '2026-05-20', supplier: '北山柴场' },
  { id: 6, orderId: 2, material: '木炭', weight: 6.5, unit: 'kg', cost: 32.5, usedDate: '2026-05-25', supplier: '北山柴场' },
  { id: 7, orderId: 9, material: '高碳钢', weight: 1.0, unit: 'kg', cost: 40, usedDate: '2026-04-10', supplier: '城南钢厂' },
  { id: 8, orderId: 10, material: '高碳钢', weight: 1.5, unit: 'kg', cost: 60, usedDate: '2026-04-20', supplier: '城南钢厂' },
  { id: 9, orderId: 3, material: '木炭', weight: 4.5, unit: 'kg', cost: 22.5, usedDate: '2026-05-28', supplier: '北山柴场' },
  { id: 10, orderId: 1, material: '木柄', weight: 0.5, unit: '根', cost: 10, usedDate: '2026-05-21', supplier: '孙木匠' }
];

let products = [
  { id: 1, orderId: 1, productName: '锄头', serialNumber: 'BS20260522001', material: '熟铁', sharpness: 3, weight: 1.5, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-05-22', delivered: true, deliveredDate: '2026-05-23', customerSatisfaction: 5 },
  { id: 2, orderId: 2, productName: '猎刀', serialNumber: 'BS20260528002', material: '高碳钢', sharpness: 5, weight: 0.35, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-05-28', delivered: true, deliveredDate: '2026-05-29', customerSatisfaction: 5 },
  { id: 3, orderId: 3, productName: '菜刀', serialNumber: 'BS20260530003', material: '不锈钢', sharpness: 4, weight: 0.45, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-05-30', delivered: true, deliveredDate: '2026-05-31', customerSatisfaction: 4 },
  { id: 4, orderId: 9, productName: '柴刀', serialNumber: 'BS20260414004', material: '高碳钢', sharpness: 3, weight: 0.6, qualityGrade: '乙级', inspector: '老铁匠', passedDate: '2026-04-14', delivered: true, deliveredDate: '2026-04-15', customerSatisfaction: 3 },
  { id: 5, orderId: 10, productName: '砍刀', serialNumber: 'BS20260423005', material: '高碳钢', sharpness: 3, weight: 0.8, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-04-23', delivered: true, deliveredDate: '2026-04-24', customerSatisfaction: 5 },
  { id: 6, orderId: 3, productName: '菜刀', serialNumber: 'BS20260530006', material: '不锈钢', sharpness: 4, weight: 0.45, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-05-30', delivered: true, deliveredDate: '2026-05-31', customerSatisfaction: 4 },
  { id: 7, orderId: 3, productName: '菜刀', serialNumber: 'BS20260530007', material: '不锈钢', sharpness: 4, weight: 0.45, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-05-30', delivered: true, deliveredDate: '2026-05-31', customerSatisfaction: 4 },
  { id: 8, orderId: 1, productName: '锄头', serialNumber: 'BS20260522008', material: '熟铁', sharpness: 3, weight: 1.5, qualityGrade: '甲级', inspector: '老铁匠', passedDate: '2026-05-22', delivered: true, deliveredDate: '2026-05-23', customerSatisfaction: 5 },
  { id: 9, orderId: 9, productName: '柴刀', serialNumber: 'BS20260414009', material: '高碳钢', sharpness: 2, weight: 0.65, qualityGrade: '丙级', inspector: '老铁匠', passedDate: '2026-04-14', delivered: false, deliveredDate: null, customerSatisfaction: null },
  { id: 10, orderId: 10, productName: '砍刀', serialNumber: 'BS20260423010', material: '高碳钢', sharpness: 2, weight: 0.85, qualityGrade: '丙级', inspector: '老铁匠', passedDate: '2026-04-23', delivered: false, deliveredDate: null, customerSatisfaction: null },
  { id: 11, orderId: 2, productName: '猎刀', serialNumber: 'BS20260528011', material: '高碳钢', sharpness: 4, weight: 0.36, qualityGrade: '乙级', inspector: '老铁匠', passedDate: '2026-05-28', delivered: false, deliveredDate: null, customerSatisfaction: null }
];

let qualityInspections = [
  {
    id: 1,
    productId: 1,
    orderId: 1,
    furnaceRecordId: 1,
    productName: '锄头',
    serialNumber: 'BS20260522001',
    material: '熟铁',
    appearanceScore: 9,
    sharpnessMeasured: 3,
    hardnessMin: 180,
    hardnessMax: 220,
    isPassed: true,
    defectDescription: '',
    reworkSuggestion: '',
    inspector: '老铁匠',
    inspectionDate: '2026-05-22',
    remarks: '外观良好，锻造纹理均匀'
  },
  {
    id: 2,
    productId: 2,
    orderId: 2,
    furnaceRecordId: 2,
    productName: '猎刀',
    serialNumber: 'BS20260528002',
    material: '高碳钢',
    appearanceScore: 10,
    sharpnessMeasured: 5,
    hardnessMin: 58,
    hardnessMax: 62,
    isPassed: true,
    defectDescription: '',
    reworkSuggestion: '',
    inspector: '老铁匠',
    inspectionDate: '2026-05-28',
    remarks: '刀刃锋利，硬度达标，精品'
  },
  {
    id: 3,
    productId: 3,
    orderId: 3,
    furnaceRecordId: 3,
    productName: '菜刀',
    serialNumber: 'BS20260530003',
    material: '不锈钢',
    appearanceScore: 8,
    sharpnessMeasured: 4,
    hardnessMin: 52,
    hardnessMax: 55,
    isPassed: true,
    defectDescription: '',
    reworkSuggestion: '',
    inspector: '老铁匠',
    inspectionDate: '2026-05-30',
    remarks: ''
  },
  {
    id: 4,
    productId: 4,
    orderId: 9,
    furnaceRecordId: 5,
    productName: '柴刀',
    serialNumber: 'BS20260414004',
    material: '高碳钢',
    appearanceScore: 6,
    sharpnessMeasured: 3,
    hardnessMin: 48,
    hardnessMax: 52,
    isPassed: false,
    defectDescription: '刀刃局部硬度不足，表面有细微裂纹',
    reworkSuggestion: '建议重新淬火处理，表面打磨修复裂纹',
    inspector: '老铁匠',
    inspectionDate: '2026-04-14',
    remarks: '炉温控制不当导致硬度偏低'
  },
  {
    id: 5,
    productId: 5,
    orderId: 10,
    furnaceRecordId: 6,
    productName: '砍刀',
    serialNumber: 'BS20260423005',
    material: '高碳钢',
    appearanceScore: 9,
    sharpnessMeasured: 3,
    hardnessMin: 55,
    hardnessMax: 58,
    isPassed: true,
    defectDescription: '',
    reworkSuggestion: '',
    inspector: '老铁匠',
    inspectionDate: '2026-04-23',
    remarks: ''
  },
  {
    id: 6,
    productId: 9,
    orderId: 9,
    furnaceRecordId: 5,
    productName: '柴刀',
    serialNumber: 'BS20260414009',
    material: '高碳钢',
    appearanceScore: 5,
    sharpnessMeasured: 2,
    hardnessMin: 42,
    hardnessMax: 46,
    isPassed: false,
    defectDescription: '刀刃严重偏软，锻造折叠痕迹明显，表面氧化皮残留',
    reworkSuggestion: '需重新加热锻造，充分折叠，淬火温度提升至980°C',
    inspector: '老铁匠',
    inspectionDate: '2026-04-14',
    remarks: '严重不合格，需全面返工'
  },
  {
    id: 7,
    productId: 10,
    orderId: 10,
    furnaceRecordId: 6,
    productName: '砍刀',
    serialNumber: 'BS20260423010',
    material: '高碳钢',
    appearanceScore: 7,
    sharpnessMeasured: 2,
    hardnessMin: 45,
    hardnessMax: 50,
    isPassed: false,
    defectDescription: '刃口打磨不平整，锋利度不足',
    reworkSuggestion: '重新打磨刃口，必要时二次淬火',
    inspector: '老铁匠',
    inspectionDate: '2026-04-23',
    remarks: ''
  },
  {
    id: 8,
    productId: 11,
    orderId: 2,
    furnaceRecordId: 2,
    productName: '猎刀',
    serialNumber: 'BS20260528011',
    material: '高碳钢',
    appearanceScore: 8,
    sharpnessMeasured: 4,
    hardnessMin: 54,
    hardnessMax: 57,
    isPassed: false,
    defectDescription: '刀柄安装略有偏差，手感略差',
    reworkSuggestion: '重新校正刀柄安装位置',
    inspector: '老铁匠',
    inspectionDate: '2026-05-28',
    remarks: '外观质量问题'
  }
];

let reworkRecords = [
  {
    id: 1,
    productId: 4,
    orderId: 9,
    furnaceRecordId: 5,
    productName: '柴刀',
    serialNumber: 'BS20260414004',
    material: '高碳钢',
    qualityInspectionId: 4,
    reworkReason: '硬度不足/表面裂纹',
    reworkSuggestion: '重新淬火处理，表面打磨修复裂纹',
    status: '已完成',
    reworkType: '重新淬火',
    startedDate: '2026-04-15',
    completedDate: '2026-04-17',
    reworkCount: 1,
    operator: '老铁匠',
    cost: 15,
    notes: '二次淬火后硬度达标，裂纹已打磨修复'
  },
  {
    id: 2,
    productId: 9,
    orderId: 9,
    furnaceRecordId: 5,
    productName: '柴刀',
    serialNumber: 'BS20260414009',
    material: '高碳钢',
    qualityInspectionId: 6,
    reworkReason: '硬度不足/锻造缺陷/氧化残留',
    reworkSuggestion: '重新加热锻造，充分折叠，淬火温度提升至980°C',
    status: '返工中',
    reworkType: '重新锻造+淬火',
    startedDate: '2026-06-05',
    completedDate: null,
    reworkCount: 1,
    operator: '老铁匠',
    cost: 35,
    notes: '正在重新锻造中'
  },
  {
    id: 3,
    productId: 10,
    orderId: 10,
    furnaceRecordId: 6,
    productName: '砍刀',
    serialNumber: 'BS20260423010',
    material: '高碳钢',
    qualityInspectionId: 7,
    reworkReason: '锋利度不足/刃口不平整',
    reworkSuggestion: '重新打磨刃口，必要时二次淬火',
    status: '待返工',
    reworkType: '打磨修整',
    startedDate: null,
    completedDate: null,
    reworkCount: 0,
    operator: '',
    cost: 0,
    notes: ''
  },
  {
    id: 4,
    productId: 11,
    orderId: 2,
    furnaceRecordId: 2,
    productName: '猎刀',
    serialNumber: 'BS20260528011',
    material: '高碳钢',
    qualityInspectionId: 8,
    reworkReason: '刀柄安装偏差',
    reworkSuggestion: '重新校正刀柄安装位置',
    status: '已完成',
    reworkType: '装配校正',
    startedDate: '2026-05-29',
    completedDate: '2026-05-29',
    reworkCount: 1,
    operator: '老铁匠',
    cost: 5,
    notes: '刀柄已校正，手感恢复正常'
  }
];

const recommendedCurves = {
  '熟铁': {
    material: '熟铁',
    maxTemp: 900,
    heatRate: '每分钟22°C',
    holdTime: '20分钟',
    quenchTemp: 850,
    quenchMedium: '清水',
    hammerCount: '120-180次',
    tempCurve: generateTempCurve('熟铁'),
    notes: '熟铁质地较软，适合大型农具锻造，淬火温度不宜过高'
  },
  '高碳钢': {
    material: '高碳钢',
    maxTemp: 1050,
    heatRate: '每分钟17°C',
    holdTime: '25分钟',
    quenchTemp: 980,
    quenchMedium: '菜籽油',
    hammerCount: '200-260次',
    tempCurve: generateTempCurve('高碳钢'),
    notes: '高碳钢硬度高，需缓慢加热防止开裂，油淬可减少脆性'
  },
  '不锈钢': {
    material: '不锈钢',
    maxTemp: 1000,
    heatRate: '每分钟20°C',
    holdTime: '30分钟',
    quenchTemp: 920,
    quenchMedium: '清水',
    hammerCount: '160-220次',
    tempCurve: generateTempCurve('不锈钢'),
    notes: '不锈钢需充分保温确保合金元素溶解，淬火后建议回火'
  },
  '生铁': {
    material: '生铁',
    maxTemp: 1150,
    heatRate: '每分钟16°C',
    holdTime: '35分钟',
    quenchTemp: 1080,
    quenchMedium: '泥沙',
    hammerCount: '80-120次',
    tempCurve: generateTempCurve('生铁'),
    notes: '生铁含碳高，脆性大，锻造需轻锤慢打，缓慢冷却'
  }
};

function getNextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

module.exports = {
  customers,
  orders,
  furnaceRecords,
  materialRecords,
  products,
  qualityInspections,
  reworkRecords,
  recommendedCurves,
  generateTempCurve,
  getNextId
};
