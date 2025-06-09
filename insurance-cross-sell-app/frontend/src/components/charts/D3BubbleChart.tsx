import React, {useRef, useEffect, useState} from 'react';
import * as d3 from 'd3';
import {chartColors} from '@/lib/themes';

interface BubbleData {
    id: string;
    name: string;
    value: number;
    group?: string;
    color?: string;
}

interface D3BubbleChartProps {
    data: BubbleData[];
    width?: number;
    height?: number;
    padding?: number;
    title?: string;
    valueFormat?: (n: number) => string;
    groupLegend?: boolean;
    className?: string;
    tooltipContent?: (data: BubbleData) => React.ReactNode;
}

const D3BubbleChart: React.FC<D3BubbleChartProps> = ({
                                                         data,
                                                         width = 600,
                                                         height = 400,
                                                         padding = 3,
                                                         title = '',
                                                         valueFormat = (n) => n.toString(),
                                                         groupLegend = true,
                                                         className = '',
                                                         tooltipContent,
                                                     }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        data?: BubbleData;
        x: number;
        y: number;
    }>({
        visible: false,
        x: 0,
        y: 0,
    });

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // 清空 SVG
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current);

        // 添加標題
        if (title) {
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text(title);
        }

        // 創建一個分層數據結構
        const root = d3.hierarchy({children: data})
            .sum(d => (d as any).value)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // 創建氣泡佈局
        const bubbleLayout = d3.pack()
            .size([width, height])
            .padding(padding);

        bubbleLayout(root);

        // 獲取所有組別
        const groups = Array.from(new Set(data.map(d => d.group || 'default')));

        // 創建顏色比例尺
        const colorScale = d3.scaleOrdinal()
            .domain(groups)
            .range(chartColors);

        // 創建氣泡
        const bubbleGroups = svg.selectAll('.bubble-group')
            .data(root.children || [])
            .enter()
            .append('g')
            .attr('class', 'bubble-group')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // 添加氣泡圓圈
        const circles = bubbleGroups
            .append('circle')
            .attr('r', 0) // 初始半徑為 0，用於動畫
            .style('fill', d => {
                const bubble = d.data as BubbleData;
                return bubble.color || colorScale(bubble.group || 'default') as string;
            })
            .style('fill-opacity', 0.8)
            .style('stroke', d => {
                const bubble = d.data as BubbleData;
                const color = bubble.color || colorScale(bubble.group || 'default') as string;
                return d3.color(color)?.darker(0.5).toString() || '#000';
            })
            .style('stroke-width', 1);

        // 添加文字標籤
        const labels = bubbleGroups
            .append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', '0px') // 初始字體大小為 0，用於動畫
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(d => {
                const bubble = d.data as BubbleData;
                return bubble.name;
            });

        // 添加值標籤
        const valueLabels = bubbleGroups
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .style('font-size', '0px') // 初始字體大小為 0，用於動畫
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .text(d => {
                const bubble = d.data as BubbleData;
                return valueFormat(bubble.value);
            });

        // 添加動畫
        circles.transition()
            .duration(800)
            .delay((_, i) => i * 50)
            .attr('r', d => d.r);

        labels.transition()
            .duration(800)
            .delay((_, i) => i * 50 + 300)
            .style('font-size', d => `${Math.min(2 * d.r / (d.data as BubbleData).name.length, d.r / 3)}px`);

        valueLabels.transition()
            .duration(800)
            .delay((_, i) => i * 50 + 400)
            .style('font-size', d => `${Math.min(d.r / 4, 14)}px`);

        // 添加交互
        bubbleGroups
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this).select('circle')
                    .transition()
                    .duration(300)
                    .attr('r', (d: any) => d.r * 1.05);

                const bubble = d.data as BubbleData;
                setTooltip({
                    visible: true,
                    data: bubble,
                    x: event.pageX,
                    y: event.pageY
                });
            })
            .on('mousemove', function (event) {
                setTooltip(prev => ({
                    ...prev,
                    x: event.pageX,
                    y: event.pageY
                }));
            })
            .on('mouseout', function () {
                d3.select(this).select('circle')
                    .transition()
                    .duration(300)
                    .attr('r', (d: any) => d.r);

                setTooltip(prev => ({
                    ...prev,
                    visible: false
                }));
            })
            .on('click', function (_, d) {
                // 點擊動畫
                d3.select(this).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', (d: any) => d.r * 1.1)
                    .transition()
                    .duration(200)
                    .attr('r', (d: any) => d.r);
            });

        // 創建圖例
        if (groupLegend && groups.length > 1) {
            const legendWidth = 200;
            const legendX = width - legendWidth - 10;
            const legendY = 20;
            const legendItemHeight = 20;

            const legend = svg.append('g')
                .attr('transform', `translate(${legendX}, ${legendY})`)
                .attr('class', 'legend');

            legend.append('rect')
                .attr('width', legendWidth)
                .attr('height', groups.length * legendItemHeight + 10)
                .attr('rx', 5)
                .attr('ry', 5)
                .style('fill', 'rgba(255, 255, 255, 0.9)')
                .style('stroke', '#ddd');

            groups.forEach((group, i) => {
                const legendItem = legend.append('g')
                    .attr('transform', `translate(10, ${i * legendItemHeight + 10})`);

                legendItem.append('rect')
                    .attr('width', 12)
                    .attr('height', 12)
                    .attr('rx', 2)
                    .style('fill', colorScale(group) as string);

                legendItem.append('text')
                    .attr('x', 20)
                    .attr('y', 10)
                    .style('font-size', '12px')
                    .text(group);
            });
        }

    }, [data, width, height, padding, title, valueFormat, groupLegend]);

    return (
        <div className={`relative ${className}`}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            />
            {tooltip.visible && tooltip.data && (
                <div
                    className="absolute z-10 p-2 bg-white rounded shadow-lg text-sm pointer-events-none"
                    style={{
                        left: `${tooltip.x + 10}px`,
                        top: `${tooltip.y - 40}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    {tooltipContent ? (
                        tooltipContent(tooltip.data)
                    ) : (
                        <div>
                            <div className="font-medium">{tooltip.data.name}</div>
                            <div>值: {valueFormat(tooltip.data.value)}</div>
                            {tooltip.data.group && <div>組別: {tooltip.data.group}</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default D3BubbleChart; 