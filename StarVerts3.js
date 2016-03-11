// Yi Zhang Project C - Star Verts 3


// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
                                        // Phong diffuse reflectance.
  'uniform vec4 u_Ke;' + // Instead, we'll use this 'uniform'
  'uniform vec4 u_Ka;' + 
  'uniform vec4 u_Kd;' + 
  'uniform vec4 u_Ks;' + 
  'uniform float u_Kshiny;' + 
                                        // value for the entire shape
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +     // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +    // Inverse Transpose of ModelMatrix;
                                        // (doesn't distort normal directions)
  'varying vec4 v_Ke; \n' +
  'varying vec4 v_Ka; \n' +
  'varying vec4 v_Kd; \n' +
  'varying vec4 v_Ks; \n' +
  'varying float v_Kshiny; \n' +

  // lighting/shading flag
  'uniform bool vs_phong_shading;\n' +       // false: gouraud lighting
  'uniform bool vs_bling_phong_lighting;\n' +       // false: phong lighting
    
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Ke = u_Ke; \n' +   // diffuse reflectance
  '  v_Ka = u_Ka; \n' +   // diffuse reflectance
  '  v_Kd = u_Kd; \n' +   // diffuse reflectance
  '  v_Ks = u_Ks; \n' +   // diffuse reflectance
  '  v_Kshiny = u_Kshiny; \n' +   // diffuse reflectance
  // '  if (!phong_shading) {\n' +

  // '  }' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  // Camera/move light source:
  'uniform vec3 u_Lamp0Pos;\n' +      // Phong Illum: position
  'uniform vec3 u_Lamp0Amb;\n' +      // Phong Illum: ambient
  'uniform vec3 u_Lamp0Diff;\n' +     // Phong Illum: diffuse
  'uniform vec3 u_Lamp0Spec;\n' +     // Phong Illum: specular
  // Head/Fixed light
  'uniform vec3 u_Lamp1Pos;\n' +      // Phong Illum: position
  'uniform vec3 u_Lamp1Amb;\n' +      // Phong Illum: ambient
  'uniform vec3 u_Lamp1Diff;\n' +     // Phong Illum: diffuse
  'uniform vec3 u_Lamp1Spec;\n' +     // Phong Illum: specular
  
  'uniform int u_FixedLightFlg;\n' +      //light flag
  'uniform int u_MoveLightFlg;\n' +                         //light flag

  // lighting/shading flag
  'uniform bool fs_phong_shading;\n' +       // false: gouraud lighting
  'uniform bool fs_bling_phong_lighting;\n' +       // false: phong lighting


  'varying vec3 v_Normal;\n' +        // Find 3D surface normal at each pix
  'varying vec3 v_Position;\n' +      // and 3D position too -- in 'world' coords
  
  'varying vec4 v_Ke; \n' +           // Find diffuse reflectance K_d per pix
  'varying vec4 v_Ka; \n' +
  'varying vec4 v_Kd; \n' +
  'varying vec4 v_Ks; \n' +
  'varying float v_Kshiny;\n' +
                                      // Ambient? Emissive? Specular? almost
  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_Lamp0Pos - v_Position);\n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
   
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 emissive = vec3(v_Ke.rgb);' +
  '  vec3 ambient = u_Lamp0Amb * v_Ka.rgb;\n' +
  '  vec3 diffuse = u_Lamp0Diff * v_Kd.rgb * nDotL;\n' +
  '  vec3 specular = vec3(0.0,0.0,0.0);\n' +
  // '  if (nDotL > 0.0) {\n' +
  // '    vec3 reflectVec = reflect(-lightDirection, normal);\n' +
  // '    specular = u_Lamp0Spec * v_Ks.rgb * pow(max(dot(reflectVec, normalize(u_Lamp0Pos-v_Position)), 0.0),v_Kshiny);\n' +
  // '  }\n' +
  '  if (nDotL > 0.0) {\n' +
  '    if (fs_bling_phong_lighting) {\n' +
  '      vec3 halfwayVector = normalize(lightDirection + normalize(u_Lamp0Pos-v_Position));\n' +
  '      float specTmp = max(dot(normal, halfwayVector), 0.0);\n' +
  '      specular = u_Lamp0Spec * v_Ks.rgb * pow(specTmp, v_Kshiny);\n' +
  '    } else {\n' +
  '      vec3 reflectVec = reflect(-lightDirection, normal);\n' +
  '      specular = u_Lamp0Spec * v_Ks.rgb * pow(max(dot(reflectVec, normalize(u_Lamp0Pos-v_Position)), 0.0),v_Kshiny);\n' +
  '    }\n' +
  '  }\n' +
  
  //light in the head/fixed
  '  vec3 lightDirection1 = normalize(u_Lamp1Pos - v_Position);\n' +
     // The dot product of the light direction and the normal
  '  float nDotL1 = max(dot(lightDirection1, normal), 0.0);\n' +
   
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 emissive1 = vec3(v_Ke.rgb);' +
  '  vec3 ambient1 = u_Lamp1Amb * v_Ka.rgb;\n' +
  '  vec3 diffuse1 = u_Lamp1Diff * v_Kd.rgb * nDotL1;\n' +
  '  vec3 specular1 = vec3(0.0,0.0,0.0);\n' +
  // '  if (nDotL1 > 0.0) {\n' +
  // '    vec3 reflectVec = reflect(-lightDirection1, normal);\n' +
  // '    specular1 = u_Lamp1Spec * v_Ks.rgb * pow(max(dot(reflectVec, normalize(u_Lamp1Pos-v_Position)), 0.0),v_Kshiny);\n' +
  // '  }\n' +
  '  if (nDotL1 > 0.0) {\n' +
  '    if (fs_bling_phong_lighting) {\n' +
  '      vec3 halfwayVector = normalize(lightDirection1 + normalize(u_Lamp1Pos-v_Position));\n' +
  '      float specTmp = max(dot(normal, halfwayVector), 0.0);\n' +
  '      specular1 = u_Lamp1Spec * v_Ks.rgb * pow(specTmp, v_Kshiny);\n' +
  '    } else {\n' +
  '      vec3 reflectVec = reflect(-lightDirection1, normal);\n' +
  '      specular1 = u_Lamp1Spec * v_Ks.rgb * pow(max(dot(reflectVec, normalize(u_Lamp1Pos-v_Position)), 0.0),v_Kshiny);\n' +
  '    }\n' +
  '  }\n' +


  // No light
  '  if (u_FixedLightFlg == 0 && u_MoveLightFlg == 0) {\n' +
  '      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
  '  }\n' +
  
  // Both lights
  '  if (u_FixedLightFlg == 1 && u_MoveLightFlg == 1) {\n' +
  '     gl_FragColor = vec4(emissive + ambient + diffuse + specular + emissive1 + ambient1 + diffuse1 + specular1, 1.0);\n' +
  '  }\n' +

  // Only Fixed Light
  '  if (u_FixedLightFlg == 1 && u_MoveLightFlg == 0) {\n' +
  '     gl_FragColor = vec4(emissive + ambient + diffuse + specular, 1.0);\n' +
  '  }\n' +
    
  // Only Camera light
  '  if (u_FixedLightFlg == 0 && u_MoveLightFlg == 1) {\n' +
  '     gl_FragColor = vec4(emissive1 + ambient1 + diffuse1 + specular1, 1.0);\n' +
  '  }\n' +
    
  '}\n';

