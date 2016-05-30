class Editor {
    constructor(canvas) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setClearColor(0xcccccc);
        this.addGrid();
        this.bindMouseEvents();
        this.render();
    }
    
    addGrid() {
        let gridHelper = new THREE.GridHelper(10, 1);
        this.scene.add(gridHelper);
    }
    
    bindMouseEvents() {
        this.canvas.addEventListener('mousedown', () => {
            let onmove = ev => {
                let dx = ev.movementX,
                    dy = ev.movementY,
                    dalpha = dy / 1000, //纵向
                    dbeta = dx / 500, //横向
                    camera = this.camera.position,
                    axis = new THREE.Vector3(camera.x, 0, camera.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
                camera.applyAxisAngle(axis, -dalpha);
                camera.applyAxisAngle(new THREE.Vector3(0, 1, 0), -dbeta);
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                this.render();
            };
            this.canvas.addEventListener('mousemove', onmove);
            this.canvas.addEventListener('mouseup', () => {
                this.canvas.removeEventListener('mousemove', onmove);
            });
        });
        
        this.canvas.addEventListener('mousewheel', ev => {
            let dy = ev.deltaY / 100,
                camera = this.camera.position;
            if (camera.length() + dy > 0) {
                camera.setLength(camera.length() + dy);
            }
            this.render();
        });
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

(() => {
    let editor = new Editor(document.getElementById('canvas'));
})();