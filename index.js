/* screener data */

import { scrapFinviz } from './finviz.js';
import { Client } from "@apperate/iexjs";
import axios from "axios";
import yahooFinance from "yahoo-finance2";
import fs from "fs";

async function title() {
  console.log(
  "\x1b[38;5;74m\n"
  +"  __ _              _     __\n"
  +" / _\\ |_ ___  _ __ | | __/ _\\ ___ _ __ ___  ___ _ __   ___ _ __\n"
  +" \\ \\| __/ _ \\| '_ \\| |/ /\\ \\ / __| '__/ _ \\/ _ \\ '_ \\ / _ \\ '__|\n"
  +" _\\ \\ || (_) | | | |   < _\\ \\ (__| | |  __/  __/ | | |  __/ |   \n"
  +" \\__/\\__\\___/|_| |_|_|\\_\\\\__/\\___|_|  \\___|\\___|_| |_|\\___|_|\n"
  +"\n\n\x1b[0m");
}

function createDataFile() {
  if (!fs.existsSync("./data")){
      fs.mkdirSync("./data");
  }
  if (!fs.existsSync("./data/data.json")) {
      fs.writeFileSync("./data/data.json", "[]")
  }
}

function updateTicker(data) {
  try {
    if (!data?.ticker) return;
    let content = JSON.parse(fs.readFileSync("./data/data.json"));
    let found = false;
    for (let idx in content) {
      if (content[idx].ticker === data.ticker) {
        content[idx] = data;
        found = true
      }
    }
    if (!found) {
      content.push(data);
    }
    fs.writeFileSync("./data/data.json", JSON.stringify(content, null, 4));
    return;
  } catch(e) {
    console.error(e);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTickers() {
  const tickerUrl = "https://www.sec.gov/files/company_tickers.json";
  try {
    let tickerArray = [];

    const response = await axios.get(tickerUrl);
    for (let idx in response.data) {
      tickerArray.push(response.data[idx]);
    }

    return tickerArray;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function getYahooData(value) {
  return new Promise((resolve, reject) => {

    yahooFinance.setGlobalConfig({
      queue: {
          concurrency: 500,
        }
    });
    
    yahooFinance.quote(value.ticker).then((data) => {
      resolve({
        ticker: value.ticker,
        name: value.title,
        dividend: data?.trailingAnnualDividendYield ? data.trailingAnnualDividendYield : 0,
        exchange: data?.fullExchangeName ? data.fullExchangeName : 0,
        firstTradeDate: data?.firstTradeDateMilliseconds ? new Date(data.firstTradeDateMilliseconds).getTime() : null
      });
    }).catch((e) => {
      console.log(e);
      resolve();
    });
  })
}

function percentNum(value) {
  let num = parseFloat(value.replace('%',''))
  num = isNaN(num) ? 0 : num;
  return num;
}

function percentShort(value) {
  const tab = value.split(" / ");
  let num = parseFloat(tab[0].replace('%',''));
  num = isNaN(num) ? 0 : num;
  return num;
}

async function getFinvizData(value) {
  return new Promise(async (resolve, reject) => {
    if (!value?.ticker || value.exchange == 'Other OTC') {
      return resolve(value);
    }
    scrapFinviz(value?.ticker).then((data) => {
      value.index = data['Index'] ;
      value.merket_cap = data['Market Cap'] ;
      value.income = data['Income'] ;
      value.sales = data['sales'] ;
      value.book_sh = data['Book/sh'] ;
      value.cash_sh = data['Cash/sh'] ;
      value.dividend = parseFloat(data['Dividend']) ;
      value.dividend_yield = percentNum(data['Dividend %']) ;
      value.employes = parseInt(data['Employees']) ;
      value.option = data['Optionable'] ;
      value.short = data['Shortable'] ;
      value.analyst_note = data['Recom'] ;
      value.pe = data['P/E'] ;
      value.fpe = data['Forward P/E'] ;
      value.peg = data['PEG'] ;
      value.ps = data['P/S	'] ;
      value.pb = data['P/B	'] ;
      value.pc = data['P/C	'] ;
      value.pfcf = data['P/FCF	'] ;
      value.quick_ratio = data['Quick Ratio'] ;
      value.current_ratio = data['Current Ratio'];
      value.debt_eq = data['Debt/Eq'] ;
      value.debt_long_eq = data['LT Debt/Eq'] ;
      value.sma20 = data['SMA20'] ; 
      value.eps = data['EPS (ttm)'] ;
      value.eps_next_y = data['EPS next Y'] ;
      value.eps_next_q = data['EPS next Q'] ;
      value.eps_y = data['EPS this Y	'] ;
      value.eps_growth_next_y = data['EPS next Y'] ;
      value.eps_growth_next_5y = data['EPS next 5Y'] ;
      value.eps_growth_past_5y = data['EPS past 5Y'] ;
      value.sales_growth_past_5y = data['Sales past 5Y'] ;
      value.sales_growth_past_q = data['Sales Q/Q'] ;
      value.eps_growht_past_q = data['EPS Q/Q'] ;
      value.earnings_date = data['Earnings'] ;
      value.sma50 = data['SMA50'] ;
      value.insiders_own = data['Insider Own'] ;
      value.insiders_transaction = data['Insider Trans'] ;
      value.institutionals_own = data['Inst Own'] ;
      value.institutionals_transactions = data['Inst Trans'] ;
      value.roa = data['ROA'] ;
      value.roe = data['ROE'] ;
      value.roi = data['ROI'] ;
      value.gross_margin = data['Gross Margin'] ;
      value.operating_margin = data['Oper. Margin'] ;
      value.profit_margin = data['Profit Margin'] ;
      value.payout = data['Payout'] ;
      value.sma200 = data['SMA200	'] ;
      value.shares_oustandind = data['Shs Outstand'] ;
      value.shares_float = data['Shs Float	'] ;
      value.short_ratio = percentShort(data['Short Float / Ratio']);
      value.short_interest = data['Short Interest'] ;
      value.target_price = data['Target Price'] ;
      value.range_52w = data['52W Range'] ;
      value.range_52w_high = data['52W High'] ;
      value.range_52w_low = data['52W Low'] ;
      value.rsi = data['RSI (14)	'] ;
      value.relative_volume = data['Rel Volume'] ;
      value.average_volume = data['Avg Volume'] ;
      value.volume = data['Volume'] ;
      value.perf_w = data['Perf Week'] ;
      value.perf_m = data['Perf Month'] ;
      value.perf_q = data['Perf Quarter'] ;
      value.perf_6m = data['Perf Half Y'] ;
      value.perf_y = data['Perf Year'] ;
      value.perf_ytd = data['Perf YTD'] ;
      value.beta = data['Beta'] ;
      value.atr = data['ATR'] ;
      value.volatility = data['Volatility'] ;
      value.prev_close = data['Prev Close'] ;
      value.price = data['Price'] ;
      value.change = data['Change'] ;
      resolve(value)
    }).catch((e) => {
      console.log('ERROR '+value.exchange+':'+value.ticker+' '+e.message);
      resolve(value);
    })
  }) 
}

async function getChunk() {
  const nb = 10;

  let tickers = await getTickers();
  let tickerChunks = [];
  let chunk = [];

  for (let i = 0; i < tickers.length; i++) {
    chunk.push(tickers[i]);
    if (i%nb == 0 && i) {
      tickerChunks.push(chunk);
      chunk = [];
    }
  }

  return tickerChunks;
}

async function getAllData() {
  let count = 1;
  let dataArray = [];
  let tickerChunks = await getChunk();
  let chunk = [];
  
  console.clear();
  title();

  for (chunk of tickerChunks) {
    await new Promise((resolve, reject) => {
      chunk.forEach(async (value, index, array) => {
        await sleep(Math.floor(Math.random() * 3000));
        let data = await getYahooData(value);
        // const overview = await getCompanyOverview(value.ticker);
        data = await getFinvizData(data);
        // data = await getIexData(value);
        dataArray.push(data);
        updateTicker(data);
        if (index === array.length -1) resolve();
      });
    });
    console.log(`${count} / ${tickerChunks.length}`)
    count++;
    await sleep(1500);
  }

  return dataArray;
}

async function sortTickersByDividends(dataArray) {
  let dividendTable = [];

  console.clear();
  title();
  
  try {    
    console.log(dataArray);
    dataArray = dataArray.filter((elem) => elem?.exchange != 'Other OTC'); // exclude Other OTC
    let sortedArray = dataArray.sort((a, b) => b.dividend - a.dividend);

    for (let i = 0; i < 200; i++) {
      let obj = sortedArray[i];
      dividendTable.push(obj);
    }

    console.table(dividendTable)
    console.log(dataArray.length+ ' tickers');
  } catch(e) {
    console.log("ERROR 2", e);
  }
}

async function sortTickersByShort(dataArray) {
  let dividendTable = [];

  console.clear();
  title();
  
  try {    
    console.log(dataArray);
    dataArray = dataArray.filter((elem) => elem?.exchange != 'Other OTC'); // exclude Other OTC
    dataArray = dataArray.filter((elem) => elem?.short_ratio); // exclude Other OTC
    let sortedArray = dataArray.sort((a, b) => b.short_ratio - a.short_ratio);

    for (let i = 0; i < 200; i++) {
      let obj = sortedArray[i];
      dividendTable.push({
        ticker: obj.ticker,
        name: obj.name,
        exchange: obj.exchange,
        short_ratio: obj.short_ratio
      });
    }

    console.table(dividendTable)
    console.log(dataArray.length+ ' tickers');
  } catch(e) {
    console.log("ERROR 2", e);
  }
}

async function run() {
  createDataFile();
  process.setMaxListeners(0);
  await getAllData();
  const dataArray = JSON.parse(fs.readFileSync('./data/data.json'));
  sortTickersByShort(dataArray);
}

run();
