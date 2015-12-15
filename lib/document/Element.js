/*
	The Cedric's Swiss Knife (CSK) - CSK terminal toolbox
	
	Copyright (c) 2009 - 2015 Cédric Ronvel 
	
	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/



// Load modules
var events = require( 'events' ) ;



function Element() { throw new Error( 'Use Element.create() instead' ) ; }
module.exports = Element ;
Element.prototype = Object.create( events.prototype ) ;
Element.prototype.constructor = Element ;
Element.prototype.elementType = 'Element' ;



Element.create = function createElement( options )
{
	var element = Object.create( Element.prototype ) ;
	element.create( options ) ;
	return element ;
} ;



// Useful to split that for inheritance
Element.prototype.create = function createElement( options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	Object.defineProperties( this , {
		parent: { value: options.parent && options.parent.elementType ? options.parent : null } ,
		document: { value: null , enumerable: true , writable: true } ,
		outputDst: { value: options.outputDst || options.parent.inputDst } ,
		inputDst: { value: null , enumerable: true , writable: true } ,
		label: { value: options.label || '' , enumerable: true , writable: true } ,
		content: { value: options.content || '' , enumerable: true , writable: true } ,
		key: { value: options.key || null , enumerable: true , writable: true } ,
		value: { value: options.value || null , enumerable: true , writable: true } ,
		
		outputX: { value: options.outputX || options.x || 1 , enumerable: true , writable: true } ,
		outputY: { value: options.outputY || options.y || 1 , enumerable: true , writable: true } ,
		ouputWidth: { value: options.ouputWidth || options.width || 1 , enumerable: true , writable: true } ,
		outputHeight: { value:options.outputHeight || options.height || 1 , enumerable: true , writable: true } ,
		
		inputX: { value: null , enumerable: true , writable: true } ,
		inputY: { value: null , enumerable: true , writable: true } ,
		inputWidth: { value: null , enumerable: true , writable: true } ,
		inputHeight: { value: null , enumerable: true , writable: true } ,
		
		hasFocus: { value: false , enumerable: true , writable: true } ,
		children: { value: [] , enumerable: true , writable: true } ,
		//onKey: { value: this.onKey.bind( this ) , writable: true } ,
	} ) ;
	
	this.inputDst = options.inputDst || this.outputDst ;
	
	// By default, coordinate exposed to the children are the same
	this.inputX = this.outputX ;
	this.inputY = this.outputY ;
	this.inputWidth = this.ouputWidth ;
	this.inputHeight = this.outputHeight ;
	
	if ( this.parent )
	{
		this.document = this.parent.document ;
		this.document.assignId( this , options.id ) ;
		this.parent.attach( this ) ;
	}
} ;



Element.prototype.attach = function attach( element )
{
	// Insert it if it is not already a child
	if ( this.children.indexOf( element ) === -1 )
	{
		element.parent = this ;
		element.document = this.document ;
		this.children.push( element ) ;
	}
	return this ;
} ;



Element.prototype.attachTo = function attachTo( element )
{
	if ( element.elementType ) { element.attach( this ) ; }
	return element ;
} ;



Element.prototype.isAncestorOf = function isAncestorOf( element )
{
	var currentElement = element ;
	
	while ( true )
	{
		if ( currentElement === this )
		{
			// Self found: ancestor match!
			return true ;
		}
		else if ( ! currentElement.parent )
		{
			// The element is either detached or attached to another parent element
			return false ;
		}
		else if ( currentElement.parent.children.indexOf( currentElement ) === -1 )
		{
			// Detached but still retain a ref to its parent.
			// It's probably a bug, so we will remove that link now.
			currentElement.parent = null ;
			return false ;
		}
		
		currentElement = currentElement.parent ;
	}
} ;



Element.prototype.draw = function draw()
{
	var currentElement ;
	
	if ( this.drawSelf ) { this.drawSelf() ; }
	
	currentElement = this ;
	
	while ( currentElement.outputDst !== currentElement.document.outputDst && currentElement.parent )
	{
		currentElement = currentElement.parent ;
		if ( currentElement.outputDst !== currentElement.inputDst && currentElement.drawSelf ) { currentElement.drawSelf() ; }
	}
	
	this.drawCursor() ;
	
	return this ;
} ;



Element.prototype.drawCursor = function drawCursor()
{
	var currentElement ;
	
	if ( this.drawSelfCursor ) { this.drawSelfCursor() ; }
	
	currentElement = this ;
	
	while ( currentElement.outputDst !== currentElement.document.outputDst && currentElement.parent )
	{
		currentElement = currentElement.parent ;
		if ( currentElement.drawSelfCursor ) { currentElement.drawSelfCursor() ; }
	}
	
	return this ;
} ;



// Should be redefined
Element.prototype.computeBoundingBoxes = null ;	// should be a function if this element can be drawn
Element.prototype.drawSelf = null ;	// should be a function if this element can be drawn
Element.prototype.drawSelfCursor = null ;	// should be a function if this element's cursor can be drawn
Element.prototype.getValue = function getValue() { return null ; } ;
Element.prototype.setValue = function setValue() {} ;