var ANGLE_STEP = 45.0;  
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
var MOVE_STEP = 0.15;
var LOOK_STEP = 0.02;
var PHI_NOW = 0;
var THETA_NOW = 0;
var LAST_UPDATE = -1;

var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var mvpMatrix = new Matrix4();
var normalMatrix = new Matrix4();
var lastJointSize = 1.4;

var c30 = Math.sqrt(0.75);
var sq2 = Math.sqrt(2.0);

var gl;

var g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 4.25; 
var lookAtX = 0.0, lookAtY = 0.0, lookAtZ = 0.0;

var u_Lamp0Pos;
var u_Lamp0Amb;
var u_Lamp0Diff;
var u_Lamp0Spec;

var u_Lamp1Pos;
var u_Lamp1Amb;
var u_Lamp1Diff;
var u_Lamp1Spec;

var u_Ke;
var u_Ka;
var u_Kd;
var u_Ks;
var u_Kshiny;

var u_FixedLightFlg;
var u_MoveLightFlg;

var Lamp0On; // fixed
var Lamp1On; // camera

var Lamp0Position;
newLightPos(0);

var vs_bling_phong_lighting;
var vs_phong_shading;

var fs_bling_phong_lighting;
var fs_phong_shading;

var bling_phong_lighting;
var phong_shading;

//var canvas;
function main() {
//==============================================================================
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;

  // console.log('User Guide: Press Up/Down/Left/Right keys to change the eye position.')
  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

	gl.enable(gl.DEPTH_TEST); 
	
  // Set the vertex coordinates and color (the blue triangle is in the front)
  var n = initVertexBuffers(gl);

  if (n < 0) {
    console.log('Failed to specify the vertex infromation');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Get the storage locations of u_ViewMatrix and u_ProjMatrix variables
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  
  if (!u_MvpMatrix || !u_ModelMatrix || !u_NormalMatrix) { 
    console.log('Failed to get the location of uniform variables');
    return;
  }

    //  ... for Phong light 0 source:
  u_Lamp0Pos  = gl.getUniformLocation(gl.program,   'u_Lamp0Pos');
  u_Lamp0Amb  = gl.getUniformLocation(gl.program,   'u_Lamp0Amb');
  u_Lamp0Diff = gl.getUniformLocation(gl.program,   'u_Lamp0Diff');
  u_Lamp0Spec = gl.getUniformLocation(gl.program,   'u_Lamp0Spec');
  if( !u_Lamp0Pos || !u_Lamp0Amb || !u_Lamp0Diff){ //  || !u_Lamp0Spec  ) {
    console.log('Failed to get the Lamp0 storage locations');
    return;
  }

  //  ... for Phong light 1 source:
  u_Lamp1Pos  = gl.getUniformLocation(gl.program,   'u_Lamp1Pos');
  u_Lamp1Amb  = gl.getUniformLocation(gl.program,   'u_Lamp1Amb');
  u_Lamp1Diff = gl.getUniformLocation(gl.program,   'u_Lamp1Diff');
  u_Lamp1Spec = gl.getUniformLocation(gl.program,   'u_Lamp1Spec');
  if( !u_Lamp1Pos || !u_Lamp1Amb || !u_Lamp1Diff || !u_Lamp1Spec  ) {
    console.log('Failed to get the Lamp1 storage locations');
    return;
  }
    // ... for Phong material/reflectance:
  u_Ke = gl.getUniformLocation(gl.program, 'u_Ke');
  u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
  u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
  u_Kshiny = gl.getUniformLocation(gl.program, 'u_Kshiny');

    if(!u_Ke || !u_Ka || 
             !u_Kd 
             || !u_Ks || !u_Kshiny
             ) {
            console.log('Failed to get the Phong Reflectance storage locations');
    }



  // Setting Initial lighting values
  gl.uniform3f(u_Lamp0Amb, 0.2, 0.2, 0.2);    // ambient
  gl.uniform3f(u_Lamp0Diff, 2, 1, 1);   // diffuse
  gl.uniform3f(u_Lamp0Spec, 1, 1, 1);   // Specular

  gl.uniform3f(u_Lamp1Amb, 0.0, 0.0, 0.0);    // ambient
  gl.uniform3f(u_Lamp1Diff, 1.5, 1.5, 1.5);   // diffuse
  gl.uniform3f(u_Lamp1Spec, 1, 1, 1);   // Specular

  //light flag
  u_FixedLightFlg = gl.getUniformLocation(gl.program, 'u_FixedLightFlg');
  u_MoveLightFlg = gl.getUniformLocation(gl.program, 'u_MoveLightFlg');
 
  // lighting/shading flags
  fs_bling_phong_lighting = gl.getUniformLocation(gl.program, 'fs_bling_phong_lighting');
  fs_phong_shading = gl.getUniformLocation(gl.program, 'fs_phong_shading');
  vs_bling_phong_lighting = gl.getUniformLocation(gl.program, 'vs_bling_phong_lighting');
  vs_phong_shading = gl.getUniformLocation(gl.program, 'vs_phong_shading');


  // if( !fs_bling_phong_lighting || !fs_phong_shading || !vs_bling_phong_lighting || !vs_phong_shading  ) {
  //   console.log(!fs_bling_phong_lighting + !fs_phong_shading + !vs_bling_phong_lighting + !vs_phong_shading);
  //   console.log('Failed to get the lighting/shading flag storage locations');
  //   return;
  // }

  phong_shading = true;
  bling_phong_lighting = false;
  updateLightingShading();




  gl.uniform1i(u_MoveLightFlg,  1); // Camera Light on
  Lamp1On = true;
  gl.uniform1i(u_FixedLightFlg,  0); // Fixed Light off
  Lamp0On = false;

 document.onkeydown = function(ev){ keydown(ev, gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, currentAngle, canvas); };


 var currentAngle = 0.0;
 var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    
    // gl.uniform3f(u_Lamp0Pos, 5.0+X_Light, -8.0+Y_Light, 7.0+Z_Light);
    gl.uniform3f(u_Lamp0Pos, Lamp0Position[0], Lamp0Position[1], Lamp0Position[2]);
    gl.uniform3f(u_Lamp1Pos,g_EyeX, g_EyeY, g_EyeZ);

    // initialization of shading method:
    gl.uniform1i(fs_bling_phong_lighting, bling_phong_lighting);
    gl.uniform1i(fs_phong_shading, phong_shading);
    gl.uniform1i(vs_bling_phong_lighting, bling_phong_lighting);
    gl.uniform1i(vs_phong_shading, phong_shading);

    draw(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, currentAngle, canvas);   // Draw the triangles
    requestAnimationFrame(tick, canvas);   
                      // Request that the browser re-draw the webpage
 };
 tick(); 

}



