
import { RequestOption } from './RequestOption';
export interface ResponseOptions {
    data: any;
    header: any;
    statusCode: number;
    options: RequestOption;
    errMsg?: any;
}