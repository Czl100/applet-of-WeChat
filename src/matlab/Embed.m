clear all;close all;clc;
disp('----waveEmbed-----');
dataWatermark=[1,0,0,1,1,0,1,0,0]; %水印数据
Key=89;         %秘钥
% Key=input('Input the Key:');
% disp(['Key=',num2str(Key)]);

factorEmbed=0.04;
t=factorEmbed;  %嵌入强度因子

fileImage=input('Input the fileImage:');
disp(['fileImage=',fileImage]);
dataRgb=imread(fileImage);     %含水印图像
Wide=size(dataRgb,1);
Hight=size(dataRgb,2);
Capacity=(Wide/32)*(Hight/32);      
Capacity=Capacity/8;        %嵌入容量，单位B
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


%----qr分解、提取水印----
%生成秘钥
rng(Key);
numKey=randi([0,numel(subPatch)],numel(dataWatermark),1);   %列向量

for i=1:1:numel(dataWatermark)
    
        dataWatermarkTem=double(dataWatermark(i));
        ptr=numKey(i);
        subData=subPatch{ptr};
        [Q,R]=qr(double(subData));     %qr分解
        qAvg=double( (abs(Q(2,1)) + abs(Q(3,1)))/2 );
        if(dataWatermarkTem==1)
            Q(2,1)=sign( Q(2,1) )*( qAvg-t/2);       %注：dataWatermark的范围
            Q(3,1)=sign( Q(3,1) )*( qAvg+t/2);
        else
            Q(2,1)=sign( Q(2,1) )*( qAvg+t/2);       %注：dataWatermark的范围
            Q(3,1)=sign( Q(3,1) )*( qAvg-t/2);
        end
        subData=Q*R;        %qr逆变换
        subPatch{ptr}=subData;
  
end
coefAfterEmbed=cell2mat(subPatch);
%---重构原始图像，得到含水印图像----

coefAfterEmbed=reshape(coefAfterEmbed,[1,s(1,1)*s(1,2)]);
c(1:s(1,1)*s(1,2))=coefAfterEmbed;      %修改系数
dataYRecon=waverec2(c,s,'haar');        %多重小波重构
err=uint8(dataY)-uint8(dataYRecon);

dataYcbcrRec=dataYcbcr;
dataYcbcrRec(:,:,1)=dataYRecon;
err=uint8(dataYcbcrRec)-uint8(dataYcbcr);

dataRgbRecon=ycbcr2rgb(dataYcbcrRec);
err=dataRgb-dataRgbRecon;

% dataRgbRecon=ycbcr2rgb(uint8(dataYcbcr));
% err=(dataRgb)-dataRgbRecon;
%  max(max(max(err)))

%--保存图像---
imwrite(dataRgbRecon,'ReconImagePeppers.bmp','bmp');

subplot(121);
image(dataRgb);title('Origin Image');
subplot(122);
image(dataRgbRecon);title('Reconsitution Image');
disp('------embed end-----');