function initVertexBuffers(gl) {
  
  makeBoard();
  makeTetrahedron();
  makeBox();
  makeSphere();
  makeGroundGrid();
  makeCylinder();
  makeTorus();
  makeAxes();

  var mySiz = (bdVerts.length + ttrVerts.length + boxVerts.length + sphVerts.length + gndVerts.length+cylVerts.length+torVerts.length+axVerts.length+bdVerts.length);

  // How many vertices total?
  var nn = mySiz / floatsPerVertex;
  //console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
  // Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);

  bdStart = 0;             // we stored the cylinder first.
  for(i=0,j=0; j< bdVerts.length; i++,j++) {
    colorShapes[i] = bdVerts[j];
    }
   
  ttrStart = i;           // next, we'll store the sphere;
  for(j=0; j< ttrVerts.length; i++, j++) {// don't initialize i -- reuse it!
    colorShapes[i] = ttrVerts[j];
    }

  sphStart = i;           // next we'll store the ground-plane;
  for(j=0; j< sphVerts.length; i++, j++) {
    colorShapes[i] = sphVerts[j];
    }
    
  boxStart = i;           // next, we'll store the box;
  for(j=0; j< boxVerts.length; i++, j++) {
    colorShapes[i] = boxVerts[j];
    }

    gndStart=i;
  for(j=0;j<gndVerts.length; i++, j++){
    colorShapes[i]=gndVerts[j];
  }
    cylStart=i;
  for(j=0;j<cylVerts.length;i++,j++){
    colorShapes[i]=cylVerts[j];
  }
    torStart=i;
  for(j=0;j<torVerts.length;i++,j++){
    colorShapes[i]=torVerts[j];
  }
    axStart=i;
  for(j=0;j<axVerts.length;i++,j++){
    colorShapes[i]=axVerts[j];
  }
    bdStart=i;
  for(j=0;j<bdVerts.length;i++,j++){
    colorShapes[i]=bdVerts[j];
  }
  
  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?
    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
      a_Position,   // choose Vertex Shader attribute to fill with data
      4,            // how many values? 1,2,3 or 4.  (we're using x,y,z,w)
      gl.FLOAT,     // data type for each value: usually gl.FLOAT
      false,        // did we supply fixed-point data AND it needs normalizing?
      FSIZE * floatsPerVertex,    // Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b) * bytes/value
      0);           // Offset -- now many bytes from START of buffer to the
                    // value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
                    // Enable assignment of vertex buffer object's position data

 var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0)
  {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * floatsPerVertex, FSIZE * 4);
  gl.enableVertexAttribArray(a_Normal);
  //--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}

function vec3FromEye2LookAt(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ)
{
  result = new Vector3();
  
  dx = lookAtX - eyeX;
  dy = lookAtY - eyeY;
  dz = lookAtZ - eyeZ;
  amp = Math.sqrt(dx*dx + dy*dy + dz*dz);

  result[0] = dx/amp;
  result[1] = dy/amp;
  result[2] = dz/amp;

  return result;
}

function vec3CrossProduct(up, look) //UpVec x LookVec --> Left Vec
{
  r = new Vector3();

  r[0] = up[1]*look[2] - up[2]*look[1];
  console.log('up1', up[1]);
  r[1] = up[2]*look[0] - up[0]*look[2];
  r[2] = up[0]*look[1] - up[1]*look[0];

  amp = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]) + 0.000001;

  r[0] /= amp;
  r[1] /= amp;
  r[2] /= amp;

  return r;
}



function draw(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, currentAngle, canvas) {
//==============================================================================
  
  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the perspective camera view
  gl.viewport(0, 0, canvas.width, canvas.height);
  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100);
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, 
  										lookAtX, lookAtY, lookAtZ, 									
  										0, 1, 0);			
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  
  drawMyScene(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, currentAngle,canvas);
}

function setMaterial(gl, materialType) {
  var myMatter = new Material(materialType);
  gl.uniform4f(u_Ke, myMatter.K_emit[0], myMatter.K_emit[1], myMatter.K_emit[2], myMatter.K_emit[3]);
  gl.uniform4f(u_Ka, myMatter.K_ambi[0], myMatter.K_ambi[1], myMatter.K_ambi[2], myMatter.K_ambi[3]);
  gl.uniform4f(u_Kd, myMatter.K_diff[0], myMatter.K_diff[1], myMatter.K_diff[2], myMatter.K_diff[3]);
  gl.uniform4f(u_Ks, myMatter.K_spec[0], myMatter.K_spec[1], myMatter.K_spec[2], myMatter.K_spec[3]);
  gl.uniform1f(u_Kshiny, myMatter.K_shiny); 
}

function drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, shapeStart, shapeVerts) {
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, shapeStart/floatsPerVertex,shapeVerts.length/floatsPerVertex);
}


function drawMyScene(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, currentAngle, canvas) {

  // Object 1: Cylinder System
    // Cylinder 1
    setMaterial(gl, MATL_OBSIDIAN);
    modelMatrix.setTranslate(0.0, 0, 0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.3,0.3,0.3);
    modelMatrix.rotate(currentAngle,0,0,1);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);

    // Cylinder 2
    modelMatrix.translate(1.0,1.0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,0,1,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);

    // Cylinder 3
    modelMatrix.translate(1.1,1.1,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.7,0.7,0.7);
    modelMatrix.rotate(currentAngle*2,1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);
    
    // Cylinder 4
    modelMatrix.translate(1.0,1.0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,0,1,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);

    // Cylinder 5
    modelMatrix.translate(1.1,1.1,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.7,0.7,0.7);
    modelMatrix.rotate(currentAngle*2,1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);
    
    // Cylinder 6
    modelMatrix.translate(1.0,1.0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,0,1,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);

    // Cylinder 7
    modelMatrix.translate(1.1,1.1,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(lastJointSize-0.7,lastJointSize/2,lastJointSize/2);
    modelMatrix.rotate(currentAngle*2,1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);
  // End of Object 1

  // Object 2: Sphere-Torus System

    // Draw Center Sphere
    setMaterial(gl, MATL_CHROME);
    modelMatrix.setTranslate(-3.0,-0.3,-2.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.1,0.1,0.1);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);
    pushMatrix(modelMatrix);

    // Draw Right Torus
    modelMatrix.translate(3.9,0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(2,2,2);
    modelMatrix.rotate(currentAngle, -1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, torStart, torVerts);

    // Draw Up Sphere 
    modelMatrix.translate(0,1.9,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.5,0.5,0.5);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Up Torus
    modelMatrix.translate(0,3.9,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(2,2,2);
    modelMatrix.rotate(currentAngle, 0,1,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, torStart, torVerts);

    // Draw Left Torus
    modelMatrix=popMatrix();
    modelMatrix.translate(-3.9,0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(2,2,2);
    modelMatrix.rotate(currentAngle, 1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, torStart, torVerts);

    // Draw Down Sphere 
    modelMatrix.translate(0,-1.9,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.5,0.5,0.5);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Down Torus
    modelMatrix.translate(0,-3.9,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(2,2,2);
    modelMatrix.rotate(currentAngle, 0,-1,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, torStart, torVerts);
  // End of Object 2

  // Object 3: Cylinder-Sphere System

    // Draw Cylinder
    setMaterial(gl, MATL_GOLD_DULL);
    modelMatrix.setTranslate(2.5,-0.3,-2.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.3,0.3,0.1);
    modelMatrix.rotate(90, 1,0,0);
    modelMatrix.rotate(currentAngle, 0,0,1);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, cylStart, cylVerts);
    pushMatrix(modelMatrix);
    pushMatrix(modelMatrix);

    //Draw Top Sphere
    modelMatrix.translate(0,0,-0.85);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.77,0.77,0.77);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);    

    // Draw Left Sphere 1
    modelMatrix=popMatrix();
    modelMatrix.translate(1.45,0.0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Left Sphere 2
    modelMatrix.translate(1.0,0.0,1.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,1,0,1);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Left Sphere 3
    modelMatrix.translate(1.0,0.0,1.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Right Sphere 1
    modelMatrix=popMatrix();
    modelMatrix.translate(-1.45,0.0,0.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,1,0,0);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Right Sphere 2
    modelMatrix.translate(-1.0,0.0,1.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    modelMatrix.rotate(currentAngle*2,1,0,1);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);

    // Draw Right Sphere 3
    modelMatrix.translate(-1.0,0.0,1.0);
    modelMatrix.scale(1,1,-1);
    modelMatrix.scale(0.6,0.6,0.6);
    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, sphStart, sphVerts);
  // End of Object 3


  // Draw Ground grid
    setMaterial(gl, MATL_PEWTER);
    modelMatrix.setTranslate(0.0, 0.0, -1.9);
    viewMatrix.rotate(-90.0, 1,0,0);	
  	viewMatrix.translate(0.0, 0.0, -0.6);	
  	viewMatrix.scale(0.4, 0.4,0.4);		

    drawShape(gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, gndStart, gndVerts);
}

function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

  var xcount = 100;     // # of lines to draw in x,y to make the grid.
  var ycount = 100;   
  var xymax = 50.0;     // grid size; extends to cover +/-xymax in x and y.
  // var xColr = new Float32Array([0.3, 0.6, 0.3]);  
  // var yColr = new Float32Array([0.2, 0.3, 0.7]);  
  
  // Create an (global) array to hold this ground-plane's vertices:
  gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
            // draw a grid made of xcount+ycount lines; 2 vertices per line.
            
  var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
  var ygap = xymax/(ycount-1);    // (why half? because v==(0line number/2))
  
  // First, step thru x values as we make vertical lines of constant-x:
  for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
    if(v%2==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
      gndVerts[j  ] = -xymax + (v  )*xgap;  // x
      gndVerts[j+1] = -xymax;               // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;
    }
    else {        // put odd-numbered vertices at (xnow, +xymax, 0).
      gndVerts[j  ] = -xymax + (v-1)*xgap;  // x
      gndVerts[j+1] = xymax;                // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;
    }
    gndVerts[j+4] = 0;  //x_norm
    gndVerts[j+5] = 0;  //y_norm
    gndVerts[j+6] = 1;  //z_norm
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
    if(v%2==0) {    // put even-numbered vertices at (-xymax, ynow, 0)
      gndVerts[j  ] = -xymax;               // x
      gndVerts[j+1] = -xymax + (v  )*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;
    }
    else {          // put odd-numbered vertices at (+xymax, ynow, 0).
      gndVerts[j  ] = xymax;                // x
      gndVerts[j+1] = -xymax + (v-1)*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;
    }
    gndVerts[j+4] = 0;  //x_norm
    gndVerts[j+5] = 0;  //y_norm
    gndVerts[j+6] = 1;  //z_norm
  }
}

