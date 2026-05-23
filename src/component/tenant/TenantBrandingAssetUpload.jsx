import React, { useState } from "react";
import { Upload, Button, Image, Typography, message } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { notifyBrandingRefresh } from "../../context/TenantBrandingContext";
import {
  clearTenantBrandingCache,
  resolveTenantId,
} from "../../services/tenantBrandingService";

const { Text } = Typography;

const TenantBrandingAssetUpload = ({
  label,
  assetType,
  value,
  tenantId,
  onChange,
  previewHeight = 48,
}) => {
  const [uploading, setUploading] = useState(false);

  const customRequest = async ({ file, onSuccess, onError }) => {
    if (!tenantId) {
      message.warning("Save the tenant first before uploading branding assets.");
      onError(new Error("Tenant not saved"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", assetType);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/tenants/${tenantId}/branding/assets`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const url = response.data?.data?.url;
      if (url) {
        onChange(url);
        clearTenantBrandingCache(tenantId);
        const sessionTenantId = resolveTenantId();
        if (sessionTenantId) clearTenantBrandingCache(sessionTenantId);
        if (
          sessionTenantId === tenantId ||
          sessionTenantId === String(tenantId)
        ) {
          notifyBrandingRefresh();
        }
        onSuccess(response.data, file);
        message.success(`${label} uploaded`);
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Upload failed";
      message.error(msg);
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tenant-branding-upload">
      <label className="my-input-label">{label}</label>
      {value ? (
        <div className="tenant-branding-preview">
          <Image
            src={value}
            alt={label}
            height={previewHeight}
            preview
            style={{ maxWidth: "100%", objectFit: "contain" }}
          />
        </div>
      ) : null}
      <Upload
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
        showUploadList={false}
        customRequest={customRequest}
        disabled={!tenantId || uploading}
      >
        <Button
          icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
          loading={uploading}
          className="butn secoundry-btn"
          size="small"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
      </Upload>
      {value ? (
        <Text type="secondary" className="tenant-branding-url" ellipsis>
          {value}
        </Text>
      ) : (
        <Text type="secondary" className="tenant-branding-url">
          {tenantId ? "No image yet — upload or use placeholder on save" : "Save tenant to enable upload"}
        </Text>
      )}
    </div>
  );
};

export default TenantBrandingAssetUpload;
