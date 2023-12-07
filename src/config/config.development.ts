export default {
  mode: "development",
  mysql: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    driver: 'mysql2',
    username: 'root',
    password: 'hello.openhn666',
    timezone: '+08:00',
    database: 'analytics',
    charset: 'UTF8_GENERAL_CI'
    // synchronize: true
  },
  clickhouse: {
    host: "http://localhost:8123",
    database: "analytics",
    username: "root",
    password: "hello.openhn666",
  },
  log: {
    //日志级别 info / debug / error
    level: "info",
    filepath: "logs/analytics.log",
  },
  kafka: {
    clientId: "analytics-clientId",
    brokers: ["localhost:9092"],
  },
  locationAppCode: ''
};
