// 9.463861465454102

import React, { Component } from 'react';


export default class VirtualComponent{
    constructor(tree,componentSet){
        this.componentSet = componentSet;
        this.tree = tree;
        this.rootElement = document.createElement('div');
        this.createElement = this.createElement.bind(this);
        this.appendElement = this.appendElement.bind(this);
        this.parseMaskedGroup = this.parseMaskedGroup.bind(this);
        this.appendChildren = this.appendChildren.bind(this);
        this.parse();
        document.body.style.backgroundColor = '#ccc'
        document.body.appendChild(this.rootElement);
    }

    appendElement(e){
        this.rootElement.appendChild(e);
    }

    findClipPath(id){
        return this.componentSet.clipPaths[id];
    }

    findGradient(id){
        return this.componentSet.gradients[id];
    }

    createElement(d){
        let style = [];
        const el = document.createElement('div') ;

        d.group && d.group.children.map(e=>el.appendChild(e));
        el.setAttribute('data-layer-title',d.name);

        if (d.type === 'shape'){

            style = this.parseStyle(d.style).concat(this.parseShape(d));
        }

        if (d.type === 'text'){
            el.innerHTML = d.text.rawText;
            style = style.concat(this.parseTextStyle(d));
        }

        if (d.type === 'group' && d.style && d.style.clipPath){
            
            style = style.concat(this.parseMaskedGroup(d,el));
        }

        el.setAttribute('style',style.join(';'))
        
        return el;
    }

    parseTextStyle(shape){
        let styles = [];
        styles.push(`color:rgb(${shape.style.fill.color.value.r},${shape.style.fill.color.value.g},${shape.style.fill.color.value.b});`);
        styles.push(`position:absolute;`);
        styles.push(`font-size:${shape.style.font.size}px;`);
        styles.push(`left:${shape.transform.tx}px`);
        styles.push(`top:${shape.transform.ty}px`);
        return styles
    }

    parseShape(shape){
        const styles = [];

        if (shape.shape.type === 'circle'){
            styles.push(`width:${shape.shape.cx*2}px;`);
            styles.push(`height:${shape.shape.cy*2}px;`);
            styles.push(`border-radius:100% 100% 100% 100%;`);

        }

        if (shape.shape.type === 'rect'){
            styles.push(`width:${shape.shape.width}px;`);
            styles.push(`height:${shape.shape.height}px;`);
            if (shape.shape.r)
                styles.push(`border-radius:${shape.shape.r[0] || 0}px ${shape.shape.r[1] || 0}px ${shape.shape.r[2] || 0}px ${shape.shape.r[3] || 0}px;`);
        }

        if (shape.shape.type === 'path'){
            // console.log(shape,shape.name);
            const coords = shape.shape.path.split(' ');
            styles.push(`width:${coords[7]}px;`);
            styles.push(`height:${coords[8]}px;`);
            // styles.push(`border-radius:${shape.shape.r[0] || 0}px ${shape.shape.r[1] || 0}px ${shape.shape.r[2] || 0}px ${shape.shape.r[3] || 0}px;`);
        }

        styles.push(`position:absolute;`);
        styles.push(`left:${shape.transform.tx}px`);
        styles.push(`top:${shape.transform.ty}px`);

        return styles

    }

    parseColor(color){
        let parsedColor = '';
        switch (color.mode){
            case 'RGB':
                parsedColor = `rgb(${color.value.r},${color.value.g},${color.value.b})`
                break
        }

        return parsedColor;
    }

    parseFIll(style){
        let styleString = '';
        switch(style.type){
            case 'none': 
                styleString = `background-color:transparent`;
            break;

            case 'pattern': 
                const ext = style.pattern.href.match(/\.[0-9a-z]+$/i)[0];

                styleString = `background-image:url(/card/resources/${style.pattern.meta.ux.uid}${ext});background-size: cover;`;
            break;

            case 'gradient': 

                const gradient = this.findGradient(style.gradient.ref);
                // console.log(gradient);
                // console.log(style);
                const angle = Math.atan2((style.gradient.x1 - style.gradient.x2),(style.gradient.y1 - style.gradient.y2)) * 180 / Math.PI
                // console.log(angle);
                styleString = `background-image:linear-gradient(${angle}deg, ${gradient.stops.map((colorStop)=>{
                    return `${this.parseColor(colorStop.color)} ${colorStop.offset*100}%`
                })})`;
                // styleString = `background-color:red`;
            break;

            default:
                styleString = `background-color:rgb(${style.color.value.r},${style.color.value.g},${style.color.value.b})`;
        }
    
        return styleString;
    }

    parseStyle(styleSet){
        return Object.keys(styleSet)
        .map((s)=>{
            const style = styleSet[s];
            let styleString = '';
            switch(s){
                case 'fill':
                    styleString = this.parseFIll(style)
                break

                case 'filters':

                    styleString = `filter:${style.map((z)=>{

                        if (z.type = 'dropShadow' && z.params.dropShadows){
                            return `drop-shadow(${z.params.dropShadows[0].dx}px ${z.params.dropShadows[0].dy}px ${z.params.dropShadows[0].r}px rgba(${z.params.dropShadows[0].color.value.r},${z.params.dropShadows[0].color.value.g},${z.params.dropShadows[0].color.value.b},${z.params.dropShadows[0].color.alpha}) )`
                        }
                        return 
                    })}`;

                    break

                case 'stroke':

                    styleString = `border: ${style.width}px solid rgb(${style.color.value.r},${style.color.value.g},${style.color.value.b})`;

                    break   
            }
            return styleString;
        })

    }

    parseMaskedGroup(el,DOMel){
        const clipPath = this.findClipPath(el.style.clipPath.ref).children[0];
        let styles = [];
        styles = styles.concat(this.parseShape(clipPath))
        styles.push(`left:${clipPath.transform.tx+el.transform.tx}px`);
        styles.push(`overflow:hidden`);
        styles.push(`top:${clipPath.transform.ty+el.transform.ty}px`);
    
        el.group.children
        .map(this.createElement)
        .map(el => DOMel.appendChild(el))

        return styles;
    }


    appendChildren(el){
        if (el.group){
            el.group.children = el.group.children
            .map(this.appendChildren)
            .map(this.createElement)
        }
        return el

    }

    parse(){
        this.tree.group.children
        .map(this.appendChildren)
        .map(this.createElement)
        .map(this.appendElement);
    }
}