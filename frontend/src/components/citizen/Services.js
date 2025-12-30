import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/CitizenServices.css';
import XinCapGiayXacNhanForm from './XinCapGiayXacNhanForm';

const CitizenServices = ({ currentUser }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeFromQuery = queryParams.get('type') || 'tam_tru';

  const [serviceType, setServiceType] = useState(typeFromQuery);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    service_type: typeFromQuery,
    member_id: '',
    content: '',
    details: {},
  });
  const [members, setMembers] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Mock members data
    const mockMembers = [
      { id: 1, ho_ten: 'Nguyễn Văn A' },
      { id: 2, ho_ten: 'Nguyễn Thị B' },
      { id: 3, ho_ten: 'Nguyễn Văn C' },
      { id: 4, ho_ten: 'Nguyễn Thị D' },
    ];
    setMembers(mockMembers);
  }, []);

  const services = {
    tam_tru: {
      title: 'Đăng Ký Tạm Trú',
      description: 'Đăng ký tạm trú tại địa chỉ khác ngoài nơi đăng ký hộ khẩu',
      fields: ['từ_ngày', 'đến_ngày', 'địa_chỉ_tạm_trú', 'lý_do'],
    },
    update_info: {
      title: 'Báo Sai Thông Tin',
      description: 'Báo cáo thông tin trong hộ khẩu không chính xác',
      fields: ['thông_tin_sai', 'thông_tin_đúng', 'lý_do'],
    },
    tam_vang: {
      title: 'Khai Báo Tạm Vắng',
      description: 'Khai báo tạm vắng khỏi nơi cư trú',
      fields: ['từ_ngày', 'đến_ngày', 'lý_do'],
    },
    xac_nhan: {
      title: 'Cấp Giấy Xác Nhận',
      description: 'Yêu cầu cấp giấy xác nhận thông tin hộ khẩu/nhân khẩu',
      fields: ['loại_giấy', 'số_lượng', 'lý_do'],
    },
  };

  const currentService = services[formData.service_type];

  const handleServiceChange = (type) => {
    setFormData({
      service_type: type,
      member_id: '',
      content: '',
      details: {},
    });
    setFormStep(1);
    setSubmitSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: value,
      },
    }));
  };

  const handleNextStep = () => {
    if (formStep === 1 && !formData.member_id) {
      alert('Vui lòng chọn thành viên!');
      return;
    }
    setFormStep(formStep + 1);
  };

  const handlePrevStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    if (!formData.member_id) {
      alert('Vui lòng chọn thành viên!');
      return;
    }

    // Simulate API call
    console.log('Submitting form:', formData);

    // Show success message
    setSubmitSuccess(true);
    setTimeout(() => {
      setFormStep(1);
      setFormData({
        service_type: formData.service_type,
        member_id: '',
        content: '',
        details: {},
      });
    }, 3000);
  };

  return (
    <div className="citizen-services">
      <div className="section-header">
        <h2>Dịch Vụ Công</h2>
        <p className="subtitle">Nộp đơn yêu cầu dịch vụ công trực tuyến</p>
      </div>

      {/* Service Selection */}
      <div className="service-selection">
        <h3>Chọn Dịch Vụ</h3>
        <div className="service-cards">
          {Object.entries(services).map(([key, service]) => (
            <button
              key={key}
              className={`service-option ${
                formData.service_type === key ? 'active' : ''
              }`}
              onClick={() => handleServiceChange(key)}
            >
              <span className="icon">{service.icon}</span>
              <span className="title">{service.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Service Form */}
      <div className="service-form-container">
        <div className="form-header">
          <h3>{currentService.title}</h3>
          <p className="description">{currentService.description}</p>
        </div>

        {/* For xac_nhan service, use dedicated form component */}
        {formData.service_type === 'xac_nhan' && (
          <XinCapGiayXacNhanForm currentUser={currentUser} />
        )}

        {formData.service_type !== 'xac_nhan' && (
          <>
            {submitSuccess && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h4>Yêu cầu đã được gửi thành công!</h4>
                <p>Mã yêu cầu: REQ-2024-{Math.floor(Math.random() * 9999)}</p>
                <p>
                  Vui lòng kiểm tra email hoặc quay lại trang này để theo dõi
                  trạng thái
                </p>
              </div>
            )}

            {!submitSuccess && (
              <form onSubmit={handleSubmit}>
                {/* Step 1: Member Selection */}
                {formStep === 1 && (
                  <div className="form-step">
                    <h4>Bước 1: Chọn Thành Viên</h4>
                    <div className="form-group">
                      <label>Thành Viên *</label>
                      <select
                        value={formData.member_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            member_id: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">-- Chọn thành viên --</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.ho_ten}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {formStep === 2 && (
                  <div className="form-step">
                    <h4>Bước 2: Nhập Thông Tin Chi Tiết</h4>

                    {formData.service_type === 'tam_tru' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Từ Ngày *</label>
                            <input
                              type="date"
                              name="từ_ngày"
                              value={formData.details.từ_ngày || ''}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Đến Ngày *</label>
                            <input
                              type="date"
                              name="đến_ngày"
                              value={formData.details.đến_ngày || ''}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Địa Chỉ Tạm Trú *</label>
                          <input
                            type="text"
                            name="địa_chỉ_tạm_trú"
                            placeholder="Nhập địa chỉ tạm trú"
                            value={formData.details.địa_chỉ_tạm_trú || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Lý Do *</label>
                          <textarea
                            name="lý_do"
                            placeholder="Nhập lý do tạm trú"
                            rows="4"
                            value={formData.details.lý_do || ''}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                      </>
                    )}

                    {formData.service_type === 'update_info' && (
                      <>
                        <div className="form-group">
                          <label>Thông Tin Sai *</label>
                          <textarea
                            name="thông_tin_sai"
                            placeholder="Nhập thông tin sai hiện tại"
                            rows="3"
                            value={formData.details.thông_tin_sai || ''}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                        <div className="form-group">
                          <label>Thông Tin Đúng *</label>
                          <textarea
                            name="thông_tin_đúng"
                            placeholder="Nhập thông tin đúng"
                            rows="3"
                            value={formData.details.thông_tin_đúng || ''}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                        <div className="form-group">
                          <label>Lý Do *</label>
                          <textarea
                            name="lý_do"
                            placeholder="Nhập lý do sai thông tin"
                            rows="3"
                            value={formData.details.lý_do || ''}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                      </>
                    )}

                    {formData.service_type === 'tam_vang' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Từ Ngày *</label>
                            <input
                              type="date"
                              name="từ_ngày"
                              value={formData.details.từ_ngày || ''}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Đến Ngày *</label>
                            <input
                              type="date"
                              name="đến_ngày"
                              value={formData.details.đến_ngày || ''}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Lý Do *</label>
                          <textarea
                            name="lý_do"
                            placeholder="Nhập lý do tạm vắng"
                            rows="4"
                            value={formData.details.lý_do || ''}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                      </>
                    )}

                    {formData.service_type === 'xac_nhan' && (
                      <>
                        <div className="form-group">
                          <label>Loại Giấy *</label>
                          <select
                            name="loại_giấy"
                            value={formData.details.loại_giấy || ''}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">-- Chọn loại giấy --</option>
                            <option value="ho_khau">Xác nhận hộ khẩu</option>
                            <option value="nhan_khau">
                              Xác nhận nhân khẩu
                            </option>
                            <option value="tam_tru">Xác nhận tạm trú</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Số Lượng *</label>
                          <input
                            type="number"
                            name="số_lượng"
                            min="1"
                            placeholder="Nhập số lượng bản"
                            value={formData.details.số_lượng || ''}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Lý Do *</label>
                          <textarea
                            name="lý_do"
                            placeholder="Nhập lý do cấp giấy"
                            rows="3"
                            value={formData.details.lý_do || ''}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {formStep === 3 && (
                  <div className="form-step">
                    <h4>Bước 3: Xác Nhận Thông Tin</h4>
                    <div className="confirmation">
                      <p>
                        <strong>Dịch Vụ:</strong> {currentService.title}
                      </p>
                      <p>
                        <strong>Thành Viên:</strong>{' '}
                        {
                          members.find((m) => m.id == formData.member_id)
                            ?.ho_ten
                        }
                      </p>
                      <p className="notice">
                        ℹ️ Yêu cầu của bạn sẽ được gửi đến cán bộ xử lý. Vui
                        lòng chờ thông báo duyệt trong vòng 3-5 ngày làm việc.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Navigation */}
                <div className="form-navigation">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrevStep}
                    disabled={formStep === 1}
                  >
                    ← Quay Lại
                  </button>

                  {formStep < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNextStep}
                    >
                      Tiếp Theo →
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success">
                      ✓ Gửi Yêu Cầu
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CitizenServices;
