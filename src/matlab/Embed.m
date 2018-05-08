clear all;close all;clc;
disp('----waveEmbed-----');
dataWatermark=[1,0,0,1,1,0,1,0,0]; %ˮӡ����
Key=89;         %��Կ
% Key=input('Input the Key:');
% disp(['Key=',num2str(Key)]);

factorEmbed=0.04;
t=factorEmbed;  %Ƕ��ǿ������

fileImage=input('Input the fileImage:');
disp(['fileImage=',fileImage]);
dataRgb=imread(fileImage);     %��ˮӡͼ��
Wide=size(dataRgb,1);
Hight=size(dataRgb,2);
Capacity=(Wide/32)*(Hight/32);      
Capacity=Capacity/8;        %Ƕ����������λB
%b=dataBmp(:,:,1);g=dataBmp(:,:,2);r=dataBmp(:,:,3);

dataYcbcr=(rgb2ycbcr(dataRgb));
dataY=double(dataYcbcr(:,:,1));


[c,s]=wavedec2(dataY,3,'haar');
coef=appcoef2(c,s,'haar',3);        %ȡ3�����Ʒ���

[m,n]=size(coef);
%row=m/4; col=n/4;   %�ֿ������������

numRow=size(coef,1)/4;      %��������ΪnumRow��,ÿ��(Patch)��4��Ԫ��
numCol=size(coef,2)/4;      %��������ΪnumCol��
subPatch=mat2cell(coef,4*ones(1,numRow),4*ones(1,numCol));


%----qr�ֽ⡢��ȡˮӡ----
%������Կ
rng(Key);
numKey=randi([0,numel(subPatch)],numel(dataWatermark),1);   %������

for i=1:1:numel(dataWatermark)
    
        dataWatermarkTem=double(dataWatermark(i));
        ptr=numKey(i);
        subData=subPatch{ptr};
        [Q,R]=qr(double(subData));     %qr�ֽ�
        qAvg=double( (abs(Q(2,1)) + abs(Q(3,1)))/2 );
        if(dataWatermarkTem==1)
            Q(2,1)=sign( Q(2,1) )*( qAvg-t/2);       %ע��dataWatermark�ķ�Χ
            Q(3,1)=sign( Q(3,1) )*( qAvg+t/2);
        else
            Q(2,1)=sign( Q(2,1) )*( qAvg+t/2);       %ע��dataWatermark�ķ�Χ
            Q(3,1)=sign( Q(3,1) )*( qAvg-t/2);
        end
        subData=Q*R;        %qr��任
        subPatch{ptr}=subData;
  
end
coefAfterEmbed=cell2mat(subPatch);
%---�ع�ԭʼͼ�񣬵õ���ˮӡͼ��----

coefAfterEmbed=reshape(coefAfterEmbed,[1,s(1,1)*s(1,2)]);
c(1:s(1,1)*s(1,2))=coefAfterEmbed;      %�޸�ϵ��
dataYRecon=waverec2(c,s,'haar');        %����С���ع�
err=uint8(dataY)-uint8(dataYRecon);

dataYcbcrRec=dataYcbcr;
dataYcbcrRec(:,:,1)=dataYRecon;
err=uint8(dataYcbcrRec)-uint8(dataYcbcr);

dataRgbRecon=ycbcr2rgb(dataYcbcrRec);
err=dataRgb-dataRgbRecon;

% dataRgbRecon=ycbcr2rgb(uint8(dataYcbcr));
% err=(dataRgb)-dataRgbRecon;
%  max(max(max(err)))

%--����ͼ��---
imwrite(dataRgbRecon,'ReconImagePeppers.bmp','bmp');

subplot(121);
image(dataRgb);title('Origin Image');
subplot(122);
image(dataRgbRecon);title('Reconsitution Image');
disp('------embed end-----');