function makeTetrahedron() {
  ttrVerts = new Float32Array([
      // Face 0: (left side)
     -0.866, -0.5, 0, 1.0,    -0.11801, 0.1412, 0.15794,  // Node 0
     0.0, 0.0, 0.2, 1.0,    -0.11801, 0.1412, 0.15794,  // Node 1
     -0.16, 0.09, 0.0, 1.0,     -0.11801, 0.1412, 0.15794,  // Node 2
      // Face 1: (right side)
    -0.866, -0.5, 0.0, 1.0,   0.063233,-0.1732, 0.159344, // Node 0
     0.0,  -0.184, 0.0, 1.0,      0.063233,-0.1732, 0.159344, // Node 2
    0, 0, 0.2, 1.0,                     0.063233,-0.1732, 0.159344,   // Node 3
    
      // back face
    -0.866, -0.5, 0, 1.0,   0.0, 0.0, -1.0, // Node 0
     0.0,  -0.184, 0.0, 1.0,      0.0, 0.0, -1.0, // Node 2
     -0.16, 0.09, 0.0, 1.0,     0.0, 0.0, -1.0, // Node 2
     
          // back face
     0.0,  -0.184, 0.0, 1.0,      0.0548, 0.032091, -0.02944,  // Node 2
     -0.16, 0.09, 0.0, 1.0,     0.0548, 0.032091, -0.02944,  // Node 2
     0, 0, 0.2, 1.0,                    0.0548, 0.032091, -0.02944   // Node 3

    ]);
}


function makeBoard() {
   bdVerts = new Float32Array([
    -1.00,-1.00, 0.00, 1.00,      0,1,0,
     1.00,-1.00, 0.00, 1.00,      0,1,0,
     1.00,1.00,0.00,1.00,         0,1,0,

     1.00, 1.00, 0.00, 1.00,    0,1,0,
    -1.00, 1.00, 0.00, 1.00,    0,1,0,  
     -1.00,-1.00, 0.00, 1.00,   0,1,0,
    ]);
}


