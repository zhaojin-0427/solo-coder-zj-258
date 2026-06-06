import React, { useState, useEffect } from 'react';
import { qualityAPI, productsAPI, ordersAPI, furnaceAPI } from '../api/index.js';

const Quality = () => {
  const [activeTab, setActiveTab] = useState('inspections');
  const [inspections, setInspections] = useState([]);
  const [reworks, setReworks] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [furnaceRecords, setFurnaceRecords] = useState([]);
  const [filterPassed, setFilterPassed] = useState('');
  const [filterReworkStatus, setFilterReworkStatus] = useState('');
  const [showReworkModal, setShowReworkModal] = useState(false);
  const [editingRework, setEditingRework] = useState(null);
  const [reworkForm, setReworkForm] = useState({
    productId: '',
    orderId: '',
    furnaceRecordId: '',
    qualityInspectionId: '',
    reworkReason: '',
    reworkSuggestion: '',
    status: '待返工',
    reworkType: '',
    operator: '',
    cost: 0,
    notes: ''
  });

  useEffect(() => {
    loadAll();
  }, [filterPassed, filterReworkStatus, activeTab]);

  const loadAll = async () => {
    try {
      const [iRes, rRes, pRes, oRes, fRes] = await Promise.all([
        qualityAPI.listInspections({ isPassed: filterPassed }),
        qualityAPI.listReworks({ status: filterReworkStatus }),
        productsAPI.list(),
        ordersAPI.list(),
        furnaceAPI.list()
      ]);
      if (iRes.success) setInspections(iRes.data);
      if (rRes.success) setReworks(rRes.data);
      if (pRes.success) setProducts(pRes.data);
      if (oRes.success) setOrders(oRes.data);
      if (fRes.success) setFurnaceRecords(fRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReworkInputChange = (e) => {
    const { name, value } = e.target;
    setReworkForm({ ...reworkForm, [name]: value });
  };

  const handleProductSelect = (e) => {
    const productId = parseInt(e.target.value);
    const product = products.find(p => p.id === productId);
    const inspection = inspections.find(i => i.productId === productId);
    const furnaceRec = product ? furnaceRecords.find(f => f.orderId === product.orderId) : null;
    setReworkForm({
      ...reworkForm,
      productId: productId || '',
      orderId: product ? product.orderId : '',
      furnaceRecordId: furnaceRec ? furnaceRec.id : '',
      qualityInspectionId: inspection ? inspection.id : '',
      reworkReason: inspection ? inspection.defectDescription : '',
      reworkSuggestion: inspection ? inspection.reworkSuggestion : ''
    });
  };

  const handleOpenReworkModal = (rework = null) => {
    if (rework) {
      setEditingRework(rework);
      setReworkForm({
        productId: rework.productId,
        orderId: rework.orderId,
        furnaceRecordId: rework.furnaceRecordId || '',
        qualityInspectionId: rework.qualityInspectionId || '',
        reworkReason: rework.reworkReason,
        reworkSuggestion: rework.reworkSuggestion,
        status: rework.status,
        reworkType: rework.reworkType,
        operator: rework.operator,
        cost: rework.cost,
        notes: rework.notes
      });
    } else {
      setEditingRework(null);
      setReworkForm({
        productId: '',
        orderId: '',
        furnaceRecordId: '',
        qualityInspectionId: '',
        reworkReason: '',
        reworkSuggestion: '',
        status: '待返工',
        reworkType: '',
        operator: '',
        cost: 0,
        notes: ''
      });
    }
    setShowReworkModal(true);
  };

  const handleSaveRework = async () => {
    try {
      let res;
      if (editingRework) {
        res = await qualityAPI.updateRework(editingRework.id, reworkForm);
      } else {
        const product = products.find(p => p.id === parseInt(reworkForm.productId));
        res = await qualityAPI.createRework({
          ...reworkForm,
          productName: product ? product.productName : '',
          serialNumber: product ? product.serialNumber : '',
          material: product ? product.material : ''
        });
      }
      if (res.success) {
        setShowReworkModal(false);
        loadAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartRework = async (id) => {
    try {
      const res = await qualityAPI.startRework(id, { operator: '老铁匠' });
      if (res.success) loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteRework = async (id) => {
    const notes = prompt('请输入返工完成备注（可选）：');
    try {
      const res = await qualityAPI.completeRework(id, { notes: notes || '' });
      if (res.success) loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRework = async (id) => {
    if (window.confirm('确认删除此返工记录？')) {
      try {
        const res = await qualityAPI.removeRework(id);
        if (res.success) loadAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteInspection = async (id) => {
    if (window.confirm('确认删除此质检记录？')) {
      try {
        const res = await qualityAPI.removeInspection(id);
        if (res.success) loadAll();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getReworkStatusBadge = (status) => {
    const styles = {
      '待返工': 'badge-pending',
      '返工中': 'badge-forging',
      '已完成': 'badge-success'
    };
    return <span className={`badge ${styles[status] || ''}`}>{status}</span>;
  };

  const failedProducts = products.filter(p => {
    const insp = inspections.find(i => i.productId === p.id);
    return insp && !insp.isPassed;
  });

  const reworkedProductIds = new Set(reworks.map(r => r.productId));
  const productsNeedingRework = failedProducts.filter(p => !reworkedProductIds.has(p.id));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔍 质检与返工跟踪</div>
        <div className="page-subtitle">成品质量检验登记与不合格品返工流程管理</div>
      </div>

      <div className="card" style={{ marginBottom: '15px', padding: '10px 20px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            className={`btn ${activeTab === 'inspections' ? 'btn-primary' : 'btn-default'}`}
            onClick={() => setActiveTab('inspections')}
          >
            📋 质检记录
          </button>
          <button
            className={`btn ${activeTab === 'reworks' ? 'btn-primary' : 'btn-default'}`}
            onClick={() => setActiveTab('reworks')}
          >
            🔧 返工记录
          </button>
        </div>
      </div>

      {activeTab === 'inspections' && (
        <div className="card">
          <div className="filter-bar">
            <select
              className="form-select"
              value={filterPassed}
              onChange={(e) => setFilterPassed(e.target.value)}
            >
              <option value="">全部质检结果</option>
              <option value="true">合格</option>
              <option value="false">不合格</option>
            </select>
            <div style={{ flex: 1 }} />
            <span style={{ color: '#b8956e', fontSize: '13px' }}>
              共 {inspections.length} 条质检记录，合格率 {inspections.length > 0 ? Math.round(inspections.filter(i => i.isPassed).length / inspections.length * 100) : 0}%
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>质检编号</th>
                <th>产品编号</th>
                <th>产品名称</th>
                <th>关联订单</th>
                <th>炉温记录</th>
                <th>外观</th>
                <th>锋利度</th>
                <th>硬度区间</th>
                <th>结果</th>
                <th>检验员</th>
                <th>质检日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontFamily: 'monospace', color: '#ffcc66' }}>Q{String(q.id).padStart(4, '0')}</td>
                  <td style={{ fontFamily: 'monospace' }}>{q.serialNumber}</td>
                  <td>{q.productName}</td>
                  <td>#{q.orderId}</td>
                  <td>{q.furnaceRecordId ? `#${q.furnaceRecordId}` : '-'}</td>
                  <td>{q.appearanceScore}/10</td>
                  <td>{'★'.repeat(q.sharpnessMeasured)}</td>
                  <td>{q.hardnessMin}-{q.hardnessMax}</td>
                  <td>
                    {q.isPassed ? (
                      <span className="badge badge-success">合格</span>
                    ) : (
                      <span className="badge badge-fail">不合格</span>
                    )}
                  </td>
                  <td>{q.inspector}</td>
                  <td>{q.inspectionDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                      {!q.isPassed && !reworks.find(r => r.qualityInspectionId === q.id) && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleOpenReworkModal()}
                        >
                          创建返工
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteInspection(q.id)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan="12" className="empty-state">暂无质检记录</td>
                </tr>
              )}
            </tbody>
          </table>

          {inspections.some(q => !q.isPassed) && (
            <div style={{ marginTop: '20px' }}>
              <div className="card-title">⚠️ 不合格质检详情</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {inspections.filter(q => !q.isPassed).map((q) => (
                  <div key={q.id} style={{
                    background: 'rgba(139, 0, 0, 0.15)',
                    border: '1px solid #8b4513',
                    borderRadius: '6px',
                    padding: '12px 15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#ffcc66', fontWeight: 'bold' }}>
                        {q.productName} ({q.serialNumber})
                      </span>
                      <span className="badge badge-fail">不合格</span>
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                      <div><span style={{ color: '#b8956e' }}>缺陷描述：</span>{q.defectDescription || '无'}</div>
                      <div><span style={{ color: '#b8956e' }}>返工建议：</span>{q.reworkSuggestion || '无'}</div>
                      {q.remarks && <div><span style={{ color: '#b8956e' }}>备注：</span>{q.remarks}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reworks' && (
        <div className="card">
          <div className="filter-bar">
            <select
              className="form-select"
              value={filterReworkStatus}
              onChange={(e) => setFilterReworkStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="待返工">待返工</option>
              <option value="返工中">返工中</option>
              <option value="已完成">已完成</option>
            </select>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => handleOpenReworkModal()}>
              + 新增返工记录
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>返工编号</th>
                <th>产品编号</th>
                <th>产品名称</th>
                <th>材质</th>
                <th>返工类型</th>
                <th>返工原因</th>
                <th>状态</th>
                <th>返工次数</th>
                <th>开始日期</th>
                <th>完成日期</th>
                <th>操作员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reworks.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', color: '#ffcc66' }}>R{String(r.id).padStart(4, '0')}</td>
                  <td style={{ fontFamily: 'monospace' }}>{r.serialNumber}</td>
                  <td>{r.productName}</td>
                  <td>{r.material}</td>
                  <td>{r.reworkType || '-'}</td>
                  <td style={{ maxWidth: '180px', fontSize: '12px' }}>{r.reworkReason}</td>
                  <td>{getReworkStatusBadge(r.status)}</td>
                  <td>{r.reworkCount}</td>
                  <td>{r.startedDate || '-'}</td>
                  <td>{r.completedDate || '-'}</td>
                  <td>{r.operator || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {r.status === '待返工' && (
                        <button className="btn btn-sm btn-warning" onClick={() => handleStartRework(r.id)}>
                          开始返工
                        </button>
                      )}
                      {r.status === '返工中' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleCompleteRework(r.id)}>
                          完成返工
                        </button>
                      )}
                      <button className="btn btn-sm btn-default" onClick={() => handleOpenReworkModal(r)}>
                        编辑
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRework(r.id)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reworks.length === 0 && (
                <tr>
                  <td colSpan="12" className="empty-state">暂无返工记录</td>
                </tr>
              )}
            </tbody>
          </table>

          {reworks.some(r => r.status !== '已完成') && (
            <div style={{ marginTop: '20px' }}>
              <div className="card-title">📌 进行中返工任务</div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {reworks.filter(r => r.status !== '已完成').map((r) => (
                  <div key={r.id} style={{
                    background: r.status === '返工中' ? 'rgba(255, 102, 0, 0.15)' : 'rgba(139, 69, 19, 0.2)',
                    border: `1px solid ${r.status === '返工中' ? '#ff6600' : '#8b4513'}`,
                    borderRadius: '6px',
                    padding: '12px 15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#ffcc66', fontWeight: 'bold' }}>
                        {r.productName} ({r.serialNumber})
                      </span>
                      {getReworkStatusBadge(r.status)}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                      <div><span style={{ color: '#b8956e' }}>返工类型：</span>{r.reworkType || '未指定'}</div>
                      <div><span style={{ color: '#b8956e' }}>返工原因：</span>{r.reworkReason}</div>
                      <div><span style={{ color: '#b8956e' }}>返工建议：</span>{r.reworkSuggestion}</div>
                      {r.notes && <div><span style={{ color: '#b8956e' }}>备注：</span>{r.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showReworkModal && (
        <div className="modal-overlay" onClick={() => setShowReworkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">🔧 {editingRework ? '编辑返工记录' : '新增返工记录'}</div>

            <div className="form-group">
              <label className="form-label">选择产品（不合格成品）</label>
              <select
                className="form-select"
                name="productId"
                value={reworkForm.productId}
                onChange={handleProductSelect}
                disabled={!!editingRework}
              >
                <option value="">请选择成品</option>
                {failedProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.serialNumber} - {p.productName} (#{p.orderId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">返工类型</label>
                <select
                  className="form-select"
                  name="reworkType"
                  value={reworkForm.reworkType}
                  onChange={handleReworkInputChange}
                >
                  <option value="">请选择</option>
                  <option value="重新锻造">重新锻造</option>
                  <option value="重新淬火">重新淬火</option>
                  <option value="重新锻造+淬火">重新锻造+淬火</option>
                  <option value="打磨修整">打磨修整</option>
                  <option value="回火处理">回火处理</option>
                  <option value="装配校正">装配校正</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">状态</label>
                <select
                  className="form-select"
                  name="status"
                  value={reworkForm.status}
                  onChange={handleReworkInputChange}
                >
                  <option value="待返工">待返工</option>
                  <option value="返工中">返工中</option>
                  <option value="已完成">已完成</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">返工原因</label>
              <textarea
                className="form-textarea"
                name="reworkReason"
                rows="2"
                value={reworkForm.reworkReason}
                onChange={handleReworkInputChange}
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">返工建议/方案</label>
              <textarea
                className="form-textarea"
                name="reworkSuggestion"
                rows="2"
                value={reworkForm.reworkSuggestion}
                onChange={handleReworkInputChange}
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">操作员</label>
                <input
                  type="text"
                  className="form-input"
                  name="operator"
                  value={reworkForm.operator}
                  onChange={handleReworkInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">返工成本 (元)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  name="cost"
                  value={reworkForm.cost}
                  onChange={handleReworkInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea
                className="form-textarea"
                name="notes"
                rows="2"
                value={reworkForm.notes}
                onChange={handleReworkInputChange}
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowReworkModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSaveRework}>
                {editingRework ? '保存修改' : '创建返工记录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quality;
