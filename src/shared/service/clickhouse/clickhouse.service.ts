import { Injectable, Logger } from "@nestjs/common";
import { ClickHouseClient, DataFormat, createClient } from "@clickhouse/client";
import { NodeClickHouseClientConfigOptions } from "@clickhouse/client/dist/client";

@Injectable()
export class ClickhouseService {
  private client: ClickHouseClient;
  private logger = new Logger(ClickhouseService.name);

  constructor(private options: NodeClickHouseClientConfigOptions) {
    this.client = createClient(options);
  }

  async create(query: string): Promise<boolean> {
    try {
      await this.client.exec({ query });
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
  async query(query: string, format?: DataFormat): Promise<any> {
    const resultSet = await this.client.query({ query, format });
    const dataSet = await resultSet.json();
    const data = dataSet["data"];
    if (Array.isArray(data) && data.length == 1) {
      return data[0]
    }
    return data
  }

  async insert<T>(table: string, data: T[]): Promise<{ success: boolean, error?: string }> {
    try {
      await this.client.insert({
        table,
        values: data,
        format: "JSONEachRow",
      });
      return { success: true };
    } catch (error) {
      this.logger.error(error);
      return { success: false };
    }
  }
}
