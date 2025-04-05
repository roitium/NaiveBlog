// Chinese [zh]
import dayjs from 'dayjs'

const locale = {
  name: 'zh',
  weekdays: [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ],
  weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],
  months: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ],
  monthsShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  ordinal: (number, period) => {
    switch (period) {
      case 'W':
        return `${number}周`
      default:
        return `${number}日`
    }
  },
  weekStart: 1,
  yearStart: 4,
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY/MM/DD',
    LL: 'YYYY年M月D日',
    LLL: 'YYYY年M月D日Ah点mm分',
    LLLL: 'YYYY年M月D日ddddAh点mm分',
    l: 'YYYY/M/D',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日dddd HH:mm',
  },
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '几秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年',
  },
  meridiem: (hour, minute) => {
    const hm = hour * 100 + minute
    if (hm < 600) {
      return '凌晨'
    }
    if (hm < 900) {
      return '早上'
    }
    if (hm < 1100) {
      return '上午'
    }
    if (hm < 1300) {
      return '中午'
    }
    if (hm < 1800) {
      return '下午'
    }
    return '晚上'
  },
  calendar: {
    lastDay: '[昨天] LT', // 例如：昨天 15:30
    sameDay: '[今天] LT', // 例如：今天 09:20 (这个原本就是中文)
    nextDay: '[明天] LT', // 例如：明天 18:00
    lastWeek: '[上周]dd LT', // 例如：上周一 14:05 (dddd 会被替换成具体的星期几)
    nextWeek: '[下周]dd LT', // 例如：下周日 10:00 (dddd 会被替换成具体的星期几)
    sameElse: 'L', // 使用本地化的日期格式，例如：2024/03/15 或 YYYY年MM月DD日 (具体取决于你的 Day.js 本地化设置)
  },
}

dayjs.locale(locale, null, true)

export default locale
