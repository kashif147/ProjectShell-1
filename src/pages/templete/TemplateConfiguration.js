import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  message,
  notification
} from 'antd';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import {
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  SaveOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import MyInput from '../../component/common/MyInput';
import CustomSelect from '../../component/common/CustomSelect';
import { resetTemplateDetails } from '../../features/templete/templeteDetailsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getBookmarks } from '../../features/templete/BookmarkActions';
import htmlDocx from 'html-docx-js/dist/html-docx';

const { Text } = Typography;

// Create a local MyAlert function
const myAlert = (type, alertMessage, description) => {
  if (!["success", "error", "info", "warning"].includes(type)) {
    console.warn(`⚠️ Invalid notification type: ${type}`);
    return;
  }

  notification[type]({
    message: alertMessage,
    description,
    placement: "topRight",
  });
};

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Enhanced DOCX file creator with proper HTML preservation
const createDocxFile = async ({
  name,
  description,
  category,
  type,
  subject,
  content,
  variables = []
}) => {
  try {
    console.log('📝 Creating DOCX file with HTML content');
    console.log('📊 Content length:', content?.length);
    console.log('📋 Variables:', variables);

    // Create a clean HTML structure for DOCX
    const cleanHtmlContent = content || '<p></p>';

    // Create complete HTML document with proper DOCX-compatible styling
    const completeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Calibri', Arial, sans-serif;
            line-height: 1.5;
            color: #000000;
            margin: 0;
            padding: 0;
          }
          p {
            margin: 0 0 12pt 0;
          }
          .ql-editor p {
            margin-bottom: 12pt;
          }
          ul, ol {
            margin: 12pt 0;
            padding-left: 36pt;
          }
          .variables-section {
            margin-top: 24pt;
            padding-top: 12pt;
            border-top: 1pt solid #cccccc;
            page-break-inside: avoid;
          }
          .variable-item {
            margin: 6pt 0;
          }
          strong, b {
            font-weight: bold;
          }
          em, i {
            font-style: italic;
          }
          u {
            text-decoration: underline;
          }
          h1 { font-size: 24pt; margin: 24pt 0 12pt 0; }
          h2 { font-size: 18pt; margin: 18pt 0 9pt 0; }
          h3 { font-size: 14pt; margin: 14pt 0 7pt 0; }
        </style>
      </head>
      <body>
        <!-- Main Content -->
        <div class="ql-editor">
          ${cleanHtmlContent}
        </div>
      </body>
      </html>
    `;

    // Convert HTML to DOCX
    const docxBlob = htmlDocx.asBlob(completeHtml, {
      orientation: "portrait",
      margins: {
        top: 1440,    // 1 inch in twips
        right: 1440,
        bottom: 1440,
        left: 1440
      }
    });

    const fileName = `${name.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.docx`;

    const file = new File([docxBlob], fileName, {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    // Auto-download for debugging
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(docxBlob);
    downloadLink.download = `created_${fileName}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    console.log('✅ DOCX file created:', fileName);
    console.log('📊 File size:', Math.round(file.size / 1024), 'KB');

    return {
      file,
      fileName,
      fileSize: file.size,
      metadata: {
        name,
        description,
        category,
        type,
        subject,
        content: cleanHtmlContent, // Store original HTML content
        variables,
        createdAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("❌ Error creating DOCX file:", error);
    throw new Error(`Failed to create document: ${error.message}`);
  }
};

// Function to extract content from DOCX base64 for ReactQuill
const extractContentFromDocxBase64 = async (base64Content) => {
  try {
    console.log('📥 Extracting HTML content from DOCX base64...');

    if (!base64Content) {
      console.warn('⚠️ No base64 content provided');
      return { content: '<p></p>', plainText: '', variables: [] };
    }

    // Decode base64
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Debug: Download the DOCX file
    const debugFileName = `received_template_${Date.now()}.docx`;
    const debugLink = document.createElement('a');
    debugLink.href = URL.createObjectURL(blob);
    debugLink.download = debugFileName;
    document.body.appendChild(debugLink);
    debugLink.click();
    document.body.removeChild(debugLink);
    console.log('🔍 Downloaded received DOCX for inspection:', debugFileName);

    // For now, we'll use a simpler approach since we know it contains HTML
    // In a real implementation, you would use a DOCX parser library
    // For example: mammoth.js or similar

    // Since we know the DOCX contains HTML, we'll read it as text
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;

          // Try to extract text from the DOCX
          // This is a simplified approach - in production, use a proper DOCX parser
          const textDecoder = new TextDecoder('utf-8');
          let textContent = textDecoder.decode(arrayBuffer);

          console.log('📄 Raw DOCX content (first 2000 chars):', textContent.substring(0, 2000));

          // Look for HTML content in the DOCX
          let htmlContent = '';

          // Method 1: Try to find HTML tags in the content
          const htmlMatch = textContent.match(/<[^>]+>/g);
          if (htmlMatch && htmlMatch.length > 0) {
            console.log('✅ Found HTML tags in DOCX');

            // Extract content between <body> tags or use whole content
            const bodyMatch = textContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
              htmlContent = bodyMatch[1];
            } else {
              // Try to extract from div with class ql-editor
              const editorMatch = textContent.match(/<div[^>]*class\s*=\s*["']?ql-editor["']?[^>]*>([\s\S]*?)<\/div>/i);
              if (editorMatch) {
                htmlContent = editorMatch[1];
              } else {
                htmlContent = textContent;
              }
            }
          } else {
            // Method 2: If no HTML found, assume plain text and convert to HTML
            console.log('📝 No HTML tags found, converting plain text to HTML');

            // Clean the text
            textContent = textContent
              .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
              .replace(/\r\n/g, '\n')
              .replace(/\r/g, '\n')
              .trim();

            // Convert plain text to HTML for Quill
            const paragraphs = textContent.split(/\n\s*\n/);
            htmlContent = paragraphs.map(p => {
              if (!p.trim()) return '';
              const lines = p.split('\n').filter(line => line.trim());
              return `<p>${lines.join('<br>')}</p>`;
            }).filter(p => p).join('');
          }

          // Clean up HTML for Quill
          htmlContent = htmlContent
            .replace(/<\/?o:p>/g, '') // Remove Office namespace tags
            .replace(/<\/?span[^>]*>/g, '') // Remove span tags
            .replace(/style="[^"]*"/g, '') // Remove styles
            .replace(/class="[^"]*"/g, '') // Remove classes
            .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
            .replace(/\n/g, '') // Remove newlines in HTML
            .trim();

          // Ensure we have valid HTML
          if (!htmlContent || htmlContent === '<p></p>') {
            htmlContent = '<p></p>';
          } else if (!htmlContent.startsWith('<')) {
            htmlContent = `<p>${htmlContent}</p>`;
          }

          console.log('✅ Extracted HTML content (first 500 chars):', htmlContent.substring(0, 500));
          console.log('📏 HTML content length:', htmlContent.length);

          // Extract variables from the content
          const variableRegex = /\{(\w+)\}/g;
          const variables = [];
          let match;

          while ((match = variableRegex.exec(htmlContent)) !== null) {
            variables.push(match[1]);
          }

          console.log('🔍 Found variables:', variables);

          resolve({
            content: htmlContent,
            plainText: htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
            variables: variables
          });

        } catch (parseError) {
          console.error('❌ Error parsing DOCX content:', parseError);
          reject(new Error('Failed to parse DOCX content'));
        }
      };

      reader.onerror = (error) => {
        console.error('❌ Error reading DOCX file:', error);
        reject(new Error('Failed to read DOCX file'));
      };

      reader.readAsArrayBuffer(blob);
    });

  } catch (error) {
    console.error('❌ Error extracting content from base64:', error);
    return {
      content: '<p>Error loading template content</p>',
      plainText: '',
      variables: []
    };
  }
};

