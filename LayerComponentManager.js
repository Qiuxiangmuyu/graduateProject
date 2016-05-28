/**
 * Created by user on 2016/5/11.
 */
function LayerComponentManager(pLayerRule)
{
    this.m_pLayerRule=pLayerRule;
    this.m_vComponents=new Array();
    this.prevComponents=new Array();

    this.m_minRamificationRatio=0.001;
    this.numComponentOfLayer0=0;
    this.numChildrenPerParent=0;

    this.SetLayerRule=function()
    {
        this.m_pLayerRule=pLayerRule;
        return this;
    }

    this.GenerateComponents=function(numChildrenPerParent,prevComponentManager,numResamplePointsOfLayerN)
    {
//        var  numResamplePointsOfLayerN=10;

        this.numChildrenPerParent=numChildrenPerParent;
        this.prevComponents=prevComponentManager.m_vComponents;
        var prevRule=prevComponentManager.m_pLayerRule;

        // 先建立上一层规则的distRatio到孩子属性的插值
        var distChildDatas=prevRule.m_vDistChildDatas;

        for(var j=0;j!=getJsonLength(distChildDatas)-1;j++)
        {
            for(var i=0;i!=getJsonLength(distChildDatas)-1-j;i++)
            {
                if(distChildDatas[i].distToBottomRatio>distChildDatas[i+1].distToBottomRatio)
                {
                    var temp=distChildDatas[i];
                    distChildDatas[i]=distChildDatas[i+1];
                    distChildDatas[i+1]=temp;
                }
            }
        }

        var numChildByInterval=prevRule.m_vNumChildByInterval;
        var numIntervals=prevRule.NumOfInterval;

        // 创建一个新的diskChildData数组，该数组只有numIntervals + 2个值，分别装原数组中每个interval内的平均值
        var intervalDistChildDatas=CalculateIntervalDistChildAverage(distChildDatas, numIntervals, numChildByInterval);

        for (var i = 0; i < getJsonLength(this.prevComponents); ++i)
        {
            var startRatio=prevRule.m_startRamificationRatio;
            var endRatio=prevRule.m_endRamificationRatio;

            var actualStartRatio=getNumberInNormalDistribution(startRatio.mean,startRatio.var);
            var actualEndRatio=getNumberInNormalDistribution(endRatio.mean,startRatio.var);
            if(actualEndRatio>1)
            {
                actualEndRatio=2-actualEndRatio;
            }

            var upLimit=0;
            for(var j=0;j!=getJsonLength(numChildByInterval);j++)
            {
                upLimit+=numChildByInterval[j].NumOfChild;
            }

            for(var j=0;j!=numChildrenPerParent;j++)
            {
                var limbComponent = new LimbComponent();

                var randomizedInterval=upLimit*Math.random();
                var ramificationInterval = this.FindRamificationInterval(numChildByInterval, randomizedInterval);
                var intervalStart = actualStartRatio + (actualEndRatio - actualStartRatio) * ramificationInterval / numIntervals;
                var intervalEnd = actualStartRatio + (actualEndRatio - actualStartRatio) * (ramificationInterval + 1) / numIntervals;
                var ramificationRatio=intervalStart+(intervalEnd-intervalStart)*Math.random();
                var betaAngle=this.InterpolationBetaAngle(intervalDistChildDatas,ramificationRatio);
                var radiusRatio=this.InterpolationRadiusRatio(intervalDistChildDatas,ramificationRatio);
                var lengthRatio=this.InterpolationLengthRatio(intervalDistChildDatas,ramificationRatio);

                var initRadius=this.prevComponents[i].GetRadius()[0] * radiusRatio;

                var lengthX=this.prevComponents[i].GetCenters()[getJsonLength(this.prevComponents[i].GetCenters())-1].x-this.prevComponents[i].GetCenters()[0].x;
                var lengthY=this.prevComponents[i].GetCenters()[getJsonLength(this.prevComponents[i].GetCenters())-1].y-this.prevComponents[i].GetCenters()[0].y;
                var lengthZ=this.prevComponents[i].GetCenters()[getJsonLength(this.prevComponents[i].GetCenters())-1].z-this.prevComponents[i].GetCenters()[0].z;
                var length=Math.sqrt(lengthX*lengthX+lengthY*lengthY+lengthZ*lengthZ);
                var initLength=length*lengthRatio;

                limbComponent=this.GenerateSingleLimb(initRadius, initLength,numResamplePointsOfLayerN);
                limbComponent.SetBetaAngle(betaAngle);

                var pathRatios=new Array();
                for(var a=0;a!=getJsonLength(this.prevComponents[i].GetPathRatios());a++)
                {
                    pathRatios[a]=this.prevComponents[i].GetPathRatios()[a];
                }
                if(ramificationRatio<this.m_minRamificationRatio)
                {
                    ramificationRatio=this.m_minRamificationRatio;
                }

                pathRatios[getJsonLength(pathRatios)]=ramificationRatio;
                limbComponent.SetPathRatios(pathRatios);

                this.m_vComponents[numChildrenPerParent*i+j]=limbComponent;


            }

        }
    }

    this.GenerateComponentsFor0=function(numSamples,initRadius,initLength,numResamplePointsOfLayer0)
    {
//        var numResamplePointsOfLayer0=10;
        this.numComponentOfLayer0=numSamples;
        for(var i=0;i!=numSamples;i++)
        {
            var limbComponent=new LimbComponent();
            limbComponent=this.GenerateSingleLimb(initRadius,initLength, numResamplePointsOfLayer0);


//            limbComponent.m_vCenters[0].x=0;
//            limbComponent.m_vCenters[0].z=0;
            for(var j=1;j!= numResamplePointsOfLayer0-4;j++)
            {
                limbComponent.m_vCenters[j].x=limbComponent.m_vCenters[0].x+(limbComponent.m_vCenters[j].x-limbComponent.m_vCenters[0].x)*0.5;
                limbComponent.m_vCenters[j].z=limbComponent.m_vCenters[0].z+(limbComponent.m_vCenters[j].z-limbComponent.m_vCenters[0].z)*0.5;
            }
/*            for(var j=numResamplePointsOfLayer0-5;j!= numResamplePointsOfLayer0;j++)
            {
                limbComponent.m_vCenters[j].x=limbComponent.m_vCenters[j-1].x+(Math.random())*0.2*j;
                limbComponent.m_vCenters[j].z=limbComponent.m_vCenters[j-1].z+(Math.random())*0.2*j;
            }*/

            limbComponent.SetBetaAngle(0);
            this.m_vComponents[i]=limbComponent;
        }
    }

    this.PrintLimbComponentFor0=function()
    {
        var x=0;
        for(var j=0;j!=this.numComponentOfLayer0;j++)
        {
            document.write(x+"</br>");
            x++;

            var limb=this.m_vComponents[j];
            var BetaAngle=limb.GetBetaAngle();
            var Radius=limb.GetRadius();
            var PathRatios=limb.GetPathRatios();
            var Centers=limb.GetCenters();

            document.write("BetaAngle:"+BetaAngle+"</br>");

            document.write("PathRatios:");
            for(var a=0;a!=getJsonLength(PathRatios);a++)
            {
                document.write(PathRatios[a]+" ");
            }
            document.write("</br>");

            document.write("Radius:");
            for(var a=0;a!=getJsonLength(Radius);a++)
            {
                document.write(Radius[a]+" ");
            }
            document.write("</br>");

            document.write("CentersX:");
            for(var a=0;a!=getJsonLength(Centers);a++)
            {
                document.write(Centers[a].x+" ");
            }
            document.write("</br>");

            document.write("CentersY:");
            for(var a=0;a!=getJsonLength(Centers);a++)
            {
                document.write(Centers[a].y+" ");
            }
            document.write("</br>");

            document.write("CentersZ:");
            for(var a=0;a!=getJsonLength(Centers);a++)
            {
                document.write(Centers[a].z+" ");
            }
            document.write("</br>");

            document.write("</br>");
        }
        document.write("</br>");
    }

    this.PrintLimbComponent=function()
    {
        //输出第n层的组件信息
        var x=0;
        for (var i = 0; i < getJsonLength(this.prevComponents); ++i)
        {
            for(var j=0;j!=this.numChildrenPerParent;j++)
            {
                document.write(x+"</br>");
                x++;

                var limb=this.m_vComponents[this.numChildrenPerParent*i+j];
                var BetaAngle=limb.GetBetaAngle();
                var Radius=limb.GetRadius();
                var PathRatios=limb.GetPathRatios();
                var Centers=limb.GetCenters();

                document.write("BetaAngle:"+BetaAngle+"</br>");

                document.write("PathRatios:");
                for(var a=0;a!=getJsonLength(PathRatios);a++)
                {
                    document.write(PathRatios[a]+" ");
                }
                document.write("</br>");

                document.write("Radius:");
                for(var a=0;a!=getJsonLength(Radius);a++)
                {
                    document.write(Radius[a]+" ");
                }
                document.write("</br>");

                document.write("CentersX:");
                for(var a=0;a!=getJsonLength(Centers);a++)
                {
                    document.write(Centers[a].x+" ");
                }
                document.write("</br>");

                document.write("CentersY:");
                for(var a=0;a!=getJsonLength(Centers);a++)
                {
                    document.write(Centers[a].y+" ");
                }
                document.write("</br>");

                document.write("CentersZ:");
                for(var a=0;a!=getJsonLength(Centers);a++)
                {
                    document.write(Centers[a].z+" ");
                }
                document.write("</br>");

                document.write("</br>");
            }
            document.write("</br>");
        }
    }

    this.GetComponents=function()
    {
        var components;

        return components;
    }

    this.FindRamificationInterval=function(numChildByInterval,ramificationPosition)
    {
        var sum=0;
        for(var k=0;k!=getJsonLength(numChildByInterval);k++)
        {
            sum+=numChildByInterval[k].NumOfChild;
            if(ramificationPosition<sum)
                return k;
        }
        return getJsonLength(numChildByInterval)-1;
    }

    this.GenerateSingleLimb=function(initRadius,initLength,numResamplePoints)
    {
        var limbComponent=new LimbComponent();

        var vRadiusRatio=Array();
        var vGravityPurturb=Array();
        var vAnotherPurturb=Array();
        this.GenerateControlPointsBasedOnStatistics(vRadiusRatio, vGravityPurturb, vAnotherPurturb);

        var vResampleRadius=new Array(numResamplePoints);
        vResampleRadius[0]=initRadius;

        var vResampleCenters=new Array(numResamplePoints);
        for(var i=0;i!=numResamplePoints;i++)
        {
            vResampleCenters[i]=
            {
                "x":0,
                "y":0,
                "z":0
            };
        }

        for (var i = 1; i < numResamplePoints; ++i)
        {
            var interpRadius=this.InterpolationRadius(vRadiusRatio,i*(getJsonLength(vRadiusRatio)-1)/(numResamplePoints-1));
            var interpGravity=this.InterpolationGravity(vGravityPurturb,i*(getJsonLength(vRadiusRatio)-1)/(numResamplePoints-1));
            var interpAnother=this.InterpolationAnother(vAnotherPurturb,i*(getJsonLength(vRadiusRatio)-1)/(numResamplePoints-1));

            var originalPosition=
            {
                "x":0,
                "y":i / (numResamplePoints - 1) * initLength,
                "z":0
            };

            vResampleCenters[i].x=originalPosition.x+interpGravity*initLength+0;
            vResampleCenters[i].y=originalPosition.y+0+0;
            vResampleCenters[i].z=originalPosition.z+0+interpAnother*initLength;

            vResampleRadius[i] = interpRadius * initRadius;
        }

        limbComponent.SetCenters(vResampleCenters);
        limbComponent.SetRadius(vResampleRadius);

        return limbComponent;
    }

    this.GenerateControlPointsBasedOnStatistics=function(vRadiusRatio,vGravityPurturb,vAnotherPurturb)
    {
        var minRatio=0.000001;
        for (var j = 0; j!=this.m_pLayerRule.NumOfControlPoint; ++j)
        {
            var radiusRatio=getNumberInNormalDistribution(this.m_pLayerRule.m_vControlPointsRadiusRatio[j].mean,this.m_pLayerRule.m_vControlPointsRadiusRatio[j].var);
            radiusRatio = radiusRatio < minRatio ? minRatio : radiusRatio;
            vRadiusRatio[j]=radiusRatio;

            var gravity=getNumberInNormalDistribution(this.m_pLayerRule.m_vControlPointsPurturbGravity[j].mean,this.m_pLayerRule.m_vControlPointsPurturbGravity[j].var);
            var maxPurturbRatio=1;
            function GetSign(input)
            {
                return input<0 ? -1:1;
            }
            var sign=GetSign(gravity);
            gravity=Math.abs(gravity)>maxPurturbRatio ? maxPurturbRatio*sign:gravity;
            vGravityPurturb[j]=gravity;

            var another=getNumberInNormalDistribution(this.m_pLayerRule.m_vControlPointsPurturbAnother[j].mean,this.m_pLayerRule.m_vControlPointsPurturbAnother[j].var);
            var sign=GetSign(another);
            another = Math.abs(another) > maxPurturbRatio ? maxPurturbRatio * sign : another;
            vAnotherPurturb[j]=another;
        }
    }

    this.InterpolationRadius= function (vRadiusRatio,t)
    {
        var interpRadius=0;
        for(var i=1;i!=getJsonLength(vRadiusRatio);i++)
        {
            if((t<=i)&&(t>i-1))
            {
                var ratio=(t-(i-1))/1;
                interpRadius=vRadiusRatio[i-1]+ratio*(vRadiusRatio[i]-vRadiusRatio[i-1]);
            }
        }
        return interpRadius;
    }

    this.InterpolationGravity= function (vGravityPurturb,t)
    {
        var interpGravity=0;
        for(var i=1;i!=getJsonLength(vGravityPurturb);i++)
        {
            if((t<=i)&&(t>i-1))
            {
                var ratio=(t-(i-1))/1;
                interpGravity=vGravityPurturb[i-1]+ratio*(vGravityPurturb[i]-vGravityPurturb[i-1]);
            }
        }
        return interpGravity;
    }

    this.InterpolationAnother= function (vAnotherPurturb,t)
    {
        var interpAnother=0;
        for(var i=1;i!=getJsonLength(vAnotherPurturb);i++)
        {
            if((t<=i)&&(t>i-1))
            {
                var ratio=(t-(i-1))/1;
                interpAnother=vAnotherPurturb[i-1]+ratio*(vAnotherPurturb[i]-vAnotherPurturb[i-1]);
            }
        }
        return interpAnother;
    }

    this.InterpolationBetaAngle=function(distChildDatas,ramificationRatio)
    {
        var betaAngle=0;
        for(var i=1;i!=getJsonLength(distChildDatas);i++)
        {
            if((ramificationRatio<=(distChildDatas[i].distToBottomRatio))&&(ramificationRatio>(distChildDatas[i-1].distToBottomRatio)))
            {
                var ratio=(ramificationRatio-distChildDatas[i-1].distToBottomRatio)/(distChildDatas[i].distToBottomRatio-distChildDatas[i-1].distToBottomRatio);
                betaAngle=distChildDatas[i-1].childBetaAngle+ratio*(distChildDatas[i].childBetaAngle-distChildDatas[i-1].childBetaAngle);
            }
        }
        return betaAngle;
    }

    this.InterpolationRadiusRatio=function(distChildDatas,ramificationRatio)
    {
        var radiusRatio=0;
        for(var i=1;i!=getJsonLength(distChildDatas);i++)
        {
            if((ramificationRatio<=(distChildDatas[i].distToBottomRatio))&&(ramificationRatio>(distChildDatas[i-1].distToBottomRatio)))
            {
                var ratio=(ramificationRatio-distChildDatas[i-1].distToBottomRatio)/(distChildDatas[i].distToBottomRatio-distChildDatas[i-1].distToBottomRatio);
                radiusRatio=distChildDatas[i-1].childRadiusRatio+ratio*(distChildDatas[i].childRadiusRatio-distChildDatas[i-1].childRadiusRatio);
            }
        }
        return radiusRatio;
    }

    this.InterpolationLengthRatio=function(distChildDatas,ramificationRatio)
    {
        var lengthRatio=0;
        for(var i=1;i!=getJsonLength(distChildDatas);i++)
        {
            if((ramificationRatio<=(distChildDatas[i].distToBottomRatio))&&(ramificationRatio>(distChildDatas[i-1].distToBottomRatio)))
            {
                var ratio=(ramificationRatio-distChildDatas[i-1].distToBottomRatio)/(distChildDatas[i].distToBottomRatio-distChildDatas[i-1].distToBottomRatio);
                lengthRatio=distChildDatas[i-1].childLengthRatio+ratio*(distChildDatas[i].childLengthRatio-distChildDatas[i-1].childLengthRatio);
            }
        }
        return lengthRatio;
    }
}

