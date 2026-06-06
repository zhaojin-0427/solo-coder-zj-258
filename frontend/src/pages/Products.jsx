import React, { useState, useEffect } from 'react';
import { productsAPI, ordersAPI, qualityAPI, furnaceAPI } from '../api/index.js';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [furnaceRecords, setFurnaceRecords] = useState([]);
  const [filterGrade, setFilterGrade] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    orderId: '',
    productName: '',
    material: '熟铁',
    sharpness: 3,
    weight: '',
    qualityGrade: '甲级',
    inspector: '老铁匠',
    passedDate: new Date().toISOString().split('T')[0]
  });
  const [inspectionForm, setInspectionForm] = useState({
    appearanceScore: 8,
    sharpnessMeasured: 3,
    hardnessMin: 50,
    hardnessMax: 55,
    isPassed: true,
    defectDescription: '',
    reworkSuggestion: '',
    inspector: '老铁匠',
    inspectionDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadInspections();
    loadFurnaceRecords();
  }, [filterGrade]);

  const loadProducts = async () => {
    try {
      const res = await productsAPI.list({ qualityGrade: filterGrade });
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.list();
      if (res.success) setOrders(res.data.filter(o => o.status === '已完成' || o.status === '锻造中'));
    } catch (err) {
      console.error(err);
    }
  };

  const loadInspections = async () => {
    try {
      const res = await qualityAPI.listInspections();
      if (res.success) setInspections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFurnaceRecords = async () => {
    try {
      const res = await furnaceAPI.list();
      if (res.success) setFurnaceRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInspectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInspectionForm({
      ...inspectionForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreate = async () => {
    try {
      const res = await productsAPI.create({
        ...formData,
        sharpness: parseInt(formData.sharpness),
        weight: parseFloat(formData.weight)
      });
      if (res.success) {
        setShowModal(false);
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenInspection = (product) => {
    setSelectedProduct(product);
    const existingInspection = inspections.find(i => i.productId === product.id);
    if (existingInspection) {
      setInspectionForm({
        appearanceScore: existingInspection.appearanceScore,
        sharpnessMeasured: existingInspection.sharpnessMeasured,
        hardnessMin: existingInspection.hardnessMin,
        hardnessMax: existingInspection.hardnessMax,
        isPassed: existingInspection.isPassed,
        defectDescription: existingInspection.defectDescription,
        reworkSuggestion: existingInspection.reworkSuggestion,
        inspector: existingInspection.inspector,
        inspectionDate: existingInspection.inspectionDate,
        remarks: existingInspection.remarks
      });
    } else {
      setInspectionForm({
        appearanceScore: 8,
        sharpnessMeasured: product.sharpness || 3,
        hardnessMin: product.material === '高碳钢' ? 55 : (product.material === '不锈钢' ? 50 : 180),
        hardnessMax: product.material === '高碳钢' ? 60 : (product.material === '不锈钢' ? 55 : 220),
        isPassed: true,
        defectDescription: '',
        reworkSuggestion: '',
        inspector: '老铁匠',
        inspectionDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
    }
    setShowInspectionModal(true);
  };

  const handleSubmitInspection = async () => {
    if (!selectedProduct) return;
    try {
      const furnaceRec = furnaceRecords.find(f => f.orderId === selectedProduct.orderId);
      const res = await qualityAPI.createInspection({
        productId: selectedProduct.id,
        orderId: selectedProduct.orderId,
        furnaceRecordId: furnaceRec ? furnaceRec.id : null,
        productName: selectedProduct.productName,
        serialNumber: selectedProduct.serialNumber,
        material: selectedProduct.material,
        ...inspectionForm,
        appearanceScore: parseInt(inspectionForm.appearanceScore),
        sharpnessMeasured: parseInt(inspectionForm.sharpnessMeasured),
        hardnessMin: parseInt(inspectionForm.hardnessMin),
        hardnessMax: parseInt(inspectionForm.hardnessMax)
      });
      if (res.success) {
        setShowInspectionModal(false);
        loadProducts();
        loadInspections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReworkFromInspection = async () => {
    if (!selectedProduct) return;
    try {
      const furnaceRec = furnaceRecords.find(f => f.orderId === selectedProduct.orderId);
      const existingInspection = inspections.find(i => i.productId === selectedProduct.id);
      const res = await qualityAPI.createRework({
        productId: selectedProduct.id,
        orderId: selectedProduct.orderId,
        furnaceRecordId: furnaceRec ? furnaceRec.id : null,
        productName: selectedProduct.productName,
        serialNumber: selectedProduct.serialNumber,
        material: selectedProduct.material,
        qualityInspectionId: existingInspection ? existingInspection.id : null,
        reworkReason: inspectionForm.defectDescription,
        reworkSuggestion: inspectionForm.reworkSuggestion,
        status: '待返工'
      });
      if (res.success) {
        setShowInspectionModal(false);
        alert('返工记录已创建，请前往质检返工页面查看');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeliver = async (id) => {
    try {
      const res = await productsAPI.deliver(id);
      if (res.success) loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确认删除此成品档案？')) {
      try {
        const res = await productsAPI.remove(id);
        if (res.success) loadProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getGradeBadge = (grade) => {
    const colors = {
      '甲级': 'badge-success',
      '乙级': 'badge-scheduled',
      '丙级': 'badge-pending'
    };
    return <span className={`badge ${colors[grade] || ''}`}>{grade}</span>;
  };

  const getProductInspection = (productId) => {
    return inspections.find(i => i.productId === productId);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🗡️ 成品档案</div>
        <div className="page-subtitle">管理已锻造完成的产品档案与交付记录</div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select
            className="form-select"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="">全部品级</option>
            <option value="甲级">甲级</option>
            <option value="乙级">乙级</option>
            <option value="丙级">丙级</option>
          </select>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 新增成品档案
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>产品编号</th>
              <th>产品名称</th>
              <th>关联订单</th>
              <th>材质</th>
              <th>锋利度</th>
              <th>品级</th>
              <th>质检状态</th>
              <th>交付状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const inspection = getProductInspection(p.id);
              return (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', color: '#ffcc66' }}>{p.serialNumber}</td>
                  <td>{p.productName}</td>
                  <td>订单 #{p.orderId}</td>
                  <td>{p.material}</td>
                  <td>{'★'.repeat(p.sharpness)}</td>
                  <td>{getGradeBadge(p.qualityGrade)}</td>
                  <td>
                    {inspection ? (
                      inspection.isPassed ? (
                        <span className="badge badge-success">合格</span>
                      ) : (
                        <span className="badge badge-fail">不合格</span>
                      )
                    ) : (
                      <span className="badge badge-pending">未质检</span>
                    )}
                  </td>
                  <td>
                    {p.delivered ? (
                      <span className="badge badge-success">已交付</span>
                    ) : (
                      <span className="badge badge-pending">待交付</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleOpenInspection(p)}
                      >
                        {inspection ? '查看质检' : '登记质检'}
                      </button>
                      {!p.delivered && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleDeliver(p.id)}
                        >
                          交付
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-state">暂无成品档案</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">🗡️ 新增成品档案</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">关联订单</label>
                <select
                  className="form-select"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                >
                  <option value="">请选择订单</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.id} {o.customerName} - {o.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">产品名称</label>
                <input
                  type="text"
                  className="form-input"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">材质</label>
                <select
                  className="form-select"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                >
                  <option value="熟铁">熟铁</option>
                  <option value="高碳钢">高碳钢</option>
                  <option value="不锈钢">不锈钢</option>
                  <option value="生铁">生铁</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">锋利度 ({formData.sharpness}★)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  name="sharpness"
                  value={formData.sharpness}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">重量(kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">质量品级</label>
                <select
                  className="form-select"
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleInputChange}
                >
                  <option value="甲级">甲级 - 优品</option>
                  <option value="乙级">乙级 - 良品</option>
                  <option value="丙级">丙级 - 合格品</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">检验员</label>
                <input
                  type="text"
                  className="form-input"
                  name="inspector"
                  value={formData.inspector}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">检验合格日期</label>
              <input
                type="date"
                className="form-input"
                name="passedDate"
                value={formData.passedDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreate}>保存档案</button>
            </div>
          </div>
        </div>
      )}

      {showInspectionModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowInspectionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">🔍 质检登记 - {selectedProduct.productName} ({selectedProduct.serialNumber})</div>

            <div className="info-item" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <div className="info-item-label">产品名称</div>
                  <div className="info-item-value">{selectedProduct.productName}</div>
                </div>
                <div>
                  <div className="info-item-label">材质</div>
                  <div className="info-item-value">{selectedProduct.material}</div>
                </div>
                <div>
                  <div className="info-item-label">关联订单</div>
                  <div className="info-item-value">#{selectedProduct.orderId}</div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">外观评分 ({inspectionForm.appearanceScore}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  name="appearanceScore"
                  value={inspectionForm.appearanceScore}
                  onChange={handleInspectionChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">锋利度实测 ({inspectionForm.sharpnessMeasured}★)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  name="sharpnessMeasured"
                  value={inspectionForm.sharpnessMeasured}
                  onChange={handleInspectionChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">硬度最小值 (HRC/HB)</label>
                <input
                  type="number"
                  className="form-input"
                  name="hardnessMin"
                  value={inspectionForm.hardnessMin}
                  onChange={handleInspectionChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">硬度最大值 (HRC/HB)</label>
                <input
                  type="number"
                  className="form-input"
                  name="hardnessMax"
                  value={inspectionForm.hardnessMax}
                  onChange={handleInspectionChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="isPassed"
                  checked={inspectionForm.isPassed}
                  onChange={handleInspectionChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <span className="form-label" style={{ margin: 0 }}>质检合格</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">缺陷描述</label>
              <textarea
                className="form-textarea"
                name="defectDescription"
                rows="2"
                value={inspectionForm.defectDescription}
                onChange={handleInspectionChange}
                placeholder="如合格可留空"
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">返工建议</label>
              <textarea
                className="form-textarea"
                name="reworkSuggestion"
                rows="2"
                value={inspectionForm.reworkSuggestion}
                onChange={handleInspectionChange}
                placeholder="如合格可留空"
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">检验员</label>
                <input
                  type="text"
                  className="form-input"
                  name="inspector"
                  value={inspectionForm.inspector}
                  onChange={handleInspectionChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">质检日期</label>
                <input
                  type="date"
                  className="form-input"
                  name="inspectionDate"
                  value={inspectionForm.inspectionDate}
                  onChange={handleInspectionChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea
                className="form-textarea"
                name="remarks"
                rows="2"
                value={inspectionForm.remarks}
                onChange={handleInspectionChange}
                style={{ resize: 'vertical', minHeight: '60px' }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowInspectionModal(false)}>取消</button>
              {!inspectionForm.isPassed && (
                <button className="btn btn-warning" onClick={handleCreateReworkFromInspection}>创建返工记录</button>
              )}
              <button className="btn btn-primary" onClick={handleSubmitInspection}>保存质检结果</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
