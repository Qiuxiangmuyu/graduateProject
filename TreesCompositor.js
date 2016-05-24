/**
 * Created by user on 2016/5/11.
 */
function TreesCompositor()
{
//    var m_initRadius=0.162239;
//    var m_initLength=4.81554;
    var m_initRadius=1.62239;
    var m_initLength=48.1554;
    var numChildPerComponent=7;
    //每个父亲有五个孩子
    var numChildPerParent=7;
    var numResamplePoints=15;

    var rule0=rule.Layer0;
    var componentManager0=new LayerComponentManager(rule0);
    componentManager0.GenerateComponentsFor0(1,m_initRadius,m_initLength);
//    componentManager0.PrintLimbComponentFor0();

    var rule1=rule.Layer1;
    var componentManager1=new LayerComponentManager(rule1);
    componentManager1.GenerateComponents(numChildPerComponent,componentManager0);
//    componentManager1.PrintLimbComponent();

    var rule2=rule.Layer2;
    var componentManager2=new LayerComponentManager(rule2);
    componentManager2.GenerateComponents(numChildPerComponent,componentManager1);
//    componentManager2.PrintLimbComponent();

//    var rule3=rule.Layer3;
//    var componentManager3=new LayerComponentManager(rule3);
//    componentManager3.GenerateComponents(numChildPerComponent,componentManager2);
//    componentManager3.PrintLimbComponent();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
    renderer.setClearColor(new THREE.Color(0x000000, 1.0));
    document.getElementById("WEB-GL").appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 1000 );
    camera.position.y = 0;
    camera.position.z = 0;
    camera.position.x = 0;
    camera.lookAt(camera.position);

//////////添加控制器
    var controls;
    var raycaster;
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    var controlsEnabled = false;
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var canJump = false;
    var prevTime = performance.now();
    var velocity = new THREE.Vector3();

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var element = document.body;

        var pointerlockchange = function ( event ) {

            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                controlsEnabled = true;
                controls.enabled = true;

                blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        };

        var pointerlockerror = function ( event ) {

            instructions.style.display = '';

        };

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        instructions.addEventListener( 'click', function ( event ) {

            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if ( /Firefox/i.test( navigator.userAgent ) ) {

                var fullscreenchange = function ( event ) {

                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                        element.requestPointerLock();
                    }

                };

                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                element.requestFullscreen();

            } else {

                element.requestPointerLock();

            }

        }, false );

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }

    init();
    animate();


    function init() {


        controls = new THREE.PointerLockControls( camera );
        scene.add( controls.getObject() );

        var onKeyDown = function ( event ) {

            switch ( event.keyCode ) {

                case 38: // up
                case 87: // w
                    moveForward = true;
                    break;

                case 37: // left
                case 65: // a
                    moveLeft = true; break;

                case 40: // down
                case 83: // s
                    moveBackward = true;
                    break;

                case 39: // right
                case 68: // d
                    moveRight = true;
                    break;

                case 32: // space
                    if ( canJump === true ) velocity.y += 350;
                    canJump = false;
                    break;

            }

        };

        var onKeyUp = function ( event ) {

            switch( event.keyCode ) {

                case 38: // up
                case 87: // w
                    moveForward = false;
                    break;

                case 37: // left
                case 65: // a
                    moveLeft = false;
                    break;

                case 40: // down
                case 83: // s
                    moveBackward = false;
                    break;

                case 39: // right
                case 68: // d
                    moveRight = false;
                    break;

            }

        };

        document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );

        raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    }


    function animate() {

        requestAnimationFrame( animate );

        if ( controlsEnabled ) {
            raycaster.ray.origin.copy( controls.getObject().position );
            raycaster.ray.origin.y -= 10;


            var time = performance.now();
            var delta = ( time - prevTime ) / 1000;

            velocity.x -= velocity.x * 10.0 * delta;
            velocity.z -= velocity.z * 10.0 * delta;

            velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            if ( moveForward ) velocity.z -= 200.0 * delta;
            if ( moveBackward ) velocity.z += 200.0 * delta;

            if ( moveLeft ) velocity.x -= 200.0 * delta;
            if ( moveRight ) velocity.x += 200.0 * delta;


            controls.getObject().translateX( 1*velocity.x * delta );
            controls.getObject().translateY( 1*velocity.y * delta );
            controls.getObject().translateZ( 1*velocity.z * delta );

            if ( controls.getObject().position.y < 10 ) {

                velocity.y = 0;
                controls.getObject().position.y = 10;

                canJump = true;

            }

            prevTime = time;

        }

        renderer.render( scene, camera );

    }
