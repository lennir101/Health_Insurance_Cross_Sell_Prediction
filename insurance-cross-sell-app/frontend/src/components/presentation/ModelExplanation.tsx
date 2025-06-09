import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';

interface ModelExplanationProps {
    className?: string;
}

const ModelExplanation: React.FC<ModelExplanationProps> = ({className}) => {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const nextStep = () => {
        setStep(prev => Math.min(prev + 1, totalSteps));
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    return (
        <div className={className}>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>XGBoost模型原理解析</CardTitle>
                    <CardDescription>
                        深入了解XGBoost在保險交叉銷售預測中的應用
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">模型概述</TabsTrigger>
                            <TabsTrigger value="steps">運作原理</TabsTrigger>
                            <TabsTrigger value="advantages">優勢分析</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 mt-4">
                            <div className="prose max-w-none">
                                <h3>XGBoost概述</h3>
                                <p>
                                    XGBoost (eXtreme Gradient Boosting) 是一種高效、可擴展的梯度提升機實現，被廣泛應用於機器學習競賽和實際業務場景。
                                    在保險交叉銷售預測中，XGBoost能夠有效捕捉客戶特徵與購買意願之間的複雜非線性關係。
                                </p>

                                <h4>核心特點</h4>
                                <ul>
                                    <li><strong>正則化</strong>：內建L1和L2正則化，有效防止過擬合</li>
                                    <li><strong>並行計算</strong>：支援多核心並行處理，提高訓練速度</li>
                                    <li><strong>處理缺失值</strong>：能夠自動處理數據中的缺失值</li>
                                    <li><strong>樹剪枝</strong>：從葉子向上剪枝，避免過度複雜的模型</li>
                                    <li><strong>內建交叉驗證</strong>：支援內部交叉驗證，方便超參數調優</li>
                                </ul>

                                <h4>應用於保險領域的優勢</h4>
                                <p>
                                    在保險交叉銷售場景中，XGBoost特別適合處理我們面臨的數據特點：不平衡的目標分佈（大多數客戶不會購買）、
                                    混合型特徵（數值型和類別型）以及特徵間的複雜交互作用。
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="steps" className="space-y-4 mt-4">
                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-medium">XGBoost工作流程：第 {step} 步
                                            / {totalSteps}</h3>
                                        <div className="space-x-2">
                                            <Button variant="outline" size="sm" onClick={prevStep}
                                                    disabled={step === 1}>上一步</Button>
                                            <Button variant="outline" size="sm" onClick={nextStep}
                                                    disabled={step === totalSteps}>下一步</Button>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-md bg-card">
                                        {step === 1 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold">步驟1：初始預測</h4>
                                                <p>
                                                    XGBoost從一個簡單的預測開始，對所有客戶給出相同的初始預測值（通常是目標變量的平均值或中位數）。
                                                    對於保險交叉銷售預測，這意味著所有客戶的初始購買概率是相同的。
                                                </p>
                                                <img
                                                    src="/images/model/xgboost_step1.svg"
                                                    alt="XGBoost初始預測"
                                                    className="mx-auto my-4 h-48 border p-2 rounded bg-white"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" text-anchor="middle"%3EXGBoost初始預測示意圖%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold">步驟2：構建決策樹</h4>
                                                <p>
                                                    XGBoost通過構建一系列決策樹來逐步提升模型性能。每棵樹都學習前一棵樹的殘差（實際值與預測值之間的差異），
                                                    從而不斷改進模型的預測能力。
                                                </p>
                                                <img
                                                    src="/images/model/xgboost_step2.svg"
                                                    alt="XGBoost決策樹構建"
                                                    className="mx-auto my-4 h-48 border p-2 rounded bg-white"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" text-anchor="middle"%3E決策樹構建示意圖%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold">步驟3：特徵分裂優化</h4>
                                                <p>
                                                    XGBoost使用梯度提升算法，在每個節點選擇最優的特徵和分裂點，使得分裂後的增益最大化。
                                                    增益計算考慮了預測準確性和模型複雜度的平衡，避免過擬合。
                                                </p>
                                                <img
                                                    src="/images/model/xgboost_step3.svg"
                                                    alt="XGBoost特徵分裂"
                                                    className="mx-auto my-4 h-48 border p-2 rounded bg-white"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" text-anchor="middle"%3E特徵分裂優化示意圖%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold">步驟4：集成多棵樹</h4>
                                                <p>
                                                    XGBoost逐步構建多棵決策樹，每棵新樹都專注於修正之前樹的錯誤。最終模型是所有樹的預測結果的加權和，
                                                    這種集成方法顯著提高了模型的穩定性和準確性。
                                                </p>
                                                <img
                                                    src="/images/model/xgboost_step4.svg"
                                                    alt="XGBoost集成多棵樹"
                                                    className="mx-auto my-4 h-48 border p-2 rounded bg-white"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" text-anchor="middle"%3E集成多棵樹示意圖%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {step === 5 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold">步驟5：預測與評估</h4>
                                                <p>
                                                    對於新客戶，XGBoost將其特徵值輸入到每棵決策樹中，然後組合所有樹的預測結果得到最終預測。
                                                    在我們的保險交叉銷售場景中，輸出是客戶購買車險的概率，再通過設定閾值轉換為二元分類結果。
                                                </p>
                                                <img
                                                    src="/images/model/xgboost_step5.svg"
                                                    alt="XGBoost預測過程"
                                                    className="mx-auto my-4 h-48 border p-2 rounded bg-white"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="100%25" height="100%25" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" text-anchor="middle"%3E預測與評估示意圖%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="advantages" className="space-y-4 mt-4">
                            <div className="prose max-w-none">
                                <h3>XGBoost在保險預測中的優勢</h3>

                                <h4>處理類別型特徵</h4>
                                <p>
                                    保險數據中存在多個類別型特徵（如性別、車輛年齡、損壞狀況等），XGBoost能夠有效處理這些特徵，
                                    不需要像線性模型那樣進行複雜的編碼轉換。
                                </p>

                                <h4>處理標籤不平衡問題</h4>
                                <p>
                                    在交叉銷售預測中，通常只有少數客戶會購買新產品（正例），大多數客戶不會購買（負例）。
                                    XGBoost通過scale_pos_weight參數平衡正負樣本權重，提高對少數類的預測準確性。
                                </p>

                                <h4>捕捉特徵交互作用</h4>
                                <p>
                                    客戶購買決策往往受多個因素共同影響，例如年齡和收入的組合效應。XGBoost的樹結構天然適合捕捉這種特徵間的交互作用。
                                </p>

                                <h4>對比其他算法的優勢</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left">算法</th>
                                            <th className="px-4 py-2 text-left">優點</th>
                                            <th className="px-4 py-2 text-left">缺點</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-4 py-2 font-medium">XGBoost</td>
                                            <td className="px-4 py-2">高準確率、處理缺失值、避免過擬合</td>
                                            <td className="px-4 py-2">需要調整多個超參數</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium">隨機森林</td>
                                            <td className="px-4 py-2">穩定性高、較少過擬合</td>
                                            <td className="px-4 py-2">精度略低於XGBoost</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium">邏輯回歸</td>
                                            <td className="px-4 py-2">可解釋性強、訓練快速</td>
                                            <td className="px-4 py-2">無法捕捉非線性關係</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium">神經網絡</td>
                                            <td className="px-4 py-2">處理複雜關係的能力強</td>
                                            <td className="px-4 py-2">需要大量數據、解釋性差</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ModelExplanation; 