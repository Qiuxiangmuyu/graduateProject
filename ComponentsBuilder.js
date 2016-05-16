/**
 * Created by user on 2016/5/11.
 */
function BuildComponents()
{
    var m_initRadius=0.162239;
    var m_initLength=4.81554;
    var numChildPerComponent=5;

    var rule0=rule.Layer0;
    var componentManager0=new LayerComponentManager(rule0);
    componentManager0.GenerateComponentsFor0(numChildPerComponent,m_initRadius,m_initLength);
    componentManager0.PrintLimbComponentFor0();

//    var rule1=rule.Layer1;
//    var componentManager1=new LayerComponentManager(rule1);
//    componentManager1.GenerateComponents(numChildPerComponent,componentManager0);
//    componentManager1.PrintLimbComponent();

//    var rule2=rule.Layer2;
//    var componentManager2=new LayerComponentManager(rule2);
//    componentManager2.GenerateComponents(numChildPerComponent,componentManager1);
//    componentManager2.PrintLimbComponent();

//    var rule3=rule.Layer3;
//    var componentManager3=new LayerComponentManager(rule3);
//    componentManager3.GenerateComponents(numChildPerComponent,componentManager2);
//    componentManager3.PrintLimbComponent();

    TreeCompositor();
}

var TreeCompositor=function()
{

}

var GetFiveBranchRatio=function()
{
    var ramificationRatio=new Array(5);

    var startRatio = rule.Layer0.m_startRamificationRatio;
    var endRatio = rule.Layer0.m_endRamificationRatio;

    var actualStartRatio = getNumberInNormalDistribution(startRatio.mean, startRatio.var);
    var actualEndRatio = getNumberInNormalDistribution(endRatio.mean, startRatio.var);
    if (actualEndRatio > 1)
    {
        actualEndRatio = 2 - actualEndRatio;
    }

    ramificationRatio[0] = actualStartRatio + 0.2*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[1] = actualStartRatio + 0.2*(actualEndRatio - actualStartRatio)+0.2*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[2] = actualStartRatio + 0.4*(actualEndRatio - actualStartRatio)+0.2*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[3] = actualStartRatio + 0.6*(actualEndRatio - actualStartRatio)+0.2*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[4] = actualStartRatio + 0.8*(actualEndRatio - actualStartRatio)+0.2*(actualEndRatio - actualStartRatio)* Math.random();

    return ramificationRatio;
}