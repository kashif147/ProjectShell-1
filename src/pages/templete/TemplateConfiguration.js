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
  SaveOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import MyInput from '../../component/common/MyInput';
import CustomSelect from '../../component/common/CustomSelect';
import { useDispatch, useSelector } from 'react-redux';
import { getBookmarks } from '../../features/templete/BookmarkActions';

const { Text } = Typography;

const TemplateConfiguration = () => {
  const [emailContent, setEmailContent] = useState(`Hi {member_name},\n\nWelcome to our platform! We're thrilled to have you on board.\n\nYour registration number is {reg_no}. You can get started by exploring your new dashboard.\n\nBest regards,\nThe Team`);
  const [templateName, setTemplateName] = useState('Welcome Email');
  const [description, setDescription] = useState('Sent to new users upon successful registration.');
  const [subject, setSubject] = useState('Welcome to Our Platform, {member_name}!');
  const [category, setCategory] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [selectedVariables, setSelectedVariables] = useState(new Set());
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [generatedFile, setGeneratedFile] = useState(null);
  const quillRef = useRef(null);
  const isProcessingRef = useRef(false);
  const previousContentRef = useRef('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Function to convert HTML to plain text for Word document
  const htmlToPlainText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Function to generate Word document content
  const generateWordDocumentContent = () => {
    const plainTextContent = htmlToPlainText(emailContent);

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="UTF-8">
  <title>${templateName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 40px;
      color: #333;
    }
    .header {
      border-bottom: 2px solid #2f6bff;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .template-name {
      font-size: 24px;
      color: #2f6bff;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .subject {
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      color: #215e97;
    }
    .content {
      margin: 30px 0;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .variables {
      background: #f5f5f5;
      padding: 15px;
      margin: 20px 0;
      border-left: 4px solid #215e97;
    }
    .metadata {
      font-size: 12px;
      color: #666;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .variable-tag {
      background: #eef4ff;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
      color: #215e97;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="template-name">${templateName}</div>
    <div><strong>Type:</strong> ${templateType}</div>
    <div><strong>Category:</strong> ${category}</div>
    <div><strong>Description:</strong> ${description}</div>
  </div>
  
  <div class="subject">
    ${templateType === 'letter' ? 'TITLE' : 'SUBJECT'}: ${subject}
  </div>
  
  <div class="content">
${plainTextContent}
  </div>
  
  ${selectedVariables.size > 0 ? `
  <div class="variables">
    <strong>Template Variables:</strong><br><br>
    ${Array.from(selectedVariables).map(variableId => {
      const variable = availableVariables.find(v => v.id === variableId);
      return variable ? `<span class="variable-tag">${variable.name}</span>${variable.label}<br>` : '';
    }).join('')}
  </div>
  ` : ''}
  
  <div class="metadata">
    <strong>Created:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br>
    <strong>Template ID:</strong> TEMPLATE_${Date.now()}
  </div>
</body>
</html>`;
  };

  // Function to generate file blob and save in state
  const generateTemplateFile = () => {
    try {
      const wordContent = generateWordDocumentContent();
      const blob = new Blob([wordContent], {
        type: 'application/msword'
      });

      const fileName = `${templateName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
      const fileUrl = URL.createObjectURL(blob);

      const templateFile = {
        id: `template_${Date.now()}`,
        name: fileName,
        blob: blob,
        url: fileUrl,
        content: wordContent,
        templateData: {
          name: templateName.trim(),
          description: description.trim(),
          type: templateType,
          category: category,
          subject: subject.trim(),
          content: emailContent,
          variables: Array.from(selectedVariables).map(variableId => {
            const variable = availableVariables.find(v => v.id === variableId);
            return variable ? variable.name : null;
          }).filter(Boolean),
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0'
          }
        }
      };

      setGeneratedFile(templateFile);
      return templateFile;
    } catch (error) {
      console.error('Error generating template file:', error);
      throw error;
    }
  };

  // Function to download the generated file
  const downloadTemplateFile = () => {
    if (generatedFile) {
      const a = document.createElement('a');
      a.href = generatedFile.url;
      a.download = generatedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }
    return false;
  };

  // Function to save template to state
  const saveTemplateToState = () => {
    try {
      const templateFile = generateTemplateFile();

      const newTemplate = {
        ...templateFile,
        savedAt: new Date().toISOString(),
        status: 'saved'
      };

      setSavedTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (error) {
      console.error('Error saving template to state:', error);
      throw error;
    }
  };

  // Save Template Function
  const handleSaveTemplate = async () => {
    // Validation
    if (!templateName.trim()) {
      message.error('Please enter a template name');
      return;
    }

    if (!templateType) {
      message.error('Please select a template type');
      return;
    }

    if (!category) {
      message.error('Please select a category');
      return;
    }

    if (!subject.trim()) {
      message.error('Please enter a subject/title');
      return;
    }

    if (!emailContent.trim() || emailContent === '<p><br></p>') {
      message.error('Please enter template content');
      return;
    }

    setSaving(true);

    try {
      message.loading('Saving template...', 0);

      // Save template to state
      const savedTemplate = saveTemplateToState();

      message.destroy();
      message.success('Template saved successfully!');

      // Auto-download the file
      const downloadSuccess = downloadTemplateFile();
      if (downloadSuccess) {
        message.info('Template file downloaded automatically');
      }

      // Show saved templates count
      message.info(`Total templates saved: ${savedTemplates.length + 1}`);

      // Navigate to template summary after a delay
      setTimeout(() => {
        // navigate('/templeteSummary');
      }, 2000);

    } catch (error) {
      console.error('Error saving template:', error);
      message.destroy();
      message.error(`Failed to save template: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Download generated file separately
  const handleDownloadFile = () => {
    if (generatedFile) {
      const success = downloadTemplateFile();
      if (success) {
        message.success('Template file downloaded!');
      } else {
        message.error('No template file available to download');
      }
    } else {
      message.warning('Please save the template first to generate a file');
    }
  };

  // View saved templates
  const viewSavedTemplates = () => {
    if (savedTemplates.length === 0) {
      message.info('No templates saved yet');
      return;
    }

    Modal.info({
      title: 'Saved Templates',
      width: 600,
      content: (
        <div>
          <p>Total templates saved: <strong>{savedTemplates.length}</strong></p>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {savedTemplates.map((template, index) => (
              <Card
                key={template.id}
                size="small"
                style={{ marginBottom: '8px' }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{template.templateData.name}</span>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = template.url;
                        a.download = template.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      Download
                    </Button>
                  </div>
                }
              >
                <p><strong>Type:</strong> {template.templateData.type}</p>
                <p><strong>Category:</strong> {template.templateData.category}</p>
                <p><strong>Saved:</strong> {new Date(template.savedAt).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </div>
      ),
      onOk() { },
    });
  };

  // Preview handlers
  const handlePreview = () => {
    setIsPreviewModalVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalVisible(false);
  };

  // Handle template type change
  const handleTemplateTypeChange = (e) => {
    const value = e.target.value;
    setTemplateType(value);
    setCategory('');
    setSubject('');
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Get current category options based on selected template type
  const getCategoryOptions = () => {
    return templateType ? (categoryOptions[templateType] || []) : [];
  };

  // Custom Quill modules configuration
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

  // Function to find variables in text
  const findVariablesInText = (text) => {
    const foundVariables = new Set();
    availableVariables.forEach(variable => {
      if (text.includes(variable.name)) {
        foundVariables.add(variable.id);
      }
    });
    return foundVariables;
  };

  // Function to sync selected variables with editor content
  const syncSelectedVariablesWithContent = () => {
    if (quillRef.current && !isProcessingRef.current) {
      isProcessingRef.current = true;
      try {
        const editor = quillRef.current.getEditor();
        const content = editor.getText();
        const currentlyPresentVariables = findVariablesInText(content);
        setSelectedVariables(currentlyPresentVariables);
        previousContentRef.current = content;
      } catch (error) {
        console.error('Error syncing variables:', error);
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Function to insert variable with bold formatting and remove bold from next text
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

  // Function to protect variables from editing
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      previousContentRef.current = editor.getText();

      const preventVariableEditing = (range) => {
        if (range && range.length === 0) {
          const [line, offset] = editor.getLine(range.index);
          if (line) {
            const text = line.domNode.textContent || '';
            const variableRegex = /\{[^}]+\}/g;
            let match;
            while ((match = variableRegex.exec(text)) !== null) {
              const variableStart = match.index;
              const variableEnd = match.index + match[0].length;
              if (offset >= variableStart && offset <= variableEnd) {
                editor.setSelection(range.index + (variableEnd - offset), 0);
                break;
              }
            }
          }
        }
      };

      const textChangeHandler = (delta, oldDelta, source) => {
        if (source === 'user' && !isProcessingRef.current) {
          isProcessingRef.current = true;
          try {
            const currentContent = editor.getText();
            const contents = editor.getContents();

            contents.ops.forEach((op) => {
              if (typeof op.insert === 'string') {
                const variableRegex = /\{[^}]+\}/g;
                let match;
                let lastIndex = 0;
                while ((match = variableRegex.exec(op.insert)) !== null) {
                  const variableText = match[0];
                  const startIndex = lastIndex + match.index;
                  const endIndex = startIndex + variableText.length;

                  if (!op.attributes || !op.attributes.bold) {
                    editor.formatText(startIndex, variableText.length, 'bold', true);
                  }

                  if (endIndex < op.insert.length) {
                    editor.formatText(endIndex, 1, 'bold', false);
                  }
                  lastIndex = match.index + variableText.length;
                }
              }
            });

            const currentlyPresentVariables = findVariablesInText(currentContent);
            setSelectedVariables(currentlyPresentVariables);
            previousContentRef.current = currentContent;
          } catch (error) {
            console.error('Error in text change handler:', error);
          } finally {
            isProcessingRef.current = false;
          }
        }
      };

      const selectionChangeHandler = (range) => {
        if (range && !isProcessingRef.current) {
          preventVariableEditing(range);
        }
      };

      editor.on('text-change', textChangeHandler);
      editor.on('selection-change', selectionChangeHandler);

      setTimeout(() => {
        syncSelectedVariablesWithContent();
      }, 100);

      return () => {
        editor.off('text-change', textChangeHandler);
        editor.off('selection-change', selectionChangeHandler);
      };
    }
  }, []);

  // Function to remove variable
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

  // Native HTML5 Drag and Drop Handlers
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

  // Click to insert as fallback
  const handleVariableClick = (variableName, variableId) => {
    insertVariable(variableName, variableId);
  };

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

        <Button
          onClick={handleDownloadFile}
          icon={<DownloadOutlined />}
          disabled={!generatedFile}
        >
          Download File
        </Button>

        <Button
          onClick={viewSavedTemplates}
        >
          View Saved ({savedTemplates.length})
        </Button>
      </div>

      {/* File Status */}
      {generatedFile && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px'
        }}>
          <Text strong style={{ color: '#389e0d' }}>
            ✓ Template file generated: {generatedFile.name}
          </Text>
          <br />
          <Text type="secondary">
            Ready to download. File saved in application state.
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
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                Template Type
              </Text>
              <CustomSelect
                label=""
                name="templateType"
                value={templateType}
                onChange={handleTemplateTypeChange}
                options={templateTypeOptions}
                placeholder="Select template type"
                isIDs={true}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                Template Category
              </Text>
              <CustomSelect
                label=""
                name="category"
                value={category}
                onChange={handleCategoryChange}
                options={getCategoryOptions()}
                placeholder={templateType ? "Select category" : "Select template type first"}
                disabled={!templateType}
                isIDs={true}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                Template Name
              </Text>
              <MyInput
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>

            <div style={{ marginBottom: '0px' }}>
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                Description
              </Text>
              <MyInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter template description"
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
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                {templateType === 'letter' ? 'Title' : 'Subject'}
              </Text>
              <MyInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={templateType === 'letter' ? "Enter letter title" : "Enter email subject"}
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

              {/* React Quill Editor with Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  flex: 1,
                  border: '1px solid #d9d9d9',
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
                    setEmailContent(content);
                    if (source === 'user') {
                      const currentContent = editor.getText();
                      const currentlyPresentVariables = findVariablesInText(currentContent);
                      setSelectedVariables(currentlyPresentVariables);
                    }
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
                <div
                  style={{
                    maxHeight: '450px',            // 👈 adjust height as needed
                    overflowY: 'auto',
                    paddingRight: '4px'            // optional: prevents content from hiding behind scrollbar
                  }}
                >
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
                        onMouseOver={(e) => {
                          if (!selectedVariables.has(variable._id)) {
                            e.currentTarget.style.backgroundColor = '#e6f7ff';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!selectedVariables.has(variable._id)) {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
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

      {/* PDF Preview Modal */}
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
                    Ref: {templateType || 'TEMPLATE-001'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                <Text strong style={{ fontSize: '14pt', display: 'block', marginBottom: '5px' }}>
                  {templateType === 'letter' ? 'TITLE' : 'SUBJECT'}: {subject}
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