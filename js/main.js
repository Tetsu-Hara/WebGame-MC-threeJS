
var camera, scene, renderer,cameraControl, container;

var plane;
var mouse, raycaster, isShiftDown = false;
var rollOverMesh, rollOverMaterial;
var cubeGeo, cubeMaterial;
var objects = [];


var isMoveForward = false;
var isMoveBackward = false;
var isMoveLeft = false;
var isMoveRight = false;
var isCanJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector2();

var cubeTexture = [];
var textureIndex = 0;

var cubeNum = 50;
var cubeNumText = document.getElementById("cubeNum");
var cubes = [];  //新出现的cube

var lifeNum = 50;
var lifeNumText = document.getElementById("life");
var collideMeshList = [];  //lifeCube的碰撞列表

var moveCube;
var iscrash = false;

var gameState = 0;  //0-暂停/刚开始  1-正在游戏  2-结束


//init();

//animate();

function init() {
  cubeNumText.innerText = "Loading...";

  //相机
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 6000 );
  camera.position.set(100,800,100);

  //场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x87CEEB );
  scene.fog = new THREE.Fog( 0x87CEEB, 0, 2000 );

  //渲染器
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  //容器
  container = document.getElementById( "webgl-container" );
  container.appendChild(renderer.domElement);


  //相机控制器
  cameraControl = new THREE.PointerLockControls( camera );



  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );

  instructions.addEventListener( 'click', function () {
    cameraControl.lock();
  }, false );

  cameraControl.addEventListener( 'lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
    gameState = 1;
  });

  cameraControl.addEventListener( 'unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
    gameState = 0;
  });


  scene.add( cameraControl.getObject() );


  // roll-over helpers
  var rollOverGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
  rollOverMaterial = new THREE.MeshBasicMaterial( {
    color: 0xffffff,
    opacity: 0.5,
    transparent: true
  } );
  rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
  scene.add( rollOverMesh );


  //cube texture
  cubeTexture[0] = new THREE.TextureLoader().load('textures/CastleBlock001.PNG');
  cubeTexture[1] = new THREE.TextureLoader().load('textures/DirtSolid001.PNG');
  cubeTexture[2] = new THREE.TextureLoader().load('textures/Glass001.PNG');
  cubeTexture[3] = new THREE.TextureLoader().load('textures/Gold001.PNG');
  cubeTexture[4] = new THREE.TextureLoader().load('textures/GrassSolid001.PNG');
  cubeTexture[5] = new THREE.TextureLoader().load('textures/GravelSolid001.PNG');
  cubeTexture[6] = new THREE.TextureLoader().load('textures/Stone002.PNG');
  cubeTexture[7] = new THREE.TextureLoader().load('textures/StoneSolid001.PNG');
  cubeTexture[8] = new THREE.TextureLoader().load('textures/TreeLeaves001.PNG');


  //cube
  cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
  cubeMaterial = new THREE.MeshLambertMaterial( {
    map: cubeTexture[textureIndex]
  });


  // grid
  //var gridHelper = new THREE.GridHelper( 4000, 80 );
  //gridHelper.visible = false;
  //scene.add( gridHelper );

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  //地面
  var geometry = new THREE.PlaneBufferGeometry( 4000, 4000 );
  geometry.rotateX( - Math.PI / 2 );
  var material = new THREE.MeshBasicMaterial( {
    visible: true ,
    map: new THREE.TextureLoader().load( 'textures/floor01.PNG' )
  } );
  plane = new THREE.Mesh( geometry, material);
  scene.add( plane );
  objects.push( plane );


  // lights
  var ambientLight = new THREE.AmbientLight( 0x606060 );
  scene.add( ambientLight );


  //方向光
  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
  scene.add( directionalLight );


  //movecube
  var moveCubeGeom = new THREE.BoxGeometry(50,50,50);
  var movecubeMate = new THREE.MeshBasicMaterial({visible : true});
  moveCube = new THREE.Mesh(moveCubeGeom, movecubeMate);
  moveCube.position.set(camera.position);
  scene.add(moveCube);

  document.body.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'keydown', onDocumentKeyDown, false );
  document.addEventListener( 'keyup', onDocumentKeyUp, false );



  window.addEventListener( 'resize', onWindowResize, false );

}


