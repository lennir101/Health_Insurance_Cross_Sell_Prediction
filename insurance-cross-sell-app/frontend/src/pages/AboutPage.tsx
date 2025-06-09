import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
    Code,
    Database, 
    LineChart, 
    Server, 
    Layers, 
    Cpu, 
    Globe, 
    Clock,
    ArrowUpDown,
    MessageSquare,
    ShieldCheck,
    Zap
} from 'lucide-react';

// 註冊 GSAP 插件
gsap.registerPlugin(ScrollTrigger);

const AboutPage: React.FC = () => {
    const cardsRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const frontendTechRef = useRef<HTMLDivElement>(null);
    const backendTechRef = useRef<HTMLDivElement>(null);
    const prosRef = useRef<HTMLDivElement>(null);
    const consRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState("frontend");
    const [archActiveTab, setArchActiveTab] = useState("pros");
    
    // 創建並運行動畫
    const runAnimations = () => {
        // 清除所有ScrollTrigger實例以防止重複
        ScrollTrigger.getAll().forEach(st => st.kill());
        
        // 標題動畫
        gsap.fromTo(headingRef.current, 
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "all" }
        );
        
        // 卡片動畫
        if (cardsRef.current) {
            const cards = cardsRef.current.querySelectorAll('.card-animate');
            gsap.fromTo(cards, 
                { opacity: 0, y: 30 },
                { 
                    opacity: 1, 
                    y: 0, 
                    stagger: 0.15, 
                    duration: 0.7, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: cardsRef.current,
                        start: "top 85%",
                        end: "bottom 20%",
                        toggleActions: "play none none none"
                    },
                    clearProps: "all"
                }
            );
        }
        
        // 前端技術堆疊動畫
        if (frontendTechRef.current && activeTab === "frontend") {
            const items = frontendTechRef.current.querySelectorAll('.tech-item');
            gsap.fromTo(items, 
                { x: -20, opacity: 0 },
                { 
                    x: 0, 
                    opacity: 1, 
                    stagger: 0.1, 
                    duration: 0.5, 
                    ease: "power1.out",
                    clearProps: "all"
                }
            );
        }
        
        // 後端技術堆疊動畫
        if (backendTechRef.current && activeTab === "backend") {
            const items = backendTechRef.current.querySelectorAll('.tech-item');
            gsap.fromTo(items, 
                { x: -20, opacity: 0 },
                { 
                    x: 0, 
                    opacity: 1, 
                    stagger: 0.1, 
                    duration: 0.5, 
                    ease: "power1.out",
                    clearProps: "all"
                }
            );
        }
        
        // 架構分析優點動畫
        if (prosRef.current && archActiveTab === "pros") {
            const items = prosRef.current.querySelectorAll('.arch-item');
            gsap.fromTo(items, 
                { y: 15, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    stagger: 0.1, 
                    duration: 0.5, 
                    ease: "back.out(1.2)",
                    clearProps: "all"
                }
            );
        }
        
        // 架構分析缺點動畫
        if (consRef.current && archActiveTab === "cons") {
            const items = consRef.current.querySelectorAll('.arch-item');
            gsap.fromTo(items, 
                { y: 15, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    stagger: 0.1, 
                    duration: 0.5, 
                    ease: "back.out(1.2)",
                    clearProps: "all"
                }
            );
        }
    };
    
    // 初始化動畫
    useEffect(() => {
        // 添加一個小延遲確保DOM已完全加載
        const timer = setTimeout(() => {
            runAnimations();
        }, 100);
        
        return () => {
            clearTimeout(timer);
            // 組件卸載時清理ScrollTrigger
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, []);
    
    // 當標籤切換時重新運行動畫
    useEffect(() => {
        runAnimations();
    }, [activeTab, archActiveTab]);

    return (
        <PageContainer
            title="關於系統"
            description="了解保險交叉銷售預測系統的詳細信息"
        >
            <div className="flex flex-col gap-8" ref={cardsRef}>
                <div className="text-center mb-6">
                    <h1 ref={headingRef} className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text mb-2">
                        保險交叉銷售預測系統
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        運用人工智能與機器學習技術，優化保險產品的交叉銷售策略
                    </p>
                </div>

                <Card className="card-animate overflow-hidden">
                    <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-70"></div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5 text-blue-500" />
                            系統簡介
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            保險交叉銷售預測系統是一個基於機器學習的應用程序，旨在幫助保險公司識別可能對車險產品感興趣的健康保險客戶。
                        </p>
                        <p>
                            系統使用 XGBoost 分類算法，通過分析客戶的人口統計學特徵、保險歷史和車輛相關信息來預測客戶購買車險的可能性。
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="bg-blue-50">機器學習</Badge>
                            <Badge variant="outline" className="bg-green-50">預測分析</Badge>
                            <Badge variant="outline" className="bg-purple-50">保險行業</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-animate">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5 text-purple-500" />
                            技術堆疊
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="frontend" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="frontend" className="flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    前端技術
                                </TabsTrigger>
                                <TabsTrigger value="backend" className="flex items-center gap-1">
                                    <Server className="h-4 w-4" />
                                    後端技術
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="frontend" className="mt-4">
                                <div ref={frontendTechRef} className="space-y-3">
                                    <div className="tech-item flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="bg-blue-100 p-2 rounded-md">
                                            <Code className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">React 18 + TypeScript</h3>
                                            <p className="text-sm text-muted-foreground">現代化的 UI 庫與類型安全的開發體驗</p>
                                        </div>
                                    </div>
                                    <div className="tech-item flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="bg-purple-100 p-2 rounded-md">
                                            <Zap className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Vite + ShadcnUI</h3>
                                            <p className="text-sm text-muted-foreground">快速的構建工具與可重用、可定制的 UI 組件</p>
                                        </div>
                                    </div>
                                    <div className="tech-item flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="bg-green-100 p-2 rounded-md">
                                            <LineChart className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Recharts + GSAP</h3>
                                            <p className="text-sm text-muted-foreground">高效的數據可視化與流暢的動畫效果</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="backend" className="mt-4">
                                <div ref={backendTechRef} className="space-y-3">
                                    <div className="tech-item flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="bg-blue-100 p-2 rounded-md">
                                            <Server className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Python + Flask</h3>
                                            <p className="text-sm text-muted-foreground">輕量級 API 框架，提供快速開發與靈活擴展</p>
                                        </div>
                                    </div>
                                    <div className="tech-item flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="bg-yellow-100 p-2 rounded-md">
                                            <Cpu className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">XGBoost + Scikit-learn</h3>
                                            <p className="text-sm text-muted-foreground">高性能梯度提升框架與完整的機器學習工具套件</p>
                                        </div>
                                    </div>
                                    <div className="tech-item flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                                        <div className="bg-indigo-100 p-2 rounded-md">
                                            <Database className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Pandas + NumPy</h3>
                                            <p className="text-sm text-muted-foreground">高效的數據處理與科學計算庫</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="card-animate">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpDown className="h-5 w-5 text-green-500" />
                            前後端分離架構分析
                        </CardTitle>
                        <CardDescription>
                            對當前系統採用的前後端分離架構進行優缺點分析
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="pros" onValueChange={setArchActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="pros">優勢</TabsTrigger>
                                <TabsTrigger value="cons">挑戰</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pros" className="space-y-4 mt-4">
                                <div ref={prosRef} className="space-y-4">
                                    <div className="arch-item flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                                            <Zap className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">技術棧獨立演進</h3>
                                            <p className="text-sm text-muted-foreground">前端可以獨立使用 React、TypeScript 等現代技術，後端專注於 Python 機器學習生態系統，各自獨立演進。</p>
                                        </div>
                                    </div>
                                    <div className="arch-item flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                                            <Clock className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">開發效率提升</h3>
                                            <p className="text-sm text-muted-foreground">前後端開發人員可以同時並行工作，API 定義好後互不干擾，加快開發速度。</p>
                                        </div>
                                    </div>
                                    <div className="arch-item flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 p-1.5 rounded-full">
                                            <ShieldCheck className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">更好的安全性設計</h3>
                                            <p className="text-sm text-muted-foreground">API 層提供了更好的安全控制點，可以統一管理認證、授權、數據校驗等安全措施。</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="cons" className="space-y-4 mt-4">
                                <div ref={consRef} className="space-y-4">
                                    <div className="arch-item flex items-start gap-3">
                                        <div className="mt-1 bg-amber-100 p-1.5 rounded-full">
                                            <MessageSquare className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">前後端溝通成本</h3>
                                            <p className="text-sm text-muted-foreground">API 接口的定義需要前後端充分溝通與協調，可能增加溝通成本。</p>
                                        </div>
                                    </div>
                                    <div className="arch-item flex items-start gap-3">
                                        <div className="mt-1 bg-amber-100 p-1.5 rounded-full">
                                            <Server className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">部署複雜度增加</h3>
                                            <p className="text-sm text-muted-foreground">前後端需要分別部署與維護，增加了部署複雜度和運維難度。</p>
                                        </div>
                                    </div>
                                    <div className="arch-item flex items-start gap-3">
                                        <div className="mt-1 bg-amber-100 p-1.5 rounded-full">
                                            <Database className="h-4 w-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">數據傳輸開銷</h3>
                                            <p className="text-sm text-muted-foreground">前後端通過 HTTP 通信可能帶來更多的數據傳輸開銷，特別是對於大量數據的預測請求。</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card className="card-animate">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5 text-orange-500" />
                            系統特點
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 bg-blue-100 p-1.5 rounded-full group-hover:bg-blue-200 transition-colors">
                                    <Cpu className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">單一客戶預測</h3>
                                    <p className="text-sm text-muted-foreground">輸入單個客戶的詳細信息並獲得實時預測結果，支持特徵重要性分析</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 bg-purple-100 p-1.5 rounded-full group-hover:bg-purple-200 transition-colors">
                                    <Database className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">批量預測</h3>
                                    <p className="text-sm text-muted-foreground">上傳含有多個客戶信息的 CSV 文件進行批量分析，提高工作效率</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 bg-green-100 p-1.5 rounded-full group-hover:bg-green-200 transition-colors">
                                    <LineChart className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">數據分析</h3>
                                    <p className="text-sm text-muted-foreground">查看模型表現指標和數據統計信息，幫助優化營銷策略</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 bg-amber-100 p-1.5 rounded-full group-hover:bg-amber-200 transition-colors">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">歷史記錄</h3>
                                    <p className="text-sm text-muted-foreground">保存並查看過去的預測結果，便於追蹤和比較</p>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground mt-6 opacity-80">
                    <p>版本 1.0.0 | © 2025 保險交叉銷售預測系統</p>
                    <p className="mt-1">使用 React、TypeScript、ShadcnUI 和 GSAP 構建</p>
                </div>
            </div>
        </PageContainer>
    );
};

export default AboutPage; 