var CalculateIntervalDistChildAverage=function(distChildDatas,numIntervals,numChildByInterval)
{
    var intervalDistChildDatas=new Array();

    for(var i=0;i!=numIntervals+2;i++)
    {
        var v={
            "childBetaAngle" : 0,
            "childLengthRatio" : 0,
            "childRadiusRatio" : 0,
            "distToBottomRatio" : 0,
            "numChildren" : 0
        }
        intervalDistChildDatas[i]=v;
    }

    intervalDistChildDatas[0] = distChildDatas[0];
    intervalDistChildDatas[numIntervals + 1] = distChildDatas[getJsonLength(distChildDatas)-1];
    var vDistRatios=new Array(getJsonLength(distChildDatas));
    var vBetaAngles=new Array(getJsonLength(distChildDatas));
    var vRadiusRatio=new Array(getJsonLength(distChildDatas));
    var vLengthRatio=new Array(getJsonLength(distChildDatas));

    for (var i = 0; i < getJsonLength(distChildDatas); ++i)
    {
        vDistRatios[i] = distChildDatas[i].distToBottomRatio;
        vBetaAngles[i] = distChildDatas[i].childBetaAngle;
        vRadiusRatio[i] = distChildDatas[i].childRadiusRatio;
        vLengthRatio[i] = distChildDatas[i].childLengthRatio;
    }

    var base = 0;
    for (var i = 0; i < numIntervals; ++i) {
        var offset = base + numChildByInterval[i].NumOfChild;
        // distToBottomRatio
        intervalDistChildDatas[i + 1].distToBottomRatio = accumulate(vDistRatios, base, offset, 0.0) / numChildByInterval[i].NumOfChild;
        // betaAngle
        intervalDistChildDatas[i + 1].childBetaAngle = accumulate(vBetaAngles, base, offset, 0.0) / numChildByInterval[i].NumOfChild;
        // radiusRatio
        intervalDistChildDatas[i + 1].childRadiusRatio = accumulate(vRadiusRatio, base, offset, 0.0) / numChildByInterval[i].NumOfChild;
        // lengthRatio
        intervalDistChildDatas[i + 1].childLengthRatio = accumulate(vLengthRatio, base, offset, 0.0) / numChildByInterval[i].NumOfChild;
        base = offset;
    }
    return intervalDistChildDatas;
}