function makeBox() {
  boxVerts = new Float32Array([

        // +x face: 
     1.0, -1.0, -1.0, 1.0,      1.0,  0.0,  0.0,  // Node 3
     1.0,  1.0, -1.0, 1.0,    1.0,  0.0,  0.0,  // Node 2
     1.0,  1.0,  1.0, 1.0,    1.0,  0.0,  0.0,  // Node 4

     1.0,  1.0,  1.0, 1.0,    1.0,  0.0,  0.0,  // Node 4
     1.0, -1.0,  1.0, 1.0,    1.0,  0.0,  0.0,  // Node 7
     1.0, -1.0, -1.0, 1.0,    1.0,  0.0,  0.0,  // Node 3
     
    // +y face: 
    -1.0,  1.0, -1.0, 1.0,    0.0,  1.0,  0.0,  // Node 1
    -1.0,  1.0,  1.0, 1.0,    0.0,  1.0,  0.0,  // Node 5
     1.0,  1.0,  1.0, 1.0,    0.0,  0.0,  0.0,  // Node 4
     
     1.0,  1.0,  1.0, 1.0,    0.0,  1.0,  0.0,  // Node 4
     1.0,  1.0, -1.0, 1.0,    0.0,  1.0,  0.0,  // Node 2 
    -1.0,  1.0, -1.0, 1.0,    0.0,  1.0,  0.0,  // Node 1
     
    // +z face: 
    -1.0,  1.0,  1.0, 1.0,    0.0,  0.0,  0.1,  // Node 5
    -1.0, -1.0,  1.0, 1.0,    0.0,  0.0,  0.1,  // Node 6
     1.0, -1.0,  1.0, 1.0,    0.0,  0.0,  0.1,  // Node 7
     
     1.0, -1.0,  1.0, 1.0,    0.0,  0.0,  0.1,  // Node 7
     1.0,  1.0,  1.0, 1.0,    0.0,  0.0,  0.1,  // Node 4
    -1.0,  1.0,  1.0, 1.0,    0.0,  0.0,  0.1,  // Node 5
     
    // -x face: 
    -1.0, -1.0,  1.0, 1.0,    -1.0,  0.0,  0.0, // Node 6 
    -1.0,  1.0,  1.0, 1.0,    -1.0,  0.0,  0.0, // Node 5 
    -1.0,  1.0, -1.0, 1.0,    -1.0,  0.0,  0.0, // Node 1
     
    -1.0,  1.0, -1.0, 1.0,    -1.0,  0.0,  0.0, // Node 1
    -1.0, -1.0, -1.0, 1.0,    -1.0,  0.0,  0.0, // Node 0  
    -1.0, -1.0,  1.0, 1.0,    -1.0,  0.0,  0.0, // Node 6  
     
    // -y face: 
     1.0, -1.0, -1.0, 1.0,    0.0,  -1.0,  0.0, // Node 3
     1.0, -1.0,  1.0, 1.0,    0.0,  -1.0,  0.0, // Node 7
    -1.0, -1.0,  1.0, 1.0,    0.0,  -1.0,  0.0, // Node 6
     
    -1.0, -1.0,  1.0, 1.0,    0.0,  -1.0,  0.0, // Node 6
    -1.0, -1.0, -1.0, 1.0,    0.0,  -1.0,  0.0, // Node 0
     1.0, -1.0, -1.0, 1.0,    0.0,  -1.0,  0.0, // Node 3
     
     // -z face: 
     1.0,  1.0, -1.0, 1.0,    0.0,  0.0,  -1.0, // Node 2
     1.0, -1.0, -1.0, 1.0,    0.0,  0.0,  -1.0, // Node 3
    -1.0, -1.0, -1.0, 1.0,    0.0,  0.0,  -1.0, // Node 0   
     
    -1.0, -1.0, -1.0, 1.0,    0.0,  0.0,  -1.0, // Node 0
    -1.0,  1.0, -1.0, 1.0,    0.0,  0.0,  -1.0, // Node 1
     1.0,  1.0, -1.0, 1.0,    0.0,  0.0,  -1.0  // Node 2
//     /*  Nodes:
//      0,-0.1,0.1,1.0,  0.5, 0.0, 0.0,  //Node 0
//      0,-0.1,-0.1,1.0,   0.9,0.6,0.5,  //Node 1
//      0,0.1,-0.1,1.0,    0.7,0.7,0.4,  //Node 2
//      0,0.1,0.1,1.0,   0,0.4,0,  //Node 3
//      -2,0.1,-0.1,1.0,   0.2,0.5,0.3,  //Node 4
//      -2,0.1,0.1,1.0,  0,0.8,0.8,  //Node 5
//      -2,-0.1,0.1,1.0,   0.1,0.6,1.0,  //Node6
//      -2,-0.1,-0.1,1.0,  0.5,0.2,0.9,    //Node7
// */

//       // Former
//       0,0.1,0.1,1.0,   0,0,1,// Node 3
//      0,-0.1,0.1,1.0,   0,0,1,// Node 0
//      -2,-0.1,0.1,1.0,  0,0,1,//Node 6

//      -2,-0.1,0.1,1.0,  0,0,1,//Node6
//      -2,0.1,0.1,1.0,   0,0,1,//Node 5
//      0,0.1,0.1,1.0,    0,0,1,//Node 3
    
//     // Left
//      -2,0.1,-0.1,1.0,  -1,0,0,//Node 4
//      -2,0.1,0.1,1.0,   -1,0,0,//Node 5
//      -2,-0.1,0.1,1.0,  -1,0,0,//Node6

//      -2,-0.1,0.1,1.0,   -1,0,0,//Node6
//      -2,-0.1,-0.1,1.0,  -1,0,0,//Node7
//      -2,0.1,-0.1,1.0,   -1,0,0,//Node 4

//       // Back 
//      0,-0.1,-0.1,1.0,   0,0,-1,//Node 1
//      0,0.1,-0.1,1.0,    0,0,-1,//Node 2
//      -2,0.1,-0.1,1.0,   0,0,-1,//Node 4

//      -2,0.1,-0.1,1.0,   0,0,-1,//Node 4
//      -2,-0.1,-0.1,1.0,  0,0,-1,//Node7
//      0,-0.1,-0.1,1.0,   0,0,-1,//Node 1

//      //Right
//      0,-0.1,0.1,1.0,  1,0,0,//Node 0
//     0,0.1,0.1,1.0,   1,0,0,//Node 3
//      0,0.1,-0.1,1.0,    1,0,0,//Node 2

//      0,0.1,-0.1,1.0,   1,0,0,//Node 2
//      0,-0.1,-0.1,1.0,  1,0,0, //Node 1
//      0,-0.1,0.1,1.0,   1,0,0,//Node 0

//     //Top
//      0,0.1,-0.1,1.0,    0,1,0,//Node 2
//      0,0.1,0.1,1.0,  0,1,0,//Node 3
//      -2,0.1,0.1,1.0,  0,1,0,//Node 5

//      -2,0.1,0.1,1.0,  0,1,0,//Node 5
//      -2,0.1,-0.1,1.0,   0,1,0,//Node 4
//      0,0.1,-0.1,1.0,      0,1,0,//Node 2

//      //Bottom
//      0,-0.1,0.1,1.0,   0,-1,0,//Node 0
//      0,-0.1,-0.1,1.0, 0,-1,0, //Node 1
//      -2,-0.1,-0.1,1.0, 0,-1,0, //Node7

//      -2,-0.1,-0.1,1.0,   0,-1,0,  //Node7
//      -2,-0.1,0.1,1.0,   0,-1,0, //Node6
//      0,-0.1,0.1,1.0,  0,-1,0, //Node 0
    ]);
}

function makeSphere() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
// sphere from one triangle strip.
  var slices = 13;    // # of slices of the sphere along the z axis. >=3 req'd
                      // (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts  = 27; // # of vertices around the top edge of the slice
                      // (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([0.7, 0.7, 0.7]);  // North Pole: light gray
  var equColr = new Float32Array([0.3, 0.7, 0.3]);  // Equator:    bright green
  var botColr = new Float32Array([0.9, 0.9, 0.9]);  // South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;  // lattitude angle spanned by one slice.

  // Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
                    // # of vertices * # of elements needed to store them. 
                    // each slice requires 2*sliceVerts vertices except 1st and
                    // last ones, which require only 2*sliceVerts-1.
                    
  // Create dome-shaped top slice of sphere at z=+1
  // s counts slices; v counts vertices; 
  // j counts array elements (vertices * elements per vertex)
  var cos0 = 0.0;         // sines,cosines of slice's top, bottom edge.
  var sin0 = 0.0;
  var cos1 = 0.0;
  var sin1 = 0.0; 
  var j = 0;              // initialize our array index
  var isLast = 0;
  var isFirst = 1;
  for(s=0; s<slices; s++) { // for each slice of the sphere,
    // find sines & cosines for top and bottom of this slice
    if(s==0) {
      isFirst = 1;  // skip 1st vertex of 1st slice.
      cos0 = 1.0;   // initialize: start at north pole.
      sin0 = 0.0;
    }
    else {          // otherwise, new top edge == old bottom edge
      isFirst = 0;  
      cos0 = cos1;
      sin0 = sin1;
    }               // & compute sine,cosine for new bottom edge.
    cos1 = Math.cos((s+1)*sliceAngle);
    sin1 = Math.sin((s+1)*sliceAngle);
    // go around the entire slice, generating TRIANGLE_STRIP verts
    // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
    if(s==slices-1) isLast=1; // skip last vertex of last slice.
    for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) { 
      if(v%2==0)
      {       // put even# vertices at the the slice's top edge
              // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
              // and thus we can simplify cos(2*PI(v/2*sliceVerts))  
        sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);  
        sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);  
        sphVerts[j+2] = cos0;   
        sphVerts[j+3] = 1.0;      
      }
      else {  // put odd# vertices around the slice's lower edge;
              // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
              //          theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
        sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);    // x
        sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);    // y
        sphVerts[j+2] = cos1;                                       // z
        sphVerts[j+3] = 1.0;                                        // w.   
      }
      if(s==0) {  // finally, set some interesting normal vectors for vertices:
        sphVerts[j+4]=sphVerts[j];
        sphVerts[j+5]=sphVerts[j+1];
        sphVerts[j+6]=sphVerts[j+2];
        }
      else if(s==slices-1) {

        sphVerts[j+4]=sphVerts[j];
        sphVerts[j+5]=sphVerts[j+1];
        sphVerts[j+6]=sphVerts[j+2];
      }
      else { 
          sphVerts[j+4]=sphVerts[j];
          sphVerts[j+5]=sphVerts[j+1];
          sphVerts[j+6]=sphVerts[j+2];       
      }
    }
  }
}

