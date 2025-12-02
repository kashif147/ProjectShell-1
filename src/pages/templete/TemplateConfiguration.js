import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  message
} from 'antd';
import ReactQuill from 'react-quill';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import {
  CloseOutlined,
  EyeOutlined,
  FileTextOutlined,
  SaveOutlined
} from '@ant-design/icons';
import MyInput from '../../component/common/MyInput';
import CustomSelect from '../../component/common/CustomSelect';
import { useDispatch, useSelector } from 'react-redux';
import { getBookmarks } from '../../features/templete/BookmarkActions';
import MyAlert from '../../component/common/MyAlert'; // Assuming you have MyAlert component

const { Text } = Typography;

// Constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Enhanced API call with better error handling


// Helper function to convert HTML to plain text
const htmlToPlainText = (html) => {
  if (!html) return '';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Replace <br> with newlines
  const text = tempDiv.innerHTML
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<div>/gi, '')
    .replace(/<\/div>/gi, '\n');

  // Remove remaining HTML tags
  const textContent = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const txt = document.createElement('textarea');
  txt.innerHTML = textContent;
  return txt.value.trim();
};

// Function to create a simple .docx file
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
    // Convert HTML content to plain text
    const plainTextContent = htmlToPlainText(content);

    // Create a minimal DOCX structure with XML
    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    <!-- Template Name -->
    <w:p>
      <w:r>
        <w:t>${name}</w:t>
      </w:r>
    </w:p>
    
    <!-- Metadata -->
    <w:p>
      <w:r>
        <w:t>Type: ${type || 'Not specified'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Category: ${category || 'Not specified'}</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:r>
        <w:t>Description: ${description || 'No description'}</w:t>
      </w:r>
    </w:p>
    
    <!-- Subject/Title -->
    <w:p>
      <w:r>
        <w:t>${type === 'letter' ? 'TITLE' : 'SUBJECT'}: ${subject || 'No subject'}</w:t>
      </w:r>
    </w:p>
    
    <!-- Content -->
    <w:p>
      <w:r>
        <w:t>CONTENT:</w:t>
      </w:r>
    </w:p>
    
    ${plainTextContent.split('\n').map(line => `
    <w:p>
      <w:r>
        <w:t>${line}</w:t>
      </w:r>
    </w:p>
    `).join('')}
    
    <!-- Variables Section -->
    ${variables.length > 0 ? `
    <w:p>
      <w:r>
        <w:t>TEMPLATE VARIABLES:</w:t>
      </w:r>
    </w:p>
    
    ${variables.map(variable => `
    <w:p>
      <w:r>
        <w:t>${variable}</w:t>
      </w:r>
    </w:p>
    `).join('')}
    ` : ''}
    
    <!-- Footer -->
    <w:p>
      <w:r>
        <w:t>Created: ${new Date().toLocaleString()}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:wordDocument>`;

    // Create the complete DOCX file structure
    const zipContent = {
      '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
      '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
      'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
      'word/document.xml': docContent,
      'word/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:sz w:val="20"/>
    </w:rPr>
  </w:style>
</w:styles>`
    };

    // Convert to Blob (simplified approach)
    const zipBlob = new Blob([JSON.stringify(zipContent)], { type: 'application/zip' });

    // Create File object
    const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.docx`;
    const file = new File([zipBlob], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

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
        content: plainTextContent,
        variables,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error creating DOCX file:', error);
    throw new Error(`Failed to create document: ${error.message}`);
  }
};

const TemplateConfiguration = () => {
  // Set all initial values to empty
  const [emailContent, setEmailContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [tempolateType, setTemplateType] = useState('');
  const [selectedVariables, setSelectedVariables] = useState(new Set());
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedFile, setGeneratedFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const quillRef = useRef(null);
  const isProcessingRef = useRef(false);
  const previousContentRef = useRef('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a .docx file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', name.trim());
  formData.append('description', description.trim());
  formData.append('category', category.trim());
  formData.append('tempolateType', tempolateType.trim());

  try {
    console.log('Uploading template:', {
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)}KB`,
      fileType: file.type,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      tempolateType: tempolateType.trim()
    });

    const response = await fetch(`${process.env.REACT_APP_CUMM || ''}/templates/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('API Response Status:', response.status);
    console.log('API Response:', responseText);
    if (response?.status === 201) {
      MyAlert("success", "Template uploaded successfully",);
      navigate('/templeteSummary');
    }
    if (!response.ok) {
      let errorMessage = `Upload failed (${response.status})`;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);

        // Handle specific error cases
        switch (response.status) {
          case 400:
            errorMessage = `Bad request: ${errorMessage}`;
            break;
          case 401:
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            errorMessage = 'Session expired. Please log in again.';
            setTimeout(() => window.location.href = '/login', 2000);
            break;
          case 413:
            errorMessage = 'File size too large. Maximum size is 50MB.';
            break;
          case 415:
            errorMessage = 'Unsupported file type. Please upload a .docx file.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            break;
        }
      } catch {
        // If response is not JSON, use the text
        if (responseText) {
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    // Parse successful response
    try {
      const result = JSON.parse(responseText);
      console.log('Upload successful:', result);
      return result;
    } catch {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Upload API error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};
  const {
    bookmarks,
    bookmarksLoading,
    bookmarksError,
  } = useSelector((state) => state.bookmarks);

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
      dataType: bookmark.dataType
    }));
  }, [bookmarks]);

  useEffect(() => {
    dispatch(getBookmarks());
  }, [dispatch]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!templateName.trim()) {
      errors.templateName = 'Template name is required';
    } else if (templateName.length > 200) {
      errors.templateName = 'Template name must be less than 200 characters';
    }

    if (!tempolateType) {
      errors.tempolateType = 'Template type is required';
    }

    if (!category) {
      errors.category = 'Category is required';
    }

    if (!subject.trim()) {
      errors.subject = 'Subject/Title is required';
    } else if (subject.length > 500) {
      errors.subject = 'Subject/Title must be less than 500 characters';
    }

    if (!emailContent.trim() || emailContent === '<p><br></p>') {
      errors.emailContent = 'Template content is required';
    }

    if (description && description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Field validation (individual)
  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'templateName':
        if (!value.trim()) {
          errors.templateName = 'Template name is required';
        } else if (value.length > 200) {
          errors.templateName = 'Template name must be less than 200 characters';
        } else {
          delete errors.templateName;
        }
        break;

      case 'tempolateType':
        if (!value) {
          errors.tempolateType = 'Template type is required';
        } else {
          delete errors.tempolateType;
        }
        break;

      case 'category':
        if (!value) {
          errors.category = 'Category is required';
        } else {
          delete errors.category;
        }
        break;

      case 'subject':
        if (!value.trim()) {
          errors.subject = 'Subject/Title is required';
        } else if (value.length > 500) {
          errors.subject = 'Subject/Title must be less than 500 characters';
        } else {
          delete errors.subject;
        }
        break;

      case 'description':
        if (value && value.length > 1000) {
          errors.description = 'Description must be less than 1000 characters';
        } else {
          delete errors.description;
        }
        break;

      case 'emailContent':
        if (!value.trim() || value === '<p><br></p>') {
          errors.emailContent = 'Template content is required';
        } else {
          delete errors.emailContent;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

  // Handle field blur
  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // Find variables in text
  const findVariablesInText = (text) => {
    const foundVariables = new Set();
    availableVariables.forEach(variable => {
      if (text.includes(variable.name)) {
        foundVariables.add(variable.id);
      }
    });
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

        if (range) {
          editor.insertText(range.index, variableName, 'bold', true);
          editor.formatText(range.index + variableName.length, 1, 'bold', false);
          setSelectedVariables(prev => new Set([...prev, variableId]));
          editor.setSelection(range.index + variableName.length, 0);
        } else {
          const length = editor.getLength();
          editor.insertText(length - 1, variableName, 'bold', true);
          editor.formatText(length - 1 + variableName.length, 1, 'bold', false);
          setSelectedVariables(prev => new Set([...prev, variableId]));
          editor.setSelection(length + variableName.length - 1, 0);
        }
        previousContentRef.current = editor.getText();
      } catch (error) {
        console.error('Error inserting variable:', error);
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Remove variable
  const removeVariable = (variableId) => {
    if (quillRef.current && !isProcessingRef.current) {
      isProcessingRef.current = true;
      try {
        const editor = quillRef.current.getEditor();
        const variable = availableVariables.find(v => v.id === variableId);

        if (variable) {
          const contents = editor.getContents();
          let newContents = { ops: [] };
          let variableRemoved = false;

          contents.ops.forEach(op => {
            if (typeof op.insert === 'string' && op.insert.includes(variable.name)) {
              const newText = op.insert.replace(new RegExp(variable.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
              if (newText) {
                newContents.ops.push({ ...op, insert: newText });
              }
              variableRemoved = true;
            } else {
              newContents.ops.push(op);
            }
          });

          if (variableRemoved) {
            editor.setContents(newContents);
            setSelectedVariables(prev => {
              const newSet = new Set(prev);
              newSet.delete(variableId);
              return newSet;
            });
          }
        }
      } catch (error) {
        console.error('Error removing variable:', error);
      } finally {
        isProcessingRef.current = false;
      }
    } else {
      setSelectedVariables(prev => {
        const newSet = new Set(prev);
        newSet.delete(variableId);
        return newSet;
      });
    }
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
      console.error('Error parsing drag data:', error);
    }
  };

  const handleVariableClick = (variableName, variableId) => {
    insertVariable(variableName, variableId);
  };

  // Handle input changes with validation
  const handleTemplateNameChange = (e) => {
    const value = e.target.value;
    setTemplateName(value);
    if (touchedFields.templateName) {
      validateField('templateName', value);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    if (touchedFields.description) {
      validateField('description', value);
    }
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubject(value);
    if (touchedFields.subject) {
      validateField('subject', value);
    }
  };

  const handleTemplateTypeChange = (e) => {
    const value = e.target.value;
    setTemplateType(value);
    setCategory('');
    setSubject('');
    if (touchedFields.tempolateType) {
      validateField('tempolateType', value);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    if (touchedFields.category) {
      validateField('category', value);
    }
  };

  const handleEmailContentChange = (content) => {
    setEmailContent(content);
    if (touchedFields.emailContent) {
      validateField('emailContent', content);
    }

    // Update variables from content
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const currentContent = editor.getText();
      const currentlyPresentVariables = findVariablesInText(currentContent);
      setSelectedVariables(currentlyPresentVariables);
    }
  };

  // Main save function
  const handleSaveTemplate = async () => {
    // Mark all fields as touched for validation
    setTouchedFields({
      templateName: true,
      tempolateType: true,
      category: true,
      subject: true,
      description: true,
      emailContent: true
    });

    // Validate form
    if (!validateForm()) {
      // Show MyAlert with errors
      const errorMessages = Object.values(validationErrors);
      if (errorMessages.length > 0) {
        // Assuming MyAlert accepts a message prop
        // If MyAlert needs different structure, adjust accordingly
        message.error(errorMessages[0]); // Show first error
      }
      return;
    }

    setSaving(true);
    message.loading('Creating and uploading template...', 0);

    try {
      // Extract variable names
      const variableNames = Array.from(selectedVariables).map(variableId => {
        const variable = availableVariables.find(v => v.id === variableId);
        return variable ? variable.name : null;
      }).filter(Boolean);

      // Step 1: Create DOCX file
      const docResult = await createDocxFile({
        name: templateName.trim(),
        description: description.trim(),
        category: category.trim(),
        type: tempolateType,
        subject: subject.trim(),
        content: emailContent,
        variables: variableNames
      });

      // Step 2: Upload to API
      const result = await uploadTemplateAPI({
        file: docResult.file,
        name: templateName.trim(),
        description: description.trim(),
        category: category.trim(),
        tempolateType: tempolateType
      });

      // Update state with generated file info
      setGeneratedFile({
        id: `template_${Date.now()}`,
        name: docResult.fileName,
        size: docResult.fileSize,
        metadata: docResult.metadata
      });

      // Success message
      message.destroy();
      message.success('Template uploaded successfully!');

      console.log('Upload result:', result);

    } catch (error) {
      console.error('Save template error:', error);
      message.destroy();
      message.error(error.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  // Preview handlers
  const handlePreview = () => {
    setIsPreviewModalVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalVisible(false);
  };

  const getCategoryOptions = () => {
    return tempolateType ? (categoryOptions[tempolateType] || []) : [];
  };

  // Auto-sync variables with editor content
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();

      const textChangeHandler = () => {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          try {
            const currentContent = editor.getText();
            const currentlyPresentVariables = findVariablesInText(currentContent);
            setSelectedVariables(currentlyPresentVariables);
            previousContentRef.current = currentContent;
          } catch (error) {
            console.error('Error syncing variables:', error);
          } finally {
            isProcessingRef.current = false;
          }
        }
      };

      editor.on('text-change', textChangeHandler);

      return () => {
        editor.off('text-change', textChangeHandler);
      };
    }
  }, []);

  return (
    <div className='px-4' style={{ minHeight: '100vh' }}>
      {/* Save Button - Top Right */}
      <div style={{ marginTop: '1px', marginBottom: '5px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleSaveTemplate}
          className='butn primary-btn'
          icon={<SaveOutlined />}
          loading={saving}
          disabled={saving}
          type="primary"
        >
          {saving ? 'Saving Template...' : 'Save Template'}
        </Button>
      </div>

      {/* File Status - Using MyAlert if available, otherwise keep current style */}
      {generatedFile && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px'
        }}>
          <Text strong style={{ color: '#389e0d' }}>
            ✓ Template file generated and uploaded: {generatedFile.name}
          </Text>
          <br />
          <Text type="secondary">
            Size: {Math.round(generatedFile.size / 1024)}KB • Type: DOCX
          </Text>
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
              <CustomSelect
                label="Template Type"
                name="tempolateType"
                value={tempolateType}
                onChange={handleTemplateTypeChange}
                onBlur={() => handleFieldBlur('tempolateType')}
                options={templateTypeOptions}
                placeholder="Select template type"
                isIDs={true}
                hasError={!!validationErrors.tempolateType && touchedFields.tempolateType}
                errorMessage={validationErrors.tempolateType}
                required={true}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <CustomSelect
                label="Template Category"
                name="category"
                value={category}
                onChange={handleCategoryChange}
                onBlur={() => handleFieldBlur('category')}
                options={getCategoryOptions()}
                placeholder={tempolateType ? "Select category" : "Select template type first"}
                disabled={!tempolateType}
                isIDs={true}
                hasError={!!validationErrors.category && touchedFields.category}
                errorMessage={validationErrors.category}
                required={true}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <MyInput
                label="Template Name"
                name="templateName"
                value={templateName}
                onChange={handleTemplateNameChange}
                onBlur={() => handleFieldBlur('templateName')}
                placeholder="Enter template name"
                required={true}
                hasError={!!validationErrors.templateName && touchedFields.templateName}
                errorMessage={validationErrors.templateName}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <MyInput
                label="Description"
                name="description"
                value={description}
                onChange={handleDescriptionChange}
                onBlur={() => handleFieldBlur('description')}
                placeholder="Enter template description"
                hasError={!!validationErrors.description && touchedFields.description}
                errorMessage={validationErrors.description}
              />
            </div>

            <div style={{ marginBottom: '0px' }}>
              <MyInput
                label={tempolateType === 'letter' ? 'Title' : 'Subject'}
                name="subject"
                value={subject}
                onChange={handleSubjectChange}
                onBlur={() => handleFieldBlur('subject')}
                placeholder={tempolateType === 'letter' ? "Enter letter title" : "Enter email subject"}
                required={true}
                hasError={!!validationErrors.subject && touchedFields.subject}
                errorMessage={validationErrors.subject}
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
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  size="small"
                >
                  Preview
                </Button>
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
            {/* Subject/Title Section based on Template Type */}
            <div style={{
              padding: '16px 16px 12px 16px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <MyInput
                label={tempolateType === 'letter' ? 'Title' : 'Subject'}
                name="modalSubject"
                value={subject}
                onChange={handleSubjectChange}
                placeholder={tempolateType === 'letter' ? "Enter letter title" : "Enter email subject"}
                required={true}
                hasError={!!validationErrors.subject && touchedFields.subject}
                errorMessage={validationErrors.subject}
              />
            </div>

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
              {validationErrors.emailContent && touchedFields.emailContent && (
                <Text type="danger" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                  {validationErrors.emailContent}
                </Text>
              )}

              {/* React Quill Editor with Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onBlur={() => handleFieldBlur('emailContent')}
                style={{
                  flex: 1,
                  border: validationErrors.emailContent && touchedFields.emailContent ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: '5px',
                  minHeight: 0,
                  overflow: 'hidden'
                }}
              >
                <ReactQuill
                  ref={quillRef}
                  value={emailContent}
                  onChange={(content, delta, source, editor) => {
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
              </div>
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
                    Selected Variables
                  </Text>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Array.from(selectedVariables).map(variableId => {
                      const variable = bookmarks?.find(v => v._id === variableId);
                      return variable ? (
                        <div
                          key={variable._id}
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
                          {`{${variable.key}}`}
                          <CloseOutlined
                            style={{
                              fontSize: '10px',
                              cursor: 'pointer',
                              color: '#ff4d4f'
                            }}
                            onClick={() => removeVariable(variable._id)}
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
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px'
                    }}
                  >
                    {bookmarks.map((variable) => (
                      <div
                        key={variable._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, `{${variable.key}}`, variable._id)}
                        onClick={() => handleVariableClick(`{${variable.key}}`, variable._id)}
                        style={{
                          padding: '8px 6px',
                          backgroundColor: selectedVariables.has(variable._id) ? '#eef4ff' : '#f8f9fa',
                          border: selectedVariables.has(variable._id) ? '2px solid #215e97' : '1px solid #d9d9d9',
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
                          wordBreak: 'break-word'
                        }}
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
                    {templateName || 'Company Name'}
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
                    Ref: {tempolateType || 'TEMPLATE-001'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                <Text strong style={{ fontSize: '14pt', display: 'block', marginBottom: '5px' }}>
                  {tempolateType === 'letter' ? 'TITLE' : 'SUBJECT'}: {subject}
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
                  __html: emailContent.replace(/\n/g, '<br>')
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