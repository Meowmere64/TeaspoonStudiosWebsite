
let images = [
    "new.png",
]

let index = Math.floor(Math.random()*images.length);
let ee = Math.floor(Math.random()*100);

const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_uv;
out vec2 v_uv;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_uv;
}
`;
 
const fragmentShaderSource = `#version 300 es
precision highp float;

uniform sampler2D u_img;
uniform int u_time;

in vec2 v_uv;
out vec4 outColor;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

  float remap( float minval, float maxval, float curval )
{
    return ( curval - minval ) / ( maxval - minval );
} 
 
void main() {
  outColor = texture(u_img, v_uv);

  outColor.r += snoise(vec3(v_uv * vec2(100000.0,100000.0) + vec2(1000.0,0.0), u_time)) / 6.0;
  outColor.g += snoise(vec3(v_uv * vec2(100000.0,100000.0) + vec2(2000.0,0.0), u_time)) / 6.0;
  outColor.b += snoise(vec3(v_uv * vec2(100000.0,100000.0) + vec2(3000.0,0.0), u_time)) / 6.0;

  outColor *= snoise(vec3(v_uv * vec2(100000.0,100000.0) + vec2(7000.0,0.0), u_time)) + 0.8;
  outColor += (snoise(vec3(v_uv.y * 2.0,v_uv.y * 2.0, float(u_time) * 0.2)) * 2.0 - 1.0) * 0.01;

  float fade = float(clamp(u_time, 0, 600));
  fade /= 600.0;

  outColor *= fade;

  outColor.a = 1.0;
}
`;

const canvas = document.getElementById("mainCanvas");
let gl = canvas.getContext("webgl2");

const positions = [
    -1, -1,
    -1,  1,
     1, -1,
     1,  1
];

const uv = [
    0, 1,
    0, 0,
    1, 1,
    1, 0,
];

let img = new Image();
img.src = "Images/new.png";
img.onload = function(){
    beginRender();
}

function beginRender(){
    if(gl){
    // MAKE SHADERs
    let vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vertexShaderSource);
    gl.compileShader(vShader);
    let success = gl.getShaderParameter(vShader, gl.COMPILE_STATUS);
    if(!success){
        throw new Error("VSHADER FAILED TO COMPILE");
    }

    let pShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pShader, fragmentShaderSource);
    gl.compileShader(pShader);
    success = gl.getShaderParameter(pShader, gl.COMPILE_STATUS);
    if(!success){
        console.log(gl.getShaderInfoLog(pShader));
        throw new Error("FSHADER FAILED TO COMPILE");
    }
    // MAKE PROGRAM
    let program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, pShader);
    gl.linkProgram(program);

    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(!success){
        throw new Error("PROGRAM FAILED TO LINK");
    }

    let posAttrLocation = gl.getAttribLocation(program, "a_position");
    let uvAttrLocation = gl.getAttribLocation(program, "a_uv");
    let imgLocation = gl.getUniformLocation(program, "u_img");
    let timeLocation = gl.getUniformLocation(program, "u_time");

    
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttrLocation);
    gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);

    let uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttrLocation);
    gl.vertexAttribPointer(uvAttrLocation, 2, gl.FLOAT, false, 0, 0);

    let texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0, texture);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);


    gl.disable(gl.CULL_FACE);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform1i(imgLocation, 0);

    let time = 0;
    function renderFrame(){
        gl.uniform1i(timeLocation, time++);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
}
}

//document.getElementById("teaser").src = "Images/" + images[index];

if(ee == 69){
    document.getElementById("canvas").style.visibility = "hidden";
    document.getElementById("img").style.visibility = "visible";
}