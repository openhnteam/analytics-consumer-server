export function isEmpty(val: any) {
  switch (Object.prototype.toString.call(val)) {
    case "[object Null]":
    case "[object Undefined]":
      return true;
    case "[object Number]":
    case "[object Boolean]":
      return false;
    case "[object String]":
    case "[object Array]":
      return !val.length;
    case "[object Map]":
    case "[object Set]":
    case "[object File]":
      return !val.size;
    case "[object Object]":
      return !Object.keys(val).length;
    // other
    default:
      return false;
  }
  
}
//判断是否是个ip地址
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

//判断ip地址是否是内网
export function isPrivateIP(ip: string): boolean {
  // 内网 IP 地址的正则表达式
  const privateIPRegex = /^(10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|127\.|0\.)/

  // 将 IP 地址与内网 IP 正则表达式进行匹配
  return privateIPRegex.test(ip)
}
