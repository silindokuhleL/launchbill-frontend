"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

type DashboardChartProps = {
  ariaLabel: string;
  option: EChartsOption;
};

export function DashboardChart({ ariaLabel, option }: DashboardChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current, null, {
      renderer: "canvas",
    });
    const resizeObserver = new ResizeObserver(() => chart.resize());

    chart.setOption(option);
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return (
    <div
      aria-label={ariaLabel}
      className="h-72 w-full min-w-0"
      ref={chartRef}
      role="img"
    />
  );
}
