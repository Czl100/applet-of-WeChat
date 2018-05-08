clear all;close all;clc;
disp('----waveExtract-----');
dataWatermark=[]; %ˮӡ����
Key=89;
% Key=input('Input the Key:');
% disp(['Key=',num2str(Key)]);

fileImage=input('Input the fileImage:');
disp(['fileImage=',fileImage]);
dataRgb=imread(fileImage);       %��ˮӡͼ��
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


%----qr�ֽ⡢Ƕ��ˮӡ----
%������Կ
rng(Key);
numKey=randi([0,numel(subPatch)],9,1);   %������

for i=1:1:numel(numKey)

        ptr=numKey(i);
        subData=subPatch{ptr};
        [Q,R]=qr(double(subData));     %qr�ֽ�
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
