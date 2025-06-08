import React from 'react';
import { PageContainer } from '@/components/layout';

const HomePage: React.FC = () => {
  return (
    <PageContainer
      title="保險交叉銷售預測系統"
      description="預測健康保險客戶對車險的興趣"
      className="flex items-center justify-center min-h-[80vh]"
    >
      <div className="flex flex-col items-center space-y-6 text-center">
        <p className="text-lg">
          此系統運用機器學習模型，幫助保險公司識別可能有興趣購買車險的健康保險客戶。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">單一客戶預測</h3>
            <p className="text-muted-foreground">輸入客戶資料，獲取購買車險的可能性預測。</p>
          </div>
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">批量預測</h3>
            <p className="text-muted-foreground">上傳包含多個客戶資料的 CSV 文件，進行批量預測。</p>
          </div>
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">數據分析</h3>
            <p className="text-muted-foreground">查看保險客戶數據統計和模型表現指標。</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage; 