export class resultDto {
  result: any;
  error: string;

  constructor(result: any, error: string) {
    this.result = result;
    this.error = error;
  }
}
