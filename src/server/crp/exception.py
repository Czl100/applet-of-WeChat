# coding=utf-8

class CrpException(Exception):
    __errcode__ = 1000
    def __init__(self, value):
        super(CrpException, self).__init__(value)
    def errcode(self):
        return self.__errcode__

    