///////

    // add spotlight for the shadows
    var spotLight0 = new THREE.SpotLight(0xaaaaaa);
    spotLight0.position.set(-200, 400, 200);
    spotLight0.castShadow = true;
    scene.add(spotLight0);

    var directionalLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
    directionalLight.position.set( 200, 400, 200 );
    directionalLight.castShadow = true;
    scene.add( directionalLight );

    var directionalLight1 = new THREE.DirectionalLight( 0xeeeeee, 1 );
    directionalLight1.position.set( 200, 400, -200 );
    directionalLight1.castShadow = true;
    scene.add( directionalLight1 );

    var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight2.position.set( 180, -400, -180 );
    directionalLight2.castShadow = true;
    scene.add( directionalLight2 );

    var planeGeometry=new THREE.PlaneGeometry(1000,1000,10,10);
    var map = new THREE.TextureLoader().load( 'imgs/grassland.jpg' );
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(20,20);
//    map.anisotropy = 5;
    var material = new THREE.MeshLambertMaterial( { map: map } );
    var plane = new THREE.Mesh( planeGeometry, material );

//    var planeMaterial = new THREE.MeshLambertMaterial({color: 0x77dd99});
//    var plane=new THREE.Mesh(planeGeometry,planeMaterial);
    plane.receiveShadow = true;
    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    scene.add(plane);


    var planeGeometry1=new THREE.PlaneGeometry(400,400,10,10);
    var map1 = new THREE.TextureLoader().load( 'imgs/bluesky_front1.jpg' );
    var material1 = new THREE.MeshLambertMaterial( { map: map1 } );
//    var planeMaterial1 = new THREE.MeshLambertMaterial({color: 0x77dd99});
    var plane1=new THREE.Mesh(planeGeometry1,material1);
    plane1.receiveShadow = true;
    // rotate and position the plane
    plane1.position.x = 0;
    plane1.position.y = 200;
    plane1.position.z = -200;
    scene.add(plane1);

    var planeGeometry2=new THREE.PlaneGeometry(400,400,10,10);
    var map2 = new THREE.TextureLoader().load( 'imgs/bluesky_left1.jpg' );
    var material2 = new THREE.MeshLambertMaterial( { map: map2 } );
//    var planeMaterial2 = new THREE.MeshLambertMaterial({color: 0x77dd99});
    var plane2=new THREE.Mesh(planeGeometry2,material2);
    plane2.receiveShadow = true;
    // rotate and position the plane
    plane2.rotation.y = 0.5 * Math.PI;
    plane2.position.x = -200;
    plane2.position.y = 200;
    plane2.position.z = 0;
    scene.add(plane2);

    var planeGeometry3=new THREE.PlaneGeometry(400,400,10,10);
    var map3 = new THREE.TextureLoader().load( 'imgs/bluesky_back1.jpg' );
    var material3 = new THREE.MeshLambertMaterial( { map: map3 } );
//    var planeMaterial3 = new THREE.MeshLambertMaterial({color: 0x77dd99});
    var plane3=new THREE.Mesh(planeGeometry3,material3);
    plane3.receiveShadow = true;
    // rotate and position the plane
    plane3.rotation.y = 1 * Math.PI;
    plane3.position.x = 0;
    plane3.position.y = 200;
    plane3.position.z = 200;
    scene.add(plane3);

    var planeGeometry4=new THREE.PlaneGeometry(400,400,10,10);
    var map4 = new THREE.TextureLoader().load( 'imgs/bluesky_right1.jpg' );
    var material4 = new THREE.MeshLambertMaterial( { map: map4 } );
//    var planeMaterial4 = new THREE.MeshLambertMaterial({color: 0x77dd99});
    var plane4=new THREE.Mesh(planeGeometry4,material4);
    plane4.receiveShadow = true;
    // rotate and position the plane
    plane4.rotation.y = 1.5 * Math.PI;
    plane4.position.x = 200;
    plane4.position.y = 200;
    plane4.position.z = 0;
    scene.add(plane4);

    var planeGeometry5=new THREE.PlaneGeometry(400,400,10,10);
    var map5 = new THREE.TextureLoader().load( 'imgs/bluesky_top.JPG' );
    var material5 = new THREE.MeshLambertMaterial( { map: map5 } );
