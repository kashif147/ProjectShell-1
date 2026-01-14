import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isChunkError: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error
    const isChunkError = 
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch dynamically imported module');
    
    return { 
      hasError: true, 
      isChunkError,
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // If it's a chunk error, try to reload after a delay
    if (this.state.isChunkError || 
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Loading chunk')) {
      // Auto-retry after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column'
          }}>
            <Result
              status="warning"
              title="Loading Application..."
              subTitle="The application is being reloaded. Please wait..."
            />
          </div>
        );
      }

      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          padding: '20px'
        }}>
          <Result
            status="500"
            title="500"
            subTitle="Sorry, something went wrong."
            extra={
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


