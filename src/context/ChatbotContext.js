import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";
import {
  Drawer,
  Button,
  Input,
  List,
  Avatar,
  Space,
  Spin,
  message,
} from "antd";
import {
  RobotOutlined,
  SendOutlined,
  ReloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import moment from "moment";

const ChatbotContext = createContext();

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
};

export const ChatbotProvider = ({ children }) => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant. I can help you with data analysis, navigation, and insights based on your current view. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Get current page context
  const getCurrentPageContext = () => {
    const path = location.pathname;
    const pathSegments = path.split("/").filter(Boolean);

    // Define page contexts
    const pageContexts = {
      "/CancelledMembersReport": {
        name: "Cancelled Members Report",
        type: "report",
        description:
          "Analytics dashboard for cancelled members with KPIs, charts, and detailed data",
        capabilities: [
          "Analyze cancellation trends and patterns",
          "View financial impact and outstanding balances",
          "Filter and search cancelled members data",
          "Export reports to Excel and PDF",
          "Get insights on regional and category breakdowns",
        ],
        dataTypes: [
          "membership data",
          "financial data",
          "cancellation trends",
          "regional data",
        ],
      },
      "/UserManagement": {
        name: "User Management",
        type: "management",
        description: "Manage system users, roles, and permissions",
        capabilities: [
          "View and manage user accounts",
          "Assign roles and permissions",
          "Monitor user activity",
          "Create and edit user profiles",
        ],
        dataTypes: [
          "user data",
          "role data",
          "permission data",
          "activity logs",
        ],
      },
      "/RoleManagement": {
        name: "Role Management",
        type: "management",
        description: "Configure system roles and their associated permissions",
        capabilities: [
          "Create and edit roles",
          "Assign permissions to roles",
          "View role hierarchies",
          "Manage role-based access control",
        ],
        dataTypes: ["role data", "permission data", "access control data"],
      },
      "/TenantManagement": {
        name: "Tenant Management",
        type: "management",
        description: "Manage multi-tenant system configuration",
        capabilities: [
          "Configure tenant settings",
          "Manage tenant-specific data",
          "View tenant usage statistics",
          "Set up tenant isolation",
        ],
        dataTypes: ["tenant data", "configuration data", "usage statistics"],
      },
      "/PermissionManagement": {
        name: "Permission Management",
        type: "management",
        description: "Configure system permissions and access controls",
        capabilities: [
          "View all system permissions",
          "Create custom permissions",
          "Manage permission groups",
          "Audit permission usage",
        ],
        dataTypes: ["permission data", "access control data", "audit logs"],
      },
      "/MainDashBoard": {
        name: "Main Dashboard",
        type: "dashboard",
        description:
          "Overview of system metrics and key performance indicators",
        capabilities: [
          "View system overview",
          "Monitor key metrics",
          "Access quick actions",
          "Navigate to different modules",
        ],
        dataTypes: ["system metrics", "performance data", "navigation data"],
      },
      "/Profiles": {
        name: "Member Profiles",
        type: "profile",
        description: "Manage member profiles and personal information",
        capabilities: [
          "View member details",
          "Edit profile information",
          "Search and filter members",
          "Manage member relationships",
        ],
        dataTypes: ["member data", "profile data", "personal information"],
      },
      "/Claims": {
        name: "Claims Management",
        type: "claims",
        description: "Process and manage member claims",
        capabilities: [
          "View claim submissions",
          "Process claim approvals",
          "Track claim status",
          "Generate claim reports",
        ],
        dataTypes: ["claim data", "approval data", "status tracking"],
      },
      "/Correspondences": {
        name: "Correspondence Management",
        type: "communication",
        description: "Manage member communications and correspondence",
        capabilities: [
          "View communication history",
          "Send messages to members",
          "Track correspondence status",
          "Manage communication templates",
        ],
        dataTypes: ["communication data", "message history", "template data"],
      },
      "/finance": {
        name: "Finance Management",
        type: "finance",
        description: "Manage financial transactions and payments",
        capabilities: [
          "View payment history",
          "Process payments",
          "Generate financial reports",
          "Manage outstanding balances",
        ],
        dataTypes: ["payment data", "transaction data", "financial reports"],
      },
    };

    // Find matching context
    for (const [pathKey, context] of Object.entries(pageContexts)) {
      if (path.includes(pathKey.replace("/", ""))) {
        return context;
      }
    }

    // Default context for unknown pages
    return {
      name: "Current Page",
      type: "general",
      description:
        "You are currently viewing a page in the membership management system",
      capabilities: [
        "Navigate to different sections",
        "Get help with current features",
        "Access system information",
      ],
      dataTypes: ["general data", "navigation data"],
    };
  };

  // Get contextual data based on current page
  const getContextualData = () => {
    const context = getCurrentPageContext();
    return {
      pageContext: context,
      currentPath: location.pathname,
      timestamp: new Date(),
    };
  };

  // Generate AI response based on context and user message
  const generateAIResponse = (userMessage) => {
    const context = getContextualData();
    const message = userMessage.toLowerCase();

    // Page-specific responses
    if (context.pageContext.name === "Cancelled Members Report") {
      return generateReportResponse(message, context);
    } else if (context.pageContext.type === "management") {
      return generateManagementResponse(message, context);
    } else if (context.pageContext.type === "dashboard") {
      return generateDashboardResponse(message, context);
    } else if (context.pageContext.type === "finance") {
      return generateFinanceResponse(message, context);
    } else {
      return generateGeneralResponse(message, context);
    }
  };

  // Report-specific responses
  const generateReportResponse = (message, context) => {
    if (message.includes("help") || message.includes("what can you do")) {
      return `I can help you with the **${
        context.pageContext.name
      }**:\n\n**Available Features:**\n${context.pageContext.capabilities
        .map((cap) => `• ${cap}`)
        .join("\n")}\n\n**Data Types:** ${context.pageContext.dataTypes.join(
        ", "
      )}\n\n**Try asking:**\n• "How do I filter the data?"\n• "Show me the export options"\n• "What insights can I get?"\n• "How do I analyze trends?"`;
    }

    if (message.includes("filter") || message.includes("search")) {
      return `In the **${context.pageContext.name}**, you can:\n• Use the search bar to find specific members\n• Apply date range filters for cancellation dates\n• Filter by membership status (Active/Cancelled)\n• Filter by membership category (Regular/Premium/Student)\n• Combine multiple filters for precise results\n\n**Pro tip:** Filters work together, so you can narrow down your data step by step.`;
    }

    if (message.includes("export") || message.includes("download")) {
      return `The **${context.pageContext.name}** offers several export options:\n• **Excel Export**: Includes headers, KPIs, and filter information\n• **PDF Export**: Professional report format with charts\n• **Print**: Printer-friendly layout with all data\n\n**Features:**\n• Automatic page orientation (portrait/landscape)\n• Ink-friendly colors for printing\n• Includes applied filters in exports\n• Professional formatting and styling`;
    }

    if (message.includes("chart") || message.includes("visualization")) {
      return `The **${context.pageContext.name}** includes several visualizations:\n• **Trend Charts**: Cancellation patterns over time\n• **Pie Charts**: Reason distribution and category breakdowns\n• **Bar Charts**: Regional and category comparisons\n• **KPI Cards**: Key metrics at a glance\n\n**Insights:**\n• Hover over charts for detailed information\n• Charts update based on your filters\n• Export charts as part of PDF reports`;
    }

    return `I can help you with the **${
      context.pageContext.name
    }**. This page allows you to ${context.pageContext.description.toLowerCase()}. What specific aspect would you like to explore?`;
  };

  // Management-specific responses
  const generateManagementResponse = (message, context) => {
    if (message.includes("help") || message.includes("what can you do")) {
      return `I can help you with **${
        context.pageContext.name
      }**:\n\n**Available Features:**\n${context.pageContext.capabilities
        .map((cap) => `• ${cap}`)
        .join("\n")}\n\n**Data Types:** ${context.pageContext.dataTypes.join(
        ", "
      )}\n\n**Try asking:**\n• "How do I create a new ${context.pageContext.name
        .toLowerCase()
        .replace(
          " management",
          ""
        )}?"\n• "What are the current settings?"\n• "How do I manage permissions?"`;
    }

    if (
      message.includes("create") ||
      message.includes("add") ||
      message.includes("new")
    ) {
      return `To create a new item in **${context.pageContext.name}**:\n• Look for the "Add New" or "Create" button\n• Fill in the required fields in the form\n• Review your entries before saving\n• Check for any validation messages\n\n**Pro tip:** Required fields are usually marked with an asterisk (*).`;
    }

    if (
      message.includes("edit") ||
      message.includes("modify") ||
      message.includes("update")
    ) {
      return `To edit items in **${context.pageContext.name}**:\n• Click on the row or use the edit button\n• Modify the fields you want to change\n• Save your changes\n• Some changes may require confirmation\n\n**Note:** Some fields might be read-only depending on your permissions.`;
    }

    return `I can help you with **${
      context.pageContext.name
    }**. This section allows you to ${context.pageContext.description.toLowerCase()}. What would you like to do?`;
  };

  // Dashboard-specific responses
  const generateDashboardResponse = (message, context) => {
    if (message.includes("help") || message.includes("what can you do")) {
      return `I can help you with the **${
        context.pageContext.name
      }**:\n\n**Available Features:**\n${context.pageContext.capabilities
        .map((cap) => `• ${cap}`)
        .join(
          "\n"
        )}\n\n**Navigation:**\n• Use the sidebar to access different modules\n• Click on cards or widgets for detailed views\n• Check notifications for important updates\n\n**Try asking:**\n• "How do I navigate to reports?"\n• "What modules are available?"\n• "Show me the system overview"`;
    }

    if (
      message.includes("navigate") ||
      message.includes("go to") ||
      message.includes("access")
    ) {
      return `To navigate in the **${context.pageContext.name}**:\n• Use the **sidebar menu** on the left\n• Click on **module cards** for quick access\n• Use the **breadcrumb navigation** at the top\n• Check the **user menu** for account options\n\n**Available modules:**\n• Reports & Analytics\n• User & Role Management\n• Member Profiles\n• Claims & Correspondence\n• Finance & Payments`;
    }

    return `I can help you navigate and use the **${context.pageContext.name}**. This is your central hub for accessing all system features. What would you like to explore?`;
  };

  // Finance-specific responses
  const generateFinanceResponse = (message, context) => {
    if (message.includes("help") || message.includes("what can you do")) {
      return `I can help you with **${
        context.pageContext.name
      }**:\n\n**Available Features:**\n${context.pageContext.capabilities
        .map((cap) => `• ${cap}`)
        .join("\n")}\n\n**Data Types:** ${context.pageContext.dataTypes.join(
        ", "
      )}\n\n**Try asking:**\n• "How do I process a payment?"\n• "Show me outstanding balances"\n• "Generate a financial report"`;
    }

    if (message.includes("payment") || message.includes("process")) {
      return `To process payments in **${context.pageContext.name}**:\n• Navigate to the payment processing section\n• Enter member details and payment amount\n• Select payment method and date\n• Review and confirm the transaction\n• Generate payment receipts\n\n**Note:** Ensure you have the necessary permissions for financial transactions.`;
    }

    return `I can help you with **${context.pageContext.name}**. This section handles all financial operations including payments, transactions, and reports. What would you like to do?`;
  };

  // General responses
  const generateGeneralResponse = (message, context) => {
    if (message.includes("help") || message.includes("what can you do")) {
      return `I'm your AI assistant for the membership management system. I can help you with:\n\n**Current Page:** ${context.pageContext.name}\n**Description:** ${context.pageContext.description}\n\n**General Capabilities:**\n• Navigate between different sections\n• Get help with current features\n• Understand data and reports\n• Provide system guidance\n\n**Try asking:**\n• "How do I use this page?"\n• "What features are available?"\n• "How do I navigate to other sections?"`;
    }

    if (
      message.includes("navigate") ||
      message.includes("go to") ||
      message.includes("menu")
    ) {
      return `To navigate the system:\n• Use the **sidebar menu** on the left\n• Click on **module icons** for quick access\n• Use the **breadcrumb navigation** at the top\n• Check the **user menu** for account options\n\n**Main sections:**\n• Dashboard - System overview\n• Reports - Analytics and insights\n• Management - Users, roles, permissions\n• Members - Profiles and data\n• Finance - Payments and transactions`;
    }

    return `I can help you with the **${context.pageContext.name}**. ${context.pageContext.description} What would you like to know or do?`;
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: generateAIResponse(chatInput),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setChatLoading(false);
    }, 1000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear chat
  const clearChat = () => {
    setChatMessages([
      {
        id: 1,
        type: "bot",
        content:
          "Hello! I'm your AI assistant. I can help you with data analysis, navigation, and insights based on your current view. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
  };

  // Show chatbot
  const showChatbot = () => {
    setChatVisible(true);
  };

  // Hide chatbot
  const hideChatbot = () => {
    setChatVisible(false);
  };

  const value = {
    chatVisible,
    chatMessages,
    chatInput,
    chatLoading,
    chatEndRef,
    setChatInput,
    setChatVisible,
    handleSendMessage,
    handleKeyPress,
    clearChat,
    showChatbot,
    hideChatbot,
    getCurrentPageContext,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
      <GlobalChatbot />
    </ChatbotContext.Provider>
  );
};

// Global Chatbot Component
const GlobalChatbot = () => {
  const {
    chatVisible,
    chatMessages,
    chatInput,
    chatLoading,
    chatEndRef,
    setChatInput,
    setChatVisible,
    handleSendMessage,
    handleKeyPress,
    clearChat,
    hideChatbot,
    getCurrentPageContext,
  } = useChatbot();

  const currentContext = getCurrentPageContext();

  return (
    <>
      {/* AI Chatbot Button */}
      <Button
        type="primary"
        shape="circle"
        icon={<RobotOutlined />}
        size="large"
        className="ai-chatbot-button"
        onClick={() => setChatVisible(true)}
        title={`AI Assistant - ${currentContext.name}`}
      />

      {/* Floating Chat Window */}
      {chatVisible && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "100px",
            width: "380px",
            height: "500px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e2e8f0",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #215e97 0%, #1a4d7a 100%)",
              color: "white",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Avatar
                icon={<RobotOutlined />}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: "16px" }}>
                  AI Assistant
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  {currentContext.name}
                </div>
              </div>
            </div>
            <Space>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={clearChat}
                size="small"
                style={{ color: "white" }}
                title="Clear chat"
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={hideChatbot}
                size="small"
                style={{ color: "white" }}
                title="Close chat"
              />
            </Space>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#fafafa",
            }}
          >
            <List
              dataSource={chatMessages}
              renderItem={(message) => (
                <List.Item style={{ border: "none", padding: "8px 0" }}>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection:
                        message.type === "user" ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <Avatar
                      size="small"
                      style={{
                        background:
                          message.type === "user"
                            ? "linear-gradient(135deg, #215e97 0%, #1a4d7a 100%)"
                            : "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                        color: message.type === "user" ? "white" : "#374151",
                        flexShrink: 0,
                      }}
                    >
                      {message.type === "user" ? "U" : <RobotOutlined />}
                    </Avatar>
                    <div
                      style={{
                        maxWidth: "80%",
                        background:
                          message.type === "user"
                            ? "linear-gradient(135deg, #215e97 0%, #1a4d7a 100%)"
                            : "white",
                        color: message.type === "user" ? "white" : "#374151",
                        padding: "12px 16px",
                        borderRadius: "16px",
                        border:
                          message.type === "user"
                            ? "none"
                            : "1px solid #e2e8f0",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        boxShadow:
                          message.type === "user"
                            ? "0 2px 8px rgba(33, 94, 151, 0.2)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </List.Item>
              )}
            />
            {chatLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 0",
                  color: "#666",
                }}
              >
                <Avatar
                  size="small"
                  style={{
                    background:
                      "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                    color: "#374151",
                  }}
                >
                  <RobotOutlined />
                </Avatar>
                <div
                  style={{
                    background: "white",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Spin size="small" /> Analyzing page context...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #e2e8f0",
              background: "white",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <Input.TextArea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about ${currentContext.name.toLowerCase()}...`}
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{
                  flex: 1,
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  background:
                    "linear-gradient(135deg, #215e97 0%, #1a4d7a 100%)",
                  border: "none",
                  alignSelf: "flex-end",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      )}
    </>
  );
};