function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.5, 0.3, 0.8]); // dark gray
 var topColr = new Float32Array([0.8, 0.8, 0.2]); // light green
 var botColr = new Float32Array([0.2, 0.8, 0.8]); // light blue
 var capVerts = 1000; // # of vertices around the topmost 'cap' of the shape
 var botRadius = 0.75;   // radius of bottom of cylinder (top always 1.0)
 
  // Create a (global) array to hold this cylinder's vertices;
 numCylVerts = capVerts*6-2;
 cylVerts = new Float32Array(numCylVerts * floatsPerVertex);
		

  // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {  
    // skip the first vertex--not needed.
    if(v%2==0)
    {       // put even# vertices at center of cylinder's top cap:
      cylVerts[j  ] = 0.0;      // x,y,z,w == 0,0,1,1
      cylVerts[j+1] = 0.0;  
      cylVerts[j+2] = 1.0; 
      cylVerts[j+3] = 1.0;      // r,g,b = topColr[]
      cylVerts[j+4] = 0;  
      cylVerts[j+5] = 0;  
      cylVerts[j+6] = 1;  
    }
    else {  // put odd# vertices around the top cap's outer edge;
            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
            //          theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
      cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);     // x
      cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);     // y
      //  (Why not 2*PI? because 0 < =v < 2*capVerts, so we
      //   can simplify cos(2*PI * (v-1)/(2*capVerts))
      cylVerts[j+2] = 1.0;  // z
      cylVerts[j+3] = 1.0;  // w.
      // r,g,b = topColr[]
      cylVerts[j+4] = 0;  
      cylVerts[j+5] = 0;  
      cylVerts[j+6] = 1;       
    }
  }
  // Create the cylinder side walls, made of 2*capVerts vertices.
  // v counts vertices within the wall; j continues to count array elements
  for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
    if(v%2==0)  // position all even# vertices along top cap:
    {   
	    cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);   // x
	    cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);   // y
	    cylVerts[j+2] = 1.0;  // z
	    cylVerts[j+3] = 1.0;  // w.
	    // r,g,b = topColr[]
      cylVerts[j+4] = Math.cos(Math.PI*(v)/capVerts); 
    	cylVerts[j+5] = Math.sin(Math.PI*(v)/capVerts);
    	cylVerts[j+6] = 0;   
    }
    else    // position all odd# vertices along the bottom cap:
    {
        cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);   // x
        cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);   // y
        cylVerts[j+2] =-1.0;  // z
        cylVerts[j+3] = 1.0;  // w.
        // r,g,b = topColr[]
        cylVerts[j+4] = Math.cos(Math.PI*(v-1)/capVerts);
      	cylVerts[j+5] = Math.sin(Math.PI*(v-1)/capVerts);
      	cylVerts[j+6] = 0;   
    }
  }
  // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements
  for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
    if(v%2==0) {  // position even #'d vertices around bot cap's outer edge
      cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);   // x
      cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);   // y
      cylVerts[j+2] =-1.0;  // z
      cylVerts[j+3] = 1.0;  // w.
      // r,g,b = topColr[]
      cylVerts[j+4] = 0;
      cylVerts[j+5] = 0;
      cylVerts[j+6] = -1;   
    }
    else {        // position odd#'d vertices at center of the bottom cap:
      cylVerts[j  ] = 0.0;      // x,y,z,w == 0,0,-1,1
      cylVerts[j+1] = 0.0;  
      cylVerts[j+2] =-1.0; 
      cylVerts[j+3] = 1.0;      // r,g,b = botColr[]
      cylVerts[j+4] = 0;
      cylVerts[j+5] = 0;
      cylVerts[j+6] = -1;
    }

  }
}

