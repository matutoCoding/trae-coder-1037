import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, message, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { InspectionApply, ApplicationStatus, InspectionType, InspectionNature } from '@/types';
import { applicationApi, companyApi, equipmentApi, inspectorApi } from '@/utils/api';
import dayjs from 'dayjs';

const statusMap: Record<ApplicationStatus, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待受理' },
  approved: { color: 'green', text: '已受理' },
  rejected: { color: 'red', text: '已驳回' },
  scheduled: { color: 'blue', text: '已排期' },
  inspecting: { color: 'processing', text: '检验中' },
  completed: { color: 'success', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};

const typeMap: Record<InspectionType, string> = {
  periodic: '定期检验',
  supervision: '监督检验',
  commissioning: '安装监检',
  reinspection: '复检',
};

const natureMap: Record<InspectionNature, string> = {
  regular: '常规',
  special: '专项',
};

const ApplicationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InspectionApply[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InspectionApply | null>(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: number }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    fetchCompanies();
    fetchEquipments();
  }, []);

  const fetchCompanies = async () => {
    try {
      const result = await companyApi.getList({ page: 1, pageSize: 100 });
      setCompanyOptions(result.list.map(c => ({ label: c.name, value: c.id })));
    } catch (error) {
      console.error('获取单位列表失败:', error);
    }
  };

  const fetchEquipments = async () => {
    try {
      const result = await equipmentApi.getList({ page: 1, pageSize: 100 });
      setEquipmentOptions(result.list.map(e => ({ label: `${e.equipmentCode} - ${e.equipmentName}`, value: e.id })));
    } catch (error) {
      console.error('获取设备列表失败:', error);
    }
  };

  const columns: ColumnsType<InspectionApply> = [
    {
      title: '申请编号',
      dataIndex: 'applyNo',
      key: 'applyNo',
      width: 150,
    },
    {
      title: '单位ID',
      dataIndex: 'companyId',
      key: 'companyId',
      width: 100,
    },
    {
      title: '设备ID',
      dataIndex: 'equipmentId',
      key: 'equipmentId',
      width: 100,
    },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 120,
      render: (type: InspectionType) => typeMap[type],
    },
    {
      title: '检验性质',
      dataIndex: 'inspectionNature',
      key: 'inspectionNature',
      width: 100,
      render: (nature: InspectionNature) => natureMap[nature],
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      key: 'applyDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ApplicationStatus) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleReview(record, 'approved')}>
                受理
              </Button>
              <Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => handleReview(record, 'rejected')}>
                驳回
              </Button>
            </>
          )}
          {(record.status === 'pending' || record.status === 'rejected') && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      };
      if (searchText) {
        params.keyword = searchText;
      }
      if (statusFilter) {
        params.status = statusFilter as ApplicationStatus;
      }
      if (companyFilter) {
        params.companyId = parseInt(companyFilter);
      }
      const result = await applicationApi.getList(params);
      setData(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取报检列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: InspectionApply) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      applyDate: record.applyDate ? dayjs(record.applyDate) : undefined,
      approvalDate: record.approvalDate ? dayjs(record.approvalDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleView = (record: InspectionApply) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleReview = (record: InspectionApply, status: string) => {
    setCurrentRecord(record);
    reviewForm.resetFields();
    reviewForm.setFieldsValue({ status });
    setReviewVisible(true);
  };

  const handleDelete = (record: InspectionApply) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除报检申请「${record.applyNo}」吗？`,
      onOk: async () => {
        try {
          await applicationApi.delete(record.id);
          message.success('删除成功');
          handleSearch();
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        applyDate: values.applyDate ? (values.applyDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        approvalDate: values.approvalDate ? (values.approvalDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      };
      if (currentRecord) {
        await applicationApi.update(currentRecord.id!, submitData);
        message.success('更新成功');
      } else {
        await applicationApi.create(submitData as Omit<InspectionApply, 'id' | 'createdAt' | 'updatedAt'>);
        message.success('创建成功');
      }
      setModalVisible(false);
      handleSearch();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleReviewSubmit = async (values: { status: string; approvalOpinion: string }) => {
    if (!currentRecord) return;
    try {
      await applicationApi.review(currentRecord.id!, {
        status: values.status as ApplicationStatus,
        approvalOpinion: values.approvalOpinion,
      });
      message.success(values.status === 'approved' ? '受理成功' : '已驳回');
      setReviewVisible(false);
      handleSearch();
    } catch (error) {
      console.error('审核失败:', error);
    }
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  React.useEffect(() => {
    handleSearch();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">报检受理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增报检
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <Space wrap>
          <Input
            placeholder="搜索申请编号/申请人"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择单位"
            value={companyFilter || undefined}
            onChange={setCompanyFilter}
            style={{ width: 200 }}
            allowClear
            options={companyOptions}
          />
          <Select
            placeholder="选择状态"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'pending', label: '待受理' },
              { value: 'approved', label: '已受理' },
              { value: 'rejected', label: '已驳回' },
              { value: 'scheduled', label: '已排期' },
              { value: 'inspecting', label: '检验中' },
              { value: 'completed', label: '已完成' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange,
        }}
        scroll={{ x: 1300 }}
      />

      <Modal
        title={currentRecord ? '编辑报检' : '新增报检'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="companyId" label="单位ID" rules={[{ required: true, message: '请选择单位' }]}>
              <Select placeholder="请选择单位" options={companyOptions} />
            </Form.Item>
            <Form.Item name="equipmentId" label="设备ID" rules={[{ required: true, message: '请选择设备' }]}>
              <Select placeholder="请选择设备" options={equipmentOptions} />
            </Form.Item>
            <Form.Item name="inspectionType" label="检验类型" rules={[{ required: true, message: '请选择检验类型' }]}>
              <Select placeholder="请选择检验类型">
                <Select.Option value="periodic">定期检验</Select.Option>
                <Select.Option value="supervision">监督检验</Select.Option>
                <Select.Option value="commissioning">安装监检</Select.Option>
                <Select.Option value="reinspection">复检</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="inspectionNature" label="检验性质" rules={[{ required: true, message: '请选择检验性质' }]}>
              <Select placeholder="请选择检验性质">
                <Select.Option value="regular">常规</Select.Option>
                <Select.Option value="special">专项</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="applicant" label="申请人" rules={[{ required: true, message: '请输入申请人' }]}>
              <Input placeholder="请输入申请人" />
            </Form.Item>
            <Form.Item name="applicantPhone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item name="applyDate" label="申请日期" rules={[{ required: true, message: '请选择申请日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态">
                <Select.Option value="pending">待受理</Select.Option>
                <Select.Option value="approved">已受理</Select.Option>
                <Select.Option value="rejected">已驳回</Select.Option>
                <Select.Option value="scheduled">已排期</Select.Option>
                <Select.Option value="inspecting">检验中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="applyReason" label="申请理由" className="col-span-2">
              <Input.TextArea rows={3} placeholder="请输入申请理由" />
            </Form.Item>
            <Form.Item name="remark" label="备注" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入备注" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal title="报检详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">申请编号：</label>
                <span>{currentRecord.applyNo}</span>
              </div>
              <div>
                <label className="text-gray-500">单位ID：</label>
                <span>{currentRecord.companyId}</span>
              </div>
              <div>
                <label className="text-gray-500">设备ID：</label>
                <span>{currentRecord.equipmentId}</span>
              </div>
              <div>
                <label className="text-gray-500">检验类型：</label>
                <span>{typeMap[currentRecord.inspectionType]}</span>
              </div>
              <div>
                <label className="text-gray-500">检验性质：</label>
                <span>{natureMap[currentRecord.inspectionNature]}</span>
              </div>
              <div>
                <label className="text-gray-500">申请日期：</label>
                <span>{currentRecord.applyDate}</span>
              </div>
              <div>
                <label className="text-gray-500">申请人：</label>
                <span>{currentRecord.applicant}</span>
              </div>
              <div>
                <label className="text-gray-500">联系电话：</label>
                <span>{currentRecord.applicantPhone}</span>
              </div>
              <div>
                <label className="text-gray-500">状态：</label>
                <Tag color={statusMap[currentRecord.status].color}>{statusMap[currentRecord.status].text}</Tag>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">申请理由：</label>
                <span>{currentRecord.applyReason || '-'}</span>
              </div>
              {currentRecord.approverId && (
                <>
                  <div>
                    <label className="text-gray-500">审核人ID：</label>
                    <span>{currentRecord.approverId}</span>
                  </div>
                  <div>
                    <label className="text-gray-500">审核日期：</label>
                    <span>{currentRecord.approvalDate || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-500">审核意见：</label>
                    <span>{currentRecord.approvalOpinion || '-'}</span>
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className="text-gray-500">备注：</label>
                <span>{currentRecord.remark || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="审核报检"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleReviewSubmit}>
          <Form.Item name="status" label="审核结果" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="approvalOpinion" label="审核意见" rules={[{ required: true, message: '请输入审核意见' }]}>
            <Input.TextArea rows={4} placeholder="请输入审核意见" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setReviewVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ApplicationPage;