/**
 * 窗口设置
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}





/**
 * 鼠标移动
 * @param event
 */
function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {

    var intersect = intersects[ 0 ];

    rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );

    rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

  }

  //animate();
}


/**
 * 鼠标按下事件
 * @param event
 */
function onDocumentMouseDown( event ) {

  cubeGeo = new THREE.BoxBufferGeometry( 50, 50, 50 );
  cubeMaterial = new THREE.MeshLambertMaterial( {
    map : cubeTexture[textureIndex]
  });

  event.preventDefault();

  mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( objects );

  if ( intersects.length > 0 ) {
    var intersect = intersects[ 0 ];
    // delete cube

    if ( isShiftDown ) {
      if ( intersect.object !== plane) {
        if( intersect.object.name === 1 ){
          cubeNum += 10;   //建筑材料
        }

        scene.remove( intersect.object );
        objects.splice( objects.indexOf( intersect.object ), 1 );

      }
    }
    else {   // create cube

      if(cubeNum >= 1){

        var mesh = new THREE.Mesh( cubeGeo, cubeMaterial );

        mesh.position.copy( intersect.point ).add( intersect.face.normal );

        mesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

        scene.add( mesh );
        objects.push( mesh );
        cubeNum -= 1;

      }

    }
  }

  //animate();
}


/**
 * 键盘按下事件
 * @param event
 */
function onDocumentKeyDown( event ) {

  switch ( event.keyCode ) {
    case 16:
      isShiftDown = true;
      break;

    case 38: // up
    case 87: // w
      isMoveForward = true;
      break;

    case 37: // left
    case 65: // a
      isMoveLeft = true;
      break;

    case 40: // down
    case 83: // s
      isMoveBackward = true;
      break;

    case 39: // right
    case 68: // d
      isMoveRight = true;
      break;

    case 32: // space
      if ( isCanJump === true ) {
        velocity.y += 350;
      }
      isCanJump = false;
      break;


    case 49:
    case 97:
      textureIndex = 0;
      break;
    case 50:
    case 98:
      textureIndex = 1;
      break;
    case 51:
    case 99:
      textureIndex = 2;
      break;
    case 52:
    case 100:
      textureIndex = 3;
      break;
    case 53:
    case 101:
      textureIndex = 4;
      break;
    case 54:
    case 102:
      textureIndex = 5;
      break;
    case 55:
    case 103:
      textureIndex = 6;
      break;
    case 56:
    case 104:
      textureIndex = 7;
      break;
    case 57:
    case 105:
      textureIndex = 8;
      break;
  }

}


/**
 * 键盘抬起事件
 * @param event
 */
function onDocumentKeyUp( event ) {
  switch ( event.keyCode ) {
    case 16:
      isShiftDown = false;
      break;

    case 38: // up
    case 87: // w
      isMoveForward = false;
      break;

    case 37: // left
    case 65: // a
      isMoveLeft = false;
      break;

    case 40: // down
    case 83: // s
      isMoveBackward = false;
      break;

    case 39: // right
    case 68: // d
      isMoveRight = false;
      break;
  }
}



function randCube() {

  var geometry = new THREE.BoxGeometry(50,50,50) ;
  var material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load( 'textures/randcube.jpg' )
  });

  var box = new THREE.Mesh(geometry, material);

  box.position.x = Math.random()*3000-1500;
  box.position.y = 25;
  box.position.z = Math.random()*3000-1500;
  box.name = 1;
  objects.push( box );
  cubes.push(box);  //将随机产生的box加到其他移动的cubes数组里

  scene.add(box);
}




