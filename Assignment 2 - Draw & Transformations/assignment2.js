import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        // TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex

        // Draw each cube’s outline (the edges) in white
        this.arrays.position.push(...Vector3.cast(
            [1,1,-1], [1,-1,-1], [-1,1,1], [-1,-1,1], [1,1,-1],  [-1,1,-1],  [1,1,1],  [-1,1,1],
            [-1,-1,-1], [-1,-1,1], [-1,1,-1], [-1,1,1], [1,-1,1],  [1,-1,-1],  [1,1,1],  [1,1,-1],
            [1,-1,1],  [-1,-1,1],  [1,-1,1],  [1,1,1], [1,-1,-1], [-1,-1,-1], [-1,-1,-1], [-1,1,-1]));

        const white = color(1, 1, 1, 1);
        for (let i = 0; i < 24; i++) {
            this.arrays.color.push(white);
        }

        this.indexed = false;
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)

        this.arrays.position.push(...Vector3.cast(
            [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,1], 
            [-1,1,-1], [1,1,-1], [-1,1,1], [1,1,1]));
            
        this.arrays.normal.push(...Vector3.cast(
            [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,1], 
            [-1,1,-1], [1,1,-1], [-1,1,1], [1,1,1]));

        this.indices.push(0, 1, 2, 3, 7, 2, 5, 0, 4, 2, 6, 7, 4, 5);
    }
}


class Base_Scene extends Scene {
     // Base_scene is a Scene that can be added to any display canvas.
     // Setup the shapes, materials, camera, and lighting here.

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'strip': new Cube_Single_Strip()
        };

        // Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };

        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());

        // Colors 
        this.colorArray = [];
        this.set_colors();          // fills the array with 8 random colors

        // Flags
        this.isOutlined = false;    
        this.isSwaying = true;
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(5, -10, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // Lights: Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Assignment2 extends Base_Scene {  
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.

        // Fill array with 8 random colors, for 8 boxes
        for (var i = 0; i < 8; i++) {
            this.colorArray[i] = color(Math.random(), Math.random(), Math.random(), 1.0);
        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.

        // If 'c' key is pressed --> set_colors() is called which generates a new set of random colors for the boxes
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        
        // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
        this.key_triggered_button("Outline", ["o"], () => {
            this.isOutlined = !this.isOutlined;
        });

        // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
        this.key_triggered_button("Sit still", ["m"], () => {
            this.isSwaying = !this.isSwaying;
        });
    }

    draw_box(context, program_state, model_transform, boxNum) {
        // TODO:  Helper function for requirement 3 (see hint).
        //        This should make changes to the model_transform matrix, draw the next box, and return the newest model_transform.

        // Color of box, taken from an array of random colors 
        const boxColor = this.colorArray[boxNum];
        
        // Make the stack of boxes sway like a blade of grass in the wind

        // Time passed in seconds
        const t = this.t = program_state.animation_time / 1000;
        
        // Maximum angle of 0.5*Math.PI
        const maxAngle = .05 * Math.PI; 

        // If swaying is turned off, stack of boxes must be extended to maximum possible angle
        if (!this.isSwaying) {
            var rotAngle = maxAngle;
        }    
        // If swaying is on, calculate rotation angle as a function of time
        // Sways one direction per second --> sways back and forth per two seconds 
        else {
            var rotAngle = ((maxAngle/2)+(maxAngle/2)*(Math.sin(Math.PI*(t)))); // f(t) = a + b*sin(w*t)         
        }                  

        // First box does not sway
        if (boxNum == 0) {
            model_transform = model_transform.times(Mat4.scale(1, 1.5, 1))  
        }
        else {
            model_transform = model_transform.times(Mat4.translation(-1, 1.5, 0))          // place hinge at top left edge of the box underneath
                                             .times(Mat4.rotation(rotAngle, 0, 0, 1))      // rotate box over time
                                             .times(Mat4.scale(1, 1.5, 1))                 // scale box by 1.5x its length along the Y axis
                                             .times(Mat4.translation(1, 1, 0))             // stack box on top of previous box, connected by hinge
        }

        // If outline is on, draw white outline on box only
        if (this.isOutlined) {
            this.draw_outline(context, program_state, model_transform);    
        }
        // If outline is off, draw box normally (color, lighting, etc.)
        else {
            // Draw box 1,3,5,7 as a single triangle strip primitive 
            if (this.isOdd(boxNum+1) == true) {
                this.draw_triangle_strip(context,program_state, model_transform, boxColor);
            }   
            else {
                this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color:boxColor}));
            }
        }

        // Reverse scale (1.5 = 3/2 --> 2/3), as to not scale exponentially 
        model_transform = model_transform.times(Mat4.scale(1, (2/3), 1))
        return model_transform;
    }

    draw_outline(context,program_state, model_transform) {
        this.shapes.outline.draw(context, program_state, model_transform, this.white, "LINES");
        return model_transform;
    }

    draw_triangle_strip(context, program_state, model_transform, boxColor) {
        this.shapes.strip.draw(context, program_state, model_transform, this.materials.plastic.override({color:boxColor}), "TRIANGLE_STRIP");
        return model_transform;
    }

    isOdd(number){
        return (number%2) == 1;
    }

    display(context, program_state) {
        super.display(context, program_state);
        const blue = hex_color("#1a9ffa");
        let model_transform = Mat4.identity();

        // TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper.

        // Display a stack of 8 unit cubes starting from the origin and extending upward
           for (let i = 0; i < 8; i++) {
                model_transform = this.draw_box(context, program_state, model_transform, i);
            }
    }
}