//    var planeMaterial5 = new THREE.MeshLambertMaterial({color: 0x77dd99});
    var plane4=new THREE.Mesh(planeGeometry5,material5);
    plane4.receiveShadow = true;
    // rotate and position the plane
    plane4.rotation.x = 0.5 * Math.PI;
    plane4.position.x = 0;
    plane4.position.y = 200;
    plane4.position.z = 0;
    scene.add(plane4);


    var map = new THREE.TextureLoader().load( 'imgs/bark1.jpg' );
    var material = new THREE.MeshLambertMaterial( { map: map } );
    var geometry1 = new THREE.BoxBufferGeometry( 10, 10, 10 );
    var mesh = new THREE.Mesh( geometry1, material );
    mesh.position.z=-30;
    mesh.position.y=5;
    mesh.position.x=10;
    scene.add( mesh );

//渲染整棵树
    var TreeCompositor=function()
    {
        var treePosition0=
        {
            x:-50,
            y:0,
            z:-50
        };

        var treePosition=[];
        for(var i=0;i!=2;i++)
        {
            for(var j=0;j!=3;j++)
            {
                var temp=
                {
                    x:0,
                    y:0,
                    z:0
                };
                temp.x=treePosition0.x+j*50;
                temp.y=treePosition0.y;
                temp.z=treePosition0.z+i*100;
                treePosition.push(temp);
            }
        }

        var componentIndex=Math.round(Math.random()*(numChildPerComponent-1));
        for(var i=0;i!=6;i++)
        {
            CompositorOfLayer0(treePosition[i],0,(2*Math.PI)*(Math.random()));
        }
//        CompositorOfLayer0(treePosition0,componentIndex);
//        CompositorOfLayer0(treePosition1,componentIndex);
//        CompositorOfLayer0(treePosition2,componentIndex);


    }

//渲染第0层的某个枝干
    var CompositorOfLayer0=function(position,componentIndex,rotation)
    {
        var limb0=new THREE.Object3D();
        for(var i=0;i!=numResamplePoints-1;i++)
        {
            //渲染枝条第一段
            var componentIndex=componentIndex;
            var geometry = new THREE.Geometry();
            var vertices=GetVertices(componentManager0,componentIndex,i);
            var faces=GetFaces();
            geometry.vertices=vertices;
            geometry.faces=faces;
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            //       var material = new THREE.MeshLambertMaterial({color: 0x00ff00});
            var materials = [
                new THREE.MeshLambertMaterial({opacity: 0.6, color: 0x44bb44, transparent: true}),
                new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true}),
            ];

           var tube = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
            tube.children.forEach(function (e) {
//              e.castShadow = true
            });
            limb0.add(tube);
        }

        limb0.position.x=position.x;
        limb0.position.y=position.y;
        limb0.position.z=position.z;

        limb0.rotation.y=rotation;

//        limb0.castShadow=true;

        var fiveBranchRatio=GetBranchRatio();
        var pathRatio=[];

        for(var i=0;i!=numChildPerParent;i++)
        {
            var pathRatioX=[];
            for(var j=0;j!=getJsonLength(pathRatio);j++)
            {
                pathRatioX.push(pathRatio[j]);
            }
            pathRatioX.push(fiveBranchRatio[i]);
//            document.write(pathRatioX[0]+"</br>");
            var bestLimb=GetBestLimb(componentManager1,pathRatioX);

            var position=
            {
                x:GetInterpolationX(componentManager0,componentIndex,fiveBranchRatio[i]),
                y:GetInterpolationY(componentManager0,componentIndex,fiveBranchRatio[i]),
                z:GetInterpolationZ(componentManager0,componentIndex,fiveBranchRatio[i])
            }
            CompositorOfLayer1(position,fiveBranchRatio[i],bestLimb,i,pathRatioX,limb0);
//            document.write(bestLimb.m_vRadius[i]+"</br>");
//            document.write(position.x+" "+position.y+" "+position.z+"</br>");
        }
        scene.add(limb0);
        renderer.render(scene, camera);


    }