function randLife() {

  var geometry = new THREE.BoxGeometry(20,20,20) ;
  var material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load( 'textures/xin.jpg' )
  });

  var box = new THREE.Mesh(geometry, material);

  box.position.x = Math.random()*3000-1500;
  box.position.y = 25;
  box.position.z = Math.random()*3000-1500;

  box.name = 2;

  //lifeCube.push(box);
  collideMeshList.push(box);   //将box加到碰撞网格列表

  scene.add(box);
}



function collisionBox(){


  var originPoint = moveCube.position.clone(); //原位置

  for (var vertexIndex = 0; vertexIndex < moveCube.geometry.vertices.length; vertexIndex++) {
    // 顶点原始坐标
    var localVertex = moveCube.geometry.vertices[vertexIndex].clone();
    // 顶点经过变换后的坐标
    var globalVertex = localVertex.applyMatrix4(moveCube.matrix);
    var directionVector = globalVertex.sub(moveCube.position);

    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    var collisionResults = ray.intersectObjects(collideMeshList);
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      iscrash = true;
      break;
    }
    iscrash = false;
  }



  if(iscrash){
    scene.remove( collisionResults[0].object );
    collideMeshList.splice( collideMeshList.indexOf( collisionResults[0].object ), 1 );
    lifeNum += 50;
  }


}


function update() {

 // var delta = new THREE.Clock().getDelta(); //Δ :获得前后两次执行该方法的时间间隔
  //var moveDistance = 900 * delta;  //移动距离

  collisionBox();

  if(Math.random()<0.005 && cubes.length <15){
    randCube();
  }


  if(Math.random()<0.005 && collideMeshList.length < 3){
    //console.log("长度"+collideMeshList.length);
    randLife();
  }


  cubeNumText.innerText = "你拥有的积木数：" + Math.floor(cubeNum);

  if(gameState === 1){
    lifeNum -=0.01;
  }
  lifeNumText.innerText = "当前饥饿值：" + Math.floor(lifeNum);

  if(lifeNum <= 0){
    gameover();
  }


}


function gameover() {

  container.style.display = 'none';

  var gameover = document.getElementById( "gameover" );
  gameover.style.display = 'inline';

  setTimeout("javascript:location.href='gameover.html'", 0);

  //alert("you died");
}


function animate() {

  requestAnimationFrame( animate );

  update();

  if ( cameraControl.isLocked === true ) {

    raycaster.ray.origin.copy( cameraControl.getObject().position );
    raycaster.ray.origin.y -= 50;

    var intersections = raycaster.intersectObjects( objects );

    var onObject = intersections.length > 0;

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 5.0 * delta;
    velocity.z -= velocity.z * 5.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( isMoveForward ) - Number( isMoveBackward );
    direction.x = Number( isMoveLeft ) - Number( isMoveRight );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( isMoveForward || isMoveBackward ) velocity.z -= direction.z * 2000.0 * delta;
    if ( isMoveLeft || isMoveRight ) velocity.x -= direction.x * 2000.0 * delta;

    if ( onObject === true ) {

      velocity.y = Math.max( 0, velocity.y );
      isCanJump = true;

    }
    cameraControl.getObject().translateX( velocity.x * delta );
    cameraControl.getObject().position.y += ( velocity.y * delta ); // new behavior
    cameraControl.getObject().translateZ( velocity.z * delta );

    if ( cameraControl.getObject().position.y < 50 ) {

      velocity.y = 0;
      cameraControl.getObject().position.y = 50;

      isCanJump = true;

    }

    prevTime = time;
    moveCube.position.set(cameraControl.getObject().position.x,cameraControl.getObject().position.y,cameraControl.getObject().position.z);


  }

  renderer.render( scene, camera );

}



//加载函数
window.onload = function(){

  init();
  animate();


  //添加事件监听
  window.addEventListener('resize',this.onWindowResize,false);
}






