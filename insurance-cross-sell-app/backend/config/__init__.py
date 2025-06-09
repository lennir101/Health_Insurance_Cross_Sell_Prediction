"""
配置包初始化文件
"""
import os
from .development import DevelopmentConfig
from .production import ProductionConfig

# 配置字典
config_dict = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config(config_name=None):
    """
    獲取配置類
    """
    if not config_name:
        config_name = os.environ.get('FLASK_ENV', 'default')

    return config_dict.get(config_name, config_dict['default'])
