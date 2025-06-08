import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { themeColors } from '@/lib/themes';

interface DataPoint {
  date: Date | string;
  value: number;
  category?: string;
}

interface D3AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  areaColor?: string;
  gradientId?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  dateFormat?: string;
  valueFormat?: (value: number) => string;
  curveType?: 'linear' | 'natural' | 'step' | 'monotone';
  className?: string;
  animate?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
}

const D3AreaChart: React.FC<D3AreaChartProps> = ({
  data,
  width = 700,
  height = 400,
  margin = { top: 40, right: 30, bottom: 50, left: 60 },
  areaColor = themeColors.info.main,
  gradientId = 'area-gradient',
  xAxisLabel = '',
  yAxisLabel = '',
  title = '',
  dateFormat = '%Y-%m-%d',
  valueFormat = (d) => d.toString(),
  curveType = 'monotone',
  className = '',
  animate = true,
  showTooltip = true,
  showGrid = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dataPoint?: DataPoint;
  }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // 將日期字符串轉換為 Date 對象
  const processedData = data.map((d) => ({
    ...d,
    date: d.date instanceof Date ? d.date : new Date(d.date),
  }));

  // 獲取曲線類型
  const getCurveType = () => {
    switch (curveType) {
      case 'linear':
        return d3.curveLinear;
      case 'natural':
        return d3.curveNatural;
      case 'step':
        return d3.curveStep;
      case 'monotone':
      default:
        return d3.curveMonotoneX;
    }
  };

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    // 清空 SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // 計算內部尺寸
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 選擇 SVG 並設置容器
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // 添加主容器
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 創建 X 軸比例尺
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    // 創建 Y 軸比例尺
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.value) as number * 1.1])
      .range([innerHeight, 0]);

    // 創建區域生成器
    const area = d3
      .area<DataPoint>()
      .x((d) => xScale(d.date as Date))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(getCurveType());

    // 創建線條生成器
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.date as Date))
      .y((d) => yScale(d.value))
      .curve(getCurveType());

    // 創建漸變
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', areaColor)
      .attr('stop-opacity', 0.7);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', areaColor)
      .attr('stop-opacity', 0.1);

    // 添加背景網格
    if (showGrid) {
      g.append('g')
        .attr('class', 'grid x-grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '2,2');

      g.append('g')
        .attr('class', 'grid y-grid')
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-dasharray', '2,2');
    }

    // 添加 X 軸
    const xAxis = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(width > 600 ? 10 : 5)
          .tickFormat((d) => d3.timeFormat(dateFormat)(d as Date))
      );

    // 移除 X 軸的線條
    xAxis.select('.domain').attr('stroke', '#d1d5db');
    xAxis.selectAll('line').attr('stroke', '#d1d5db');
    xAxis.selectAll('text').attr('fill', '#6b7280');

    // 添加 X 軸標籤
    if (xAxisLabel) {
      g.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .style('fill', '#4b5563')
        .text(xAxisLabel);
    }

    // 添加 Y 軸
    const yAxis = g
      .append('g')
      .attr('class', 'y-axis')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => valueFormat(d as number))
      );

    // 移除 Y 軸的線條
    yAxis.select('.domain').attr('stroke', '#d1d5db');
    yAxis.selectAll('line').attr('stroke', '#d1d5db');
    yAxis.selectAll('text').attr('fill', '#6b7280');

    // 添加 Y 軸標籤
    if (yAxisLabel) {
      g.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('fill', '#4b5563')
        .text(yAxisLabel);
    }

    // 添加標題
    if (title) {
      svg
        .append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#1f2937')
        .text(title);
    }

    // 創建一個剪切路徑
    svg
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // 添加區域
    const areaPath = g
      .append('path')
      .datum(processedData)
      .attr('class', 'area')
      .attr('fill', `url(#${gradientId})`)
      .attr('clip-path', 'url(#clip)');

    // 添加線條
    const linePath = g
      .append('path')
      .datum(processedData)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', areaColor)
      .attr('stroke-width', 2)
      .attr('clip-path', 'url(#clip)');

    // 添加動畫
    if (animate) {
      // 初始設置為 0
      areaPath.attr('d', area);
      linePath.attr('d', line);

      // 計算路徑長度
      const lineLength = (linePath.node() as any)?.getTotalLength() || 0;

      // 設置初始樣式
      linePath
        .attr('stroke-dasharray', `${lineLength} ${lineLength}`)
        .attr('stroke-dashoffset', lineLength);

      // 區域動畫
      areaPath
        .attr('opacity', 0)
        .transition()
        .duration(2000)
        .attr('opacity', 1);

      // 線條動畫
      linePath
        .transition()
        .duration(2000)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          linePath.attr('stroke-dasharray', 'none');
        });
    } else {
      areaPath.attr('d', area);
      linePath.attr('d', line);
    }

    // 添加數據點
    const circles = g
      .selectAll('.data-point')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d) => xScale(d.date as Date))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 0)
      .attr('fill', 'white')
      .attr('stroke', areaColor)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // 數據點動畫
    circles
      .transition()
      .duration(animate ? 2000 : 0)
      .delay((_, i) => (animate ? i * 100 + 500 : 0))
      .attr('r', 4);

    // 添加交互效果
    if (showTooltip) {
      const bisect = d3.bisector<DataPoint, Date>((d) => d.date as Date).left;

      // 創建跟踪線
      const trackingLine = g
        .append('line')
        .attr('class', 'tracking-line')
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#9CA3AF')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .style('opacity', 0);

      // 鼠標事件處理
      svg
        .append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseover', function () {
          trackingLine.style('opacity', 1);
          circles.attr('r', 4);
        })
        .on('mouseout', function () {
          trackingLine.style('opacity', 0);
          circles.attr('r', 4);
          setTooltip({ ...tooltip, visible: false });
        })
        .on('mousemove', function (event) {
          // 獲取鼠標位置
          const [mouseX] = d3.pointer(event, this);
          
          // 找到最近的數據點
          const x0 = xScale.invert(mouseX);
          const i = bisect(processedData, x0, 1);
          const d0 = processedData[i - 1];
          const d1 = processedData[i];
          
          if (!d0 || !d1) return;
          
          const d = x0.getTime() - (d0.date as Date).getTime() > (d1.date as Date).getTime() - x0.getTime() ? d1 : d0;
          
          // 更新跟踪線位置
          trackingLine.attr('transform', `translate(${xScale(d.date as Date)}, 0)`);
          
          // 更新提示框位置和內容
          setTooltip({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            dataPoint: d,
          });
          
          // 高亮當前數據點
          circles
            .attr('r', (p) => (p === d ? 6 : 4))
            .attr('stroke-width', (p) => (p === d ? 3 : 2));
        });
    }
  }, [
    processedData,
    width,
    height,
    margin,
    areaColor,
    gradientId,
    xAxisLabel,
    yAxisLabel,
    title,
    dateFormat,
    valueFormat,
    curveType,
    animate,
    showTooltip,
    showGrid,
  ]);

  // 獲取日期顯示格式
  const formatDateForTooltip = (date: Date) => {
    return d3.timeFormat(dateFormat)(date);
  };

  return (
    <div className={`relative ${className}`}>
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      {tooltip.visible && tooltip.dataPoint && (
        <div
          className="absolute z-10 p-2 bg-white rounded shadow-lg text-sm pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 40}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-medium">
            {formatDateForTooltip(tooltip.dataPoint.date as Date)}
          </div>
          <div>
            {tooltip.dataPoint.category ? `${tooltip.dataPoint.category}: ` : ''}
            {valueFormat(tooltip.dataPoint.value)}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3AreaChart; 