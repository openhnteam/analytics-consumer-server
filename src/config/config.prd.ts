export default {
  mode: "prod",
  mysql: {
    type: 'mysql',
    host: '',
    port: 3306,
    driver: 'mysql2',
    username: '',
    password: '',
    timezone: '+08:00',
    database: '',
    charset: 'UTF8_GENERAL_CI'
    // synchronize: true
  },
  clickhouse: {
    host: "",
    database: "",
    username: "",
    password: "",
  },
  log: {
    //日志级别 info / debug / error
    level: "info",
    filepath: "logs/analytics.log",
  },
  kafka: {
    clientId: "analytics-clientId",
    brokers: [""],
  },
  locationAppCode: ''
};
