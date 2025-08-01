import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cs2Theme } from '../theme/cs2Theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR_BOUNDARY] App crashed:', error);
    console.error('[ERROR_BOUNDARY] Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In production, report to crash analytics
    if (process.env.NODE_ENV === 'production') {
      // TODO: Report to Sentry, Bugsnag, or Firebase Crashlytics
      console.error('[PRODUCTION_ERROR]', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Tactical Error Detected</Text>
            <Text style={styles.message}>
              The application encountered an unexpected error. 
              Your mission data has been preserved.
            </Text>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.restartButton} 
              onPress={this.handleRestart}
            >
              <Text style={styles.restartButtonText}>RESTART MISSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cs2Theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: cs2Theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: cs2Theme.colors.surface.primary,
    borderRadius: cs2Theme.borderRadius.lg,
    padding: cs2Theme.spacing.xl,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: cs2Theme.colors.danger.primary,
  },
  title: {
    ...cs2Theme.typography.heading2,
    color: cs2Theme.colors.danger.primary,
    textAlign: 'center',
    marginBottom: cs2Theme.spacing.md,
  },
  message: {
    ...cs2Theme.typography.body,
    color: cs2Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: cs2Theme.spacing.lg,
    lineHeight: 24,
  },
  debugInfo: {
    backgroundColor: cs2Theme.colors.background.secondary,
    borderRadius: cs2Theme.borderRadius.sm,
    padding: cs2Theme.spacing.md,
    marginBottom: cs2Theme.spacing.lg,
  },
  debugTitle: {
    ...cs2Theme.typography.bodyBold,
    color: cs2Theme.colors.text.secondary,
    marginBottom: cs2Theme.spacing.sm,
  },
  debugText: {
    ...cs2Theme.typography.caption,
    color: cs2Theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
  restartButton: {
    backgroundColor: cs2Theme.colors.primary.main,
    borderRadius: cs2Theme.borderRadius.md,
    paddingVertical: cs2Theme.spacing.md,
    paddingHorizontal: cs2Theme.spacing.lg,
    alignItems: 'center',
  },
  restartButtonText: {
    ...cs2Theme.typography.buttonPrimary,
    color: cs2Theme.colors.text.inverse,
  },
});

export default ErrorBoundary;