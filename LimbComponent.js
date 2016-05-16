/**
 * Created by user on 2016/5/11.
 */
function LimbComponent()
{
    this.m_betaAngle=0;
    this.m_vPathRatios=new Array();
    this.m_vCenters=new Array();
    this.m_vRadius=new Array();

    this.SetCenters=function(vCenters)
    {
        this.m_vCenters=vCenters;
    }

    this.SetRadius=function(vRadius)
    {
        this.m_vRadius=new Array(getJsonLength(vRadius));
        this.m_vRadius[0] = vRadius[0];
        for (var i = 1; i < getJsonLength(vRadius); ++i)
        {
            if (vRadius[i] > vRadius[i - 1])
                this.m_vRadius[i] = vRadius[i - 1];
            else
                this.m_vRadius[i] = vRadius[i];
        }
    }

    this.SetBetaAngle=function(betaAngle)
    {
        this.m_betaAngle=betaAngle;
    }

    this.SetPathRatios=function(vPathRatios)
    {
        this.m_vPathRatios=vPathRatios;
    }

    this.GetCenters=function()
    {
        return this.m_vCenters;
    }

    this.GetRadius=function()
    {
        return this.m_vRadius;
    }

    this.GetBetaAngle=function()
    {
        return this.m_betaAngle;
    }

    this.GetPathRatios=function()
    {
        return this.m_vPathRatios;
    }
}