import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import costumeService from '../../services/costumeService';
import type { Costume } from '../../types/costume';

const { Option } = Select;

interface CreateCostumeFormProps {
    onSuccess?: () => void;
}

const CreateCostumeForm: React.FC<CreateCostumeFormProps> = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const handleUpload = async () => {
        const files = fileList.map(file => file.originFileObj).filter(Boolean) as File[];
        if (files.length === 0) {
            message.error('Please select at least one image');
            return;
        }

        setUploading(true);
        try {
            const uploadedImages = await costumeService.uploadMultipleImages(files, {
                entityType: 'costume',
                compress: true
            });

            const urls = uploadedImages.map(img => img.url);
            setImageUrls(urls);
            message.success('Images uploaded successfully');

            // Automatically set the first image as main image
            form.setFieldsValue({
                imageUrl: urls[0],
                listImageUrl: urls
            });
        } catch (error) {
            console.error('Error uploading images:', error);
            message.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const uploadProps: UploadProps = {
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            // Validate file type
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
            // Validate file size (5MB)
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return false;
            }

            setFileList(prev => [...prev, file as UploadFile]);
            return false; // Prevent auto upload
        },
        fileList,
    };

    const onFinish = async (values: any) => {
        if (!values.imageUrl) {
            message.error('Please upload at least one image');
            return;
        }

        try {
            const costumeData: Omit<Costume, '_id' | 'createdAt' | 'updatedAt' | 'quantityRented'> = {
                ...values,
                quantityAvailable: values.quantityAvailable || 1,
            };

            await costumeService.createCostume(costumeData);
            message.success('Costume created successfully');
            form.resetFields();
            setFileList([]);
            setImageUrls([]);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating costume:', error);
            message.error('Failed to create costume');
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                status: 'available',
                quantityAvailable: 1
            }}
        >
            {/* Image Upload Section */}
            <Form.Item label="Images" required>
                <Upload {...uploadProps} listType="picture">
                    <Button icon={<UploadOutlined />}>Select Images</Button>
                </Upload>
                <Button
                    type="primary"
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    style={{ marginTop: 16 }}
                >
                    {uploading ? 'Uploading' : 'Upload Images'}
                </Button>
            </Form.Item>

            {/* Hidden fields for image URLs */}
            <Form.Item name="imageUrl" hidden>
                <Input />
            </Form.Item>
            <Form.Item name="listImageUrl" hidden>
                <Input />
            </Form.Item>

            {/* Preview uploaded images */}
            {imageUrls.length > 0 && (
                <Form.Item label="Uploaded Images">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {imageUrls.map((url, index) => (
                            <img
                                key={url}
                                src={url}
                                alt={`Preview ${index + 1}`}
                                style={{ width: 100, height: 100, objectFit: 'cover' }}
                            />
                        ))}
                    </div>
                </Form.Item>
            )}

            {/* Basic Information */}
            <Form.Item
                name="name"
                label="Costume Name"
                rules={[{ required: true, message: 'Please input costume name!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="code"
                label="Code"
                rules={[{ required: true, message: 'Please input costume code!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please input price!' }]}
            >
                <InputNumber<string>
                    min="0"
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
            </Form.Item>

            <Form.Item
                name="size"
                label="Size"
                rules={[{ required: true, message: 'Please select size!' }]}
            >
                <Select>
                    <Option value="XS">XS</Option>
                    <Option value="S">S</Option>
                    <Option value="M">M</Option>
                    <Option value="L">L</Option>
                    <Option value="XL">XL</Option>
                    <Option value="XXL">XXL</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status!' }]}
            >
                <Select>
                    <Option value="available">Available</Option>
                    <Option value="maintenance">Maintenance</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="quantityAvailable"
                label="Quantity Available"
                rules={[{ required: true, message: 'Please input quantity!' }]}
            >
                <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please input description!' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Create Costume
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CreateCostumeForm; 