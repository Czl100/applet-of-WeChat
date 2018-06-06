# coding=utf-8

class CrpException(Exception):
    __errcode__ = 1000
    def __init__(self, value):
        super().__init__(value)
    def errcode(self):
        return self.__errcode__


class CrpLackParameter(CrpException):
    __errcode__ = 1001
    def __init__(self, value):
        super().__init__(value)