import axios from 'axios';
import VirtualComponent from './VirtualComponent';

export default class ComponentSet{
    constructor(componentPath){
        this.componentPath = componentPath;
        this.createComponent = this.createComponent.bind(this)
        this.load().then(this.parse.bind(this));
        
    }

    load(path){
        return axios.get(`${this.componentPath}/resources/graphics/graphicContent.agc`).then(d=>d.data);
    }

    parse(data){
        console.log(data)
        // console.log(data.resources.meta.ux.symbols);
        this.clipPaths = data.resources.clipPaths
        this.gradients = data.resources.gradients
        this.components = data.resources.meta.ux.symbols
        .filter(c=>c.type === 'group')
        .map(this.createComponent);
    }

    createComponent(d){
        return new VirtualComponent(d,this);
    }
}