//渲染第1层的某个枝干
    var CompositorOfLayer1=function(position,ratio,limbComponent,index,pathRatioX,limb0)
    {
        var limb1=new THREE.Object3D();
        for(var i=0;i!=numResamplePoints-1;i++)
        {
            //渲染枝条第一段
            var geometry1 = new THREE.Geometry();
            var vertices1=GetVerticesByComponent(limbComponent,i);
            var faces1=GetFaces();
            geometry1.vertices=vertices1;
            geometry1.faces=faces1;
            //geometry.computeBoundingSphere();
            geometry1.computeFaceNormals();

            var materials1 = [
                new THREE.MeshLambertMaterial({opacity: 0.6, color: 0x44bb44, transparent: true}),
                new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})

            ];

            var tube1 = THREE.SceneUtils.createMultiMaterialObject(geometry1, materials1);
            tube1.children.forEach(function (e) {
//              e.castShadow = true
            });
            limb1.add(tube1);
        }

        var pathRatioX=pathRatioX;
        var fiveBranchRatio=GetBranchRatio();
        for(var i=0;i!=numChildPerParent;i++)
        {
            var pathRatioXX=[];
            for(var j=0;j!=getJsonLength(pathRatioX);j++)
            {
                pathRatioXX.push(pathRatioX[j]);
            }
            pathRatioXX.push(fiveBranchRatio[i]);

            var bestLimb=GetBestLimb(componentManager2,pathRatioXX);

            var position1=
            {
                x:GetInterpolationXByComponent(limbComponent,fiveBranchRatio[i]),
                y:GetInterpolationYByComponent(limbComponent,fiveBranchRatio[i]),
                z:GetInterpolationZByComponent(limbComponent,fiveBranchRatio[i])
            }

            CompositorOfLayer2(position1,fiveBranchRatio[i],bestLimb,i,pathRatioXX,limb1);
        }


        limb1.position.x=position.x;
        limb1.position.y=position.y;
        limb1.position.z=position.z;

        limb1.rotation.z=limbComponent.m_betaAngle*(Math.PI/180);
        limb1.rotation.y=2*Math.PI*(index/numChildPerParent)+(Math.random()-0.5)*0.1*Math.PI;
//        limb1.rotation.y=2*Math.PI*Math.random();
        limb0.add(limb1);
    }

//渲染第2层的某个枝干
    var CompositorOfLayer2=function(position,ratio,limbComponent,index,pathRatioXX,limb1)
    {
        var limb2=new THREE.Object3D();
        for(var i=0;i!=numResamplePoints-1;i++)
        {
            //渲染枝条第一段
            var geometry2 = new THREE.Geometry();
            var vertices2=GetVerticesByComponent(limbComponent,i);
            var faces2=GetFaces();
            geometry2.vertices=vertices2;
            geometry2.faces=faces2;
            //geometry.computeBoundingSphere();
            geometry2.computeFaceNormals();

            var materials2 = [
                new THREE.MeshLambertMaterial({opacity: 0.6, color: 0x44bb44, transparent: true}),
                new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})

            ];

            var tube2 = THREE.SceneUtils.createMultiMaterialObject(geometry2, materials2);
            tube2.children.forEach(function (e) {
  //            e.castShadow = true
            });
            limb2.add(tube2);
        }
        limb2.position.x=position.x;
        limb2.position.y=position.y;
        limb2.position.z=position.z;

        limb2.rotation.z=limbComponent.m_betaAngle*(Math.PI/180);
        limb2.rotation.y=2*Math.PI*(index/numChildPerParent)+(Math.random()-0.5)*0.2*Math.PI;

        limb1.add(limb2);

        for(var i=0;i!=numChildPerParent;i++)
        {
            CompositorOfLayer3();
        }
    }

//渲染第3层的某个枝干
    var CompositorOfLayer3=function()
    {

    }

    TreeCompositor();

}



//随机取第0层的五个分支点
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

    ramificationRatio[0] = actualStartRatio + 0.1*(actualEndRatio - actualStartRatio)+0.15*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[1] = actualStartRatio + 0.25*(actualEndRatio - actualStartRatio)+0.15*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[2] = actualStartRatio + 0.4*(actualEndRatio - actualStartRatio)+0.15*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[3] = actualStartRatio + 0.55*(actualEndRatio - actualStartRatio)+0.15*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[4] = actualStartRatio + 0.7*(actualEndRatio - actualStartRatio)+0.1*(actualEndRatio - actualStartRatio)* Math.random();

    return ramificationRatio;
}

