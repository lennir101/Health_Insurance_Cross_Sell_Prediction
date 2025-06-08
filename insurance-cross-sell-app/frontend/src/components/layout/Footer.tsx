import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 md:h-16">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} 保險交叉銷售預測系統. 版權所有.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            隱私政策
          </Link>
          <Link
            to="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            服務條款
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 