import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import * as Orbit from 'three/examples/jsm/controls/OrbitControls';
//import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
//import * as Trackball from 'three/examples/jsm/controls/TrackballControls';

@Component({
  selector: 'app-plot',
  templateUrl: './plot.component.html',
  styleUrls: ['./plot.component.scss'],
})
export class PlotComponent implements OnInit {
  exampleModelData: any = [
    {
      config: [
        {},
        {
          data: [
            {
              treatments: [
                {
                  name: 'Treatment example 1',
                  treatment_index: 1,
                  basenode: true,
                  //distanceFromBaseNode: 0,
                  pos: [0, 0, 0],
                  weighting: 10,
                  color: 'red',
                  showTreatment: true,
                },
                {
                  name: 'Treatment example 2',
                  treatment_index: 2,
                  basenode: false,
                  //distanceFromBaseNode: 0,
                  pos: [0, 0, 0],
                  weighting: 10,
                  color: 'yellow',
                  showTreatment: true,
                },
                {
                  name: 'Treatment example 3',
                  treatment_index: 3,
                  basenode: false,
                  //distanceFromBaseNode: 300,
                  pos: [0, 0, 0],
                  weighting: 10,
                  color: '#12342f',
                  showTreatment: true,
                },
                {
                  name: 'Treatment example 4',
                  treatment_index: 4,
                  basenode: false,
                  //distanceFromBaseNode: 300,
                  pos: [0, 0, 0],
                  weighting: 10,
                  color: 'grey',
                  showTreatment: true,
                },
              ],
              studies: [
                {
                  index: 1,
                  sourceIndex: 1,
                  targetIndex: 2,
                  weighting: 10,
                  studyName: 'Study example 1',
                  color: 'grey',
                  offset: 0,
                  spacing: 1,
                  covariatesWeighting: 5,
                },
                {
                  index: 2,
                  sourceIndex: 1,
                  targetIndex: 2,
                  weighting: 10,
                  studyName: 'Study example 2',
                  color: 'grey',
                  offset: 0,
                  spacing: 1,
                  covariatesWeighting: 5,
                },
                {
                  index: 3,
                  sourceIndex: 1,
                  targetIndex: 3,
                  weighting: 1,
                  studyName: 'Study example 3',
                  color: 'grey',
                  offset: 0,
                  spacing: 1,
                  covariatesWeighting: 5,
                },
                {
                  index: 4,
                  sourceIndex: 2,
                  targetIndex: 3,
                  weighting: 1,
                  studyName: 'Study example 4',
                  color: 'grey',
                  offset: 0,
                  spacing: 1,
                  covariatesWeighting: 5,
                },
                {
                  index: 5,
                  sourceIndex: 1,
                  targetIndex: 4,
                  weighting: 1,
                  studyName: 'Study example 4',
                  color: 'grey',
                  offset: 0,
                  spacing: 1,
                  covariatesWeighting: 5,
                },
              ],
              covariates: [
                {
                  index: 1,
                  studyIndex: 1,
                  name: 'age',
                  covariate: 'N/R',
                  unit: 'yrs',
                  color: 'red',
                  width: 5,
                },
                {
                  index: 2,
                  studyIndex: 1,
                  name: 'weight',
                  covariate: 50,
                  unit: 'lbs',
                  color: 'red',
                  width: 5,
                },
                {
                  index: 3,
                  studyIndex: 2,
                  name: 'age',
                  covariate: 50,
                  unit: 'yrs',
                  color: 'red',
                  width: 5,
                },
                {
                  index: 4,
                  studyIndex: 3,
                  name: 'weight',
                  covariate: 0.6,
                  unit: 'lbs',
                  color: 'red',
                  width: 5,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  container: HTMLElement = document.createElement('div');
  mesh: any = null;
  scene: any = null;
  camera: any = null;
  renderer: any = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  });
  distanceFromBaseNode: number = 500;
  controls: any = null;
  plane: any = null;
  raycaster: any = new THREE.Raycaster();
  mouse: any = new THREE.Vector3();
  offset: any = new THREE.Vector3();
  INTERSECTED: any = null;
  SELECTED: any = null;
  meshObjects: any = [];
  studies: any = [];
  studyLine: any = null;
  covariates: any = [];
  studyLinks: any = []; // this is a n object holding each study link and its associated covariates
  covariatesDistinctList: any = []; // this is a list of disctiv covariate names used for selection purposes
  segmentSize: number = 0;
  segmentTotal: number = 0;
  treatments: any = [];
  treatmentsCount: number = 0;
  studiesCount: number = 0;
  covariatesCount: number = 0;
  links: any = [];
  covariateSelection: string = 'days';
  totalRebuild: boolean = false;
  initOpen: boolean = true;
  selectedCovariate: string = 'Covariate Selection';
  currentExcelFilename: string = '';
  newPDFFileName: string = '';
  saveRawDataFileName: string = '';
  showCovariateLabels: boolean = true;
  regexNumeric: string = '^[0-9.,]+$';
  formErrors: boolean = false;
  showGrid: boolean = true;
  useWireframe: boolean = false;
  jsonDataTemplate: any = [];
  loadedData = false;
  savedJson: any = [];
  useConfigOptions = false;
  currentCameraXYZ: any = [];
  currentTargetXYZ: any = [];
  changeBeenMade: boolean = false;
  resettingData: boolean = false;
  originalModelData: any = [];
  makeModelActive: boolean = false; // is the model available to do anything to, ie can i move it about with the mouse?
  projector: any = null;
  clickedObj: any = null;
  scaleModifier: number = 1;

  initAnim: boolean = true;
  runAnim: boolean = false;
  theta: number = 0;
  animationId: any = null;
  modalData: any = [];
  useLoadedData: boolean = false;
  allGroupedObjects: any = new THREE.Group();

  // let control = new function() {
  //   this.rotSpeed = 0.005;
  //   this.scale = 1;
  // };

  // dynamic columns to show/hide sidebar
  showSidebar: boolean = true; // remember state of sidebar

  constructor() {}

  ngOnInit(): void {
    let plotContainer = document.getElementById('plotContainer');
    plotContainer?.append(this.container);

    // setup/populate model obj variables
    this.getModelDataObjects();
    //debugger;
    //  //setup the initial three objects required
    this.setupThreeObjects();
    //debugger;
    this.createTreatments();
    debugger;
    this.createLinks();

    //  //add all changes from above into the scene
    this.scene.add(this.plane);
    this.scene.add(this.allGroupedObjects);
    debugger;

    //  window.addEventListener('resize', onWindowResize, false);
    //  // event listeners for the zoom in/out buttons
    //  document.getElementById('plotContainer').addEventListener('mousedown', onMouseDown);
    //  document.getElementById('plotContainer').addEventListener('mouseup', onMouseUp);
    //  document.getElementById('plotContainer').addEventListener('mouseleave', onMouseUp);

    //  onWindowResize();

    //this.initOpen = true;
    this.animate();
  }

  createLinks = () => {
    let genericLineWidth: number = 5;

    let len = this.studies.length;
    for (let i = 0; i < len; i++) {
      let link = this.studies[i];
      //console.log('link', link);
      // if (!isTreatmentVisible(link.sourceIndex) || !isTreatmentVisible(link.targetIndex)) {
      //   continue;
      // }
      let sourcePos = this.getPos(link.sourceIndex);
      let targetPos = this.getPos(link.targetIndex);

      let startStudyLine = new THREE.Vector3(
        sourcePos[0],
        sourcePos[1],
        sourcePos[2]
      ); // get start position of line
      let endStudyLine = new THREE.Vector3(
        targetPos[0],
        targetPos[1],
        sourcePos[2]
      ); // get end position of line

      let studyLinegeometry = new THREE.BufferGeometry();

      const points = [];
      points.push(startStudyLine);
      points.push(endStudyLine);

      let geometry: any = new THREE.BufferGeometry().setFromPoints(points);

      let linematerial = new THREE.LineBasicMaterial({
        color: link.color,
        linewidth: link.trialLinkWeighting,
      });

      this.studyLine = new THREE.Line(geometry, linematerial); // build line
      this.studyLine.connector = true;
      this.studyLine.objectType = 2; // is study link

      this.allGroupedObjects.add(this.studyLine); // add line to scene

      //this.createStudyCovariates(link);
    }
    // if currently using wireframe mode then dont show text
    // if (!vm.useWireframe) {
    //createStudyText();
    //}
  };

  createStudyCovariates = (link: any) => {
    // if (!isTreatmentVisible(link.sourceIndex) || !isTreatmentVisible(link.targetIndex)) {
    //   return;
    // }

    let sourcePos = this.getPos(link.sourceIndex);
    let targetPos = this.getPos(link.targetIndex);

    let thisCovarIndex = 1;

    let offsetModifier = link.offset; //0; // todo: get from user inputs on trial x > trial y level gops form 0 to 1
    let spacingModifier = link.spacing; //1; // todo: get from user inputs on trial x > trial y level goes from 1 to 0

    let linkStudies = link;
    let allLinkStudyCovariates: any = [];
    let linkStudyMap: any = {};

    linkStudies.forEach(
      (linkStudy: {
        covariates: any;
        studyIndex: string | number;
        studyName: any;
        color: any;
        covariatesWeighting: any;
      }) => {
        allLinkStudyCovariates = allLinkStudyCovariates.concat(
          linkStudy.covariates
        );
        linkStudyMap[linkStudy.studyIndex] = {
          studyName: linkStudy.studyName,
          color: linkStudy.color,
          covariatesWeighting: linkStudy.covariatesWeighting,
        };
      }
    );

    let covariatesToDisplay = allLinkStudyCovariates.filter(
      (covariate: { name: any }) => covariate.name === this.covariateSelection
    );
    let covariateCount = covariatesToDisplay.length;
    let covariateIncrement = spacingModifier / (covariateCount + 1);

    let len = covariatesToDisplay.length;

    for (let i = 0; i < len; i++) {
      let covariate = covariatesToDisplay[i];

      let blnNRCovariate = false;
      blnNRCovariate = covariate.covariate === 'N/R'; // check if the covariate value is empty and should therefor show as "N/R"

      let studyName = linkStudyMap[covariate.studyIndex].studyName;
      let studyColor = linkStudyMap[covariate.studyIndex].color;
      let cylinderWidth = linkStudyMap[covariate.studyIndex].covariatesWeighting
        ? linkStudyMap[covariate.studyIndex].covariatesWeighting
        : 5;

      let scaleCovariateValue =
        this.scaleModifier > 1
          ? covariate.covariate * this.scaleModifier
          : covariate.covariate; // the value to use now that scaling has been added

      let geometry = new THREE.CylinderGeometry(
        cylinderWidth,
        cylinderWidth,
        blnNRCovariate ? 0 : scaleCovariateValue,
        10,
        1
      );
      let material = new THREE.MeshBasicMaterial({
        color: blnNRCovariate ? 'black' : covariate.color,
        wireframe: this.useWireframe,
      });
      let cylinder = new THREE.Mesh(geometry, material);

      let diffX = Math.round(Math.abs(sourcePos[0] - targetPos[0]));
      let diffY = Math.round(Math.abs(sourcePos[1] - targetPos[1]));

      let offsetX = 0;
      let offsetY = 0;
      if (offsetModifier > 0) {
        offsetX = diffX * offsetModifier - diffX * covariateIncrement;
        offsetY = diffY * offsetModifier - diffY * covariateIncrement;
      } else if (offsetModifier < 0) {
        offsetX = diffX * offsetModifier + diffX * covariateIncrement;
        offsetY = diffY * offsetModifier + diffY * covariateIncrement;
      }

      let distanceModifier = thisCovarIndex * covariateIncrement; // 0.25, 0.5, 0.75

      let distanceX = diffX * distanceModifier + offsetX;
      let distanceY = diffY * distanceModifier + offsetY;

      cylinder.position.x = targetPos[0] + distanceX; // targetPos
      cylinder.position.y = targetPos[1] + distanceY; // sourcePos
      cylinder.position.z = (blnNRCovariate ? 0 : scaleCovariateValue / 2) + 1;

      let directionModiferX = targetPos[0] < sourcePos[0] ? -1 : 1;
      let directionModiferY = targetPos[1] < sourcePos[1] ? -1 : 1;

      distanceX *= directionModiferX;
      distanceY *= directionModiferY;

      // the ifs below determine whether a cyclinder is going to be in a pos/neg area of the x/y axis
      if (targetPos[0] < 0 && targetPos[1] < 0) {
        cylinder.position.x = sourcePos[0] + distanceX;
        cylinder.position.y = sourcePos[1] + distanceY;
      }

      if (targetPos[0] >= 0 && targetPos[1] >= 0) {
        cylinder.position.x = sourcePos[0] + distanceX;
        cylinder.position.y = sourcePos[1] + distanceY;
      }

      if (sourcePos[0] >= 0 && sourcePos[1] >= 0) {
        cylinder.position.x = sourcePos[0] + distanceX;
        cylinder.position.y = sourcePos[1] + distanceY;
      }

      if (sourcePos[0] < 0 && sourcePos[1] < 0) {
        cylinder.position.x = sourcePos[0] + distanceX;
        cylinder.position.y = sourcePos[1] + distanceY;
      }

      if (sourcePos[0] < 0 && sourcePos[1] > 0) {
        cylinder.position.x = sourcePos[0] + distanceX;
        cylinder.position.y = sourcePos[1] + distanceY;
      }

      if (targetPos[0] < 0 && targetPos[1] > 0) {
        cylinder.position.x = sourcePos[0] + distanceX;
        cylinder.position.y = sourcePos[1] + distanceY;
      }

      cylinder.rotateX(Math.sin(Math.PI / 180) * 90);
      //cylinder.isCylinder = true;
      //cylinder.objectType = 3; // is covariate cyclinder

      this.allGroupedObjects.add(cylinder);
      let showHideCovariateLabels = false;
      // if the covaraite labels need to be shown
      if (showHideCovariateLabels) {
        // combine the covariate and its unit text
        let valueText = blnNRCovariate
          ? '\nN/R'
          : '\n' + covariate.covariate + '(' + covariate.unit + ')';

        // let txSprite = makeTextSprite(studyName + valueText, cylinder.position.x, cylinder.position.y,
        //   blnNRCovariate ? 0 :
        //   scaleCovariateValue, {
        //     fontsize: 82,
        //     fontface: "arial",
        //     fillColor: { r: 255, g: 255, b: 255, a: 1.0 },
        //     vAlign: "bottom",
        //     hAlign: "right",
        //     textColor: studyColor,
        //     lineHeight: 82,
        //     width: cylinderWidth

        //   });
        // this.allGroupedObjects.add(txSprite);
      }

      thisCovarIndex++;
    }
  };

  getPos = (sIndex: any) => {
    let rtnVal = [];
    let lenTreatments = this.treatments.length;
    let i = 0;
    for (i; i < lenTreatments; i++) {
      if (this.treatments[i].treatment_index === sIndex) {
        rtnVal = this.treatments[i].pos;
        break;
      }
    }
    return rtnVal;
  };

  // Creates the nodes
  createTreatments = () => {
    // iterate each node object

    let lenTreatments = this.treatments.length;
    console.log(lenTreatments);
    for (let i = 0; i < lenTreatments; i++) {
      //if (isTreatmentVisible(this.treatments[i].treatment_index)) {
      //set the size of the sphere
      debugger;
      let sphereWeight = this.treatments[i].weighting * 10;
      let distanceFromBaseNode = !this.treatments[i].distanceFromBaseNode
        ? this.distanceFromBaseNode
        : this.treatments[i].distanceFromBaseNode; //this.treatments[i].distanceFromBaseNode;
      let geometry = new THREE.SphereGeometry(sphereWeight, 15, 15);
      let object: any;
      object = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({
          color: this.treatments[i].color,
          wireframe: this.useWireframe,
        })
      );

      object.castShadow = false;
      object.receiveShadow = false;
      object.NodeID = this.treatments[i].treatment_index;
      object.objectType = 1; // is treament type
      object.details = this.treatments[i];

      // if the node is the basenode then set it to pos 0,0,0
      if (this.treatments[i].basenode) {
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = 0;
      } else {
        object.position.x = this.treatments[i].pos[0];
        object.position.y = this.treatments[i].pos[1];

        // if is total rebuild of data or first time app loads and not using loaded data
        if (this.totalRebuild || this.initOpen) {
          object.position.x =
            Math.cos((this.segmentTotal * Math.PI) / 180) *
            distanceFromBaseNode;
          object.position.y =
            Math.sin((this.segmentTotal * Math.PI) / 180) *
            distanceFromBaseNode;
        }

        object.position.z = 0;
        this.segmentTotal += this.segmentSize;
      }

      this.treatments[i].pos.splice(0, 3); // clear previous position data
      this.treatments[i].pos.push(
        object.position.x,
        object.position.y,
        object.position.z
      );

      this.allGroupedObjects.add(object);
      //vm.intersectObjects.push(object);
      //vm.objects.push(object);
    }
  };

  getModelDataObjects = () => {
    debugger;
    this.treatments = this.exampleModelData[0].config[1].data[0].treatments;
    this.studies = this.exampleModelData[0].config[1].data[0].studies;
    this.covariates = this.exampleModelData[0].config[1].data[0].covariates;

    this.treatmentsCount = this.treatments.length;
    this.studiesCount = this.studies.length;
    this.covariatesCount = this.covariates.length;
    debugger;
    // // get size of each segment
    this.segmentSize = 360 / (this.treatmentsCount - 1); // -1 to exclude the basenode;
    this.segmentTotal = 0;

    // if is a total rebuild of data or it is the first time that the app has been loaded
    if (this.totalRebuild || this.initOpen) {
      //   //initialise as showing covariate labels
      let showHideCovariateLabels = false;
      //   //initially show grid
      let showGrid = true;
      //this.rebuildModelData();
    }
    // create list of covariates for the drop down
    //this.createDistinctCovariateList();
  };

  rebuildModelData = () => {
    // has link data already been created/loaded
    if (this.exampleModelData[0].links !== undefined) {
      this.links = this.exampleModelData[0].links;
      return;
    }

    let linksObject: any;
    let links: any = [];
    //links = [];
    linksObject = { links: [] };
    //inksObject.push(links);

    let sourceIndex = 0;
    let targetIndex = 0;

    //check to see if a treatment has any links
    let _linkExists = (studyObj: any) => {
      let exists = false;
      let lenlinksObject = linksObject.links.length;
      for (let i = 0; i < lenlinksObject; i++) {
        if (
          (linksObject.links[i].sourceIndex === studyObj.sourceIndex &&
            linksObject.links[i].targetIndex === studyObj.targetIndex) ||
          (linksObject.links[i].targetIndex === studyObj.sourceIndex &&
            linksObject.links[i].sourceIndex === studyObj.targetIndex) ||
          (linksObject.links[i].sourceIndex === studyObj.targetIndex &&
            linksObject.links[i].targetIndex === studyObj.sourceIndex)
        ) {
          exists = true;
        }
      }

      return exists;
    };
    // check to see if a trial exists
    let _trialExists = (trialIndex: number) => {
      let exists = false;
      let lenTreatments: number = this.treatments.length;
      for (let i = 0; i < lenTreatments; i++) {
        if (this.treatments[i].treatment_index === trialIndex) {
          this.treatments[i].pos[0] = this.useLoadedData
            ? this.treatments[i].pos[0]
            : 300;
          this.treatments[i].pos[1] = this.useLoadedData
            ? this.treatments[i].pos[1]
            : 300;
          exists = true;
          break;
        }
      }
      return exists;
    };

    let linkCount = 1;
    let lenStudies = this.studies.length;

    for (let i = 0; i < lenStudies; i++) {
      sourceIndex = this.studies[i].sourceIndex;
      targetIndex = this.studies[i].targetIndex;

      if (
        !_linkExists(this.studies[i]) &&
        _trialExists(sourceIndex) &&
        _trialExists(targetIndex)
      ) {
        let newLink = {
          index: linkCount++,
          sourceIndex: this.studies[i].sourceIndex,
          targetIndex: this.studies[i].targetIndex,
          offset: 0,
          spacing: 1,
          color: 'silver',
          showTreatment: true,
          trialLinkWeighting: 5,
          studies: [],
        };

        linksObject.links.push(newLink);
        debugger;
      }
    }

    //get each study that uses the source and target index
    let lenlLinksObject = linksObject.links.length;
    for (let i = 0; i < lenlLinksObject; i++) {
      let thisLink = linksObject.links[i];
      let studiesArr = this.studies.filter(function (s: any) {
        let exists =
          (s.sourceIndex === thisLink.sourceIndex &&
            s.targetIndex === thisLink.targetIndex) ||
          (s.targetIndex === thisLink.sourceIndex &&
            s.sourceIndex === thisLink.targetIndex) ||
          (s.sourceIndex === thisLink.targetIndex &&
            s.targetIndex === thisLink.sourceIndex);
        return exists;
      });

      // builds a study and its index into the studies array
      let lenStudiesArr = studiesArr.length;
      for (let i = 0; i < lenStudiesArr; i++) {
        let thisStudy = studiesArr[i];
        let newStudy = {
          studyIndex: thisStudy.index,
          studyName: thisStudy.studyName,
          weighting: thisStudy.weighting,
          covariatesWeighting: thisStudy.covariatesWeighting,
          color: 'black',
          covariates: this.getCovariates(thisStudy.index),
        };
        thisLink.studies.push(newStudy);
      }
    }
    this.links = linksObject.links;
  };

  // set covariate color based on its value
  getCovariates = (studyId: number) => {
    let studyCovariates;

    studyCovariates = this.covariates.filter(function (c: any) {
      c.colorChanged = false;
      c.valueChanged = false;

      if (c.covariate === 'N/R') {
        c.color = 'black';
      } else if (c.covariate > 0) {
        c.color = 'green';
      } else {
        c.color = 'red';
      }

      return c.studyIndex === studyId;
    });

    return studyCovariates;
  };

  createDistinctCovariateList = () => {
    let covariateList = [];
    let lenCovariates = this.covariates.length;
    for (let i = 0; i < lenCovariates; i++) {
      if (covariateList.indexOf(this.covariates[i].name) === -1) {
        covariateList.push(this.covariates[i].name);
      }
    }
    this.covariatesDistinctList = covariateList;
  };

  setupThreeObjects = () => {
    let allGroupedObjects = new THREE.Group();
    debugger;

    let plotContainer = document.getElementById('plotContainer');

    let num1: any;
    let num2: any;
    num1 = plotContainer?.offsetWidth;
    num2 = plotContainer?.offsetHeight;

    const aspect = num1 / num2;

    this.camera = new THREE.PerspectiveCamera(70, aspect, 1, 10000);
    //if (this.totalRebuild || this.initOpen || !this.useConfigOptions) {
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 2000;
    //}

    //this.projector = new THREE.Raycaster();
    this.controls = new Orbit.OrbitControls(
      this.camera,
      this.renderer.domElement
    ); // this is the type of control that is used to move the cmaera about in the scene

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 1;
    this.controls.enableZoom = false; // stops zooming funtionality provided by orbit controls, allowing me to use custom zoom functions
    this.controls.maxPolarAngle = Math.PI; // stop the orbitcontrol form going below the 'ground' ie the -axis
    this.controls.update();
    // // set a new overall area to add objects into
    this.scene = new THREE.Scene();
    // //add ambient light
    this.scene.add(new THREE.AmbientLight(0x505050));
    this.scene.background = new THREE.Color(0xcccccc);

    // // create spotlight object
    let light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 500, 2000);
    light.castShadow = true;

    light.shadow.camera.near = 200;
    light.shadow.camera.far = this.camera.far;
    light.shadow.camera.fov = 0;

    light.shadow.bias = -0.00022;

    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    //add light object
    this.scene.add(light);

    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000, 8, 8),
      new THREE.MeshBasicMaterial({
        visible: false,
        wireframe: this.useWireframe,
      })
    );
    debugger;

    let num1a: any;
    let num2a: any;
    num1a = plotContainer?.offsetWidth;
    num2a = plotContainer?.offsetHeight;

    this.renderer.setClearColor(0xaaaaaa, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(num2a, num2a);
    this.renderer.sortObjects = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.domElement.id = 'canvas';

    this.container.appendChild(this.renderer.domElement);
  };

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.render();
  };

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };
}