var GetBranchRatio=function()
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

    ramificationRatio[0] = actualStartRatio + 0.2*(actualEndRatio - actualStartRatio)+0.1*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[1] = actualStartRatio + 0.3*(actualEndRatio - actualStartRatio)+0.05*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[2] = actualStartRatio + 0.35*(actualEndRatio - actualStartRatio)+0.05*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[3] = actualStartRatio + 0.4*(actualEndRatio - actualStartRatio)+0.05*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[4] = actualStartRatio + 0.45*(actualEndRatio - actualStartRatio)+0.1*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[5] = actualStartRatio + 0.55*(actualEndRatio - actualStartRatio)+0.1*(actualEndRatio - actualStartRatio)* Math.random();
    ramificationRatio[6] = actualStartRatio + 0.65*(actualEndRatio - actualStartRatio)+0.1*(actualEndRatio - actualStartRatio)* Math.random();

    return ramificationRatio;
}

var GetVertices=function(componentManager,componentIndex,centerIndex)
{
    var firstCenterX=componentManager.m_vComponents[componentIndex].m_vCenters[centerIndex].x;
    var firstCenterY=componentManager.m_vComponents[componentIndex].m_vCenters[centerIndex].y;
    var firstCenterZ=componentManager.m_vComponents[componentIndex].m_vCenters[centerIndex].z;

    var secondCenterX=componentManager.m_vComponents[componentIndex].m_vCenters[centerIndex+1].x;
    var secondCenterY=componentManager.m_vComponents[componentIndex].m_vCenters[centerIndex+1].y;
    var secondCenterZ=componentManager.m_vComponents[componentIndex].m_vCenters[centerIndex+1].z;

    var firstRadius=componentManager.m_vComponents[componentIndex].m_vRadius[centerIndex];
    var secondRadius=componentManager.m_vComponents[componentIndex].m_vRadius[centerIndex+1];

//    document.write(firstCenterX+" "+firstCenterY+" "+firstCenterZ+"</br>");
//    document.write(secondCenterX+" "+secondCenterY+" "+secondCenterZ+"</br>");

    var sin30=Math.sin(2*Math.PI/360*30);
    var cos30=Math.cos(2*Math.PI/360*30);

    var sin60=Math.sin(2*Math.PI/360*60);
    var cos60=Math.cos(2*Math.PI/360*60);

    var sin120=Math.sin(2*Math.PI/360*120);
    var cos120=Math.cos(2*Math.PI/360*120);

    var sin150=Math.sin(2*Math.PI/360*150);
    var cos150=Math.cos(2*Math.PI/360*150);

    var sin210=Math.sin(2*Math.PI/360*210);
    var cos210=Math.cos(2*Math.PI/360*210);

    var sin240=Math.sin(2*Math.PI/360*240);
    var cos240=Math.cos(2*Math.PI/360*240);

    var sin300=Math.sin(2*Math.PI/360*300);
    var cos300=Math.cos(2*Math.PI/360*300);

    var sin330=Math.sin(2*Math.PI/360*330);
    var cos330=Math.cos(2*Math.PI/360*330);

    var vertices=
        [
            new THREE.Vector3(firstCenterX,firstCenterY,firstCenterZ+firstRadius),
            new THREE.Vector3(firstCenterX+firstRadius*sin30,firstCenterY,firstCenterZ+firstRadius*cos30),
            new THREE.Vector3(firstCenterX+firstRadius*sin60,firstCenterY,firstCenterZ+firstRadius*cos60),
            new THREE.Vector3(firstCenterX+firstRadius,firstCenterY,firstCenterZ),
            new THREE.Vector3(firstCenterX+firstRadius*sin120,firstCenterY,firstCenterZ+firstRadius*cos120),
            new THREE.Vector3(firstCenterX+firstRadius*sin150,firstCenterY,firstCenterZ+firstRadius*cos150),
            new THREE.Vector3(firstCenterX,firstCenterY,firstCenterZ-firstRadius),
            new THREE.Vector3(firstCenterX+firstRadius*sin210,firstCenterY,firstCenterZ+firstRadius*cos210),
            new THREE.Vector3(firstCenterX+firstRadius*sin240,firstCenterY,firstCenterZ+firstRadius*cos240),
            new THREE.Vector3(firstCenterX-firstRadius,firstCenterY,firstCenterZ),
            new THREE.Vector3(firstCenterX+firstRadius*sin300,firstCenterY,firstCenterZ+firstRadius*cos300),
            new THREE.Vector3(firstCenterX+firstRadius*sin330,firstCenterY,firstCenterZ+firstRadius*cos330),

            new THREE.Vector3(secondCenterX,secondCenterY,secondCenterZ+secondRadius),
            new THREE.Vector3(secondCenterX+secondRadius*sin30,secondCenterY,secondCenterZ+secondRadius*cos30),
            new THREE.Vector3(secondCenterX+secondRadius*sin60,secondCenterY,secondCenterZ+secondRadius*cos60),
            new THREE.Vector3(secondCenterX+secondRadius,secondCenterY,secondCenterZ),
            new THREE.Vector3(secondCenterX+secondRadius*sin120,secondCenterY,secondCenterZ+secondRadius*cos120),
            new THREE.Vector3(secondCenterX+secondRadius*sin150,secondCenterY,secondCenterZ+secondRadius*cos150),
            new THREE.Vector3(secondCenterX,secondCenterY,secondCenterZ-secondRadius),
            new THREE.Vector3(secondCenterX+secondRadius*sin210,secondCenterY,secondCenterZ+secondRadius*cos210),
            new THREE.Vector3(secondCenterX+secondRadius*sin240,secondCenterY,secondCenterZ+secondRadius*cos240),
            new THREE.Vector3(secondCenterX-secondRadius,secondCenterY,secondCenterZ),
            new THREE.Vector3(secondCenterX+secondRadius*sin300,secondCenterY,secondCenterZ+secondRadius*cos300),
            new THREE.Vector3(secondCenterX+secondRadius*sin330,secondCenterY,secondCenterZ+secondRadius*cos330),
        ];
    return vertices;
}

