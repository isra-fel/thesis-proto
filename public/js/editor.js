class Editor {
    constructor(canvas) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000 );
        this.camera.position.set(4, 20, 20);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.canvas = canvas;
        this.canvas.height = 450;
        this.canvas.width = 800;
        this.renderer = new THREE.WebGLRenderer({canvas});
        this.renderer.setClearColor(0xcccccc);
        this.gridSize = 10;
        this.addGrid();
        this.addAxis();
        this.bindMouseEvents();
        this.bindMenuEvents();
        this.bindInputEvents();
        this.selected = undefined;
        this.box = undefined;
        this.render();
    }
    
    addGrid() {
        let gridHelper = new THREE.GridHelper(this.gridSize, 1);
        this.scene.add(gridHelper);
    }
    
    bindMouseEvents() {
        this.canvas.addEventListener('mousedown', () => {
            let onmove = ev => {
                let dx = ev.movementX,
                    dy = ev.movementY,
                    dalpha = dy / 5000, //纵向
                    dbeta = dx / 500, //横向
                    camera = this.camera.position,
                    axis = new THREE.Vector3(camera.x, 0, camera.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
                camera.applyAxisAngle(axis, -dalpha);
                camera.applyAxisAngle(new THREE.Vector3(0, 1, 0), -dbeta);
                this.camera.lookAt(new THREE.Vector3(0, 0, 0));
                this.render();
            };
            this.canvas.addEventListener('mousemove', onmove);
            document.addEventListener('mouseup', () => {
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
        
        this.canvas.addEventListener('click', ev => {
            let intersect = this.getIntersect(ev);
            this.selected = intersect ? intersect.object : undefined;
            this.updateBox();
            this.updateOptions();
        });
    }
    
    bindMenuEvents() {
        document.getElementById('add-sphere').addEventListener('click', this.addSphere.bind(this));
    }
    
    bindInputEvents() {
        $('#object-position-x').change(ev => {
            if (this.selected) {
                this.selected.position.x = ev.target.value;
            }
            this.render();
        });
        $('#object-position-y').change(ev => {
            if (this.selected) {
                this.selected.position.y = ev.target.value;
            }
            this.render();
        });
        $('#object-position-z').change(ev => {
            if (this.selected) {
                this.selected.position.z = ev.target.value;
            }
            this.render();
        });
        $('#object-rotation-x').change(ev => {
            if (this.selected) {
                this.selected.rotation.x = ev.target.value;
            }
            this.render();
        });
        $('#object-rotation-y').change(ev => {
            if (this.selected) {
                this.selected.rotation.y = ev.target.value;
            }
            this.render();
        });
        $('#object-rotation-z').change(ev => {
            if (this.selected) {
                this.selected.rotation.z = ev.target.value;
            }
            this.render();
        });
        $('#object-scale-x').change(ev => {
            if (this.selected) {
                this.selected.scale.x = ev.target.value;
            }
            this.render();
        });
        $('#object-scale-y').change(ev => {
            if (this.selected) {
                this.selected.scale.y = ev.target.value;
            }
            this.render();
        });
        $('#object-scale-z').change(ev => {
            if (this.selected) {
                this.selected.scale.z = ev.target.value;
            }
            this.render();
        });
    }
    
    render() {
        if (this.box) {
            this.box.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
    
    addSphere() {
        let sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12),
            new THREE.MeshBasicMaterial({
                color: 0xfffc00
            })
        );
        this.scene.add(sphere);
        this.render();
    }
    
    addAxis() {
        let loader = new THREE.FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', font => {
            let options = {
                font,
                size: 1,
                height: 0.1
            };
            let south = new THREE.Mesh(new THREE.TextGeometry('S', options), new THREE.MeshBasicMaterial({
                    color: 0x000000
                })
            );
            south.position.set(-0.5, 0, this.gridSize);
            this.scene.add(south);
            let north = new THREE.Mesh(new THREE.TextGeometry('N', options), new THREE.MeshBasicMaterial({
                    color: 0x000000
                })
            );
            north.position.set(-0.5, 0, -this.gridSize);
            this.scene.add(north);
            let east = new THREE.Mesh(new THREE.TextGeometry('E', options), new THREE.MeshBasicMaterial({
                    color: 0x000000
                })
            );
            east.position.set(this.gridSize, 0, 0);
            this.scene.add(east);
            let west = new THREE.Mesh(new THREE.TextGeometry('W', options), new THREE.MeshBasicMaterial({
                    color: 0x000000
                })
            );
            west.position.set(-this.gridSize - 1, 0, 0);
            this.scene.add(west);
            this.render();
        });        
    }
    
    getIntersect(ev) {
        let x = (ev.clientX - canvas.offsetLeft) / canvas.width * 2 - 1,
            y = - (ev.clientY - canvas.offsetTop) / canvas.height * 2 + 1,
            raycaster = new THREE.Raycaster(),
            vector = new THREE.Vector3(x, y, 1).unproject(this.camera);
        raycaster.setFromCamera({x, y}, this.camera);
        let intersects = raycaster.intersectObjects(this.scene.children);
        return intersects.find(intersect => !(intersect.object instanceof THREE.GridHelper ||
            intersect.object instanceof THREE.BoundingBoxHelper));
    }
    
    updateBox() {
        this.resetBox();
        if (this.selected) {
            this.box = new THREE.BoundingBoxHelper(this.selected, 0xff0000);
            this.scene.add(this.box);
            this.render();
        }
    }
    
    resetBox() {
        if (this.box) {
            this.scene.remove(this.box);
            this.render();
            this.box = undefined;
        }
    }
    
    updateOptions() {
        let obj = this.selected;
        if (!obj) {
            return this.resetOptions();
        }
        $('#object-type').val(obj.type);
        $('#object-uuid').val(obj.uuid);
        $('#object-name').val(obj.name);
        $('#object-position-x').val(obj.position.x);
        $('#object-position-y').val(obj.position.y);
        $('#object-position-z').val(obj.position.z);
        $('#object-rotation-x').val(obj.rotation.x);
        $('#object-rotation-y').val(obj.rotation.y);
        $('#object-rotation-z').val(obj.rotation.z);
        $('#object-scale-x').val(obj.scale.x);
        $('#object-scale-y').val(obj.scale.y);
        $('#object-scale-z').val(obj.scale.z);
    }
    
    resetOptions() {
        $('#object-type').val(undefined);
        $('#object-uuid').val(undefined);
        $('#object-name').val(undefined);
        $('#object-position-x').val(undefined);
        $('#object-position-y').val(undefined);
        $('#object-position-z').val(undefined);
        $('#object-rotation-x').val(undefined);
        $('#object-rotation-y').val(undefined);
        $('#object-rotation-z').val(undefined);
        $('#object-scale-x').val(undefined);
        $('#object-scale-y').val(undefined);
        $('#object-scale-z').val(undefined);
    }
}

(() => {
    let editor = new Editor(document.getElementById('canvas'));
})();