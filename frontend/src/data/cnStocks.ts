/**
 * Chinese A-share (沪深) and Hong Kong H-share listed companies dataset.
 * Covers major industries: semiconductor, AI, new energy, biotech, finance, consumer, etc.
 * Format: { code, name, market, industry }
 */

export interface StockItem {
  code: string;       // Stock code, e.g. "688981" or "00981"
  name: string;       // Company short name
  fullName: string;   // Full company name
  market: 'A' | 'H';  // A=A股(沪深), H=港股
  industry: string;    // Industry sector
}

export const CN_STOCKS: StockItem[] = [
  // ═══ 半导体设备 & 材料 ═══
  { code: '688981', name: '中芯国际', fullName: '中芯国际集成电路制造有限公司', market: 'A', industry: '半导体制造' },
  { code: '00981', name: '中芯国际', fullName: '中芯国际集成电路制造有限公司', market: 'H', industry: '半导体制造' },
  { code: '002371', name: '北方华创', fullName: '北方华创科技集团股份有限公司', market: 'A', industry: '半导体设备' },
  { code: '688012', name: '中微公司', fullName: '中微半导体设备（上海）股份有限公司', market: 'A', industry: '半导体设备' },
  { code: '688036', name: '传音控股', fullName: '深圳传音控股股份有限公司', market: 'A', industry: '消费电子' },
  { code: '688396', name: '华峰测控', fullName: '北京华峰测控技术股份有限公司', market: 'A', industry: '半导体设备' },
  { code: '688536', name: '思瑞浦', fullName: '思瑞浦微电子科技（苏州）股份有限公司', market: 'A', industry: '模拟芯片' },
  { code: '300236', name: '上海新阳', fullName: '上海新阳半导体材料股份有限公司', market: 'A', industry: '半导体材料' },
  { code: '688120', name: '华海清科', fullName: '华海清科股份有限公司', market: 'A', industry: '半导体设备' },
  { code: '688072', name: '拓荆科技', fullName: '拓荆科技股份有限公司', market: 'A', industry: '半导体设备' },
  { code: '688707', name: '振华风光', fullName: '振华风光半导体股份有限公司', market: 'A', industry: '半导体器件' },
  { code: '688562', name: '芯盟科技', fullName: '武汉芯盟科技有限公司', market: 'A', industry: '半导体设备' },
  { code: '300373', name: '扬杰科技', fullName: '扬州扬杰电子科技股份有限公司', market: 'A', industry: '半导体器件' },
  { code: '603290', name: '斯达半导', fullName: '嘉兴斯达半导体股份有限公司', market: 'A', industry: '功率半导体' },
  { code: '688261', name: '东微半导', fullName: '江苏东微半导体股份有限公司', market: 'A', industry: '功率半导体' },

  // ═══ 芯片设计 ═══
  { code: '688256', name: '寒武纪', fullName: '中科寒武纪科技股份有限公司', market: 'A', industry: 'AI芯片' },
  { code: '688041', name: '海光信息', fullName: '海光信息技术股份有限公司', market: 'A', industry: 'CPU/GPU芯片' },
  { code: '002049', name: '紫光国微', fullName: '紫光国芯微电子股份有限公司', market: 'A', industry: '安全芯片' },
  { code: '688521', name: '芯原股份', fullName: '芯原微电子（上海）股份有限公司', market: 'A', industry: '芯片设计服务' },
  { code: '603501', name: '韦尔股份', fullName: '上海韦尔半导体股份有限公司', market: 'A', industry: 'CIS芯片' },
  { code: '688008', name: '澜起科技', fullName: '澜起科技股份有限公司', market: 'A', industry: '接口芯片' },
  { code: '300782', name: '卓胜微', fullName: '江苏卓胜微电子股份有限公司', market: 'A', industry: '射频芯片' },
  { code: '688099', name: '晶晨股份', fullName: '晶晨半导体（上海）股份有限公司', market: 'A', industry: 'SoC芯片' },
  { code: '688018', name: '乐鑫科技', fullName: '乐鑫信息科技（上海）股份有限公司', market: 'A', industry: 'WiFi/IoT芯片' },
  { code: '688052', name: '纳芯微', fullName: '纳芯微电子股份有限公司', market: 'A', industry: '模拟芯片' },

  // ═══ AI & 大模型 ═══
  { code: '00020', name: '商汤集团', fullName: '商汤集团股份有限公司', market: 'H', industry: 'AI/计算机视觉' },
  { code: '688047', name: '龙芯中科', fullName: '龙芯中科技术股份有限公司', market: 'A', industry: '自主CPU' },
  { code: '300496', name: '中科创达', fullName: '中科创达软件股份有限公司', market: 'A', industry: '智能操作系统' },
  { code: '688327', name: '云从科技', fullName: '云从科技集团股份有限公司', market: 'A', industry: 'AI/人工智能' },
  { code: '688023', name: '安恒信息', fullName: '杭州安恒信息技术股份有限公司', market: 'A', industry: '网络安全' },
  { code: '002230', name: '科大讯飞', fullName: '科大讯飞股份有限公司', market: 'A', industry: 'AI/语音识别' },
  { code: '300024', name: '机器人', fullName: '沈阳新松机器人自动化股份有限公司', market: 'A', industry: '机器人' },
  { code: '09888', name: '百度集团', fullName: '百度集团股份有限公司', market: 'H', industry: 'AI/互联网' },

  // ═══ 新能源 & 光伏 ═══
  { code: '300750', name: '宁德时代', fullName: '宁德时代新能源科技股份有限公司', market: 'A', industry: '锂电池' },
  { code: '002594', name: '比亚迪', fullName: '比亚迪股份有限公司', market: 'A', industry: '新能源汽车' },
  { code: '01211', name: '比亚迪股份', fullName: '比亚迪股份有限公司', market: 'H', industry: '新能源汽车' },
  { code: '601012', name: '隆基绿能', fullName: '隆基绿能科技股份有限公司', market: 'A', industry: '光伏' },
  { code: '688599', name: '天合光能', fullName: '天合光能股份有限公司', market: 'A', industry: '光伏' },
  { code: '002459', name: '晶澳科技', fullName: '晶澳太阳能科技股份有限公司', market: 'A', industry: '光伏' },
  { code: '300274', name: '阳光电源', fullName: '阳光电源股份有限公司', market: 'A', industry: '光伏逆变器' },
  { code: '002466', name: '天齐锂业', fullName: '天齐锂业股份有限公司', market: 'A', industry: '锂矿' },
  { code: '002460', name: '赣锋锂业', fullName: '赣锋锂业集团股份有限公司', market: 'A', industry: '锂矿' },
  { code: '01772', name: '赣锋锂业', fullName: '赣锋锂业集团股份有限公司', market: 'H', industry: '锂矿' },

  // ═══ 互联网 & 平台 ═══
  { code: '00700', name: '腾讯控股', fullName: '腾讯控股有限公司', market: 'H', industry: '互联网' },
  { code: '09988', name: '阿里巴巴', fullName: '阿里巴巴集团控股有限公司', market: 'H', industry: '互联网/电商' },
  { code: '03690', name: '美团', fullName: '美团', market: 'H', industry: '本地生活/互联网' },
  { code: '09618', name: '京东集团', fullName: '京东集团股份有限公司', market: 'H', industry: '电商/物流' },
  { code: '09999', name: '网易', fullName: '网易公司', market: 'H', industry: '互联网/游戏' },
  { code: '01024', name: '快手', fullName: '快手科技', market: 'H', industry: '短视频/互联网' },
  { code: '09626', name: '哔哩哔哩', fullName: '哔哩哔哩股份有限公司', market: 'H', industry: '视频/社区' },
  { code: '00268', name: '金蝶国际', fullName: '金蝶国际软件集团有限公司', market: 'H', industry: '企业软件' },

  // ═══ 通信 & 电子 ═══
  { code: '000063', name: '中兴通讯', fullName: '中兴通讯股份有限公司', market: 'A', industry: '通信设备' },
  { code: '00763', name: '中兴通讯', fullName: '中兴通讯股份有限公司', market: 'H', industry: '通信设备' },
  { code: '002475', name: '立讯精密', fullName: '立讯精密工业股份有限公司', market: 'A', industry: '消费电子/连接器' },
  { code: '601138', name: '工业富联', fullName: '工业富联股份有限公司', market: 'A', industry: '电子制造' },
  { code: '002236', name: '大华股份', fullName: '浙江大华技术股份有限公司', market: 'A', industry: '安防/视频' },
  { code: '002415', name: '海康威视', fullName: '杭州海康威视数字技术股份有限公司', market: 'A', industry: '安防/AI' },
  { code: '300059', name: '东方财富', fullName: '东方财富信息股份有限公司', market: 'A', industry: '互联网金融' },

  // ═══ 医药 & 生物 ═══
  { code: '600276', name: '恒瑞医药', fullName: '江苏恒瑞医药股份有限公司', market: 'A', industry: '创新药' },
  { code: '300760', name: '迈瑞医疗', fullName: '深圳迈瑞生物医疗电子股份有限公司', market: 'A', industry: '医疗器械' },
  { code: '688180', name: '君实生物', fullName: '上海君实生物医药科技股份有限公司', market: 'A', industry: '创新药' },
  { code: '01801', name: '信达生物', fullName: '信达生物制药', market: 'H', industry: '创新药' },
  { code: '02269', name: '药明生物', fullName: '药明生物技术有限公司', market: 'H', industry: 'CXO/生物药' },
  { code: '300347', name: '泰格医药', fullName: '杭州泰格医药科技股份有限公司', market: 'A', industry: 'CRO' },
  { code: '000538', name: '云南白药', fullName: '云南白药集团股份有限公司', market: 'A', industry: '中药' },

  // ═══ 金融 ═══
  { code: '601318', name: '中国平安', fullName: '中国平安保险（集团）股份有限公司', market: 'A', industry: '保险' },
  { code: '02318', name: '中国平安', fullName: '中国平安保险（集团）股份有限公司', market: 'H', industry: '保险' },
  { code: '600036', name: '招商银行', fullName: '招商银行股份有限公司', market: 'A', industry: '银行' },
  { code: '03968', name: '招商银行', fullName: '招商银行股份有限公司', market: 'H', industry: '银行' },
  { code: '601688', name: '华泰证券', fullName: '华泰证券股份有限公司', market: 'A', industry: '证券' },
  { code: '06886', name: '华泰证券', fullName: '华泰证券股份有限公司', market: 'H', industry: '证券' },
  { code: '600030', name: '中信证券', fullName: '中信证券股份有限公司', market: 'A', industry: '证券' },
  { code: '06030', name: '中信证券', fullName: '中信证券股份有限公司', market: 'H', industry: '证券' },
  { code: '601166', name: '兴业银行', fullName: '兴业银行股份有限公司', market: 'A', industry: '银行' },

  // ═══ 消费 & 白酒 ═══
  { code: '600519', name: '贵州茅台', fullName: '贵州茅台酒股份有限公司', market: 'A', industry: '白酒' },
  { code: '000858', name: '五粮液', fullName: '宜宾五粮液股份有限公司', market: 'A', industry: '白酒' },
  { code: '000568', name: '泸州老窖', fullName: '泸州老窖股份有限公司', market: 'A', industry: '白酒' },
  { code: '600887', name: '伊利股份', fullName: '内蒙古伊利实业集团股份有限公司', market: 'A', industry: '乳制品' },
  { code: '603259', name: '药明康德', fullName: '药明康德新药开发股份有限公司', market: 'A', industry: 'CXO' },
  { code: '02359', name: '药明康德', fullName: '药明康德新药开发股份有限公司', market: 'H', industry: 'CXO' },

  // ═══ 军工 & 航天 ═══
  { code: '600893', name: '航发动力', fullName: '中国航发动力股份有限公司', market: 'A', industry: '航空发动机' },
  { code: '601989', name: '中国重工', fullName: '中国船舶重工股份有限公司', market: 'A', industry: '船舶/军工' },
  { code: '600760', name: '中航沈飞', fullName: '中航沈飞股份有限公司', market: 'A', industry: '军用飞机' },
  { code: '002179', name: '中航光电', fullName: '中航光电科技股份有限公司', market: 'A', industry: '军工连接器' },

  // ═══ 汽车 ═══
  { code: '09868', name: '小鹏汽车', fullName: '小鹏汽车有限公司', market: 'H', industry: '新能源汽车' },
  { code: '02015', name: '理想汽车', fullName: '理想汽车', market: 'H', industry: '新能源汽车' },
  { code: '09866', name: '蔚来', fullName: '蔚来集团', market: 'H', industry: '新能源汽车' },
  { code: '01958', name: '北京汽车', fullName: '北京汽车股份有限公司', market: 'H', industry: '汽车' },
  { code: '000625', name: '长安汽车', fullName: '重庆长安汽车股份有限公司', market: 'A', industry: '汽车' },
  { code: '601127', name: '赛力斯', fullName: '赛力斯集团股份有限公司', market: 'A', industry: '新能源汽车' },

  // ═══ 先进制造 ═══
  { code: '300124', name: '汇川技术', fullName: '深圳市汇川技术股份有限公司', market: 'A', industry: '工业自动化' },
  { code: '688169', name: '石头科技', fullName: '北京石头世纪科技股份有限公司', market: 'A', industry: '智能硬件' },
  { code: '002008', name: '大族激光', fullName: '大族激光科技产业集团股份有限公司', market: 'A', industry: '激光设备' },
  { code: '300661', name: '圣邦股份', fullName: '圣邦微电子（北京）股份有限公司', market: 'A', industry: '模拟芯片' },

  // ═══ 华为产业链 ═══
  { code: '002241', name: '歌尔股份', fullName: '歌尔股份有限公司', market: 'A', industry: 'VR/声学' },
  { code: '300433', name: '蓝思科技', fullName: '蓝思科技股份有限公司', market: 'A', industry: '玻璃/消费电子' },
  { code: '000100', name: 'TCL科技', fullName: 'TCL科技集团股份有限公司', market: 'A', industry: '面板' },
  { code: '002600', name: '领益智造', fullName: '领益智造股份有限公司', market: 'A', industry: '精密制造' },
];

/**
 * Search stocks by code or name (supports pinyin-like partial match)
 */
export function searchStocks(query: string, limit = 10): StockItem[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return CN_STOCKS
    .filter(s =>
      s.code.includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.industry.toLowerCase().includes(q)
    )
    .slice(0, limit);
}
