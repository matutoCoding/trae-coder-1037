import { message } from 'antd';

export interface RequestOptions {
  showLoading?: boolean;
  showSuccess?: boolean;
  showError?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

type ApiMethod = (...args: unknown[]) => Promise<unknown>;

class Request {
  private async execute<T>(
    method: ApiMethod,
    args: unknown[],
    options: RequestOptions = {}
  ): Promise<T> {
    const { showError = true, showSuccess = false, successMessage, errorMessage } = options;

    try {
      if (!window.electronAPI) {
        throw new Error('Electron API 不可用，请确保在 Electron 环境中运行');
      }

      const result = await method(...args);

      if (showSuccess && successMessage) {
        message.success(successMessage);
      }

      return result as T;
    } catch (error) {
      const err = error as Error;
      const errorMsg = errorMessage || err.message || '操作失败';

      if (showError && err.message !== '请求已取消') {
        message.error(errorMsg);
      }

      throw new Error(errorMsg);
    }
  }

  public get<T>(
    resource: keyof Omit<ElectronAPI, 'platform' | 'statistics'>,
    action: 'list' | 'get',
    args: unknown[],
    options?: RequestOptions
  ): Promise<T> {
    const api = window.electronAPI[resource];
    const method = api[action] as ApiMethod;
    return this.execute<T>(method.bind(api), args, options || {});
  }

  public post<T>(
    resource: keyof Omit<ElectronAPI, 'platform' | 'statistics'>,
    action: 'create',
    args: unknown[],
    options?: RequestOptions
  ): Promise<T> {
    const api = window.electronAPI[resource];
    const method = api[action] as ApiMethod;
    return this.execute<T>(method.bind(api), args, options || {});
  }

  public put<T>(
    resource: keyof Omit<ElectronAPI, 'platform' | 'statistics'>,
    action: 'update',
    args: unknown[],
    options?: RequestOptions
  ): Promise<T> {
    const api = window.electronAPI[resource];
    const method = api[action] as ApiMethod;
    return this.execute<T>(method.bind(api), args, options || {});
  }

  public delete<T>(
    resource: keyof Omit<ElectronAPI, 'platform' | 'statistics'>,
    action: 'delete',
    args: unknown[],
    options?: RequestOptions
  ): Promise<T> {
    const api = window.electronAPI[resource];
    const method = api[action] as ApiMethod;
    return this.execute<T>(method.bind(api), args, options || {});
  }
}

const request = new Request();

export default request;
