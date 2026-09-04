# DigitalOracle - 金融数字全球监控引擎

## 1. 插件概述

`DigitalOracle` 是基于 Digital Oracle 上游量化金融分析库封装的高性能 VCP 同步插件。它赋予 AI 智能体实时探查全球宏观经济指标、预测市场概率、主权债务收益率曲线、大宗商品、加密货币衍生品期限结构以及股票期权链等多维量化金融数据的能力。

### 核心特性
- **全球多维信源矩阵**：统一聚合 15+ 专业金融数据提供方，涵盖传统金融、宏观经济与 Web3 加密资产。
- **两级按需探测**：
  1. 通过 `ListProviders` 探索当前可用的信源列表、能力范围及调用参数说明。
  2. 通过 `FetchMarketData` 定向获取单个信源的深度明细。
- **全景宏观大盘（一键聚合）**：通过 `GetGlobalMacroDashboard` 命令并发拉取全球风险资产、美联储加息概率、恐惧贪婪指数、美债收益率及央行基准利率。
- **标准 Python stdio 架构**：超时设定为 180s，保障并发外网数据拉取稳定性。

---

## 2. 命令列表与参数说明

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `ListProviders` / `DigitalOracleListProviders` | 列出全部受支持的金融信源及其用途 | 无参数 |
| `FetchMarketData` / `DigitalOracleFetchMarketData` | 定向抓取指定信源的实时/历史金融数据 | `provider` / `source` (string, 必填): 信源标识（见下表）<br>`params` (JSON string, 可选): 信源专有参数对象<br>*(或将 `symbol`, `interval`, `limit`, `coin_ids` 等作为顶层参数直接平铺)* |
| `GetGlobalMacroDashboard` / `DigitalOracleGlobalMacroDashboard` | 一键并发拉取全球宏观金融监控大盘快照 | `risk_assets` (array/string, 可选, 默认 `SPY,QQQ,GC=F,CL=F,BTC-USD`)<br>`coin_ids` (array/string, 可选, 默认 `bitcoin,ethereum`)<br>`countries` (array/string, 可选, 默认 `US,CN,JP,EU`) |

### 支持的数据提供方 (`provider`) 一览：
- `yahoo`：股票、ETF、大宗商品（如 `GC=F` 黄金、`CL=F` 原油）、外汇历史
- `polymarket`：Polymarket 预测市场事件预测概率
- `kalshi`：美国 CFTC 监管的 Kalshi 事件合约
- `treasury`：美国财政部国债收益率曲线
- `cftc`：CFTC 期货持仓委员会机构持仓报告
- `coingecko`：加密货币现货价格、市值与行情
- `deribit_futures`：Deribit 加密期货期限结构
- `deribit_options`：Deribit 期权链与隐含波动率 (IV)
- `fear_greed`：CNN 市场情绪恐惧与贪婪指数
- `cme_fedwatch`：CME 联储观察工具隐含的 FOMC 利率决议概率
- `worldbank`：世界银行宏观经济统计
- `bis`：国际清算银行各主要央行政策利率
- `yfinance_options`：美股期权链、Greeks 与 IV 结构
- `edgar`：美国 SEC 内部人交易报表 (Form 4)

---

## 3. VCP 标准界定符调用示例

### 3.1 查看受支持信源列表
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DigitalOracle「末」,
command:「始」ListProviders「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 抓取 Yahoo 纽约金主力合约行情 (`GC=F`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DigitalOracle「末」,
command:「始」FetchMarketData「末」,
provider:「始」yahoo「末」,
symbol:「始」GC=F「末」,
interval:「始」1d「末」,
limit:「始」30「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 查询 Polymarket 预测事件
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DigitalOracle「末」,
command:「始」FetchMarketData「末」,
provider:「始」polymarket「末」,
params:「始」{"slug_contains":"fed-rate-cut","limit":5}「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.4 拉取全球宏观监控大盘
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DigitalOracle「末」,
command:「始」GetGlobalMacroDashboard「末」,
risk_assets:「始」["SPY","QQQ","GC=F","CL=F","BTC-USD"]「末」,
coin_ids:「始」["bitcoin","ethereum","solana"]「末」,
countries:「始」["US","CN","JP","EU"]「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **Python 运行环境**：Python 3.10+。
- **环境配置 (`config.env`)**：
  - `DIGITAL_ORACLE_SEC_EMAIL`：访问 SEC EDGAR 信源时的合法 User-Agent 声明邮箱。
  - `DIGITAL_ORACLE_DEBUG`：设为 `true` 可在返回结果的 `details` 字段中包含详细错误栈。
