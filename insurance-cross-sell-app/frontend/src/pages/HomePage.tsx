import React, {useEffect, useRef} from 'react';
import {PageContainer} from '@/components/layout';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ArrowRight, Gauge, BarChart4, Users} from 'lucide-react';
import {cn} from '@/lib/utils';
import gsap from 'gsap';
import {Link} from 'react-router-dom';

const HomePage: React.FC = () => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 標題動畫
            gsap.fromTo(
                titleRef.current,
                {y: -30, opacity: 0},
                {y: 0, opacity: 1, duration: 0.8, ease: "power2.out"}
            );

            // 卡片動畫
            if (cardsRef.current?.children) {
                const cards = Array.from(cardsRef.current.children);
                gsap.fromTo(
                    cards,
                    {y: 40, opacity: 0},
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        stagger: 0.1,
                        ease: "back.out(1.2)",
                        delay: 0.2
                    }
                );
            }
        });

        return () => ctx.revert(); // 使用 gsap context 的 revert 方法進行清理
    }, []);

    return (
        <PageContainer className="flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center space-y-10 w-full max-w-5xl">
                <div className="text-center space-y-4 mb-6">
                    <h1 ref={titleRef} className="text-4xl font-bold tracking-tight">保險交叉銷售智能分析平台</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        運用機器學習技術，精準識別有潛力購買車險的健康保險客戶，提升業務轉化效率。
                    </p>
                </div>

                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    <Card
                        className="h-full overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
                        <CardHeader className="bg-primary/5 pb-2">
                            <div className="mb-2">
                                <Users className="h-6 w-6 text-primary"/>
                            </div>
                            <CardTitle className="text-xl">單一客戶預測</CardTitle>
                            <CardDescription>
                                分析個人客戶資料，預測購買意願
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 flex flex-col justify-between" style={{minHeight: '180px'}}>
                            <p className="text-muted-foreground mb-6">
                                輸入客戶基本資料，系統將立即分析並提供購買車險可能性的精準預測。
                            </p>
                            <Button asChild variant="outline" className="w-full group">
                                <Link to="/prediction">
                                    開始分析
                                    <ArrowRight
                                        className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card
                        className="h-full overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
                        <CardHeader className="bg-primary/5 pb-2">
                            <div className="mb-2">
                                <BarChart4 className="h-6 w-6 text-primary"/>
                            </div>
                            <CardTitle className="text-xl">批量預測</CardTitle>
                            <CardDescription>
                                處理大量客戶數據，批次分析
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 flex flex-col justify-between" style={{minHeight: '180px'}}>
                            <p className="text-muted-foreground mb-6">
                                上傳包含多個客戶資料的 CSV 文件，系統將進行高效批量處理並提供詳細結果分析。
                            </p>
                            <Button asChild variant="outline" className="w-full group">
                                <Link to="/batch">
                                    開始批量分析
                                    <ArrowRight
                                        className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card
                        className="h-full overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
                        <CardHeader className="bg-primary/5 pb-2">
                            <div className="mb-2">
                                <Gauge className="h-6 w-6 text-primary"/>
                            </div>
                            <CardTitle className="text-xl">數據分析</CardTitle>
                            <CardDescription>
                                查看客戶數據與模型表現
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 flex flex-col justify-between" style={{minHeight: '180px'}}>
                            <p className="text-muted-foreground mb-6">
                                探索保險客戶數據統計、關鍵特徵分析以及模型性能指標，深入了解預測背後的數據邏輯。
                            </p>
                            <Button asChild variant="outline" className="w-full group">
                                <Link to="/dashboard">
                                    查看分析報告
                                    <ArrowRight
                                        className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default HomePage; 