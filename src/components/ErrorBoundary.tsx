import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { t } from '@/constants/translations'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4" role="alert">
          <AlertTriangle className="text-warning-orange mb-4" size={48} />
          <h2 className="text-lg font-semibold text-dark-gray mb-2">
            {t.common.error}
          </h2>
          <p className="text-medium-gray text-sm mb-6 text-center max-w-md">
            {this.state.error?.message}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-lg bg-primary-mint px-4 py-2 text-sm font-medium text-dark-gray hover:bg-primary-mint-light transition-colors"
          >
            <RefreshCw size={16} />
            {t.common.retry}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
