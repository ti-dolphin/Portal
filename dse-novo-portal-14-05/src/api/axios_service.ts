import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { urlPainel } from 'src/config';

export default class AxiosService {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = localStorage.getItem('accessToken');
  private refreshToken: string | null = localStorage.getItem('refreshToken');

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.REACT_APP_BASE_URL,
      headers: {
        'authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.response.use(
      (value) => this.handleSuccessResponse(value),
      (error) => this.handleErrorResponse(error)
    );
  }

  private handleSuccessResponse(response: AxiosResponse) {
    return response.data;
  }

  private async handleErrorResponse(error: AxiosError) {
    if (error.response && error.response.status === 401) {
      try {  
        if (!this.refreshToken) {
          console.error(error);
          return Promise.reject(error);
        }
        const headers: AxiosRequestHeaders = { 
          'authorization': `Bearer ${this.refreshToken}`, 
          'Content-Type': 'application/json'
        };
        const response = await this.axiosInstance.get('/auth/getNewToken', { headers: headers });
        if (response) {
          const { accessToken, refreshToken } = response as any;
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          error.config!.headers!['authorization'] = `Bearer ${accessToken}`;
          return this.axiosInstance(error.config);
        }
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    } else if (error.response && error.response.status === 403) {
      this.deleteTokens();
      window.location.href = `${urlPainel}/login`;
      console.error(error);
      return Promise.reject(error);
    } else {
      console.error(error);
      return Promise.reject(error);
    }
  }

  public setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  public deleteTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken = null;
    this.refreshToken = null;
  }

  public async get(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosInstance.get<AxiosResponse>(url, config);
  }

  public async post(url: string, data: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosInstance.post<AxiosResponse>(url, data, config);
  }

  public async put(url: string, data: any, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosInstance.put<AxiosResponse>(url, data, config);
  }

  public async delete(url: string, config?: AxiosRequestConfig): Promise<any> {
    return this.axiosInstance.delete<AxiosResponse>(url, config);
  }
}