function makeTorus() {
//==============================================================================
//    Create a torus centered at the origin that circles the z axis.  
// Terminology: imagine a torus as a flexible, cylinder-shaped bar or rod bent 
// into a circle around the z-axis. The bent bar's centerline forms a circle
// entirely in the z=0 plane, centered at the origin, with radius 'rbend'.  The 
// bent-bar circle begins at (rbend,0,0), increases in +y direction to circle  
// around the z-axis in counter-clockwise (CCW) direction, consistent with our
// right-handed coordinate system.
//    This bent bar forms a torus because the bar itself has a circular cross-
// section with radius 'rbar' and angle 'phi'. We measure phi in CCW direction 
// around the bar's centerline, circling right-handed along the direction 
// forward from the bar's start at theta=0 towards its end at theta=2PI.
//    THUS theta=0, phi=0 selects the torus surface point (rbend+rbar,0,0);
// a slight increase in phi moves that point in -z direction and a slight
// increase in theta moves that point in the +y direction.  
// To construct the torus, begin with the circle at the start of the bar:
//          xc = rbend + rbar*cos(phi); 
//          yc = 0; 
//          zc = -rbar*sin(phi);      (note negative sin(); right-handed phi)
// and then rotate this circle around the z-axis by angle theta:
//          x = xc*cos(theta) - yc*sin(theta)   
//          y = xc*sin(theta) + yc*cos(theta)
//          z = zc
// Simplify: yc==0, so
//          x = (rbend + rbar*cos(phi))*cos(theta)
//          y = (rbend + rbar*cos(phi))*sin(theta) 
//          z = -rbar*sin(phi)
// To construct a torus from a single triangle-strip, make a 'stepped spiral' along the length of the bent bar; successive rings of constant-theta, using the same design used for cylinder walls in 'makeCyl()' and for 'slices' in makeSphere().  Unlike the cylinder and sphere, we have no 'special case' for the first and last of these bar-encircling rings.
//
var rbend = 1.0;                    // Radius of circle formed by torus' bent bar
var rbar = 0.5;                     // radius of the bar we bent to form torus
var barSlices = 230;                 // # of bar-segments in the torus: >=3 req'd;
                                    // more segments for more-circular torus
var barSides = 130;                    // # of sides of the bar (and thus the 
                                    // number of vertices in its cross-section)
                                    // >=3 req'd;
                                    // more sides for more-circular cross-section
// for nice-looking torus with approx square facets, 
//      --choose odd or prime#  for barSides, and
//      --choose pdd or prime# for barSlices of approx. barSides *(rbend/rbar)
// EXAMPLE: rbend = 1, rbar = 0.5, barSlices =23, barSides = 11.

  // Create a (global) array to hold this torus's vertices:
 torVerts = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
//  Each slice requires 2*barSides vertices, but 1st slice will skip its first 
// triangle and last slice will skip its last triangle. To 'close' the torus,
// repeat the first 2 vertices at the end of the triangle-strip.  Assume 7
//tangent vector with respect to big circle
  var tx = 0.0;
  var ty = 0.0;
  var tz = 0.0;
  //tangent vector with respect to small circle
  var sx = 0.0;
  var sy = 0.0;
  var sz = 0.0;
var phi=0, theta=0;                   // begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;  // theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;   // half-phi angle between each side of bar
                                      // (WHY HALF? 2 vertices per step in phi)
  // s counts slices of the bar; v counts vertices within one slice; j counts
  // array elements (Float32) (vertices*#attribs/vertex) put in torVerts array.
  for(s=0,j=0; s<barSlices; s++) {    // for each 'slice' or 'ring' of the torus:
    for(v=0; v< 2*barSides; v++, j+=floatsPerVertex) {    // for each vertex in this slice:
      if(v%2==0)  { // even #'d vertices at bottom of slice,
        torVerts[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) * 
                                             Math.cos((s)*thetaStep);
                //  x = (rbend + rbar*cos(phi)) * cos(theta)
        torVerts[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
                                             Math.sin((s)*thetaStep);
                //  y = (rbend + rbar*cos(phi)) * sin(theta) 
        torVerts[j+2] = -rbar*Math.sin((v)*phiHalfStep);
                //  z = -rbar  *   sin(phi)
        torVerts[j+3] = 1.0;    // w
        //find normal
        tx = (-1) * Math.sin(s*thetaStep);
        ty = Math.cos(s*thetaStep);
        tz = 0.0;

        sx = Math.cos(s*thetaStep) * (-1) * Math.sin(v*phiHalfStep);
        sy = Math.sin(s*thetaStep) * (-1) * Math.sin(v*phiHalfStep);
        sz = (-1) * Math.cos(v*phiHalfStep);

        torVerts[j+4] = -ty*sz + tz*sy;
        torVerts[j+5] = -tz*sx + tx*sz;
        torVerts[j+6] = -tx*sy + ty*sx;
      }
      else {        // odd #'d vertices at top of slice (s+1);
                    // at same phi used at bottom of slice (v-1)
        torVerts[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) * 
                                             Math.cos((s+1)*thetaStep);
                //  x = (rbend + rbar*cos(phi)) * cos(theta)
        torVerts[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
                                             Math.sin((s+1)*thetaStep);
                //  y = (rbend + rbar*cos(phi)) * sin(theta) 
        torVerts[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
                //  z = -rbar  *   sin(phi)
        torVerts[j+3] = 1.0;    // w
        tx = (-1) * Math.sin((s+1)*thetaStep);
        ty = Math.cos((s+1)*thetaStep);
        tz = 0.0;

        sx = Math.cos((s+1)*thetaStep) * (-1) * Math.sin((v-1)*phiHalfStep);
        sy = Math.sin((s+1)*thetaStep) * (-1) * Math.sin((v-1)*phiHalfStep);
        sz = (-1) * Math.cos((v-1)*phiHalfStep);

        torVerts[j+4] = -ty*sz + tz*sy;
        torVerts[j+5] = -tz*sx + tx*sz;
        torVerts[j+6] = -tx*sy + ty*sx;
      }
    }
  }
  // Repeat the 1st 2 vertices of the triangle strip to complete the torus:
      torVerts[j  ] = rbend + rbar; // copy vertex zero;
              //  x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
      torVerts[j+1] = 0.0;
              //  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
      torVerts[j+2] = 0.0;
              //  z = -rbar  *   sin(phi==0)
      torVerts[j+3] = 1.0;    // w
      j+=floatsPerVertex; // go to next vertex:
      torVerts[j  ] = (rbend + rbar) * Math.cos(thetaStep);
              //  x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
      torVerts[j+1] = (rbend + rbar) * Math.sin(thetaStep);
              //  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep) 
      torVerts[j+2] = 0.0;
              //  z = -rbar  *   sin(phi==0)
      torVerts[j+3] = 1.0;    // w
      torVerts[j+4] = 1.0;
      torVerts[j+5] = 0.0;
      torVerts[j+6] = 0.0;
}

function makeAxes(){
   axVerts = new Float32Array([
     0,0,0,1,    1,1,1,
     1,0,0,1,    1,1,1,

     0,0,0,1,    1,1,1,
     0,1,0,1,    1,1,1,

     0,0,0,1,    1,1,1,
     0,0,1,1,    1,1,1,
    ]);
}

function makeBoard() {
   bdVerts = new Float32Array([
    -1.00,-1.00, 0.00, 1.00,       0,0,1,
     1.00,-1.00, 0.00, 1.00,      0,0,1,
     1.00,1.00,0.00,1.00,       0,0,1,

     1.00, 1.00, 0.00, 1.00,      0,0,1,
    -1.00, 1.00, 0.00, 1.00,    0,0,1,  
     -1.00,-1.00, 0.00, 1.00,     0,0,1,
    ]);
}

// Global vars for Eye position. 
// NOTE!  I moved eyepoint BACKWARDS from the forest: from g_EyeZ=0.25
// a distance far enough away to see the whole 'forest' of trees within the
// 30-degree field-of-view of our 'perspective' camera.  I ALSO increased
// the 'keydown()' function's effect on g_EyeX position.


function keydown(ev, gl, u_MvpMatrix, u_ModelMatrix, u_NormalMatrix, currentAngle, canvas) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:
    
    if (ev.keyCode == 70){ // F - Fixed Light Turn On/Off
      if (Lamp0On) 
        gl.uniform1i(u_FixedLightFlg, 0)
      else
        gl.uniform1i(u_FixedLightFlg, 1)
      Lamp0On = !Lamp0On;
    } 
    else 
    if (ev.keyCode == 82){ // R - Camera Light Turn On/Off
      if (Lamp1On) 
        gl.uniform1i(u_MoveLightFlg, 0)
      else
        gl.uniform1i(u_MoveLightFlg, 1)
      Lamp1On = !Lamp1On;
    } 
    // else
    // if (ev.keyCode == 78){ //  N - Decrease speed of rotation
    //   ANGLE_STEP -= 5;
    // }
    // else
    // if (ev.keyCode == 77){ //  M - Increase speed of rotation
    //   ANGLE_STEP += 5;
    // }
    else
    if(ev.keyCode == 76) { // L - move right
        up = new Vector3();
        up[0] = 0;
        up[1] = 1;
        up[2] = 0;
        look = new Vector3();
        look = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, lookAtX, lookAtY, lookAtZ);

        tmpVec3 = new Vector3();
        tmpVec3 = vec3CrossProduct(up, look);

        g_EyeX -= MOVE_STEP * tmpVec3[0];
        g_EyeY -= MOVE_STEP * tmpVec3[1];
        g_EyeZ -= MOVE_STEP * tmpVec3[2];

        lookAtX -= MOVE_STEP * tmpVec3[0];
        lookAtY -= MOVE_STEP * tmpVec3[1];
        lookAtZ -= MOVE_STEP * tmpVec3[2];

    } 
  else 
    if (ev.keyCode == 74) { // J - move left
        up = new Vector3();
        up[0] = 0;
        up[1] = 1;
        up[2] = 0;
        look = new Vector3();
        look = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, lookAtX, lookAtY, lookAtZ);

        tmpVec3 = new Vector3();
        tmpVec3 = vec3CrossProduct(up, look);

        g_EyeX += MOVE_STEP * tmpVec3[0];
        g_EyeY += MOVE_STEP * tmpVec3[1];
        g_EyeZ += MOVE_STEP * tmpVec3[2];

        lookAtX += MOVE_STEP * tmpVec3[0];
        lookAtY += MOVE_STEP * tmpVec3[1];
        lookAtZ += MOVE_STEP * tmpVec3[2];
    } 
  else 
    if (ev.keyCode == 73) { // I- move forward
        tmpVec3 = new Vector3();
        tmpVec3 = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, lookAtX, lookAtY, lookAtZ);
        
        g_EyeX += MOVE_STEP * tmpVec3[0];
        g_EyeY += MOVE_STEP * tmpVec3[1];
        g_EyeZ += MOVE_STEP * tmpVec3[2];

        lookAtX += MOVE_STEP * tmpVec3[0];
        lookAtY += MOVE_STEP * tmpVec3[1];
        lookAtZ += MOVE_STEP * tmpVec3[2];

    } 
    else 
    if (ev.keyCode == 75) { // K - move backward
        tmpVec3 = new Vector3();
        tmpVec3 = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, lookAtX, lookAtY, lookAtZ);
        
        g_EyeX -= MOVE_STEP * tmpVec3[0];
        g_EyeY -= MOVE_STEP * tmpVec3[1];
        g_EyeZ -= MOVE_STEP * tmpVec3[2];

        lookAtX -= MOVE_STEP * tmpVec3[0];
        lookAtY -= MOVE_STEP * tmpVec3[1];
        lookAtZ -= MOVE_STEP * tmpVec3[2];

    } 
    else
    if (ev.keyCode == 65){ // a - look left
      if(LAST_UPDATE==-1 || LAST_UPDATE==0)
        {
          a = lookAtX - g_EyeX;
          b = lookAtY - g_EyeY;
          c = lookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
          
          lzx = Math.sqrt(a*a+c*c);
          sin_phi = lzx / l;

          theta0 = Math.PI -  Math.asin(a/lzx);

          THETA_NOW = theta0 + LOOK_STEP;
          
          LAST_UPDATE = 1;
        }
        else
        {
          THETA_NOW += LOOK_STEP;
        }

        lookAtY = b + g_EyeY;
        lookAtX = l * sin_phi * Math.sin(THETA_NOW) + g_EyeX;
        lookAtZ = l * sin_phi * Math.cos(THETA_NOW) + g_EyeZ;
    }

    else
      if(ev.keyCode==68){//d - turn view right
        if (LAST_UPDATE==-1 || LAST_UPDATE==0)
        {
          a = lookAtX - g_EyeX;
          b = lookAtY - g_EyeY;
          c = lookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
          lzx = Math.sqrt(a*a+c*c);
          sin_phi = lzx / l;

          theta0 = Math.PI -  Math.asin(a/lzx);

          THETA_NOW = theta0 - LOOK_STEP;
          
          LAST_UPDATE = 1;
        }
        else
        {
          THETA_NOW -= LOOK_STEP;
        }

        lookAtY = b + g_EyeY;
        lookAtX = l * sin_phi * Math.sin(THETA_NOW) + g_EyeX;
        lookAtZ = l * sin_phi * Math.cos(THETA_NOW) + g_EyeZ;
      }
    else
      if(ev.keyCode==87){ //w - turn view up
        if (LAST_UPDATE==-1 || LAST_UPDATE==1)
        {  
          a = lookAtX - g_EyeX;
          b = lookAtY - g_EyeY;
          c = lookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
          cos_theta = c / Math.sqrt(a*a + c*c);
          sin_theta = a / Math.sqrt(a*a + c*c);

          phi0 = Math.asin(b/l);

          PHI_NOW = phi0 + LOOK_STEP;
          LAST_UPDATE = 0;
        }
        else
        {
          PHI_NOW += LOOK_STEP;
        }

        lookAtY = l * Math.sin(PHI_NOW) + g_EyeY;
        lookAtX = l * Math.cos(PHI_NOW) * sin_theta + g_EyeX;
        lookAtZ = l * Math.cos(PHI_NOW) * cos_theta + g_EyeZ;
      }
    else
      if(ev.keyCode==83){ //s - turn view down
        if(LAST_UPDATE==-1 || LAST_UPDATE==1)
        { 
          a = lookAtX - g_EyeX;
          b = lookAtY - g_EyeY;
          c = lookAtZ - g_EyeZ;
          l = Math.sqrt(a*a + b*b + c*c);
  
          cos_theta = c / Math.sqrt(a*a + c*c);
          sin_theta = a / Math.sqrt(a*a + c*c);

          phi0 = Math.asin(b/l);

          PHI_NOW = phi0 - LOOK_STEP;
          
          
          LAST_UPDATE = 0;
        }
        else
        {
          PHI_NOW -= LOOK_STEP;
        }

        lookAtY = l * Math.sin(PHI_NOW) + g_EyeY;
        lookAtX = l * Math.cos(PHI_NOW) * sin_theta + g_EyeX;
        lookAtZ = l * Math.cos(PHI_NOW) * cos_theta + g_EyeZ;
      }
    else { return; }
  }


