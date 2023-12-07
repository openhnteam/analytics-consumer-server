import { Request } from "express";
import { Options } from "pino-http";
import pino from "pino";
import * as FileStreamRotator from "file-stream-rotator";
import { ConfigService } from "@nestjs/config";
import { resolve } from "path";

export async function getLogConfig(configService: ConfigService) {
  const level = configService.get<string>("log.level");
  const filename = configService.get<string>("log.filepath");
  const streams = [
    { stream: process.stdout },
    {
      stream: FileStreamRotator.getStream({
        filename:
          process.env.NODE_ENV === "development"
            ? resolve("./") + filename
            : filename,
      }),
    },
  ];

  return {
    pinoHttp: {
      name: "analytics",
      level,
      // install 'pino-pretty' package in order to use the following option
      // transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      transport: undefined,
      useLevelLabels: true,
      serializers: {
        req: (req: Request) => {
          return req;
        },
      },
      autoLogging: {
        ignore: (req) => true,
      },
      /* customProps: (req: Request, res: Response) => {
        // 在日志中增加额外的属性
        return {
          url: req.url,
          status: res.status,
          traceId: req.id
        }
      }, */
      stream: pino.multistream(streams),
      // quietReqLogger: true,
      // and all the others...
    } as Options,
  };
}
