import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Tag, Modal, Form, message, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined, PrinterOutlined } from '@ant-design/icons';
import type { Certificate, CertificateStatus, CertificateType, Report, Equipment, Company } from '@/types';
import { certificateApi, reportApi, equipmentApi, companyApi } from '@/utils/api';
import dayjs from 'dayjs';

const typeMap: Record<CertificateType, string> = {
  inspection: '检验证书',
  use_registration: '使用登记证',
  qualification: '资格证书',
};

const statusMap: Record<CertificateStatus, { color: string; text: string }> = {
  valid: { color: 'green', text: '有效' },
  expired: { color: 'default', text: '已过期' },
  revoked: { color: 'red', text: '已吊销' },
  suspended: { color: 'orange', text: '已暂停' },
};

const conclusionMap: Record<string, { color: string; text: string }> = {
  qualified: { color: 'green', text: '合格' },
  conditional_qualified: { color: 'orange', text: '有条件合格' },
  unqualified: { color: 'red', text: '不合格' },
};

const CertificatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [issueVisible, setIssueVisible] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Certificate | null>(null);
  const [reportList, setReportList] = useState<Report[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [form] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const getEquipmentName = (id: number) => {
    const eq = equipmentList.find(e => e.id === id);
    return eq ? eq.equipmentName : '-';
  };

  const getCompanyName = (id: number) => {
    const co = companyList.find(c => c.id === id);
    return co ? co.name : '-';
  };

  const getReportNo = (id: number) => {
    const rpt = reportList.find(r => r.id === id);
    return rpt ? rpt.reportNo : '-';
  };

  const columns: ColumnsType<Certificate> = [
    {
      title: '证书编号',
      dataIndex: 'certificateNo',
      key: 'certificateNo',
      width: 180,
    },
    {
      title: '报告编号',
      dataIndex: 'reportId',
      key: 'reportId',
      width: 150,
      render: (id: number) => getReportNo(id),
    },
    {
      title: '设备名称',
      dataIndex: 'equipmentId',
      key: 'equipmentId',
      width: 150,
      render: (id: number) => getEquipmentName(id),
    },
    {
      title: '证书类型',
      dataIndex: 'certificateType',
      key: 'certificateType',
      width: 120,
      render: (type: CertificateType) => typeMap[type],
    },
    {
      title: '检验结论',
      dataIndex: 'inspectionConclusion',
      key: 'inspectionConclusion',
      width: 120,
      render: (conclusion: string) => {
        const info = conclusionMap[conclusion];
        return <Tag color={info?.color}>{info?.text}</Tag>;
      },
    },
    {
      title: '签发单位',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
      width: 150,
    },
    {
      title: '签发日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
    },
    {
      title: '有效期起',
      dataIndex: 'validFrom',
      key: 'validFrom',
      width: 120,
    },
    {
      title: '有效期止',
      dataIndex: 'validTo',
      key: 'validTo',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CertificateStatus) => {
        const info = statusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'valid' && (
            <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>
              打印
            </Button>
          )}
          {record.status !== 'valid' && record.status !== 'expired' && record.status !== 'revoked' && (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleIssue(record)}>
                签发
              </Button>
              <Button type="link" size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(record)}>
                吊销
              </Button>
            </>
          )}
          {record.status !== 'valid' && record.status !== 'expired' && record.status !== 'revoked' && (
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

  const loadOptions = async () => {
    try {
      const [rptRes, eqRes, coRes] = await Promise.all([
        reportApi.getList({ page: 1, pageSize: 100 }),
        equipmentApi.getList({ page: 1, pageSize: 100 }),
        companyApi.getList({ page: 1, pageSize: 100 }),
      ]);
      setReportList(rptRes.list);
      setEquipmentList(eqRes.list);
      setCompanyList(coRes.list);
    } catch (error) {
      console.error('加载选项失败:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await certificateApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        certificateNo: searchText || undefined,
        status: statusFilter as CertificateStatus || undefined,
        certificateType: typeFilter as CertificateType || undefined,
      });
      setData(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('获取证书列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'valid',
      certificateType: 'inspection',
      issueDate: dayjs(),
      validFrom: dayjs(),
      validTo: dayjs().add(1, 'year'),
    });
    setModalVisible(true);
  };

  const handleEdit = (record: Certificate) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
      validFrom: record.validFrom ? dayjs(record.validFrom) : undefined,
      validTo: record.validTo ? dayjs(record.validTo) : undefined,
      revokeDate: record.revokeDate ? dayjs(record.revokeDate) : undefined,
      lastPrintDate: record.lastPrintDate ? dayjs(record.lastPrintDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleView = (record: Certificate) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleIssue = (record: Certificate) => {
    setCurrentRecord(record);
    issueForm.resetFields();
    issueForm.setFieldsValue({
      issueDate: dayjs(),
      validFrom: dayjs(),
      validTo: dayjs().add(1, 'year'),
    });
    setIssueVisible(true);
  };

  const handleReject = (record: Certificate) => {
    setCurrentRecord(record);
    rejectForm.resetFields();
    setRejectVisible(true);
  };

  const handlePrint = async (record: Certificate) => {
    try {
      await certificateApi.print(record.id);
      message.success('已发送打印任务');
      handleSearch();
    } catch (error) {
      console.error('打印失败:', error);
    }
  };

  const handleDelete = (record: Certificate) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除证书「${record.certificateNo}」吗？`,
      onOk: async () => {
        try {
          await certificateApi.delete(record.id);
          message.success('删除成功');
          handleSearch();
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  const handleSubmit = async (values: Partial<Certificate>) => {
    try {
      const submitData = {
        ...values,
        issueDate: values.issueDate ? (values.issueDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        validFrom: values.validFrom ? (values.validFrom as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        validTo: values.validTo ? (values.validTo as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        revokeDate: values.revokeDate ? (values.revokeDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        lastPrintDate: values.lastPrintDate ? (values.lastPrintDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
      };
      if (currentRecord) {
        await certificateApi.update(currentRecord.id!, submitData);
        message.success('更新成功');
      } else {
        await certificateApi.create(submitData as Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>);
        message.success('创建成功');
      }
      setModalVisible(false);
      handleSearch();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleIssueSubmit = async (values: { issueDate: dayjs.Dayjs; validFrom: dayjs.Dayjs; validTo: dayjs.Dayjs }) => {
    if (!currentRecord) return;
    try {
      await certificateApi.update(currentRecord.id!, {
        issueDate: values.issueDate.format('YYYY-MM-DD'),
        validFrom: values.validFrom.format('YYYY-MM-DD'),
        validTo: values.validTo.format('YYYY-MM-DD'),
      });
      await certificateApi.issue(currentRecord.id!);
      message.success('证书已签发');
      setIssueVisible(false);
      handleSearch();
    } catch (error) {
      console.error('签发失败:', error);
    }
  };

  const handleRejectSubmit = async (values: { remarks: string }) => {
    if (!currentRecord) return;
    try {
      await certificateApi.revoke(currentRecord.id!, values.remarks);
      message.success('已吊销');
      setRejectVisible(false);
      handleSearch();
    } catch (error) {
      console.error('吊销失败:', error);
    }
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">证书签发</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增证书
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <Space wrap>
          <Input
            placeholder="搜索证书编号"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择证书类型"
            value={typeFilter || undefined}
            onChange={setTypeFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'inspection', label: '检验证书' },
              { value: 'use_registration', label: '使用登记证' },
              { value: 'qualification', label: '资格证书' },
            ]}
          />
          <Select
            placeholder="选择状态"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: 'valid', label: '有效' },
              { value: 'expired', label: '已过期' },
              { value: 'revoked', label: '已吊销' },
              { value: 'suspended', label: '已暂停' },
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
        scroll={{ x: 1600 }}
      />

      <Modal
        title={currentRecord ? '编辑证书' : '新增证书'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="reportId" label="关联报告">
              <Select placeholder="请选择报告">
                {reportList.map(r => (
                  <Select.Option key={r.id} value={r.id}>{r.reportNo}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="companyId" label="使用单位">
              <Select placeholder="请选择单位">
                {companyList.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="equipmentId" label="设备">
              <Select placeholder="请选择设备">
                {equipmentList.map(e => (
                  <Select.Option key={e.id} value={e.id}>{e.equipmentName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="certificateNo" label="证书编号" rules={[{ required: true, message: '请输入证书编号' }]}>
              <Input placeholder="请输入证书编号" />
            </Form.Item>
            <Form.Item name="certificateType" label="证书类型" rules={[{ required: true, message: '请选择证书类型' }]}>
              <Select placeholder="请选择证书类型">
                <Select.Option value="inspection">检验证书</Select.Option>
                <Select.Option value="use_registration">使用登记证</Select.Option>
                <Select.Option value="qualification">资格证书</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="issuingAuthority" label="签发单位" rules={[{ required: true, message: '请输入签发单位' }]}>
              <Input placeholder="请输入签发单位" />
            </Form.Item>
            <Form.Item name="issuer" label="签发人" rules={[{ required: true, message: '请输入签发人' }]}>
              <Input placeholder="请输入签发人" />
            </Form.Item>
            <Form.Item name="issueDate" label="签发日期" rules={[{ required: true, message: '请选择签发日期' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="validFrom" label="有效期起" rules={[{ required: true, message: '请选择有效期起' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="validTo" label="有效期止" rules={[{ required: true, message: '请选择有效期止' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select placeholder="请选择状态">
                <Select.Option value="valid">有效</Select.Option>
                <Select.Option value="expired">已过期</Select.Option>
                <Select.Option value="revoked">已吊销</Select.Option>
                <Select.Option value="suspended">已暂停</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="printCount" label="打印次数">
              <Input type="number" placeholder="请输入打印次数" />
            </Form.Item>
            <Form.Item name="inspectionConclusion" label="检验结论" className="col-span-2">
              <Select placeholder="请选择检验结论">
                <Select.Option value="qualified">合格</Select.Option>
                <Select.Option value="conditional_qualified">有条件合格</Select.Option>
                <Select.Option value="unqualified">不合格</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="equipmentInfo" label="设备信息" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入设备信息" />
            </Form.Item>
            <Form.Item name="revokeReason" label="吊销原因" className="col-span-2">
              <Input.TextArea rows={2} placeholder="请输入吊销原因" />
            </Form.Item>
            <Form.Item name="revokeDate" label="吊销日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="lastPrintDate" label="最后打印日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="remarks" label="备注" className="col-span-2">
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

      <Modal title="证书详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={800}>
        {currentRecord && (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">证书编号：</label>
                <span>{currentRecord.certificateNo}</span>
              </div>
              <div>
                <label className="text-gray-500">报告编号：</label>
                <span>{getReportNo(currentRecord.reportId)}</span>
              </div>
              <div>
                <label className="text-gray-500">设备名称：</label>
                <span>{getEquipmentName(currentRecord.equipmentId)}</span>
              </div>
              <div>
                <label className="text-gray-500">使用单位：</label>
                <span>{getCompanyName(currentRecord.companyId)}</span>
              </div>
              <div>
                <label className="text-gray-500">证书类型：</label>
                <span>{typeMap[currentRecord.certificateType]}</span>
              </div>
              <div>
                <label className="text-gray-500">检验结论：</label>
                <Tag color={conclusionMap[currentRecord.inspectionConclusion]?.color}>
                  {conclusionMap[currentRecord.inspectionConclusion]?.text}
                </Tag>
              </div>
              <div>
                <label className="text-gray-500">签发单位：</label>
                <span>{currentRecord.issuingAuthority}</span>
              </div>
              <div>
                <label className="text-gray-500">签发人：</label>
                <span>{currentRecord.issuer}</span>
              </div>
              <div>
                <label className="text-gray-500">签发日期：</label>
                <span>{currentRecord.issueDate || '-'}</span>
              </div>
              <div>
                <label className="text-gray-500">有效期起：</label>
                <span>{currentRecord.validFrom}</span>
              </div>
              <div>
                <label className="text-gray-500">有效期止：</label>
                <span>{currentRecord.validTo}</span>
              </div>
              <div>
                <label className="text-gray-500">状态：</label>
                <Tag color={statusMap[currentRecord.status].color}>{statusMap[currentRecord.status].text}</Tag>
              </div>
              <div>
                <label className="text-gray-500">打印次数：</label>
                <span>{currentRecord.printCount || 0}</span>
              </div>
              <div>
                <label className="text-gray-500">最后打印日期：</label>
                <span>{currentRecord.lastPrintDate || '-'}</span>
              </div>
              <div className="col-span-2">
                <label className="text-gray-500">设备信息：</label>
                <p>{currentRecord.equipmentInfo || '-'}</p>
              </div>
              {currentRecord.revokeReason && (
                <>
                  <div>
                    <label className="text-gray-500">吊销原因：</label>
                    <span>{currentRecord.revokeReason}</span>
                  </div>
                  <div>
                    <label className="text-gray-500">吊销日期：</label>
                    <span>{currentRecord.revokeDate || '-'}</span>
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className="text-gray-500">备注：</label>
                <span>{currentRecord.remarks || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="签发证书"
        open={issueVisible}
        onCancel={() => setIssueVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={issueForm} layout="vertical" onFinish={handleIssueSubmit}>
          <Form.Item name="issueDate" label="签发日期" rules={[{ required: true, message: '请选择签发日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="validFrom" label="有效期起" rules={[{ required: true, message: '请选择有效期起' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="validTo" label="有效期止" rules={[{ required: true, message: '请选择有效期止' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIssueVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              确认签发
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="吊销证书"
        open={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleRejectSubmit}>
          <Form.Item name="remarks" label="吊销原因" rules={[{ required: true, message: '请输入吊销原因' }]}>
            <Input.TextArea rows={4} placeholder="请输入吊销原因" />
          </Form.Item>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setRejectVisible(false)}>取消</Button>
            <Button type="primary" danger htmlType="submit">
              确认吊销
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificatePage;
