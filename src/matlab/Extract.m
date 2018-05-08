clear all;close all;clc;
disp('----waveExtract-----');
dataWatermark=[]; %水印数据
Key=89;
% Key=input('Input the Key:');
% disp(['Key=',num2str(Key)]);

fileImage=input('Input the fileImage:');
disp(['fileImage=',fileImage]);
dataRgb=imread(fileImage);       %含水印图像
%b=dataBmp(:,:,1);g=dataBmp(:,:,2);r=dataBmp(:,:,3);

dataYcbcr=(rgb2ycbcr(dataRgb));
dataY=double(dataYcbcr(:,:,1));

[c,s]=wavedec2(dataY,3,'haar');
coef=appcoef2(c,s,'haar',3);        %取3级近似分量

[m,n]=size(coef);
%row=m/4; col=n/4;   %分块的行数、列数

numRow=size(coef,1)/4;      %将行数分为numRow块,每块(Patch)含4个元素
numCol=size(coef,2)/4;      %将列数分为numCol块
subPatch=mat2cell(coef,4*ones(1,numRow),4*ones(1,numCol));


%----qr分解、嵌入水印----
%生成秘钥
rng(Key);
numKey=randi([0,numel(subPatch)],9,1);   %列向量

for i=1:1:numel(numKey)

        ptr=numKey(i);
        subData=subPatch{ptr};
        [Q,R]=qr(double(subData));     %qr分解
        %qAvg=double( (abs(Q(2,1)) + abs(Q(3,1)))/2 );
        if( abs(Q(2,1))< abs(Q(3,1)))
            dataWatermarkTem=1;
        else
            dataWatermarkTem=0;
        end
        dataWatermark=[dataWatermark,dataWatermarkTem];
  
end
dataWatermark
disp('------Extract waveMarker end-----');
