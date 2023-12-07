export class BaseResponse {
  success: boolean;
  data: any;
  message?: string;
  statusCode?: number;

  static success(data): BaseResponse {
    const res = new BaseResponse();
    res.data = data;
    res.success = true;
    res.statusCode = 0;
    return res;
  }

  static failed(message: string, statusCode?: number): BaseResponse {
    const res = new BaseResponse();
    res.message = message;
    res.statusCode = statusCode;
    res.success = false;
    return res;
  }
}

export class BaseService {
  responseSuccess(data: any): BaseResponse {
    return BaseResponse.success(data);
  }

  responseFailed(data: any): BaseResponse {
    return BaseResponse.failed(data);
  }
}
