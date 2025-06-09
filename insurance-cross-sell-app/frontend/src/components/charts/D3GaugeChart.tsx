import React, {useRef, useEffect} from 'react';
import * as d3 from 'd3';

interface D3GaugeChartProps {
    value: number; // 0-100 之間的值
    min?: number;
    max?: number;
    label?: string;
    size?: number;
    thickness?: number;
    backgroundColor?: string;
    foregroundColor?: string;
    showValue?: boolean;
    animationDuration?: number;
    className?: string;
}

const D3GaugeChart: React.FC<D3GaugeChartProps> = ({
                                                       value,
                                                       min = 0,
                                                       max = 100,
                                                       label = '',
                                                       size = 200,
                                                       thickness = 30,
                                                       backgroundColor = 'rgba(0, 0, 0, 0.1)',
                                                       foregroundColor = '#0ea5e9',
                                                       showValue = true,
                                                       animationDuration = 1000,
                                                       className = '',
                                                   }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // 將值限制在 min 和 max 之間
    const normalizedValue = Math.min(Math.max(value, min), max);
    // 將值轉換為百分比 (0-1 之間)
    const percentage = (normalizedValue - min) / (max - min);

    useEffect(() => {
        if (!svgRef.current) return;

        // 清空 SVG
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current);
        const radius = size / 2;
        const innerRadius = radius - thickness;

        // 創建容器
        const g = svg.append('g').attr('transform', `translate(${radius},${radius})`);

        // 創建角度比例尺
        const angleScale = d3.scaleLinear()
            .domain([0, 1])
            .range([-Math.PI / 2, Math.PI / 2])
            .clamp(true);

        // 創建圓弧生成器
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .cornerRadius(thickness / 2);

        // 背景圓弧
        g.append('path')
            .datum({endAngle: Math.PI / 2})
            .style('fill', backgroundColor)
            .attr('d', arc as any);

        // 前景圓弧 (數據)
        const foreground = g.append('path')
            .datum({endAngle: angleScale(0)})
            .style('fill', foregroundColor)
            .attr('d', arc as any);

        // 動畫更新
        foreground.transition()
            .duration(animationDuration)
            .attrTween('d', function (d: any) {
                const interpolate = d3.interpolate(d.endAngle, angleScale(percentage));
                return function (t) {
                    d.endAngle = interpolate(t);
                    return arc(d) as string;
                };
            });

        // 中心線
        g.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', -(radius - thickness / 2))
            .style('stroke', '#888')
            .style('stroke-width', 2)
            .style('stroke-dasharray', '1, 2');

        // 添加標籤
        if (label) {
            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', radius - thickness / 2 + 20)
                .style('font-size', '14px')
                .style('fill', '#555')
                .text(label);
        }

        // 添加數值
        if (showValue) {
            // 創建一個漸變
            const gradient = svg.append('defs')
                .append('linearGradient')
                .attr('id', 'gauge-text-gradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', foregroundColor);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', d3.color(foregroundColor)?.darker(1.5).toString() || '#000');

            const valueText = g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('font-size', `${size / 6}px`)
                .style('font-weight', 'bold')
                .style('fill', 'url(#gauge-text-gradient)')
                .text('0');

            // 數值動畫
            let startValue = 0;
            const numberInterpolator = d3.interpolateNumber(startValue, normalizedValue);

            valueText.transition()
                .duration(animationDuration)
                .tween('text', function () {
                    return function (t) {
                        const value = numberInterpolator(t);
                        d3.select(this).text(Math.round(value));
                    };
                });
        }

        // 刻度
        const ticks = [0, 0.25, 0.5, 0.75, 1];
        ticks.forEach(tick => {
            const tickAngle = angleScale(tick);
            const tickRadius = radius - thickness / 2;

            // 主刻度線
            g.append('line')
                .attr('x1', Math.cos(tickAngle) * innerRadius)
                .attr('y1', Math.sin(tickAngle) * innerRadius)
                .attr('x2', Math.cos(tickAngle) * radius)
                .attr('y2', Math.sin(tickAngle) * radius)
                .style('stroke', '#999')
                .style('stroke-width', 1);

            // 刻度標籤
            g.append('text')
                .attr('x', Math.cos(tickAngle) * (radius + 10))
                .attr('y', Math.sin(tickAngle) * (radius + 10))
                .attr('text-anchor', tick === 0 ? 'start' : tick === 1 ? 'end' : 'middle')
                .attr('dominant-baseline', tick === 0.5 ? 'hanging' : 'middle')
                .style('font-size', '12px')
                .style('fill', '#777')
                .text(Math.round(tick * (max - min) + min));
        });

        // 附加交互效果
        svg.on('mouseover', function () {
            d3.select(this).style('cursor', 'pointer');
            foreground.style('filter', 'brightness(1.1)');
        }).on('mouseout', function () {
            foreground.style('filter', 'none');
        }).on('click', function () {
            // 點擊動畫
            foreground
                .transition()
                .duration(300)
                .style('filter', 'brightness(1.3)')
                .transition()
                .duration(300)
                .style('filter', 'none');
        });

    }, [value, min, max, size, thickness, backgroundColor, foregroundColor, label, showValue, animationDuration, percentage]);

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <svg
                ref={svgRef}
                width={size}
                height={size / 1.6}
                viewBox={`0 0 ${size} ${size / 1.6}`}
                className="overflow-visible"
            />
        </div>
    );
};

export default D3GaugeChart; 