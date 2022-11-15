import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from "cannon-es";
import { Material } from "cannon-es";

var height = window.innerHeight;
var width = window.innerWidth;

const mousePos = new THREE.Vector2();
const intersectPt = new THREE.Vector3();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();
const spheres = [];
const bodies = [];
const squares = [];
const sBodies = [];
var Shape = true;

const renderer = new THREE.WebGL1Renderer();
renderer.setSize(width,height);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);

const orbit = new OrbitControls(camera,renderer.domElement);

camera.position.set(0,6,6);
orbit.update();
scene.add(camera);

window.addEventListener('mousemove', function(e){

    mousePos.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mousePos.y = -(e.clientY / this.window.innerHeight) * 2 + 1;

    planeNormal.copy(camera.position).normalize();

    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);

    raycaster.setFromCamera(mousePos,camera);
    raycaster.ray.intersectPlane(plane,intersectPt);
});



const world = new CANNON.World({
    gravity: new CANNON.Vec3(0,-10,0)
});

const planeGeo = new THREE.PlaneGeometry(10,10);
const planeMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(planeGeo,planeMat);
ground.receiveShadow = true;
scene.add(ground);

const planePMat = new CANNON.Material();

const planeBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(5,5,.1)),
    material: planePMat
});
planeBody.quaternion.setFromEuler(-Math.PI / 2,0,0);
world.addBody(planeBody);

const ambLight = new THREE.AmbientLight(0x333333);
scene.add(ambLight);

const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
dirLight.position.set(0,50,0);
dirLight.castShadow = true;
scene.add(dirLight);

window.addEventListener('click', function(e){

    
    if(Shape === true)
    {
        const sphereGeo = new THREE.SphereGeometry(.25,30,30);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xFFFFFF,
            metalness:0, 
            roughness:0
        });
        const sphereThree = new THREE.Mesh(sphereGeo,sphereMat);
        sphereThree.receiveShadow = true;
        sphereThree.castShadow = true;
        scene.add(sphereThree);
        //sphereThree.position.copy(intersectPt);
        const spherePMAT = new CANNON.Material();
        const sphereBody = new CANNON.Body({
            shape: new CANNON.Sphere(0.125),
            mass:.3,
            material: spherePMAT,
            position: new CANNON.Vec3(intersectPt.x, intersectPt.y, intersectPt.z)
        });
        world.addBody(sphereBody);

        spheres.push(sphereThree);
        bodies.push(sphereBody);
        Shape = false;
    }else
    {
        const squareGeo = new THREE.BoxGeometry(.2,.2,.2);
        const squareMat = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xFFFFFF,
        });
        const squareThree = new THREE.Mesh(squareGeo,squareMat);
        squareThree.receiveShadow = true;
        squareThree.castShadow = true;
        scene.add(squareThree);
    
        //const squarePMAT = new CANNON.Material();
        const squareBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(.1,.1,.1)),
            mass: .3,
            position: new CANNON.Vec3(intersectPt.x, intersectPt.y, intersectPt.z)
        });
        world.addBody(squareBody);
    
        squares.push(squareThree);
        sBodies.push(squareBody);
        Shape = true;
    }
   

    const planeSphereContact = new CANNON.ContactMaterial(
        planePMat,
        spherePMAT,
        {restitution: 0.3}
    );
    
    const planeSquareContact = new CANNON.ContactMaterial(
        planePMat,
        squarePMAT,
        { friction: .7}
    )
    world.addContactMaterial(planeSquareContact);
    world.addContactMaterial(planeSphereContact);



});

const rectGeo = new THREE.BoxGeometry(10,1,1);
const rectMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
});
const wall1 = new THREE.Mesh(rectGeo,rectMat);
wall1.receiveShadow = true;
//wall1.position.set(0,0,5);
scene.add(wall1);

const rect2Geo = new THREE.BoxGeometry(10,1,1);
const rect2Mat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF
});
const wall2 = new THREE.Mesh(rect2Geo,rect2Mat);
wall2.receiveShadow = true;
//wall2.position.set(0,0,-5);
scene.add(wall2);

const rect3Geo = new THREE.BoxGeometry(1,1,10);
const rect3Mat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF
});
const wall3 = new THREE.Mesh(rect3Geo,rect3Mat);
wall3.receiveShadow = true;
//wall3.rotateY(11);
//wall3.position.set(-5,0,0);
scene.add(wall3);

const rect4Geo = new THREE.BoxGeometry(1,1,10);
const rect4Mat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF
});
const wall4 = new THREE.Mesh(rect4Geo,rect4Mat);
wall4.receiveShadow = true;
//wall4.rotateY(11);
//wall4.position.set(5,0,0);
scene.add(wall4);

const wallBody1 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(5,.5,.5)),
    type: CANNON.Body.STATIC,
    position: new CANNON.Vec3(0,0,5)
});
world.addBody(wallBody1);

const wallBody2 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(5,.5,.5)),
    type: CANNON.Body.STATIC,
    position: new CANNON.Vec3(0,0,-5)
});
world.addBody(wallBody2);

const wallBody3 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(.5,.5,5)),
    type: CANNON.Body.STATIC,
    position: new CANNON.Vec3(-5,0,0)
});
world.addBody(wallBody3);

const wallBody4 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(.5,.5,5)),
    type: CANNON.Body.STATIC,
    position: new CANNON.Vec3(5,0,0)
});
world.addBody(wallBody4);

const timeStep = 1/60;

function animate()
{
    world.step(timeStep);
    ground.position.copy(planeBody.position);
    ground.quaternion.copy(planeBody.quaternion);
    for (let i = 0; i < spheres.length; i++)
    {
        spheres[i].position.copy(bodies[i].position);
        spheres[i].quaternion.copy(bodies[i].quaternion);
    }
    for (let x = 0; x < squares.length; x++)
    {
        squares[x].position.copy(sBodies[x].position);
        squares[x].quaternion.copy(sBodies[x].quaternion);
    }
    wall1.position.copy(wallBody1.position);
    wall1.quaternion.copy(wallBody1.quaternion);
    wall2.position.copy(wallBody2.position);
    wall2.quaternion.copy(wallBody2.quaternion);
    wall3.position.copy(wallBody3.position);
    wall3.quaternion.copy(wallBody3.quaternion);
    wall4.position.copy(wallBody4.position);
    wall4.quaternion.copy(wallBody4.quaternion);
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

renderer.render(scene, camera);