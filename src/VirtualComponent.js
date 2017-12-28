9.463861465454102

import React, { Component } from 'react';


export default class VirtualComponent{
    constructor(tree){
        this.tree = tree;
        this.rootElement = document.createElement('div');
        this.createElement = this.createElement.bind(this);
        this.appendElement = this.appendElement.bind(this);
        this.appendChildren = this.appendChildren.bind(this);
        this.parse();
        document.body.style.backgroundColor = '#ccc'
        document.body.appendChild(this.rootElement);
    }

    appendElement(e){
        this.rootElement.appendChild(e);
    }

    createElement(d){
        let style = [];
        const el = document.createElement('div') ;

        if (d.type === 'shape'){

            style = this.parseStyle(d.style).concat(this.parseShape(d));
        }

        if (d.type === 'text'){

            // style = this.parseStyle(d.style).concat(this.parseShape(d));
            // console.log('teste');
            // console.log(d);
            el.innerHTML = d.text.rawText;
            console.log(d);
            style = style.concat(this.parseTextStyle(d.style));
        }

        el.setAttribute('style',style.join(';'))
        
        return el;
    }

    parseTextStyle(style){
        // console.log('style',style);
        // style+=;
        return [`color:rgb(${style.fill.color.value.r},${style.fill.color.value.g},${style.fill.color.value.b});`]
        // console.log('style',style);
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
            styles.push(`border-radius:${shape.shape.r[0] || 0}px ${shape.shape.r[1] || 0}px ${shape.shape.r[2] || 0}px ${shape.shape.r[3] || 0}px;`);
        }

        styles.push(`position:absolute;`);
        styles.push(`left:${shape.transform.tx}px`);
        styles.push(`top:${shape.transform.ty}px`);

        console.log(shape.shape.type);
        return styles

    }

    parseStyle(styleSet){
        return Object.keys(styleSet)
        .map((s)=>{
            const style = styleSet[s];
            let styleString = '';
            switch(s){
                case 'fill':

                if (style.type === 'none'){
                    styleString = `background-color:transparent`;
                }else{
                    styleString = `background-color:rgb(${style.color.value.r},${style.color.value.g},${style.color.value.b})`;
                }
                    

                    break

                case 'filters':

                    styleString = `filter:${style.map((z)=>{

                        if (z.type = 'dropShadow'){
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

    appendChildren(el){
        // console.log(el);
        if (el.group){
            console.log(el.group.children)
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