var GetVerticesByComponent=function(component,centerIndex)
{
    var firstCenterX=component.m_vCenters[centerIndex].x;
    var firstCenterY=component.m_vCenters[centerIndex].y;
    var firstCenterZ=component.m_vCenters[centerIndex].z;

    var secondCenterX=component.m_vCenters[centerIndex+1].x;
    var secondCenterY=component.m_vCenters[centerIndex+1].y;
    var secondCenterZ=component.m_vCenters[centerIndex+1].z;

    var firstRadius=component.m_vRadius[centerIndex];
    var secondRadius=component.m_vRadius[centerIndex+1];

//    document.write(firstCenterX+" "+firstCenterY+" "+firstCenterZ+"</br>");
//    document.write(secondCenterX+" "+secondCenterY+" "+secondCenterZ+"</br>");

    var sin30=Math.sin(2*Math.PI/360*30);
    var cos30=Math.cos(2*Math.PI/360*30);

    var sin60=Math.sin(2*Math.PI/360*60);
    var cos60=Math.cos(2*Math.PI/360*60);

    var sin120=Math.sin(2*Math.PI/360*120);
    var cos120=Math.cos(2*Math.PI/360*120);

    var sin150=Math.sin(2*Math.PI/360*150);
    var cos150=Math.cos(2*Math.PI/360*150);

    var sin210=Math.sin(2*Math.PI/360*210);
    var cos210=Math.cos(2*Math.PI/360*210);

    var sin240=Math.sin(2*Math.PI/360*240);
    var cos240=Math.cos(2*Math.PI/360*240);

    var sin300=Math.sin(2*Math.PI/360*300);
    var cos300=Math.cos(2*Math.PI/360*300);

    var sin330=Math.sin(2*Math.PI/360*330);
    var cos330=Math.cos(2*Math.PI/360*330);

    var vertices=
        [
            new THREE.Vector3(firstCenterX,firstCenterY,firstCenterZ+firstRadius),
            new THREE.Vector3(firstCenterX+firstRadius*sin30,firstCenterY,firstCenterZ+firstRadius*cos30),
            new THREE.Vector3(firstCenterX+firstRadius*sin60,firstCenterY,firstCenterZ+firstRadius*cos60),
            new THREE.Vector3(firstCenterX+firstRadius,firstCenterY,firstCenterZ),
            new THREE.Vector3(firstCenterX+firstRadius*sin120,firstCenterY,firstCenterZ+firstRadius*cos120),
            new THREE.Vector3(firstCenterX+firstRadius*sin150,firstCenterY,firstCenterZ+firstRadius*cos150),
            new THREE.Vector3(firstCenterX,firstCenterY,firstCenterZ-firstRadius),
            new THREE.Vector3(firstCenterX+firstRadius*sin210,firstCenterY,firstCenterZ+firstRadius*cos210),
            new THREE.Vector3(firstCenterX+firstRadius*sin240,firstCenterY,firstCenterZ+firstRadius*cos240),
            new THREE.Vector3(firstCenterX-firstRadius,firstCenterY,firstCenterZ),
            new THREE.Vector3(firstCenterX+firstRadius*sin300,firstCenterY,firstCenterZ+firstRadius*cos300),
            new THREE.Vector3(firstCenterX+firstRadius*sin330,firstCenterY,firstCenterZ+firstRadius*cos330),

            new THREE.Vector3(secondCenterX,secondCenterY,secondCenterZ+secondRadius),
            new THREE.Vector3(secondCenterX+secondRadius*sin30,secondCenterY,secondCenterZ+secondRadius*cos30),
            new THREE.Vector3(secondCenterX+secondRadius*sin60,secondCenterY,secondCenterZ+secondRadius*cos60),
            new THREE.Vector3(secondCenterX+secondRadius,secondCenterY,secondCenterZ),
            new THREE.Vector3(secondCenterX+secondRadius*sin120,secondCenterY,secondCenterZ+secondRadius*cos120),
            new THREE.Vector3(secondCenterX+secondRadius*sin150,secondCenterY,secondCenterZ+secondRadius*cos150),
            new THREE.Vector3(secondCenterX,secondCenterY,secondCenterZ-secondRadius),
            new THREE.Vector3(secondCenterX+secondRadius*sin210,secondCenterY,secondCenterZ+secondRadius*cos210),
            new THREE.Vector3(secondCenterX+secondRadius*sin240,secondCenterY,secondCenterZ+secondRadius*cos240),
            new THREE.Vector3(secondCenterX-secondRadius,secondCenterY,secondCenterZ),
            new THREE.Vector3(secondCenterX+secondRadius*sin300,secondCenterY,secondCenterZ+secondRadius*cos300),
            new THREE.Vector3(secondCenterX+secondRadius*sin330,secondCenterY,secondCenterZ+secondRadius*cos330),
        ];
    return vertices;
}

