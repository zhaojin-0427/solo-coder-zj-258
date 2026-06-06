import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { statsAPI } from '../api/index.js';

const COLORS = ['#ff6600', '#daa520', '#cd853f', '#8b4513', '#4682b4', '#32cd32', '#9370db', '#ff69b4'];

const Stats = () => {
  const [overview, setOverview] = useState(null);
  const [productDist, setProductDist] = useState([]);
  const [furnaceRate, setFurnaceRate] = useState([]);
  const [forgeCycle, setForgeCycle] = useState([]);
  const [customerRate, setCustomerRate] = useState(null);
  const [qualityPassRate, setQualityPassRate] = useState(null);
  const [reworkReasonDist, setReworkReasonDist] = useState([]);
  const [materialReworkRate, setMaterialReworkRate] = useState([]);
  const [avgReworkCount, setAvgReworkCount] = useState(null);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const [o, p, f, c, r, q, rr, mr, ar] = await Promise.all([
        statsAPI.overview(),
        statsAPI.productTypeDistribution(),
        statsAPI.furnaceSuccessRate(),
        statsAPI.forgeCycleDistribution(),
        statsAPI.returningCustomerRate(),
        statsAPI.qualityPassRate(),
        statsAPI.reworkReasonDistribution(),
        statsAPI.materialReworkRate(),
        statsAPI.averageReworkCount()
      ]);
      if (o.success) setOverview(o.data);
      if (p.success) setProductDist(p.data);
      if (f.success) setFurnaceRate(f.data);
      if (c.success) setForgeCycle(c.data);
      if (r.success) setCustomerRate(r.data);
      if (q.success) setQualityPassRate(q.data);
      if (rr.success) setReworkReasonDist(rr.data);
      if (mr.success) setMaterialReworkRate(mr.data);
      if (ar.success) setAvgReworkCount(ar.data);
    } catch (err) {
      console.error(err);
    }
  };

  const pieData = customerRate ? [
    { name: '回头客', value: customerRate.returningCustomers },
    { name: '新客户', value: customerRate.newCustomers }
  ] : [];

  const qualityPieData = qualityPassRate ? [
    { name: '合格', value: qualityPassRate.passed },
    { name: '不合格', value: qualityPassRate.failed }
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📊 数据统计</div>
        <div className="page-subtitle">铁匠铺经营数据综合统计与分析</div>
      </div>

      {overview && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-value">{overview.totalOrders}</div>
            <div className="stat-label">总订单数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#32cd32' }}>{overview.completedOrders}</div>
            <div className="stat-label">已完成订单</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ff6600' }}>{overview.forgingOrders}</div>
            <div className="stat-label">锻造中订单</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#4682b4' }}>{overview.furnaceSuccessRate}%</div>
            <div className="stat-label">炉温控制成功率</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#32cd32' }}>{overview.qualityPassRate || 0}%</div>
            <div className="stat-label">质检合格率</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ff6600' }}>{overview.totalReworks || 0}</div>
            <div className="stat-label">返工总数 (进行中:{overview.inProgressReworks || 0})</div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="card">
          <div className="card-title">⚔️ 各产品类型需求分布</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
              <XAxis dataKey="name" stroke="#b8956e" />
              <YAxis stroke="#b8956e" />
              <Tooltip
                contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
              />
              <Legend wrapperStyle={{ color: '#d4a574' }} />
              <Bar dataKey="value" name="订单数量" fill="#ff6600" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#b8956e' }}>
            共 {productDist.length} 种产品类型，总需求量 {productDist.reduce((s, x) => s + x.value, 0)} 件
          </div>
        </div>

        <div className="card">
          <div className="card-title">🔥 各材质炉温控制成功率</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={furnaceRate} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
              <XAxis type="number" domain={[0, 100]} stroke="#b8956e" />
              <YAxis dataKey="material" type="category" stroke="#b8956e" width={80} />
              <Tooltip
                contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
                formatter={(value, name) => {
                  if (name === 'rate') return [`${value}%`, '成功率'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ color: '#d4a574' }} />
              <Bar dataKey="rate" name="成功率(%)" fill="#32cd32" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', display: 'flex', gap: '20px', fontSize: '13px', color: '#b8956e' }}>
            {furnaceRate.map(f => (
              <span key={f.material}>
                {f.material}: {f.success}/{f.total} 次
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">⏱️ 锻造周期分布</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forgeCycle}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
              <XAxis dataKey="range" stroke="#b8956e" />
              <YAxis stroke="#b8956e" allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
              />
              <Legend wrapperStyle={{ color: '#d4a574' }} />
              <Bar dataKey="count" name="订单数" fill="#daa520" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#b8956e' }}>
            共 {forgeCycle.reduce((s, x) => s + x.count, 0)} 个已完成订单统计
          </div>
        </div>

        <div className="card">
          <div className="card-title">👥 回头客比例</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#b8956e' }}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, padding: '10px' }}>
              {customerRate && (
                <>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">总客户数</div>
                    <div className="info-item-value">{customerRate.totalCustomers}</div>
                  </div>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">回头客比例</div>
                    <div className="info-item-value" style={{ color: '#32cd32' }}>
                      {customerRate.returningRate}%
                    </div>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#d4a574', marginBottom: '8px' }}>
                      客户明细：
                    </div>
                    <div style={{ maxHeight: '130px', overflowY: 'auto', fontSize: '12px' }}>
                      {customerRate.details.map((c, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '5px 8px',
                            borderBottom: '1px solid rgba(92, 51, 23, 0.5)',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ color: c.isReturning ? '#32cd32' : '#b8956e' }}>
                            {c.isReturning ? '★ ' : ''}{c.name}
                          </span>
                          <span style={{ color: '#daa520' }}>{c.orderCount} 单</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">✅ 质检合格率</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={280}>
              <PieChart>
                <Pie
                  data={qualityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#b8956e' }}
                >
                  {qualityPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#32cd32' : '#cd5c5c'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, padding: '10px' }}>
              {qualityPassRate && (
                <>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">总质检数</div>
                    <div className="info-item-value">{qualityPassRate.total}</div>
                  </div>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">合格率</div>
                    <div className="info-item-value" style={{ color: '#32cd32' }}>
                      {qualityPassRate.passRate}%
                    </div>
                  </div>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">不合格数</div>
                    <div className="info-item-value" style={{ color: '#cd5c5c' }}>
                      {qualityPassRate.failed}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {qualityPassRate && qualityPassRate.byMaterial && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#b8956e' }}>
              各材质合格率：{qualityPassRate.byMaterial.map(m => `${m.material} ${m.rate}%`).join(' | ')}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">📋 返工原因分布</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reworkReasonDist} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
              <XAxis type="number" stroke="#b8956e" allowDecimals={false} />
              <YAxis dataKey="name" type="category" stroke="#b8956e" width={120} />
              <Tooltip
                contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
              />
              <Legend wrapperStyle={{ color: '#d4a574' }} />
              <Bar dataKey="value" name="出现次数" fill="#ff6347" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">📊 不同材质返工率</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={materialReworkRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
              <XAxis dataKey="material" stroke="#b8956e" />
              <YAxis stroke="#b8956e" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
                formatter={(value, name) => {
                  if (name === 'reworkRate') return [`${value}%`, '返工率'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ color: '#d4a574' }} />
              <Bar dataKey="reworkRate" name="返工率(%)" fill="#ff8c00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#b8956e', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {materialReworkRate.map(m => (
              <span key={m.material}>
                {m.material}: {m.reworked}/{m.total} 件 ({m.reworkRate}%)
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">🔄 平均返工次数统计</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '45%', padding: '10px' }}>
              {avgReworkCount && (
                <>
                  <div className="info-item" style={{ marginBottom: '15px' }}>
                    <div className="info-item-label">平均返工次数</div>
                    <div className="info-item-value" style={{ fontSize: '42px', color: '#ffcc66' }}>
                      {avgReworkCount.averageReworkCount}
                    </div>
                  </div>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">返工产品总数</div>
                    <div className="info-item-value">{avgReworkCount.totalReworkedProducts}</div>
                  </div>
                  <div className="info-item" style={{ marginBottom: '12px' }}>
                    <div className="info-item-label">返工操作总次数</div>
                    <div className="info-item-value">{avgReworkCount.totalReworkOperations}</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ width: '55%' }}>
              {avgReworkCount && avgReworkCount.byType && (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={avgReworkCount.byType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#5c3317" />
                    <XAxis type="number" stroke="#b8956e" />
                    <YAxis dataKey="type" type="category" stroke="#b8956e" width={100} />
                    <Tooltip
                      contentStyle={{ background: '#2c1810', border: '1px solid #8b4513', color: '#f5e6d3' }}
                    />
                    <Legend wrapperStyle={{ color: '#d4a574' }} />
                    <Bar dataKey="count" name="返工单数" fill="#9370db" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
