import React, {useRef, useEffect, useState} from 'react';
import * as d3 from 'd3';
import {Card} from '@/components/ui/card';

interface CorrelationData {
    feature1: string;
    feature2: string;
    correlation: number;
}

interface HeatmapChartProps {
    data: {
        features: string[];
        correlations: CorrelationData[];
    };
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    className?: string;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
                                                       data,
                                                       width = 600,
                                                       height = 500,
                                                       margin = {top: 80, right: 50, bottom: 80, left: 100},
                                                       className = '',
                                                   }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltipData, setTooltipData] = useState<{
        visible: boolean;
        x: number;
        y: number;
        feature1: string;
        feature2: string;
        correlation: number;
    } | null>(null);

    useEffect(() => {
        if (!svgRef.current || !data || !data.features || !data.correlations) return;

        // 清空SVG
        d3.select(svgRef.current).selectAll('*').remove();

        // 準備數據
        const {features, correlations} = data;

        // 計算內部尺寸
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // 創建SVG元素
        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // 添加主容器
        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // 創建比例尺
        const xScale = d3
            .scaleBand()
            .domain(features)
            .range([0, innerWidth])
            .padding(0.05);

        const yScale = d3
            .scaleBand()
            .domain(features)
            .range([0, innerHeight])
            .padding(0.05);

        // 創建顏色比例尺
        const colorScale = d3
            .scaleLinear<string>()
            .domain([-1, 0, 1])
            .range(['#3b82f6', '#f3f4f6', '#ef4444']);

        // 繪製熱力圖單元格
        g.selectAll('rect')
            .data(correlations)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.feature1) || 0)
            .attr('y', d => yScale(d.feature2) || 0)
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.correlation))
            .attr('stroke', '#e5e7eb')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event, d) => {
                setTooltipData({
                    visible: true,
                    x: event.pageX,
                    y: event.pageY,
                    feature1: d.feature1,
                    feature2: d.feature2,
                    correlation: d.correlation
                });
            })
            .on('mousemove', (event) => {
                if (tooltipData) {
                    setTooltipData({
                        ...tooltipData,
                        x: event.pageX,
                        y: event.pageY
                    });
                }
            })
            .on('mouseout', () => {
                setTooltipData(null);
            });

        // 添加相關性值文本
        g.selectAll('text')
            .data(correlations)
            .enter()
            .append('text')
            .attr('x', d => (xScale(d.feature1) || 0) + xScale.bandwidth() / 2)
            .attr('y', d => (yScale(d.feature2) || 0) + yScale.bandwidth() / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('fill', d => Math.abs(d.correlation) > 0.5 ? '#ffffff' : '#374151')
            .text(d => d.correlation.toFixed(2));

        // 添加X軸標籤
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('font-size', '12px')
            .attr('fill', '#374151');

        // 添加Y軸標籤
        g.append('g')
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .attr('font-size', '12px')
            .attr('fill', '#374151');

        // 添加標題
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', '#111827')
            .text('特徵相關性矩陣');

        // 添加顏色圖例
        const legendWidth = 200;
        const legendHeight = 15;
        const legendX = width - margin.right - legendWidth;
        const legendY = 30;

        const legendScale = d3
            .scaleLinear()
            .domain([-1, 0, 1])
            .range([0, legendWidth / 2, legendWidth]);

        const legendAxis = d3
            .axisBottom(legendScale)
            .tickValues([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1])
            .tickFormat(d3.format('.2f'));

        const defs = svg.append('defs');

        const gradient = defs
            .append('linearGradient')
            .attr('id', 'correlation-gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colorScale(-1));

        gradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', colorScale(0));

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colorScale(1));

        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#correlation-gradient)');

        svg.append('g')
            .attr('transform', `translate(${legendX},${legendY + legendHeight})`)
            .call(legendAxis)
            .selectAll('text')
            .attr('font-size', '10px');

        svg.append('text')
            .attr('x', legendX + legendWidth / 2)
            .attr('y', legendY - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#4b5563')
            .text('相關性係數');

    }, [data, width, height, margin, tooltipData]);

    return (
        <div className={`relative ${className}`}>
            <svg ref={svgRef}/>
            {tooltipData && tooltipData.visible && (
                <div
                    className="absolute bg-white p-2 rounded shadow-md text-sm z-50"
                    style={{
                        left: tooltipData.x + 10,
                        top: tooltipData.y - 40,
                        pointerEvents: 'none',
                    }}
                >
                    <p className="font-semibold">{tooltipData.feature1} vs {tooltipData.feature2}</p>
                    <p>相關性: <span className="font-medium">{tooltipData.correlation.toFixed(3)}</span></p>
                </div>
            )}
        </div>
    );
};

export default HeatmapChart; 