var GetFaces=function()
{
    var faces=
        [
            new THREE.Face3(0,1,12),
            new THREE.Face3(1,13,12),
            new THREE.Face3(1,2,13),
            new THREE.Face3(2,14,13),
            new THREE.Face3(2,3,14),
            new THREE.Face3(3,15,14),
            new THREE.Face3(3,4,15),
            new THREE.Face3(4,16,15),
            new THREE.Face3(4,5,16),
            new THREE.Face3(5,17,16),
            new THREE.Face3(5,6,17),
            new THREE.Face3(6,18,17),
            new THREE.Face3(6,7,18),
            new THREE.Face3(7,19,18),
            new THREE.Face3(7,8,19),
            new THREE.Face3(8,20,19),
            new THREE.Face3(8,9,20),
            new THREE.Face3(9,21,20),
            new THREE.Face3(9,10,21),
            new THREE.Face3(10,22,21),
            new THREE.Face3(10,11,22),
            new THREE.Face3(11,23,22),
            new THREE.Face3(11,0,23),
            new THREE.Face3(0,12,23)
        ];
    return faces;
}

var GetInterpolationX=function(componentManager,componentIndex,ramificationRatio)
{
    var InterpolationX=0;
    var numResamplePoints=15;
    var InterpolationY=ramificationRatio*(componentManager.m_vComponents[componentIndex].m_vCenters[numResamplePoints-1].y);
    for(var i=1;i!=numResamplePoints;i++)
    {
        if((InterpolationY<=(componentManager.m_vComponents[componentIndex].m_vCenters[i].y))&&(InterpolationY>(componentManager.m_vComponents[componentIndex].m_vCenters[i-1].y)))
        {
            var ratio=(InterpolationY-componentManager.m_vComponents[componentIndex].m_vCenters[i-1].y)
                /(componentManager.m_vComponents[componentIndex].m_vCenters[i].y-componentManager.m_vComponents[componentIndex].m_vCenters[i-1].y);
            InterpolationX=componentManager.m_vComponents[componentIndex].m_vCenters[i-1].x+
                ratio* (componentManager.m_vComponents[componentIndex].m_vCenters[i].x-componentManager.m_vComponents[componentIndex].m_vCenters[i-1].x);
        }
    }
    return InterpolationX;
}