// Helper function to convert HTML to plain text for variable detection
const htmlToPlainText = (html) => {
  if (!html) return '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  return tempDiv.textContent || tempDiv.innerText || '';
};

// Function to format content for display in preview modal
const formatContentForDisplay = (htmlContent) => {
  if (!htmlContent) return '';
  return htmlContent;
};

// UPDATE TEMPLATE API FUNCTION
const updateTemplateAPI = async (templateId, { file, name, description, category, tempolateType, contentChanged = false }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  if (!templateId) {
    throw new Error('Template ID is required for update');
  }

  try {
    console.log('📤 Updating template:', templateId);
    console.log('📊 Update data:', {
      name,
      description,
      category,
      tempolateType,
      contentChanged,
      hasFile: !!file
    });

    const formData = new FormData();

    // Always add the JSON data
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('category', category.trim());
    formData.append('tempolateType', tempolateType.trim());

    // Only add file if content has changed
    if (contentChanged && file) {
      formData.append('file', file);
      console.log('📎 File included in update');
    } else {
      console.log('📝 No file update needed');
    }

    const response = await fetch(`${process.env.REACT_APP_CUMM || ''}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const responseText = await response.text();

    if (response?.status === 200) {
      console.log('✅ Template updated successfully');
      myAlert("success", "Template updated successfully");
      return responseText;
    }

    if (!response.ok) {
      let errorMessage = `Update failed (${response.status})`;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        if (responseText) {
          errorMessage = responseText;
        }
      }

      console.error('❌ Update failed:', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const result = JSON.parse(responseText);
      return result;
    } catch {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('❌ Update API error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

// UPLOAD TEMPLATE API FUNCTION
const uploadTemplateAPI = async ({ file, name, description, category, tempolateType }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit (${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB)`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name.trim());
  formData.append('description', description.trim());
  formData.append('category', category.trim());
  formData.append('tempolateType', tempolateType.trim());

  try {
    console.log('📤 Uploading DOCX file to API...');
    console.log('📊 File info:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const response = await fetch(`${process.env.REACT_APP_CUMM || ''}/templates/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const responseText = await response.text();

    if (response?.status === 201) {
      console.log('✅ Template uploaded successfully');
      myAlert("success", "Template uploaded successfully");
      return responseText;
    }

    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status})`;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        if (responseText) {
          errorMessage = responseText;
        }
      }

      console.error('❌ Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const result = JSON.parse(responseText);
      return result;
    } catch {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('❌ Upload API error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

const TemplateConfiguration = () => {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      emailContent: '',
      templateName: '',
      description: '',
      subject: '',
      category: '',
      tempolateType: '',
    },
    mode: 'onBlur'
  });

  const {
    bookmarks,
    bookmarksLoading,
    bookmarksError,
  } = useSelector((state) => state.bookmarks);

  const { templeteData, templetedetailsloading, error } = useSelector(
    (state) => state.templeteDetails
  );
  debugger
  const [selectedVariables, setSelectedVariables] = useState(new Set());
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedFile, setGeneratedFile] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [originalFormData, setOriginalFormData] = useState(null);
  const quillRef = useRef(null);
  const isProcessingRef = useRef(false);
  const previousContentRef = useRef('');
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Watch template type for conditional rendering
  const watchedTemplateType = watch('tempolateType');

  // Helper function to check if content has changed
  const hasContentChanged = (newContent) => {
    if (!originalContent) {
      return true; // No original content, treat as changed
    }

    // Simple comparison - you might want to make this more sophisticated
    const cleanedNew = newContent.replace(/\s+/g, ' ').trim();
    const cleanedOriginal = originalContent.replace(/\s+/g, ' ').trim();

    const changed = cleanedNew !== cleanedOriginal;
    console.log('🔍 Content changed check:', {
      originalLength: originalContent.length,
      newLength: newContent.length,
      cleanedOriginalLength: cleanedOriginal.length,
      cleanedNewLength: cleanedNew.length,
      changed
    });

    return changed;
  };

  // Check if form metadata has changed
  const hasMetadataChanged = (currentData) => {
    if (!originalFormData) return true;

    const changed =
      currentData.templateName !== originalFormData.templateName ||
      currentData.description !== originalFormData.description ||
      currentData.category !== originalFormData.category ||
      currentData.tempolateType !== originalFormData.tempolateType ||
      currentData.subject !== originalFormData.subject;

    console.log('🔍 Metadata changed check:', {
      nameChanged: currentData.templateName !== originalFormData.templateName,
      descChanged: currentData.description !== originalFormData.description,
      categoryChanged: currentData.category !== originalFormData.category,
      typeChanged: currentData.tempolateType !== originalFormData.tempolateType,
      subjectChanged: currentData.subject !== originalFormData.subject,
      overallChanged: changed
    });

    return changed;
  };
  const [templeteId, setTempleteId] = useState(null)
  // Populate form with template data from API response (base64 DOCX)
  const populateFormWithTemplateData = useCallback(async (data) => {
    console.log('🔄 Populating form with template data from API');

    // Extract template object from API response
    const template = data.template || {};

    // Create form data object
    const formData = {
      templateName: template.name || '',
      description: template.description || '',
      subject: template.subject || template.name || '',
      category: template.category || '',
      tempolateType: template.tempolateType || '',
      emailContent: '',
    };
    setTempleteId(template._id)
    // Reset form with the template data
    reset(formData);

    // Store original form data for change detection
    setOriginalFormData(formData);

    setIsLoadingContent(true);

    try {
      // Check for fileContent (base64 DOCX) in the response
      if (data.fileContent) {
        console.log('📦 Found base64 DOCX content, length:', data.fileContent.length);

        // Extract HTML content from the base64 DOCX
        const { content, variables } = await extractContentFromDocxBase64(data.fileContent);

        console.log('✅ Extracted HTML for ReactQuill:', content.substring(0, 200));
        console.log('🔍 Found variables in content:', variables);

        // Store original content for change detection
        setOriginalContent(content);

        // Set the HTML content in the form
        setValue('emailContent', content);

        // Map variables to bookmark IDs
        const variableIds = variables.map(variableName => {
          const bookmark = bookmarks?.find(b =>
            b.key === variableName ||
            b.label.toLowerCase().includes(variableName.toLowerCase())
          );
          return bookmark?._id;
        }).filter(Boolean);

        setSelectedVariables(new Set(variableIds));

        // Store template data for update
        setDebugInfo({
          templateId: template._id,
          templateName: template.name,
          hasFileContent: true,
          fileContentLength: data.fileContent.length,
          extractedHtmlLength: content.length,
          variablesFound: variables.length,
          bookmarksCount: bookmarks?.length || 0,
          originalContentLength: content.length
        });

      } else {
        console.warn('⚠️ No fileContent found in API response');
        setValue('emailContent', '<p></p>');
        setOriginalContent('<p></p>');

        setDebugInfo({
          templateId: template._id,
          templateName: template.name,
          hasFileContent: false,
          message: 'No DOCX content found in API response'
        });
      }

    } catch (error) {
      console.error('❌ Error loading template content:', error);
      const errorContent = '<p>Error loading template content. Please check console for details.</p>';
      setValue('emailContent', errorContent);
      setOriginalContent(errorContent);

      notification.error({
        message: 'Content Load Error',
        description: 'Failed to extract content from DOCX file',
        duration: 5,
      });

      setDebugInfo({
        templateId: template._id,
        templateName: template.name,
        error: error.message,
        hasFileContent: !!data.fileContent
      });

    } finally {
      setIsLoadingContent(false);
      setIsEditMode(true);
      console.log('✅ Form population complete');
    }

  }, [reset, setValue, bookmarks]);

  // Template Type options - Email or Letter
  const templateTypeOptions = [
    { key: 'email', label: 'Email' },
    { key: 'letter', label: 'Letter' },
  ];

  // Category options based on template type
  const categoryOptions = {
    email: [
      { key: 'welcome', label: 'Welcome Email' },
      { key: 'payment_reminder', label: 'Payment Reminder' },
      { key: 'notification', label: 'Notification' },
      { key: 'marketing', label: 'Marketing' },
      { key: 'support', label: 'Support' },
    ],
    letter: [
      { key: 'official', label: 'Official Letter' },
      { key: 'approval', label: 'Approval Letter' },
      { key: 'rejection', label: 'Rejection Letter' },
      { key: 'appointment', label: 'Appointment Letter' },
      { key: 'certificate', label: 'Certificate' },
    ],
  };

  // Available variables for drag and drop
  const availableVariables = useMemo(() => {
    if (!bookmarks) return [];
    return bookmarks.map(bookmark => ({
      id: bookmark._id,
      name: `{${bookmark.key}}`,
      label: bookmark.label,
      dataType: bookmark.dataType,
      key: bookmark.key
    }));
  }, [bookmarks]);

  useEffect(() => {
    dispatch(getBookmarks());
  }, [dispatch]);

  useEffect(() => {
    if (templeteData && !templetedetailsloading) {
      console.log('📥 Template data received from API, populating form');
      populateFormWithTemplateData(templeteData);
    }
  }, [templeteData, templetedetailsloading, populateFormWithTemplateData]);

  useEffect(() => {
    return () => {
      reset();
      dispatch(resetTemplateDetails());
    };
  }, [reset, dispatch]);

  // Validation rules
  const validationRules = {
    templateName: {
      required: 'Template name is required',
      maxLength: {
        value: 200,
        message: 'Template name must be less than 200 characters'
      }
    },
    tempolateType: {
      required: 'Template type is required'
    },
    category: {
      required: 'Category is required'
    },
    subject: {
      required: 'Subject/Title is required',
      maxLength: {
        value: 500,
        message: 'Subject/Title must be less than 500 characters'
      }
    },
    description: {
      maxLength: {
        value: 1000,
        message: 'Description must be less than 1000 characters'
      }
    },
    emailContent: {
      required: 'Template content is required',
      validate: (value) => {
        const strippedValue = value.replace(/<[^>]*>/g, '').trim();
        return strippedValue !== '' && strippedValue !== '<p><br></p>' || 'Template content is required';
      }
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    setSaving(true);
    const action = isEditMode ? 'Updating' : 'Creating';
    message.loading(`${action} template...`, 0);

    try {
      console.log('📤 Starting template submission process');
      console.log('📝 Template data:', {
        name: data.templateName,
        type: data.tempolateType,
        contentLength: data.emailContent?.length,
        isEditMode: isEditMode,
        templateId: templeteData?.template?._id
      });

      // Extract variable names from selected variables
      const variableNames = Array.from(selectedVariables).map(variableId => {
        const variable = availableVariables.find(v => v.id === variableId);
        return variable ? `{${variable.key}}` : null;
      }).filter(Boolean);

      console.log('📋 Variables to include in DOCX:', variableNames);

      // Check if content has changed (for update mode)
      let contentChanged = false;
      let metadataChanged = false;
      let docResult = null;

      if (isEditMode) {
        // In edit mode, check if content or metadata has changed
        contentChanged = hasContentChanged(data.emailContent);
        metadataChanged = hasMetadataChanged(data);
        console.log('🔍 Change detection:', {
          contentChanged,
          metadataChanged,
          hasChanges: contentChanged || metadataChanged
        });
      }

      // Create DOCX file if:
      // 1. Creating new template, OR
      // 2. Updating template AND content has changed
      if (!isEditMode || contentChanged) {
        console.log('📄 Creating/updating DOCX file...');
        docResult = await createDocxFile({
          name: data.templateName.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          type: data.tempolateType,
          subject: data.subject.trim(),
          content: data.emailContent,
          variables: variableNames
        });
        console.log('✅ DOCX created/updated:', docResult?.fileName);
      } else {
        console.log('📝 Content unchanged, skipping DOCX creation');
      }

      if (isEditMode) {
        // UPDATE EXISTING TEMPLATE
        const templateId = templeteId;
        if (!templateId) {
          throw new Error('Template ID not found for update');
        }

        console.log('🔄 Updating existing template:', templateId);

        await updateTemplateAPI(templateId, {
          file: docResult?.file,
          name: data.templateName.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          tempolateType: data.tempolateType,
          contentChanged: contentChanged || metadataChanged // Send update if either changed
        });

        // Update state with generated file info if new file was created
        if (docResult) {
          setGeneratedFile({
            id: `template_${Date.now()}`,
            name: docResult.fileName,
            size: docResult.fileSize,
            metadata: docResult.metadata,
            action: 'updated',
            fileIncluded: true
          });
        } else if (metadataChanged) {
          setGeneratedFile({
            id: `template_${templateId}`,
            name: 'Metadata updated',
            action: 'metadata_updated_only',
            fileIncluded: false
          });
        } else {
          setGeneratedFile({
            id: `template_${templateId}`,
            name: 'No changes detected',
            action: 'no_changes',
            fileIncluded: false
          });
        }

      } else {
        // CREATE NEW TEMPLATE
        if (!docResult) {
          throw new Error('Failed to create DOCX file for new template');
        }

        console.log('🆕 Creating new template');

        await uploadTemplateAPI({
          file: docResult.file,
          name: data.templateName.trim(),
          description: data.description.trim(),
          category: data.category.trim(),
          tempolateType: data.tempolateType
        });

        // Update state with generated file info
        setGeneratedFile({
          id: `template_${Date.now()}`,
          name: docResult.fileName,
          size: docResult.fileSize,
          metadata: docResult.metadata,
          action: 'created',
          fileIncluded: true
        });
      }

      // Success message
      message.destroy();
      message.success(isEditMode ? 'Template updated successfully!' : 'Template created successfully!');

      // Navigate to template summary after successful save
      setTimeout(() => {
        navigate('/templeteSummary');
      }, 1500);

    } catch (error) {
      console.error('❌ Template operation error:', error);
      message.destroy();
      message.error(error.message || (isEditMode ? 'Failed to update template' : 'Failed to create template'));

      notification.error({
        message: isEditMode ? 'Update Failed' : 'Creation Failed',
        description: error.message,
        duration: 5,
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle save button click
  const handleSaveOrUpdateTemplate = async () => {
    const isValid = await trigger();

    if (!isValid) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        message.error(firstError.message);
      }
      return;
    }

    handleSubmit(onSubmit)();
  };

  // Template type change handler
  const handleTemplateTypeChange = (value) => {
    setValue('tempolateType', value);
    setValue('category', '');
    setValue('subject', '');
    trigger('tempolateType');
  };

  // Find variables in text
  const findVariablesInText = (text) => {
    const foundVariables = new Set();
    const variableRegex = /\{(\w+)\}/g;
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      const variableName = match[1];
      if (variableName) {
        const variable = availableVariables.find(v => v.key === variableName);
        if (variable) {
          foundVariables.add(variable.id);
        }
      }
    }

    return foundVariables;
  };

  // Quill config
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ 'header': '1' }, { 'header': '2' }, 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  // Insert variable into editor
  const insertVariable = (variableName, variableId) => {
    if (quillRef.current && !isProcessingRef.current) {
      isProcessingRef.current = true;
      try {
        const editor = quillRef.current.getEditor();
        editor.focus();
        const range = editor.getSelection();

        // Format variable as {variable}
        const formattedVariable = `{${variableName}}`;

        if (range) {
          editor.insertText(range.index, formattedVariable);
          setSelectedVariables(prev => new Set([...prev, variableId]));
          editor.setSelection(range.index + formattedVariable.length, 0);
        } else {
          const length = editor.getLength();
          editor.insertText(length - 1, formattedVariable);
          setSelectedVariables(prev => new Set([...prev, variableId]));
          editor.setSelection(length + formattedVariable.length - 1, 0);
        }
        previousContentRef.current = editor.getText();

        // Update form value
        setValue('emailContent', editor.root.innerHTML);

        console.log('✅ Variable inserted:', variableName);
      } catch (error) {
        console.error('❌ Error inserting variable:', error);
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Remove variable
  const removeVariable = (variableId) => {
    setSelectedVariables(prev => {
      const newSet = new Set(prev);
      newSet.delete(variableId);
      return newSet;
    });
    console.log('🗑️ Variable removed:', variableId);
  };

  // Drag & drop handlers
  const handleDragStart = (e, variableName, variableId) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ variableName, variableId }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    try {
      const { variableName, variableId } = JSON.parse(data);
      insertVariable(variableName, variableId);
    } catch (error) {
      console.error('❌ Error parsing drag data:', error);
    }
  };

  const handleVariableClick = (variableName, variableId) => {
    insertVariable(variableName, variableId);
  };

  // Email content change handler
  const handleEmailContentChange = (htmlContent) => {
    setValue('emailContent', htmlContent);

    // Convert HTML to plain text for variable detection
    const plainText = htmlToPlainText(htmlContent);

    // Update variables from content
    const currentlyPresentVariables = findVariablesInText(plainText);
    setSelectedVariables(currentlyPresentVariables);
  };

  // Preview handlers
  const handlePreview = () => {
    setIsPreviewModalVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalVisible(false);
  };

  const getCategoryOptions = () => {
    return watchedTemplateType ? (categoryOptions[watchedTemplateType] || []) : [];
  };

  // Debug function to download original template
  const downloadOriginalTemplate = () => {
    if (templeteData?.fileContent) {
      try {
        const binaryString = atob(templeteData.fileContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `api_received_template_${Date.now()}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('📥 Downloaded API-received template');
      } catch (error) {
        console.error('❌ Error downloading template:', error);
      }
    }
  };

  return (
    <div className='px-4' style={{ minHeight: '100vh' }}>
      {/* Header with Save and Debug Buttons */}
      <div style={{ marginTop: '1px', marginBottom: '5px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        {isEditMode && (
          <>
            <Button
              onClick={() => {
                console.log('🔍 Debug Template Data from API:', templeteData);
                console.log('🔍 Current Form Values:', getValues());
                console.log('🔍 Selected Variables:', Array.from(selectedVariables));
                console.log('🔍 Original Content Length:', originalContent?.length);
                console.log('🔍 Original Form Data:', originalFormData);

                downloadOriginalTemplate();
              }}
              type="default"
              icon={<FileTextOutlined />}
            >
              Debug API Template
            </Button>

            <Button
              onClick={() => {
                const values = getValues();
                console.log('📝 Current HTML Content:', values.emailContent?.substring(0, 500));
                console.log('🔍 Change Detection:', {
                  contentChanged: hasContentChanged(values.emailContent),
                  metadataChanged: hasMetadataChanged(values)
                });

                // Download current HTML
                const blob = new Blob([values.emailContent || ''], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `current_editor_content_${Date.now()}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              type="default"
              icon={<DownloadOutlined />}
            >
              Download HTML
            </Button>
          </>
        )}

        <Button
          onClick={handleSaveOrUpdateTemplate}
          className='butn primary-btn'
          icon={<SaveOutlined />}
          loading={saving}
          disabled={saving}
          type="primary"
        >
          {saving ? (isEditMode ? 'Updating Template...' : 'Saving Template...') : (isEditMode ? 'Update Template' : 'Save Template')}
        </Button>
      </div>

      {/* Debug Info */}
      {/* {debugInfo && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: '6px'
        }}>
          <Text strong style={{ color: '#fa8c16' }}>
            🐞 API Template Debug Information
          </Text>
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <div><strong>Template ID:</strong> {debugInfo.templateId}</div>
            <div><strong>Template Name:</strong> {debugInfo.templateName}</div>
            <div><strong>Has DOCX Content:</strong> {debugInfo.hasFileContent ? 'Yes' : 'No'}</div>
            {debugInfo.fileContentLength && (
              <div><strong>Base64 Length:</strong> {debugInfo.fileContentLength} chars</div>
            )}
            {debugInfo.extractedHtmlLength && (
              <div><strong>Extracted HTML Length:</strong> {debugInfo.extractedHtmlLength} chars</div>
            )}
            {debugInfo.variablesFound !== undefined && (
              <div><strong>Variables Found:</strong> {debugInfo.variablesFound}</div>
            )}
            <div><strong>Edit Mode:</strong> {isEditMode ? 'Yes' : 'No'}</div>
            <div><strong>Content Loading:</strong> {isLoadingContent ? 'Loading...' : 'Complete'}</div>
          </div>
        </div>
      )} */}

      {/* Loading State */}
      {isLoadingContent && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <Text strong style={{ color: '#1890ff' }}>
            ⏳ Loading template content from DOCX...
          </Text>
          <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
            Extracting HTML from base64 DOCX file. This may take a moment.
          </Text>
        </div>
      )}

      {/* File Status */}
      {generatedFile && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: generatedFile.action === 'no_changes' ? '#f6f6f6' : '#f6ffed',
          border: generatedFile.action === 'no_changes' ? '1px solid #d9d9d9' : '1px solid #b7eb8f',
          borderRadius: '6px'
        }}>
          <Text strong style={{
            color: generatedFile.action === 'no_changes' ? '#8c8c8c' :
              generatedFile.action === 'metadata_updated_only' ? '#faad14' : '#389e0d'
          }}>
            {generatedFile.action === 'created' && '✅ Template created and uploaded: '}
            {generatedFile.action === 'updated' && '✅ Template updated: '}
            {generatedFile.action === 'metadata_updated_only' && '📝 Template metadata updated: '}
            {generatedFile.action === 'no_changes' && '📋 No changes detected: '}
            {generatedFile.name}
          </Text>
          {generatedFile.size && (
            <>
              <br />
              <Text type="secondary">
                Size: {Math.round(generatedFile.size / 1024)}KB • Type: DOCX with HTML content
              </Text>
            </>
          )}
          {generatedFile.fileIncluded !== undefined && (
            <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
              File included: {generatedFile.fileIncluded ? 'Yes' : 'No'}
            </Text>
          )}
        </div>
      )}

      {/* Three Column Layout */}
      <Row gutter={24} style={{ minHeight: '80vh' }}>
        {/* Left Column - Template Information (20%) */}
        <Col span={5}>
          <Card
            title="Template Information"
            headStyle={{
              backgroundColor: '#eef4ff',
              color: '#215e97'
            }}
            style={{
              height: '100%',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{ height: 'calc(100% - 57px)' }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Controller
                name="tempolateType"
                control={control}
                rules={validationRules.tempolateType}
                render={({ field }) => (
                  <CustomSelect
                    label="Template Type"
                    name="tempolateType"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      handleTemplateTypeChange(value);
                    }}
                    onBlur={field.onBlur}
                    options={templateTypeOptions}
                    placeholder="Select template type"
                    isIDs={true}
                    hasError={!!errors.tempolateType}
                    errorMessage={errors.tempolateType?.message}
                    required={true}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Controller
                name="category"
                control={control}
                rules={validationRules.category}
                render={({ field }) => (
                  <CustomSelect
                    label="Template Category"
                    name="category"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={getCategoryOptions()}
                    placeholder={watchedTemplateType ? "Select category" : "Select template type first"}
                    disabled={!watchedTemplateType}
                    isIDs={true}
                    hasError={!!errors.category}
                    errorMessage={errors.category?.message}
                    required={true}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Controller
                name="templateName"
                control={control}
                rules={validationRules.templateName}
                render={({ field }) => (
                  <MyInput
                    label="Template Name"
                    name="templateName"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Enter template name"
                    required={true}
                    hasError={!!errors.templateName}
                    errorMessage={errors.templateName?.message}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Controller
                name="description"
                control={control}
                rules={validationRules.description}
                render={({ field }) => (
                  <MyInput
                    label="Description"
                    name="description"
                    value={field.value}
                    onChange={field.onChange}
                    type='textarea'
                    onBlur={field.onBlur}
                    placeholder="Enter template description"
                    hasError={!!errors.description}
                    errorMessage={errors.description?.message}
                  />
                )}
              />
            </div>

            <div style={{ marginBottom: '0px' }}>
              <Controller
                name="subject"
                control={control}
                rules={validationRules.subject}
                render={({ field }) => (
                  <MyInput
                    label={watchedTemplateType === 'letter' ? 'Title' : 'Subject'}
                    name="subject"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={watchedTemplateType === 'letter' ? "Enter letter title" : "Enter email subject"}
                    required={true}
                    hasError={!!errors.subject}
                    errorMessage={errors.subject?.message}
                  />
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Middle Column - Email Content Builder (60%) */}
        <Col span={14}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Template Content Builder</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {isLoadingContent && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Loading content...
                    </Text>
                  )}
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    size="small"
                    disabled={isLoadingContent}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            }
            headStyle={{
              backgroundColor: '#eef4ff',
              color: '#215e97',
              borderBottom: '1px solid #f0f0f0'
            }}
            style={{
              height: '100%',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{
              height: 'calc(100% - 57px)',
              padding: '0',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Body Section */}
            <div style={{
              flex: 1,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '8px' }}>
                Body
              </Text>
              {errors.emailContent && (
                <Text type="danger" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  {errors.emailContent.message}
                </Text>
              )}

              {/* React Quill Editor with Drop Zone */}
              <Controller
                name="emailContent"
                control={control}
                rules={validationRules.emailContent}
                render={({ field }) => (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onBlur={field.onBlur}
                    style={{
                      flex: 1,
                      border: errors.emailContent ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '5px',
                      minHeight: 0,
                      overflow: 'hidden',
                      opacity: isLoadingContent ? 0.5 : 1
                    }}
                  >
                    {isLoadingContent ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#666'
                      }}>
                        <Text>Loading content from DOCX file...</Text>
                      </div>
                    ) : (
                      <ReactQuill
                        ref={quillRef}
                        value={field.value}
                        onChange={(content) => {
                          field.onChange(content);
                          handleEmailContentChange(content);
                        }}
                        modules={modules}
                        formats={formats}
                        theme="snow"
                        style={{
                          border: 'none',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      />
                    )}
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Right Column - Draggable Variables (20%) */}
        <Col span={5}>
          <Card
            title="Draggable Variables"
            headStyle={{
              backgroundColor: '#eef4ff',
              color: '#215e97'
            }}
            style={{
              height: '100%',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            bodyStyle={{
              height: 'calc(100% - 57px)',
              display: 'flex',
              flexDirection: 'column',
              padding: '0'
            }}
          >
            {/* Sticky Search Section */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <MyInput
                  label=""
                  type="search"
                  placeholder="Search variables..."
                />
              </div>

              <Text style={{
                display: 'block',
                fontSize: '12px',
                color: '#666',
              }}>
                Drag and drop these tags into the email body.
              </Text>
            </div>

            {/* Scrollable Content Area */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              paddingTop: '12px'
            }}>
              {/* Selected Variables Section */}
              {selectedVariables.size > 0 && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8'
                }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#215e97' }}>
                    Selected Variables ({selectedVariables.size})
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Array.from(selectedVariables).map(variableId => {
                      const variable = availableVariables.find(v => v.id === variableId);
                      return variable ? (
                        <div
                          key={variable.id}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#eef4ff',
                            border: '1px solid #215e97',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#215e97',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {variable.name}
                          <CloseOutlined
                            style={{
                              fontSize: '10px',
                              cursor: 'pointer',
                              color: '#ff4d4f'
                            }}
                            onClick={() => removeVariable(variable.id)}
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {bookmarksLoading && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Loading variables...
                </div>
              )}

              {/* Error State */}
              {bookmarksError && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#ff4d4f' }}>
                  Error loading variables
                </div>
              )}

              {/* Draggable Variables in Two Columns */}
              {bookmarks && !bookmarksLoading && !bookmarksError && (
                <div style={{ paddingRight: '4px' }}>
                  <Text strong style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '12px',
                    color: '#215e97',
                    position: 'sticky',
                    overflow: 'hidden',
                    top: '0',
                    backgroundColor: 'white',
                    paddingBottom: '8px',
                    zIndex: 1
                  }}>
                    Available Variables ({availableVariables.length})
                  </Text>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      maxHeight: 'calc(100vh - 300px)', // Adjust based on your layout
                      overflowY: 'auto',
                      paddingRight: '4px',
                      paddingBottom: '8px'
                    }}
                    className="custom-scrollbar" // Optional: for custom scrollbar styling
                  >
                    {availableVariables.map((variable) => (
                      <div
                        key={variable.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, variable.key, variable.id)}
                        onClick={() => handleVariableClick(variable.key, variable.id)}
                        style={{
                          padding: '8px 6px',
                          backgroundColor: selectedVariables.has(variable.id) ? '#eef4ff' : '#f8f9fa',
                          border: selectedVariables.has(variable.id) ? '2px solid #215e97' : '1px solid #d9d9d9',
                          borderRadius: '6px',
                          cursor: 'grab',
                          fontSize: '11px',
                          userSelect: 'none',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                          minHeight: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          wordBreak: 'break-word',
                          boxSizing: 'border-box'
                        }}
                        title={`Click or drag to insert ${variable.name}`}
                      >
                        <div>{variable.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        className="template-preview-modal"
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
              <Text strong style={{ fontSize: '16px', color: 'white' }}>
                Preview
              </Text>
            </div>
          </div>
        }
        open={isPreviewModalVisible}
        onCancel={handleClosePreview}
        footer={null}
        width={'45%'}
        style={{ top: 5 }}
        bodyStyle={{ padding: '0' }}
        styles={{
          header: {
            background: '#2f6bff',
            borderBottom: 'none',
            padding: '16px 24px',
            borderRadius: '8px 8px 0 0'
          }
        }}
      >
        <div style={{
          background: 'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <div style={{
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: 'white',
            padding: '25mm',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #e8e8e8',
            position: 'relative',
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: '1.5',
            fontSize: '12pt'
          }}>
            {/* Letter Header */}
            <div style={{
              borderBottom: '2px solid #2f6bff',
              paddingBottom: '20px',
              marginBottom: '25px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <Text strong style={{ fontSize: '16pt', color: '#2f6bff' }}>
                    {getValues('templateName') || 'Company Name'}
                  </Text>
                  <div style={{ fontSize: '10pt', color: '#666', marginTop: '4px' }}>
                    123 Business Street, City, State 12345
                    <br />
                    Phone: (555) 123-4567 | Email: info@company.com
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10pt', color: '#666' }}>
                    Date: {new Date().toLocaleDateString()}
                    <br />
                    Ref: {getValues('tempolateType') || 'TEMPLATE-001'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                <Text strong style={{ fontSize: '14pt', display: 'block', marginBottom: '5px' }}>
                  {getValues('tempolateType') === 'letter' ? 'TITLE' : 'SUBJECT'}: {getValues('subject')}
                </Text>
              </div>
            </div>
            <div style={{
              minHeight: '400px'
            }}>
              <div
                style={{
                  lineHeight: '1.6',
                  textAlign: 'justify'
                }}
                dangerouslySetInnerHTML={{
                  __html: getValues('emailContent') || '<p>No content available</p>'
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateConfiguration;