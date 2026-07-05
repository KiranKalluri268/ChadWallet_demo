"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Token, Trade } from "@/lib/types";

type TradingViewWindow = Window & {
  TradingView?: {
    widget: new (options: Record<string, unknown>) => { remove?: () => void };
  };
};

type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const libraryPath = "/static/charting_library/";

export function TradingViewChart({ token, trades }: { token: Token; trades: Trade[] }) {
  const containerId = useMemo(() => `tv-chart-${token.address.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`, [token.address]);
  const bars = useMemo(() => buildBars(token, trades), [token, trades]);
  const widgetRef = useRef<{ remove?: () => void } | null>(null);
  const [missingLibrary, setMissingLibrary] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadWidget() {
      const hasLibrary = await tradingViewAssetsExist();

      if (!hasLibrary || cancelled) {
        setMissingLibrary(true);
        return;
      }

      await loadTradingViewScript();

      if (cancelled || !(window as TradingViewWindow).TradingView) {
        return;
      }

      setMissingLibrary(false);
      widgetRef.current?.remove?.();
      widgetRef.current = new (window as TradingViewWindow).TradingView!.widget({
        autosize: true,
        symbol: token.symbol,
        interval: "1",
        container: containerId,
        library_path: libraryPath,
        locale: "en",
        theme: "dark",
        datafeed: createDatafeed(token, bars),
        timezone: "Etc/UTC",
        disabled_features: ["header_symbol_search", "header_compare", "symbol_search_hot_key"],
        enabled_features: ["hide_left_toolbar_by_default"],
        custom_css_url: "/tradingview-chad.css",
        overrides: {
          "paneProperties.background": "#05050b",
          "paneProperties.backgroundType": "solid",
          "paneProperties.vertGridProperties.color": "rgba(255,255,255,0.06)",
          "paneProperties.horzGridProperties.color": "rgba(255,255,255,0.06)",
          "mainSeriesProperties.candleStyle.upColor": "#19d86f",
          "mainSeriesProperties.candleStyle.downColor": "#ff5b2e",
          "mainSeriesProperties.candleStyle.borderUpColor": "#19d86f",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ff5b2e",
          "mainSeriesProperties.candleStyle.wickUpColor": "#19d86f",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ff5b2e",
          "scalesProperties.textColor": "rgba(255,255,255,0.72)"
        }
      });
    }

    loadWidget();

    return () => {
      cancelled = true;
      widgetRef.current?.remove?.();
      widgetRef.current = null;
    };
  }, [bars, containerId, token]);

  if (missingLibrary) {
    return <AdvancedChartFallback />;
  }

  return <div id={containerId} className="h-full w-full" />;
}

function AdvancedChartFallback() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: "15",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "BINANCE:SOLUSDT",
      theme: "dark",
      timezone: "Etc/UTC",
      backgroundColor: "#05050b",
      gridColor: "rgba(255, 255, 255, 0.06)",
      watchlist: [],
      withdateranges: true,
      compareSymbols: [],
      studies: [],
      autosize: true
    });

    container.appendChild(widget);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-[#05050b]">
      <div className="pointer-events-none absolute bottom-10 left-3 z-10 rounded-md border border-white/10 bg-[#05050b]/80 px-3 py-1 text-xs font-black text-white/70 backdrop-blur">
        SOLUSDT market context
      </div>
      <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}

async function tradingViewAssetsExist() {
  try {
    const response = await fetch(`${libraryPath}charting_library.js`, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function loadTradingViewScript() {
  if ((window as TradingViewWindow).TradingView) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${libraryPath}charting_library.js"]`);

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("TradingView script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `${libraryPath}charting_library.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("TradingView script failed to load"));
    document.head.appendChild(script);
  });
}

function createDatafeed(token: Token, bars: Bar[]) {
  return {
    onReady: (callback: (configuration: Record<string, unknown>) => void) => {
      setTimeout(() => callback({
        supported_resolutions: ["1", "5", "15", "60", "1D"],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true
      }), 0);
    },
    searchSymbols: (_userInput: string, _exchange: string, _symbolType: string, onResult: (symbols: unknown[]) => void) => {
      onResult([{ symbol: token.symbol, full_name: token.name, description: token.name, exchange: "ChadWallet", type: "crypto" }]);
    },
    resolveSymbol: (_symbolName: string, onResolve: (symbolInfo: Record<string, unknown>) => void) => {
      setTimeout(() => onResolve({
        ticker: token.symbol,
        name: token.symbol,
        description: token.name,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "ChadWallet",
        minmov: 1,
        pricescale: token.price < 0.01 ? 100000000 : 1000,
        has_intraday: true,
        has_daily: true,
        supported_resolutions: ["1", "5", "15", "60", "1D"],
        volume_precision: 2,
        data_status: "streaming"
      }), 0);
    },
    getBars: (
      _symbolInfo: unknown,
      _resolution: string,
      periodParams: { from: number; to: number; firstDataRequest?: boolean },
      onHistory: (bars: Bar[], meta: { noData: boolean }) => void
    ) => {
      const visibleBars = bars.filter((bar) => bar.time >= periodParams.from * 1000 && bar.time <= periodParams.to * 1000);
      onHistory(visibleBars.length ? visibleBars : bars, { noData: bars.length === 0 });
    },
    subscribeBars: (
      _symbolInfo: unknown,
      _resolution: string,
      onRealtimeCallback: (bar: Bar) => void,
      subscriberUID: string
    ) => {
      const latest = bars[bars.length - 1];
      const interval = window.setInterval(() => {
        if (latest) {
          onRealtimeCallback({ ...latest, time: Date.now() });
        }
      }, 10000);
      subscriptions.set(subscriberUID, interval);
    },
    unsubscribeBars: (subscriberUID: string) => {
      const interval = subscriptions.get(subscriberUID);
      if (interval) {
        window.clearInterval(interval);
        subscriptions.delete(subscriberUID);
      }
    }
  };
}

const subscriptions = new Map<string, number>();

function buildBars(token: Token, trades: Trade[]) {
  const prices = getPriceSeries(token, trades);
  const now = Math.floor(Date.now() / 60000) * 60000;

  return prices.map((close, index) => {
    const previous = index === 0 ? close : prices[index - 1];
    const spread = Math.max(Math.abs(close - previous), close * 0.006);

    return {
      time: now - (prices.length - index) * 60_000,
      open: previous,
      high: Math.max(previous, close) + spread * 0.55,
      low: Math.max(Math.min(previous, close) - spread * 0.55, 0),
      close,
      volume: Math.max(token.volume24h / prices.length, 1000) * (1 + Math.abs(Math.sin(index * 1.7)))
    };
  });
}

function getPriceSeries(token: Token, trades: Trade[]) {
  const tradePrices = trades
    .map((trade) => (trade.amount > 0 ? trade.valueUsd / trade.amount : 0))
    .filter((price) => Number.isFinite(price) && price > 0)
    .reverse();

  if (tradePrices.length >= 12) {
    return tradePrices;
  }

  const seed = Array.from(token.address).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const steps = 80;
  const direction = token.change24h >= 0 ? 1 : -1;
  const volatility = Math.min(Math.max(Math.abs(token.change24h) / 100, 0.06), 0.45);
  let price = token.price > 0 ? token.price : 1;

  return Array.from({ length: steps }, (_, index) => {
    const wave = Math.sin((seed + index * 13) * 0.18) * volatility;
    const chop = Math.cos((seed + index * 7) * 0.31) * volatility * 0.55;
    const drift = direction * (index / (steps - 1)) * volatility;
    price = Math.max(price * (1 + wave * 0.035 + chop * 0.018 + drift * 0.012), price * 0.65);
    return price;
  });
}
