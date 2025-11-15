import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Card,
  Divider,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Modal
} from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  FontSizeOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  PictureOutlined,
  CloseOutlined,
  EyeOutlined,
  MailOutlined,
  FileTextOutlined,
  PrinterOutlined,
  MoreOutlined
} from '@ant-design/icons';
import MyInput from '../../component/common/MyInput';
import CustomSelect from '../../component/common/CustomSelect';

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
  const [previewMode, setPreviewMode] = useState('letter'); // 'letter' or 'email'
  const quillRef = useRef(null);
  const isProcessingRef = useRef(false);
  const previousContentRef = useRef('');

  // Available variables for drag and drop
  const availableVariables = [
    { id: '1', name: '{category_name}' },
    { id: '2', name: '{payment_type}' },
    { id: '3', name: '{work_location}' },
    { id: '4', name: '{region}' },
    { id: '5', name: '{branch}' },
    { id: '6', name: '{member_name}' },
    { id: '7', name: '{reg_no}' },
    { id: '8', name: '{date}' },
  ];

  // Category options - using {key, label} format for CustomSelect
  const categoryOptions = [
    { key: 'welcome', label: 'Welcome Email' },
    { key: 'payment_reminder', label: 'Payment Reminder' },
    { key: 'notification', label: 'Notification' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'support', label: 'Support' },
  ];

  // Template type options based on category - using {key, label} format
  const templateTypeOptions = {
    welcome: [
      { key: 'welcome_1', label: 'Welcome Email 1' },
      { key: 'welcome_2', label: 'Welcome Email 2' },
      { key: 'welcome_3', label: 'Welcome Email 3' },
    ],
    payment_reminder: [
      { key: 'payment_reminder_1', label: 'Payment Reminder 1' },
      { key: 'payment_reminder_2', label: 'Payment Reminder 2' },
      { key: 'payment_reminder_3', label: 'Payment Reminder 3' },
    ],
    notification: [
      { key: 'notification_1', label: 'Notification 1' },
      { key: 'notification_2', label: 'Notification 2' },
      { key: 'notification_3', label: 'Notification 3' },
    ],
    marketing: [
      { key: 'marketing_1', label: 'Marketing 1' },
      { key: 'marketing_2', label: 'Marketing 2' },
      { key: 'marketing_3', label: 'Marketing 3' },
    ],
    support: [
      { key: 'support_1', label: 'Support 1' },
      { key: 'support_2', label: 'Support 2' },
      { key: 'support_3', label: 'Support 3' },
    ],
  };

  // Preview handlers
  const handlePreviewAsLetter = () => {
    setPreviewMode('letter');
    setIsPreviewModalVisible(true);
  };

  const handlePreviewAsEmail = () => {
    setPreviewMode('email');
    setIsPreviewModalVisible(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalVisible(false);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setTemplateType(''); // Reset template type when category changes
  };

  // Handle template type change
  const handleTemplateTypeChange = (e) => {
    setTemplateType(e.target.value);
  };

  // Get current template type options based on selected category
  const getTemplateTypeOptions = () => {
    return category ? (templateTypeOptions[category] || []) : [];
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
        const content = editor.getText(); // Get plain text content

        const currentlyPresentVariables = findVariablesInText(content);

        // Update selectedVariables to match what's actually in the editor
        setSelectedVariables(currentlyPresentVariables);

        // Update the ref with current content
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
          // Insert variable with bold formatting
          editor.insertText(range.index, variableName, 'bold', true);

          // Remove bold formatting from the character immediately after the variable
          editor.formatText(range.index + variableName.length, 1, 'bold', false);

          // Add to selected variables
          setSelectedVariables(prev => new Set([...prev, variableId]));

          // Move cursor after the inserted variable
          editor.setSelection(range.index + variableName.length, 0);
        } else {
          // If no selection, insert at the end
          const length = editor.getLength();

          // Insert variable with bold formatting
          editor.insertText(length - 1, variableName, 'bold', true);

          // Remove bold formatting from the character immediately after the variable
          editor.formatText(length - 1 + variableName.length, 1, 'bold', false);

          // Add to selected variables
          setSelectedVariables(prev => new Set([...prev, variableId]));

          editor.setSelection(length + variableName.length - 1, 0);
        }

        // Update previous content
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

      // Store initial content
      previousContentRef.current = editor.getText();

      // Function to prevent editing of variables
      const preventVariableEditing = (range) => {
        if (range && range.length === 0) {
          // Check if cursor is inside a variable
          const [line, offset] = editor.getLine(range.index);
          if (line) {
            const text = line.domNode.textContent || '';
            const variableRegex = /\{[^}]+\}/g;
            let match;

            while ((match = variableRegex.exec(text)) !== null) {
              const variableStart = match.index;
              const variableEnd = match.index + match[0].length;

              // If cursor is inside a variable, move it to the end of the variable
              if (offset >= variableStart && offset <= variableEnd) {
                editor.setSelection(range.index + (variableEnd - offset), 0);
                break;
              }
            }
          }
        }
      };

      // Text change handler to maintain bold formatting and sync variables
      const textChangeHandler = (delta, oldDelta, source) => {
        if (source === 'user' && !isProcessingRef.current) {
          isProcessingRef.current = true;

          try {
            // Get current content after the change
            const currentContent = editor.getText();

            // Maintain bold formatting for variables and ensure next text is not bold
            const contents = editor.getContents();

            contents.ops.forEach((op, index) => {
              if (typeof op.insert === 'string') {
                const variableRegex = /\{[^}]+\}/g;
                let match;
                let lastIndex = 0;

                while ((match = variableRegex.exec(op.insert)) !== null) {
                  const variableText = match[0];
                  const startIndex = lastIndex + match.index;
                  const endIndex = startIndex + variableText.length;

                  // Ensure variable is bold
                  if (!op.attributes || !op.attributes.bold) {
                    editor.formatText(startIndex, variableText.length, 'bold', true);
                  }

                  // Ensure character after variable is not bold (if it exists)
                  if (endIndex < op.insert.length) {
                    editor.formatText(endIndex, 1, 'bold', false);
                  }

                  lastIndex = match.index + variableText.length;
                }
              }
            });

            // Sync selected variables with actual content after text changes
            const currentlyPresentVariables = findVariablesInText(currentContent);
            setSelectedVariables(currentlyPresentVariables);

            // Update previous content
            previousContentRef.current = currentContent;
          } catch (error) {
            console.error('Error in text change handler:', error);
          } finally {
            isProcessingRef.current = false;
          }
        }
      };

      // Selection change handler to prevent cursor inside variables
      const selectionChangeHandler = (range) => {
        if (range && !isProcessingRef.current) {
          preventVariableEditing(range);
        }
      };

      // Add event listeners
      editor.on('text-change', textChangeHandler);
      editor.on('selection-change', selectionChangeHandler);

      // Initial sync
      setTimeout(() => {
        syncSelectedVariablesWithContent();
      }, 100);

      // Cleanup
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
          // Get current content
          const contents = editor.getContents();
          let newContents = { ops: [] };
          let variableRemoved = false;

          // Remove all occurrences of this variable
          contents.ops.forEach(op => {
            if (typeof op.insert === 'string' && op.insert.includes(variable.name)) {
              // Remove the variable from the text
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
      // Just remove from selected variables if editor not available
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

  // Toolbar handlers
  const handleBold = () => {
    if (quillRef.current && !isProcessingRef.current) {
      isProcessingRef.current = true;
      try {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        if (range) {
          editor.format('bold', !editor.getFormat(range).bold);
        }
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  const handleItalic = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.format('italic', !editor.getFormat(range).italic);
      }
    }
  };

  const handleUnderline = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        editor.format('underline', !editor.getFormat(range).underline);
      }
    }
  };

  // Custom toolbar component to match the screenshot
  const CustomToolbar = () => (
    <div style={{
      border: '1px solid #d9d9d9',
      borderBottom: 'none',
      padding: '8px 12px',
      backgroundColor: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderRadius: '6px 6px 0 0'
    }}>
      <Space size={0}>
        <button
          type="button"
          onClick={handleBold}
          style={{
            fontWeight: 'bold',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <BoldOutlined />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          style={{
            fontStyle: 'italic',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <ItalicOutlined />
        </button>
        <button
          type="button"
          onClick={handleUnderline}
          style={{
            textDecoration: 'underline',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <UnderlineOutlined />
        </button>
        <Divider type="vertical" style={{ height: '16px', margin: '0 4px' }} />
        <button
          type="button"
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <FontSizeOutlined />
        </button>
        <Divider type="vertical" style={{ height: '16px', margin: '0 4px' }} />
        <button
          type="button"
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <UnorderedListOutlined />
        </button>
        <button
          type="button"
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <OrderedListOutlined />
        </button>
        <Divider type="vertical" style={{ height: '16px', margin: '0 4px' }} />
        <button
          type="button"
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <LinkOutlined />
        </button>
        <button
          type="button"
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <PictureOutlined />
        </button>
      </Space>
    </div>
  );

  // Split available variables into two columns
  const midPoint = Math.ceil(availableVariables.length / 2);
  const firstColumnVariables = availableVariables.slice(0, midPoint);
  const secondColumnVariables = availableVariables.slice(midPoint);

  return (
    <div className='px-4' style={{ minHeight: '100vh' }}>
      <div style={{ marginTop: '1px', marginBottom:'5px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={handlePreviewAsLetter}
                size="large"
              >
                Preview as Letter
              </Button>
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={handlePreviewAsEmail}
                size="large"
              >
                Preview as Email
              </Button>
              <Button
                type="primary"
                // icon={<MailOutlined />}
                onClick={handlePreviewAsEmail}
                size="large"
              >
               Save
              </Button>
            </div>
      <Row gutter={24} style={{ minHeight: '80vh' }}>
        {/* Left Column - Email Content Builder (70%) */}
        <Col span={17}>
          <Card
            title="Email Content Builder"
            headStyle={{
              backgroundColor: '#eef4ff',
              color: '#2f6bff'
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
                Subject
              </Text>
              <MyInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            <div style={{ flex: 1 }}>
              <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                Body
              </Text>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Insert Variable
                </Text>
              </div>

              {/* Custom Toolbar */}
              <CustomToolbar />

              {/* React Quill Editor with Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '1px solid #d9d9d9',
                  borderTop: 'none',
                  borderRadius: '0 0 6px 6px',
                  minHeight: '300px',
                  height: 'calc(100% - 100px)'
                }}
              >
                <ReactQuill
                  ref={quillRef}
                  value={emailContent}
                  onChange={(content, delta, source, editor) => {
                    setEmailContent(content);
                    // Sync variables whenever content changes from user
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
                    height: '100%'
                  }}
                />
              </div>
            </div>

            {/* Preview Buttons */}
            
          </Card>
        </Col>

        {/* Right Column - Template Information & Variables (30%) */}
        <Col span={7}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            {/* Template Information Card */}
            <Card
              title="Template Information"
              headStyle={{
                backgroundColor: '#eef4ff',
                color: '#2f6bff'
              }}
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
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

              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                  Description
                </Text>
                <MyInput
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter template description"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                  Category
                </Text>
                <CustomSelect
                  label=""
                  name="category"
                  value={category}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  placeholder="Select category"
                  isIDs={true}
                />
              </div>

              <div style={{ marginBottom: '0px' }}>
                <Text strong style={{ color: '#000', display: 'block', marginBottom: '4px' }}>
                  Template Type
                </Text>
                <CustomSelect
                  label=""
                  name="templateType"
                  value={templateType}
                  onChange={handleTemplateTypeChange}
                  options={getTemplateTypeOptions()}
                  placeholder={category ? "Select template type" : "Select category first"}
                  disabled={!category}
                  isIDs={true}
                />
              </div>
            </Card>

            {/* Draggable Variables Card */}
            <Card
              title="Draggable Variables"
              headStyle={{
                backgroundColor: '#eef4ff',
                color: '#2f6bff'
              }}
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                flex: 1
              }}
              bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <MyInput
                  type="search"
                  placeholder="Search variables..."
                />
              </div>

              <Text style={{
                display: 'block',
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px'
              }}>
                Drag and drop these tags into the email body.
              </Text>

              {/* Selected Variables Section */}
              {selectedVariables.size > 0 && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#2f6bff' }}>
                    Selected Variables
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
                            border: '1px solid #2f6bff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#2f6bff',
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

              {/* Draggable Variables in Two Columns */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* First Column */}
                <div style={{ flex: 1 }}>
                  {firstColumnVariables.map((variable, index) => (
                    <div
                      key={variable.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, variable.name, variable.id)}
                      onClick={() => handleVariableClick(variable.name, variable.id)}
                      style={{
                        marginBottom: '6px',
                        padding: '6px 8px',
                        backgroundColor: selectedVariables.has(variable.id) ? '#eef4ff' : '#fff',
                        border: selectedVariables.has(variable.id) ? '2px solid #2f6bff' : '1px solid #d9d9d9',
                        borderRadius: '4px',
                        cursor: 'grab',
                        fontSize: '12px',
                        userSelect: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!selectedVariables.has(variable.id)) {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedVariables.has(variable.id)) {
                          e.currentTarget.style.backgroundColor = '#fff';
                        }
                      }}
                    >
                      {variable.name}
                    </div>
                  ))}
                </div>

                {/* Second Column */}
                <div style={{ flex: 1 }}>
                  {secondColumnVariables.map((variable, index) => (
                    <div
                      key={variable.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, variable.name, variable.id)}
                      onClick={() => handleVariableClick(variable.name, variable.id)}
                      style={{
                        marginBottom: '6px',
                        padding: '6px 8px',
                        backgroundColor: selectedVariables.has(variable.id) ? '#eef4ff' : '#fff',
                        border: selectedVariables.has(variable.id) ? '2px solid #2f6bff' : '1px solid #d9d9d9',
                        borderRadius: '4px',
                        cursor: 'grab',
                        fontSize: '12px',
                        userSelect: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!selectedVariables.has(variable.id)) {
                          e.currentTarget.style.backgroundColor = '#f5f5f5';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedVariables.has(variable.id)) {
                          e.currentTarget.style.backgroundColor = '#fff';
                        }
                      }}
                    >
                      {variable.name}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Preview Modal */}
      {/* Preview Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {previewMode === 'letter' ? (
                <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
              ) : (
                <MailOutlined style={{ color: 'white', fontSize: '18px' }} />
              )}
              <Text strong style={{ fontSize: '16px', color: 'white' }}>
                {previewMode === 'letter' ? 'Letter Document Preview' : 'Email Client Preview'}
              </Text>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type={previewMode === 'letter' ? 'primary' : 'default'}
                icon={<FileTextOutlined />}
                size="small"
                onClick={() => setPreviewMode('letter')}
                style={{
                  borderRadius: '6px',
                  borderColor: previewMode === 'letter' ? '#2f6bff' : '#d9d9d9',
                  color: previewMode === 'letter' ? 'white' : 'inherit'
                }}
              >
                Letter View
              </Button>
              <Button
                type={previewMode === 'email' ? 'primary' : 'default'}
                icon={<MailOutlined />}
                size="small"
                onClick={() => setPreviewMode('email')}
                style={{
                  borderRadius: '6px',
                  borderColor: previewMode === 'email' ? '#2f6bff' : '#d9d9d9',
                  color: previewMode === 'email' ? 'white' : 'inherit'
                }}
              >
                Email View
              </Button>
            </div>
          </div>
        }
        open={isPreviewModalVisible}
        onCancel={handleClosePreview}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Print
          </Button>,
          <Button key="close" type="primary" onClick={handleClosePreview}>
            Close Preview
          </Button>
        ]}
        width={previewMode === 'letter' ? '90%' : '700px'}
        style={{ top: 20 }}
        bodyStyle={{ padding: '0' }}
        // Add this to style the entire modal header background
        styles={{
          header: {
            background: '#2f6bff',
            borderBottom: 'none',
            padding: '16px 24px',
            borderRadius: '8px 8px 0 0'
          }
        }}
      >
        {previewMode === 'letter' ? (
          // Enhanced Letter Preview - Professional A4 document
          <div style={{
            background: 'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            padding: '40px',
            display: 'flex',
            justifyContent: 'center',
            minHeight: '80vh'
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
                    SUBJECT: {subject}
                  </Text>
                </div>
              </div>

              {/* Letter Body */}
              <div style={{
                marginBottom: '30px',
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

              {/* Letter Footer */}
              <div style={{
                borderTop: '1px solid #e8e8e8',
                paddingTop: '20px',
                marginTop: '40px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '5px' }}>
                    Sincerely,
                  </Text>
                  <div style={{ height: '60px', marginBottom: '10px' }}></div> {/* Signature space */}
                  <Text strong style={{ display: 'block' }}>
                    [Your Name]
                  </Text>
                  <Text style={{ fontSize: '10pt', color: '#666' }}>
                    {templateName || 'Position'} | {category ? category.replace('_', ' ').toUpperCase() : 'Department'}
                  </Text>
                </div>
              </div>

              {/* Page Number */}
              <div style={{
                position: 'absolute',
                bottom: '15mm',
                right: '25mm',
                fontSize: '10pt',
                color: '#999'
              }}>
                Page 1 of 1
              </div>
            </div>
          </div>
        ) : (
          // Enhanced Email Preview - Modern Email Client
          <div style={{
            backgroundColor: '#f5f7fa',
            padding: '20px',
            minHeight: '600px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>
              {/* Email Header Bar */}
              <div style={{
                backgroundColor: '#2f6bff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <MailOutlined style={{ color: 'white', fontSize: '18px' }} />
                <Text strong style={{ color: 'white', fontSize: '14px' }}>
                  New Message
                </Text>
                <div style={{ flex: 1 }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28ca42' }}></div>
                </div>
              </div>

              {/* Email Toolbar */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px 20px',
                borderBottom: '1px solid #e8e8e8',
                display: 'flex',
                gap: '8px'
              }}>
                <Button size="small" type="text" style={{ color: '#666', fontSize: '12px' }}>Reply</Button>
                <Button size="small" type="text" style={{ color: '#666', fontSize: '12px' }}>Reply All</Button>
                <Button size="small" type="text" style={{ color: '#666', fontSize: '12px' }}>Forward</Button>
                <div style={{ flex: 1 }}></div>
                <Button size="small" type="text" style={{ color: '#666', fontSize: '12px' }}>
                  <MoreOutlined />
                </Button>
              </div>

              {/* Email Header Info */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <Text strong style={{ fontSize: '16px' }}>
                    {subject}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#666' }}>
                    Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <div>
                    <Text strong style={{ color: '#666', display: 'block', marginBottom: '2px' }}>From:</Text>
                    <Text>no-reply@company.com</Text>
                  </div>
                  <div>
                    <Text strong style={{ color: '#666', display: 'block', marginBottom: '2px' }}>To:</Text>
                    <Text>customer@example.com</Text>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div style={{
                padding: '30px 20px',
                minHeight: '400px',
                lineHeight: '1.6'
              }}>
                <div
                  style={{
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    fontSize: '14px',
                    color: '#333'
                  }}
                  dangerouslySetInnerHTML={{ __html: emailContent }}
                />
              </div>

              {/* Email Signature */}
              <div style={{
                padding: '20px',
                borderTop: '1px solid #f0f0f0',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#2f6bff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {templateName ? templateName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>
                      {templateName || 'Company Name'}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      {description || 'Professional Email Service'}
                    </Text>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                      <div>📧 info@company.com</div>
                      <div>🌐 www.company.com</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Footer */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '16px 20px',
                borderTop: '1px solid #e8e8e8',
                textAlign: 'center'
              }}>
                <Text style={{ fontSize: '11px', color: '#999' }}>
                  This email was sent from the Email Template Builder • {new Date().getFullYear()} •
                  <Button type="link" size="small" style={{ fontSize: '11px', padding: '0 4px', height: 'auto' }}>
                    Unsubscribe
                  </Button>
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateConfiguration;