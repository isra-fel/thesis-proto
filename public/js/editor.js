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
        this.selected = undefined;
        this.box = undefined;
        this.allObj = [];
        this.render();
        this.socket = io.connect('http://localhost');
        this.startListen();
        this.uuid = uuid.next();
        this.bindMouseEvents();
        this.bindMenuEvents();
        this.bindInputEvents();
    }

    getObjById(id) {
        return this.allObj.find(obj => obj.uuid === id);
    }

    addGrid() {
        let gridHelper = new THREE.GridHelper(this.gridSize, 1);
        this.scene.add(gridHelper);
    }

    bindMouseEvents() {
        this.canvas.addEventListener('mousedown', () => {
            let isClick = true;
            let onmove = ev => {
                isClick = false;
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
            let onmouseup = ev => {
                this.canvas.removeEventListener('mousemove', onmove);
                if (isClick) {
                    let intersect = this.getIntersect(ev);
                    this.selected = intersect ? intersect.object.CEModel : undefined;
                    this.updateBox();
                    this.updateOptions();
                }
                document.removeEventListener('mouseup', onmouseup);
            };
            this.canvas.addEventListener('mousemove', onmove);
            document.addEventListener('mouseup', onmouseup)
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

    bindMenuEvents() {
        document.getElementById('add-sphere').addEventListener('click', this.addSphere.bind(this));
        document.getElementById('add-cube').addEventListener('click', this.addCube.bind(this));
        $('#join').click(this.joinMeeting.bind(this));
    }

    bindInputEvents() {
        $('#object-position-x').change(ev => {
            if (this.selected) {
                this.selected.position.x = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'position.x', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-position-y').change(ev => {
            if (this.selected) {
                this.selected.position.y = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'position.y', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-position-z').change(ev => {
            if (this.selected) {
                this.selected.position.z = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'position.z', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-rotation-x').change(ev => {
            if (this.selected) {
                this.selected.rotation.x = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'rotation.x', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-rotation-y').change(ev => {
            if (this.selected) {
                this.selected.rotation.y = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'rotation.y', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-rotation-z').change(ev => {
            if (this.selected) {
                this.selected.rotation.z = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'rotation.z', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-scale-x').change(ev => {
            if (this.selected) {
                this.selected.scale.x = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'scale.x', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-scale-y').change(ev => {
            if (this.selected) {
                this.selected.scale.y = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'scale.y', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#object-scale-z').change(ev => {
            if (this.selected) {
                this.selected.scale.z = ev.target.value;
                this.selected.update();

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'scale.z', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#sphere-geometry-radius').change(ev => {
            if (this.selected) {
                let widthSegments = this.selected.geometry.widthSegments,
                    heightSegments = this.selected.geometry.heightSegments;
                let newGeometry = new SphereGeometry(ev.target.value, widthSegments, heightSegments),
                    newMaterial = MeshBasicMaterial.default();
                // let newSphere = new Mesh(newGeometry, newMaterial);
                // newSphere.position.x = this.selected.position.x;
                // newSphere.position.y = this.selected.position.y;
                // newSphere.position.z = this.selected.position.z;
                // newSphere.rotation.x = this.selected.rotation.x;
                // newSphere.rotation.y = this.selected.rotation.y;
                // newSphere.rotation.z = this.selected.rotation.z;
                // newSphere.scale.x = this.selected.scale.x;
                // newSphere.scale.y = this.selected.scale.y;
                // newSphere.scale.z = this.selected.scale.z;
                // this.scene.remove(this.selected.three);
                // this.selected = newSphere;
                // this.scene.add(this.selected.three);
                this.scene.remove(this.selected.three);
                this.selected.geometry = newGeometry;
                this.selected.update();
                this.scene.add(this.selected.three);

                let modify = new ModifyChange(this.uuid, this.selected.uuid, 'geometry.sphere.radius', ev.target.value);
                this.socket.emit('modify', modify);
            }
            this.updateBox();
            this.render();
        });
        $('#sphere-geometry-width-seg').change(ev => {
            if (this.selected) {
                let radius = this.selected.geometry.parameters.radius,
                    heightSegments = this.selected.geometry.parameters.heightSegments;
                let newSphere = new THREE.Mesh(new THREE.SphereGeometry(radius, ev.target.value, heightSegments),
                    this.selected.material
                );
                this.scene.remove(this.selected);
                this.selected = newSphere;
                this.scene.add(this.selected);
                this.updateBox();
                this.render();
            }
        });
        $('#sphere-geometry-height-seg').change(ev => {
            if (this.selected) {
                let radius = this.selected.geometry.parameters.radius,
                    widthSegments = this.selected.geometry.parameters.widthSegments;
                let newSphere = new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, ev.target.value),
                    this.selected.material
                );
                this.scene.remove(this.selected);
                this.selected = newSphere;
                this.scene.add(this.selected);
                this.updateBox();
                this.render();
            }
        });
    }

    render() {
        requestAnimationFrame(() => {
            this.renderer.render(this.scene, this.camera);
        });
    }

    addSphere() {
        let geometry = new SphereGeometry(1, 16, 12),
            material = MeshBasicMaterial.default(),
            sphere = new Mesh(geometry, material),
            addChange = new AddChange(sphere);
        this.allObj.push(sphere);
        this.scene.add(sphere.three);
        this.selected = sphere;
        this.updateBox();
        this.updateOptions();
        this.render();
        addChange.broadcast(this.socket);
    }

    addCube() {
        let geometry = new BoxGeometry(1, 1, 1),
            material = MeshBasicMaterial.default(),
            cube = new Mesh(geometry, material),
            addChange = new AddChange(cube);
        this.allObj.push(cube);
        this.scene.add(cube.three);
        this.selected = cube;
        this.updateBox();
        this.updateOptions();
        this.render();
        addChange.broadcast(this.socket);
    }

    addAxis() {
        let loader = new THREE.FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', font => {
            let options = {
                font,
                size: 0.6,
                height: 0.1
            };
            let south = new THREE.Mesh(new THREE.TextGeometry('S', options), new THREE.MeshBasicMaterial({
                    color: 0x666633
                })
            );
            south.position.set(-0.3, 0, this.gridSize);
            this.scene.add(south);
            let north = new THREE.Mesh(new THREE.TextGeometry('N', options), new THREE.MeshBasicMaterial({
                    color: 0x666633
                })
            );
            north.position.set(-0.3, 0, -this.gridSize);
            this.scene.add(north);
            let east = new THREE.Mesh(new THREE.TextGeometry('E', options), new THREE.MeshBasicMaterial({
                    color: 0x666633
                })
            );
            east.position.set(this.gridSize, 0, 0);
            this.scene.add(east);
            let west = new THREE.Mesh(new THREE.TextGeometry('W', options), new THREE.MeshBasicMaterial({
                    color: 0x666633
                })
            );
            west.position.set(-this.gridSize - 0.6, 0, 0);
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
            this.box = new THREE.BoundingBoxHelper(this.selected.three, 0xff0000);
            this.box.update();
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
        let obj = this.selected ? this.selected.three : undefined;
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
        let geo = obj.geometry;
        $('#geometry-type').val(geo.type);
        $('#sphere-geometry-radius').val(geo.parameters.radius);
        $('#sphere-geometry-width-seg').val(geo.parameters.widthSegments);
        $('#sphere-geometry-height-seg').val(geo.parameters.heightSegments);
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
        $('#geometry-type').val(undefined);
        $('#sphere-geometry-radius').val(undefined);
        $('#sphere-geometry-width-seg').val(undefined);
        $('#sphere-geometry-height-seg').val(undefined);
    }

    startListen() {
        this.socket.on('add', mesh => {
            console.log('new mesh: ' + JSON.stringify(mesh));
            if (this.allObj.find(obj => obj.uuid === mesh.uuid)) {
                return;
            }
            let geometry = mesh.geometry,
                material = mesh.material;
            switch (geometry.type) {
                case 'SphereGeometry':
                    Object.setPrototypeOf(geometry, SphereGeometry.prototype);
                    break;
                case 'BoxGeometry':
                    Object.setPrototypeOf(geometry, BoxGeometry.prototype);
                    break;
                default:
                    break;
            }
            switch (material.type) {
                case 'MeshBasicMaterial':
                    Object.setPrototypeOf(material, MeshBasicMaterial.prototype);
                    break;
                default:
                    break;
            }
            Object.setPrototypeOf(mesh, Mesh.prototype);
            this.allObj.push(mesh);
            this.scene.add(mesh.three);
            this.render();
        });

        this.socket.on('modify', modifyChange => {
            console.log('modify mesh: ' + JSON.stringify(modifyChange));
            if (modifyChange.sender !== this.uuid) {
                let obj = this.getObjById(modifyChange.uuid);
                if (obj) {
                    switch (modifyChange.propertyName) {
                        case 'position.x':
                            obj.position.x = modifyChange.newValue;
                            break;
                        case 'position.y':
                            obj.position.y = modifyChange.newValue;
                            break;
                        case 'position.z':
                            obj.position.z = modifyChange.newValue;
                            break;
                        case 'rotation.x':
                            obj.rotation.x = modifyChange.newValue;
                            break;
                        case 'rotation.y':
                            obj.rotation.y = modifyChange.newValue;
                            break;
                        case 'rotation.z':
                            obj.rotation.z = modifyChange.newValue;
                            break;
                        case 'scale.x':
                            obj.scale.x = modifyChange.newValue;
                            break;
                        case 'scale.y':
                            obj.scale.y = modifyChange.newValue;
                            break;
                        case 'scale.z':
                            obj.scale.z = modifyChange.newValue;
                            break;
                        case 'geometry.sphere.radius':
                            obj.geometry.radius = modifyChange.newValue;
                            obj.geometry.update();
                            break;
                        default:
                            break;
                    }
                    this.scene.remove(obj.three);
                    obj.update();
                    this.scene.add(obj.three);
                    this.updateBox();
                    this.render();
                }
            }
        });
    }

    joinMeeting() {
        function setVideo(video, stream) {
            video.setAttribute('width', 480);
            video.setAttribute('height', 480 * (4/3));
            video.srcObject = stream;
            video.play();
        }

        (function shimSourceObject() {
            if (typeof window === 'object') {
                if (window.HTMLMediaElement &&
                    !('srcObject' in window.HTMLMediaElement.prototype)) {
                    // Shim the srcObject property, once, when HTMLMediaElement is found.
                    Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                        get: function () {
                            return this._srcObject;
                        },
                        set: function (stream) {
                            var self = this;
                            // Use _srcObject as a private property for this shim
                            this._srcObject = stream;
                            if (this.src) {
                                URL.revokeObjectURL(this.src);
                            }

                            if (!stream) {
                                this.src = '';
                                return;
                            }
                            this.src = URL.createObjectURL(stream);
                            // We need to recreate the blob url when a track is added or
                            // removed. Doing it manually since we want to avoid a recursion.
                            stream.addEventListener('addtrack', function () {
                                if (self.src) {
                                    URL.revokeObjectURL(self.src);
                                }
                                self.src = URL.createObjectURL(stream);
                            });
                            stream.addEventListener('removetrack', function () {
                                if (self.src) {
                                    URL.revokeObjectURL(self.src);
                                }
                                self.src = URL.createObjectURL(stream);
                            });
                        }
                    });
                }
            }
        })();

        navigator.getMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        let onError = console.error.bind(console);
        let videoMe = document.getElementById('me'),
            videoYou = document.getElementById('you');

        navigator.getMedia({video: true, audio: true}, stream => {
            setVideo(videoMe, stream);
        }, onError);
        this.socket.emit('joinMeeting', this.uuid);
        this.socket.on('answer', uuids => {
            uuids.forEach(uuid => {
                if (uuid !== this.uuid) {
                    navigator.getMedia({video: true, audio: true}, stream => {
                        setVideo(videoYou, stream);
                    }, onError);
                }
            }, null);
        });


    //     let PeerConnection = window.RTCPeerConnection ||
    //             window.mozRTCPeerConnection ||
    //             window.webkitRTCPeerConnection ||
    //             window.msRTCPeerConnection,

    //         SessionDescription = window.RTCSessionDescription ||
    //             window.mozRTCSessionDescription ||
    //             window.webkitRTCSessionDescription ||
    //             window.msRTCPeerConnection;

    //     navigator.getMedia = navigator.getUserMedia ||
    //         navigator.webkitGetUserMedia ||
    //         navigator.mozGetUserMedia ||
    //         navigator.msGetUserMedia;
    //     let videoMe = document.getElementById('me'),
    //         videoYou = document.getElementById('you');
    //     let pc = new PeerConnection(null);
    //     pc.onaddstream = obj => {
    //         console.log('Setting video you!');
    //         setVideo(videoYou, obj.stream);
    //     };

    //     this.socket.emit('queryOffer');
    //     this.socket.on('answerOffer', offers => {
    //         console.log('offers: ' + JSON.stringify(offers));
    //         this.socket.off('answerOffer');
    //         if (!offers.length) {
    //             navigator.getMedia({video: true, audio: true}, stream => {
    //                 setVideo(videoMe, stream);
    //                 pc.addStream(stream);
    //                 pc.createOffer(offer => {
    //                     pc.setLocalDescription(new SessionDescription(offer), () => {
    //                         this.socket.emit('joinMeeting', offer);
    //                         this.socket.on('anotherMember', answer => {
    //                             this.socket.off('anotherMember');
    //                             pc.setRemoteDescription(new RTCSessionDescription(answer), () => {}, onError);
    //                         });
    //                     }, onError);
    //                 }, onError);
    //             }, onError);
    //         } else {
    //             let offer = offers[0];
    //             navigator.getMedia({video: true, audio: true}, stream => {
    //                 setVideo(videoMe, stream);
    //                 pc.addStream(stream);
    //                 pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
    //                     pc.createAnswer(answer => {
    //                         pc.setLocalDescription(new RTCSessionDescription(answer), () => {
    //                             this.socket.emit('answer', answer);
    //                         }, onError);
    //                     }, onError);
    //                 }, onError);
    //             }, onError);
    //         }
    //     });
    }
}

class Change {
    constructor(sender, changeType) {
        this.sender = sender;
        this.changeType = changeType;
    }
}

class ModifyChange extends Change {
    constructor(sender, uuid, propertyName, newValue) {
        super(sender, 'modify');
        this.uuid = uuid;
        this.propertyName = propertyName;
        this.newValue = newValue;
    }
}

class AddChange extends Change {
    constructor(mesh) {
        super('add');
        this.mesh = mesh;
    }
    broadcast(socket) {
        socket.emit('add', this.mesh);
    }
}

class RemoveChange extends Change {
    constructor(uuid) {
        super('remove');
        this.uuid = uuid;
    }
}

class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.uuid = uuid.next();
        this.position = {x:0, y:0, z:0};
        this.rotation = {x:0, y:0, z:0};
        this.scale = {x:1, y:1, z:1};
    }
    get three() {
        if (!this._three) {
            Object.defineProperty(this, '_three', {
                value: new THREE.Mesh(this.geometry.three, this.material.three),
                enumerable: false,
                writable: true
            });
            this._three.CEModel = this;
        }
        return this._three;
    }
    update() {
        this._three = new THREE.Mesh(this.geometry.three, this.material.three);
        this._three.CEModel = this;
        this._three.position.set(this.position.x, this.position.y, this.position.z);
        this._three.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        this._three.scale.set(this.scale.x, this.scale.y, this.scale.z);
    }
}

class Geometry {
    constructor(type) {
        this.type = type;
    }
}

class SphereGeometry extends Geometry {
    constructor(radius, widthSegments, heightSegments) {
        super('SphereGeometry');
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
    }
    get three() {
        if (!this._three) {
            Object.defineProperty(this, '_three', {
                value: new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments),
                enumerable: false,
                writable: true
            });
        }
        return this._three;
    }
    update() {
        this._three = new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments);
    }
}

class BoxGeometry extends Geometry {
    constructor(width, height, depth) {
        super('BoxGeometry');
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
    get three() {
        if (!this._three) {
            Object.defineProperty(this, '_three', {
                value: new THREE.BoxGeometry(this.width, this.height, this.depth),
                enumerable: false
            });
        }
        return this._three;
    }
}

class Material {
    constructor(type) {
        this.type = type;
    }
}

class MeshBasicMaterial extends Material {
    constructor(color) {
        super('MeshBasicMaterial');
        this.color = color;
    }
    get three() {
        if (!this._three) {
            Object.defineProperty(this, '_three', {
                value: new THREE.MeshBasicMaterial({color: this.color}),
                enumerable: false
            });
        }
        return this._three;
    }
    static default() {
        return new MeshBasicMaterial(0x111111);
    }
}

class uuid {
    static next() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random()*16|0,
                v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

(() => {
    let editor = new Editor(document.getElementById('canvas'));
})();