var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
// if(angle >  0.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
// if(angle < -180.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

  
var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
return newAngle %= 360;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function newLightColor() {
  var c = document.getElementById("lightAdjustment"); // color input

  gl.uniform3f(u_Lamp0Amb, c.elements[0].value, c.elements[1].value, c.elements[2].value);    // ambient
  gl.uniform3f(u_Lamp0Diff, c.elements[3].value, c.elements[4].value, c.elements[5].value);   // diffuse
  gl.uniform3f(u_Lamp0Spec, c.elements[6].value, c.elements[7].value, c.elements[8].value);   // Specular

  console.log("New light color entered.");
}

function newLightPos(selectedIndex) {
  switch (selectedIndex) {
    case 0:
      Lamp0Position = [-15.0, -15.0, 10.0];
      break;
    case 1:
      Lamp0Position = [-15.0, 15.0, 10.0];
      break;
    case 2:
      Lamp0Position = [15.0, 15.0, 10.0];
      break;
    case 3:
      Lamp0Position = [15.0, -15.0, 10.0];
      break;
    default:
      break;
  }
}

function newLightingMethod(selectedIndex) {
  bling_phong_lighting = (selectedIndex == 1);
  updateLightingShading();
}

function newShadingMethod(selectedIndex) {
    phong_shading = (selectedIndex == 0);
    updateLightingShading();
}

function updateLightingShading() {
  gl.uniform1i(fs_bling_phong_lighting, bling_phong_lighting);
  gl.uniform1i(fs_phong_shading, phong_shading);
  gl.uniform1i(vs_bling_phong_lighting, bling_phong_lighting);
  gl.uniform1i(vs_phong_shading, phong_shading);
}


