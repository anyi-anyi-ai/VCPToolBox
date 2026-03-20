# python_pkg_resources_patch.py
# 为 Python 3.12+ 提供 pkg_resources 兼容性支持
# 用于解决 win10toast 等旧库的导入问题

import sys
import importlib.metadata

class _Requirement:
    """pkg_resources.Requirement 的兼容层"""
    def __init__(self, *args, **kwargs):
        pass

class _Distribution:
    """pkg_resources.Distribution 的兼容层"""
    pass

def _get_distribution(dist):
    """pkg_resources.get_distribution 的兼容层"""
    try:
        return importlib.metadata.distribution(dist)
    except Exception:
        return None

def _resource_filename(package_or_requirement, resource_name):
    """pkg_resources.resource_filename 的兼容层"""
    try:
        import importlib.resources as importlib_resources
        return str(importlib_resources.files(package_or_requirement) / resource_name)
    except Exception:
        return ''

# 创建 pkg_resources 模块并注入到 sys.modules
pkg_resources_module = type(sys)('pkg_resources')
pkg_resources_module.Requirement = _Requirement
pkg_resources_module.Distribution = _Distribution
pkg_resources_module.get_distribution = _get_distribution
pkg_resources_module.resource_filename = _resource_filename
pkg_resources_module.working_set = lambda: []

sys.modules['pkg_resources'] = pkg_resources_module

# 自动执行注入
# 这样在任何代码导入 pkg_resources 之前就已经准备好了