var GetInterpolationXByComponent=function(component,ramificationRatio)
{
    var InterpolationX=0;
    var numResamplePoints=15;
    var InterpolationY=ramificationRatio*(component.m_vCenters[numResamplePoints-1].y);
    for(var i=1;i!=numResamplePoints;i++)
    {
        if((InterpolationY<=(component.m_vCenters[i].y))&&(InterpolationY>(component.m_vCenters[i-1].y)))
        {
            var ratio=(InterpolationY-component.m_vCenters[i-1].y)
                /(component.m_vCenters[i].y-component.m_vCenters[i-1].y);
            InterpolationX=component.m_vCenters[i-1].x+
                ratio* (component.m_vCenters[i].x-component.m_vCenters[i-1].x);
        }
    }
    return InterpolationX;
}

var GetInterpolationY=function(componentManager,componentIndex,ramificationRatio)
{
    var numResamplePoints=15;
    var InterpolationY=ramificationRatio*(componentManager.m_vComponents[componentIndex].m_vCenters[numResamplePoints-1].y);
    return InterpolationY;
}

var GetInterpolationYByComponent=function(component,ramificationRatio)
{
    var numResamplePoints=15;
    var InterpolationY=ramificationRatio*(component.m_vCenters[numResamplePoints-1].y);
    return InterpolationY;
}

var GetInterpolationZ=function(componentManager,componentIndex,ramificationRatio)
{
    var InterpolationZ=0;
    var numResamplePoints=15;
    var InterpolationY=ramificationRatio*(componentManager.m_vComponents[componentIndex].m_vCenters[numResamplePoints-1].y);
    for(var i=1;i!=numResamplePoints;i++)
    {
        if((InterpolationY<=(componentManager.m_vComponents[componentIndex].m_vCenters[i].y))&&(InterpolationY>(componentManager.m_vComponents[componentIndex].m_vCenters[i-1].y)))
        {
            var ratio=(InterpolationY-componentManager.m_vComponents[componentIndex].m_vCenters[i-1].y)
                /(componentManager.m_vComponents[componentIndex].m_vCenters[i].y-componentManager.m_vComponents[componentIndex].m_vCenters[i-1].y);
            InterpolationZ=componentManager.m_vComponents[componentIndex].m_vCenters[i-1].z+
                ratio* (componentManager.m_vComponents[componentIndex].m_vCenters[i].z-componentManager.m_vComponents[componentIndex].m_vCenters[i-1].z);
        }
    }
    return InterpolationZ;
}

var GetInterpolationZByComponent=function(component,ramificationRatio)
{
    var InterpolationZ=0;
    var numResamplePoints=15;
    var InterpolationY=ramificationRatio*(component.m_vCenters[numResamplePoints-1].y);
    for(var i=1;i!=numResamplePoints;i++)
    {
        if((InterpolationY<=(component.m_vCenters[i].y))&&(InterpolationY>(component.m_vCenters[i-1].y)))
        {
            var ratio=(InterpolationY-component.m_vCenters[i-1].y)
                /(component.m_vCenters[i].y-component.m_vCenters[i-1].y);
            InterpolationZ=component.m_vCenters[i-1].z+
                ratio* (component.m_vCenters[i].z-component.m_vCenters[i-1].z);
        }
    }
    return InterpolationZ;
}

var GetBestLimb=function(componentManager,pathRatioX)
{
    var minDistance=1000;
    var bestLimb;
//    document.write(pathRatioX+"</br>");
    for(var componentIndex=0;componentIndex!=getJsonLength(componentManager.m_vComponents);componentIndex++)
    {
        var pathRatio=componentManager.m_vComponents[componentIndex].m_vPathRatios;
//        document.write(pathRatio+"</br>");
        var curDistance=0;

        for(var i=0;i!=getJsonLength(pathRatio);i++)
        {
            curDistance+=(pathRatio[i]-pathRatioX[i])*(pathRatio[i]-pathRatioX[i]);
        }
        if(curDistance<minDistance)
        {
            minDistance=curDistance;
            bestLimb=componentManager.m_vComponents[componentIndex];
        }
    }
//    document.write(minDistance+"</br>");
    return bestLimb;

}
